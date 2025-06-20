import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingIcon, SuccessIcon, WarningIcon } from '../components/ui/Icons';
import '../styles/preserved-auth.css';

const Register: React.FC = () => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formValid, setFormValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const isPasswordValid = password.length >= 8;
    const doPasswordsMatch = password === confirmPassword;
    setFormValid(
      username.trim().length > 0 && 
      isPasswordValid && 
      doPasswordsMatch &&
      inviteCode.trim().length > 0
    );
  }, [username, password, confirmPassword, inviteCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const ok = await register(username, password, inviteCode);
      if (ok) {
        setError('');
        setSuccess(true);
        setTimeout(() => navigate('/login'), 1200);
      } else {
        setSuccess(false);
        setError('Registration failed. Please check your invite code and try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
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
        <h1 className="hero-title">Join WINZO</h1>
        <p className="hero-subtitle">Create your exclusive account</p>
        
        {error && (
          <div className="error-message">
            <WarningIcon size="sm" color="danger" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <SuccessIcon size="sm" color="success" />
            <span>Registration Successful</span>
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
            <div className={`input-wrapper${error ? ' error' : ''} ${focusedField === 'inviteCode' ? 'focused' : ''} ${inviteCode ? 'has-value' : ''}`}>
              <input
                className="luxury-input"
                type="text"
                placeholder="Invite Code"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                onFocus={() => handleInputFocus('inviteCode')}
                onBlur={handleInputBlur}
                required
                disabled={isLoading}
                autoComplete="off"
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
                autoComplete="new-password"
                minLength={8}
              />
            </div>
          </div>

          <div className="input-group">
            <div className={`input-wrapper${error ? ' error' : ''} ${focusedField === 'confirmPassword' ? 'focused' : ''} ${confirmPassword ? 'has-value' : ''}`}>
              <input
                className="luxury-input"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onFocus={() => handleInputFocus('confirmPassword')}
                onBlur={handleInputBlur}
                required
                disabled={isLoading}
                autoComplete="new-password"
                minLength={8}
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
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="hero-actions">
          <Link to="/" className="luxury-btn luxury-btn-secondary">Back to Home</Link>
          <Link to="/login" className="luxury-btn luxury-btn-secondary">Already have access?</Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 