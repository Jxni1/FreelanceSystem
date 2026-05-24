import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useConversations } from '../../hooks/useConversations';

const buildWsUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || '';

  if (!apiUrl) {
    console.error('[CHAT] Missing VITE_API_URL');
    return '';
  }

  return `${apiUrl.replace(/^http/, 'ws').replace(/\/api\/?$/, '')}/ws/chat`;
};

const normalizeId = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim().toLowerCase();
};

export default function ConversationPage() {
  const { conversationId } = useParams();
  const [searchParams] = useSearchParams();
  const { user, accessToken } = useAuth();

  const {
    conversation,
    messages,
    isLoading,
    error,
    setConversation,
    setMessages,
    createConversation,
    fetchMessages,
    markAsRead,
    respondToRequest,
  } = useConversations();

  const [content, setContent] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [infoMessage, setInfoMessage] = useState('');
  const socketRef = useRef(null);
  const joinedConversationRef = useRef(null);
  const hasConnectedRef = useRef(false);
  const bottomRef = useRef(null);

  const contractId = searchParams.get('contractId');
  const clientId = searchParams.get('clientId');
  const freelancerId = searchParams.get('freelancerId');

  const currentUsername =
    user?.username ||
    user?.userName ||
    user?.name ||
    'Me';

  const currentRole =
    user?.role ||
    user?.userRole ||
    'User';

  const currentUserId =
    user?.userID ||
    user?.userId ||
    user?.id ||
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

  const getSenderId = (message) => {
    return (
      message?.senderUserID ??
      message?.senderUserId ??
      message?.userID ??
      message?.userId ??
      message?.senderId ??
      message?.createdByUserID ??
      message?.createdByUserId ??
      ''
    );
  };

  const getSenderUsername = (message) => {
    return (
      message?.senderUsername ??
      message?.username ??
      message?.userName ??
      message?.senderName ??
      ''
    );
  };

  const getSenderRole = (message) => {
    return (
      message?.senderRole ??
      message?.role ??
      ''
    );
  };

  const isMyMessage = (message) => {
    if (message?.isMine) return true;

    const senderId = normalizeId(getSenderId(message));
    const myId = normalizeId(currentUserId);

    if (senderId && myId) {
      return senderId === myId;
    }

    const senderUsername = (getSenderUsername(message) || '').trim().toLowerCase();
    const myUsername = (currentUsername || '').trim().toLowerCase();

    if (senderUsername && myUsername) {
      return senderUsername === myUsername;
    }

    return false;
  };

  const getRoleFromMessage = (message) => {
    if (message?.isMine) {
      return normalizeRole(currentRole) || 'User';
    }

    const explicitRole = getSenderRole(message);
    if (explicitRole) return normalizeRole(explicitRole);

    const normalizedCurrentRole = normalizeRole(currentRole);

    if (normalizedCurrentRole === 'Client') return 'Freelancer';
    if (normalizedCurrentRole === 'Freelancer') return 'Client';

    return 'User';
  };

  const getDisplayName = (message) => {
    if (message?.isMine || isMyMessage(message)) {
      return currentUsername || 'Me';
    }

    return getSenderUsername(message) || 'User';
  };

  const getBubbleClasses = (mine) => {
    return mine
      ? 'bg-emerald-50 border-2 border-emerald-300 text-slate-900 rounded-2xl rounded-br-md'
      : 'bg-white border-2 border-slate-200 text-slate-900 rounded-2xl rounded-bl-md';
  };

  const getMetaClasses = (mine) => {
    return mine ? 'items-end text-right' : 'items-start text-left';
  };

  const getHeaderRowClasses = (mine) => {
    return mine ? 'justify-end' : 'justify-start';
  };

  const getBadgeClasses = (mine) => {
    return mine
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-slate-100 text-slate-600';
  };

  const canRespondToRequest = useMemo(() => {
    return (
      conversation?.status === 'Pending' &&
      conversation?.requestedByUserID &&
      currentUserId &&
      normalizeId(conversation.requestedByUserID) !== normalizeId(currentUserId)
    );
  }, [conversation, currentUserId]);

  const canSendMessages = useMemo(() => {
    if (!conversation) return false;
    if (conversation.status === 'Accepted') return true;
    if (conversation.status === 'Pending') {
      return normalizeId(conversation.requestedByUserID) === normalizeId(currentUserId);
    }
    return false;
  }, [conversation, currentUserId]);

  useEffect(() => {
    const token =
      accessToken ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      '';

    const wsBaseUrl = buildWsUrl();

    if (!wsBaseUrl) {
      setConnectionStatus('Connection failed');
      setInfoMessage('Missing WebSocket URL configuration.');
      return;
    }

    if (!token) {
      setConnectionStatus('Connection failed');
      setInfoMessage('Missing access token for WebSocket connection.');
      return;
    }

    const fullWsUrl = `${wsBaseUrl}?token=${encodeURIComponent(token)}`;
    const socket = new WebSocket(fullWsUrl);

    socketRef.current = socket;
    setConnectionStatus('Connecting...');

    socket.onopen = async () => {
      hasConnectedRef.current = true;
      setConnectionStatus('Connected');
      setInfoMessage('');

      try {
        if (conversationId) {
          setConversation((prev) =>
            prev?.conversationID === conversationId
              ? prev
              : {
                  ...prev,
                  conversationID: conversationId,
                  status: prev?.status || 'Accepted',
                }
          );

          socket.send(
            JSON.stringify({
              type: 'join_room',
              conversationId,
            })
          );

          joinedConversationRef.current = conversationId;

          await fetchMessages(conversationId, { page: 1, pageSize: 50 });
          await markAsRead(conversationId);
          return;
        }

        if (contractId) {
          const created = await createConversation({ contractID: contractId });
          setConversation(created);

          socket.send(
            JSON.stringify({
              type: 'join_room',
              conversationId: created.conversationID,
            })
          );

          joinedConversationRef.current = created.conversationID;

          await fetchMessages(created.conversationID, { page: 1, pageSize: 50 });
          await markAsRead(created.conversationID);
        }
      } catch (err) {
        setInfoMessage(err?.message || 'Failed to initialize conversation.');
      }
    };

    socket.onmessage = async (event) => {
      const response = JSON.parse(event.data);
      const type = response.type || response.Type;
      const payload = response.payload || response.Payload;
      const socketError = response.error || response.Error;

      if (type === 'room_joined') {
        setInfoMessage('');
        return;
      }

      if (type === 'conversation_created' && payload) {
        const createdConversation = payload;
        setConversation(createdConversation);

        if (
          createdConversation?.conversationID &&
          joinedConversationRef.current !== createdConversation.conversationID
        ) {
          socket.send(
            JSON.stringify({
              type: 'join_room',
              conversationId: createdConversation.conversationID,
            })
          );

          joinedConversationRef.current = createdConversation.conversationID;
        }

        await fetchMessages(createdConversation.conversationID, { page: 1, pageSize: 50 });
        return;
      }

      if (type === 'message_request_received' && payload) {
        setConversation(payload);
        setInfoMessage('You received a new message request.');
        return;
      }

      if (type === 'conversation_request_accepted' && payload) {
        setConversation(payload);
        setInfoMessage('Conversation request accepted.');
        return;
      }

      if (type === 'conversation_request_rejected' && payload) {
        setConversation(payload);
        setInfoMessage('Conversation request rejected.');
        return;
      }

      if (type === 'message_created' && payload) {
        const realMessage = {
          ...payload,
          isMine: normalizeId(getSenderId(payload)) === normalizeId(currentUserId),
        };

        setMessages((prev) => {
          const prevItems = prev?.items || [];

          const withoutMatchedOptimistic = prevItems.filter((item) => {
            if (!item.isOptimistic) return true;

            const sameConversation =
              normalizeId(item.conversationID) === normalizeId(realMessage.conversationID);

            const sameContent =
              (item.content || '').trim() === (realMessage.content || '').trim();

            const sameSender =
              normalizeId(getSenderId(item)) === normalizeId(getSenderId(realMessage)) ||
              (item.isMine && realMessage.isMine);

            return !(sameConversation && sameContent && sameSender);
          });

          const alreadyExists = withoutMatchedOptimistic.some(
            (item) =>
              normalizeId(item.messageID) === normalizeId(realMessage.messageID) ||
              normalizeId(item.id) === normalizeId(realMessage.messageID)
          );

          if (alreadyExists) {
            return prev;
          }

          return {
            ...prev,
            items: [...withoutMatchedOptimistic, realMessage],
            totalCount: [...withoutMatchedOptimistic, realMessage].length,
          };
        });

        return;
      }

      if (type === 'error') {
        setInfoMessage(socketError || 'A WebSocket error occurred.');
      }
    };

    socket.onclose = (event) => {
      const closedBeforeRealConnection =
        !hasConnectedRef.current && event.code === 1006;

      if (closedBeforeRealConnection) {
        return;
      }

      setConnectionStatus('Disconnected');

      if (event.code === 1008) {
        setInfoMessage('WebSocket authorization failed.');
      } else if (event.reason) {
        setInfoMessage(`WebSocket closed: ${event.reason}`);
      } else if (event.code !== 1000) {
        setInfoMessage(`WebSocket disconnected (code ${event.code}).`);
      }
    };

    socket.onerror = () => {
      if (!hasConnectedRef.current) return;
      setConnectionStatus('Connection failed');
    };

    return () => {
      joinedConversationRef.current = null;
      socket.close();
    };
  }, [
    accessToken,
    conversationId,
    contractId,
    createConversation,
    fetchMessages,
    markAsRead,
    currentUserId,
    setConversation,
    setMessages,
  ]);

  const handleStartRequest = () => {
    if (
      !clientId ||
      !freelancerId ||
      !initialMessage.trim() ||
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    socketRef.current.send(
      JSON.stringify({
        type: 'create_conversation',
        clientId,
        freelancerId,
        content: initialMessage.trim(),
      })
    );
  };

  const handleAccept = async () => {
    if (!conversation?.conversationID) return;

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'respond_conversation',
          conversationId: conversation.conversationID,
          accept: true,
        })
      );
    } else {
      const updated = await respondToRequest(conversation.conversationID, true);
      setConversation(updated);
    }
  };

  const handleReject = async () => {
    if (!conversation?.conversationID) return;

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'respond_conversation',
          conversationId: conversation.conversationID,
          accept: false,
        })
      );
    } else {
      const updated = await respondToRequest(conversation.conversationID, false);
      setConversation(updated);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();

    if (
      !content.trim() ||
      !conversation?.conversationID ||
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN ||
      !canSendMessages
    ) {
      return;
    }

    const trimmedContent = content.trim();
    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      messageID: tempId,
      id: tempId,
      conversationID: conversation.conversationID,
      senderUserID: currentUserId,
      senderUserId: currentUserId,
      senderUsername: currentUsername,
      senderRole: normalizeRole(currentRole),
      content: trimmedContent,
      sentAt: new Date().toISOString(),
      isRead: true,
      isOptimistic: true,
      isMine: true,
    };

    setMessages((prev) => ({
      ...prev,
      items: [...(prev?.items || []), optimisticMessage],
      totalCount: (prev?.items?.length || 0) + 1,
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

  const statusBadgeClasses =
    conversation?.status === 'Accepted'
      ? 'bg-emerald-500/20 text-emerald-200'
      : conversation?.status === 'Pending'
        ? 'bg-amber-500/20 text-amber-200'
        : 'bg-rose-500/20 text-rose-200';

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 text-white">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-bold">Conversation</h1>
              <p className="mt-1 text-sm text-slate-300">
                Real-time WebSocket chat with request flow
              </p>
            </div>

            <div className="flex items-center gap-2">
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

              {conversation?.status && (
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses}`}>
                  {conversation.status}
                </span>
              )}
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

        {infoMessage && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-700">
            {infoMessage}
          </div>
        )}

        {!conversationId && !contractId && clientId && freelancerId && !conversation?.conversationID && (
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              First message
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                placeholder="Write the first message request..."
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none"
              />
              <button
                type="button"
                disabled={!initialMessage.trim() || connectionStatus !== 'Connected'}
                onClick={handleStartRequest}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Start chat
              </button>
            </div>
          </div>
        )}

        {canRespondToRequest && (
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-700">
                This conversation is a pending message request. Accept it to reply normally, or reject it.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAccept}
                  className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600"
                >
                  Reject
                </button>
              </div>
            </div>
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
            <div className="flex flex-col gap-4">
              {messages.items.map((message) => {
                const mine = isMyMessage(message);
                const role = getRoleFromMessage(message);
                const displayName = getDisplayName(message);

                return (
                  <div
                    key={message.messageID || message.id || `${getSenderId(message)}-${message.sentAt}`}
                    className={`flex w-full ${mine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-[78%] flex-col ${getMetaClasses(mine)}`}>
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${getBubbleClasses(mine)}`}
                      >
                        <div className={`mb-1 flex items-center gap-2 ${getHeaderRowClasses(mine)}`}>
                          <span className="text-xs font-semibold">
                            {displayName}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getBadgeClasses(mine)}`}
                          >
                            {role}
                          </span>
                        </div>

                        <p className={`break-words text-sm leading-relaxed ${mine ? 'text-right' : 'text-left'}`}>
                          {message.content}
                        </p>
                      </div>

                      <div className={`mt-1 px-1 text-[11px] text-slate-400 ${mine ? 'text-right' : 'text-left'}`}>
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
              placeholder={
                canSendMessages
                  ? 'Write a message...'
                  : conversation?.status === 'Pending'
                    ? 'Accept request to reply...'
                    : 'Conversation unavailable'
              }
              disabled={!canSendMessages}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!content.trim() || connectionStatus !== 'Connected' || !canSendMessages}
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