import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console and external service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Generate unique event ID for tracking
    const eventId = this.generateEventId();
    
    this.setState({
      errorInfo,
      eventId
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external error tracking service
    this.logErrorToService(error, errorInfo, eventId);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary when props change
    if (hasError && resetOnPropsChange) {
      const hasResetKeyChanged = resetKeys?.some((key, idx) => 
        prevProps.resetKeys?.[idx] !== key
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo, eventId: string) {
    // In a real app, send to error tracking service like Sentry
    const errorData = {
      eventId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // For now, just log to console
    console.log('Error logged:', errorData);
    
    // Example: Send to error service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData)
    // }).catch(console.error);
  }

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleReportError = () => {
    const { error, errorInfo, eventId } = this.state;
    
    if (!error || !errorInfo) return;

    // Create error report
    const report = {
      eventId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    // Create mailto link for error reporting
    const subject = encodeURIComponent(`WINZO Error Report - ${eventId}`);
    const body = encodeURIComponent(`
Error Report:
${JSON.stringify(report, null, 2)}

Please describe what you were doing when this error occurred:


`);
    
    window.location.href = `mailto:support@winzo.com?subject=${subject}&body=${body}`;
  };

  render() {
    const { hasError, error, errorInfo, eventId } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-container">
            <div className="error-icon">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
            </div>
            
            <h1 className="error-title">Something went wrong</h1>
            
            <p className="error-description">
              We're sorry, but something unexpected happened. The error has been logged and we'll investigate.
            </p>

            {eventId && (
              <p className="error-id">
                Error ID: <code>{eventId}</code>
              </p>
            )}

            <div className="error-actions">
              <button 
                className="error-button primary"
                onClick={this.handleRetry}
              >
                Try Again
              </button>
              
              <button 
                className="error-button secondary"
                onClick={this.handleRefresh}
              >
                Refresh Page
              </button>
              
              <button 
                className="error-button ghost"
                onClick={this.handleReportError}
              >
                Report Issue
              </button>
            </div>

            {/* Development-only error details */}
            {process.env.NODE_ENV === 'development' && error && errorInfo && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <div className="error-stack">
                  <h3>Error Message:</h3>
                  <pre>{error.message}</pre>
                  
                  <h3>Stack Trace:</h3>
                  <pre>{error.stack}</pre>
                  
                  <h3>Component Stack:</h3>
                  <pre>{errorInfo.componentStack}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

// HOC for functional components
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for error handling in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
}

// Global error handler for unhandled promise rejections
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Prevent the default behavior (console error)
    event.preventDefault();
    
    // Log to error service
    const errorData = {
      type: 'unhandledrejection',
      message: event.reason?.message || 'Unhandled promise rejection',
      stack: event.reason?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    console.log('Unhandled rejection logged:', errorData);
  });

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    const errorData = {
      type: 'javascript',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    console.log('Global error logged:', errorData);
  });
}

// Initialize global error handlers
if (typeof window !== 'undefined') {
  setupGlobalErrorHandlers();
}

export default ErrorBoundary; 