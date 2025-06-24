import React from 'react';
import { LoadingIcon } from '../ui/Icons';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon?: React.ReactNode;
  variant?: 'balance' | 'bets' | 'winrate' | 'profit' | 'loss';
  loading?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  variant = 'balance',
  loading = false,
  className = ''
}) => {
  const formatChange = (change: number) => {
    const safeChange = Number(change || 0);
    const sign = safeChange >= 0 ? '+' : '';
    return `${sign}${safeChange.toFixed(1)}%`;
  };

  const getVariantClass = (variant: string) => {
    const variantMap = {
      profit: 'metric-card-success',
      loss: 'metric-card-danger', 
      winrate: 'metric-card-info',
      bets: 'metric-card-secondary',
      balance: 'metric-card-primary'
    };
    return variantMap[variant as keyof typeof variantMap] || 'metric-card-primary';
  };

  if (loading) {
    return (
      <div className={`card metric-card metric-card-loading ${className}`}>
        <div className="card-body text-center">
          <div className="metric-loading">
            <LoadingIcon size="md" color="secondary" />
            <div className="loading-text text-sm text-secondary mt-2">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card metric-card card-hover ${getVariantClass(variant)} ${className}`}>
      <div className="card-body text-center">
        {icon && (
          <div className="metric-icon mb-3">
            {icon}
          </div>
        )}
        
        <div className="metric-content">
          <div className="metric-value text-3xl font-bold text-primary font-mono mb-2">
            {value}
          </div>
          <div className="metric-label text-sm text-tertiary font-medium">
            {title}
          </div>
        </div>

        {change !== undefined && (
          <div className={`metric-change mt-3 text-xs font-semibold ${
            change >= 0 ? 'text-success' : 'text-danger'
          }`}>
            <span className="change-indicator mr-1">
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