import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useConversations } from '../../hooks/useConversations';

const WS_URL = `${import.meta.env.VITE_API_URL
  .replace(/^http/, 'ws')
  .replace(/\/api$/, '')}/ws/chat`;

export default function ContractChatPage() {
  const { contractId } = useParams();

  const {
    conversation,
    messages,
    isLoading,
    error,
    setMessages,
    createConversation,
    fetchMessages,
    markAsRead,
  } = useConversations();

  const [content, setContent] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const currentUsername =
    localStorage.getItem('username') || localStorage.getItem('userName') || '';

  const currentRole =
    localStorage.getItem('role') ||
    localStorage.getItem('userRole') ||
    '';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.items]);

  const normalizeRole = (role) => {
    if (!role) return '';
    const value = role.toLowerCase();
    if (value.includes('freelancer')) return 'Freelancer';
    if (value.includes('client')) return 'Client';
    if (value.includes('admin')) return 'Admin';
    return role;
  };

  const isMyMessage = (message) => {
    return (
      message.senderUsername &&
      currentUsername &&
      message.senderUsername.toLowerCase() === currentUsername.toLowerCase()
    );
  };

  const getRoleFromMessage = (message) => {
    if (message.senderRole) return normalizeRole(message.senderRole);

    const mine = isMyMessage(message);
    const normalizedCurrentRole = normalizeRole(currentRole);

    if (mine && normalizedCurrentRole) return normalizedCurrentRole;
    if (!mine && normalizedCurrentRole === 'Client') return 'Freelancer';
    if (!mine && normalizedCurrentRole === 'Freelancer') return 'Client';

    return 'User';
  };

  const getBubbleClasses = (mine, role) => {
    if (mine && role === 'Client') {
      return 'bg-blue-500 text-white rounded-br-md';
    }

    if (mine && role === 'Freelancer') {
      return 'bg-emerald-500 text-white rounded-br-md';
    }

    if (!mine && role === 'Client') {
      return 'bg-blue-50 border border-blue-100 text-slate-800 rounded-bl-md';
    }

    if (!mine && role === 'Freelancer') {
      return 'bg-emerald-50 border border-emerald-100 text-slate-800 rounded-bl-md';
    }

    return mine
      ? 'bg-slate-800 text-white rounded-br-md'
      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md';
  };

  const getBadgeClasses = (mine, role) => {
    if (mine && role === 'Client') return 'bg-blue-400/20 text-blue-50';
    if (mine && role === 'Freelancer') return 'bg-emerald-400/20 text-emerald-50';
    if (!mine && role === 'Client') return 'bg-blue-100 text-blue-700';
    if (!mine && role === 'Freelancer') return 'bg-emerald-100 text-emerald-700';
    return mine ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600';
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setConnectionStatus('Connecting...');
        console.log('[CHAT] contractId:', contractId);

        const createdConversation = await createConversation(contractId);
        console.log('[CHAT] createConversation result:', createdConversation);

        if (!mounted || !createdConversation?.conversationID) {
          console.error('[CHAT] No conversation returned');
          setConnectionStatus('Connection failed');
          return;
        }

        await fetchMessages(createdConversation.conversationID, {
          page: 1,
          pageSize: 50,
        });
        console.log('[CHAT] fetchMessages success');

        await markAsRead(createdConversation.conversationID);
        console.log('[CHAT] markAsRead success');

        const token =
          localStorage.getItem('token') || localStorage.getItem('accessToken') || '';

        const fullWsUrl = `${WS_URL}?token=${encodeURIComponent(token)}`;
        console.log('[CHAT] WS URL:', fullWsUrl);

        const socket = new WebSocket(fullWsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          console.log('[WS] Connected');
          setConnectionStatus('Connected');

          socket.send(
            JSON.stringify({
              type: 'join_room',
              conversationId: createdConversation.conversationID,
            })
          );
        };

        socket.onmessage = (event) => {
          console.log('[WS] Message:', event.data);

          const response = JSON.parse(event.data);

          if (response.type === 'room_joined') {
            console.log('[WS] Joined room:', response.payload);
          }

          if (response.type === 'message_created' && response.payload) {
            const message = response.payload;

            setMessages((prev) => {
              const prevItems = prev?.items || [];
              const exists = prevItems.some((m) => m.messageID === message.messageID);

              if (exists) return prev;

              const withoutOptimistic = prevItems.filter(
                (m) =>
                  !(
                    m.isOptimistic &&
                    m.content === message.content &&
                    m.senderUsername === message.senderUsername
                  )
              );

              return {
                ...prev,
                items: [...withoutOptimistic, message],
                totalCount: (prev.totalCount || 0) + (exists ? 0 : 1),
              };
            });
          }

          if (response.type === 'error') {
            console.error('[WS] Server error:', response.error);
          }
        };

        socket.onclose = (event) => {
          console.log('[WS] Closed:', event.code, event.reason);
          setConnectionStatus('Disconnected');
        };

        socket.onerror = (err) => {
          console.error('[WS] Error:', err);
          setConnectionStatus('Connection failed');
        };
      } catch (err) {
        console.error('[CHAT] init failed:', err);
        setConnectionStatus('Connection failed');
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [contractId, createConversation, fetchMessages, markAsRead, setMessages]);

  const handleSend = (e) => {
    e.preventDefault();

    if (
      !content.trim() ||
      !conversation?.conversationID ||
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    const trimmedContent = content.trim();
    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      messageID: tempId,
      conversationID: conversation.conversationID,
      senderUsername: currentUsername || 'Me',
      senderRole: normalizeRole(currentRole) || 'User',
      content: trimmedContent,
      sentAt: new Date().toISOString(),
      isRead: true,
      isOptimistic: true,
    };

    setMessages((prev) => ({
      ...prev,
      items: [...(prev?.items || []), optimisticMessage],
      totalCount: (prev?.totalCount || 0) + 1,
    }));

    socketRef.current.send(
      JSON.stringify({
        type: 'send_message',
        conversationId: conversation.conversationID,
        content: trimmedContent,
      })
    );

    setContent('');
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold">Contract Chat</h1>
              <p className="mt-1 text-sm text-slate-300">
                WebSocket real-time conversation
              </p>
            </div>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                connectionStatus === 'Connected'
                  ? 'bg-emerald-500/20 text-emerald-200'
                  : connectionStatus === 'Connecting...'
                    ? 'bg-amber-500/20 text-amber-200'
                    : 'bg-rose-500/20 text-rose-200'
              }`}
            >
              {connectionStatus}
            </span>
          </div>
        </div>

        {error && (
          <div className="border-b border-rose-200 bg-rose-50 px-6 py-3 text-sm text-rose-700">
            {typeof error === 'string'
              ? error
              : error.message || 'Something went wrong while loading chat.'}
          </div>
        )}

        <div className="h-[540px] overflow-y-auto bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-5 md:px-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Loading messages...
            </div>
          ) : messages.items?.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              No messages yet.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.items.map((message) => {
                const mine = isMyMessage(message);
                const role = getRoleFromMessage(message);

                return (
                  <div
                    key={message.messageID || `${message.senderUserID}-${message.sentAt}`}
                    className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[80%]">
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${getBubbleClasses(
                          mine,
                          role
                        )}`}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs font-semibold">
                            {message.senderUsername || 'User'}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getBadgeClasses(
                              mine,
                              role
                            )}`}
                          >
                            {role}
                          </span>
                        </div>

                        <p className="break-words text-sm leading-relaxed">
                          {message.content}
                        </p>
                      </div>

                      <div
                        className={`mt-1 px-1 text-[11px] text-slate-400 ${
                          mine ? 'text-right' : 'text-left'
                        }`}
                      >
                        {message.sentAt
                          ? new Date(message.sentAt).toLocaleString([], {
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <form
          onSubmit={handleSend}
          className="border-t border-slate-200 bg-white px-4 py-4 md:px-6"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-sm">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a message..."
              className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!content.trim() || connectionStatus !== 'Connected'}
              className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}