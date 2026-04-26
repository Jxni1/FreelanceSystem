import { useState, useCallback } from 'react';
import { projectService } from '../lib/projectService';

export function useProjects() {
  const [projects, setProjects] = useState({ items: [], totalCount: 0, page: 1, pageSize: 10 });
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeProjectsPayload = (data, params = {}) => {
    const items = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
        ? data.items
        : [];

    return {
      items,
      totalCount: data?.totalCount ?? items.length,
      page: data?.page ?? params.page ?? 1,
      pageSize: data?.pageSize ?? params.pageSize ?? 10,
    };
  };

  const fetchProjects = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectService.getAll(params);
      setProjects(normalizeProjectsPayload(data, params));
    } catch (err) {
      console.error('Failed to fetch projects', err);
      setError(err?.response?.data || 'Failed to load projects.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProjectById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectService.getById(id);
      setProject(data);
    } catch (err) {
      console.error('Failed to fetch project', err);
      setError(err?.response?.data || 'Failed to load project.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const newProject = await projectService.create(data);
      return newProject;
    } catch (err) {
      console.error('Failed to create project', err);
      setError(err?.response?.data || 'Failed to create project.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (id, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedProject = await projectService.update(id, data);
      return updatedProject;
    } catch (err) {
      console.error('Failed to update project', err);
      setError(err?.response?.data || 'Failed to update project.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await projectService.delete(id);
      return true;
    } catch (err) {
      console.error('Failed to delete project', err);
      setError(err?.response?.data || 'Failed to delete project.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    projects,
    project,
    isLoading,
    error,
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject
  };
}
