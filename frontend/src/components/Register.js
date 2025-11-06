import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setMessage('');

    const result = await authService.register(formData);

    if (result.success) {
      setMessage(result.message);
      // If token was provided, user is logged in immediately
      if (authService.isAuthenticated()) {
        setTimeout(() => navigate('/login'), 2000);
      }
    } else {
      setErrors(result.errors);
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            minLength="5"
          />
          {errors.username && <span className="error">{errors.username}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="5"
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>

        {errors.general && <div className="error general">{errors.general}</div>}
        {message && <div className="success">{message}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p>
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
};

export default Register;
