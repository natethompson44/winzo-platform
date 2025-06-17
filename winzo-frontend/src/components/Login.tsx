import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingIcon, SuccessIcon, WarningIcon } from './icons/IconLibrary';
import './HomePage.css';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formValid, setFormValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setFormValid(username.trim().length > 0 && password.length > 0);
  }, [username, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const ok = await login(username, password);
      if (ok) {
        setError('');
        setSuccess(true);
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

  const handleInputFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleInputBlur = () => {
    setFocusedField(null);
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1 className="hero-title">Welcome Back</h1>
        <p className="hero-subtitle">Access your WINZO account</p>
        
        {error && (
          <div className="error-message">
            <WarningIcon size="sm" color="danger" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <SuccessIcon size="sm" color="success" />
            <span>Access Granted</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <div className={`input-wrapper${error ? ' error' : ''} ${focusedField === 'username' ? 'focused' : ''} ${username ? 'has-value' : ''}`}>
              <input
                className="luxury-input"
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
            </div>
          </div>

          <div className="input-group">
            <div className={`input-wrapper${error ? ' error' : ''} ${focusedField === 'password' ? 'focused' : ''} ${password ? 'has-value' : ''}`}>
              <input
                className="luxury-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => handleInputFocus('password')}
                onBlur={handleInputBlur}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={`luxury-btn luxury-btn-primary ${!formValid ? 'disabled' : ''}`}
            disabled={isLoading || !formValid}
          >
            {isLoading ? (
              <>
                <LoadingIcon size="sm" color="inverse" />
                <span>Accessing...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="hero-actions">
          <Link to="/" className="luxury-btn luxury-btn-secondary">Back to Home</Link>
          <Link to="/register" className="luxury-btn luxury-btn-secondary">Request Access</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
