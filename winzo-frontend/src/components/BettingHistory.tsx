import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatPercentage } from '../utils/numberUtils';
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
  streakType: 'winning' | 'losing';
}

interface AnalyticsData {
  sportPerformance: { sport: string; bets: number; wins: number; winRate: number; profit: number; avgOdds: number }[];
  timePerformance: { hour: number; bets: number; wins: number; winRate: number; profit: number }[];
  stakePerformance: { range: string; bets: number; wins: number; winRate: number; profit: number }[];
  monthlyPerformance: { month: string; bets: number; wins: number; profit: number; winRate: number }[];
  dailyPerformance: { date: string; bets: number; profit: number }[];
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
  const [activeTab, setActiveTab] = useState<'overview' | 'list' | 'analytics' | 'insights'>('overview');
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

      // Mock data for demo
      const mockStats: BettingStats = {
        totalBets: 145,
        totalStaked: 3625,
        totalWinnings: 4180,
        profit: 555,
        winRate: 0.623,
        betsWon: 90,
        betsLost: 52,
        betsPending: 3,
        averageStake: 25,
        averageOdds: 1.92,
        roi: 0.153,
        longestStreak: 7,
        currentStreak: 3,
        streakType: 'winning'
      };

      const mockAnalytics: AnalyticsData = {
        sportPerformance: [
          { sport: 'basketball', bets: 45, wins: 28, winRate: 0.622, profit: 185, avgOdds: 1.85 },
          { sport: 'football', bets: 38, wins: 25, winRate: 0.658, profit: 220, avgOdds: 1.95 },
          { sport: 'baseball', bets: 32, wins: 18, winRate: 0.563, profit: 95, avgOdds: 2.1 },
          { sport: 'hockey', bets: 20, wins: 13, winRate: 0.65, profit: 75, avgOdds: 1.75 },
          { sport: 'soccer', bets: 10, wins: 6, winRate: 0.6, profit: -20, avgOdds: 2.2 }
        ],
        timePerformance: [
          { hour: 14, bets: 25, wins: 16, winRate: 0.64, profit: 125 },
          { hour: 19, bets: 32, wins: 20, winRate: 0.625, profit: 180 },
          { hour: 21, bets: 28, wins: 15, winRate: 0.536, profit: 85 },
          { hour: 16, bets: 22, wins: 14, winRate: 0.636, profit: 95 },
          { hour: 13, bets: 18, wins: 12, winRate: 0.667, profit: 70 }
        ],
        stakePerformance: [
          { range: '$5-10', bets: 35, wins: 22, winRate: 0.629, profit: 85 },
          { range: '$11-25', bets: 48, wins: 30, winRate: 0.625, profit: 180 },
          { range: '$26-50', bets: 35, wins: 21, winRate: 0.6, profit: 165 },
          { range: '$51-100', bets: 20, wins: 13, winRate: 0.65, profit: 95 },
          { range: '$100+', bets: 7, wins: 4, winRate: 0.571, profit: 30 }
        ],
        monthlyPerformance: [
          { month: 'Jan', bets: 38, wins: 24, profit: 185, winRate: 0.632 },
          { month: 'Feb', bets: 42, wins: 26, profit: 220, winRate: 0.619 },
          { month: 'Mar', bets: 45, wins: 28, profit: 150, winRate: 0.622 },
          { month: 'Apr', bets: 20, wins: 12, profit: 0, winRate: 0.6 }
        ],
        dailyPerformance: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          bets: Math.floor(Math.random() * 8) + 1,
          profit: (Math.random() - 0.4) * 200
        }))
      };

      const mockBets: BettingHistoryItem[] = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        selected_team: ['Lakers', 'Warriors', 'Chiefs', 'Patriots', 'Yankees'][Math.floor(Math.random() * 5)],
        odds: +(1.5 + Math.random() * 2).toFixed(2),
        stake: [10, 25, 50, 100][Math.floor(Math.random() * 4)],
        status: ['won', 'lost', 'pending'][Math.floor(Math.random() * 3)],
        potential_payout: 0,
        placed_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        settled_at: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        bet_type: ['moneyline', 'spread', 'total'][Math.floor(Math.random() * 3)],
        market_type: ['h2h', 'spreads', 'totals'][Math.floor(Math.random() * 3)],
        sportsEvent: {
          external_id: `event_${i}`,
          sport_key: ['basketball', 'football', 'baseball'][Math.floor(Math.random() * 3)],
          home_team: ['Lakers', 'Warriors', 'Chiefs'][Math.floor(Math.random() * 3)],
          away_team: ['Celtics', 'Nuggets', 'Bills'][Math.floor(Math.random() * 3)],
          commence_time: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          completed: Math.random() > 0.4,
          home_score: Math.random() > 0.5 ? Math.floor(Math.random() * 120) : undefined,
          away_score: Math.random() > 0.5 ? Math.floor(Math.random() * 120) : undefined
        }
      }));

      // Calculate potential payouts
      mockBets.forEach(bet => {
        bet.potential_payout = bet.stake * bet.odds;
      });

      setBets(loadMore ? [...bets, ...mockBets] : mockBets);
      setStats(mockStats);
      setAnalytics(mockAnalytics);
      setHasMore(mockBets.length === 50);
      setPage(currentPage);
    } catch (error: any) {
      console.error('Error fetching betting history:', error);
      setError('Failed to load betting history. This is normal in demo mode.');
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
    alert('PDF export feature coming soon!');
  };

  useEffect(() => {
    if (user) {
      fetchBettingHistory();
    }
  }, [user, fetchBettingHistory]);

  if (!user) {
    return (
      <div className="betting-history-container">
        <div className="auth-required">
          <div className="auth-icon">
            <i className="bi bi-person-lock"></i>
          </div>
          <h2>Login Required</h2>
          <p>Please log in to view your betting history and analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="betting-history-container">
      {/* Header */}
      <div className="history-header">
        <div className="header-content">
          <div className="header-info">
            <h1>Betting History & Analytics</h1>
            <p>Comprehensive analysis of your betting performance and insights</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-outline-primary" onClick={exportToCSV}>
              <i className="bi bi-download"></i>
              Export CSV
            </button>
            <button className="btn btn-outline-secondary" onClick={exportToPDF}>
              <i className="bi bi-file-pdf"></i>
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle"></i>
          {error}
          <button onClick={() => fetchBettingHistory()} className="btn btn-sm btn-outline-warning">
            Retry
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="history-nav">
        <button
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="bi bi-speedometer2"></i>
          <span>Overview</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <i className="bi bi-list-ul"></i>
          <span>Bet History</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <i className="bi bi-graph-up"></i>
          <span>Analytics</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <i className="bi bi-lightbulb"></i>
          <span>Insights</span>
        </button>
      </div>

      {/* Content */}
      <div className="history-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Quick Stats */}
            {stats && (
              <div className="quick-stats">
                <div className="stat-card primary">
                  <div className="stat-icon">
                    <i className="bi bi-trophy"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stats.totalBets}</div>
                    <div className="stat-label">Total Bets</div>
                    <div className="stat-change">
                      <span className="change-text">+{stats.betsPending} pending</span>
                    </div>
                  </div>
                </div>

                <div className="stat-card success">
                  <div className="stat-icon">
                    <i className="bi bi-cash-stack"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{formatCurrency(stats.profit)}</div>
                    <div className="stat-label">Total Profit</div>
                    <div className="stat-change">
                      <span className={`change-text ${stats.profit >= 0 ? 'positive' : 'negative'}`}>
                        {stats.profit >= 0 ? '+' : ''}{formatPercentage(stats.roi)} ROI
                      </span>
                    </div>
                  </div>
                </div>

                <div className="stat-card info">
                  <div className="stat-icon">
                    <i className="bi bi-percent"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{formatPercentage(stats.winRate)}</div>
                    <div className="stat-label">Win Rate</div>
                    <div className="stat-change">
                      <span className="change-text">{stats.betsWon}W / {stats.betsLost}L</span>
                    </div>
                  </div>
                </div>

                <div className="stat-card warning">
                  <div className="stat-icon">
                    <i className="bi bi-fire"></i>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stats.currentStreak}</div>
                    <div className="stat-label">Current Streak</div>
                    <div className="stat-change">
                      <span className={`change-text ${stats.streakType === 'winning' ? 'positive' : 'negative'}`}>
                        {stats.streakType === 'winning' ? 'Winning' : 'Losing'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Performance Chart */}
            {analytics && (
              <div className="performance-chart">
                <div className="chart-header">
                  <h3>Daily Performance (Last 30 Days)</h3>
                  <div className="chart-legend">
                    <span className="legend-item profit">
                      <div className="legend-color profit"></div>
                      Profit Days
                    </span>
                    <span className="legend-item loss">
                      <div className="legend-color loss"></div>
                      Loss Days
                    </span>
                  </div>
                </div>
                <div className="chart-container">
                  {analytics.dailyPerformance.map((day, index) => (
                    <div key={day.date} className="chart-bar">
                      <div 
                        className={`bar ${day.profit >= 0 ? 'profit' : 'loss'}`}
                        style={{ 
                          height: `${Math.abs(day.profit) / 200 * 100}%`,
                          minHeight: '2px'
                        }}
                        title={`${day.date}: ${formatCurrency(day.profit)}`}
                      ></div>
                      {index % 5 === 0 && (
                        <div className="chart-label">
                          {new Date(day.date).getDate()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Sports */}
            {analytics && (
              <div className="top-sports">
                <h3>Sport Performance</h3>
                <div className="sports-grid">
                  {analytics.sportPerformance.slice(0, 3).map(sport => (
                    <div key={sport.sport} className="sport-card">
                      <div className="sport-header">
                        <h4>{sport.sport.toUpperCase()}</h4>
                        <span className={`profit-badge ${sport.profit >= 0 ? 'positive' : 'negative'}`}>
                          {formatCurrency(sport.profit)}
                        </span>
                      </div>
                      <div className="sport-stats">
                        <div className="sport-stat">
                          <span className="stat-label">Win Rate</span>
                          <span className="stat-value">{formatPercentage(sport.winRate)}</span>
                        </div>
                        <div className="sport-stat">
                          <span className="stat-label">Bets</span>
                          <span className="stat-value">{sport.bets}</span>
                        </div>
                        <div className="sport-stat">
                          <span className="stat-label">Avg Odds</span>
                          <span className="stat-value">{sport.avgOdds.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'list' && (
          <div className="list-tab">
            {/* Advanced Filters */}
            <div className="filters-section">
              <div className="filters-header">
                <h3>Filters</h3>
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setFilters({
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
                  })}
                >
                  Reset Filters
                </button>
              </div>
              
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Status</label>
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
                  <label>Sport</label>
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
                  <label>Bet Type</label>
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

                <div className="filter-group date-range">
                  <label>Date Range</label>
                  <div className="date-inputs">
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
                </div>
              </div>
            </div>

            {/* Bet List */}
            <div className="bets-list">
              {loading && filteredBets.length === 0 ? (
                <div className="loading-state">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p>Loading betting history...</p>
                </div>
              ) : filteredBets.length > 0 ? (
                <>
                  <div className="bets-header">
                    <h3>Your Bets ({filteredBets.length})</h3>
                  </div>
                  {filteredBets.map((bet) => (
                    <BettingHistoryCard key={bet.id} bet={bet} />
                  ))}
                  {hasMore && (
                    <button
                      className="btn btn-outline-primary load-more-btn"
                      onClick={() => fetchBettingHistory(true)}
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="bi bi-inbox"></i>
                  </div>
                  <h3>No bets found</h3>
                  <p>Try adjusting your filters or start placing bets to see your history here!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && analytics && (
          <div className="analytics-tab">
            {/* Sport Performance */}
            <div className="analytics-section">
              <div className="section-header">
                <h3>Sport Performance Analysis</h3>
                <p>Detailed breakdown of your performance across different sports</p>
              </div>
              <div className="sport-performance-grid">
                {analytics.sportPerformance.map(sport => (
                  <div key={sport.sport} className="sport-performance-card">
                    <div className="card-header">
                      <h4>{sport.sport.toUpperCase()}</h4>
                      <span className={`profit-indicator ${sport.profit >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(sport.profit)}
                      </span>
                    </div>
                    <div className="performance-metrics">
                      <div className="metric">
                        <span className="metric-label">Total Bets</span>
                        <span className="metric-value">{sport.bets}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Wins</span>
                        <span className="metric-value">{sport.wins}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Win Rate</span>
                        <span className="metric-value">{formatPercentage(sport.winRate)}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Avg Odds</span>
                        <span className="metric-value">{sport.avgOdds.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="win-rate-bar">
                      <div 
                        className="win-rate-fill"
                        style={{ width: `${sport.winRate * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Performance */}
            <div className="analytics-section">
              <div className="section-header">
                <h3>Time-Based Performance</h3>
                <p>Discover your most profitable betting times</p>
              </div>
              <div className="time-performance-chart">
                {analytics.timePerformance.map(timeSlot => (
                  <div key={timeSlot.hour} className="time-slot">
                    <div className="time-header">
                      <span className="time-label">{timeSlot.hour}:00</span>
                      <span className={`profit-value ${timeSlot.profit >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(timeSlot.profit)}
                      </span>
                    </div>
                    <div className="time-metrics">
                      <div className="metric-row">
                        <span>Bets: {timeSlot.bets}</span>
                        <span>Wins: {timeSlot.wins}</span>
                        <span>Rate: {formatPercentage(timeSlot.winRate)}</span>
                      </div>
                    </div>
                    <div className="performance-bar">
                      <div 
                        className={`bar-fill ${timeSlot.winRate > 0.5 ? 'good' : 'poor'}`}
                        style={{ width: `${timeSlot.winRate * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="analytics-section">
              <div className="section-header">
                <h3>Monthly Performance Trends</h3>
                <p>Track your betting performance over time</p>
              </div>
              <div className="monthly-chart">
                {analytics.monthlyPerformance.map(month => (
                  <div key={month.month} className="month-card">
                    <div className="month-header">
                      <h4>{month.month}</h4>
                      <span className={`month-profit ${month.profit >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(month.profit)}
                      </span>
                    </div>
                    <div className="month-stats">
                      <div className="stat-item">
                        <span className="stat-label">Bets</span>
                        <span className="stat-value">{month.bets}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Wins</span>
                        <span className="stat-value">{month.wins}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Win Rate</span>
                        <span className="stat-value">{formatPercentage(month.winRate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && stats && analytics && (
          <div className="insights-tab">
            <div className="insights-grid">
              {/* Best Performing Sport */}
              <div className="insight-card highlight">
                <div className="insight-icon">
                  <i className="bi bi-trophy-fill"></i>
                </div>
                <div className="insight-content">
                  <h4>Best Performing Sport</h4>
                  <p className="insight-value">
                    {analytics.sportPerformance.reduce((best, current) => 
                      current.winRate > best.winRate ? current : best
                    ).sport.toUpperCase()}
                  </p>
                  <p className="insight-detail">
                    {formatPercentage(analytics.sportPerformance.reduce((best, current) => 
                      current.winRate > best.winRate ? current : best
                    ).winRate)} win rate
                  </p>
                </div>
              </div>

              {/* Optimal Betting Time */}
              <div className="insight-card info">
                <div className="insight-icon">
                  <i className="bi bi-clock-fill"></i>
                </div>
                <div className="insight-content">
                  <h4>Peak Performance Time</h4>
                  <p className="insight-value">
                    {analytics.timePerformance.reduce((best, current) => 
                      current.winRate > best.winRate ? current : best
                    ).hour}:00
                  </p>
                  <p className="insight-detail">
                    Your most successful betting hour
                  </p>
                </div>
              </div>

              {/* Streak Information */}
              <div className="insight-card warning">
                <div className="insight-icon">
                  <i className="bi bi-fire"></i>
                </div>
                <div className="insight-content">
                  <h4>Current Streak</h4>
                  <p className="insight-value">
                    {stats.currentStreak} {stats.streakType === 'winning' ? 'Wins' : 'Losses'}
                  </p>
                  <p className="insight-detail">
                    Record: {stats.longestStreak} win streak
                  </p>
                </div>
              </div>

              {/* ROI Performance */}
              <div className={`insight-card ${stats.roi >= 0.1 ? 'success' : stats.roi >= 0 ? 'warning' : 'danger'}`}>
                <div className="insight-icon">
                  <i className="bi bi-graph-up"></i>
                </div>
                <div className="insight-content">
                  <h4>Return on Investment</h4>
                  <p className="insight-value">
                    {formatPercentage(stats.roi)}
                  </p>
                  <p className="insight-detail">
                    {stats.roi >= 0.1 ? 'Excellent' : stats.roi >= 0 ? 'Good' : 'Needs improvement'}
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="recommendations-card">
                <h4>Recommendations</h4>
                <div className="recommendations-list">
                  {stats.winRate < 0.5 && (
                    <div className="recommendation">
                      <i className="bi bi-lightbulb"></i>
                      <span>Consider focusing on sports with higher win rates</span>
                    </div>
                  )}
                  {stats.averageStake > 50 && (
                    <div className="recommendation">
                      <i className="bi bi-shield-check"></i>
                      <span>Try smaller stakes to reduce risk</span>
                    </div>
                  )}
                  {stats.currentStreak > 5 && stats.streakType === 'winning' && (
                    <div className="recommendation">
                      <i className="bi bi-exclamation-triangle"></i>
                      <span>Consider taking a break to avoid overconfidence</span>
                    </div>
                  )}
                  <div className="recommendation">
                    <i className="bi bi-graph-up"></i>
                    <span>Track your performance regularly to identify patterns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Betting History Card Component
interface BettingHistoryCardProps {
  bet: BettingHistoryItem;
}

const BettingHistoryCard: React.FC<BettingHistoryCardProps> = ({ bet }) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'won':
        return { color: '#28a745', icon: 'bi-check-circle-fill', text: 'Won' };
      case 'lost':
        return { color: '#dc3545', icon: 'bi-x-circle-fill', text: 'Lost' };
      case 'pending':
        return { color: '#ffc107', icon: 'bi-clock-fill', text: 'Pending' };
      case 'cancelled':
        return { color: '#6c757d', icon: 'bi-slash-circle-fill', text: 'Cancelled' };
      default:
        return { color: '#6c757d', icon: 'bi-question-circle-fill', text: 'Unknown' };
    }
  };

  const getSportIcon = (sport: string) => {
    switch (sport) {
      case 'basketball':
        return 'bi-circle';
      case 'football':
        return 'bi-shield-fill';
      case 'baseball':
        return 'bi-diamond-fill';
      case 'hockey':
        return 'bi-snow';
      case 'soccer':
        return 'bi-globe';
      default:
        return 'bi-trophy';
    }
  };

  const statusInfo = getStatusInfo(bet.status);
  const profit = bet.status === 'won' ? bet.potential_payout - bet.stake : 
                bet.status === 'lost' ? -bet.stake : 0;

  return (
    <div className={`bet-card ${bet.status}`}>
      <div className="bet-card-header">
        <div className="bet-matchup">
          <div className="sport-icon">
            <i className={getSportIcon(bet.sportsEvent.sport_key)}></i>
          </div>
          <div className="matchup-info">
            <h4>{bet.sportsEvent.away_team} @ {bet.sportsEvent.home_team}</h4>
            <span className="sport-league">{bet.sportsEvent.sport_key.toUpperCase()}</span>
          </div>
        </div>
        <div className="bet-status">
          <span 
            className="status-badge"
            style={{ color: statusInfo.color }}
          >
            <i className={statusInfo.icon}></i>
            {statusInfo.text}
          </span>
        </div>
      </div>
      
      <div className="bet-card-body">
        <div className="bet-selection">
          <div className="selection-info">
            <span className="selected-team">{bet.selected_team}</span>
            <span className="bet-type-badge">{bet.bet_type.toUpperCase()}</span>
          </div>
          <div className="odds-info">
            <span className="odds-value">
              {bet.odds > 0 ? `+${bet.odds.toFixed(2)}` : bet.odds.toFixed(2)}
            </span>
          </div>
        </div>
        
        <div className="bet-amounts">
          <div className="amount-row">
            <div className="amount-item">
              <span className="amount-label">Stake</span>
              <span className="amount-value">{formatCurrency(bet.stake)}</span>
            </div>
            <div className="amount-item">
              <span className="amount-label">Potential</span>
              <span className="amount-value">{formatCurrency(bet.potential_payout)}</span>
            </div>
            {bet.status !== 'pending' && (
              <div className="amount-item result">
                <span className="amount-label">Result</span>
                <span className={`amount-value ${profit >= 0 ? 'profit' : 'loss'}`}>
                  {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="bet-meta">
          <div className="meta-item">
            <i className="bi bi-calendar3"></i>
            <span>Placed: {new Date(bet.placed_at).toLocaleDateString()}</span>
          </div>
          {bet.settled_at && (
            <div className="meta-item">
              <i className="bi bi-check2"></i>
              <span>Settled: {new Date(bet.settled_at).toLocaleDateString()}</span>
            </div>
          )}
          {bet.sportsEvent.completed && bet.sportsEvent.home_score !== null && (
            <div className="meta-item game-score">
              <i className="bi bi-trophy"></i>
              <span>
                Final: {bet.sportsEvent.away_team} {bet.sportsEvent.away_score} - {bet.sportsEvent.home_score} {bet.sportsEvent.home_team}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BettingHistory;
