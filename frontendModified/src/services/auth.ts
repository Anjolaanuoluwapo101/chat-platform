import api from './api';
import PushNotificationService from './notifications';
import cacheManager from './cacheManager';

interface LoginCredentials {
  username: string;
  password: string;
}

interface User {
  id: number;
  username: string;
  email: string;
}

interface LoginResponse {
  success: boolean;
  user?: User;
  errors?: any;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
  user?: User;
  errors?: any;
}

class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post('/login', credentials);
      // Handle response data
      if (response.data.success) {
        // Handle successful login
        // Store user data in session storage
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
        // store isAuthenticated in session storage with the time(seconds) it was stored
        sessionStorage.setItem('isAuthenticated', String(Date.now() / 1000));
  
      }
      return response.data;
    } catch (error) {
      return { success: false, errors: { general: 'Login failed' } };
    }
  }

  // Register user
  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      return { success: false, errors: { general: 'Registration failed' } };
    }
  }

  // Remove token and user data
  removeToken(): void {
    // No need to manage tokens as session is handled via cookies
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint to clear session
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local data regardless of API call success
      PushNotificationService.logout();
      // Clear all cache on logout
      cacheManager.clear();
      window.location.href = '/login';
    }
  }

  // Check if user is authenticated by calling backend
  isAuthenticated() {
    try {
      // Check if any user data is stored in session storage
      if (!sessionStorage.getItem('user')) {
        //  Store current url
        sessionStorage.setItem('redirectUrl', window.location.href);
        return false;
      }
      // Check time of previous authentication and if not more than 10 minutes ago
      const isAuthenticated = sessionStorage.getItem('isAuthenticated');
      if (isAuthenticated && (Date.now() / 1000 - parseFloat(isAuthenticated)) > 3600) {
        // clear session storage
        sessionStorage.clear();
        this.logout().then(() => {
          sessionStorage.setItem('redirectUrl', window.location.href);
          return false;
        })
      }else{
        return true;
      }
      // // Call backend to check if user is authenticated
      // const response = await api.get('/auth/validate');
      // // Handle response data
      // if (response.data.success) {
      //   return true;
      // } else {
      //   // redirect to login page
      //   window.location.href = '/login';
      // }
    } catch (error) {
      console.error('Auth validation error:', error);
      return false;
    }
  }

  // Get current user data from backend
  getCurrentUser() {
    try {
      if (this.isAuthenticated()) {
        return JSON.parse(sessionStorage.getItem('user') || '{}');
      }else{
        return null;
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }
}

export default new AuthService();
