import { apiClient } from './apiClient';

export const milestoneService = {
  async getByContract(contractId) {
    const result = await apiClient.get(`/api/milestones/contract/${contractId}`);
    return result.data;
  },

  async getById(id) {
    const result = await apiClient.get(`/api/milestones/${id}`);
    return result.data;
  },

  async create(data) {
    const result = await apiClient.post('/api/milestones', data);
    return result.data;
  },

  async update(id, data) {
    const result = await apiClient.put(`/api/milestones/${id}`, data);
    return result.data;
  },

  async fund(id, data) {
    const result = await apiClient.post(`/api/milestones/${id}/fund`, data);
    return result.data;
  },

  async submit(id, data) {
    const result = await apiClient.post(`/api/milestones/${id}/submit`, data);
    return result.data;
  },

  async approve(id) {
    const result = await apiClient.patch(`/api/milestones/${id}/approve`);
    return result.data;
  },

  async reject(id, reason) {
    const result = await apiClient.patch(`/api/milestones/${id}/reject`, { reason });
    return result.data;
  },

  async delete(id) {
    const result = await apiClient.delete(`/api/milestones/${id}`);
    return result.data;
  },
};
