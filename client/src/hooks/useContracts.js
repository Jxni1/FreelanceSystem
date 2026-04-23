import { useState, useCallback } from 'react';
import { contractService } from '../lib/contractService';

export function useContracts() {
  const [contracts, setContracts] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10
  });
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContracts = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await contractService.getAll(params);
      setContracts({
        ...data,
        page: params.page || 1,
        pageSize: params.pageSize || 10
      });
    } catch (err) {
      console.error('Failed to fetch contracts', err);
      setError(err?.response?.data?.message || err?.response?.data || 'Failed to load contracts.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchContractById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await contractService.getById(id);
      setContract(data);
    } catch (err) {
      console.error('Failed to fetch contract', err);
      setError(err?.response?.data?.message || err?.response?.data || 'Failed to load contract.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createContract = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const newContract = await contractService.create(data);
      return newContract;
    } catch (err) {
      console.error('Failed to create contract', err);
      setError(err?.response?.data?.message || err?.response?.data || 'Failed to create contract.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateContract = async (id, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedContract = await contractService.update(id, data);
      return updatedContract;
    } catch (err) {
      console.error('Failed to update contract', err);
      setError(err?.response?.data?.message || err?.response?.data || 'Failed to update contract.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContract = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await contractService.delete(id);
      return true;
    } catch (err) {
      console.error('Failed to delete contract', err);
      setError(err?.response?.data?.message || err?.response?.data || 'Failed to delete contract.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    contracts,
    contract,
    isLoading,
    error,
    fetchContracts,
    fetchContractById,
    createContract,
    updateContract,
    deleteContract
  };
}
