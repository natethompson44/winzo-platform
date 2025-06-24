import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MetricCard, ActivityFeed, QuickActions, PerformanceChart } from '../components/dashboard';
import '../styles/dashboard.css';

interface DashboardData {
  balance: number;
  totalBets: number;
  winRate: number;
  profitLoss: number;
  recentActivity: Array<{
    id: string;
    type: 'bet_placed' | 'bet_won' | 'bet_lost' | 'deposit' | 'withdrawal';
    description: string;
    amount: number;
    timestamp: string;
  }>;
  performanceData: Array<{
    date: string;
    profit: number;
    bets: number;
  }>;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Navigation handlers
  const handleViewAllGames = () => {
    navigate('/sports');
  };

  const handleQuickBet = () => {
    navigate('/sports');
  };

  const handleViewLiveGames = () => {
    navigate('/sports'); // Will add live route later
  };

  const handleDeposit = () => {
    navigate('/account');
  };

  const handleViewHistory = () => {
    navigate('/history');
  };

  // Simulate data loading
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call - replace with actual API calls
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockData: DashboardData = {
          balance: 2547.50,
          totalBets: 142,
          winRate: 64.8,
          profitLoss: 847.25,
          recentActivity: [
            {
              id: '1',
              type: 'bet_won',
              description: 'Lakers vs Warriors - Over 220.5',
              amount: 125.00,
              timestamp: '2024-01-15T14:30:00Z'
            },
            {
              id: '2',
              type: 'bet_placed',
              description: 'Chiefs vs Bills - Chiefs -3.5',
              amount: -50.00,
              timestamp: '2024-01-15T12:15:00Z'
            },
            {
              id: '3',
              type: 'deposit',
              description: 'Deposit via Credit Card',
              amount: 200.00,
              timestamp: '2024-01-15T09:45:00Z'
            },
            {
              id: '4',
              type: 'bet_lost',
              description: 'Celtics vs Heat - Celtics ML',
              amount: -75.00,
              timestamp: '2024-01-14T21:20:00Z'
            },
            {
              id: '5',
              type: 'bet_won',
              description: 'Cowboys vs Eagles - Under 45.5',
              amount: 95.50,
              timestamp: '2024-01-14T18:30:00Z'
            }
          ],
          performanceData: [
            { date: '2024-01-08', profit: 45.25, bets: 5 },
            { date: '2024-01-09', profit: -23.50, bets: 3 },
            { date: '2024-01-10', profit: 87.75, bets: 7 },
            { date: '2024-01-11', profit: 125.00, bets: 4 },
            { date: '2024-01-12', profit: -45.25, bets: 6 },
            { date: '2024-01-13', profit: 203.50, bets: 8 },
            { date: '2024-01-14', profit: 95.50, bets: 5 },
            { date: '2024-01-15', profit: 75.00, bets: 3 }
          ]
        };
        
        setDashboardData(mockData);
        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error('Dashboard data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="main-content">
        <div className="content">
          <div className="loading-container">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
            <p className="loading-text">Loading your premium dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="content">
          <div className="card card-bordered" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <h2 className="text-2xl font-semibold text-primary mb-4">Something went wrong</h2>
            <p className="text-secondary mb-6">{error}</p>
            <button 
              className="btn btn-primary btn-md"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="main-content">
      <div className="content">
        {/* Enhanced Hero Section */}
        <div className="dashboard-hero mb-8">
          <div className="hero-content">
            <h1 className="text-4xl font-bold text-primary mb-2">
              Welcome back to WINZO!
            </h1>
            <p className="text-lg text-secondary mb-4">
              Your premium sports betting experience awaits. Here's what's happening with your account today.
            </p>
            
            {/* Trust Indicators */}
            <div className="trust-indicators">
              <div className="trust-indicator">
                <div className="trust-indicator-icon"></div>
                <span>🔒 SSL Secured</span>
              </div>
              <div className="trust-indicator">
                <div className="trust-indicator-icon"></div>
                <span>⚡ Instant Payouts</span>
              </div>
              <div className="trust-indicator">
                <div className="trust-indicator-icon"></div>
                <span>🛡️ Licensed & Regulated</span>
              </div>
            </div>
            
            {/* Quick Stats Bar */}
            <div className="quick-stats-bar">
              <div className="quick-stat-item">
                <span className="quick-stat-value">
                  ${dashboardData.balance.toFixed(2)}
                </span>
                <span className="quick-stat-label">Available Balance</span>
              </div>
              <div className="quick-stat-item">
                <span className="quick-stat-value">
                  {dashboardData.totalBets}
                </span>
                <span className="quick-stat-label">Total Bets</span>
              </div>
              <div className="quick-stat-item">
                <span className="quick-stat-value">
                  {dashboardData.winRate}%
                </span>
                <span className="quick-stat-label">Win Rate</span>
              </div>
              <div className="quick-stat-item">
                <span className="quick-stat-value" style={{ 
                  color: dashboardData.profitLoss > 0 ? 'var(--color-success-600)' : 'var(--color-error-600)' 
                }}>
                  ${Math.abs(dashboardData.profitLoss).toFixed(2)}
                </span>
                <span className="quick-stat-label">
                  {dashboardData.profitLoss > 0 ? 'Total Profit' : 'Total Loss'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Metrics Grid */}
        <div className="dashboard-metrics mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Current Balance"
              value={`$${dashboardData.balance.toFixed(2)}`}
              change={+5.2}
              icon="💰"
              variant="balance"
            />
            <MetricCard
              title="Total Bets"
              value={dashboardData.totalBets.toString()}
              change={+12.5}
              icon="🎯"
              variant="bets"
            />
            <MetricCard
              title="Win Rate"
              value={`${dashboardData.winRate}%`}
              change={+2.1}
              icon="📈"
              variant="winrate"
            />
            <MetricCard
              title="Profit/Loss"
              value={`${dashboardData.profitLoss > 0 ? '+' : ''}$${dashboardData.profitLoss.toFixed(2)}`}
              change={dashboardData.profitLoss > 0 ? +15.8 : -8.4}
              icon={dashboardData.profitLoss > 0 ? "🚀" : "📉"}
              variant={dashboardData.profitLoss > 0 ? "profit" : "loss"}
            />
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="dashboard-content">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Charts */}
            <div className="lg:col-span-2">
              <div className="card card-elevated mb-6">
                <div className="card-header">
                  <h3 className="text-xl font-semibold text-primary">
                    Performance Overview
                  </h3>
                  <p className="text-sm text-secondary mt-1">
                    Your betting performance over the last 7 days
                  </p>
                </div>
                <div className="card-body">
                  <PerformanceChart data={dashboardData.performanceData} />
                </div>
              </div>

              {/* Quick Actions with Navigation */}
              <QuickActions 
                onQuickBet={handleQuickBet}
                onViewLiveGames={handleViewLiveGames}
                onDeposit={handleDeposit}
                onViewHistory={handleViewHistory}
              />
            </div>

            {/* Right Column - Activity Feed */}
            <div className="lg:col-span-1">
              <ActivityFeed activities={dashboardData.recentActivity} />
            </div>
          </div>
        </div>

        {/* Enhanced Popular Games Section */}
        <div className="popular-games mt-8">
          <div className="card">
            <div className="card-header">
              <h3 className="text-xl font-semibold text-primary">
                🔥 Popular Games Today
              </h3>
              <p className="text-sm text-secondary mt-1">
                Quick bet on trending games with live odds
              </p>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Enhanced Game Items with Navigation */}
                <div className="popular-game-item">
                  <div className="game-teams">
                    <span className="team-name">Lakers</span>
                    <span className="vs">vs</span>
                    <span className="team-name">Warriors</span>
                  </div>
                  <div className="game-time">🕐 Today 8:00 PM EST</div>
                  <div className="quick-odds">
                    <button 
                      className="odds-button btn btn-sm"
                      onClick={handleQuickBet}
                    >
                      <div className="odds-content">
                        <span className="odds-selection">Lakers +3.5</span>
                        <span className="odds-value">-110</span>
                      </div>
                    </button>
                    <button 
                      className="odds-button btn btn-sm"
                      onClick={handleQuickBet}
                    >
                      <div className="odds-content">
                        <span className="odds-selection">Warriors -3.5</span>
                        <span className="odds-value">-110</span>
                      </div>
                    </button>
                  </div>
                </div>
                
                <div className="popular-game-item">
                  <div className="game-teams">
                    <span className="team-name">Chiefs</span>
                    <span className="vs">vs</span>
                    <span className="team-name">Bills</span>
                  </div>
                  <div className="game-time">📅 Tomorrow 1:00 PM EST</div>
                  <div className="quick-odds">
                    <button 
                      className="odds-button btn btn-sm"
                      onClick={handleQuickBet}
                    >
                      <div className="odds-content">
                        <span className="odds-selection">Over 47.5</span>
                        <span className="odds-value">-105</span>
                      </div>
                    </button>
                    <button 
                      className="odds-button btn btn-sm"
                      onClick={handleQuickBet}
                    >
                      <div className="odds-content">
                        <span className="odds-selection">Under 47.5</span>
                        <span className="odds-value">-115</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="popular-game-item">
                  <div className="game-teams">
                    <span className="team-name">Celtics</span>
                    <span className="vs">vs</span>
                    <span className="team-name">Heat</span>
                  </div>
                  <div className="game-time">🏀 Tomorrow 7:30 PM EST</div>
                  <div className="quick-odds">
                    <button 
                      className="odds-button btn btn-sm"
                      onClick={handleQuickBet}
                    >
                      <div className="odds-content">
                        <span className="odds-selection">Celtics ML</span>
                        <span className="odds-value">-140</span>
                      </div>
                    </button>
                    <button 
                      className="odds-button btn btn-sm"
                      onClick={handleQuickBet}
                    >
                      <div className="odds-content">
                        <span className="odds-selection">Heat ML</span>
                        <span className="odds-value">+120</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* View All Games Button with Navigation */}
              <div className="text-center mt-6">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={handleViewAllGames}
                >
                  View All Games
                  <span className="ml-2">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 