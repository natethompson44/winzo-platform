import React from 'react';

// ===== BASIC LOADING SPINNER =====

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'danger' | 'warning' | 'info' | 'inverse';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = ''
}) => {
  const sizeClass = `icon-${size}`;
  const colorClass = `text-${color}`;

  return (
    <div className={`loading-spinner ${sizeClass} ${colorClass} ${className}`}>
      <svg 
        className="loading-icon" 
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
  color?: 'primary' | 'secondary' | 'tertiary';
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({ 
  className = '',
  color = 'primary'
}) => {
  return (
    <div className={`loading-dots text-${color} ${className}`}>
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
      className={`skeleton skeleton-${variant} ${className}`}
      style={styles}
    />
  );
};

// ===== GAME CARD SKELETON =====

export const GameCardSkeleton: React.FC = () => {
  return (
    <div className="card game-card-skeleton">
      <div className="card-body">
        <div className="game-header mb-4">
          <Skeleton width="100px" height="16px" />
        </div>
        
        <div className="teams-section mb-4">
          <div className="team flex items-center mb-3">
            <Skeleton variant="circular" width="32px" height="32px" className="mr-3" />
            <div>
              <Skeleton width="80px" height="16px" className="mb-1" />
              <Skeleton width="40px" height="12px" />
            </div>
          </div>
          
          <div className="vs-divider text-center mb-3">
            <Skeleton width="24px" height="16px" className="mx-auto" />
          </div>
          
          <div className="team flex items-center">
            <Skeleton variant="circular" width="32px" height="32px" className="mr-3" />
            <div>
              <Skeleton width="80px" height="16px" className="mb-1" />
              <Skeleton width="40px" height="12px" />
            </div>
          </div>
        </div>
        
        <div className="betting-section">
          <div className="bet-type">
            <div className="bet-type-header mb-2">
              <Skeleton width="60px" height="14px" />
            </div>
            <div className="bet-options grid grid-cols-3 gap-2">
              <Skeleton height="44px" />
              <Skeleton height="44px" />
              <Skeleton height="44px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ===== BET SLIP SKELETON =====

export const BetSlipSkeleton: React.FC = () => {
  return (
    <div className="card bet-slip-skeleton">
      <div className="card-body">
        <div className="bet-items mb-4">
          {[1, 2].map((item) => (
            <div key={item} className="bet-item p-4 border-b border-primary mb-3 last:mb-0 last:border-b-0">
              <div className="bet-info mb-2">
                <Skeleton width="120px" height="14px" className="mb-1" />
                <div className="bet-selection flex justify-between">
                  <Skeleton width="80px" height="16px" />
                  <Skeleton width="40px" height="16px" />
                </div>
              </div>
              <div className="bet-stake">
                <Skeleton width="40px" height="12px" className="mb-1" />
                <Skeleton height="40px" className="mb-1" />
                <Skeleton width="80px" height="12px" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="bet-summary mb-4">
          <div className="summary-row flex justify-between mb-2">
            <Skeleton width="80px" height="16px" />
            <Skeleton width="60px" height="16px" />
          </div>
          <div className="summary-row flex justify-between">
            <Skeleton width="100px" height="18px" />
            <Skeleton width="80px" height="18px" />
          </div>
        </div>
        
        <Skeleton height="44px" className="place-bet-button" />
      </div>
    </div>
  );
};

// ===== DASHBOARD SKELETON =====

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="dashboard-skeleton">
      <div className="dashboard-header mb-6">
        <Skeleton width="200px" height="32px" className="mb-2" />
        <Skeleton width="120px" height="20px" />
      </div>
      
      <div className="metrics-grid grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="card metric-card text-center">
            <div className="card-body">
              <Skeleton width="60px" height="14px" className="mb-2 mx-auto" />
              <Skeleton width="80px" height="28px" className="mb-1 mx-auto" />
              <Skeleton width="40px" height="12px" className="mx-auto" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="dashboard-content grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="section">
          <Skeleton width="140px" height="24px" className="mb-4" />
          <div className="card">
            <div className="card-body">
              <Skeleton height="200px" />
            </div>
          </div>
        </div>
        
        <div className="section">
          <Skeleton width="120px" height="24px" className="mb-4" />
          <div className="card">
            <div className="card-body">
              <div className="list-items space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center">
                    <Skeleton variant="circular" width="40px" height="40px" className="mr-3" />
                    <div className="flex-1">
                      <Skeleton width="120px" height="16px" className="mb-1" />
                      <Skeleton width="80px" height="14px" />
                    </div>
                    <Skeleton width="60px" height="16px" />
                  </div>
                ))}
              </div>
            </div>
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
      <div className="loading-content text-center">
        {showLogo && (
          <div className="loading-logo mb-6">
            <img src="/icons/icon-192x192.png" alt="WINZO" className="w-16 h-16 mx-auto" />
          </div>
        )}
        
        <LoadingSpinner size="lg" color="primary" className="mb-4" />
        
        <p className="text-secondary">{message}</p>
      </div>
    </div>
  );
};

// ===== INLINE LOADING =====

interface InlineLoadingProps {
  text?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  text = 'Loading...',
  className = '',
  size = 'sm'
}) => {
  return (
    <div className={`inline-loading flex items-center gap-2 ${className}`}>
      <LoadingSpinner size={size} color="secondary" />
      <span className="text-secondary text-sm">{text}</span>
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
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  loading,
  children,
  className = '',
  disabled,
  onClick,
  variant = 'primary',
  size = 'md'
}) => {
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <button 
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <LoadingSpinner size="sm" color="inverse" className="mr-2" />}
      <span className={loading ? 'opacity-70' : ''}>{children}</span>
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
      <div className="progress-steps space-y-3">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`progress-step flex items-center ${
              index <= currentStep ? 'text-primary' : 'text-tertiary'
            } ${index === currentStep ? 'font-medium' : ''}`}
          >
            <div className="step-indicator mr-3 flex items-center justify-center w-6 h-6 rounded-full border-2">
              {index < currentStep ? (
                <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : index === currentStep ? (
                <LoadingSpinner size="xs" color="primary" />
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}
            </div>
            <span className="step-label text-sm">{step}</span>
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
    <div className="loading-overlay-container relative">
      {children}
      {show && (
        <div className="loading-overlay absolute inset-0 bg-neutral-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="overlay-content text-center">
            <LoadingSpinner size="lg" color="inverse" className="mb-4" />
            <p className="text-inverse text-sm">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const loadingComponents = {
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

export default loadingComponents; 