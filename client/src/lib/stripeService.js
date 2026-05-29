import { apiClient } from './apiClient';

export const stripeService = {
  async connectOnboard() {
    const result = await apiClient.post('/api/stripe/connect/onboard');
    return result.data;
  },

  async connectStatus() {
    const result = await apiClient.get('/api/stripe/connect/status');
    return result.data;
  },
};
