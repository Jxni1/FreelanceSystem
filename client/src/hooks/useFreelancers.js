import { useState, useCallback } from 'react';
import { freelancerService } from '../lib/freelancerService';

export function useFreelancers() {
  const [freelancers, setFreelancers] = useState({ items: [], totalCount: 0, page: 1, pageSize: 10 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFreelancers = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await freelancerService.getAll(params);
      setFreelancers(data);
      return data;
    } catch (err) {
      const raw = err?.response?.data;
      const message = typeof raw === 'string' ? raw : raw?.message || 'Failed to load freelancers.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { freelancers, isLoading, error, fetchFreelancers };
}
