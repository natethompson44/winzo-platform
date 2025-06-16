import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-header">
          <h1 className="auth-title">Access</h1>
          <p className="auth-subtitle">Member Portal</p>
        </div>

        {error && (
          <div className="error">
            <WarningIcon size="sm" color="danger" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="success-msg">
            <SuccessIcon size="sm" color="success" />
            <span>Access Granted</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <div className={`input-wrapper ${focusedField === 'username' ? 'focused' : ''} ${username ? 'has-value' : ''}`}>
              <UserIcon 
                size="sm" 
                color={focusedField === 'username' ? 'secondary' : 'neutral'} 
                className="input-icon" 
              />
              <input
                className="winzo-input"
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
            <div className={`input-wrapper ${focusedField === 'password' ? 'focused' : ''} ${password ? 'has-value' : ''}`}>
              <LockIcon 
                size="sm" 
                color={focusedField === 'password' ? 'secondary' : 'neutral'} 
                className="input-icon" 
              />
              <input
                className="winzo-input"
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
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <InfoIcon size="sm" color="neutral" />
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className={`winzo-btn winzo-btn-primary ${!formValid ? 'disabled' : ''}`}
            disabled={isLoading || !formValid}
          >
            {isLoading ? (
              <>
                <LoadingIcon size="sm" color="inverse" />
                <span>Accessing...</span>
              </>
            ) : (
              'Access'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Need access? <Link to="/register" className="auth-link">Request Invite</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
