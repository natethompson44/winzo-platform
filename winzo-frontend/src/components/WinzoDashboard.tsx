import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatPercentage } from '../utils/numberUtils';
import './WinzoDashboard.css';

interface DashboardStats {
  totalBets: number;
  totalStaked: number;
  totalWinnings: number;
  profit: number;
  winRate: number;
  currentBalance: number;
  monthlyProfit: number;
  weeklyBets: number;
  activeBets: number;
  avgStake: number;
}

interface RecentBet {
  id: number;
  event: string;
  selection: string;
  odds: number;
  stake: number;
  status: 'won' | 'lost' | 'pending' | 'void';
  payout?: number;
  placedAt: string;
}

interface LiveEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  status: string;
  odds: {
    home: number;
    away: number;
  };
}

interface Notification {
  id: string;
  type: 'win' | 'loss' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const WinzoDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBets, setRecentBets] = useState<RecentBet[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Mock data - replace with real API calls
      const mockStats: DashboardStats = {
        totalBets: 45,
        totalStaked: 1250.00,
        totalWinnings: 980.50,
        profit: -269.50,
        winRate: 0.58,
        currentBalance: user?.wallet_balance || 750.00,
        monthlyProfit: 125.75,
        weeklyBets: 12,
        activeBets: 3,
        avgStake: 27.78
      };

      const mockRecentBets: RecentBet[] = [
        {
          id: 1,
          event: 'Lakers vs Warriors',
          selection: 'Lakers -2.5',
          odds: -110,
          stake: 50.00,
          status: 'won',
          payout: 95.45,
          placedAt: '2 hours ago'
        },
        {
          id: 2,  
          event: 'Chiefs vs Bills',
          selection: 'Over 48.5',
          odds: -105,
          stake: 25.00,
          status: 'pending',
          placedAt: '4 hours ago'
        },
        {
          id: 3,
          event: 'Cowboys vs Eagles',
          selection: 'Cowboys ML',
          odds: 150,
          stake: 30.00,
          status: 'lost',
          placedAt: '1 day ago'
        }
      ];

      const mockLiveEvents: LiveEvent[] = [
        {
          id: '1',
          homeTeam: 'Manchester City',
          awayTeam: 'Arsenal',
          sport: 'Soccer',
          status: '2nd Half 65\'',
          odds: { home: -130, away: 220 }
        },
        {
          id: '2',
          homeTeam: 'Lakers',
          awayTeam: 'Celtics', 
          sport: 'Basketball',
          status: 'Q3 8:45',
          odds: { home: 105, away: -125 }
        }
      ];

      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'win',
          title: 'Bet Won!',
          message: 'Your Lakers bet won - $95.45 credited',
          timestamp: '5 min ago',
          read: false
        },
        {
          id: '2', 
          type: 'info',
          title: 'Live Game Alert',
          message: 'Chiefs vs Bills game starting soon',
          timestamp: '15 min ago',
          read: false
        }
      ];

      setStats(mockStats);
      setRecentBets(mockRecentBets);
      setLiveEvents(mockLiveEvents);
      setNotifications(mockNotifications);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user?.wallet_balance, timeFilter]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getStatusBadge = (status: string) => {
    const badges = {
      won: 'badge bg-success',
      lost: 'badge bg-danger', 
      pending: 'badge bg-warning',
      void: 'badge bg-secondary'
    };
    return badges[status as keyof typeof badges] || 'badge bg-secondary';
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      win: 'bi-check-circle text-success',
      loss: 'bi-x-circle text-danger',
      info: 'bi-info-circle text-primary',
      warning: 'bi-exclamation-triangle text-warning'
    };
    return icons[type as keyof typeof icons] || 'bi-info-circle text-primary';
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="winzo-dashboard">
      <div className="row">
        {/* Stats Cards */}
        <div className="col-lg-8">
          <div className="row">
            
            {/* Balance Card */}
            <div className="col-xxl-4 col-md-6">
              <div className="card info-card balance-card">
                <div className="card-body">
                  <h5 className="card-title">Current Balance</h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-wallet2"></i>
                    </div>
                    <div className="ps-3">
                      <h6>{formatCurrency(stats?.currentBalance || 0)}</h6>
                      <span className="text-success small pt-1 fw-bold">
                        {stats?.monthlyProfit && stats.monthlyProfit > 0 ? '+' : ''}
                        {formatCurrency(stats?.monthlyProfit || 0)}
                      </span>
                      <span className="text-muted small pt-2 ps-1">this month</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Bets Card */}
            <div className="col-xxl-4 col-md-6">
              <div className="card info-card bets-card">
                <div className="card-body">
                  <h5 className="card-title">Total Bets <span>| This Month</span></h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-graph-up"></i>
                    </div>
                    <div className="ps-3">
                      <h6>{stats?.totalBets || 0}</h6>
                      <span className="text-primary small pt-1 fw-bold">{stats?.activeBets || 0}</span>
                      <span className="text-muted small pt-2 ps-1">active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Win Rate Card */}
            <div className="col-xxl-4 col-xl-12">
              <div className="card info-card winrate-card">
                <div className="card-body">
                  <h5 className="card-title">Win Rate <span>| Overall</span></h5>
                  <div className="d-flex align-items-center">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <i className="bi bi-trophy"></i>
                    </div>
                    <div className="ps-3">
                      <h6>{formatPercentage(stats?.winRate || 0)}</h6>
                      <span className={`small pt-1 fw-bold ${(stats?.profit || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(stats?.profit || 0)}
                      </span>
                      <span className="text-muted small pt-2 ps-1">profit/loss</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bets Table */}
            <div className="col-12">
              <div className="card recent-bets overflow-auto">
                <div className="card-body">
                  <h5 className="card-title">Recent Bets <span>| Latest Activity</span></h5>
                  <table className="table table-borderless">
                    <thead>
                      <tr>
                        <th scope="col">Event</th>
                        <th scope="col">Selection</th>
                        <th scope="col">Odds</th>
                        <th scope="col">Stake</th>
                        <th scope="col">Status</th>
                        <th scope="col">Payout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBets.map((bet) => (
                        <tr key={bet.id}>
                          <td>
                            <a href="#" className="text-primary fw-bold">{bet.event}</a>
                            <div className="small text-muted">{bet.placedAt}</div>
                          </td>
                          <td>{bet.selection}</td>
                          <td>
                            <span className={bet.odds > 0 ? 'text-success' : 'text-primary'}>
                              {bet.odds > 0 ? '+' : ''}{bet.odds}
                            </span>
                          </td>
                          <td>{formatCurrency(bet.stake)}</td>
                          <td>
                            <span className={getStatusBadge(bet.status)}>
                              {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            {bet.payout ? formatCurrency(bet.payout) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-center mt-3">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => navigate('/history')}
                    >
                      View All Bets
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side */}
        <div className="col-lg-4">
          
          {/* Quick Actions */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Quick Actions</h5>
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/sports')}
                >
                  <i className="bi bi-trophy me-2"></i>
                  Place New Bet
                </button>
                <button 
                  className="btn btn-success"
                  onClick={() => navigate('/account?tab=deposit')}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Deposit Funds
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/account?tab=withdraw')}
                >
                  <i className="bi bi-dash-circle me-2"></i>
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* Live Events */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Live Events</h5>
              {liveEvents.map((event) => (
                <div key={event.id} className="live-event-item d-flex justify-content-between align-items-center mb-3 p-3 border rounded">
                  <div>
                    <div className="fw-bold">{event.homeTeam} vs {event.awayTeam}</div>
                    <div className="small text-muted">{event.sport} • {event.status}</div>
                  </div>
                  <div className="text-end">
                    <div className="small">
                      <span className="badge bg-primary me-1">{event.odds.home > 0 ? '+' : ''}{event.odds.home}</span>
                      <span className="badge bg-secondary">{event.odds.away > 0 ? '+' : ''}{event.odds.away}</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center">
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => navigate('/live-sports')}
                >
                  View All Live Events
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity/Notifications */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Recent Activity</h5>
              <div className="activity">
                {notifications.map((notification) => (
                  <div key={notification.id} className="activity-item d-flex">
                    <div className="activity-label">{notification.timestamp}</div>
                    <i className={`${getNotificationIcon(notification.type)} align-self-start`}></i>
                    <div className="activity-content">
                      <strong>{notification.title}</strong>
                      <br />
                      {notification.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WinzoDashboard; 