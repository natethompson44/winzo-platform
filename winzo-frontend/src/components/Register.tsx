import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import winzoLogo from '../assets/winzo-logo.png';
import './Auth.css';

const Register: React.FC = () => {
  const { register } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await register(username, password, inviteCode);
    if (ok) {
      setError('');
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 800);
    } else {
      setSuccess(false);
      setError('Registration failed. Check your invite code.');
    }
  };

  return (
    <div className="auth-container">
      <img src={winzoLogo} alt="WINZO" className="auth-logo" />
      <h1 className="auth-title">Create Account</h1>
      <p className="auth-subtitle">Invite Only</p>
      {error && <div className="error">{error}</div>}
      {success && <div className="success-msg">Big Win Energy! ✨</div>}
      <form onSubmit={handleSubmit} className={`auth-form ${success ? 'success' : ''}`}>
        <input
          className="winzo-input"
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          className="winzo-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          className="winzo-input"
          type="text"
          placeholder="Invite Code"
          value={inviteCode}
          onChange={e => setInviteCode(e.target.value)}
          required
        />
        <button type="submit" className="winzo-btn winzo-btn-primary">Register</button>
      </form>
      <p className="auth-footer">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;
