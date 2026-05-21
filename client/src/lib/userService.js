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
  },

  async exportUsers(params = {}, format = 'csv') {
    const urlParams = new URLSearchParams();

    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    if (params.search) urlParams.append('search', params.search);
    if (params.role) urlParams.append('role', params.role);
    if (params.isActive !== undefined && params.isActive !== null) {
      urlParams.append('isActive', params.isActive);
    }

    urlParams.append('format', format);

    const result = await apiClient.get(`/api/users/export?${urlParams.toString()}`, {
      responseType: 'blob'
    });

    return result; // axios response (blob + headers)
  },

  async importUsers(file, format = 'csv') {
    const formData = new FormData();
    formData.append('file', file);

    const result = await apiClient.post(`/api/users/import?format=${format}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return result.data;
  }
};