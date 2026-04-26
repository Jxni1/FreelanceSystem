import { apiClient } from './apiClient';

export const contractService = {
  async getAll(params = {}) {
    const urlParams = new URLSearchParams();
    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    if (params.status) urlParams.append('status', params.status);
    // Removed clientID/freelancerID - users auto-filtered to own contracts
    if (params.projectID) urlParams.append('projectID', params.projectID);

    const queryString = urlParams.toString();

    try {
      // Try client contracts first (most common)
      return await apiClient.get(`/api/contracts/client${queryString ? `?${queryString}` : ''}`).then(r => r.data);
    } catch (error) {
      if (error.response?.status === 403) {
        try {
          // Fallback to freelancer contracts
          return await apiClient.get(`/api/contracts/freelancer${queryString ? `?${queryString}` : ''}`).then(r => r.data);
        } catch (freelancerError) {
          if (freelancerError.response?.status === 403) {
            // Superadmin fallback
            return await apiClient.get(`/api/contracts/all${queryString ? `?${queryString}` : ''}`).then(r => r.data);
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
  }
};
