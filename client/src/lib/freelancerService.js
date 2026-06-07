import { apiClient } from './apiClient';

export const freelancerService = {
  async getAll(params = {}) {
    const urlParams = new URLSearchParams();
    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    if (params.search) urlParams.append('search', params.search);
    if (params.skill) urlParams.append('skill', params.skill);
    if (params.experienceLevel) urlParams.append('experienceLevel', params.experienceLevel);

    const qs = urlParams.toString();
    const result = await apiClient.get(`/api/freelancers${qs ? `?${qs}` : ''}`);
    return result.data;
  },

  async getById(id) {
    const result = await apiClient.get(`/api/freelancers/${id}`);
    return result.data;
  },
};
