import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="container">
      <h1>WINZO Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <p>Your WINZO Wallet Balance: ${user?.balance}</p>
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
