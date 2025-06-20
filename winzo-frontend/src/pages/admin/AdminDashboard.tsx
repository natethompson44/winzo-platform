import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import MetricCard from '../../components/admin/MetricCard';
import QuickActions from '../../components/admin/QuickActions';
import apiClient from '../../utils/apiClient';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    newToday: number;
    inactive: number;
  };
  bets: {
    total: number;
    active: number;
    settled: number;
  };
  revenue: {
    total: number;
  };
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/dashboard');
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError('Failed to fetch dashboard statistics');
      }
    } catch (err) {
      console.error('Dashboard stats error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="admin-error">
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button 
            className="btn-primary" 
            onClick={fetchDashboardStats}
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Platform overview and key metrics</p>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Overview Metrics */}
        <div className="dashboard-metrics">
          <h2>Platform Overview</h2>
          <div className="metrics-grid">
            <MetricCard
              title="Total Users"
              value={stats?.users.total || 0}
              subtitle={`${stats?.users.active || 0} active`}
              type="users"
              trend="up"
            />
            <MetricCard
              title="New Users Today"
              value={stats?.users.newToday || 0}
              subtitle="registered today"
              type="growth"
              trend="up"
            />
            <MetricCard
              title="Total Bets"
              value={stats?.bets.total || 0}
              subtitle={`${stats?.bets.active || 0} active`}
              type="bets"
              trend="up"
            />
            <MetricCard
              title="Total Revenue"
              value={`$${(stats?.revenue.total || 0).toFixed(2)}`}
              subtitle="lifetime revenue"
              type="revenue"
              trend="up"
            />
          </div>
        </div>

        {/* User Statistics */}
        <div className="dashboard-section">
          <h3>User Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Active Users</span>
              <span className="stat-value">{stats?.users.active || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Inactive Users</span>
              <span className="stat-value">{stats?.users.inactive || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">New Today</span>
              <span className="stat-value">{stats?.users.newToday || 0}</span>
            </div>
          </div>
        </div>

        {/* Betting Statistics */}
        <div className="dashboard-section">
          <h3>Betting Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Active Bets</span>
              <span className="stat-value">{stats?.bets.active || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Settled Bets</span>
              <span className="stat-value">{stats?.bets.settled || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Revenue</span>
              <span className="stat-value">${(stats?.revenue.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="dashboard-section">
          <h3>Recent Activity</h3>
          <div className="activity-placeholder">
            <p>Recent user registrations, bets, and transactions will appear here</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard; 