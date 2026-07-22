import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from localStorage as a fallback for environments where
// cross-site cookies are blocked (e.g. some mobile webviews)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shopnest_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handling - redirect to login when session expires
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('shopnest_token');
      localStorage.removeItem('shopnest_user');
    }
    return Promise.reject(error);
  }
);

export default api;
