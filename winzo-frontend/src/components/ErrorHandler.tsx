import React from 'react';
import './ErrorHandler.css';

export interface ErrorInfo {
  type: 'network' | 'validation' | 'permission' | 'server' | 'unknown';
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  retryable?: boolean;
}

interface ErrorHandlerProps {
  error: Error | string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * User-Friendly Error Handler Component
 * 
 * Replaces technical error messages with clear, actionable guidance
 * that helps users understand and resolve issues without exposing
 * technical details.
 */
const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  error,
  onRetry,
  onDismiss,
  className = ''
}) => {
  if (!error) return null;

  const getErrorInfo = (error: Error | string): ErrorInfo => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? '' : error.stack || '';

    // Network errors
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || 
        errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_NETWORK')) {
      return {
        type: 'network',
        title: 'Connection Issue',
        message: 'We\'re having trouble connecting to our servers. This might be due to a slow internet connection or temporary server maintenance.',
        actionText: 'Try Again',
        retryable: true
      };
    }

    // Database errors
    if (errorMessage.includes('database') || errorMessage.includes('DB') || 
        errorMessage.includes('SQL') || errorMessage.includes('connection')) {
      return {
        type: 'server',
        title: 'Service Temporarily Unavailable',
        message: 'Our systems are currently experiencing high traffic. Please wait a moment and try again.',
        actionText: 'Retry',
        retryable: true
      };
    }

    // Authentication errors
    if (errorMessage.includes('auth') || errorMessage.includes('login') || 
        errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      return {
        type: 'permission',
        title: 'Session Expired',
        message: 'Your session has expired. Please log in again to continue.',
        actionText: 'Log In',
        retryable: false
      };
    }

    // Validation errors
    if (errorMessage.includes('validation') || errorMessage.includes('invalid') || 
        errorMessage.includes('required') || errorMessage.includes('format')) {
      return {
        type: 'validation',
        title: 'Invalid Information',
        message: 'Please check the information you entered and try again.',
        actionText: 'Review & Fix',
        retryable: false
      };
    }

    // Rate limiting
    if (errorMessage.includes('rate') || errorMessage.includes('limit') || 
        errorMessage.includes('too many requests')) {
      return {
        type: 'server',
        title: 'Too Many Requests',
        message: 'You\'ve made too many requests. Please wait a moment before trying again.',
        actionText: 'Wait & Retry',
        retryable: true
      };
    }

    // Payment errors
    if (errorMessage.includes('payment') || errorMessage.includes('card') || 
        errorMessage.includes('transaction') || errorMessage.includes('insufficient')) {
      return {
        type: 'validation',
        title: 'Payment Issue',
        message: 'There was a problem processing your payment. Please check your payment details and try again.',
        actionText: 'Check Payment',
        retryable: false
      };
    }

    // Default error
    return {
      type: 'unknown',
      title: 'Something Went Wrong',
      message: 'We encountered an unexpected issue. Our team has been notified and is working to resolve it.',
      actionText: 'Try Again',
      retryable: true
    };
  };

  const errorInfo = getErrorInfo(error);

  const handleAction = () => {
    if (errorInfo.onAction) {
      errorInfo.onAction();
    } else if (errorInfo.retryable && onRetry) {
      onRetry();
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div className={`error-handler ${className}`}>
      <div className="error-container">
        <div className="error-icon">
          {errorInfo.type === 'network' && '📡'}
          {errorInfo.type === 'server' && '🔧'}
          {errorInfo.type === 'permission' && '🔐'}
          {errorInfo.type === 'validation' && '⚠️'}
          {errorInfo.type === 'unknown' && '💥'}
        </div>
        
        <div className="error-content">
          <h3 className="error-title">{errorInfo.title}</h3>
          <p className="error-message">{errorInfo.message}</p>
          
          <div className="error-actions">
            {errorInfo.actionText && (
              <button 
                className="btn btn-primary"
                onClick={handleAction}
              >
                {errorInfo.actionText}
              </button>
            )}
            
            {onDismiss && (
              <button 
                className="btn btn-ghost"
                onClick={handleDismiss}
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Toast Error Component for non-blocking errors
 */
export const ErrorToast: React.FC<{
  error: Error | string;
  onDismiss: () => void;
  duration?: number;
}> = ({ error, onDismiss, duration = 5000 }) => {
  const errorInfo = ErrorHandler.prototype.getErrorInfo?.(error) || {
    type: 'unknown',
    title: 'Error',
    message: typeof error === 'string' ? error : error.message
  };

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  return (
    <div className="error-toast">
      <div className="error-toast-content">
        <span className="error-toast-icon">
          {errorInfo.type === 'network' && '📡'}
          {errorInfo.type === 'server' && '🔧'}
          {errorInfo.type === 'permission' && '🔐'}
          {errorInfo.type === 'validation' && '⚠️'}
          {errorInfo.type === 'unknown' && '💥'}
        </span>
        
        <div className="error-toast-text">
          <strong>{errorInfo.title}</strong>
          <span>{errorInfo.message}</span>
        </div>
        
        <button 
          className="error-toast-close"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

/**
 * Error Boundary Component for catching React errors
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error; retry: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      return (
        <ErrorHandler 
          error={this.state.error!} 
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorHandler; 