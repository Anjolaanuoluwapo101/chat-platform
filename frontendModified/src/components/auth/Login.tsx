import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth';
import  Layout  from '../../layouts/Layout';
import {
  NavBarData,
  AuthCard,
  AuthHeader,
  FormInput,
  PasswordInput,
  SubmitButton,
  ErrorMessage,
  AuthLink
} from './AuthShared';

interface FormData {
  username: string;
  password: string;
}

interface Errors {
  username?: string;
  password?: string;
  general?: string;
}

const Login = () => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await authService.login(formData);

    if (result.success) {
      navigate(`/messages/${formData.username}`);
    } else {
      setErrors(result.errors);
    }

    setLoading(false);
  };

  return (
    <Layout navItems={NavBarData}>
      <AuthCard>
        <AuthHeader 
          title="Welcome Back" 
          subtitle="Log in to continue to your chat." 
        />

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <FormInput
            label="Username"
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={formData?.username}
            onChange={handleChange}
            placeholder="Enter your username"
            error={errors?.username ?? ''}
          />

          <PasswordInput
            label="Password"
            id="password"
            name="password"
            value={formData?.password}
            onChange={handleChange}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            showForgotPassword={true}
            error={errors?.password ?? ''}
          />

          <ErrorMessage message={errors?.general} />

          <SubmitButton 
            loading={loading} 
            loadingText="Logging in..." 
            text="Log In" 
          />

          <AuthLink 
            text="Don't have an account?" 
            linkText="Register here" 
            href="/register" 
          />
        </form>
      </AuthCard>
    </Layout>
  );
};

export default Login;