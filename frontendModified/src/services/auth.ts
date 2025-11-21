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
  csrf_token?: string;
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
  csrf_token?: string;
  user?: User;
  errors?: any;
}

class AuthService {
  private csrfToken: string | null = null;

  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post('/login', credentials);
      if (response.data.success) {
        // Store CSRF token and user data
        this.csrfToken = response.data.csrf_token;
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      }
      return { success: false, errors: response.data.errors };
    } catch (error) {
      return { success: false, errors: JSON.stringify(error) };
    }
  }

  // Register user
  async register(userData: RegisterData): Promise<RegisterResponse> {
    try {
      const response = await api.post('/register', userData);
      if (response.data.success) {
        // Store CSRF token and user data
        if (response.data.csrf_token) {
          this.csrfToken = response.data.csrf_token;
          sessionStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return { success: true, message: response.data.message };
      }
      return { success: false, errors: response.data.errors };
    } catch (error) {
      return { success: false, errors: { general: 'Registration failed' } };
    }
  }

  // Get CSRF Token (replaces getToken for API calls)
  getCsrfToken(): string | null {
    return this.csrfToken;
  }

  // Remove token and user data
  removeToken(): void {
    this.csrfToken = null;
    sessionStorage.removeItem('csrf_token');
    sessionStorage.removeItem('user');
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
      this.csrfToken = null;
      sessionStorage.removeItem('user');
      PushNotificationService.logout();
      // Clear all cache on logout
      cacheManager.clear();
      window.location.href = '/login';
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('user');
  }

}

export default new AuthService();