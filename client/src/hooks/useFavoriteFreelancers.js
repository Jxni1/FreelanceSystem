import { useCallback, useState } from 'react';
import { apiClient } from '../lib/apiClient';


export function useFavoriteFreelancers() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState(null);

  const fetchFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get('/api/favoritefreelancers/my');
      const data = response?.data;
      const items = data?.value || data?.items || data || [];

      setFavorites(Array.isArray(items) ? items : []);
    } catch (err) {
      const raw = err?.response?.data;
      const message =
        raw?.message ||
        raw?.error ||
        raw?.title ||
        (typeof raw === 'string' ? raw : 'Failed to load favorite freelancers.');

      setError(message);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addFavorite = useCallback(async (freelancerId) => {
    try {
      setIsToggling(true);
      setError(null);
      await apiClient.post(`/api/favoritefreelancers/${freelancerId}`);
      return { success: true };
    } catch (err) {
      const raw = err?.response?.data;
      const message =
        raw?.message ||
        raw?.error ||
        raw?.title ||
        (typeof raw === 'string' ? raw : 'Failed to add favorite.');

      setError(message);
      return { success: false, message };
    } finally {
      setIsToggling(false);
    }
  }, []);

  const removeFavorite = useCallback(async (freelancerId) => {
    try {
      setIsToggling(true);
      setError(null);
      await apiClient.delete(`/api/favoritefreelancers/${freelancerId}`);
      setFavorites((prev) =>
        prev.filter((item) => item.freelancerID !== freelancerId)
      );
      return { success: true };
    } catch (err) {
      const raw = err?.response?.data;
      const message =
        raw?.message ||
        raw?.error ||
        raw?.title ||
        (typeof raw === 'string' ? raw : 'Failed to remove favorite.');

      setError(message);
      return { success: false, message };
    } finally {
      setIsToggling(false);
    }
  }, []);

  return {
    favorites,
    isLoading,
    isToggling,
    error,
    fetchFavorites,
    addFavorite,
    removeFavorite,
  };
}