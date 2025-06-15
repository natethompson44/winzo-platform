import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/axios';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import winzoLogo from '../assets/winzo-logo.png';
import { 
  UserIcon, 
  LockIcon, 
  LoadingIcon,
  SuccessIcon,
  WarningIcon,
  InfoIcon
} from './icons/IconLibrary';
import './Auth.css';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formValid, setFormValid] = useState(false);
  const navigate = useNavigate();

  // Enhanced form validation
  useEffect(() => {
    setFormValid(username.trim().length > 0 && password.length > 0);
  }, [username, password]);

  // Enhanced API connection test with luxury feedback
  const testApiConnectionHandler = async () => {
    try {
      console.log('🧪 Testing API connection...');
      console.log('🔗 API Base URL:', API_CONFIG.BASE_URL);
      console.log('🔗 Login Endpoint:', API_ENDPOINTS.LOGIN);
      console.log('🔗 Full URL:', `${API_CONFIG.BASE_URL}${API_ENDPOINTS.LOGIN}`);
      
      // Test direct fetch to health endpoint
      console.log('🔗 Testing direct fetch to health endpoint...');
      const healthResponse = await fetch(`${API_CONFIG.BASE_URL}/health`);
      console.log('✅ Direct health check response:', await healthResponse.text());
      
      // Test axios client
      console.log('🔗 Testing axios client...');
      const response = await apiClient.get('/health');
      console.log('✅ Axios health check response:', response.data);
      
      setError('API connection successful! Check console for details.');
    } catch (error: any) {
      console.error('❌ API connection failed:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);
      console.error('Request URL:', error.config?.url);
      console.error('Request method:', error.config?.method);
      setError(`API connection failed: ${error.message}`);
    }
  };

  // Enhanced form submission with luxury animations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔐 Attempting login with:', { username });
      console.log('🔗 Making request to:', `${API_CONFIG.BASE_URL}${API_ENDPOINTS.LOGIN}`);
      
      const ok = await login(username, password);
      if (ok) {
        setError('');
        setSuccess(true);
        // Enhanced success animation delay
        setTimeout(() => navigate('/dashboard'), 1200);
      } else {
        setSuccess(false);
        setError('Invalid credentials. Please check your username and password.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced input focus handlers
  const handleInputFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleInputBlur = () => {
    setFocusedField(null);
  };

  // Enhanced password toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container luxury-auth-container">
      <div className="auth-background luxury-auth-background">
        <div className="auth-background-overlay luxury-auth-background-overlay"></div>
      </div>
      
      <div className="auth-content luxury-auth-content luxury-fade-in">
        <div className="auth-logo-container luxury-auth-logo-container">
          <img src={winzoLogo} alt="WINZO" className="auth-logo luxury-auth-logo" />
          <div className="auth-logo-glow luxury-auth-logo-glow"></div>
        </div>
        
        <div className="auth-header luxury-auth-header">
          <h1 className="auth-title luxury-auth-title">Access</h1>
          <p className="auth-subtitle luxury-auth-subtitle">Member Portal</p>
        </div>

        {error && (
          <div className="error luxury-error luxury-slide-up">
            <WarningIcon size="sm" color="danger" className="error-icon" />
            <span className="error-text">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="success-msg luxury-success luxury-scale-in">
            <SuccessIcon size="sm" color="success" className="success-icon" />
            <span className="success-text">Access Granted</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={`auth-form luxury-auth-form ${success ? 'success' : ''} ${isLoading ? 'loading' : ''}`}>
          <div className="input-group luxury-input-group">
            <div className={`input-wrapper luxury-input-wrapper ${focusedField === 'username' ? 'focused' : ''} ${username ? 'has-value' : ''}`}>
              <UserIcon 
                size="sm" 
                color={focusedField === 'username' ? 'secondary' : 'neutral'} 
                className="input-icon luxury-input-icon" 
              />
              <input
                className="winzo-input luxury-input"
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onFocus={() => handleInputFocus('username')}
                onBlur={handleInputBlur}
                required
                disabled={isLoading}
                autoComplete="username"
              />
              <div className="input-border luxury-input-border"></div>
            </div>
          </div>

          <div className="input-group luxury-input-group">
            <div className={`input-wrapper luxury-input-wrapper ${focusedField === 'password' ? 'focused' : ''} ${password ? 'has-value' : ''}`}>
              <LockIcon 
                size="sm" 
                color={focusedField === 'password' ? 'secondary' : 'neutral'} 
                className="input-icon luxury-input-icon" 
              />
              <input
                className="winzo-input luxury-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => handleInputFocus('password')}
                onBlur={handleInputBlur}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle luxury-password-toggle"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <InfoIcon size="sm" color="neutral" />
              </button>
              <div className="input-border luxury-input-border"></div>
            </div>
          </div>

          <button 
            type="submit" 
            className={`winzo-btn winzo-btn-primary luxury-btn luxury-btn-primary ${!formValid ? 'disabled' : ''}`}
            disabled={isLoading || !formValid}
          >
            {isLoading ? (
              <>
                <LoadingIcon size="sm" color="inverse" className="btn-loading-icon" />
                <span className="btn-text">Accessing...</span>
              </>
            ) : (
              <>
                <span className="btn-text">Access</span>
                <div className="btn-shine luxury-btn-shine"></div>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer luxury-auth-footer">
          <p className="auth-footer-text luxury-auth-footer-text">
            Need access? <Link to="/register" className="auth-link luxury-auth-link">Request Invite</Link>
          </p>
        </div>

        <div className="auth-help luxury-auth-help">
          <div className="help-header luxury-help-header">
            <h3 className="help-title luxury-help-title">Test Access</h3>
          </div>
          <div className="help-content luxury-help-content">
            <div className="help-item luxury-help-item">
              <span className="help-label luxury-help-label">Username:</span>
              <span className="help-value luxury-help-value">testuser2</span>
            </div>
            <div className="help-item luxury-help-item">
              <span className="help-label luxury-help-label">Password:</span>
              <span className="help-value luxury-help-value">testuser2</span>
            </div>
          </div>
          <button 
            onClick={testApiConnectionHandler}
            className="winzo-btn winzo-btn-secondary luxury-btn luxury-btn-secondary"
          >
            <span className="btn-text">Test Connection</span>
          </button>
        </div>
      </div>

      {/* Luxury decorative elements */}
      <div className="auth-decorations luxury-auth-decorations">
        <div className="decoration-circle luxury-decoration-circle circle-1"></div>
        <div className="decoration-circle luxury-decoration-circle circle-2"></div>
        <div className="decoration-circle luxury-decoration-circle circle-3"></div>
      </div>
    </div>
  );
};

export default Login;
