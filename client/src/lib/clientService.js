import { apiClient } from "./apiClient";


export const clientService = {
  async getAll(params = {}) {
    const urlParams = new URLSearchParams();
    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    if (params.search) urlParams.append('search', params.search);
    if (params.industry) urlParams.append('industry', params.industry);

    const qs = urlParams.toString();
    const result = await apiClient.get(`/api/clients${qs ? `?${qs}` : ''}`);
    return result.data;
  },

  async getById(id) {
    const result = await apiClient.get(`/api/clients/${id}`);
    return result.data;
  },
};