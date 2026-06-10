import { useState, useCallback } from 'react';
import { projectService } from '../lib/projectService';

export function useProjects() {
  const [projects, setProjects] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
  });

  const [myProjects, setMyProjects] = useState({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
  });

  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMyProjectsLoading, setIsMyProjectsLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeProjectsPayload = (data, params = {}) => {
    const source =
      Array.isArray(data)
        ? { items: data }
        : Array.isArray(data?.items)
          ? data
          : Array.isArray(data?.data)
            ? { items: data.data, totalCount: data?.totalCount ?? data.data.length }
            : Array.isArray(data?.data?.items)
              ? data.data
              : { items: [] };

    const items = Array.isArray(source.items) ? source.items : [];

    return {
      items,
      totalCount: source?.totalCount ?? source?.count ?? items.length,
      page: source?.page ?? params.page ?? 1,
      pageSize: source?.pageSize ?? params.pageSize ?? 10,
    };
  };

  const fetchProjects = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectService.getAll(params);
      setProjects(normalizeProjectsPayload(data, params));
      return data;
    } catch (err) {
      console.error('Failed to fetch projects', err);
      setError(err?.response?.data || 'Failed to load projects.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMyProjects = useCallback(async (params = {}) => {
    setIsMyProjectsLoading(true);
    setError(null);
    try {
      const data = await projectService.getMyProjects(params);
      setMyProjects(normalizeProjectsPayload(data, params));
      return data;
    } catch (err) {
      console.error('Failed to fetch my projects', err);
      setError(err?.response?.data || 'Failed to load my projects.');
      throw err;
    } finally {
      setIsMyProjectsLoading(false);
    }
  }, []);

  const fetchProjectById = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectService.getById(id);
      setProject(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch project', err);
      setError(err?.response?.data || 'Failed to load project.');
      throw err;
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
    myProjects,
    project,
    isLoading,
    isMyProjectsLoading,
    error,
    fetchProjects,
    fetchMyProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
  };
}

export default useProjects;