import { apiClient } from './apiClient';

export const categoryService = {
  async getAll(params = {}) {
    const urlParams = new URLSearchParams();

    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    if (params.search) urlParams.append('search', params.search);

    const qs = urlParams.toString();
    const result = await apiClient.get(`/api/categories${qs ? `?${qs}` : ''}`);
    return result.data;
  },

  async getById(categoryId) {
    const result = await apiClient.get(`/api/categories/${categoryId}`);
    return result.data;
  },

  async create(payload) {
    const result = await apiClient.post('/api/categories', payload);
    return result.data;
  },

  async update(categoryId, payload) {
    const result = await apiClient.put(`/api/categories/${categoryId}`, payload);
    return result.data;
  },

  async delete(categoryId) {
    const result = await apiClient.delete(`/api/categories/${categoryId}`);
    return result.data;
  },

  async exportCategories(params = {}, format = 'csv') {
    const urlParams = new URLSearchParams();

    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    if (params.search) urlParams.append('search', params.search);

    urlParams.append('format', format);

    const qs = urlParams.toString();

    return apiClient.get(`/api/categories/export${qs ? `?${qs}` : ''}`, {
      responseType: 'blob',
    });
  },

  async importCategories(file, format = 'csv') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    const result = await apiClient.post('/api/categories/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return result.data;
  },
};