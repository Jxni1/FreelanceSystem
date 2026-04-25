// src/hooks/useDeliverables.js
import { useState, useCallback } from 'react';
import { deliverableService } from '../lib/deliverableService'; // was missing

export function useDeliverables() {
  const [deliverables, setDeliverables] = useState([]);
  const [deliverable, setDeliverable]   = useState(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [error, setError]               = useState(null);



const fetchDeliverablesByMilestone = useCallback(async (milestoneId) => {
  setIsLoading(true);
  setError(null);
  try {
    const data = await deliverableService.getByMilestone(milestoneId);
    setDeliverables(data);
    return data; 
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to fetch deliverables');
  } finally {
    setIsLoading(false);
  }
}, []);

  const fetchDeliverableById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await deliverableService.getById(id);
      setDeliverable(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch deliverable');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitDeliverable = useCallback(async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await deliverableService.submit(formData);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to submit deliverable';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const approveDeliverable = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await deliverableService.approve(id);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to approve deliverable';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rejectDeliverable = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await deliverableService.reject(id);
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reject deliverable';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDeliverable = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await deliverableService.delete(id);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete deliverable';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    deliverables,
    deliverable,
    isLoading,
    error,
    fetchDeliverablesByMilestone,
    fetchDeliverableById,
    submitDeliverable,
    approveDeliverable,
    rejectDeliverable,
    deleteDeliverable,
  };
}
