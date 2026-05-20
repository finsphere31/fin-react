import axios from 'axios';
import { getToken, clearAuthStorage } from '../utils/auth.js';

const API_URL = import.meta.env.VITE_API_URL || '/api';

console.log('[API Service] Initializing with base URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('[API Request]', config.method?.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('[API Response]', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('[API Error]', {
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      message: error.message,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      console.warn('[API] Unauthorized, clearing auth and redirecting to login');
      clearAuthStorage();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
