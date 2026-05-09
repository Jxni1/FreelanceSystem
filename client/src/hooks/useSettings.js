import { useState, useCallback } from 'react';
import { settingService } from '../lib/settingService';

export function useSettings() {
  const [settings, setSettings] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10
  });

  const [setting, setSetting] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeSettingsPayload = (data, params = {}) => {
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

  const fetchSettings = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await settingService.getAll(params);
      setSettings(normalizeSettingsPayload(data, params));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        `Failed to load settings${err?.response?.status ? ` (${err.response.status})` : ''}.`
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSettingById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await settingService.getById(id);
      setSetting(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Failed to load setting.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSetting = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      return await settingService.create(data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Failed to create setting.'
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (id, data) => {
    setIsLoading(true);
    setError(null);

    try {
      return await settingService.update(id, data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Failed to update setting.'
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSetting = async (id) => {
    setIsLoading(true);
    setError(null);

    try {
      return await settingService.delete(id);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        'Failed to delete setting.'
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    setting,
    isLoading,
    error,
    fetchSettings,
    fetchSettingById,
    createSetting,
    updateSetting,
    deleteSetting
  };
}