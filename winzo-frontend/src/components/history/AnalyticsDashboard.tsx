import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Card } from '../ui/Card';
import { BettingAnalytics, BetHistory } from '../../types/betting';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsDashboardProps {
  analytics: BettingAnalytics;
  bets: BetHistory[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analytics,
  bets
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  // Prepare profit over time chart data
  const profitChartData = {
    labels: analytics.profitByMonth.map(item => {
      const date = new Date(item.month + '-01');
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }),
    datasets: [
      {
        label: 'Monthly Profit',
        data: analytics.profitByMonth.map(item => item.profit),
        borderColor: 'var(--color-primary-600)',
        backgroundColor: 'var(--color-primary-100)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
      },
    ],
  };

  // Prepare sport breakdown chart data
  const sportChartData = {
    labels: analytics.sportBreakdown.map(item => item.sport),
    datasets: [
      {
        label: 'Number of Bets',
        data: analytics.sportBreakdown.map(item => item.bets),
        backgroundColor: [
          'var(--color-primary-500)',
          'var(--color-accent-500)',
          'var(--color-success-500)',
          'var(--color-info-500)',
          'var(--color-warning-500)',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Prepare bet type performance chart data
  const betTypeChartData = {
    labels: analytics.betTypeBreakdown.map(item => item.type),
    datasets: [
      {
        label: 'Profit',
        data: analytics.betTypeBreakdown.map(item => item.profit),
        backgroundColor: analytics.betTypeBreakdown.map(item => 
          item.profit >= 0 ? 'var(--color-success-500)' : 'var(--color-error-500)'
        ),
        borderWidth: 0,
      },
    ],
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Profit: ${formatCurrency(context.parsed.y)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => formatCurrency(value),
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label === 'Profit' 
              ? `Profit: ${formatCurrency(context.parsed.y)}`
              : `Bets: ${context.parsed.y}`;
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.parsed} bets`,
        },
      },
    },
  };

  // Calculate win/loss distribution
  const winLossData = {
    labels: ['Won', 'Lost', 'Pending'],
    datasets: [
      {
        data: [
          bets.filter(bet => bet.status === 'won').length,
          bets.filter(bet => bet.status === 'lost').length,
          bets.filter(bet => bet.status === 'pending').length,
        ],
        backgroundColor: [
          'var(--color-success-500)',
          'var(--color-error-500)',
          'var(--color-warning-500)',
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="analytics-dashboard">
      {/* Key Metrics Cards */}
      <div className="metrics-grid mb-8">
        <Card className="metric-card">
          <div className="metric-content">
            <div className="metric-icon">📊</div>
            <div className="metric-details">
              <h3>Total Bets</h3>
              <p className="metric-value">{analytics.totalBets}</p>
              <p className="metric-subtitle">
                Avg Stake: {formatCurrency(analytics.averageStake)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-content">
            <div className="metric-icon">🎯</div>
            <div className="metric-details">
              <h3>Win Rate</h3>
              <p className="metric-value">{formatPercentage(analytics.winRate)}</p>
              <p className="metric-subtitle">
                Avg Odds: {analytics.averageOdds.toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-content">
            <div className={`metric-icon ${analytics.netProfit >= 0 ? 'profit' : 'loss'}`}>
              {analytics.netProfit >= 0 ? '📈' : '📉'}
            </div>
            <div className="metric-details">
              <h3>Net Profit</h3>
              <p className={`metric-value ${analytics.netProfit >= 0 ? 'profit' : 'loss'}`}>
                {formatCurrency(analytics.netProfit)}
              </p>
              <p className="metric-subtitle">
                ROI: {formatPercentage(analytics.roi)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-content">
            <div className="metric-icon">🔥</div>
            <div className="metric-details">
              <h3>Current Streak</h3>
              <p className={`metric-value ${analytics.currentStreak.type === 'win' ? 'profit' : 'loss'}`}>
                {analytics.currentStreak.count} {analytics.currentStreak.type}s
              </p>
              <p className="metric-subtitle">
                Best: {analytics.longestWinStreak} wins
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Profit Over Time */}
        <Card className="chart-card">
          <div className="card-header">
            <h3>Profit Over Time</h3>
            <p>Monthly profit/loss trend</p>
          </div>
          <div className="chart-container">
            <Line data={profitChartData} options={lineChartOptions} />
          </div>
        </Card>

        {/* Win/Loss Distribution */}
        <Card className="chart-card">
          <div className="card-header">
            <h3>Bet Status Distribution</h3>
            <p>Current portfolio breakdown</p>
          </div>
          <div className="chart-container">
            <Doughnut data={winLossData} options={doughnutOptions} />
          </div>
        </Card>

        {/* Sport Performance */}
        <Card className="chart-card">
          <div className="card-header">
            <h3>Bets by Sport</h3>
            <p>Activity distribution across sports</p>
          </div>
          <div className="chart-container">
            <Doughnut data={sportChartData} options={doughnutOptions} />
          </div>
        </Card>

        {/* Bet Type Performance */}
        <Card className="chart-card">
          <div className="card-header">
            <h3>Profit by Bet Type</h3>
            <p>Performance across different bet types</p>
          </div>
          <div className="chart-container">
            <Bar data={betTypeChartData} options={barChartOptions} />
          </div>
        </Card>
      </div>

      {/* Detailed Breakdowns */}
      <div className="breakdown-tables">
        {/* Sport Breakdown */}
        <Card className="breakdown-card">
          <div className="card-header">
            <h3>Sport Performance Breakdown</h3>
          </div>
          <div className="breakdown-table">
            <table>
              <thead>
                <tr>
                  <th>Sport</th>
                  <th>Bets</th>
                  <th>Win Rate</th>
                  <th>Profit</th>
                  <th>ROI</th>
                </tr>
              </thead>
              <tbody>
                {analytics.sportBreakdown.map((sport) => (
                  <tr key={sport.sport}>
                    <td className="sport-name">{sport.sport}</td>
                    <td>{sport.bets}</td>
                    <td>{formatPercentage(sport.winRate)}</td>
                    <td className={sport.profit >= 0 ? 'profit' : 'loss'}>
                      {formatCurrency(sport.profit)}
                    </td>
                    <td className={sport.profit >= 0 ? 'profit' : 'loss'}>
                      {formatPercentage((sport.profit / (sport.bets * analytics.averageStake)) * 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Bet Type Breakdown */}
        <Card className="breakdown-card">
          <div className="card-header">
            <h3>Bet Type Performance Breakdown</h3>
          </div>
          <div className="breakdown-table">
            <table>
              <thead>
                <tr>
                  <th>Bet Type</th>
                  <th>Bets</th>
                  <th>Win Rate</th>
                  <th>Profit</th>
                  <th>ROI</th>
                </tr>
              </thead>
              <tbody>
                {analytics.betTypeBreakdown.map((betType) => (
                  <tr key={betType.type}>
                    <td className="bet-type-name">{betType.type}</td>
                    <td>{betType.bets}</td>
                    <td>{formatPercentage(betType.winRate)}</td>
                    <td className={betType.profit >= 0 ? 'profit' : 'loss'}>
                      {formatCurrency(betType.profit)}
                    </td>
                    <td className={betType.profit >= 0 ? 'profit' : 'loss'}>
                      {formatPercentage((betType.profit / (betType.bets * analytics.averageStake)) * 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Summary Insights */}
      <Card className="insights-card">
        <div className="card-header">
          <h3>Key Insights</h3>
        </div>
        <div className="insights-content">
          <div className="insight-grid">
            <div className="insight-item">
              <h4>Best Performing Sport</h4>
              <p>
                {analytics.sportBreakdown.reduce((best, current) => 
                  current.winRate > best.winRate ? current : best
                ).sport} with {formatPercentage(
                  analytics.sportBreakdown.reduce((best, current) => 
                    current.winRate > best.winRate ? current : best
                  ).winRate
                )} win rate
              </p>
            </div>
            <div className="insight-item">
              <h4>Most Profitable Bet Type</h4>
              <p>
                {analytics.betTypeBreakdown.reduce((best, current) => 
                  current.profit > best.profit ? current : best
                ).type} with {formatCurrency(
                  analytics.betTypeBreakdown.reduce((best, current) => 
                    current.profit > best.profit ? current : best
                  ).profit
                )} profit
              </p>
            </div>
            <div className="insight-item">
              <h4>Consistency Score</h4>
              <p>
                {analytics.longestLoseStreak <= 3 ? 'Excellent' : 
                 analytics.longestLoseStreak <= 5 ? 'Good' : 'Needs Improvement'} 
                (Max lose streak: {analytics.longestLoseStreak})
              </p>
            </div>
            <div className="insight-item">
              <h4>Risk Assessment</h4>
              <p>
                {analytics.averageStake < 50 ? 'Conservative' : 
                 analytics.averageStake < 100 ? 'Moderate' : 'Aggressive'} 
                betting style (Avg: {formatCurrency(analytics.averageStake)})
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard; 