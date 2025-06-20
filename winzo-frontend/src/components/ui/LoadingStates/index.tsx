import React from 'react';

// ===== BASIC LOADING SPINNER =====

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = ''
}) => {
  return (
    <div className={`loading-spinner ${size} ${color} ${className}`}>
      <svg 
        className="animate-spin" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

// ===== LOADING DOTS =====

interface LoadingDotsProps {
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ className = '' }) => {
  return (
    <div className={`loading-dots ${className}`}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

// ===== SKELETON COMPONENTS =====

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  variant = 'text'
}) => {
  const styles: React.CSSProperties = {};
  
  if (width) styles.width = typeof width === 'number' ? `${width}px` : width;
  if (height) styles.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div 
      className={`skeleton ${variant} ${className}`}
      style={styles}
    />
  );
};

// ===== GAME CARD SKELETON =====

export const GameCardSkeleton: React.FC = () => {
  return (
    <div className="mobile-game-card skeleton-container">
      <div className="game-header">
        <Skeleton width="100px" height="16px" />
      </div>
      
      <div className="teams-section">
        <div className="team">
          <div className="team-info">
            <Skeleton variant="circular" width="32px" height="32px" />
            <div>
              <Skeleton width="80px" height="16px" />
              <Skeleton width="40px" height="12px" />
            </div>
          </div>
        </div>
        
        <div className="vs-divider">
          <Skeleton width="24px" height="16px" />
        </div>
        
        <div className="team">
          <div className="team-info">
            <Skeleton variant="circular" width="32px" height="32px" />
            <div>
              <Skeleton width="80px" height="16px" />
              <Skeleton width="40px" height="12px" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="betting-section">
        <div className="bet-type">
          <div className="bet-type-header">
            <Skeleton width="60px" height="14px" />
          </div>
          <div className="bet-options">
            <Skeleton height="44px" />
            <Skeleton height="44px" />
            <Skeleton height="44px" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== BET SLIP SKELETON =====

export const BetSlipSkeleton: React.FC = () => {
  return (
    <div className="bet-slip-content skeleton-container">
      <div className="bet-items">
        {[1, 2].map((item) => (
          <div key={item} className="bet-item">
            <div className="bet-info">
              <Skeleton width="120px" height="14px" />
              <div className="bet-selection">
                <Skeleton width="80px" height="16px" />
                <Skeleton width="40px" height="16px" />
              </div>
            </div>
            <div className="bet-stake">
              <Skeleton width="40px" height="12px" />
              <Skeleton height="40px" />
              <Skeleton width="80px" height="12px" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="bet-summary">
        <div className="summary-row">
          <Skeleton width="80px" height="16px" />
          <Skeleton width="60px" height="16px" />
        </div>
        <div className="summary-row">
          <Skeleton width="100px" height="18px" />
          <Skeleton width="80px" height="18px" />
        </div>
      </div>
      
      <Skeleton height="44px" className="place-bet-button" />
    </div>
  );
};

// ===== DASHBOARD SKELETON =====

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="dashboard-skeleton skeleton-container">
      <div className="dashboard-header">
        <Skeleton width="200px" height="32px" />
        <Skeleton width="120px" height="20px" />
      </div>
      
      <div className="metrics-grid">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="metric-card">
            <Skeleton width="60px" height="14px" />
            <Skeleton width="80px" height="28px" />
            <Skeleton width="40px" height="12px" />
          </div>
        ))}
      </div>
      
      <div className="dashboard-content">
        <div className="section">
          <Skeleton width="140px" height="24px" />
          <Skeleton height="200px" />
        </div>
        
        <div className="section">
          <Skeleton width="120px" height="24px" />
          <div className="list-items">
            {[1, 2, 3].map((item) => (
              <div key={item} className="list-item">
                <Skeleton variant="circular" width="40px" height="40px" />
                <div className="item-content">
                  <Skeleton width="120px" height="16px" />
                  <Skeleton width="80px" height="14px" />
                </div>
                <Skeleton width="60px" height="16px" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== FULL PAGE LOADING =====

interface FullPageLoadingProps {
  message?: string;
  showLogo?: boolean;
}

export const FullPageLoading: React.FC<FullPageLoadingProps> = ({
  message = 'Loading...',
  showLogo = true
}) => {
  return (
    <div className="full-page-loading">
      <div className="loading-content">
        {showLogo && (
          <div className="loading-logo">
            <img src="/icons/icon-192x192.png" alt="WINZO" className="logo-image" />
          </div>
        )}
        
        <LoadingSpinner size="lg" />
        
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

// ===== INLINE LOADING =====

interface InlineLoadingProps {
  text?: string;
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  text = 'Loading...',
  className = ''
}) => {
  return (
    <div className={`inline-loading ${className}`}>
      <LoadingSpinner size="sm" />
      <span className="loading-text">{text}</span>
    </div>
  );
};

// ===== BUTTON LOADING =====

interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  loading,
  children,
  className = '',
  disabled,
  onClick
}) => {
  return (
    <button 
      className={`button-loading ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <LoadingSpinner size="sm" color="white" />}
      <span className={loading ? 'loading-text-hidden' : ''}>{children}</span>
    </button>
  );
};

// ===== PROGRESSIVE LOADING =====

interface ProgressiveLoadingProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  steps,
  currentStep,
  className = ''
}) => {
  return (
    <div className={`progressive-loading ${className}`}>
      <div className="progress-steps">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`progress-step ${index <= currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}
          >
            <div className="step-indicator">
              {index < currentStep ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : index === currentStep ? (
                <LoadingSpinner size="sm" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className="step-label">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== LOADING OVERLAY =====

interface LoadingOverlayProps {
  show: boolean;
  message?: string;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  show,
  message = 'Loading...',
  children
}) => {
  return (
    <div className="loading-overlay-container">
      {children}
      {show && (
        <div className="loading-overlay">
          <div className="overlay-content">
            <LoadingSpinner size="lg" color="white" />
            <p className="overlay-message">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default {
  LoadingSpinner,
  LoadingDots,
  Skeleton,
  GameCardSkeleton,
  BetSlipSkeleton,
  DashboardSkeleton,
  FullPageLoading,
  InlineLoading,
  ButtonLoading,
  ProgressiveLoading,
  LoadingOverlay
}; 