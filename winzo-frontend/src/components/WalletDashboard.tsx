import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/axios';
import { API_ENDPOINTS, handleApiError } from '../config/api';
import { formatCurrency } from '../utils/numberUtils';
import ValidatedInput from './ValidatedInput';
import './WalletDashboard.css';

interface WalletBalance {
  balance: number;
  formatted: string;
  status: string;
  encouragement: string;
  lastUpdated: string;
  currency: string;
  availableForWithdrawal: number;
  pendingAmount: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'refund' | 'bonus' | 'fee';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  timestamp: string;
  reference: string;
  paymentMethod?: string;
  fees?: number;
  balanceAfter: number;
  category?: string;
  tags?: string[];
}

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'crypto' | 'ewallet';
  name: string;
  last4?: string;
  expiry?: string;
  isDefault: boolean;
  isVerified: boolean;
  brand?: string;
  country?: string;
  processingTime?: string;
  fees?: number;
}

interface UserStats {
  user: {
    username: string;
    walletBalance: number;
    status: string;
    memberSince: string;
    verificationLevel: string;
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
    averageBetSize: string;
    largestWin: string;
    largestLoss: string;
  };
  insights: {
    strongestSport: string;
    bestBettingTime: string;
    winningStreak: number;
    nextMilestone: string;
    monthlyTrend: string;
    weeklyPerformance: string;
  };
}

interface WithdrawalRequest {
  amount: number;
  method: string;
  accountDetails: string;
  reason?: string;
  processingTime?: string;
}

interface DepositRequest {
  amount: number;
  method: string;
  paymentDetails?: any;
}

interface SecuritySettings {
  pinEnabled: boolean;
  twoFactorEnabled: boolean;
  lastLogin: string;
  loginHistory: string[];
  securityQuestions: string[];
}

/**
 * Enhanced WalletDashboard Component - Complete Financial Management Hub
 * 
 * Features:
 * - Real-time balance updates
 * - Multiple payment methods
 * - Secure withdrawal system
 * - Transaction history with filtering
 * - Security features (PIN, 2FA)
 * - Export functionality
 * - Advanced analytics
 */
const WalletDashboard: React.FC = () => {
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(false);
  
  // Form states
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [withdrawalRequest, setWithdrawalRequest] = useState<WithdrawalRequest>({
    amount: 0,
    method: '',
    accountDetails: '',
    reason: ''
  });
  const [depositRequest, setDepositRequest] = useState<DepositRequest>({
    amount: 0,
    method: ''
  });
  
  // Validation states
  const [amountValidation, setAmountValidation] = useState({ isValid: true, value: 0 });
  const [withdrawalValidation, setWithdrawalValidation] = useState({ isValid: true, value: 0 });
  const [pin, setPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Filter states
  const [transactionFilter, setTransactionFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // UI states
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'payment-methods' | 'security'>('overview');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const balanceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [balanceResponse, statsResponse, transactionsResponse, paymentMethodsResponse, securityResponse] = await Promise.all([
        apiClient.get(API_ENDPOINTS.WALLET_BALANCE),
        apiClient.get(`${API_ENDPOINTS.WALLET_BALANCE}/stats`),
        apiClient.get(API_ENDPOINTS.WALLET_TRANSACTIONS),
        apiClient.get(`${API_ENDPOINTS.WALLET_BALANCE}/payment-methods`),
        apiClient.get(`${API_ENDPOINTS.WALLET_BALANCE}/security`)
      ]);

      if (balanceResponse.data.success) {
        setWalletBalance(balanceResponse.data.data);
      }
      
      if (statsResponse.data.success) {
        setUserStats(statsResponse.data.data);
      }
      
      if (transactionsResponse.data.success) {
        setTransactions(transactionsResponse.data.data);
      }
      
      if (paymentMethodsResponse.data.success) {
        setPaymentMethods(paymentMethodsResponse.data.data);
      }

      if (securityResponse.data.success) {
        setSecuritySettings(securityResponse.data.data);
      }

      setLastUpdate(new Date());
    } catch (error: any) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWalletBalance = useCallback(async () => {
    try {
      setWalletLoading(true);
      const response = await apiClient.get(API_ENDPOINTS.WALLET_BALANCE);
      if (response.data.success) {
        setWalletBalance(response.data.data);
        setLastUpdate(new Date());
      }
    } catch (error: any) {
      console.error('Error fetching wallet balance:', error);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const handleDeposit = async () => {
    if (!amountValidation.isValid || amountValidation.value <= 0) return;

    try {
      const response = await apiClient.post(API_ENDPOINTS.WALLET_DEPOSIT, {
        amount: amountValidation.value,
        method: depositRequest.method,
        paymentDetails: depositRequest.paymentDetails
      });

      if (response.data.success) {
        alert('Deposit initiated successfully!');
        setDepositAmount('');
        setShowDeposit(false);
        fetchWalletData();
      }
    } catch (error: any) {
      alert(handleApiError(error));
    }
  };

  const handleWithdrawal = async () => {
    if (!withdrawalValidation.isValid || withdrawalValidation.value <= 0) return;

    try {
      const response = await apiClient.post(API_ENDPOINTS.WALLET_WITHDRAW, withdrawalRequest);

      if (response.data.success) {
        alert('Withdrawal request submitted successfully!');
        setWithdrawalRequest({ amount: 0, method: '', accountDetails: '', reason: '' });
        setShowWithdrawal(false);
        fetchWalletData();
      }
    } catch (error: any) {
      alert(handleApiError(error));
    }
  };

  const handleSecurityUpdate = async () => {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.WALLET_BALANCE}/security`, {
        pinEnabled: pin.length > 0,
        pin: pin.length > 0 ? pin : undefined,
        twoFactorEnabled
      });

      if (response.data.success) {
        alert('Security settings updated successfully!');
        setShowSecuritySettings(false);
        setPin('');
        setConfirmPin('');
        fetchWalletData();
      }
    } catch (error: any) {
      alert(handleApiError(error));
    }
  };

  const handleAmountChange = (value: string, isValid: boolean, numericValue?: number) => {
    setDepositAmount(value);
    setAmountValidation({ isValid, value: numericValue || 0 });
    setDepositRequest(prev => ({ ...prev, amount: numericValue || 0 }));
  };

  const handleWithdrawalAmountChange = (value: string, isValid: boolean, numericValue?: number) => {
    setWithdrawalRequest(prev => ({ ...prev, amount: numericValue || 0 }));
    setWithdrawalValidation({ isValid, value: numericValue || 0 });
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = transactionFilter === 'all' || transaction.type === transactionFilter;
    const transactionDate = new Date(transaction.timestamp);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const matchesDate = transactionDate >= startDate && transactionDate <= endDate;
    const matchesSearch = searchTerm === '' || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesDate && matchesSearch;
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Type', 'Amount', 'Status', 'Description', 'Reference', 'Balance After'],
      ...filteredTransactions.map(t => [
        new Date(t.timestamp).toLocaleDateString(),
        t.type,
        formatCurrency(t.amount),
        t.status,
        t.description,
        t.reference,
        formatCurrency(t.balanceAfter)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTransactionIcon = (type: string): string => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdrawal': return '💸';
      case 'bet': return '🎯';
      case 'win': return '🏆';
      case 'refund': return '↩️';
      case 'bonus': return '🎁';
      case 'fee': return '💳';
      default: return '📊';
    }
  };

  useEffect(() => {
    if (user) {
      fetchWalletData();
      
      // Set up real-time balance updates every 30 seconds
      balanceIntervalRef.current = setInterval(fetchWalletBalance, 30000);
      
      return () => {
        if (balanceIntervalRef.current) {
          clearInterval(balanceIntervalRef.current);
        }
      };
    }
  }, [user, fetchWalletData, fetchWalletBalance]);

  if (!user) {
    return (
      <div className="wallet-dashboard-container">
        <div className="auth-required">
          <h2>Login Required</h2>
          <p>Please log in to access your wallet.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="wallet-dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading wallet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-dashboard-container">
      <header className="wallet-header">
        <div className="header-content">
          <h1>💰 Wallet Dashboard</h1>
          <p>Manage your funds and track your financial activity</p>
          <div className="last-update">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
        <div className="header-actions">
          <button 
            onClick={fetchWalletData} 
            className="refresh-all-btn"
            disabled={loading}
          >
            {loading ? '⏳' : '🔄'} Refresh
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠ {error}</span>
          <button onClick={fetchWalletData} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="wallet-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          📋 Transactions
        </button>
        <button
          className={`tab-btn ${activeTab === 'payment-methods' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment-methods')}
        >
          💳 Payment Methods
        </button>
        <button
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🔒 Security
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="overview-content">
          <div className="wallet-grid">
            {/* Balance Card */}
            <div className="wallet-card balance-card">
              <div className="card-header">
                <h3>💰 Current Balance</h3>
                <button 
                  onClick={fetchWalletBalance} 
                  className={`refresh-btn ${walletLoading ? 'loading' : ''}`}
                  disabled={walletLoading}
                >
                  {walletLoading ? '⏳' : '🔄'}
                </button>
              </div>
              <div className="balance-amount">
                {walletBalance ? formatCurrency(walletBalance.balance) : 'Loading...'}
              </div>
              <div className="balance-details">
                <div className="balance-item">
                  <span className="label">Available:</span>
                  <span className="value">{walletBalance ? formatCurrency(walletBalance.availableForWithdrawal) : '-'}</span>
                </div>
                <div className="balance-item">
                  <span className="label">Pending:</span>
                  <span className="value">{walletBalance ? formatCurrency(walletBalance.pendingAmount) : '-'}</span>
                </div>
              </div>
              <div className="balance-actions">
                <button onClick={() => setShowDeposit(true)} className="action-btn deposit">
                  + Deposit
                </button>
                <button onClick={() => setShowWithdrawal(true)} className="action-btn withdraw">
                  - Withdraw
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            {userStats && (
              <div className="wallet-card stats-card">
                <div className="card-header">
                  <h3>📊 Quick Stats</h3>
                </div>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-number">{userStats.betting.totalBets}</span>
                    <span className="stat-label">Total Bets</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{userStats.betting.winRate}</span>
                    <span className="stat-label">Win Rate</span>
                  </div>
                  <div className="stat-item">
                    <span className={`stat-number ${userStats.betting.profitStatus === 'positive' ? 'positive' : 'negative'}`}>
                      {userStats.betting.netProfit}
                    </span>
                    <span className="stat-label">Net Profit</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{userStats.betting.averageBetSize}</span>
                    <span className="stat-label">Avg Bet</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="wallet-card activity-card">
              <div className="card-header">
                <h3>📈 Recent Activity</h3>
                <button onClick={() => setActiveTab('transactions')} className="view-all-btn">
                  View All
                </button>
              </div>
              <div className="recent-transactions">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-icon">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="transaction-details">
                      <div className="transaction-description">{transaction.description}</div>
                      <div className="transaction-meta">
                        {new Date(transaction.timestamp).toLocaleDateString()} • {transaction.reference}
                      </div>
                    </div>
                    <div className="transaction-amount">
                      <span className={`amount ${transaction.type === 'withdrawal' || transaction.type === 'bet' ? 'negative' : 'positive'}`}>
                        {transaction.type === 'withdrawal' || transaction.type === 'bet' ? '-' : '+'}{formatCurrency(transaction.amount)}
                      </span>
                      <span className={`status ${transaction.status}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            {userStats && (
              <div className="wallet-card insights-card">
                <div className="card-header">
                  <h3>💡 Insights</h3>
                </div>
                <div className="insights-content">
                  <div className="insight-item">
                    <span className="insight-label">Best Sport:</span>
                    <span className="insight-value">{userStats.insights.strongestSport}</span>
                  </div>
                  <div className="insight-item">
                    <span className="insight-label">Best Time:</span>
                    <span className="insight-value">{userStats.insights.bestBettingTime}</span>
                  </div>
                  <div className="insight-item">
                    <span className="insight-label">Winning Streak:</span>
                    <span className="insight-value">{userStats.insights.winningStreak} bets</span>
                  </div>
                  <div className="insight-item">
                    <span className="insight-label">Monthly Trend:</span>
                    <span className={`insight-value ${userStats.insights.monthlyTrend.includes('+') ? 'positive' : 'negative'}`}>
                      {userStats.insights.monthlyTrend}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="transactions-content">
          <div className="transactions-header">
            <div className="filters-section">
              <div className="filter-group">
                <label>Type:</label>
                <select
                  value={transactionFilter}
                  onChange={(e) => setTransactionFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="bet">Bets</option>
                  <option value="win">Wins</option>
                  <option value="refund">Refunds</option>
                  <option value="bonus">Bonuses</option>
                  <option value="fee">Fees</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Date Range:</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="date-input"
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="date-input"
                />
              </div>

              <div className="filter-group">
                <label>Search:</label>
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-group">
                <label>Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="sort-select"
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="type">Type</option>
                </select>
                <button
                  onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="sort-order-btn"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            <div className="actions-section">
              <button onClick={exportTransactions} className="export-btn">
                📊 Export CSV
              </button>
            </div>
          </div>

          <div className="transactions-list">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="transaction-card">
                  <div className="transaction-header">
                    <div className="transaction-icon">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="transaction-info">
                      <div className="transaction-description">{transaction.description}</div>
                      <div className="transaction-meta">
                        {new Date(transaction.timestamp).toLocaleString()} • {transaction.reference}
                      </div>
                    </div>
                    <div className="transaction-amount">
                      <span className={`amount ${transaction.type === 'withdrawal' || transaction.type === 'bet' ? 'negative' : 'positive'}`}>
                        {transaction.type === 'withdrawal' || transaction.type === 'bet' ? '-' : '+'}{formatCurrency(transaction.amount)}
                      </span>
                      <span className={`status ${transaction.status}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                  <div className="transaction-details">
                    <div className="detail-item">
                      <span className="label">Balance After:</span>
                      <span className="value">{formatCurrency(transaction.balanceAfter)}</span>
                    </div>
                    {transaction.paymentMethod && (
                      <div className="detail-item">
                        <span className="label">Payment Method:</span>
                        <span className="value">{transaction.paymentMethod}</span>
                      </div>
                    )}
                    {transaction.fees && (
                      <div className="detail-item">
                        <span className="label">Fees:</span>
                        <span className="value">{formatCurrency(transaction.fees)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-transactions">
                <p>No transactions found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payment-methods' && (
        <div className="payment-methods-content">
          <div className="payment-methods-header">
            <h2>💳 Payment Methods</h2>
          </div>

          <div className="payment-methods-grid">
            {paymentMethods.map((method) => (
              <div key={method.id} className="payment-method-card">
                <div className="method-header">
                  <div className="method-icon">
                    {method.type === 'credit_card' ? '💳' :
                     method.type === 'debit_card' ? '🏦' :
                     method.type === 'bank_transfer' ? '🏛️' :
                     method.type === 'paypal' ? '📧' :
                     method.type === 'crypto' ? '₿' :
                     method.type === 'ewallet' ? '📱' : '💳'}
                  </div>
                  <div className="method-info">
                    <h3>{method.name}</h3>
                    <p>{method.type.replace('_', ' ').toUpperCase()}</p>
                    {method.last4 && <p>**** {method.last4}</p>}
                    {method.expiry && <p>Expires: {method.expiry}</p>}
                  </div>
                  <div className="method-status">
                    {method.isDefault && <span className="default-badge">Default</span>}
                    {method.isVerified && <span className="verified-badge">✓ Verified</span>}
                  </div>
                </div>
                <div className="method-details">
                  {method.processingTime && (
                    <div className="detail-item">
                      <span className="label">Processing Time:</span>
                      <span className="value">{method.processingTime}</span>
                    </div>
                  )}
                  {method.fees && (
                    <div className="detail-item">
                      <span className="label">Fees:</span>
                      <span className="value">{formatCurrency(method.fees)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="security-content">
          <div className="security-header">
            <h2>🔒 Security Settings</h2>
            <button onClick={() => setShowSecuritySettings(true)} className="update-security-btn">
              Update Settings
            </button>
          </div>

          {securitySettings && (
            <div className="security-grid">
              <div className="security-card">
                <div className="card-header">
                  <h3>🔐 PIN Protection</h3>
                  <span className={`status ${securitySettings.pinEnabled ? 'enabled' : 'disabled'}`}>
                    {securitySettings.pinEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p>Add an extra layer of security with a PIN for withdrawals</p>
              </div>

              <div className="security-card">
                <div className="card-header">
                  <h3>🔑 Two-Factor Authentication</h3>
                  <span className={`status ${securitySettings.twoFactorEnabled ? 'enabled' : 'disabled'}`}>
                    {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p>Secure your account with 2FA using an authenticator app</p>
              </div>

              <div className="security-card">
                <div className="card-header">
                  <h3>📱 Last Login</h3>
                </div>
                <p>{securitySettings.lastLogin}</p>
              </div>

              <div className="security-card">
                <div className="card-header">
                  <h3>📊 Login History</h3>
                </div>
                <div className="login-history">
                  {securitySettings.loginHistory.slice(0, 5).map((login, index) => (
                    <div key={index} className="login-item">
                      {login}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>💰 Deposit Funds</h3>
              <button onClick={() => setShowDeposit(false)} className="close-btn">×</button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Amount:</label>
                <ValidatedInput
                  type="wallet-operation"
                  value={depositAmount}
                  onChange={handleAmountChange}
                  operation="deposit"
                  rules={{
                    min: 1,
                    max: 10000
                  }}
                  placeholder="Enter amount"
                />
              </div>
              <div className="form-group">
                <label>Payment Method:</label>
                <select
                  value={depositRequest.method}
                  onChange={(e) => setDepositRequest(prev => ({ ...prev, method: e.target.value }))}
                  className="form-select"
                >
                  <option value="">Select payment method</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
              <div className="modal-actions">
                <button onClick={handleDeposit} className="primary-btn" disabled={!amountValidation.isValid}>
                  Deposit
                </button>
                <button onClick={() => setShowDeposit(false)} className="secondary-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>💸 Withdraw Funds</h3>
              <button onClick={() => setShowWithdrawal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Amount:</label>
                <ValidatedInput
                  type="wallet-operation"
                  value={withdrawalRequest.amount.toString()}
                  onChange={handleWithdrawalAmountChange}
                  operation="withdraw"
                  walletBalance={walletBalance?.availableForWithdrawal || 0}
                  rules={{
                    min: 1,
                    max: walletBalance?.availableForWithdrawal || 0
                  }}
                  placeholder="Enter amount"
                />
              </div>
              <div className="form-group">
                <label>Withdrawal Method:</label>
                <select
                  value={withdrawalRequest.method}
                  onChange={(e) => setWithdrawalRequest(prev => ({ ...prev, method: e.target.value }))}
                  className="form-select"
                >
                  <option value="">Select withdrawal method</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="crypto">Cryptocurrency</option>
                </select>
              </div>
              <div className="form-group">
                <label>Account Details:</label>
                <textarea
                  value={withdrawalRequest.accountDetails}
                  onChange={(e) => setWithdrawalRequest(prev => ({ ...prev, accountDetails: e.target.value }))}
                  placeholder="Enter account details"
                  className="form-textarea"
                />
              </div>
              <div className="modal-actions">
                <button onClick={handleWithdrawal} className="primary-btn" disabled={!withdrawalValidation.isValid}>
                  Withdraw
                </button>
                <button onClick={() => setShowWithdrawal(false)} className="secondary-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings Modal */}
      {showSecuritySettings && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>🔒 Security Settings</h3>
              <button onClick={() => setShowSecuritySettings(false)} className="close-btn">×</button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>PIN (4-6 digits):</label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN"
                  maxLength={6}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Confirm PIN:</label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Confirm PIN"
                  maxLength={6}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={twoFactorEnabled}
                    onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                    className="form-checkbox"
                  />
                  Enable Two-Factor Authentication
                </label>
              </div>
              <div className="modal-actions">
                <button onClick={handleSecurityUpdate} className="primary-btn">
                  Update Settings
                </button>
                <button onClick={() => setShowSecuritySettings(false)} className="secondary-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletDashboard;




