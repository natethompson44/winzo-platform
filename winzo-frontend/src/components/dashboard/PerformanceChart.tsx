import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerformanceData {
  date: string;
  profit: number;
  bets: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  loading?: boolean;
  height?: number;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  loading = false,
  height = 300
}) => {

  // Process data for chart
  const chartData = {
    labels: data.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }),
    datasets: [
      {
        label: 'Profit/Loss',
        data: data.map((item) => item.profit),
        borderColor: 'rgb(59, 130, 246)', // Primary blue
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: 'rgb(59, 130, 246)',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend for cleaner look
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            const date = new Date(data[index].date);
            return date.toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric' 
            });
          },
          label: (context) => {
            const index = context.dataIndex;
            const profit = data[index].profit;
            const bets = data[index].bets;
            const sign = profit >= 0 ? '+' : '';
            return [
              `Profit/Loss: ${sign}$${profit.toFixed(2)}`,
              `Bets Placed: ${bets}`
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: 'normal',
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(229, 231, 235, 0.5)',
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: 'normal',
          },
          callback: function(value) {
            const numValue = value as number;
            const sign = numValue >= 0 ? '+' : '';
            return `${sign}$${numValue.toFixed(0)}`;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
    onHover: (event, activeElements) => {
      if (event.native && event.native.target) {
        (event.native.target as HTMLCanvasElement).style.cursor = 
          activeElements.length > 0 ? 'pointer' : 'default';
      }
    },
  };

  // Calculate summary stats
  const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);
  const totalBets = data.reduce((sum, item) => sum + item.bets, 0);
  const avgProfit = totalProfit / data.length;
  const bestDay = data.reduce((best, current) => 
    current.profit > best.profit ? current : best
  );

  if (loading) {
    return (
      <div className="performance-chart-container" style={{ height: `${height}px` }}>
        <div className="chart-loading">
          <div className="chart-skeleton">
            <div className="skeleton-bars">
              {[...Array(7)].map((_, index) => (
                <div 
                  key={index} 
                  className="skeleton-bar"
                  style={{ 
                    height: `${Math.random() * 60 + 20}%`,
                    animationDelay: `${index * 0.1}s` 
                  }}
                ></div>
              ))}
            </div>
          </div>
          <div className="loading-text">Loading performance data...</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="performance-chart-container" style={{ height: `${height}px` }}>
        <div className="chart-empty-state">
          <div className="empty-chart-icon">📈</div>
          <h4 className="empty-chart-title">No Performance Data</h4>
          <p className="empty-chart-message">
            Start placing bets to see your performance trends here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="performance-chart-container">
      {/* Chart Summary Stats */}
      <div className="chart-summary-stats">
        <div className="chart-stat-item">
          <div className="chart-stat-value">
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
          </div>
          <div className="chart-stat-label">Total P&L</div>
        </div>
        <div className="chart-stat-item">
          <div className="chart-stat-value">{totalBets}</div>
          <div className="chart-stat-label">Total Bets</div>
        </div>
        <div className="chart-stat-item">
          <div className="chart-stat-value">
            {avgProfit >= 0 ? '+' : ''}${avgProfit.toFixed(2)}
          </div>
          <div className="chart-stat-label">Avg Daily</div>
        </div>
        <div className="chart-stat-item success">
          <div className="chart-stat-value">
            +${bestDay.profit.toFixed(2)}
          </div>
          <div className="chart-stat-label">Best Day</div>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-wrapper" style={{ height: `${height}px` }}>
        <Line data={chartData} options={options} />
      </div>

      {/* Chart Controls */}
      <div className="chart-controls">
        <div className="chart-period-selector">
          <button className="period-btn active">7D</button>
          <button className="period-btn">30D</button>
          <button className="period-btn">90D</button>
          <button className="period-btn">1Y</button>
        </div>
        <div className="chart-options">
          <button className="chart-option-btn">
            <span className="option-icon">📊</span>
            <span className="option-text">View Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}; 