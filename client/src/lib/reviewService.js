import { apiClient } from './apiClient';

export const reviewService = {
  async getAll(params = {}) {
    const urlParams = new URLSearchParams();
    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    if (params.freelancerId) urlParams.append('freelancerID', params.freelancerId);
    if (params.contractId) urlParams.append('contractID', params.contractId);

    const queryString = urlParams.toString();
    const result = await apiClient.get(`/api/reviews${queryString ? `?${queryString}` : ''}`);
    return result.data;
  },

  async getById(id) {
    const result = await apiClient.get(`/api/reviews/${id}`);
    return result.data;
  },

  async create(data) {
    const result = await apiClient.post('/api/reviews', data);
    return result.data;
  },

  async update(id, data) {
    const result = await apiClient.put(`/api/reviews/${id}`, data);
    return result.data;
  },

  async delete(id) {
    const result = await apiClient.delete(`/api/reviews/${id}`);
    return result.data;
  },
};