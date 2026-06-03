import { apiClient } from './apiClient';

export const auditLogService = {
  async getAll(params = {}) {
    const urlParams = new URLSearchParams();

    if (params.page) urlParams.append('page', params.page);
    if (params.pageSize) urlParams.append('pageSize', params.pageSize);
    if (params.action) urlParams.append('action', params.action);
    if (params.entity) urlParams.append('entity', params.entity);
    if (params.from) urlParams.append('from', params.from);
    if (params.to) urlParams.append('to', params.to);

    const qs = urlParams.toString();
    const result = await apiClient.get(`/api/auditlogs${qs ? `?${qs}` : ''}`);
    return result.data;
  }
};