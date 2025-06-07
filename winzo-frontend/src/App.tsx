import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import SportsBetting from './components/SportsBetting';
import BettingHistory from './components/BettingHistory';
import WalletDashboard from './components/WalletDashboard';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

/**
 * WINZO App Component - Big Win Energy Hub
 * 
 * Main application component that orchestrates the entire WINZO experience
 * with routing for sports betting, wallet management, and betting history.
 * Embodies the WINZO design philosophy with seamless navigation and
 * mobile-first responsive design.
 */
const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <div className="winzo-app">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sports" element={<SportsBetting />} />
          <Route path="/history" element={<BettingHistory />} />
          <Route path="/wallet" element={<WalletDashboard />} />
        </Routes>
      </div>
    </Router>
  </AuthProvider>
);

export default App;

