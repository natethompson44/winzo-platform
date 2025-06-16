import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/axios';
import { API_ENDPOINTS } from '../config/api';
import { formatCurrency, formatPercentage } from '../utils/numberUtils';
import { Bet, ApiResponse, ApiError } from '../types';
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
  averageStake: number;
  averageOdds: number;
  roi: number;
  longestStreak: number;
  currentStreak: number;
}

interface AnalyticsData {
  sportPerformance: { sport: string; bets: number; wins: number; winRate: number; profit: number }[];
  timePerformance: { hour: number; bets: number; wins: number; winRate: number }[];
  stakePerformance: { range: string; bets: number; wins: number; winRate: number; profit: number }[];
  monthlyPerformance: { month: string; bets: number; wins: number; profit: number }[];
}

interface FilterOptions {
  status: string;
  sport: string;
  betType: string;
  dateRange: { start: string; end: string };
  minStake: number;
  maxStake: number;
  minOdds: number;
  maxOdds: number;
}

const BettingHistory: React.FC = () => {
  const { user } = useAuth();
  const [bets, setBets] = useState<BettingHistoryItem[]>([]);
  const [stats, setStats] = useState<BettingStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list');
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    sport: 'all',
    betType: 'all',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    minStake: 0,
    maxStake: 10000,
    minOdds: 1.01,
    maxOdds: 1000
  });

  const fetchBettingHistory = useCallback(async (loadMore = false) => {
    if (!user) return;
    
    try {
      if (!loadMore) {
        setLoading(true);
        setPage(0);
      }
      setError('');
      
      const currentPage = loadMore ? page + 1 : 0;
      const params = new URLSearchParams({
        limit: '50',
        offset: (currentPage * 50).toString()
      });

      // Add filters to params
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.sport !== 'all') params.append('sport', filters.sport);
      if (filters.betType !== 'all') params.append('bet_type', filters.betType);
      if (filters.dateRange.start) params.append('start_date', filters.dateRange.start);
      if (filters.dateRange.end) params.append('end_date', filters.dateRange.end);
      if (filters.minStake > 0) params.append('min_stake', filters.minStake.toString());
      if (filters.maxStake < 10000) params.append('max_stake', filters.maxStake.toString());
      if (filters.minOdds > 1.01) params.append('min_odds', filters.minOdds.toString());
      if (filters.maxOdds < 1000) params.append('max_odds', filters.maxOdds.toString());

      const [historyResponse, analyticsResponse] = await Promise.all([
        apiClient.get(`${API_ENDPOINTS.BET_HISTORY}?${params}`),
        apiClient.get(`${API_ENDPOINTS.BET_HISTORY}/analytics?${params}`)
      ]);

      if (historyResponse.data.success) {
        const newBets = historyResponse.data.data;
        setBets(loadMore ? [...bets, ...newBets] : newBets);
        setStats(historyResponse.data.summary);
        setHasMore(historyResponse.data.pagination.hasMore);
        setPage(currentPage);
      }

      if (analyticsResponse.data.success) {
        setAnalytics(analyticsResponse.data.data);
      }
    } catch (error: unknown) {
      const apiError = error as ApiError;
      setError(apiError.message || 'Failed to load betting history');
    } finally {
      setLoading(false);
    }
  }, [page, filters, bets]);

  const filteredBets = useMemo(() => {
    return bets.filter(bet => {
      const matchesStatus = filters.status === 'all' || bet.status === filters.status;
      const matchesSport = filters.sport === 'all' || bet.sportsEvent.sport_key === filters.sport;
      const matchesBetType = filters.betType === 'all' || bet.bet_type === filters.betType;
      const matchesStake = bet.stake >= filters.minStake && bet.stake <= filters.maxStake;
      const matchesOdds = bet.odds >= filters.minOdds && bet.odds <= filters.maxOdds;
      
      return matchesStatus && matchesSport && matchesBetType && matchesStake && matchesOdds;
    });
  }, [bets, filters]);

  const uniqueSports = useMemo(() => {
    const sports = new Set(bets.map(bet => bet.sportsEvent.sport_key));
    return Array.from(sports);
  }, [bets]);

  const uniqueBetTypes = useMemo(() => {
    const types = new Set(bets.map(bet => bet.bet_type));
    return Array.from(types);
  }, [bets]);

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Sport', 'Teams', 'Selection', 'Odds', 'Stake', 'Potential Payout', 'Status', 'Result'],
      ...filteredBets.map(bet => [
        new Date(bet.placed_at).toLocaleDateString(),
        bet.sportsEvent.sport_key.toUpperCase(),
        `${bet.sportsEvent.away_team} @ ${bet.sportsEvent.home_team}`,
        bet.selected_team,
        bet.odds.toString(),
        formatCurrency(bet.stake),
        formatCurrency(bet.potential_payout),
        bet.status.toUpperCase(),
        bet.status === 'won' ? formatCurrency(bet.potential_payout - bet.stake) : 
        bet.status === 'lost' ? formatCurrency(-bet.stake) : 'Pending'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `betting-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Implementation for PDF export
    alert('PDF export feature coming soon!');
  };

  useEffect(() => {
    if (user) {
      fetchBettingHistory();
    }
  }, [user, filters, fetchBettingHistory]);

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
        <h1>📊 Betting History & Analytics</h1>
        <p>Comprehensive analysis of your betting performance</p>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠ {error}</span>
          <button onClick={() => fetchBettingHistory()} className="retry-button">
            Retry
          </button>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="view-mode-toggle">
        <button
          className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          📋 List View
        </button>
        <button
          className={`toggle-btn ${viewMode === 'analytics' ? 'active' : ''}`}
          onClick={() => setViewMode('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="advanced-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sport:</label>
            <select
              value={filters.sport}
              onChange={(e) => setFilters(prev => ({ ...prev, sport: e.target.value }))}
            >
              <option value="all">All Sports</option>
              {uniqueSports.map(sport => (
                <option key={sport} value={sport}>{sport.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Bet Type:</label>
            <select
              value={filters.betType}
              onChange={(e) => setFilters(prev => ({ ...prev, betType: e.target.value }))}
            >
              <option value="all">All Types</option>
              {uniqueBetTypes.map(type => (
                <option key={type} value={type}>{type.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Date Range:</label>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                dateRange: { ...prev.dateRange, start: e.target.value } 
              }))}
            />
            <span>to</span>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                dateRange: { ...prev.dateRange, end: e.target.value } 
              }))}
            />
          </div>

          <div className="filter-group">
            <label>Stake Range:</label>
            <input
              type="number"
              placeholder="Min"
              value={filters.minStake}
              onChange={(e) => setFilters(prev => ({ ...prev, minStake: Number(e.target.value) }))}
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxStake}
              onChange={(e) => setFilters(prev => ({ ...prev, maxStake: Number(e.target.value) }))}
            />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="stats-overview">
          <div className="stat-card primary">
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
            <div className="stat-value">{formatPercentage(stats.winRate)}</div>
            <div className="stat-label">Win Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatPercentage(stats.roi)}</div>
            <div className="stat-label">ROI</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.longestStreak}</div>
            <div className="stat-label">Longest Streak</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatCurrency(stats.averageStake)}</div>
            <div className="stat-label">Avg Stake</div>
          </div>
        </div>
      )}

      {viewMode === 'analytics' && analytics ? (
        <div className="analytics-view">
          {/* Sport Performance */}
          <div className="analytics-section">
            <h2>🏈 Sport Performance</h2>
            <div className="sport-performance-grid">
              {analytics.sportPerformance.map(sport => (
                <div key={sport.sport} className="sport-performance-card">
                  <h3>{sport.sport.toUpperCase()}</h3>
                  <div className="sport-stats">
                    <div className="sport-stat">
                      <span className="stat-label">Bets:</span>
                      <span className="stat-value">{sport.bets}</span>
                    </div>
                    <div className="sport-stat">
                      <span className="stat-label">Win Rate:</span>
                      <span className="stat-value">{formatPercentage(sport.winRate)}</span>
                    </div>
                    <div className="sport-stat">
                      <span className="stat-label">Profit:</span>
                      <span className={`stat-value ${sport.profit >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(sport.profit)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Performance */}
          <div className="analytics-section">
            <h2>⏰ Time Performance</h2>
            <div className="time-performance-chart">
              {analytics.timePerformance.map(timeSlot => (
                <div key={timeSlot.hour} className="time-slot">
                  <div className="time-label">{timeSlot.hour}:00</div>
                  <div className="time-bar">
                    <div 
                      className="time-fill" 
                      style={{ 
                        width: `${(timeSlot.bets / Math.max(...analytics.timePerformance.map(t => t.bets))) * 100}%`,
                        backgroundColor: timeSlot.winRate > 0.5 ? '#48bb78' : '#e53e3e'
                      }}
                    ></div>
                  </div>
                  <div className="time-stats">
                    <span>{timeSlot.bets} bets</span>
                    <span>{formatPercentage(timeSlot.winRate)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Performance */}
          <div className="analytics-section">
            <h2>📅 Monthly Performance</h2>
            <div className="monthly-performance-chart">
              {analytics.monthlyPerformance.map(month => (
                <div key={month.month} className="month-bar">
                  <div className="month-label">{month.month}</div>
                  <div className="month-stats">
                    <div className="month-stat">
                      <span className="stat-label">Bets:</span>
                      <span className="stat-value">{month.bets}</span>
                    </div>
                    <div className="month-stat">
                      <span className="stat-label">Wins:</span>
                      <span className="stat-value">{month.wins}</span>
                    </div>
                    <div className="month-stat">
                      <span className="stat-label">Profit:</span>
                      <span className={`stat-value ${month.profit >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(month.profit)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="history-list">
          {/* Export Controls */}
          <div className="export-controls">
            <button onClick={exportToCSV} className="export-btn csv">
              📥 Export CSV
            </button>
            <button onClick={exportToPDF} className="export-btn pdf">
              📄 Export PDF
            </button>
          </div>

          {loading && filteredBets.length === 0 ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading betting history...</p>
            </div>
          ) : filteredBets.length > 0 ? (
            <>
              {filteredBets.map((bet) => (
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
              <div className="no-bets-icon">📊</div>
              <h3>No betting history found</h3>
              <p>Try adjusting your filters or start placing bets to see your history here!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Betting History Card Component
interface BettingHistoryCardProps {
  bet: BettingHistoryItem;
}

const BettingHistoryCard: React.FC<BettingHistoryCardProps> = ({ bet }) => {
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
      case 'won': return '🏆';
      case 'lost': return '❌';
      case 'pending': return '⏳';
      case 'cancelled': return '🚫';
      default: return '❓';
    }
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
        <div className="bet-status">
          <span
            className="status-badge"
            style={{ color: getStatusColor(bet.status) }}
          >
            {getStatusIcon(bet.status)} {bet.status.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="bet-details">
        <div className="bet-selection">
          <span className="selected-team">{bet.selected_team}</span>
          <span className="odds">({bet.odds > 0 ? '+' : ''}{bet.odds})</span>
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
          {bet.status === 'lost' && (
            <div className="amount-item loss">
              <span className="label">Loss:</span>
              <span className="value">{formatCurrency(-bet.stake)}</span>
            </div>
          )}
        </div>
        
        <div className="bet-meta">
          <span className="bet-type">{bet.bet_type.toUpperCase()}</span>
          <span className="placed-date">Placed: {new Date(bet.placed_at).toLocaleString()}</span>
          {bet.settled_at && (
            <span className="settled-date">Settled: {new Date(bet.settled_at).toLocaleString()}</span>
          )}
        </div>
        
        {bet.sportsEvent.completed && (bet.sportsEvent.home_score !== null ||
          bet.sportsEvent.away_score !== null) && (
          <div className="game-score">
            Final Score: {bet.sportsEvent.away_team} {bet.sportsEvent.away_score} - {bet.sportsEvent.home_score} {bet.sportsEvent.home_team}
          </div>
        )}
      </div>
    </div>
  );
};

export default BettingHistory;
