import { apiClient } from './apiClient';

export const userService = {
  async getAll(params = {}) {
    const urlParams = new URLSearchParams();

    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    if (params.search) urlParams.append('search', params.search);
    if (params.role) urlParams.append('role', params.role);

    if (params.isActive !== undefined && params.isActive !== null) {
      urlParams.append('isActive', params.isActive);
    }

    const queryString = urlParams.toString();
    const result = await apiClient.get(`/api/users${queryString ? `?${queryString}` : ''}`);
    return result.data;
  },

  async getById(id) {
    const result = await apiClient.get(`/api/users/${id}`);
    return result.data;
  },

  async create(data) {
    const result = await apiClient.post('/api/users', data);
    return result.data;
  },

  async update(id, data) {
    const result = await apiClient.put(`/api/users/${id}`, data);
    return result.data;
  },

  async delete(id) {
    const result = await apiClient.delete(`/api/users/${id}`);
    return result.data;
  }
};