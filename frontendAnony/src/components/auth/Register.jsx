import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth';
import Layout from '../../layouts/Layout';
import {
  NavBarData,
  AuthCard,
  AuthHeader,
  FormInput,
  PasswordInput,
  SubmitButton,
  ErrorMessage,
  SuccessMessage,
  AuthLink
} from './AuthShared';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    general: ''
  });
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
    <Layout navItems={NavBarData}>
      <AuthCard>
        <AuthHeader 
          title="Create Account" 
          subtitle="Join us and start chatting anonymously" 
        />

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <FormInput
            label="Username"
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            minLength="5"
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username"
            error={errors.username ?? ''}
          />

          <FormInput
            label="Email Address"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            error={errors.email ?? '' }
          />

          <PasswordInput
            label="Password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            minLength="5"
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            error={errors.password ?? ''}
          />

          <ErrorMessage message={errors.general} />
          <SuccessMessage message={message} />

          <SubmitButton 
            loading={loading} 
            loadingText="Creating Account..." 
            text="Create Account" 
          />

          <AuthLink 
            text="Already have an account?" 
            linkText="Login here" 
            href="/login" 
          />
        </form>
      </AuthCard>
    </Layout>
  );
};

export default Register;
