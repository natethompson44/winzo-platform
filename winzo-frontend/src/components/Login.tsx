import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import winzoLogo from '../assets/winzo-logo.png';
import './Auth.css';

const Login: React.FC = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(username, password);
    if (ok) {
      setError('');
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 800);
    } else {
      setSuccess(false);
      setError('Invalid credentials.');
    }
  };

  return (
    <div className="auth-container">
      <img src={winzoLogo} alt="WINZO" className="auth-logo" />
      <h1 className="auth-title">Welcome Back</h1>
      <p className="auth-subtitle">Big Win Energy</p>
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
        <button type="submit" className="winzo-btn winzo-btn-primary">Login</button>
      </form>
      <p className="auth-footer">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default Login;
