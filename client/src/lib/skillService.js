import { apiClient } from './apiClient';

export const skillService = {
  async getAll(params = {}) {
    const urlParams = new URLSearchParams();
    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    if (params.search) urlParams.append('search', params.search);

    const queryString = urlParams.toString();
    const result = await apiClient.get(`/api/skills${queryString ? `?${queryString}` : ''}`);
    return result.data;
  },

  async getById(id) {
    const result = await apiClient.get(`/api/skills/${id}`);
    return result.data;
  },

  async create(data) {
    const result = await apiClient.post('/api/skills', data);
    return result.data;
  },

  async update(id, data) {
    const result = await apiClient.put(`/api/skills/${id}`, data);
    return result.data;
  },

  async delete(id) {
    const result = await apiClient.delete(`/api/skills/${id}`);
    return result.data;
  }
};