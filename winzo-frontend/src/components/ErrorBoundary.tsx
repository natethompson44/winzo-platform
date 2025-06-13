import React, { Component, ErrorInfo, ReactNode } from 'react';
import { WarningIcon, RefreshIcon } from './icons/IconLibrary';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error reporting service
      console.error('Production error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">
              <WarningIcon size="lg" color="danger" />
            </div>
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened. Please try again.</p>
            
            <div className="error-actions">
              <button onClick={this.handleRetry} className="winzo-btn winzo-btn-primary">
                <RefreshIcon size="sm" /> Try Again
              </button>
              <button onClick={() => window.location.reload()} className="winzo-btn winzo-btn-secondary">
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
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

// API Error Component
export const APIError: React.FC<{ 
  message?: string; 
  onRetry?: () => void;
  showHomeButton?: boolean;
  errorType?: 'network' | 'auth' | 'validation' | 'timeout' | 'unknown';
}> = ({ 
  message = "Failed to load data", 
  onRetry,
  showHomeButton = true,
  errorType = 'unknown'
}) => {
  const getIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'network': return <WarningIcon size="sm" color="danger" />;
      case 'auth': return <WarningIcon size="sm" color="warning" />;
      case 'validation': return <WarningIcon size="sm" color="warning" />;
      case 'timeout': return <WarningIcon size="sm" color="warning" />;
      default: return <WarningIcon size="sm" color="danger" />;
    }
  };

  const getTitle = (type: string): string => {
    switch (type) {
      case 'network': return 'Connection Issue';
      case 'auth': return 'Authentication Required';
      case 'validation': return 'Invalid Data';
      case 'timeout': return 'Request Timeout';
      default: return 'API Error';
    }
  };

  return (
    <div className="api-error">
      <div className="api-error-container">
        <div className="api-error-icon">{getIcon(errorType)}</div>
        <h3 className="api-error-title">{getTitle(errorType)}</h3>
        <p className="api-error-message">
          {message}. Your Big Win Energy is still strong - let's get you back on track!
        </p>
        
        <div className="api-error-actions">
          {onRetry && (
            <button onClick={onRetry} className="winzo-btn winzo-btn-primary">
              <RefreshIcon size="sm" /> Try Again
            </button>
          )}
          {showHomeButton && (
            <button 
              onClick={() => window.location.href = '/dashboard'} 
              className="winzo-btn winzo-btn-secondary"
            >
              Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Loading Component
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

// Empty State Component
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}> = ({
  icon,
  title,
  message,
  actionText,
  onAction
}) => {
  return (
    <div className="winzo-empty-state">
      <div className="empty-state-container">
        {icon && <div className="empty-state-icon">{icon}</div>}
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

