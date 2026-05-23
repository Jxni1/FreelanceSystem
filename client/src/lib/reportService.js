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
    const result = await apiClient.patch(`/api/reports/${reportId}/status`, payload);
    return result.data;
  },

  async delete(reportId) {
    const result = await apiClient.delete(`/api/reports/${reportId}`);
    return result.data;
  },

  async exportReports(params = {}, format = 'csv') {
    const urlParams = new URLSearchParams();

    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    if (params.status) urlParams.append('status', params.status);
    if (params.entity) urlParams.append('entity', params.entity);
    if (params.userID) urlParams.append('userID', params.userID);

    urlParams.append('format', format);

    const qs = urlParams.toString();

    return apiClient.get(`/api/reports/export${qs ? `?${qs}` : ''}`, {
      responseType: 'blob',
    });
  },

  async importReports(file, format = 'csv') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    const result = await apiClient.post('/api/reports/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return result.data;
  },
};