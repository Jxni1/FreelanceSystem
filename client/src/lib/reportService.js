import { apiClient } from './apiClient';

export const reportService = {
  async getAll(params = {}) {
    const urlParams = new URLSearchParams();

    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    if (params.status) urlParams.append('status', params.status);
    if (params.entity) urlParams.append('entity', params.entity);
    if (params.userID) urlParams.append('userID', params.userID);

    const qs = urlParams.toString();
    const result = await apiClient.get(`/api/reports${qs ? `?${qs}` : ''}`);
    return result.data;
  },

  async getById(reportId) {
    const result = await apiClient.get(`/api/reports/${reportId}`);
    return result.data;
  },

  async updateStatus(reportId, payload) {
    const result = await apiClient.put(`/api/reports/${reportId}/status`, payload);
    return result.data;
  },

  async delete(reportId) {
    const result = await apiClient.delete(`/api/reports/${reportId}`);
    return result.data;
  },
};