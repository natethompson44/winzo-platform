import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBetSlip } from '../contexts/BetSlipContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../utils/axios';
import { API_ENDPOINTS } from '../config/api';
import { formatCurrency, formatPercentage, formatLuxuryCurrency, formatPremiumBalance, formatLuxuryPercentage, formatLuxuryNumber, formatOdds } from '../utils/numberUtils';
import {
  WalletIcon,
  QuickBetIcon,
  DepositIcon,
  WithdrawIcon,
  HistoryIcon,
  SportsIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DollarIcon,
  RefreshIcon,
  SuccessIcon,
  WarningIcon,
  FireIcon,
  LightningIcon,
  ClockIcon,
  CalendarIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  InfoIcon,
  LoadingIcon
} from './icons/IconLibrary';
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
      
      // Create mock data for fallback when API is not available
      const mockStats: DashboardStats = {
        totalBets: 12,
        totalStaked: 250.00,
        totalWinnings: 180.00,
        profit: -70.00,
        winRate: 0.58,
        betsPending: 2,
        betsWon: 7,
        betsLost: 3,
        averageStake: 20.83,
        bestSport: 'NFL',
        bestBettingTime: 'Sunday Afternoon',
        currentStreak: 2,
        roi: -0.28,
        monthlyTrend: 0.15,
        weeklyPerformance: 0.25
      };

      const mockRecentBets: RecentBet[] = [
        {
          id: 1,
          selected_team: "Kansas City Chiefs",
          odds: -110,
          stake: 25.00,
          status: "pending",
          potential_payout: 47.73,
          placed_at: new Date().toISOString(),
          sportsEvent: {
            home_team: "Kansas City Chiefs",
            away_team: "Buffalo Bills",
            sport_key: "americanfootball_nfl"
          }
        },
        {
          id: 2,
          selected_team: "Lakers",
          odds: +150,
          stake: 15.00,
          status: "won",
          potential_payout: 37.50,
          placed_at: new Date(Date.now() - 86400000).toISOString(),
          sportsEvent: {
            home_team: "Lakers",
            away_team: "Warriors",
            sport_key: "basketball_nba"
          }
        }
      ];

      const mockRecommendations: Recommendation[] = [
        {
          type: 'sport',
          title: 'Focus on NFL',
          description: 'You have a 65% win rate in NFL games',
          confidence: 0.65,
          action: 'Bet on NFL',
          priority: 'high',
          potentialValue: 45.00
        },
        {
          type: 'strategy',
          title: 'Consider Parlays',
          description: 'Your single bets are performing well, try parlays for bigger payouts',
          confidence: 0.7,
          action: 'Try a parlay',
          priority: 'medium',
          potentialValue: 120.00
        }
      ];

      const mockLiveEvents: LiveEvent[] = [
        {
          id: '1',
          home_team: 'Chiefs',
          away_team: 'Bills',
          sport: 'NFL',
          current_score: '24-21',
          time_remaining: 'Q4 2:30',
          odds_changes: 2.5
        }
      ];

      try {
        // Try to fetch real data first
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
      } catch (apiError) {
        console.log('API not available, using mock data');
        // Use mock data when API is not available
        setRecentBets(mockRecentBets);
        setStats(mockStats);
        setRecommendations(mockRecommendations);
        setLiveEvents(mockLiveEvents);
        setRealTimeBalance(user?.wallet_balance || 100.00);
        setLastUpdate(new Date());
      }

    } catch (error: any) {
      console.error('Error in dashboard data fetch:', error);
      setError('Dashboard data temporarily unavailable. Showing demo data.');
      
      // Set fallback data even on error
      const fallbackStats: DashboardStats = {
        totalBets: 0,
        totalStaked: 0,
        totalWinnings: 0,
        profit: 0,
        winRate: 0,
        betsPending: 0,
        betsWon: 0,
        betsLost: 0,
        averageStake: 0,
        bestSport: 'N/A',
        bestBettingTime: 'N/A',
        currentStreak: 0,
        roi: 0,
        monthlyTrend: 0,
        weeklyPerformance: 0
      };
      
      setStats(fallbackStats);
      setRecentBets([]);
      setRecommendations([]);
      setLiveEvents([]);
    } finally {
      setLoading(false);
    }
  }, [user?.wallet_balance]);

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
        action: 'Bet on NFL',
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

  const getStatusIcon = (status: string): React.ReactNode => {
    switch (status.toLowerCase()) {
      case 'won':
        return <SuccessIcon size="sm" color="success" className="status-icon" />;
      case 'lost':
        return <WarningIcon size="sm" color="danger" className="status-icon" />;
      case 'pending':
        return <ClockIcon size="sm" color="warning" className="status-icon" />;
      default:
        return <InfoIcon size="sm" color="neutral" className="status-icon" />;
    }
  };

  const getRecommendationIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'sport':
        return <SportsIcon size="sm" color="primary" className="rec-icon-svg" />;
      case 'time':
        return <ClockIcon size="sm" color="secondary" className="rec-icon-svg" />;
      case 'stake':
        return <DollarIcon size="sm" color="success" className="rec-icon-svg" />;
      case 'strategy':
        return <TrendingUpIcon size="sm" color="primary" className="rec-icon-svg" />;
      case 'opportunity':
        return <LightningIcon size="sm" color="warning" className="rec-icon-svg" />;
      default:
        return <InfoIcon size="sm" color="neutral" className="rec-icon-svg" />;
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
          <div className="widget-content luxury-widget-content">
            <div className="wallet-balance-large luxury-balance premium-typography">
              {formatPremiumBalance(currentBalance)}
            </div>
            <div className="wallet-actions-grid luxury-actions-grid">
              <button className="winzo-btn winzo-btn-primary luxury-btn premium-btn" onClick={() => navigate('/wallet')}>
                <DepositIcon size="sm" color="inverse" className="btn-icon" />
                <span className="btn-text">Deposit</span>
              </button>
              <button className="winzo-btn winzo-btn-secondary luxury-btn premium-btn" onClick={() => navigate('/wallet')}>
                <WithdrawIcon size="sm" color="neutral" className="btn-icon" />
                <span className="btn-text">Withdraw</span>
              </button>
            </div>
            {stats && (
              <div className="wallet-stats-compact luxury-stats">
                <div className="stat-row premium-stat-row">
                  <span className="stat-label">Monthly P&L:</span>
                  <span className={`stat-value ${stats.monthlyTrend >= 0 ? 'positive luxury-positive' : 'negative luxury-negative'}`}>
                    {formatCurrency(stats.monthlyTrend)}
                  </span>
                </div>
                <div className="stat-row premium-stat-row">
                  <span className="stat-label">ROI:</span>
                  <span className={`stat-value ${stats.roi >= 0 ? 'positive luxury-positive' : 'negative luxury-negative'}`}>
                    {formatPercentage(stats.roi)}
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case 'stats':
        return stats ? (
          <div className="widget-content luxury-widget-content">
            <div className="stats-grid-compact luxury-stats-grid">
              <div className="stat-card luxury-stat-card">
                <div className="stat-number premium-stat-number">{formatLuxuryNumber(stats.totalBets)}</div>
                <div className="stat-label premium-stat-label">Total Bets</div>
              </div>
              <div className="stat-card luxury-stat-card">
                <div className="stat-number premium-stat-number">{formatLuxuryPercentage(stats.winRate)}</div>
                <div className="stat-label premium-stat-label">Win Rate</div>
              </div>
              <div className={`stat-card luxury-stat-card ${stats.profit >= 0 ? 'positive-card' : 'negative-card'}`}>
                <div className={`stat-number premium-stat-number ${stats.profit >= 0 ? 'positive luxury-positive' : 'negative luxury-negative'}`}>
                  {formatLuxuryCurrency(stats.profit)}
                </div>
                <div className="stat-label premium-stat-label">Profit/Loss</div>
              </div>
              <div className="stat-card luxury-stat-card">
                <div className="stat-number premium-stat-number">{formatLuxuryNumber(stats.betsPending)}</div>
                <div className="stat-label premium-stat-label">Pending</div>
              </div>
            </div>
            {stats.currentStreak > 0 && (
              <div className="streak-badge luxury-streak-badge">
                <FireIcon size="sm" color="warning" className="streak-icon" />
                <span className="streak-text">{stats.currentStreak} bet streak</span>
              </div>
            )}
          </div>
        ) : (
          <div className="widget-content luxury-widget-content">
            <p className="loading-text">Loading stats...</p>
          </div>
        );

      case 'recent-bets':
        return (
          <div className="widget-content luxury-widget-content">
            {recentBets.length > 0 ? (
              <div className="recent-bets-list luxury-bets-list">
                {recentBets.slice(0, 5).map((bet) => (
                  <div key={bet.id} className="bet-item luxury-bet-item">
                    <div className="bet-header premium-bet-header">
                      <span className="bet-teams premium-bet-teams">
                        {bet.sportsEvent.away_team} @ {bet.sportsEvent.home_team}
                      </span>
                      <span className={`bet-status ${bet.status} luxury-bet-status`}>
                        {getStatusIcon(bet.status)} <span className="status-text">{bet.status}</span>
                      </span>
                    </div>
                    <div className="bet-details premium-bet-details">
                      <span className="bet-stake luxury-bet-stake">{formatCurrency(bet.stake)}</span>
                      <span className="bet-odds luxury-bet-odds">{formatOdds(bet.odds)}</span>
                      <span className="bet-payout luxury-bet-payout">{formatCurrency(bet.potential_payout)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state luxury-empty-state">
                <p className="empty-text">No recent bets</p>
                <button className="winzo-btn winzo-btn-primary luxury-btn premium-btn" onClick={() => navigate('/sports')}>
                  <QuickBetIcon size="sm" color="inverse" className="btn-icon" />
                  <span className="btn-text">Place Your First Bet</span>
                </button>
              </div>
            )}
          </div>
        );

      case 'quick-actions':
        return (
          <div className="widget-content luxury-widget-content">
            <div className="quick-actions-grid luxury-actions-grid">
              <button className="winzo-btn winzo-btn-primary luxury-btn premium-btn" onClick={() => navigate('/sports')}>
                <QuickBetIcon size="sm" color="inverse" className="btn-icon" />
                <span className="btn-text">Quick Bet</span>
              </button>
              <button className="winzo-btn winzo-btn-secondary luxury-btn premium-btn" onClick={() => navigate('/wallet')}>
                <WalletIcon size="sm" color="neutral" className="btn-icon" />
                <span className="btn-text">Deposit</span>
              </button>
              <button className="winzo-btn winzo-btn-secondary luxury-btn premium-btn" onClick={() => navigate('/history')}>
                <HistoryIcon size="sm" color="neutral" className="btn-icon" />
                <span className="btn-text">History</span>
              </button>
              <button className="winzo-btn winzo-btn-secondary luxury-btn premium-btn" onClick={() => navigate('/sports')}>
                <SportsIcon size="sm" color="neutral" className="btn-icon" />
                <span className="btn-text">Sports</span>
              </button>
            </div>
            {getItemCount() > 0 && (
              <div className="betslip-summary-compact luxury-betslip-summary">
                <span className="betslip-count">Active Bet Slip: {getItemCount()} bets</span>
                <span className="betslip-total">{formatCurrency(getTotalStake())}</span>
              </div>
            )}
          </div>
        );

      case 'recommendations':
        return (
          <div className="widget-content luxury-widget-content">
            {recommendations.length > 0 ? (
              <div className="recommendations-list luxury-recommendations-list">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="recommendation-item luxury-recommendation-item">
                    <div className="rec-header premium-rec-header">
                      <span className="rec-icon-wrapper">{getRecommendationIcon(rec.type)}</span>
                      <span className="rec-title premium-rec-title">{rec.title}</span>
                      <span className={`rec-priority ${rec.priority} luxury-priority`}>
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="rec-description premium-rec-description">{rec.description}</p>
                    {rec.action && (
                      <button className="winzo-btn winzo-btn-outline luxury-btn premium-btn">
                        <span className="btn-text">{rec.action}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state luxury-empty-state">
                <p className="empty-text">No recommendations available</p>
              </div>
            )}
          </div>
        );

      case 'live-events':
        return (
          <div className="widget-content luxury-widget-content">
            {liveEvents.length > 0 ? (
              <div className="live-events-list luxury-live-events-list">
                {liveEvents.map((event) => (
                  <div key={event.id} className="live-event-item luxury-live-event-item">
                    <div className="event-info premium-event-info">
                      <div className="event-teams premium-event-teams">
                        {event.away_team} @ {event.home_team}
                      </div>
                      <div className="event-score luxury-event-score">{event.current_score}</div>
                    </div>
                    <div className="event-meta premium-event-meta">
                      <span className="event-time luxury-event-time">{event.time_remaining}</span>
                      <span className={`odds-change ${event.odds_changes > 0 ? 'positive luxury-positive' : 'negative luxury-negative'}`}>
                        {event.odds_changes > 0 ? '+' : ''}{event.odds_changes}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state luxury-empty-state">
                <p className="empty-text">No live events</p>
              </div>
            )}
          </div>
        );

      default:
        return <div className="widget-content luxury-widget-content">Widget not found</div>;
    }
  };

  if (!user) {
    return (
      <div className="dashboard-container luxury-dashboard-container">
        <div className="auth-required luxury-auth-required">
          <h2 className="auth-title">Welcome to WINZO</h2>
          <p className="auth-message">Please log in to view your dashboard and start betting.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-container luxury-dashboard-container">
        <div className="dashboard-skeleton luxury-skeleton">
          <div className="skeleton-header premium-skeleton-header">
            <div className="skeleton-title luxury-skeleton-title"></div>
            <div className="skeleton-subtitle luxury-skeleton-subtitle"></div>
          </div>
          <div className="skeleton-grid luxury-skeleton-grid">
            <div className="skeleton-card large luxury-skeleton-card"></div>
            <div className="skeleton-card luxury-skeleton-card"></div>
            <div className="skeleton-card luxury-skeleton-card"></div>
            <div className="skeleton-card luxury-skeleton-card"></div>
            <div className="skeleton-card luxury-skeleton-card"></div>
            <div className="skeleton-card luxury-skeleton-card"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentBalance = realTimeBalance !== null ? realTimeBalance : user.wallet_balance;

  return (
    <div className="dashboard-container luxury-dashboard-container">
      <header className="dashboard-header luxury-dashboard-header">
        <div className="header-content premium-header-content">
          <h1 className="page-title luxury-page-title">Welcome back, {user.username}!</h1>
          <p className="page-subtitle luxury-page-subtitle">Your betting command center</p>
          <div className="last-update luxury-last-update">
            <ClockIcon size="sm" color="muted" className="update-icon" />
            <span className="update-text">Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="header-actions luxury-header-actions">
          <button 
            onClick={fetchDashboardData} 
            className="winzo-btn winzo-btn-secondary luxury-btn premium-btn"
            disabled={loading}
          >
            {loading ? (
              <LoadingIcon size="sm" color="neutral" className="btn-icon" />
            ) : (
              <RefreshIcon size="sm" color="neutral" className="btn-icon" />
            )}
            <span className="btn-text">Refresh</span>
          </button>
        </div>
      </header>
      
      {error && (
        <div className="error-banner luxury-error-banner">
          <span className="error-message">
            <WarningIcon size="sm" color="danger" className="error-icon" />
            {error}
          </span>
          <button onClick={fetchDashboardData} className="winzo-btn winzo-btn-primary luxury-btn premium-btn">
            <RefreshIcon size="sm" color="inverse" className="btn-icon" />
            <span className="btn-text">Retry</span>
          </button>
        </div>
      )}
      
      <div className="dashboard-widgets luxury-dashboard-widgets">
        {widgets.map((widget) => (
          <div 
            key={widget.id} 
            className={`dashboard-widget widget-${widget.size} widget-${widget.type} luxury-widget`}
          >
            <div className="widget-header luxury-widget-header">
              <h3 className="widget-title luxury-widget-title">{widget.title}</h3>
              <div className="widget-actions luxury-widget-actions">
                {widget.collapsible && (
                  <button 
                    className="widget-toggle luxury-widget-toggle"
                    onClick={() => toggleWidget(widget.id)}
                    aria-label={widget.collapsed ? 'Expand widget' : 'Collapse widget'}
                  >
                    {widget.collapsed ? (
                      <ChevronDownIcon size="sm" color="neutral" className="toggle-icon" />
                    ) : (
                      <ChevronUpIcon size="sm" color="neutral" className="toggle-icon" />
                    )}
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
