import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as signalR from '@microsoft/signalr';
import { useConversations } from '../../hooks/useConversations';

const HUB_URL = `${import.meta.env.VITE_API_URL.replace(/\/api$/, '')}/hubs/chat`;

export default function ContractChatPage() {
  const { contractId } = useParams();
  const {
    conversation,
    messages,
    isLoading,
    isSending,
    error,
    setMessages,
    createConversation,
    fetchMessages,
    sendMessage,
    markAsRead,
  } = useConversations();

  const [content, setContent] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [toast, setToast] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const bottomRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  const currentUsername =
    localStorage.getItem('username') || localStorage.getItem('userName') || '';

  const currentRole =
    localStorage.getItem('role') ||
    localStorage.getItem('userRole') ||
    '';

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.items]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

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

  const getBubbleClasses = (role, mine) => {
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

  const getAvatarClasses = (role, mine) => {
    if (role === 'Client') {
      return mine
        ? 'bg-blue-100 text-blue-700'
        : 'bg-blue-200 text-blue-800';
    }

    if (role === 'Freelancer') {
      return mine
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-emerald-200 text-emerald-800';
    }

    return 'bg-slate-200 text-slate-700';
  };

  const getBadgeClasses = (role, mine) => {
    if (role === 'Client') {
      return mine
        ? 'bg-blue-400/20 text-blue-100 border border-blue-300/30'
        : 'bg-blue-100 text-blue-700 border border-blue-200';
    }

    if (role === 'Freelancer') {
      return mine
        ? 'bg-emerald-400/20 text-emerald-50 border border-emerald-300/30'
        : 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    }

    return mine
      ? 'bg-white/10 text-white border border-white/20'
      : 'bg-slate-100 text-slate-600 border border-slate-200';
  };

  const showIncomingToast = (message) => {
    const role = getRoleFromMessage(message);

    setToast({
      sender: message.senderUsername || 'Someone',
      role,
      content: message.content,
    });

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const showBrowserNotification = (message) => {
    if (!('Notification' in window)) return;
    if (document.visibilityState === 'visible') return;
    if (Notification.permission !== 'granted') return;

    const role = getRoleFromMessage(message);

    new Notification(`New ${role} message`, {
      body: `${message.senderUsername || role}: ${message.content}`,
      icon: '/favicon.ico',
    });
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications.');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  useEffect(() => {
    let mounted = true;
    let currentConnection = null;
    let currentConversationId = null;

    const token =
      localStorage.getItem('token') || localStorage.getItem('accessToken') || '';

    const initialize = async () => {
      try {
        setConnectionStatus('Connecting...');

        const createdConversation = await createConversation(contractId);
        if (!mounted || !createdConversation?.conversationID) return;

        currentConversationId = createdConversation.conversationID;

        await fetchMessages(createdConversation.conversationID, {
          page: 1,
          pageSize: 50,
        });

        const connection = new signalR.HubConnectionBuilder()
          .withUrl(HUB_URL, {
            accessTokenFactory: () => token,
          })
          .withAutomaticReconnect()
          .build();

        currentConnection = connection;

        connection.on('ReceiveMessage', (message) => {
          setMessages((prev) => {
            const prevItems = prev?.items || [];
            const exactExists = prevItems.some((m) => m.messageID === message.messageID);

            if (exactExists) return prev;

            const optimisticIndex = prevItems.findIndex(
              (m) =>
                m.isOptimistic &&
                m.content === message.content &&
                m.senderUsername === message.senderUsername
            );

            if (optimisticIndex !== -1) {
              const updatedItems = [...prevItems];
              updatedItems[optimisticIndex] = { ...message, isOptimistic: false };

              return {
                ...prev,
                items: updatedItems,
              };
            }

            return {
              ...prev,
              items: [...prevItems, message],
              totalCount: (prev.totalCount || 0) + 1,
            };
          });

          const mine =
            message.senderUsername &&
            currentUsername &&
            message.senderUsername.toLowerCase() === currentUsername.toLowerCase();

          if (!mine) {
            showIncomingToast(message);
            showBrowserNotification(message);
          }
        });

        connection.onreconnecting(() => {
          setConnectionStatus('Reconnecting...');
        });

        connection.onreconnected(async () => {
          setConnectionStatus('Connected');

          if (currentConversationId) {
            try {
              await connection.invoke('JoinConversation', currentConversationId);
            } catch (err) {
              console.error('Rejoin failed:', err);
            }
          }
        });

        connection.onclose(() => {
          setConnectionStatus('Disconnected');
        });

        await connection.start();
        await connection.invoke('JoinConversation', currentConversationId);

        setConnectionStatus('Connected');
        await markAsRead(currentConversationId);
      } catch (err) {
        console.error('Chat init failed:', err);
        setConnectionStatus('Connection failed');
      }
    };

    initialize();

    return () => {
      mounted = false;

      const cleanup = async () => {
        try {
          if (
            currentConnection &&
            currentConnection.state === signalR.HubConnectionState.Connected &&
            currentConversationId
          ) {
            await currentConnection.invoke('LeaveConversation', currentConversationId);
          }
        } catch (err) {
          console.error('Leave failed:', err);
        }

        try {
          if (currentConnection) {
            await currentConnection.stop();
          }
        } catch (err) {
          console.error('Stop failed:', err);
        }
      };

      cleanup();
    };
  }, [
    contractId,
    createConversation,
    fetchMessages,
    markAsRead,
    setMessages,
    currentUsername,
    currentRole,
  ]);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!content.trim() || !conversation?.conversationID) return;

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

    setContent('');

    try {
      const savedMessage = await sendMessage({
        conversationID: conversation.conversationID,
        content: trimmedContent,
      });

      const realMessage = savedMessage?.data ?? savedMessage?.value ?? savedMessage;

      setMessages((prev) => {
        const updatedItems = (prev?.items || []).map((m) =>
          m.messageID === tempId ? { ...realMessage, isOptimistic: false } : m
        );

        return {
          ...prev,
          items: updatedItems,
        };
      });
    } catch (err) {
      setMessages((prev) => {
        const updatedItems = (prev?.items || []).filter((m) => m.messageID !== tempId);

        return {
          ...prev,
          items: updatedItems,
          totalCount: Math.max((prev?.totalCount || 1) - 1, 0),
        };
      });

      setContent(trimmedContent);
      console.error('Send failed:', err);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      {toast && (
        <div className="fixed right-6 top-6 z-50 w-[340px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
              {(toast.sender || 'U').charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{toast.sender}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {toast.role}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{toast.content}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-slate-400 transition hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-bold">Contract Chat</h1>
              <p className="mt-1 text-sm text-slate-300">
                Client and freelancer conversation
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                {notificationPermission === 'granted'
                  ? 'Notifications Enabled'
                  : 'Enable Notifications'}
              </button>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  connectionStatus === 'Connected'
                    ? 'bg-emerald-500/20 text-emerald-200'
                    : connectionStatus === 'Reconnecting...'
                    ? 'bg-amber-500/20 text-amber-200'
                    : 'bg-rose-500/20 text-rose-200'
                }`}
              >
                {connectionStatus}
              </span>
            </div>
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
            <div className="flex h-full flex-col items-center justify-center text-center text-sm text-slate-500">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-xl">
                💬
              </div>
              <p className="font-medium text-slate-700">No messages yet</p>
              <p className="mt-1 text-xs text-slate-500">
                Start the conversation with your first message.
              </p>
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
                    <div
                      className={`flex max-w-[85%] items-end gap-2 md:max-w-[72%] ${
                        mine ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase shadow-sm ${getAvatarClasses(
                          role,
                          mine
                        )}`}
                      >
                        {(message.senderUsername || 'U').charAt(0)}
                      </div>

                      <div className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-700">
                            {message.senderUsername || 'User'}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getBadgeClasses(
                              role,
                              mine
                            )}`}
                          >
                            {role}
                          </span>
                        </div>

                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${getBubbleClasses(
                            role,
                            mine
                          )}`}
                        >
                          <p className="text-sm leading-relaxed break-words">
                            {message.content}
                          </p>
                        </div>

                        <span className="mt-1 px-1 text-[11px] text-slate-400">
                          {message.sentAt
                            ? new Date(message.sentAt).toLocaleString([], {
                                month: 'numeric',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="border-t border-slate-200 bg-white px-4 py-4 md:px-6">
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
              disabled={isSending || !content.trim()}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}