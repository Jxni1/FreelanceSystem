import { apiClient } from './apiClient';

export const projectService = {
  async getAll(params = {}) {
    const urlParams = new URLSearchParams();
    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    if (params.search) urlParams.append('search', params.search);
    if (params.categoryId) urlParams.append('categoryId', params.categoryId);
    if (params.status) urlParams.append('status', params.status);
    if (params.visibility) urlParams.append('visibility', params.visibility);
    if (params.skill) urlParams.append('skill', params.skill);
    if (Array.isArray(params.skillNames)) {
      params.skillNames.forEach(s => urlParams.append('skillNames', s));
    }

    const queryString = urlParams.toString();
    const result = await apiClient.get(`/api/projects${queryString ? `?${queryString}` : ''}`);
    return result.data;
  },

  async getById(id) {
    const result = await apiClient.get(`/api/projects/${id}`);
    return result.data;
  },

  async create(data) {
    const result = await apiClient.post('/api/projects', data);
    return result.data;
  },

  async update(id, data) {
    const result = await apiClient.put(`/api/projects/${id}`, data);
    return result.data;
  },

  async delete(id) {
    const result = await apiClient.delete(`/api/projects/${id}`);
    return result.data;
  }
};
