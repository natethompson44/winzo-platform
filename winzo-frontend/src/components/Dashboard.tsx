import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://winzo-platform-production.up.railway.app/api';

const Dashboard: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const [balance, setBalance] = useState<number | null>(user?.balance || null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get(`${API_URL}/auth/me`)
      .then(res => setBalance(res.data.user.balance))
      .catch(() => setError('Failed to load wallet balance'));
  }, []);

  return (
    <div className="container">
      <h1>WINZO Dashboard</h1>
      <p>Welcome, {user?.username}</p>
      {error && <div className="error">{error}</div>}
      <p>Your WINZO Wallet Balance: ${balance ?? user?.balance ?? 0}</p>
      <h3>Today's Hot Picks:</h3>
      <ul>
        <li>🏈 Super Bowl Specials</li>
        <li>🎲 Casino Night Hot Games</li>
      </ul>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
