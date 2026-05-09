import { apiClient } from './apiClient';

export const reviewService = {
  async create(data) {
    const result = await apiClient.post('/api/reviews', data);
    return result.data;
  },
};
