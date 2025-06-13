import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { handleApiError } from '../../config/api';
import toast from 'react-hot-toast';
import './AdminLogin.css';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password');
      return;
    }

    setLoading(true);
    
    try {
      // Use regular login to authenticate
      const loginSuccess = await login(username, password);
      
      if (loginSuccess) {
        // For now, allow any authenticated user to access admin
        // TODO: Implement proper admin role checking when backend supports it
        toast.success('Admin login successful');
        navigate('/admin/dashboard');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1 className="admin-login-title">WINZO Admin Portal</h1>
          <p className="admin-login-subtitle">Platform Management Console</p>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="username" className="admin-form-label">
              Admin Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="admin-form-input"
              placeholder="Enter admin username"
              disabled={loading}
              required
            />
          </div>
          
          <div className="admin-form-group">
            <label htmlFor="password" className="admin-form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-form-input"
              placeholder="Enter password"
              disabled={loading}
              required
            />
          </div>
          
          <button
            type="submit"
            className={`admin-login-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="admin-spinner"></div>
                Authenticating...
              </>
            ) : (
              'Access Admin Portal'
            )}
          </button>
        </form>
        
        <div className="admin-login-footer">
          <p className="admin-security-note">
            🔒 Secure access to WINZO platform administration
          </p>
          <p className="admin-dev-note">
            <small>Note: Currently allows any authenticated user. Admin roles will be implemented soon.</small>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 