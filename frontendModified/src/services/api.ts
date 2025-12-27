import axios from 'axios';
import authService from './auth';
import cacheManager from './cacheManager';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // This ensures cookies are included in requests
  headers: {
    'Content-Type': 'application/json'
  },
});

// Request interceptor to handle caching
api.interceptors.request.use(
  (config: any) => {
    // Check cache for GET requests
    const method = config.method?.toLowerCase();
    if (method === 'get' && config.cache !== false) {
      const cacheKey = cacheManager.generateKey(method, config.url, config.params);
      if (cacheManager.isValid(cacheKey)) {
        // Return cached response
        return Promise.reject({ cached: true, data: cacheManager.get(cacheKey) });
      }
    }
    
    // No need for Authorization header - session cookie handles auth
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration and caching
api.interceptors.response.use(
  (response) => {
    // Store cache for GET requests
    const method = response.config.method?.toLowerCase();
    if (method === 'get' && (response.config as any).cache !== false) {
      const cacheKey = cacheManager.generateKey(method, response.config.url || '', response.config.params);
      const expiry = (response.config as any).cacheExpiry || 300000; // Default 5 minutes
      cacheManager.set(cacheKey, response.data, expiry);
    }
    
    // Update cache for mutating requests
    if (method && ['post', 'put', 'delete', 'patch'].includes(method)) {
      cacheManager.updateRelated(method, response.config.url || '', response.data);
    }
    
    return response;
  },
  (error) => {
    // Handle cached responses
    if (error.cached) {
      return Promise.resolve({ data: error.data, status: 200, statusText: 'OK' });
    }
    const isLoginPage = window.location.pathname === '/login';
    const isRegisterPage = window.location.pathname === '/register';
    if (error.response?.status === 401 && !isLoginPage && !isRegisterPage) {
      // Session expired or invalid, clear storage and redirect to login
      authService.removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;