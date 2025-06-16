import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserIcon, 
  LockIcon,
  LoadingIcon,
  SuccessIcon,
  WarningIcon
} from './icons/IconLibrary';
import './Auth.css';

const Register: React.FC = () => {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const ok = await register(username, password, inviteCode);
      if (ok) {
        setError('');
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 1200);
      } else {
        setSuccess(false);
        setError('Registration failed. Check your invite code.');
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
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-header">
          <h1 className="auth-title">Request Access</h1>
          <p className="auth-subtitle">Invite Only</p>
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
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => handleInputFocus('password')}
                onBlur={handleInputBlur}
                required
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="input-group">
            <div className={`input-wrapper ${focusedField === 'inviteCode' ? 'focused' : ''} ${inviteCode ? 'has-value' : ''}`}>
              <LockIcon 
                size="sm" 
                color={focusedField === 'inviteCode' ? 'secondary' : 'neutral'} 
                className="input-icon" 
              />
              <input
                className="winzo-input"
                type="text"
                placeholder="Invite Code"
                value={inviteCode}
                onChange={e => setInviteCode(e.target.value)}
                onFocus={() => handleInputFocus('inviteCode')}
                onBlur={handleInputBlur}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="winzo-btn winzo-btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoadingIcon size="sm" color="inverse" />
                <span>Requesting Access...</span>
              </>
            ) : (
              'Request Access'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have access? <Link to="/login" className="auth-link">Access Portal</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
