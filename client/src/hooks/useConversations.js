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

  const createConversation = useCallback(async (contractID) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[HOOK] createConversation contractID:', contractID);

      const result = await conversationService.create(contractID);
      const data = result?.data ?? result?.value ?? result;

      console.log('[HOOK] createConversation success:', data);

      setConversation(data);
      return data;
    } catch (err) {
      console.error('[HOOK] createConversation failed:', err);
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
      console.log('[HOOK] fetchMyConversations');

      const result = await conversationService.getMyConversations();
      const data = result?.data ?? result?.value ?? result ?? [];

      console.log('[HOOK] fetchMyConversations success:', data);

      setConversations(data);
      return data;
    } catch (err) {
      console.error('[HOOK] fetchMyConversations failed:', err);
      setError(getErrorMessage(err, 'Failed to load conversations.'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId, params = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('[HOOK] fetchMessages conversationId:', conversationId, 'params:', params);

      const result = await conversationService.getMessages(conversationId, params);
      const data = result?.data ?? result?.value ?? result;

      console.log('[HOOK] fetchMessages raw result:', data);

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
      console.error('[HOOK] fetchMessages failed:', err);
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
      console.log('[HOOK] sendMessage payload:', payload);

      const result = await conversationService.sendMessage(payload);
      const data = result?.data ?? result?.value ?? result;

      console.log('[HOOK] sendMessage success:', data);

      return data;
    } catch (err) {
      console.error('[HOOK] sendMessage failed:', err);
      setError(getErrorMessage(err, 'Failed to send message.'));
      throw err;
    } finally {
      setIsSending(false);
    }
  }, []);

  const markAsRead = useCallback(async (conversationId) => {
    setError(null);

    try {
      console.log('[HOOK] markAsRead conversationId:', conversationId);

      const result = await conversationService.markAsRead(conversationId);
      const data = result?.data ?? result?.value ?? result;

      console.log('[HOOK] markAsRead success:', data);

      return data;
    } catch (err) {
      console.error('[HOOK] markAsRead failed:', err);
      setError(getErrorMessage(err, 'Failed to mark messages as read.'));
      throw err;
    }
  }, []);

  return {
    conversations,
    conversation,
    messages,
    isLoading,
    isSending,
    error,
    setMessages,
    setConversation,
    createConversation,
    fetchMyConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
  };
}