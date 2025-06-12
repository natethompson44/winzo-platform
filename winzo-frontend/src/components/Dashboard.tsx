import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBetSlip } from '../contexts/BetSlipContext';
import apiClient from '../utils/axios';
import { API_ENDPOINTS, handleApiError } from '../config/api';
import './Dashboard.css';

interface DashboardStats {
  totalBets: number;
  totalStaked: number;
  totalWinnings: number;
  profit: number;
  winRate: number;
  betsPending: number;
}

interface RecentBet {
  id: number;
  selected_team: string;
  odds: number;
  stake: number;
  status: string;
  potential_payout: number;
  placed_at: string;
  sportsEvent: {
    home_team: string;
    away_team: string;
    sport_key: string;
  };
}

interface WalletData {
  balance: number;
  lastUpdated: string;
}

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { getItemCount, getTotalStake } = useBetSlip();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBets, setRecentBets] = useState<RecentBet[]>([]);
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [betsResponse, walletResponse] = await Promise.all([
        apiClient.get(`${API_ENDPOINTS.BET_HISTORY}?limit=5`),
        apiClient.get(API_ENDPOINTS.WALLET_BALANCE)
      ]);
      if (betsResponse.data.success) {
        setRecentBets(betsResponse.data.data);
        setStats(betsResponse.data.summary);
      }
      if (walletResponse.data.success) {
        setWalletData(walletResponse.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'won': return '#48bb78';
      case 'lost': return '#e53e3e';
      case 'pending': return '#ed8936';
      case 'cancelled': return '#a0aec0';
      default: return '#a0aec0';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'won': return '';
      case 'lost': return '';
      case 'pending': return '';
      case 'cancelled': return '';
      default: return ' ';
    }
  };

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="auth-required">
          <h2>Welcome to WINZO</h2>
          <p>Please log in to view your dashboard and start betting.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome back, {user.username}! </h1>
        <p>Your betting command center</p>
      </header>
      {error && (
        <div className="error-banner">
          <span>⚠ {error}</span>
          <button onClick={fetchDashboardData} className="retry-button">
            Retry
          </button>
        </div>
      )}
      <div className="dashboard-grid">
        {/* Wallet Card */}
        <div className="dashboard-card wallet-card">
          <div className="card-header">
            <h3> Wallet</h3>
            <button onClick={refreshUser} className="refresh-btn"> </button>
          </div>
          <div className="wallet-balance">
            {formatCurrency(user.wallet_balance)}
          </div>
          <div className="wallet-actions">
            <button className="wallet-btn deposit">+ Deposit</button>
            <button className="wallet-btn withdraw">- Withdraw</button>
          </div>
        </div>
        {/* Active Bet Slip */}
        <div className="dashboard-card betslip-card">
          <div className="card-header">
            <h3> Active Bet Slip</h3>
          </div>
          <div className="betslip-summary">
            <div className="betslip-stat">
              <span className="stat-label">Bets:</span>
              <span className="stat-value">{getItemCount()}</span>
            </div>
            <div className="betslip-stat">
              <span className="stat-label">Stake:</span>
              <span className="stat-value">{formatCurrency(getTotalStake())}</span>
            </div>
          </div>
          {getItemCount() > 0 ? (
            <button className="view-betslip-btn">View Bet Slip</button>
          ) : (
            <p className="no-bets">No active bets</p>
          )}
        </div>
        {/* Betting Stats */}
        {stats && (
          <div className="dashboard-card stats-card">
            <div className="card-header">
              <h3> Betting Stats</h3>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{stats.totalBets}</span>
                <span className="stat-label">Total Bets</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.winRate.toFixed(1)}%</span>
                <span className="stat-label">Win Rate</span>
              </div>
              <div className="stat-item">
                <span className={`stat-number ${stats.profit >= 0 ? 'profit' : 'loss'}`}>{formatCurrency(stats.profit)}</span>
                <span className="stat-label">Profit/Loss</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.betsPending}</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
          </div>
        )}
        {/* Recent Bets */}
        <div className="dashboard-card recent-bets-card">
          <div className="card-header">
            <h3> Recent Bets</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="recent-bets-list">
            {recentBets.length > 0 ? (
              recentBets.map((bet) => (
                <div key={bet.id} className="recent-bet-item">
                  <div className="bet-info">
                    <div className="bet-teams">
                      {bet.sportsEvent.away_team} @
                      {bet.sportsEvent.home_team}
                    </div>
                    <div className="bet-selection">
                      {bet.selected_team} ({formatOdds(bet.odds)})
                    </div>
                    <div className="bet-amount">
                      Stake: {formatCurrency(bet.stake)}
                    </div>
                  </div>
                  <div className="bet-status">
                    <span
                      className="status-badge"
                      style={{ color: getStatusColor(bet.status) }}
                    >
                      {getStatusIcon(bet.status)} {bet.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-recent-bets">
                <p>No recent bets</p>
                <p>Start betting to see your history here!</p>
              </div>
            )}
          </div>
        </div>
        {/* Quick Actions */}
        <div className="dashboard-card quick-actions-card">
          <div className="card-header">
            <h3> Quick Actions</h3>
          </div>
          <div className="quick-actions">
            <button className="quick-action-btn sports">
              Sports Betting
            </button>
            <button className="quick-action-btn history">
              Bet History
            </button>
            <button className="quick-action-btn wallet">
              Manage Wallet
            </button>
            <button className="quick-action-btn support">
              Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
