import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/axios';
import { API_ENDPOINTS, API_CONFIG } from '../config/api';
import winzoLogo from '../assets/winzo-logo.png';
import './Auth.css';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
        setTimeout(() => navigate('/dashboard'), 800);
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

  return (
    <div className="auth-container">
      <img src={winzoLogo} alt="WINZO" className="auth-logo" />
      <h1 className="auth-title">Access</h1>
      <p className="auth-subtitle">Member Portal</p>
      {error && <div className="error">{error}</div>}
      {success && <div className="success-msg">Access Granted</div>}
      <form onSubmit={handleSubmit} className={`auth-form ${success ? 'success' : ''}`}>
        <input
          className="winzo-input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          disabled={isLoading}
        />
        <input
          className="winzo-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="winzo-btn winzo-btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Accessing...' : 'Access'}
        </button>
      </form>
      <p className="auth-footer">
        Need access? <Link to="/register">Request Invite</Link>
      </p>
      <div className="auth-help">
        <p><strong>Test Access:</strong></p>
        <p>Username: testuser2</p>
        <p>Password: testuser2</p>
        <button 
          onClick={testApiConnectionHandler}
          className="winzo-btn winzo-btn-secondary"
          style={{ marginTop: '10px' }}
        >
          Test Connection
        </button>
      </div>
    </div>
  );
};

export default Login;
