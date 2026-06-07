import { useState, useCallback } from 'react';
import { freelancerService } from '../lib/freelancerService';

export function useFreelancers() {
  const [freelancers, setFreelancers] = useState({ items: [], totalCount: 0, page: 1, pageSize: 10 });
  const [freelancer, setFreelancer] = useState(null);
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

  const fetchFreelancerById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await freelancerService.getById(id);
      const value = data?.value ?? data?.data ?? data;
      setFreelancer(value);
      return value;
    } catch (err) {
      const raw = err?.response?.data;
      const message = typeof raw === 'string' ? raw : raw?.message || 'Failed to load freelancer.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { freelancers, freelancer, isLoading, error, fetchFreelancers, fetchFreelancerById };
}
