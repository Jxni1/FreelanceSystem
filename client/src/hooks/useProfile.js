import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';

export function useProfile() {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setProfile(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/api/auth/me');
      setProfile(response.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
      setError(err?.response?.data?.message || 'Failed to load profile data.');
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    refresh: fetchProfile
  };
}
