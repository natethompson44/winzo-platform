import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './WalletDashboard.css';

interface WalletBalance {
  balance: number;
  formatted: string;
  status: string;
  encouragement: string;
}

interface UserStats {
  user: {
    username: string;
    walletBalance: number;
    status: string;
  };
  betting: {
    totalBets: number;
    pendingBets: number;
    wonBets: number;
    lostBets: number;
    winRate: string;
    totalWagered: string;
    totalWinnings: string;
    netProfit: string;
    profitStatus: string;
  };
  insights: {
    strongestSport: string;
    bestBettingTime: string;
    winningStreak: number;
    nextMilestone: string;
  };
}

/**
 * WalletDashboard Component - Your WINZO Financial Command Center
 * 
 * This component embodies the WINZO "Big Win Energy" philosophy with
 * confident financial messaging, celebratory balance displays, and
 * motivational insights. Mobile-first design ensures smooth wallet
 * management across all devices.
 */
const WalletDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addFundsAmount, setAddFundsAmount] = useState<string>('');
  const [addingFunds, setAddingFunds] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchWalletData = async () => {
    try {
      const [balanceResponse, statsResponse] = await Promise.all([
        axios.get(`${API_BASE}/wallet/balance`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/wallet/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setWalletBalance(balanceResponse.data.data);
      setUserStats(statsResponse.data.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const addFunds = async () => {
    if (!addFundsAmount || parseFloat(addFundsAmount) <= 0) return;

    setAddingFunds(true);
    try {
      const response = await axios.post(`${API_BASE}/wallet/add-funds`, {
        amount: parseFloat(addFundsAmount),
        method: 'credit_card'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Show success message
      alert(response.data.message);
      
      // Reset form and refresh data
      setAddFundsAmount('');
      setShowAddFunds(false);
      fetchWalletData();
      
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add funds');
    } finally {
      setAddingFunds(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  if (isLoading) {
    return (
      <div className="wallet-dashboard">
        <div className="winzo-loading">
          <div className="winzo-spinner"></div>
          <p>🔥 Loading your WINZO Wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-dashboard">
      {/* Header */}
      <div className="wallet-header">
        <h1 className="winzo-title">💰 WINZO Wallet</h1>
        <p className="winzo-subtitle">Your Big Win Energy Financial Hub!</p>
      </div>

      {error && (
        <div className="winzo-error">
          <p>⚠️ {error}</p>
          <button onClick={() => setError(null)} className="dismiss-btn">
            Let's try again!
          </button>
        </div>
      )}

      {/* Balance Display */}
      {walletBalance && (
        <div className="balance-section">
          <div className="balance-card-large">
            <div className="balance-header">
              <h2 className="balance-title">Current Balance</h2>
              <div className={`balance-status ${walletBalance.status}`}>
                {walletBalance.status === 'ready' ? '⚡ Ready to Win!' : '💰 Power Up!'}
              </div>
            </div>
            
            <div className="balance-amount-large">
              {walletBalance.formatted}
            </div>
            
            <div className="balance-encouragement">
              {walletBalance.encouragement}
            </div>
            
            <div className="balance-actions">
              <button 
                className="add-funds-btn"
                onClick={() => setShowAddFunds(true)}
              >
                💪 Add Funds
              </button>
              <button className="withdraw-btn">
                💸 Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Stats */}
      {userStats && (
        <div className="stats-section">
          <h2 className="section-title">🏆 Your WINZO Journey</h2>
          
          {/* Status Badge */}
          <div className="status-badge-section">
            <div className={`status-badge ${userStats.user.status}`}>
              <div className="status-icon">
                {userStats.user.status === 'champion' && '👑'}
                {userStats.user.status === 'hot_streak' && '🔥'}
                {userStats.user.status === 'experienced' && '⚡'}
                {userStats.user.status === 'rising' && '🚀'}
                {userStats.user.status === 'fresh' && '💎'}
              </div>
              <div className="status-content">
                <div className="status-label">
                  {userStats.user.status === 'champion' && 'WINZO Champion'}
                  {userStats.user.status === 'hot_streak' && 'Hot Streak'}
                  {userStats.user.status === 'experienced' && 'Experienced Player'}
                  {userStats.user.status === 'rising' && 'Rising Star'}
                  {userStats.user.status === 'fresh' && 'Fresh Energy'}
                </div>
                <div className="status-description">
                  Welcome back, {userStats.user.username}!
                </div>
              </div>
            </div>
          </div>

          {/* Betting Statistics */}
          <div className="betting-stats">
            <div className="stats-grid">
              <div className="stat-item primary">
                <div className="stat-icon">🎯</div>
                <div className="stat-value">{userStats.betting.totalBets}</div>
                <div className="stat-label">Total Bets</div>
              </div>

              <div className="stat-item success">
                <div className="stat-icon">🏆</div>
                <div className="stat-value">{userStats.betting.wonBets}</div>
                <div className="stat-label">Wins</div>
              </div>

              <div className="stat-item info">
                <div className="stat-icon">📊</div>
                <div className="stat-value">{userStats.betting.winRate}</div>
                <div className="stat-label">Win Rate</div>
              </div>

              <div className={`stat-item ${userStats.betting.profitStatus === 'winning' ? 'profit' : 'building'}`}>
                <div className="stat-icon">
                  {userStats.betting.profitStatus === 'winning' ? '💰' : '📈'}
                </div>
                <div className="stat-value">{userStats.betting.netProfit}</div>
                <div className="stat-label">
                  {userStats.betting.profitStatus === 'winning' ? 'Profit' : 'Building'}
                </div>
              </div>
            </div>

            <div className="financial-summary">
              <div className="summary-row">
                <span className="summary-label">Total Wagered:</span>
                <span className="summary-value">{userStats.betting.totalWagered}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Total Winnings:</span>
                <span className="summary-value win">{userStats.betting.totalWinnings}</span>
              </div>
              <div className="summary-row highlight">
                <span className="summary-label">Net Result:</span>
                <span className={`summary-value ${userStats.betting.profitStatus === 'winning' ? 'profit' : 'building'}`}>
                  {userStats.betting.netProfit}
                </span>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="insights-section">
            <h3 className="insights-title">💡 Your Winning Insights</h3>
            <div className="insights-grid">
              <div className="insight-card">
                <div className="insight-icon">🎯</div>
                <div className="insight-content">
                  <div className="insight-label">Winning Streak</div>
                  <div className="insight-value">{userStats.insights.winningStreak} wins</div>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-icon">🎖️</div>
                <div className="insight-content">
                  <div className="insight-label">Next Milestone</div>
                  <div className="insight-value">{userStats.insights.nextMilestone}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="modal-overlay" onClick={() => setShowAddFunds(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">💪 Power Up Your Wallet</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddFunds(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Add funds to your WINZO Wallet and activate that Big Win Energy!
              </p>

              <div className="amount-input-section">
                <label htmlFor="addAmount" className="amount-label">
                  💰 Amount to Add
                </label>
                <div className="amount-input-group">
                  <span className="currency-symbol">$</span>
                  <input
                    id="addAmount"
                    type="number"
                    value={addFundsAmount}
                    onChange={(e) => setAddFundsAmount(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    className="amount-input"
                  />
                </div>

                <div className="quick-amounts">
                  {[25, 50, 100, 250, 500].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setAddFundsAmount(amount.toString())}
                      className="quick-amount-btn"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              <div className="payment-method">
                <label className="method-label">💳 Payment Method</label>
                <div className="method-options">
                  <div className="method-option selected">
                    <span className="method-icon">💳</span>
                    <span className="method-name">Credit Card</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowAddFunds(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={addFunds}
                disabled={!addFundsAmount || parseFloat(addFundsAmount) <= 0 || addingFunds}
                className="confirm-btn"
              >
                {addingFunds ? '⏳ Processing...' : '🚀 Add Funds'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Motivational Footer */}
      <div className="motivation-section">
        <div className="motivation-content">
          {userStats && userStats.betting.wonBets > 0 ? (
            <p>🔥 You've got {userStats.betting.wonBets} wins and counting! Your Big Win Energy is unstoppable!</p>
          ) : (
            <p>💎 Every WINZO champion started exactly where you are. Your winning moment is coming!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard;

