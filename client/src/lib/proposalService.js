import { apiClient } from './apiClient';

export const proposalService = {
  async getAll(params = {}) {
    const urlParams = new URLSearchParams();
    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    if (params.status) urlParams.append('status', params.status);
    if (params.projectId) urlParams.append('projectId', params.projectId);
    if (params.minBidAmount) urlParams.append('minBidAmount', params.minBidAmount);
    if (params.maxBidAmount) urlParams.append('maxBidAmount', params.maxBidAmount);
    if (params.minDeliveryDays) urlParams.append('minDeliveryDays', params.minDeliveryDays);
    if (params.maxDeliveryDays) urlParams.append('maxDeliveryDays', params.maxDeliveryDays);
    if (params.searchMessage) urlParams.append('searchMessage', params.searchMessage);
    if (params.sortBy) urlParams.append('sortBy', params.sortBy);
    if (params.sortOrder) urlParams.append('sortOrder', params.sortOrder);
    if (params.freelancerId) urlParams.append('freelancerId', params.freelancerId);

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

  async exportProposals(params = {}, format = 'csv') {
    const urlParams = new URLSearchParams();
    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    if (params.status) urlParams.append('status', params.status);
    if (params.projectId) urlParams.append('projectId', params.projectId);
    if (params.minBidAmount) urlParams.append('minBidAmount', params.minBidAmount);
    if (params.maxBidAmount) urlParams.append('maxBidAmount', params.maxBidAmount);
    if (params.minDeliveryDays) urlParams.append('minDeliveryDays', params.minDeliveryDays);
    if (params.maxDeliveryDays) urlParams.append('maxDeliveryDays', params.maxDeliveryDays);
    if (params.searchMessage) urlParams.append('searchMessage', params.searchMessage);
    if (params.sortBy) urlParams.append('sortBy', params.sortBy);
    if (params.sortOrder) urlParams.append('sortOrder', params.sortOrder);
    if (params.freelancerId) urlParams.append('freelancerId', params.freelancerId);

    urlParams.append('format', format);

    const qs = urlParams.toString();

    return apiClient.get(`/api/proposals/export${qs ? `?${qs}` : ''}`, {
      responseType: 'blob',
    });
  },

  async importProposals(file, format = 'csv') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    const result = await apiClient.post('/api/proposals/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return result.data;
  },
};