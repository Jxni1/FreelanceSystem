import { useState, useCallback } from 'react';
import { conversationService } from '../lib/conversationService';

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
      const result = await conversationService.create(contractID);
      const data = result?.data ?? result?.value ?? result;
      setConversation(data);
      return data;
    } catch (err) {
      setError(err?.response?.data || err.message || 'Failed to create conversation.');
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
      setError(err?.response?.data || err.message || 'Failed to load conversations.');
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
      setError(err?.response?.data || err.message || 'Failed to load messages.');
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
      return result?.data ?? result?.value ?? result;
    } catch (err) {
      setError(err?.response?.data || err.message || 'Failed to send message.');
      throw err;
    } finally {
      setIsSending(false);
    }
  }, []);

  const markAsRead = useCallback(async (conversationId) => {
    try {
      const result = await conversationService.markAsRead(conversationId);
      return result?.data ?? result?.value ?? result;
    } catch (err) {
      setError(err?.response?.data || err.message || 'Failed to mark messages as read.');
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