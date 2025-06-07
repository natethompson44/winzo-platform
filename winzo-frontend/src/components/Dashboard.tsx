import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import winzoLogo from '../assets/winzo-logo.png';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface QuickStats {
  balance: number;
  pendingBets: number;
  recentWins: number;
}

/**
 * WINZO Dashboard - Your Big Win Energy Command Center
 * 
 * The main dashboard embodies the WINZO design philosophy with confident
 * messaging, energetic visuals, and seamless navigation to all platform
 * features. Mobile-first design ensures optimal experience across devices.
 */
const Dashboard: React.FC = () => {
  const { user, logout, token } = useContext(AuthContext);
  const [stats, setStats] = useState<QuickStats>({
    balance: 0,
    pendingBets: 0,
    recentWins: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [balanceResponse, betsResponse] = await Promise.all([
        axios.get(`${API_URL}/wallet/balance`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/sports/my-bets?limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const balance = balanceResponse.data.data.balance;
      const bets = betsResponse.data.data.bets;
      const pendingBets = bets.filter((bet: any) => bet.status === 'pending').length;
      const recentWins = bets.filter((bet: any) => bet.status === 'won').length;

      setStats({ balance, pendingBets, recentWins });
    } catch (error: any) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="winzo-loading">
          <div className="winzo-spinner"></div>
          <p>🔥 Loading your Big Win Energy dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header with WINZO Logo */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <img src={winzoLogo} alt="WINZO" className="winzo-logo" />
          </div>
          
          <div className="user-section">
            <div className="user-greeting">
              <h2 className="welcome-text">Welcome back,</h2>
              <h1 className="username">{user?.username}!</h1>
            </div>
            <button onClick={logout} className="logout-btn">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="winzo-error">
          <p>⚠️ {error}</p>
          <button onClick={() => setError('')} className="dismiss-btn">
            Let's try again!
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <section className="quick-stats">
        <div className="stats-container">
          <div className="stat-card balance">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-value">${stats.balance.toFixed(2)}</div>
              <div className="stat-label">WINZO Wallet</div>
            </div>
            <div className="stat-status">
              {stats.balance > 0 ? '⚡ Ready!' : '💪 Power Up!'}
            </div>
          </div>

          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pendingBets}</div>
              <div className="stat-label">Active Bets</div>
            </div>
            <div className="stat-status">
              {stats.pendingBets > 0 ? '🎯 In Play' : '🚀 Ready to Bet'}
            </div>
          </div>

          <div className="stat-card wins">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-value">{stats.recentWins}</div>
              <div className="stat-label">Recent Wins</div>
            </div>
            <div className="stat-status">
              {stats.recentWins > 0 ? '🔥 Hot Streak!' : '💎 First Win Coming!'}
            </div>
          </div>
        </div>
      </section>

      {/* Main Navigation */}
      <section className="main-navigation">
        <h2 className="section-title">🎯 Your Big Win Energy Hub</h2>
        
        <div className="nav-grid">
          <Link to="/sports" className="nav-card sports">
            <div className="nav-icon">🏈</div>
            <div className="nav-content">
              <h3 className="nav-title">Sports Betting</h3>
              <p className="nav-description">Live odds, real-time action, Big Win Energy!</p>
            </div>
            <div className="nav-arrow">→</div>
          </Link>

          <Link to="/wallet" className="nav-card wallet">
            <div className="nav-icon">💰</div>
            <div className="nav-content">
              <h3 className="nav-title">WINZO Wallet</h3>
              <p className="nav-description">Manage funds, track winnings, power up!</p>
            </div>
            <div className="nav-arrow">→</div>
          </Link>

          <Link to="/history" className="nav-card history">
            <div className="nav-icon">📊</div>
            <div className="nav-content">
              <h3 className="nav-title">Betting History</h3>
              <p className="nav-description">Track your journey, celebrate wins!</p>
            </div>
            <div className="nav-arrow">→</div>
          </Link>

          <div className="nav-card casino coming-soon">
            <div className="nav-icon">🎰</div>
            <div className="nav-content">
              <h3 className="nav-title">Casino Games</h3>
              <p className="nav-description">Coming soon - More Big Win Energy!</p>
            </div>
            <div className="nav-badge">Soon</div>
          </div>
        </div>
      </section>

      {/* Hot Picks Section */}
      <section className="hot-picks">
        <h2 className="section-title">🔥 Today's Hot Picks</h2>
        
        <div className="picks-container">
          <div className="pick-card featured">
            <div className="pick-header">
              <span className="pick-sport">🏈 NFL</span>
              <span className="pick-badge hot">🔥 HOT</span>
            </div>
            <div className="pick-content">
              <h4 className="pick-title">Sunday Night Football</h4>
              <p className="pick-description">Prime time action with Big Win Energy odds!</p>
            </div>
            <Link to="/sports" className="pick-action">
              Place Bet →
            </Link>
          </div>

          <div className="pick-card">
            <div className="pick-header">
              <span className="pick-sport">🏀 NBA</span>
              <span className="pick-badge trending">📈 Trending</span>
            </div>
            <div className="pick-content">
              <h4 className="pick-title">Championship Series</h4>
              <p className="pick-description">Historic matchups, legendary wins!</p>
            </div>
            <Link to="/sports" className="pick-action">
              View Odds →
            </Link>
          </div>

          <div className="pick-card">
            <div className="pick-header">
              <span className="pick-sport">⚽ Soccer</span>
              <span className="pick-badge new">✨ New</span>
            </div>
            <div className="pick-content">
              <h4 className="pick-title">Premier League</h4>
              <p className="pick-description">Global action, worldwide wins!</p>
            </div>
            <Link to="/sports" className="pick-action">
              Explore →
            </Link>
          </div>
        </div>
      </section>

      {/* Motivation Footer */}
      <section className="motivation-footer">
        <div className="motivation-content">
          <h3 className="motivation-title">💪 Your Big Win Energy is Activated!</h3>
          <p className="motivation-text">
            {stats.recentWins > 0 
              ? `🏆 ${stats.recentWins} wins and counting! You're on fire!`
              : "🚀 Every WINZO champion started with their first bet. Your moment is now!"
            }
          </p>
          <div className="motivation-actions">
            <Link to="/sports" className="motivation-btn primary">
              🎯 Start Betting
            </Link>
            {stats.balance <= 10 && (
              <Link to="/wallet" className="motivation-btn secondary">
                💰 Add Funds
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

