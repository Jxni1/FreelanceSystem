import { useState, useCallback } from 'react';
import { categoryService } from '../lib/categoryService';

export function useCategories() {
  const [categories, setCategories] = useState({ items: [], totalCount: 0, page: 1, pageSize: 10 });
  const [category, setCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoryService.getAll(params);
      setCategories(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCategoryById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoryService.getById(id);
      setCategory(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load category.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCategory = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      return await categoryService.create(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create category.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (id, data) => {
    setIsLoading(true);
    setError(null);
    try {
      return await categoryService.update(id, data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update category.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await categoryService.delete(id);
      return true;
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete category.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    categories, category, isLoading, error,
    fetchCategories, fetchCategoryById, createCategory, updateCategory, deleteCategory
  };
}