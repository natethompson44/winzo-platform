import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/axios';
import { API_ENDPOINTS, handleApiError } from '../config/api';
import './BettingHistory.css';

interface BettingHistoryItem {
  id: number;
  selected_team: string;
  odds: number;
  stake: number;
  status: string;
  potential_payout: number;
  placed_at: string;
  settled_at?: string;
  bet_type: string;
  market_type: string;
  sportsEvent: {
    external_id: string;
    sport_key: string;
    home_team: string;
    away_team: string;
    commence_time: string;
    completed: boolean;
    home_score?: number;
    away_score?: number;
  };
}

interface BettingStats {
  totalBets: number;
  totalStaked: number;
  totalWinnings: number;
  profit: number;
  winRate: number;
  betsWon: number;
  betsLost: number;
  betsPending: number;
}

const BettingHistory: React.FC = () => {
  const { user } = useAuth();
  const [bets, setBets] = useState<BettingHistoryItem[]>([]);
  const [stats, setStats] = useState<BettingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchBettingHistory = useCallback(async (loadMore = false) => {
    try {
      if (!loadMore) {
        setLoading(true);
        setPage(0);
      }
      setError('');
      const currentPage = loadMore ? page + 1 : 0;
      const params = new URLSearchParams({
        limit: '20',
        offset: (currentPage * 20).toString()
      });
      if (filter !== 'all') {
        params.append('status', filter);
      }
      const response = await apiClient.get(`${API_ENDPOINTS.BET_HISTORY}?${params}`);
      if (response.data.success) {
        const newBets = response.data.data;
        setBets(loadMore ? [...bets, ...newBets] : newBets);
        setStats(response.data.summary);
        setHasMore(response.data.pagination.hasMore);
        setPage(currentPage);
      } else {
        setError(response.data.error || 'Failed to load betting history');
      }
    } catch (error: any) {
      console.error('Error fetching betting history:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  }, [page, filter, bets]);

  useEffect(() => {
    if (user) {
      fetchBettingHistory();
    }
  }, [user, filter, fetchBettingHistory]);

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  if (!user) {
    return (
      <div className="betting-history-container">
        <div className="auth-required">
          <h2>Login Required</h2>
          <p>Please log in to view your betting history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="betting-history-container">
      <header className="history-header">
        <h1> Betting History</h1>
        <p>Track your betting performance and results</p>
      </header>
      {error && (
        <div className="error-banner">
          <span>⚠ {error}</span>
          <button onClick={() => fetchBettingHistory()} className="retry-button">
            Retry
          </button>
        </div>
      )}
      {/* Stats Overview */}
      {stats && (
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-value">{stats.totalBets}</div>
            <div className="stat-label">Total Bets</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatCurrency(stats.totalStaked)}</div>
            <div className="stat-label">Total Staked</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatCurrency(stats.totalWinnings)}</div>
            <div className="stat-label">Total Winnings</div>
          </div>
          <div className={`stat-card ${stats.profit >= 0 ? 'profit' : 'loss'}`}>
            <div className="stat-value">{formatCurrency(stats.profit)}</div>
            <div className="stat-label">Profit/Loss</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.winRate.toFixed(1)}%</div>
            <div className="stat-label">Win Rate</div>
          </div>
        </div>
      )}
      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['all', 'pending', 'won', 'lost', 'cancelled'].map((status) => (
          <button
            key={status}
            className={`filter-tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>
      {/* Betting History List */}
      <div className="history-list">
        {loading && bets.length === 0 ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading betting history...</p>
          </div>
        ) : bets.length > 0 ? (
          <>
            {bets.map((bet) => (
              <BettingHistoryCard key={bet.id} bet={bet} />
            ))}
            {hasMore && (
              <button
                className="load-more-btn"
                onClick={() => fetchBettingHistory(true)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </>
        ) : (
          <div className="no-bets">
            <div className="no-bets-icon"></div>
            <h3>No betting history</h3>
            <p>Start placing bets to see your history here!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Betting History Card Component
interface BettingHistoryCardProps {
  bet: BettingHistoryItem;
}

const BettingHistoryCard: React.FC<BettingHistoryCardProps> = ({ bet }) => {
  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="betting-history-card">
      <div className="bet-header">
        <div className="bet-matchup">
          <span className="teams">
            {bet.sportsEvent.away_team} @ {bet.sportsEvent.home_team}
          </span>
          <span className="sport">{bet.sportsEvent.sport_key.toUpperCase()}</span>
        </div>
      </div>
      <div className="bet-details">
        <div className="bet-selection">
          <span className="selected-team">{bet.selected_team}</span>
        </div>
        <div className="bet-amounts">
          <div className="amount-item">
            <span className="label">Stake:</span>
            <span className="value">{formatCurrency(bet.stake)}</span>
          </div>
          <div className="amount-item">
            <span className="label">Potential:</span>
            <span className="value">{formatCurrency(bet.potential_payout)}</span>
          </div>
          {bet.status === 'won' && (
            <div className="amount-item profit">
              <span className="label">Profit:</span>
              <span className="value">{formatCurrency(bet.potential_payout - bet.stake)}</span>
            </div>
          )}
        </div>
        <div className="bet-meta">
          <span className="bet-type">{bet.bet_type.toUpperCase()}</span>
          <span className="placed-date">Placed: {bet.placed_at}</span>
          {bet.settled_at && (
            <span className="settled-date">Settled: {bet.settled_at}</span>
          )}
        </div>
        {bet.sportsEvent.completed && (bet.sportsEvent.home_score !== null ||
          bet.sportsEvent.away_score !== null) && (
          <div className="game-score">
            Final Score: {bet.sportsEvent.away_team}
            {bet.sportsEvent.away_score} - {bet.sportsEvent.home_score}
            {bet.sportsEvent.home_team}
          </div>
        )}
      </div>
    </div>
  );
};

export default BettingHistory;
