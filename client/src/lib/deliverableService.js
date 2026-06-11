import { apiClient } from './apiClient';

export const deliverableService = {
  async getByMilestone(milestoneId) {
    const result = await apiClient.get(`/api/deliverables/milestone/${milestoneId}`);
    return result.data;
  },

  async getById(id) {
    const result = await apiClient.get(`/api/deliverables/${id}`);
    return result.data;
  },

  async submit(data) {
    const result = await apiClient.post('/api/deliverables', data);
    return result.data;
  },

  async approve(id) {
    const result = await apiClient.patch(`/api/deliverables/${id}/approve`);
    return result.data;
  },

  async reject(id, reason) {
    const result = await apiClient.patch(`/api/deliverables/${id}/reject`, { reason });
    return result.data;
  },

  async delete(id) {
    const result = await apiClient.delete(`/api/deliverables/${id}`);
    return result.data;
  },
};
