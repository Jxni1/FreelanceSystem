import { apiClient } from './apiClient';

export const contractService = {
  async getAll(params = {}) {
    const urlParams = new URLSearchParams();

    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    if (params.status) urlParams.append('status', params.status);
    if (params.clientID) urlParams.append('clientID', params.clientID);
    if (params.freelancerID) urlParams.append('freelancerID', params.freelancerID);
    if (params.projectID) urlParams.append('projectID', params.projectID);

    const queryString = urlParams.toString();

    try {
      const result = await apiClient.get(`/api/contracts/client${queryString ? `?${queryString}` : ''}`);
      return result.data;
    } catch (error) {
      if (error.response?.status === 403) {
        try {
          const result = await apiClient.get(`/api/contracts/freelancer${queryString ? `?${queryString}` : ''}`);
          return result.data;
        } catch (freelancerError) {
          if (freelancerError.response?.status === 403) {
            const result = await apiClient.get(`/api/contracts/all${queryString ? `?${queryString}` : ''}`);
            return result.data;
          }
          throw freelancerError;
        }
      }
      throw error;
    }
  },

  async getById(id) {
    const result = await apiClient.get(`/api/contracts/${id}`);
    return result.data;
  },

  async create(data) {
    const result = await apiClient.post('/api/contracts', data);
    return result.data;
  },

  async update(id, data) {
    const result = await apiClient.put(`/api/contracts/${id}`, data);
    return result.data;
  },

  async delete(id) {
    const result = await apiClient.delete(`/api/contracts/${id}`);
    return result.data;
  },

  async exportContracts(params = {}, format = 'csv') {
    const urlParams = new URLSearchParams();

    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    if (params.status) urlParams.append('status', params.status);
    if (params.clientID) urlParams.append('clientID', params.clientID);
    if (params.freelancerID) urlParams.append('freelancerID', params.freelancerID);
    if (params.projectID) urlParams.append('projectID', params.projectID);

    urlParams.append('format', format);

    const qs = urlParams.toString();

    return apiClient.get(`/api/contracts/export${qs ? `?${qs}` : ''}`, {
      responseType: 'blob',
    });
  },

  async importContracts(file, format = 'csv') {
    const formData = new FormData();
    formData.append('file', file);

    const result = await apiClient.post(
      `/api/contracts/import?format=${encodeURIComponent(format)}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return result.data;
  },
};