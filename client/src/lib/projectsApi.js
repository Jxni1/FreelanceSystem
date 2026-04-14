import { apiClient } from './apiClient';
import axios from 'axios';

const BASE = '/api/projects';

export const categoriesApi = {
  getAll: () => axios.get(`${import.meta.env.VITE_API_URL}/api/categories`),
  create: (data) => apiClient.post('/api/categories', data),
};

export const clientsApi = {
  getMe: () => apiClient.get('/api/clients/me'),
};

export const projectsApi = {
  getAll: () => apiClient.get(BASE),
  getById: (id) => apiClient.get(`${BASE}/${id}`),
  getByClient: (clientId) => apiClient.get(`${BASE}/client/${clientId}`),
  getByCategory: (categoryId) => apiClient.get(`${BASE}/category/${categoryId}`),
  create: (data) => apiClient.post(BASE, data),
  update: (id, data) => apiClient.put(`${BASE}/${id}`, data),
  remove: (id) => apiClient.delete(`${BASE}/${id}`),
};
