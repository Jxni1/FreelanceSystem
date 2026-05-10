import { useState, useCallback } from 'react';
import { reviewService } from '../lib/reviewService';

export function useReviews() {
  const [reviews, setReviews] = useState({ items: [], totalCount: 0, page: 1, pageSize: 10 });
  const [review, setReview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reviewService.getAll(params);
      setReviews(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load reviews.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchReviewById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reviewService.getById(id);
      setReview(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to load review.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createReview = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      return await reviewService.create(data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create review.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateReview = async (id, data) => {
    setIsLoading(true);
    setError(null);
    try {
      return await reviewService.update(id, data);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update review.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReview = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await reviewService.delete(id);
      return true;
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to delete review.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reviews, review, isLoading, error,
    fetchReviews, fetchReviewById, createReview, updateReview, deleteReview,
  };
}