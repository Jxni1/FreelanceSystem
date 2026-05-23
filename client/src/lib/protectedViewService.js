import { apiClient } from './apiClient';

export const protectedViewService = {
  async logView(projectId) {
    const result = await apiClient.post(`/api/protected-views/log/${projectId}`);
    return result.data;
  },

  async getProjectViews(projectId, params = {}) {
    const urlParams = new URLSearchParams();
    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    const qs = urlParams.toString();
    const result = await apiClient.get(`/api/protected-views/project/${projectId}${qs ? `?${qs}` : ''}`);
    return result.data;
  },

  async getProjectStats(projectId) {
    const result = await apiClient.get(`/api/protected-views/project/${projectId}/stats`);
    return result.data;
  },

  async getMostViewed(params = {}) {
    const urlParams = new URLSearchParams();
    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    const qs = urlParams.toString();
    const result = await apiClient.get(`/api/protected-views/most-viewed${qs ? `?${qs}` : ''}`);
    return result.data;
  },

  async getSuspiciousActivity(params = {}) {
    const urlParams = new URLSearchParams();
    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    const qs = urlParams.toString();
    const result = await apiClient.get(`/api/protected-views/suspicious${qs ? `?${qs}` : ''}`);
    return result.data;
  }
};