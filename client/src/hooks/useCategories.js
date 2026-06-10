import { useState, useCallback } from 'react';
import { categoryService } from '../lib/categoryService';

export function useCategories() {
  const [categories, setCategories] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getErrorMessage = (err, fallback) => {
    const raw = err?.response?.data;

    if (typeof raw === 'string') return raw;
    if (Array.isArray(raw) && raw.length > 0) return raw[0];
    if (raw?.message) return raw.message;
    if (raw?.error) return raw.error;

    return fallback;
  };

  const fetchCategories = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await categoryService.getAll(params);
      setCategories(data);
      return data;
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to load categories.');
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategoryById = useCallback(async (categoryId) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await categoryService.getById(categoryId);
      setSelectedCategory(data);
      return data;
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to load category.');
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (payload) => {
    setIsLoading(true);
    setError(null);

    try {
      const created = await categoryService.create(payload);

      setCategories((prev) => ({
        ...prev,
        items: [created, ...(prev.items || [])],
        totalCount: (prev.totalCount || 0) + 1,
      }));

      return created;
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to create category.');
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (categoryId, payload) => {
    setIsLoading(true);
    setError(null);

    try {
      const updated = await categoryService.update(categoryId, payload);

      setCategories((prev) => ({
        ...prev,
        items: (prev.items || []).map((category) =>
          category.categoryID === categoryId ? updated : category
        ),
      }));

      setSelectedCategory(updated);

      return updated;
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to update category.');
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId) => {
    setError(null);

    try {
      await categoryService.delete(categoryId);

      setCategories((prev) => ({
        ...prev,
        items: (prev.items || []).filter(
          (category) => category.categoryID !== categoryId
        ),
        totalCount: Math.max((prev.totalCount || 0) - 1, 0),
      }));

      setSelectedCategory((prev) =>
        prev?.categoryID === categoryId ? null : prev
      );
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to delete category.');
      setError(message);
      throw err;
    }
  }, []);

  const exportCategories = useCallback(async (params = {}, format = 'csv') => {
    try {
      return await categoryService.exportCategories(params, format);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to export categories.');
      setError(message);
      throw err;
    }
  }, []);

  const importCategories = useCallback(async (file, format = 'csv') => {
    setError(null);

    try {
      return await categoryService.importCategories(file, format);
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to import categories.');
      setError(message);
      throw err;
    }
  }, []);

  return {
    categories,
    category: selectedCategory,
    selectedCategory,
    isLoading,
    error,
    fetchCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    setSelectedCategory,
    exportCategories,
    importCategories,
  };
}