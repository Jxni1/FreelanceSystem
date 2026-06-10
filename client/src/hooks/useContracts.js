import { useState, useCallback } from 'react';
import { contractService } from '../lib/contractService';

export function useContracts() {
  const [contracts, setContracts] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
  });
  const [selectedContract, setSelectedContract] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeContract = useCallback((item = {}) => ({
    ...item,
    contractID: item.contractID ?? item.contractId ?? item.ContractID,
    description: item.description ?? item.Description,
    clientID: item.clientID ?? item.clientId ?? item.ClientID,
    clientName: item.clientName ?? item.client_name ?? item.ClientName,
    freelancerID: item.freelancerID ?? item.freelancerId ?? item.FreelancerID,
    freelancerName: item.freelancerName ?? item.freelancer_name ?? item.FreelancerName,
    projectID: item.projectID ?? item.projectId ?? item.ProjectID,
    projectTitle: item.projectTitle ?? item.project_title ?? item.ProjectTitle,
    proposalID: item.proposalID ?? item.proposalId ?? item.ProposalID,
    agreedPrice: item.agreedPrice ?? item.agreed_Price ?? item.Agreed_Price ?? item.agreed_price,
    start_Date: item.start_Date ?? item.startDate ?? item.Start_Date,
    end_Date: item.end_Date ?? item.endDate ?? item.End_Date,
    status: item.status ?? item.Status,
  }), []);

  const normalizeContractsPayload = useCallback((data, params = {}) => {
    const rawItems = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : [];

    const items = rawItems.map(normalizeContract);

    return {
      items,
      totalCount: data?.totalCount ?? items.length,
      page: data?.page ?? params.page ?? 1,
      pageSize: data?.pageSize ?? params.pageSize ?? 10,
    };
  }, [normalizeContract]);

  const getErrorMessage = useCallback((err, fallback) => {
    const raw = err?.response?.data;
    return typeof raw === 'string' ? raw : raw?.message || fallback;
  }, []);

  const fetchContracts = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await contractService.getAll(params);
      const normalized = normalizeContractsPayload(data, params);
      setContracts(normalized);
      return normalized;
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to load contracts.');
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [normalizeContractsPayload, getErrorMessage]);

  const fetchContractById = useCallback(async (contractId) => {
    setIsDetailsLoading(true);
    setError(null);
    try {
      const data = await contractService.getById(contractId);
      const normalized = normalizeContract(data);
      setSelectedContract(normalized);
      return normalized;
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to load contract details.');
      setError(message);
      throw err;
    } finally {
      setIsDetailsLoading(false);
    }
  }, [normalizeContract, getErrorMessage]);

  const createContract = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const newContract = await contractService.create(data);
      return normalizeContract(newContract);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to create contract.');
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [normalizeContract, getErrorMessage]);

  const updateContract = useCallback(async (id, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await contractService.update(id, data);
      return normalizeContract(updated);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to update contract.');
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [normalizeContract, getErrorMessage]);

  const deleteContract = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await contractService.delete(id);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to delete contract.');
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getErrorMessage]);

  const exportContracts = useCallback(async (params = {}) => {
    try {
      return await contractService.exportContracts(params);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to export contracts.');
      setError(message);
      throw err;
    }
  }, [getErrorMessage]);

  const importContracts = useCallback(async (file, format = 'csv') => {
    try {
      return await contractService.importContracts(file, format);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to import contracts.');
      setError(message);
      throw err;
    }
  }, [getErrorMessage]);

  return {
    contracts,
    selectedContract,
    isLoading,
    isDetailsLoading,
    error,
    fetchContracts,
    fetchContractById,
    createContract,
    updateContract,
    deleteContract,
    exportContracts,
    importContracts,
  };
}