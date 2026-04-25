// src/hooks/useMilestones.js
import { useState, useCallback } from 'react';
import { milestoneService } from '../lib/milestoneService';

export function useMilestones() {
  const [milestones, setMilestones] = useState([]);
  const [milestone, setMilestone]   = useState(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState(null);

  const fetchMilestonesByContract = useCallback(async (contractId) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await milestoneService.getByContract(contractId);
      const normalizedMilestones = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : [];
      setMilestones(normalizedMilestones);
      return normalizedMilestones;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch milestones');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMilestoneById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await milestoneService.getById(id);
      setMilestone(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch milestone');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createMilestone = useCallback(async (milestoneData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await milestoneService.create(milestoneData);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create milestone';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateMilestone = useCallback(async (id, milestoneData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await milestoneService.update(id, milestoneData);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update milestone';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeMilestone = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await milestoneService.complete(id);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to complete milestone';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteMilestone = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await milestoneService.delete(id);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete milestone';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    milestones,
    milestone,
    isLoading,
    error,
    fetchMilestonesByContract,
    fetchMilestoneById,
    createMilestone,
    updateMilestone,
    completeMilestone,
    deleteMilestone,
  };
}
