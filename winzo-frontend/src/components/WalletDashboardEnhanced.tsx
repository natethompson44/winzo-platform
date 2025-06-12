import React, { useState, useEffect, useCallback } from 'react';
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

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: string;
  description: string;
  timestamp: string;
  status: string;
  friendlyDescription: string;
  icon: string;
}

/**
 * Enhanced WalletDashboard Component - Complete Financial Management
 * 
 * Full-featured wallet with deposit, withdrawal, transaction history,
 * and comprehensive financial management capabilities.
 */
const WalletDashboardEnhanced: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Add Funds State
  const [addFundsAmount, setAddFundsAmount] = useState<string>('');
  const [addingFunds, setAddingFunds] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('credit_card');
  
  // Withdraw State
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState('bank_transfer');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  
  // Transaction History State
  const [showTransactions, setShowTransactions] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchWalletData = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

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
      console.error('Wallet data error:', error);
      setError(error.response?.data?.message || 'Failed to load wallet data');
      
      // Fallback data for demo
      setWalletBalance({
        balance: 100.00,
        formatted: '$100.00',
        status: 'ready',
        encouragement: 'Ready for Big Win Energy!'
      });
      
      setUserStats({
        user: {
          username: user?.username || 'Champion',
          walletBalance: 100.00,
          status: 'fresh'
        },
        betting: {
          totalBets: 0,
          pendingBets: 0,
          wonBets: 0,
          lostBets: 0,
          winRate: '0%',
          totalWagered: '$0.00',
          totalWinnings: '$0.00',
          netProfit: '$0.00',
          profitStatus: 'building'
        },
        insights: {
          strongestSport: 'Coming soon!',
          bestBettingTime: 'Coming soon!',
          winningStreak: 0,
          nextMilestone: 'Place your first bet to get started!'
        }
      });
    }
  }, [user, API_BASE]);

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axios.get(`${API_BASE}/wallet/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.data?.transactions || []);
    } catch (error: any) {
      console.error('Transactions error:', error);
      // Fallback demo transactions
      setTransactions([
        {
          id: '1',
          type: 'credit',
          amount: '+$50.00',
          description: 'Welcome bonus - Big Win Energy activated!',
          timestamp: new Date().toISOString(),
          status: 'completed',
          friendlyDescription: 'Welcome bonus - Big Win Energy activated!',
          icon: '💰'
        }
      ]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const addFunds = async () => {
    if (!addFundsAmount || parseFloat(addFundsAmount) <= 0) return;

    setAddingFunds(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Authentication required');
        return;
      }

      const response = await axios.post(`${API_BASE}/wallet/add-funds`, {
        amount: parseFloat(addFundsAmount),
        method: selectedPaymentMethod
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

  const withdrawFunds = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0 || !withdrawDetails.trim()) return;

    setWithdrawing(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Authentication required');
        return;
      }

      const response = await axios.post(`${API_BASE}/wallet/withdraw`, {
        amount: parseFloat(withdrawAmount),
        method: selectedWithdrawMethod,
        details: withdrawDetails
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Show success message
      alert(response.data.message);
      
      // Reset form and refresh data
      setWithdrawAmount('');
      setWithdrawDetails('');
      setShowWithdraw(false);
      fetchWalletData();
      
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to process withdrawal');
    } finally {
      setWithdrawing(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

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
          <p>⚠️ Using demo data - {error}</p>
          <button onClick={() => setError(null)} className="dismiss-btn">
            Got it!
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
              <button 
                className="withdraw-btn"
                onClick={() => setShowWithdraw(true)}
                disabled={!walletBalance.balance || walletBalance.balance < 10}
              >
                💸 Withdraw
              </button>
              <button 
                className="transactions-btn"
                onClick={() => {
                  setShowTransactions(true);
                  fetchTransactions();
                }}
              >
                📊 History
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
          <div className="modal-content add-funds-modal" onClick={(e) => e.stopPropagation()}>
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
                  <div 
                    className={`method-option ${selectedPaymentMethod === 'credit_card' ? 'selected' : ''}`}
                    onClick={() => setSelectedPaymentMethod('credit_card')}
                  >
                    <span className="method-icon">💳</span>
                    <span className="method-name">Credit Card</span>
                  </div>
                  <div 
                    className={`method-option ${selectedPaymentMethod === 'bank_transfer' ? 'selected' : ''}`}
                    onClick={() => setSelectedPaymentMethod('bank_transfer')}
                  >
                    <span className="method-icon">🏦</span>
                    <span className="method-name">Bank Transfer</span>
                  </div>
                  <div 
                    className={`method-option ${selectedPaymentMethod === 'crypto' ? 'selected' : ''}`}
                    onClick={() => setSelectedPaymentMethod('crypto')}
                  >
                    <span className="method-icon">₿</span>
                    <span className="method-name">Crypto</span>
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

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="modal-overlay" onClick={() => setShowWithdraw(false)}>
          <div className="modal-content withdraw-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">💸 Withdraw Winnings</h3>
              <button 
                className="modal-close"
                onClick={() => setShowWithdraw(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Congratulations on your WINZO winnings! Let's get your money to you.
              </p>

              <div className="available-balance">
                <span>Available Balance: </span>
                <strong>{walletBalance?.formatted || '$0.00'}</strong>
              </div>

              <div className="amount-input-section">
                <label htmlFor="withdrawAmount" className="amount-label">
                  💰 Amount to Withdraw (Min: $10)
                </label>
                <div className="amount-input-group">
                  <span className="currency-symbol">$</span>
                  <input
                    id="withdrawAmount"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    min="10"
                    max={walletBalance?.balance || 0}
                    step="0.01"
                    className="amount-input"
                  />
                </div>

                <div className="quick-amounts">
                  {[25, 50, 100].filter(amount => amount <= (walletBalance?.balance || 0)).map(amount => (
                    <button
                      key={amount}
                      onClick={() => setWithdrawAmount(amount.toString())}
                      className="quick-amount-btn"
                    >
                      ${amount}
                    </button>
                  ))}
                  {walletBalance && walletBalance.balance > 10 && (
                    <button
                      onClick={() => setWithdrawAmount(walletBalance.balance.toString())}
                      className="quick-amount-btn max"
                    >
                      Max
                    </button>
                  )}
                </div>
              </div>

              <div className="payment-method">
                <label className="method-label">🏦 Withdrawal Method</label>
                <div className="method-options">
                  <div 
                    className={`method-option ${selectedWithdrawMethod === 'bank_transfer' ? 'selected' : ''}`}
                    onClick={() => setSelectedWithdrawMethod('bank_transfer')}
                  >
                    <span className="method-icon">🏦</span>
                    <div className="method-details">
                      <span className="method-name">Bank Transfer</span>
                      <span className="method-time">1-3 business days</span>
                    </div>
                  </div>
                  <div 
                    className={`method-option ${selectedWithdrawMethod === 'crypto' ? 'selected' : ''}`}
                    onClick={() => setSelectedWithdrawMethod('crypto')}
                  >
                    <span className="method-icon">₿</span>
                    <div className="method-details">
                      <span className="method-name">Crypto</span>
                      <span className="method-time">1-2 hours</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="withdrawal-details">
                <label htmlFor="withdrawDetails" className="details-label">
                  📝 {selectedWithdrawMethod === 'bank_transfer' ? 'Bank Account Details' : 'Crypto Wallet Address'}
                </label>
                <textarea
                  id="withdrawDetails"
                  value={withdrawDetails}
                  onChange={(e) => setWithdrawDetails(e.target.value)}
                  placeholder={selectedWithdrawMethod === 'bank_transfer' 
                    ? 'Enter your bank account details...' 
                    : 'Enter your crypto wallet address...'}
                  className="details-input"
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowWithdraw(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={withdrawFunds}
                disabled={
                  !withdrawAmount || 
                  parseFloat(withdrawAmount) < 10 || 
                  parseFloat(withdrawAmount) > (walletBalance?.balance || 0) ||
                  !withdrawDetails.trim() ||
                  withdrawing
                }
                className="confirm-btn"
              >
                {withdrawing ? '⏳ Processing...' : '💸 Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {showTransactions && (
        <div className="modal-overlay" onClick={() => setShowTransactions(false)}>
          <div className="modal-content transactions-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">📊 Transaction History</h3>
              <button 
                className="modal-close"
                onClick={() => setShowTransactions(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {loadingTransactions ? (
                <div className="loading-transactions">
                  <div className="winzo-spinner small"></div>
                  <p>Loading your transaction history...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="empty-transactions">
                  <div className="empty-icon">📝</div>
                  <h4>No Transactions Yet</h4>
                  <p>Your transaction history will appear here once you start using your WINZO Wallet!</p>
                </div>
              ) : (
                <div className="transactions-list">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className={`transaction-item ${transaction.type}`}>
                      <div className="transaction-icon">
                        {transaction.icon}
                      </div>
                      <div className="transaction-details">
                        <div className="transaction-description">
                          {transaction.friendlyDescription}
                        </div>
                        <div className="transaction-time">
                          {new Date(transaction.timestamp).toLocaleDateString()} at{' '}
                          {new Date(transaction.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className={`transaction-amount ${transaction.type}`}>
                        {transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

export default WalletDashboardEnhanced;

