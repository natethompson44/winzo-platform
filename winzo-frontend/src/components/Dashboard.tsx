import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBetSlip } from '../contexts/BetSlipContext';
import apiClient from '../utils/axios';
import { API_ENDPOINTS, handleApiError } from '../config/api';
import { formatCurrency, formatPercentage } from '../utils/numberUtils';
import './Dashboard.css';

interface DashboardStats {
  totalBets: number;
  totalStaked: number;
  totalWinnings: number;
  profit: number;
  winRate: number;
  betsPending: number;
  betsWon: number;
  betsLost: number;
  averageStake: number;
  bestSport: string;
  bestBettingTime: string;
  currentStreak: number;
  roi: number;
  monthlyTrend: number;
  weeklyPerformance: number;
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

interface Recommendation {
  type: 'sport' | 'time' | 'stake' | 'strategy' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  action?: string;
  priority: 'high' | 'medium' | 'low';
  potentialValue?: number;
}

interface LiveEvent {
  id: string;
  home_team: string;
  away_team: string;
  sport: string;
  current_score: string;
  time_remaining: string;
  odds_changes: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { getItemCount, getTotalStake } = useBetSlip();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBets, setRecentBets] = useState<RecentBet[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(false);
  const [realTimeBalance, setRealTimeBalance] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const balanceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const liveUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      
      const [betsResponse, walletResponse, recommendationsResponse, liveEventsResponse] = await Promise.all([
        apiClient.get(`${API_ENDPOINTS.BET_HISTORY}?limit=5`),
        apiClient.get(API_ENDPOINTS.WALLET_BALANCE),
        apiClient.get(`${API_ENDPOINTS.BET_HISTORY}?analytics=true`),
        apiClient.get(`${API_ENDPOINTS.SPORTS}/live-events`)
      ]);
      
      if (betsResponse.data.success) {
        setRecentBets(betsResponse.data.data);
        setStats(betsResponse.data.summary);
      }
      
      if (walletResponse.data.success) {
        setRealTimeBalance(walletResponse.data.data.balance);
      }
      
      if (recommendationsResponse.data.success) {
        setRecommendations(generateRecommendations(recommendationsResponse.data.analytics));
      }

      if (liveEventsResponse.data.success) {
        setLiveEvents(liveEventsResponse.data.data.slice(0, 3));
      }

      setLastUpdate(new Date());
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
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
        setRealTimeBalance(response.data.data.balance);
        setLastUpdate(new Date());
      }
    } catch (error: any) {
      console.error('Error fetching wallet balance:', error);
    } finally {
      setWalletLoading(false);
    }
  }, []);

  const updateLiveEvents = useCallback(async () => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.SPORTS}/live-events`);
      if (response.data.success) {
        setLiveEvents(response.data.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Error updating live events:', error);
    }
  }, []);

  const generateRecommendations = (analytics: any): Recommendation[] => {
    const recs: Recommendation[] = [];
    
    // Sport-based recommendations
    if (analytics.bestSport && analytics.bestSportWinRate > 60) {
      recs.push({
        type: 'sport',
        title: `Focus on ${analytics.bestSport}`,
        description: `You have a ${analytics.bestSportWinRate}% win rate in ${analytics.bestSport}`,
        confidence: analytics.bestSportWinRate / 100,
        action: `Bet on ${analytics.bestSport}`,
        priority: 'high',
        potentialValue: analytics.bestSportProfit || 0
      });
    }
    
    // Stake optimization
    if (analytics.averageStake && analytics.averageStake < 10) {
      recs.push({
        type: 'stake',
        title: 'Consider Higher Stakes',
        description: 'Your average stake is low. Consider increasing for better returns',
        confidence: 0.7,
        action: 'Increase stake size',
        priority: 'medium',
        potentialValue: analytics.optimalStakeValue || 0
      });
    }
    
    // Strategy recommendations
    if (analytics.winRate < 0.5) {
      recs.push({
        type: 'strategy',
        title: 'Review Your Strategy',
        description: 'Your win rate suggests reviewing your betting approach',
        confidence: 0.8,
        action: 'Analyze patterns',
        priority: 'high'
      });
    }

    // Time-based recommendations
    if (analytics.bestBettingTime) {
      recs.push({
        type: 'time',
        title: `Bet during ${analytics.bestBettingTime}`,
        description: `You perform best when betting during ${analytics.bestBettingTime}`,
        confidence: 0.75,
        action: 'Schedule bets',
        priority: 'medium'
      });
    }

    // Opportunity alerts
    if (analytics.highValueOpportunities && analytics.highValueOpportunities.length > 0) {
      recs.push({
        type: 'opportunity',
        title: 'High-Value Opportunities Available',
        description: `${analytics.highValueOpportunities.length} high-value bets available`,
        confidence: 0.9,
        action: 'View opportunities',
        priority: 'high',
        potentialValue: analytics.totalOpportunityValue || 0
      });
    }
    
    return recs
      .sort((a, b) => {
        // Sort by priority and confidence
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aScore = priorityOrder[a.priority] * a.confidence;
        const bScore = priorityOrder[b.priority] * b.confidence;
        return bScore - aScore;
      })
      .slice(0, 5);
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      
      // Set up real-time balance updates every 30 seconds
      balanceIntervalRef.current = setInterval(fetchWalletBalance, 30000);
      
      // Set up live events updates every 60 seconds
      liveUpdateIntervalRef.current = setInterval(updateLiveEvents, 60000);
      
      return () => {
        if (balanceIntervalRef.current) {
          clearInterval(balanceIntervalRef.current);
        }
        if (liveUpdateIntervalRef.current) {
          clearInterval(liveUpdateIntervalRef.current);
        }
      };
    }
  }, [user, fetchDashboardData, fetchWalletBalance, updateLiveEvents]);

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
      case 'won': return '🏆';
      case 'lost': return '❌';
      case 'pending': return '⏳';
      case 'cancelled': return '🚫';
      default: return '❓';
    }
  };

  const getRecommendationIcon = (type: string): string => {
    switch (type) {
      case 'sport': return '⚽';
      case 'time': return '⏰';
      case 'stake': return '💰';
      case 'strategy': return '📊';
      case 'opportunity': return '🎯';
      default: return '💡';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return '#e53e3e';
      case 'medium': return '#ed8936';
      case 'low': return '#48bb78';
      default: return '#a0aec0';
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

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-skeleton">
          <div className="skeleton-header">
            <div className="skeleton-title"></div>
            <div className="skeleton-subtitle"></div>
          </div>
          <div className="skeleton-grid">
            <div className="skeleton-card large"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentBalance = realTimeBalance !== null ? realTimeBalance : user.wallet_balance;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Welcome back, {user.username}! 🚀</h1>
          <p>Your betting command center</p>
          <div className="last-update">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
        <div className="header-actions">
          <button 
            onClick={fetchDashboardData} 
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
          <button onClick={fetchDashboardData} className="retry-button">
            Retry
          </button>
        </div>
      )}
      
      <div className="dashboard-grid">
        {/* Wallet Card */}
        <div className="dashboard-card wallet-card">
          <div className="card-header">
            <h3>💰 Wallet</h3>
            <button 
              onClick={fetchWalletBalance} 
              className={`refresh-btn ${walletLoading ? 'loading' : ''}`}
              disabled={walletLoading}
            >
              {walletLoading ? '⏳' : '🔄'}
            </button>
          </div>
          <div className="wallet-balance">
            {formatCurrency(currentBalance)}
          </div>
          <div className="wallet-actions">
            <button className="wallet-btn deposit">+ Deposit</button>
            <button className="wallet-btn withdraw">- Withdraw</button>
          </div>
          {stats && (
            <div className="wallet-stats">
              <div className="stat-item">
                <span className="stat-label">Monthly P&L:</span>
                <span className={`stat-value ${stats.monthlyTrend >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(stats.monthlyTrend)}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">ROI:</span>
                <span className={`stat-value ${stats.roi >= 0 ? 'positive' : 'negative'}`}>
                  {formatPercentage(stats.roi)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Active Bet Slip */}
        <div className="dashboard-card betslip-card">
          <div className="card-header">
            <h3>📋 Active Bet Slip</h3>
            <span className="item-count">{getItemCount()}</span>
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

        {/* Live Events */}
        {liveEvents.length > 0 && (
          <div className="dashboard-card live-events-card">
            <div className="card-header">
              <h3>🔥 Live Events</h3>
              <span className="live-indicator">LIVE</span>
            </div>
            <div className="live-events-list">
              {liveEvents.map((event) => (
                <div key={event.id} className="live-event-item">
                  <div className="event-teams">
                    {event.away_team} @ {event.home_team}
                  </div>
                  <div className="event-score">
                    {event.current_score}
                  </div>
                  <div className="event-time">
                    {event.time_remaining}
                  </div>
                  <div className="odds-change">
                    {event.odds_changes > 0 ? '+' : ''}{event.odds_changes}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Betting Stats */}
        {stats && (
          <div className="dashboard-card stats-card">
            <div className="card-header">
              <h3>📊 Betting Stats</h3>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{stats.totalBets}</span>
                <span className="stat-label">Total Bets</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{formatPercentage(stats.winRate)}</span>
                <span className="stat-label">Win Rate</span>
              </div>
              <div className="stat-item">
                <span className={`stat-number ${stats.profit >= 0 ? 'profit' : 'loss'}`}>
                  {formatCurrency(stats.profit)}
                </span>
                <span className="stat-label">Profit/Loss</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.betsPending}</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>
            {stats.currentStreak > 0 && (
              <div className="streak-indicator">
                🔥 {stats.currentStreak} bet winning streak!
              </div>
            )}
            {stats.weeklyPerformance !== undefined && (
              <div className="weekly-performance">
                <span className="performance-label">This Week:</span>
                <span className={`performance-value ${stats.weeklyPerformance >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(stats.weeklyPerformance)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Smart Recommendations */}
        {recommendations.length > 0 && (
          <div className="dashboard-card recommendations-card">
            <div className="card-header">
              <h3>💡 Smart Recommendations</h3>
              <span className="ai-badge">AI Powered</span>
            </div>
            <div className="recommendations-list">
              {recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <div className="recommendation-header">
                    <div className="recommendation-icon">
                      {getRecommendationIcon(rec.type)}
                    </div>
                    <div className="recommendation-priority">
                      <span 
                        className="priority-dot"
                        style={{ backgroundColor: getPriorityColor(rec.priority) }}
                      ></span>
                      {rec.priority}
                    </div>
                  </div>
                  <div className="recommendation-content">
                    <h4>{rec.title}</h4>
                    <p>{rec.description}</p>
                    {rec.potentialValue !== undefined && (
                      <div className="potential-value">
                        Potential: {formatCurrency(rec.potentialValue)}
                      </div>
                    )}
                    {rec.action && (
                      <button className="recommendation-action">
                        {rec.action}
                      </button>
                    )}
                  </div>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ width: `${rec.confidence * 100}%` }}
                    ></div>
                    <span className="confidence-text">{Math.round(rec.confidence * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Bets */}
        <div className="dashboard-card recent-bets-card">
          <div className="card-header">
            <h3>📈 Recent Bets</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="recent-bets-list">
            {recentBets.length > 0 ? (
              recentBets.map((bet) => (
                <div key={bet.id} className="recent-bet-item">
                  <div className="bet-info">
                    <div className="bet-teams">
                      {bet.sportsEvent.away_team} @ {bet.sportsEvent.home_team}
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
            <h3>⚡ Quick Actions</h3>
          </div>
          <div className="quick-actions">
            <button className="quick-action-btn sports">
              🏈 Sports Betting
            </button>
            <button className="quick-action-btn history">
              📊 Bet History
            </button>
            <button className="quick-action-btn wallet">
              💰 Manage Wallet
            </button>
            <button className="quick-action-btn support">
              🆘 Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
