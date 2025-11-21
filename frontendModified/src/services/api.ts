import axios from 'axios';
import authService from './auth';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
});

// Request interceptor to add CSRF token to headers
api.interceptors.request.use(
  (config) => {
    // Add CSRF token for state-changing requests
    const method = config.method?.toLowerCase();
    if (method && ['post', 'put', 'delete', 'patch'].includes(method)) {
      const csrfToken = authService.getCsrfToken();
      if (csrfToken && config.headers) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    // No need for Authorization header - session cookie handles auth
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and CSRF errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Session expired or invalid, clear storage and redirect to login
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    // Handle CSRF token errors
    if (error.response?.status === 403 && error.response?.data?.error === 'csrf_invalid') {
      alert('Session expired. Please login again.');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;