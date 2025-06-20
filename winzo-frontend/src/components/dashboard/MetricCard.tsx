import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon?: string;
  variant?: 'balance' | 'bets' | 'winrate' | 'profit' | 'loss';
  loading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  variant = 'balance',
  loading = false
}) => {
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'profit':
        return 'metric-card-profit';
      case 'loss':
        return 'metric-card-loss';
      case 'winrate':
        return 'metric-card-winrate';
      case 'bets':
        return 'metric-card-bets';
      default:
        return 'metric-card-balance';
    }
  };

  if (loading) {
    return (
      <div className="card metric-card metric-card-loading">
        <div className="metric-card-skeleton">
          <div className="skeleton-icon"></div>
          <div className="skeleton-value"></div>
          <div className="skeleton-label"></div>
          <div className="skeleton-change"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card metric-card card-hover ${getVariantStyles(variant)}`}>
      <div className="metric-card-content">
        {icon && (
          <div className="metric-card-icon">
            <span className="metric-icon">{icon}</span>
          </div>
        )}
        
        <div className="metric-card-main">
          <div className="metric-value">{value}</div>
          <div className="metric-label">{title}</div>
        </div>

        {change !== undefined && (
          <div className={`metric-change ${change >= 0 ? 'positive' : 'negative'}`}>
            <span className="change-indicator">
              {change >= 0 ? '↗' : '↘'}
            </span>
            <span className="change-value">
              {formatChange(change)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}; 