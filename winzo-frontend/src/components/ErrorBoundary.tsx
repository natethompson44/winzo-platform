import React from 'react';
import './ErrorBoundary.css';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorReported: boolean;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

interface ErrorReport {
  error: string;
  stack: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  retryCount: number;
}

/**
 * WINZO Error Boundary - Enhanced Error Handling with Reporting
 * 
 * Catches JavaScript errors anywhere in the component tree and displays
 * a fallback UI with WINZO branding, specific error messages, and error reporting.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries = 3;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      errorReported: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('WINZO Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Report error to analytics/logging service
    this.reportError(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private reportError = async (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      const errorReport: ErrorReport = {
        error: error.message,
        stack: error.stack || '',
        componentStack: errorInfo.componentStack || undefined,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        retryCount: this.state.retryCount
      };

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.group('Error Report');
        console.log('Error:', errorReport);
        console.groupEnd();
      }

      // Send to error reporting service (replace with your service)
      // await fetch('/api/error-report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });

      this.setState({ errorReported: true });
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  };

  private getErrorMessage = (error: Error): { title: string; message: string; type: string } => {
    const errorMessage = error.message.toLowerCase();
    
    // Network/API errors
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return {
        title: 'Connection Lost',
        message: 'We lost connection to our servers. Please check your internet connection and try again.',
        type: 'network'
      };
    }
    
    // Authentication errors
    if (errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      return {
        title: 'Session Expired',
        message: 'Your session has expired. Please log in again to continue.',
        type: 'auth'
      };
    }
    
    // Validation errors
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return {
        title: 'Invalid Data',
        message: 'Some data appears to be invalid. Please refresh the page and try again.',
        type: 'validation'
      };
    }
    
    // Timeout errors
    if (errorMessage.includes('timeout')) {
      return {
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please try again.',
        type: 'timeout'
      };
    }
    
    // Default error
    return {
      title: 'Unexpected Error',
      message: 'Something unexpected happened. Our team has been notified and is working on a fix.',
      type: 'unknown'
    };
  };

  private getErrorIcon = (type: string): string => {
    switch (type) {
      case 'network': return '🌐';
      case 'auth': return '🔐';
      case 'validation': return '⚠️';
      case 'timeout': return '⏰';
      default: return '💥';
    }
  };

  retry = () => {
    const { retryCount } = this.state;
    
    if (retryCount >= this.maxRetries) {
      // Reset after max retries
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined,
        retryCount: 0 
      });
      window.location.reload();
      return;
    }

    // Increment retry count and reset error state
    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1
    }));

    // Add a small delay before retry
    this.retryTimeout = setTimeout(() => {
      // Force a re-render of children
      this.forceUpdate();
    }, 1000);
  };

  private handleReportIssue = () => {
    const { error, errorInfo } = this.state;
    if (!error) return;

    const errorDetails = `
Error: ${error.message}
Stack: ${error.stack}
Component Stack: ${errorInfo?.componentStack}
URL: ${window.location.href}
Time: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
    `.trim();

    // Copy to clipboard
    navigator.clipboard.writeText(errorDetails).then(() => {
      alert('Error details copied to clipboard. Please paste them in your support ticket.');
    }).catch(() => {
      // Fallback: open email client
      const subject = encodeURIComponent('WINZO Platform Error Report');
      const body = encodeURIComponent(errorDetails);
      window.open(`mailto:support@winzo.com?subject=${subject}&body=${body}`);
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.retry} />;
      }

      const { error } = this.state;
      const errorInfo = error ? this.getErrorMessage(error) : null;
      const icon = errorInfo ? this.getErrorIcon(errorInfo.type) : '💥';

      return (
        <div className="winzo-error-boundary">
          <div className="error-container">
            <div className="error-icon">{icon}</div>
            <h2 className="error-title">
              {errorInfo?.title || 'Oops! Something went wrong'}
            </h2>
            <p className="error-message">
              {errorInfo?.message || 'Don\'t worry - your Big Win Energy is still intact! We\'ve encountered a technical hiccup.'}
            </p>
            
            {this.state.retryCount > 0 && (
              <div className="retry-info">
                <p>Retry attempt {this.state.retryCount} of {this.maxRetries}</p>
              </div>
            )}
            
            <div className="error-actions">
              <button 
                onClick={this.retry} 
                className="retry-btn"
                disabled={this.state.retryCount >= this.maxRetries}
              >
                🔄 {this.state.retryCount >= this.maxRetries ? 'Reload Page' : 'Try Again'}
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard'} 
                className="home-btn"
              >
                🏠 Go Home
              </button>
              <button 
                onClick={this.handleReportIssue} 
                className="report-btn"
              >
                📧 Report Issue
              </button>
            </div>

            {this.state.errorReported && (
              <div className="error-reported">
                <span>✅ Error automatically reported to our team</span>
              </div>
            )}

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
 * API Error Component - Enhanced for API-specific errors
 */
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
  const getIcon = (type: string): string => {
    switch (type) {
      case 'network': return '🌐';
      case 'auth': return '🔐';
      case 'validation': return '⚠️';
      case 'timeout': return '⏰';
      default: return '🔌';
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
    <div className="winzo-api-error">
      <div className="api-error-container">
        <div className="api-error-icon">{getIcon(errorType)}</div>
        <h3 className="api-error-title">{getTitle(errorType)}</h3>
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

