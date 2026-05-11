import { useState, useCallback } from 'react';
import { clientService } from '../lib/clientService';


export function useClients() {
  const [clients, setClients] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClients = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await clientService.getAll(params);
      setClients(data);
      return data;
    } catch (err) {
      const raw = err?.response?.data;
      const message =
        typeof raw === 'string'
          ? raw
          : raw?.message || 'Failed to load clients.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { clients, isLoading, error, fetchClients };
}