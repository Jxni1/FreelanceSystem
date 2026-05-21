import { useState, useCallback } from 'react';
import { userService } from '../lib/userService';

export function useUsers() {
  const [users, setUsers] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10
  });

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeUsersPayload = (data, params = {}) => {
    const payload = data?.value ?? data?.data ?? data;

    const items = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.items)
        ? payload.items
        : [];

    return {
      items,
      totalCount: payload?.totalCount ?? items.length,
      page: payload?.page ?? params.page ?? 1,
      pageSize: payload?.pageSize ?? params.pageSize ?? 10
    };
  };

  const fetchUsers = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await userService.getAll(params);
      setUsers(normalizeUsersPayload(data, params));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        `Failed to load users${err?.response?.status ? ` (${err.response.status})` : ''}.`
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      return await userService.create(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Failed to create user.'
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (id, data) => {
    setIsLoading(true);
    setError(null);

    try {
      return await userService.update(id, data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Failed to update user.'
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      return await userService.delete(id);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Failed to delete user.'
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const exportUsers = async (params = {}, format = 'csv') => {
    setIsLoading(true);
    setError(null);

    try {
      return await userService.exportUsers(params, format);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Failed to export users.'
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const importUsers = async (file, format = 'csv') => {
    setIsLoading(true);
    setError(null);

    try {
      return await userService.importUsers(file, format);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Failed to import users.'
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    user,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    exportUsers,
    importUsers
  };
}