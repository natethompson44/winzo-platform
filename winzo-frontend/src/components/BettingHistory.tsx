import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './BettingHistory.css';

interface Bet {
  id: string;
  event: string;
  sport: string;
  market: string;
  outcome: string;
  amount: number;
  odds: number;
  potentialPayout: number;
  actualPayout?: number;
  status: 'pending' | 'won' | 'lost' | 'cancelled' | 'pushed';
  placedAt: string;
  settledAt?: string;
}

interface BettingStats {
  totalBets: number;
  pendingBets: number;
  wonBets: number;
  lostBets: number;
  winRate: string;
  totalWagered: string;
  totalWinnings: string;
  netProfit: string;
}

/**
 * BettingHistory Component - Track Your WINZO Journey
 * 
 * This component displays betting history with the WINZO "Big Win Energy"
 * philosophy, celebrating wins and maintaining positive messaging for losses.
 * Mobile-first design ensures smooth experience across all devices.
 */
const BettingHistory: React.FC = () => {
  const { token } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [stats, setStats] = useState<BettingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchBettingHistory = async (statusFilter = 'all', pageNum = 1) => {
    setLoading(true);
    try {
      const params: any = { page: pageNum, limit: 20 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await axios.get(`${API_BASE}/sports/my-bets`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      setBets(response.data.data.bets);
      setStats(response.data.data.statistics);
      setTotalPages(response.data.data.pagination.totalPages);
      
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load betting history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBettingHistory(filter, page);
  }, [filter, page]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won': return '🎉';
      case 'lost': return '📈';
      case 'pending': return '⏳';
      case 'cancelled': return '❌';
      case 'pushed': return '🔄';
      default: return '🎯';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'won': return 'BIG WIN!';
      case 'lost': return 'Next Time!';
      case 'pending': return 'In Play';
      case 'cancelled': return 'Cancelled';
      case 'pushed': return 'Push';
      default: return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'won': return 'status-won';
      case 'lost': return 'status-lost';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'pushed': return 'status-pushed';
      default: return 'status-default';
    }
  };

  if (loading && bets.length === 0) {
    return (
      <div className="betting-history">
        <div className="winzo-loading">
          <div className="winzo-spinner"></div>
          <p>🔥 Loading your WINZO journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="betting-history">
      {/* Header */}
      <div className="history-header">
        <h1 className="winzo-title">🏆 Your WINZO Journey</h1>
        <p className="winzo-subtitle">Every bet tells a winning story!</p>
      </div>

      {error && (
        <div className="winzo-error">
          <p>⚠️ {error}</p>
          <button onClick={() => setError(null)} className="dismiss-btn">
            Let's try again!
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalBets}</div>
                <div className="stat-label">Total Bets</div>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <div className="stat-value">{stats.wonBets}</div>
                <div className="stat-label">Wins</div>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">{stats.winRate}</div>
                <div className="stat-label">Win Rate</div>
              </div>
            </div>

            <div className={`stat-card ${parseFloat(stats.netProfit.replace('$', '')) >= 0 ? 'profit' : 'building'}`}>
              <div className="stat-icon">
                {parseFloat(stats.netProfit.replace('$', '')) >= 0 ? '💰' : '📈'}
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.netProfit}</div>
                <div className="stat-label">
                  {parseFloat(stats.netProfit.replace('$', '')) >= 0 ? 'Profit' : 'Building'}
                </div>
              </div>
            </div>
          </div>

          <div className="stats-summary">
            <div className="summary-item">
              <span className="summary-label">Total Wagered:</span>
              <span className="summary-value">{stats.totalWagered}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Winnings:</span>
              <span className="summary-value win">{stats.totalWinnings}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="filter-section">
        <div className="filter-tabs">
          {[
            { key: 'all', label: 'All Bets', icon: '🎯' },
            { key: 'pending', label: 'Active', icon: '⏳' },
            { key: 'won', label: 'Wins', icon: '🏆' },
            { key: 'lost', label: 'Learning', icon: '📈' }
          ].map(tab => (
            <button
              key={tab.key}
              className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
              onClick={() => {
                setFilter(tab.key);
                setPage(1);
              }}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Betting History List */}
      <div className="bets-section">
        {bets.length === 0 ? (
          <div className="no-bets">
            <div className="no-bets-icon">🚀</div>
            <h3>Ready to Start Your Winning Journey?</h3>
            <p>Your first Big Win Energy bet is just a tap away!</p>
          </div>
        ) : (
          <div className="bets-list">
            {bets.map((bet) => (
              <div key={bet.id} className={`bet-card ${getStatusClass(bet.status)}`}>
                <div className="bet-header">
                  <div className="bet-event">
                    <h4>{bet.event}</h4>
                    <span className="bet-sport">{bet.sport}</span>
                  </div>
                  <div className={`bet-status ${getStatusClass(bet.status)}`}>
                    <span className="status-icon">{getStatusIcon(bet.status)}</span>
                    <span className="status-text">{getStatusMessage(bet.status)}</span>
                  </div>
                </div>

                <div className="bet-details">
                  <div className="bet-selection">
                    <span className="selection-label">Selection:</span>
                    <span className="selection-value">
                      {bet.outcome} ({bet.market})
                    </span>
                  </div>
                  
                  <div className="bet-odds">
                    <span className="odds-label">Odds:</span>
                    <span className="odds-value">
                      {bet.odds > 0 ? '+' : ''}{bet.odds}
                    </span>
                  </div>
                </div>

                <div className="bet-amounts">
                  <div className="amount-row">
                    <span className="amount-label">Bet Amount:</span>
                    <span className="amount-value">${bet.amount.toFixed(2)}</span>
                  </div>
                  
                  {bet.status === 'won' && bet.actualPayout && (
                    <div className="amount-row win">
                      <span className="amount-label">Payout:</span>
                      <span className="amount-value win">${bet.actualPayout.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {bet.status === 'pending' && (
                    <div className="amount-row potential">
                      <span className="amount-label">Potential Win:</span>
                      <span className="amount-value potential">
                        ${(bet.potentialPayout - bet.amount).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="bet-footer">
                  <div className="bet-date">
                    <span className="date-label">Placed:</span>
                    <span className="date-value">
                      {new Date(bet.placedAt).toLocaleDateString()} at{' '}
                      {new Date(bet.placedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  {bet.settledAt && (
                    <div className="bet-settled">
                      <span className="settled-label">Settled:</span>
                      <span className="settled-value">
                        {new Date(bet.settledAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              ← Previous
            </button>
            
            <div className="pagination-info">
              <span>Page {page} of {totalPages}</span>
            </div>
            
            <button
              className="pagination-btn"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Motivational Footer */}
      {bets.length > 0 && (
        <div className="motivation-footer">
          <div className="motivation-content">
            {stats && parseInt(stats.wonBets.toString()) > 0 ? (
              <p>🔥 You've got {stats.wonBets} wins under your belt! Your Big Win Energy is growing stronger!</p>
            ) : (
              <p>💪 Every champion started with their first bet. Your winning moment is coming!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BettingHistory;

