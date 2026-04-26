import axios from 'axios';

let _accessToken = null;
let _refreshTokens = null;

export function configureApiClient(accessToken, refreshTokensFn) {
  _accessToken = accessToken;
  _refreshTokens = refreshTokensFn;
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.request.use(config => {
  if (_accessToken) {
    config.headers['Authorization'] = `Bearer ${_accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retried) {
      return Promise.reject(error);
    }

    original._retried = true;
    const data = error.response.data;

    if (data?.isTheftDetected) {
      window.dispatchEvent(new CustomEvent('auth:theft-detected'));
      return Promise.reject(error);
    }

    if (data?.isDeactivated) {
      window.dispatchEvent(new CustomEvent('auth:deactivated'));
      return Promise.reject(error);
    }

    if (_refreshTokens) {
      const newToken = await _refreshTokens();
      if (newToken) {
        _accessToken = newToken;
        original.headers['Authorization'] = `Bearer ${newToken}`;
        return apiClient(original);
      }
    }

    return Promise.reject(error);
  }
);
