import React from 'react';

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
      profit: 'metric-card-profit',
      loss: 'metric-card-loss', 
      winrate: 'metric-card-winrate',
      bets: 'metric-card-bets',
      balance: 'metric-card-balance'
    };
    return variantMap[variant as keyof typeof variantMap] || 'metric-card-balance';
  };

  if (loading) {
    return (
      <div className={`metric-card metric-card-loading metric-card-skeleton ${className}`}>
        <div className="metric-card-content">
          <div className="metric-loading-wrapper">
            <div className="skeleton-icon pulse-animation"></div>
            <div className="skeleton-content">
              <div className="skeleton-value pulse-animation"></div>
              <div className="skeleton-label pulse-animation"></div>
              <div className="skeleton-change pulse-animation"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`metric-card metric-card-enhanced card-hover-lift ${getVariantClass(variant)} ${className}`}>
      <div className="metric-gradient-overlay"></div>
      <div className="metric-card-content">
        {icon && (
          <div className="metric-icon-wrapper">
            <div className="metric-icon pulse-on-hover">
              {icon}
            </div>
          </div>
        )}
        
        <div className="metric-main-content">
          <div className="metric-value text-3xl font-bold text-primary font-mono slide-up-animation">
            {value}
          </div>
          <div className="metric-label text-sm text-tertiary font-medium fade-in-animation">
            {title}
          </div>
        </div>

        {change !== undefined && (
          <div className={`metric-change-indicator ${
            change >= 0 ? 'metric-change-positive' : 'metric-change-negative'
          } bounce-in-animation`}>
            <div className="change-icon">
              {change >= 0 ? '↗' : '↘'}
            </div>
            <div className="change-value">
              {formatChange(change)}
            </div>
          </div>
        )}
      </div>
      
      {/* Decorative Elements */}
      <div className="metric-decoration-dot metric-decoration-1"></div>
      <div className="metric-decoration-dot metric-decoration-2"></div>
      <div className="metric-decoration-dot metric-decoration-3"></div>
    </div>
  );
}; 