// src/lib/milestoneService.js
import { apiClient } from './apiClient';

export const milestoneService = {
  // GET /api/milestones/contract/{contractId}
  async getByContract(contractId) {
    const result = await apiClient.get(`/api/milestones/contract/${contractId}`);
    return result.data;
  },

  async getById(id) {
    const result = await apiClient.get(`/api/milestones/${id}`);
    return result.data;
  },

  // matches CreateMilestoneRequest: { Title, Description, Amount, DueDate, ContractID }
  async create(data) {
    const result = await apiClient.post('/api/milestones', data);
    return result.data;
  },

  async update(id, data) {
    const result = await apiClient.put(`/api/milestones/${id}`, data);
    return result.data;
  },

  async complete(id) {
    const result = await apiClient.patch(`/api/milestones/${id}/complete`);
    return result.data;
  },

  async delete(id) {
    const result = await apiClient.delete(`/api/milestones/${id}`);
    return result.data;
  },
};
