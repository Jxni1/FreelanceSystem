import { apiClient } from "./apiClient";


export const notificationService = {
  async getAll(params = {}) {
    const urlParams = new URLSearchParams();

    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    if (params.search) urlParams.append('search', params.search);
    if (params.type) urlParams.append('type', params.type);
    if (params.isRead !== undefined && params.isRead !== null) {
      urlParams.append('isRead', params.isRead);
    }

    const qs = urlParams.toString();
    const result = await apiClient.get(`/api/notifications${qs ? `?${qs}` : ''}`);
    return result.data;
  },

  async getById(id) {
    const result = await apiClient.get(`/api/notifications/${id}`);
    return result.data;
  },

  async getUnreadCount() {
    const result = await apiClient.get('/api/notifications/unread-count');
    return result.data;
  },

  async create(data) {
    const result = await apiClient.post('/api/notifications', data);
    return result.data;
  },

  async update(id, data) {
    const result = await apiClient.put(`/api/notifications/${id}`, data);
    return result.data;
  },

  async markAsRead(id) {
    const result = await apiClient.put(`/api/notifications/${id}/mark-read`);
    return result.data;
  },

  async markAsUnread(id) {
    const result = await apiClient.put(`/api/notifications/${id}/mark-unread`);
    return result.data;
  },

  async markAllAsRead() {
    const result = await apiClient.put('/api/notifications/mark-all-read');
    return result.data;
  },

  async delete(id) {
    const result = await apiClient.delete(`/api/notifications/${id}`);
    return result.data;
  },

  async deleteAllRead() {
    const result = await apiClient.delete('/api/notifications/read');
    return result.data;
  },
};