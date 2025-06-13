import React, { useState, useEffect, useCallback } from 'react';
import { ErrorIcon, InfoIcon, WarningIcon, SuccessIcon, RefreshIcon } from './icons/IconLibrary';
import './ErrorHandler.css';

export interface ErrorDetails {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  technicalDetails?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  autoDismiss?: number; // milliseconds
  category?: 'network' | 'validation' | 'authentication' | 'authorization' | 'server' | 'unknown';
}

interface ErrorHandlerProps {
  error?: ErrorDetails | null;
  onDismiss?: (errorId: string) => void;
  onRetry?: () => void;
  className?: string;
}

/**
 * Enhanced Error Handler Component
 * 
 * Addresses critical UX issues:
 * - User-friendly error messages replacing technical jargon
 * - Clear guidance for resolution
 * - Proper error categorization and handling
 * - Accessible error presentation
 */
const ErrorHandler: React.FC<ErrorHandlerProps> = ({ 
  error, 
  onDismiss, 
  onRetry, 
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    if (error && onDismiss) {
      onDismiss(error.id);
    }
  }, [error, onDismiss]);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      setIsExpanded(false);
      
      // Auto-dismiss if configured
      if (error.autoDismiss) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, error.autoDismiss);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  }, [error, handleDismiss]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!error || !isVisible) {
    return null;
  }

  const getIcon = () => {
    switch (error.type) {
      case 'error':
        return <ErrorIcon size="md" color="danger" aria-hidden={true} />;
      case 'warning':
        return <WarningIcon size="md" color="warning" aria-hidden={true} />;
      case 'info':
        return <InfoIcon size="md" color="primary" aria-hidden={true} />;
      case 'success':
        return <SuccessIcon size="md" color="success" aria-hidden={true} />;
      default:
        return <ErrorIcon size="md" color="danger" aria-hidden={true} />;
    }
  };

  const getAlertClass = () => {
    switch (error.type) {
      case 'error':
        return 'alert-error';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      case 'success':
        return 'alert-success';
      default:
        return 'alert-error';
    }
  };

  const getCategoryMessage = () => {
    switch (error.category) {
      case 'network':
        return 'This appears to be a network connectivity issue. Please check your internet connection and try again.';
      case 'validation':
        return 'Please review the information you entered and ensure all required fields are completed correctly.';
      case 'authentication':
        return 'Your session may have expired. Please log in again to continue.';
      case 'authorization':
        return 'You don\'t have permission to perform this action. Please contact support if you believe this is an error.';
      case 'server':
        return 'We\'re experiencing technical difficulties. Please try again in a few moments.';
      default:
        return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
    }
  };

  const getActionButton = () => {
    if (error.action) {
      return (
        <button
          onClick={error.action.onClick}
          className="btn btn-primary btn-sm"
          aria-label={error.action.label}
        >
          {error.action.label}
        </button>
      );
    }

    if (error.category === 'network' || error.category === 'server') {
      return (
        <button
          onClick={handleRetry}
          className="btn btn-primary btn-sm"
          aria-label="Retry"
        >
          <RefreshIcon size="sm" color="inverse" aria-hidden={true} />
          <span>Retry</span>
        </button>
      );
    }

    return null;
  };

  return (
    <div className={`error-handler ${getAlertClass()} ${className}`} role="alert" aria-live="polite">
      <div className="error-content">
        <div className="error-icon">
          {getIcon()}
        </div>
        
        <div className="error-details">
          <div className="error-header">
            <h3 className="error-title">{error.title}</h3>
            {error.dismissible && (
              <button
                onClick={handleDismiss}
                className="error-dismiss"
                aria-label="Dismiss error"
              >
                <span aria-hidden="true">×</span>
              </button>
            )}
          </div>
          
          <div className="error-message">
            <p>{error.message}</p>
            <p className="error-category-message">{getCategoryMessage()}</p>
          </div>

          {/* Technical Details - Only shown when expanded */}
          {error.technicalDetails && (
            <div className="error-technical">
              <button
                onClick={toggleExpanded}
                className="error-expand-btn"
                aria-expanded={isExpanded}
                aria-controls="technical-details"
              >
                {isExpanded ? 'Hide' : 'Show'} Technical Details
              </button>
              
              {isExpanded && (
                <div id="technical-details" className="technical-details">
                  <pre className="technical-code">{error.technicalDetails}</pre>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="error-actions">
            {getActionButton()}
            
            {error.category === 'authentication' && (
              <button
                onClick={() => window.location.href = '/login'}
                className="btn btn-outline btn-sm"
                aria-label="Go to login"
              >
                Go to Login
              </button>
            )}
            
            {error.category === 'authorization' && (
              <button
                onClick={() => window.open('/support', '_blank')}
                className="btn btn-outline btn-sm"
                aria-label="Contact support"
              >
                Contact Support
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Error Boundary Component for catching React errors
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ComponentType<{ error: Error; resetError: () => void }> }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ fallback?: React.ComponentType<{ error: Error; resetError: () => void }> }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log to error reporting service
    // logErrorToService(error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return (
        <ErrorHandler
          error={{
            id: 'boundary-error',
            type: 'error',
            title: 'Something went wrong',
            message: 'We encountered an unexpected error. Please try refreshing the page.',
            category: 'unknown',
            action: {
              label: 'Refresh Page',
              onClick: () => window.location.reload()
            },
            dismissible: false
          }}
        />
      );
    }

    return this.props.children;
  }
}

// Error Context for managing global errors
interface ErrorContextType {
  errors: ErrorDetails[];
  addError: (error: Omit<ErrorDetails, 'id'>) => void;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
}

const ErrorContext = React.createContext<ErrorContextType | undefined>(undefined);

export const useErrorHandler = () => {
  const context = React.useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorHandler must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: React.ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorDetails[]>([]);

  const addError = (error: Omit<ErrorDetails, 'id'>) => {
    const newError: ErrorDetails = {
      ...error,
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    setErrors(prev => [...prev, newError]);
  };

  const removeError = (errorId: string) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <ErrorContext.Provider value={{ errors, addError, removeError, clearErrors }}>
      {children}
      
      {/* Global Error Display */}
      <div className="global-error-container">
        {errors.map(error => (
          <ErrorHandler
            key={error.id}
            error={error}
            onDismiss={removeError}
          />
        ))}
      </div>
    </ErrorContext.Provider>
  );
};

// Utility functions for common error scenarios
export const createNetworkError = (message?: string): ErrorDetails => ({
  id: 'network-error',
  type: 'error',
  title: 'Connection Error',
  message: message || 'Unable to connect to the server. Please check your internet connection.',
  category: 'network',
  action: {
    label: 'Retry',
    onClick: () => window.location.reload()
  },
  dismissible: true,
  autoDismiss: 10000 // 10 seconds
});

export const createValidationError = (field: string, message: string): ErrorDetails => ({
  id: 'validation-error',
  type: 'error',
  title: 'Invalid Input',
  message: `${field}: ${message}`,
  category: 'validation',
  dismissible: true,
  autoDismiss: 5000 // 5 seconds
});

export const createAuthenticationError = (): ErrorDetails => ({
  id: 'auth-error',
  type: 'error',
  title: 'Session Expired',
  message: 'Your session has expired. Please log in again to continue.',
  category: 'authentication',
  action: {
    label: 'Login',
    onClick: () => window.location.href = '/login'
  },
  dismissible: false
});

export const createServerError = (message?: string): ErrorDetails => ({
  id: 'server-error',
  type: 'error',
  title: 'Server Error',
  message: message || 'We\'re experiencing technical difficulties. Please try again later.',
  category: 'server',
  action: {
    label: 'Retry',
    onClick: () => window.location.reload()
  },
  dismissible: true,
  autoDismiss: 15000 // 15 seconds
});

export default ErrorHandler; 