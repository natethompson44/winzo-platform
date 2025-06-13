import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBetSlip } from '../contexts/BetSlipContext';
import { useNavigate } from 'react-router-dom';
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

interface DashboardWidget {
  id: string;
  title: string;
  type: 'wallet' | 'stats' | 'recent-bets' | 'quick-actions' | 'recommendations' | 'live-events';
  size: 'small' | 'medium' | 'large';
  collapsible: boolean;
  collapsed: boolean;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getItemCount, getTotalStake } = useBetSlip();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBets, setRecentBets] = useState<RecentBet[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [realTimeBalance, setRealTimeBalance] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    { id: 'wallet', title: 'Wallet Balance', type: 'wallet', size: 'small', collapsible: true, collapsed: false },
    { id: 'stats', title: 'Quick Stats', type: 'stats', size: 'medium', collapsible: true, collapsed: false },
    { id: 'recent-bets', title: 'Recent Bets', type: 'recent-bets', size: 'large', collapsible: true, collapsed: false },
    { id: 'quick-actions', title: 'Quick Actions', type: 'quick-actions', size: 'small', collapsible: false, collapsed: false },
    { id: 'recommendations', title: 'Recommendations', type: 'recommendations', size: 'medium', collapsible: true, collapsed: false },
    { id: 'live-events', title: 'Live Events', type: 'live-events', size: 'medium', collapsible: true, collapsed: false }
  ]);
  
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
      const response = await apiClient.get(API_ENDPOINTS.WALLET_BALANCE);
      if (response.data.success) {
        setRealTimeBalance(response.data.data.balance);
        setLastUpdate(new Date());
      }
    } catch (error: any) {
      console.error('Error fetching wallet balance:', error);
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

  const toggleWidget = (widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, collapsed: !widget.collapsed }
        : widget
    ));
  };

  const getWidgetContent = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'wallet':
        return (
          <div className="widget-content">
            <div className="wallet-balance-large">
              {formatCurrency(currentBalance)}
            </div>
            <div className="wallet-actions-grid">
              <button className="winzo-btn winzo-btn-primary" onClick={() => navigate('/wallet')}>
                💳 Deposit
              </button>
              <button className="winzo-btn winzo-btn-secondary" onClick={() => navigate('/wallet')}>
                💸 Withdraw
              </button>
            </div>
            {stats && (
              <div className="wallet-stats-compact">
                <div className="stat-row">
                  <span>Monthly P&L:</span>
                  <span className={stats.monthlyTrend >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(stats.monthlyTrend)}
                  </span>
                </div>
                <div className="stat-row">
                  <span>ROI:</span>
                  <span className={stats.roi >= 0 ? 'positive' : 'negative'}>
                    {formatPercentage(stats.roi)}
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case 'stats':
        return stats ? (
          <div className="widget-content">
            <div className="stats-grid-compact">
              <div className="stat-card">
                <div className="stat-number">{stats.totalBets}</div>
                <div className="stat-label">Total Bets</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{formatPercentage(stats.winRate)}</div>
                <div className="stat-label">Win Rate</div>
              </div>
              <div className="stat-card">
                <div className={`stat-number ${stats.profit >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(stats.profit)}
                </div>
                <div className="stat-label">Profit/Loss</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats.betsPending}</div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
            {stats.currentStreak > 0 && (
              <div className="streak-badge">
                🔥 {stats.currentStreak} bet streak
              </div>
            )}
          </div>
        ) : (
          <div className="widget-content">
            <p>Loading stats...</p>
          </div>
        );

      case 'recent-bets':
        return (
          <div className="widget-content">
            {recentBets.length > 0 ? (
              <div className="recent-bets-list">
                {recentBets.slice(0, 5).map((bet) => (
                  <div key={bet.id} className="bet-item">
                    <div className="bet-header">
                      <span className="bet-teams">
                        {bet.sportsEvent.away_team} @ {bet.sportsEvent.home_team}
                      </span>
                      <span className={`bet-status ${bet.status}`}>
                        {getStatusIcon(bet.status)} {bet.status}
                      </span>
                    </div>
                    <div className="bet-details">
                      <span className="bet-stake">{formatCurrency(bet.stake)}</span>
                      <span className="bet-odds">{formatOdds(bet.odds)}</span>
                      <span className="bet-payout">{formatCurrency(bet.potential_payout)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No recent bets</p>
                <button className="winzo-btn winzo-btn-primary" onClick={() => navigate('/sports')}>
                  Place Your First Bet
                </button>
              </div>
            )}
          </div>
        );

      case 'quick-actions':
        return (
          <div className="widget-content">
            <div className="quick-actions-grid">
              <button className="winzo-btn winzo-btn-primary" onClick={() => navigate('/sports')}>
                <span className="action-icon">⚡</span>
                <span className="action-label">Quick Bet</span>
              </button>
              <button className="winzo-btn winzo-btn-secondary" onClick={() => navigate('/wallet')}>
                <span className="action-icon">💳</span>
                <span className="action-label">Deposit</span>
              </button>
              <button className="winzo-btn winzo-btn-secondary" onClick={() => navigate('/history')}>
                <span className="action-icon">📊</span>
                <span className="action-label">History</span>
              </button>
              <button className="winzo-btn winzo-btn-secondary" onClick={() => navigate('/sports')}>
                <span className="action-icon">🏈</span>
                <span className="action-label">Sports</span>
              </button>
            </div>
            {getItemCount() > 0 && (
              <div className="betslip-summary-compact">
                <span>Active Bet Slip: {getItemCount()} bets</span>
                <span>{formatCurrency(getTotalStake())}</span>
              </div>
            )}
          </div>
        );

      case 'recommendations':
        return (
          <div className="widget-content">
            {recommendations.length > 0 ? (
              <div className="recommendations-list">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="recommendation-item">
                    <div className="rec-header">
                      <span className="rec-icon">{getRecommendationIcon(rec.type)}</span>
                      <span className="rec-title">{rec.title}</span>
                      <span className={`rec-priority ${rec.priority}`}>
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="rec-description">{rec.description}</p>
                    {rec.action && (
                      <button className="winzo-btn winzo-btn-outline">
                        {rec.action}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No recommendations available</p>
              </div>
            )}
          </div>
        );

      case 'live-events':
        return (
          <div className="widget-content">
            {liveEvents.length > 0 ? (
              <div className="live-events-list">
                {liveEvents.map((event) => (
                  <div key={event.id} className="live-event-item">
                    <div className="event-info">
                      <div className="event-teams">
                        {event.away_team} @ {event.home_team}
                      </div>
                      <div className="event-score">{event.current_score}</div>
                    </div>
                    <div className="event-meta">
                      <span className="event-time">{event.time_remaining}</span>
                      <span className={`odds-change ${event.odds_changes > 0 ? 'positive' : 'negative'}`}>
                        {event.odds_changes > 0 ? '+' : ''}{event.odds_changes}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No live events</p>
              </div>
            )}
          </div>
        );

      default:
        return <div className="widget-content">Widget not found</div>;
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
          <h1 className="page-title">Welcome back, {user.username}! 🚀</h1>
          <p className="page-subtitle">Your betting command center</p>
          <div className="last-update">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
        <div className="header-actions">
          <button 
            onClick={fetchDashboardData} 
            className="winzo-btn winzo-btn-secondary"
            disabled={loading}
          >
            {loading ? '⏳' : '🔄'} Refresh
          </button>
        </div>
      </header>
      
      {error && (
        <div className="error-banner">
          <span>⚠ {error}</span>
          <button onClick={fetchDashboardData} className="winzo-btn winzo-btn-primary">
            Retry
          </button>
        </div>
      )}
      
      <div className="dashboard-widgets">
        {widgets.map((widget) => (
          <div 
            key={widget.id} 
            className={`dashboard-widget widget-${widget.size} widget-${widget.type}`}
          >
            <div className="widget-header">
              <h3 className="widget-title">{widget.title}</h3>
              <div className="widget-actions">
                {widget.collapsible && (
                  <button 
                    className="widget-toggle"
                    onClick={() => toggleWidget(widget.id)}
                    aria-label={widget.collapsed ? 'Expand widget' : 'Collapse widget'}
                  >
                    {widget.collapsed ? '▼' : '▲'}
                  </button>
                )}
              </div>
            </div>
            {!widget.collapsed && getWidgetContent(widget)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
