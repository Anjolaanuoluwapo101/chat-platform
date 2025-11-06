import api from './api';

class AuthService {
  // Login user
  async login(credentials) {
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
  async register(userData) {
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
  logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('jwt_token');
  }

  // Get JWT token
  getToken() {
    return localStorage.getItem('jwt_token');
  }
}

export default new AuthService();
