import { apiClient } from './apiClient';

export const conversationService = {
  async create(contractID) {
    const result = await apiClient.post('/api/conversations', { contractID });
    return result.data;
  },

  async getMyConversations() {
    const result = await apiClient.get('/api/conversations');
    return result.data;
  },

  async getMessages(conversationId, params = {}) {
    const urlParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        urlParams.append(key, value);
      }
    });

    const query = urlParams.toString();
    const result = await apiClient.get(
      `/api/conversations/${conversationId}/messages${query ? `?${query}` : ''}`
    );

    return result.data;
  },

  async sendMessage(data) {
    const result = await apiClient.post('/api/conversations/messages', data);
    return result.data;
  },

  async markAsRead(conversationId) {
    const result = await apiClient.patch(`/api/conversations/${conversationId}/read`);
    return result.data;
  },
};