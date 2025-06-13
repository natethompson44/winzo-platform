import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../utils/axios';
import { API_ENDPOINTS, handleApiError } from '../../config/api';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalBets: number;
  activeBets: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingWithdrawals: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  recentSignups: number;
  averageBetSize: number;
  winRate: number;
}

interface RecentActivity {
  id: string;
  type: 'user_signup' | 'bet_placed' | 'withdrawal_request' | 'system_alert';
  title: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  color: string;
}

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [metricsResponse, activityResponse] = await Promise.all([
        apiClient.get('/api/admin/dashboard/metrics'),
        apiClient.get('/api/admin/dashboard/activity')
      ]);

      if (metricsResponse.data.success) {
        setMetrics(metricsResponse.data.data);
      }

      if (activityResponse.data.success) {
        setRecentActivity(activityResponse.data.data);
      }

      setLastUpdate(new Date());
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error(handleApiError(error));
      
      // Fallback data for development
      setMetrics({
        totalUsers: 1250,
        activeUsers: 342,
        totalBets: 5678,
        activeBets: 89,
        totalRevenue: 125000,
        monthlyRevenue: 45000,
        pendingWithdrawals: 23,
        systemHealth: 'healthy',
        recentSignups: 45,
        averageBetSize: 25.50,
        winRate: 68.5
      });
      
      setRecentActivity([
        {
          id: '1',
          type: 'user_signup',
          title: 'New User Registration',
          description: 'User "john_doe" registered successfully',
          timestamp: new Date().toISOString(),
          priority: 'low'
        },
        {
          id: '2',
          type: 'withdrawal_request',
          title: 'Withdrawal Request',
          description: 'User "jane_smith" requested $500 withdrawal',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          priority: 'medium'
        },
        {
          id: '3',
          type: 'bet_placed',
          title: 'High-Value Bet',
          description: 'User "big_better" placed $1000 bet on NBA',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          priority: 'high'
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const quickActions: QuickAction[] = [
    {
      id: 'approve-withdrawals',
      title: 'Approve Withdrawals',
      description: 'Review pending withdrawal requests',
      icon: '💰',
      action: () => toast.success('Navigate to withdrawal approvals'),
      color: 'var(--win-green)'
    },
    {
      id: 'manage-users',
      title: 'User Management',
      description: 'View and manage user accounts',
      icon: '👥',
      action: () => toast.success('Navigate to user management'),
      color: 'var(--winzo-teal)'
    },
    {
      id: 'settle-bets',
      title: 'Settle Bets',
      description: 'Manually settle pending bets',
      icon: '🎯',
      action: () => toast.success('Navigate to bet settlements'),
      color: 'var(--big-win-gold)'
    },
    {
      id: 'system-settings',
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: '⚙️',
      action: () => toast.success('Navigate to system settings'),
      color: 'var(--medium-gray)'
    }
  ];

  const getHealthStatusColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'var(--win-green)';
      case 'warning': return 'var(--caution-orange)';
      case 'critical': return 'var(--danger-red)';
      default: return 'var(--medium-gray)';
    }
  };

  const getHealthStatusIcon = (health: string) => {
    switch (health) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return '❓';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup': return '👤';
      case 'bet_placed': return '🎯';
      case 'withdrawal_request': return '💰';
      case 'system_alert': return '⚠️';
      default: return '📝';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'var(--danger-red)';
      case 'high': return 'var(--caution-orange)';
      case 'medium': return 'var(--big-win-gold)';
      case 'low': return 'var(--win-green)';
      default: return 'var(--medium-gray)';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading && !metrics) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header Section */}
      <div className="admin-dashboard-header">
        <div className="admin-dashboard-title">
          <h1>Platform Overview</h1>
          <p>Real-time metrics and system status</p>
        </div>
        <div className="admin-dashboard-actions">
          <button 
            className="admin-refresh-btn"
            onClick={fetchDashboardData}
            disabled={loading}
          >
            🔄 Refresh
          </button>
          <div className="admin-last-update">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card">
          <div className="admin-metric-icon">👥</div>
          <div className="admin-metric-content">
            <h3>Total Users</h3>
            <div className="admin-metric-value">{formatNumber(metrics?.totalUsers || 0)}</div>
            <div className="admin-metric-change positive">+{metrics?.recentSignups || 0} today</div>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon">🎯</div>
          <div className="admin-metric-content">
            <h3>Active Bets</h3>
            <div className="admin-metric-value">{formatNumber(metrics?.activeBets || 0)}</div>
            <div className="admin-metric-change">Total: {formatNumber(metrics?.totalBets || 0)}</div>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon">💰</div>
          <div className="admin-metric-content">
            <h3>Monthly Revenue</h3>
            <div className="admin-metric-value">{formatCurrency(metrics?.monthlyRevenue || 0)}</div>
            <div className="admin-metric-change">Total: {formatCurrency(metrics?.totalRevenue || 0)}</div>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon">📊</div>
          <div className="admin-metric-content">
            <h3>Win Rate</h3>
            <div className="admin-metric-value">{metrics?.winRate || 0}%</div>
            <div className="admin-metric-change">Avg Bet: {formatCurrency(metrics?.averageBetSize || 0)}</div>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon">🚨</div>
          <div className="admin-metric-content">
            <h3>Pending Withdrawals</h3>
            <div className="admin-metric-value">{metrics?.pendingWithdrawals || 0}</div>
            <div className="admin-metric-change">Requires attention</div>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon" style={{ color: getHealthStatusColor(metrics?.systemHealth || 'healthy') }}>
            {getHealthStatusIcon(metrics?.systemHealth || 'healthy')}
          </div>
          <div className="admin-metric-content">
            <h3>System Health</h3>
            <div className="admin-metric-value" style={{ color: getHealthStatusColor(metrics?.systemHealth || 'healthy') }}>
              {metrics?.systemHealth || 'healthy'}
            </div>
            <div className="admin-metric-change">All systems operational</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-quick-actions">
        <h2>Quick Actions</h2>
        <div className="admin-actions-grid">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="admin-action-card"
              onClick={action.action}
              style={{ '--action-color': action.color } as React.CSSProperties}
            >
              <div className="admin-action-icon">{action.icon}</div>
              <div className="admin-action-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="admin-recent-activity">
        <h2>Recent Activity</h2>
        <div className="admin-activity-list">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="admin-activity-item">
              <div className="admin-activity-icon">{getActivityIcon(activity.type)}</div>
              <div className="admin-activity-content">
                <div className="admin-activity-header">
                  <h4>{activity.title}</h4>
                  <span 
                    className="admin-activity-priority"
                    style={{ color: getPriorityColor(activity.priority) }}
                  >
                    {activity.priority}
                  </span>
                </div>
                <p>{activity.description}</p>
                <div className="admin-activity-time">
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 