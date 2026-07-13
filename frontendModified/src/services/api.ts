import axios from 'axios';
import authService from './auth';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // This ensures cookies are included in requests
  headers: {
    'Content-Type': 'application/json'
  },
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginPage = window.location.pathname === '/login';
    const isRegisterPage = window.location.pathname === '/register';
    if (error.response?.status === 401 && !isLoginPage && !isRegisterPage) {
      // Session expired or invalid, clear storage and redirect to login
      // Store the current URL for redirect after login
      const currentUrl = window.location.href;
      // Don't store login or register URLs
      if (!currentUrl.includes('/login') && !currentUrl.includes('/register')) {
        sessionStorage.setItem('redirectURI', currentUrl);
      }
      authService.removeToken();
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;