import { useState, useCallback } from 'react';
import { proposalService } from '../lib/proposalService';

function extractMessage(err) {
  const raw = err?.response?.data;
  if (typeof raw === 'string') return raw;
  if (raw?.message) return raw.message;
  if (Array.isArray(raw)) return raw.join(' ');
  return 'Something went wrong.';
}

export function useProposals() {
  const [proposals, setProposals] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProposals = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await proposalService.getAll(params);
      const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      const result = {
        items,
        totalCount: data?.totalCount ?? items.length,
        page: data?.page ?? params.page ?? 1,
        pageSize: data?.pageSize ?? params.pageSize ?? 10,
      };
      setProposals(result);
      return result;
    } catch (err) {
      setError(extractMessage(err));
      return { items: [], totalCount: 0, page: 1, pageSize: 10 };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProposal = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await proposalService.create(data);
      return { success: true, data: result };
    } catch (err) {
      const message = extractMessage(err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acceptProposal = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await proposalService.accept(id);
      return { success: true, data };
    } catch (err) {
      const message = extractMessage(err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rejectProposal = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await proposalService.reject(id);
      return { success: true, data };
    } catch (err) {
      const message = extractMessage(err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProposal = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await proposalService.delete(id);
      return { success: true };
    } catch (err) {
      const message = extractMessage(err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportProposals = useCallback(async (params = {}, format = 'csv') => {
    try {
      return await proposalService.exportProposals(params, format);
    } catch (err) {
      setError(extractMessage(err));
      throw err;
    }
  }, []);

  const importProposals = useCallback(async (file, format = 'csv') => {
    try {
      setError(null);
      return await proposalService.importProposals(file, format);
    } catch (err) {
      const message = extractMessage(err);
      setError(message);
      throw err;
    }
  }, []);

  return {
    proposals,
    isLoading,
    error,
    fetchProposals,
    createProposal,
    acceptProposal,
    rejectProposal,
    deleteProposal,
    exportProposals,
    importProposals,
  };
}