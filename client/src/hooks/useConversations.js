import { useState, useCallback } from 'react';
import { conversationService } from '../lib/conversationService';

const getErrorMessage = (err, fallback) => {
  const data = err?.response?.data;

  if (typeof data === 'string') return data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error === 'string') return data.error;
  if (typeof err?.message === 'string') return err.message;

  return fallback;
};

export function useConversations() {
  const [conversations, setConversations] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [messages, setMessages] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 50,
  });
  const [conversation, setConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const createConversation = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await conversationService.create(payload);
      const data = result?.data ?? result?.value ?? result;
      setConversation(data);
      return data;
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create conversation.'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await conversationService.getMyConversations();
      const data = result?.data ?? result?.value ?? result ?? [];
      setConversations(data);
      return data;
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load conversations.'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPendingRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await conversationService.getPendingRequests();
      const data = result?.data ?? result?.value ?? result ?? [];
      setPendingRequests(data);
      return data;
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load pending requests.'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId, params = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await conversationService.getMessages(conversationId, params);
      const data = result?.data ?? result?.value ?? result;

      if (data?.items) {
        setMessages(data);
        return data;
      }

      const fallback = {
        items: Array.isArray(data) ? data : [],
        totalCount: Array.isArray(data) ? data.length : 0,
        page: params.page || 1,
        pageSize: params.pageSize || 50,
      };

      setMessages(fallback);
      return fallback;
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load messages.'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (payload) => {
    setIsSending(true);
    setError(null);

    try {
      const result = await conversationService.sendMessage(payload);
      const data = result?.data ?? result?.value ?? result;
      return data;
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send message.'));
      throw err;
    } finally {
      setIsSending(false);
    }
  }, []);

  const markAsRead = useCallback(async (conversationId) => {
    setError(null);

    try {
      const result = await conversationService.markAsRead(conversationId);
      const data = result?.data ?? result?.value ?? result;
      return data;
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to mark messages as read.'));
      throw err;
    }
  }, []);

  const respondToRequest = useCallback(async (conversationId, accept) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await conversationService.respondToRequest(conversationId, accept);
      const data = result?.data ?? result?.value ?? result;
      setConversation(data);
      return data;
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to respond to request.'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    conversations,
    pendingRequests,
    conversation,
    messages,
    isLoading,
    isSending,
    error,
    setMessages,
    setConversation,
    setConversations,
    setPendingRequests,
    createConversation,
    fetchMyConversations,
    fetchPendingRequests,
    fetchMessages,
    sendMessage,
    markAsRead,
    respondToRequest,
  };
}