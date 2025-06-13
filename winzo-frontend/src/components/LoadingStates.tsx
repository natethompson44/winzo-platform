import React from 'react';
import './LoadingStates.css';

/**
 * WINZO Loading States System
 * 
 * Comprehensive loading states with skeleton screens, progressive loading,
 * and performance optimizations for all major components.
 */

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  color?: string;
}

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

interface ProgressiveLoadingProps {
  isLoading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}

/**
 * Loading Spinner Component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  message, 
  color = 'var(--winzo-teal)' 
}) => {
  return (
    <div className={`loading-spinner-container ${size}`}>
      <div className="loading-spinner" style={{ borderTopColor: color }}>
        <div className="spinner-inner"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

/**
 * Skeleton Loading Component
 */
export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = '',
  style = {}
}) => {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
    >
      <div className="skeleton-shimmer" />
    </div>
  );
};

/**
 * Progressive Loading Component
 */
export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({ 
  isLoading, 
  skeleton, 
  children, 
  delay = 0 
}) => {
  return (
    <div className={`progressive-loading ${isLoading ? 'loading' : 'loaded'}`}>
      {isLoading ? skeleton : children}
    </div>
  );
};

/**
 * Error State Component
 */
export const ErrorState: React.FC<{ 
  message?: string; 
  onRetry?: () => void;
  icon?: string;
}> = ({ 
  message = 'Something went wrong', 
  onRetry,
  icon = '⚠️'
}) => {
  return (
    <div className="error-state">
      <div className="error-icon">{icon}</div>
      <h3>Oops!</h3>
      <p>{message}</p>
      {onRetry && (
        <button className="retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

/**
 * Empty State Component
 */
export const EmptyState: React.FC<{ 
  message?: string; 
  icon?: string;
  action?: React.ReactNode;
}> = ({ 
  message = 'No data available', 
  icon = '📭',
  action
}) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>Nothing here</h3>
      <p>{message}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
};

/**
 * Loading Overlay Component
 */
export const LoadingOverlay: React.FC<{ 
  isLoading: boolean; 
  message?: string;
  children: React.ReactNode;
}> = ({ isLoading, message, children }) => {
  return (
    <div className="loading-overlay-container">
      {children}
      {isLoading && (
        <div className="loading-overlay">
          <LoadingSpinner message={message} />
        </div>
      )}
    </div>
  );
};

/**
 * Skeleton Screen Components for Major Sections
 */
export const DashboardSkeleton = () => (
  <div className="dashboard-skeleton">
    <Skeleton height="60px" className="skeleton-header" />
    <div className="skeleton-grid">
      <Skeleton height="200px" className="skeleton-card" />
      <Skeleton height="200px" className="skeleton-card" />
      <Skeleton height="200px" className="skeleton-card" />
    </div>
    <Skeleton height="300px" className="skeleton-chart" />
  </div>
);

export const SportsSkeleton = () => (
  <div className="sports-skeleton">
    <Skeleton height="50px" className="skeleton-filters" />
    <div className="skeleton-events">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton-event">
          <Skeleton height="20px" width="60%" />
          <Skeleton height="16px" width="40%" />
          <div className="skeleton-odds">
            <Skeleton height="30px" width="80px" />
            <Skeleton height="30px" width="80px" />
            <Skeleton height="30px" width="80px" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const WalletSkeleton = () => (
  <div className="wallet-skeleton">
    <Skeleton height="100px" className="skeleton-balance" />
    <Skeleton height="50px" className="skeleton-actions" />
    <div className="skeleton-transactions">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="skeleton-transaction">
          <Skeleton height="20px" width="70%" />
          <Skeleton height="16px" width="30%" />
        </div>
      ))}
    </div>
  </div>
);

export const HistorySkeleton = () => (
  <div className="history-skeleton">
    <Skeleton height="50px" className="skeleton-filters" />
    <div className="skeleton-bets">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton-bet">
          <Skeleton height="20px" width="80%" />
          <Skeleton height="16px" width="50%" />
          <Skeleton height="16px" width="30%" />
        </div>
      ))}
    </div>
  </div>
); 