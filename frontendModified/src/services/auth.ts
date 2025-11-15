import api from './api';

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
  token?: string;
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
  token?: string;
  user?: User;
  errors?: any;
}

class AuthService {
  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post('/login', credentials);
      if (response.data.success) {
        // Store JWT token and user data
        localStorage.setItem('jwt_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
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
        // If token is provided, store it (for immediate login after registration)
        if (response.data.token) {
          localStorage.setItem('jwt_token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return { success: true, message: response.data.message };
      }
      return { success: false, errors: response.data.errors };
    } catch (error) {
      return { success: false, errors: { general: 'Registration failed' } };
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // Get current user
  getCurrentUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('jwt_token');
  }

  // Get JWT token
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }
}

export default new AuthService();