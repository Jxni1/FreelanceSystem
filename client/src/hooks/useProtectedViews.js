import { useState, useCallback } from 'react';
import { protectedViewService } from '../lib/protectedViewService';

export function useProtectedViews() {
  const [viewLogs, setViewLogs] = useState({ items: [], totalCount: 0, page: 1, pageSize: 20 });
  const [projectStats, setProjectStats] = useState(null);
  const [mostViewed, setMostViewed] = useState({ items: [], totalCount: 0, page: 1, pageSize: 20 });
  const [suspiciousActivity, setSuspiciousActivity] = useState({ items: [], totalCount: 0, page: 1, pageSize: 20 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const logView = useCallback(async (projectId) => {
    try {
      await protectedViewService.logView(projectId);
    } catch {}
  }, []);

  const fetchProjectViews = useCallback(async (projectId, params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await protectedViewService.getProjectViews(projectId, params);
      setViewLogs(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load view logs.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProjectStats = useCallback(async (projectId) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await protectedViewService.getProjectStats(projectId);
      setProjectStats(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load stats.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMostViewed = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await protectedViewService.getMostViewed(params);
      setMostViewed(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load most viewed projects.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSuspiciousActivity = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await protectedViewService.getSuspiciousActivity(params);
      setSuspiciousActivity(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load suspicious activity.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    viewLogs, projectStats, mostViewed, suspiciousActivity,
    isLoading, error,
    logView, fetchProjectViews, fetchProjectStats, fetchMostViewed, fetchSuspiciousActivity
  };
}