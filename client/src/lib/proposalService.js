import { apiClient } from './apiClient';

export const proposalService = {
  async getAll(params = {}) {
    const urlParams = new URLSearchParams();
    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    if (params.status) urlParams.append('status', params.status);
    if (params.projectId) urlParams.append('projectId', params.projectId);
    const qs = urlParams.toString();
    const result = await apiClient.get(`/api/proposals${qs ? `?${qs}` : ''}`);
    return result.data;
  },

  async create(data) {
    const result = await apiClient.post('/api/proposals', data);
    return result.data;
  },

  async accept(id) {
    const result = await apiClient.patch(`/api/proposals/${id}/accept`);
    return result.data;
  },

  async reject(id) {
    const result = await apiClient.patch(`/api/proposals/${id}/reject`);
    return result.data;
  },

  async delete(id) {
    const result = await apiClient.delete(`/api/proposals/${id}`);
    return result.data;
  },
};
