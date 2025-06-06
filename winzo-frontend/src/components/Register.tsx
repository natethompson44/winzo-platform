import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Auth.css';

const Register: React.FC = () => {
  const { register } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await register(email, password, inviteCode);
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
    <div className="container">
      <h1>WINZO</h1>
      <p>Big Win Energy.</p>
      {error && <div className="error">{error}</div>}
      {success && <div className="success-msg">Big Win Energy! ✨</div>}
      <form onSubmit={handleSubmit} className={success ? 'success' : ''}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Invite Code"
          value={inviteCode}
          onChange={e => setInviteCode(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <a href="/">Login</a>
      </p>
    </div>
  );
};

export default Register;
