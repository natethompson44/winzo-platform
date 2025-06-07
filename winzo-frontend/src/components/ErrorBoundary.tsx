import React from 'react';
import './ErrorBoundary.css';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

/**
 * WINZO Error Boundary - Graceful Error Handling
 * 
 * Catches JavaScript errors anywhere in the component tree and displays
 * a fallback UI with WINZO branding and retry functionality.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('WINZO Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      return (
        <div className="winzo-error-boundary">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Oops! Something went wrong</h2>
            <p className="error-message">
              Don't worry - your Big Win Energy is still intact! We've encountered a technical hiccup.
            </p>
            
            <div className="error-actions">
              <button onClick={this.retry} className="retry-btn">
                🔄 Try Again
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard'} 
                className="home-btn"
              >
                🏠 Go Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Technical Details (Development)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * API Error Component - For API-specific errors
 */
export const APIError: React.FC<{ 
  message?: string; 
  onRetry?: () => void;
  showHomeButton?: boolean;
}> = ({ 
  message = "Failed to load data", 
  onRetry,
  showHomeButton = true 
}) => {
  return (
    <div className="winzo-api-error">
      <div className="api-error-container">
        <div className="api-error-icon">🔌</div>
        <h3 className="api-error-title">Connection Issue</h3>
        <p className="api-error-message">
          {message}. Your Big Win Energy is still strong - let's get you back on track!
        </p>
        
        <div className="api-error-actions">
          {onRetry && (
            <button onClick={onRetry} className="api-retry-btn">
              🔄 Try Again
            </button>
          )}
          {showHomeButton && (
            <button 
              onClick={() => window.location.href = '/dashboard'} 
              className="api-home-btn"
            >
              🏠 Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Loading Component - Consistent loading states
 */
export const WinzoLoading: React.FC<{ 
  message?: string;
  size?: 'small' | 'medium' | 'large';
}> = ({ 
  message = "Loading your Big Win Energy...",
  size = 'medium'
}) => {
  return (
    <div className={`winzo-loading ${size}`}>
      <div className="loading-spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

/**
 * Empty State Component - When no data is available
 */
export const EmptyState: React.FC<{
  icon?: string;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}> = ({
  icon = "🎯",
  title,
  message,
  actionText,
  onAction
}) => {
  return (
    <div className="winzo-empty-state">
      <div className="empty-state-container">
        <div className="empty-state-icon">{icon}</div>
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-message">{message}</p>
        
        {actionText && onAction && (
          <button onClick={onAction} className="empty-state-action">
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;

