import { useState, useCallback } from 'react';
import { auditLogService } from '../lib/auditLogService';

export function useAuditLogs() {
  const [logs, setLogs] = useState({ items: [], totalCount: 0, page: 1, pageSize: 20 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await auditLogService.getAll(params);
      const payload = data?.value ?? data?.data ?? data;
      const items = Array.isArray(payload?.items) ? payload.items : [];
      setLogs({
        items,
        totalCount: payload?.totalCount ?? items.length,
        page: payload?.page ?? params.page ?? 1,
        pageSize: payload?.pageSize ?? params.pageSize ?? 20
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        'Failed to load audit logs.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { logs, isLoading, error, fetchLogs };
}