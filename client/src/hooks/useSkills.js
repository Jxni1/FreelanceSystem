import { useState, useCallback } from 'react';
import { skillService } from '../lib/skillService';

export function useSkills() {
  const [skills, setSkills] = useState({ items: [], totalCount: 0, page: 1, pageSize: 10 });
  const [skill, setSkill] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSkills = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await skillService.getAll(params);
      setSkills(data);
    } catch (err) {
      console.error('Failed to fetch skills', err);
      setError(err?.response?.data || 'Failed to load skills.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSkillById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await skillService.getById(id);
      setSkill(data);
    } catch (err) {
      console.error('Failed to fetch skill', err);
      setError(err?.response?.data || 'Failed to load skill.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSkill = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const newSkill = await skillService.create(data);
      return newSkill;
    } catch (err) {
      console.error('Failed to create skill', err);
      setError(err?.response?.data || 'Failed to create skill.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSkill = async (id, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedSkill = await skillService.update(id, data);
      return updatedSkill;
    } catch (err) {
      console.error('Failed to update skill', err);
      setError(err?.response?.data || 'Failed to update skill.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSkill = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await skillService.delete(id);
      return true;
    } catch (err) {
      console.error('Failed to delete skill', err);
      setError(err?.response?.data || 'Failed to delete skill.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    skills,
    skill,
    isLoading,
    error,
    fetchSkills,
    fetchSkillById,
    createSkill,
    updateSkill,
    deleteSkill
  };
}