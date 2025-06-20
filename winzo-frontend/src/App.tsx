import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from './components/layout';
import ErrorBoundary from './components/ErrorBoundary';
import PWAInstall from './components/PWAInstall';
import { FullPageLoading } from './components/ui/LoadingStates';
import { useInAppNotifications } from './utils/notifications';
import { useOnlineStatus } from './utils/offline';
import { serviceWorkerManager } from './utils/offline';
import './styles/globals.css';

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Sports = React.lazy(() => import('./pages/Sports'));
const Account = React.lazy(() => import('./pages/Account'));
const History = React.lazy(() => import('./pages/History'));
const LayoutDemo = React.lazy(() => import('./pages/LayoutDemo'));
const Error404 = React.lazy(() => import('./pages/Error404'));

// Route wrapper with error boundary
const RouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<FullPageLoading message="Loading page..." />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

// App routes component
const AppRoutes: React.FC = () => {
  const location = useLocation();
  const [currentRoute, setCurrentRoute] = useState(location.pathname);

  useEffect(() => {
    setCurrentRoute(location.pathname);
  }, [location.pathname]);

  return (
    <AppLayout currentRoute={currentRoute}>
      <Routes>
        {/* Default route redirects to dashboard */}
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" replace />} 
        />
        
        {/* Dashboard - main landing page after login */}
        <Route 
          path="/dashboard" 
          element={
            <RouteWrapper>
              <Dashboard />
            </RouteWrapper>
          } 
        />
        
        {/* Sports Betting - main money-making interface */}
        <Route 
          path="/sports" 
          element={
            <RouteWrapper>
              <Sports />
            </RouteWrapper>
          } 
        />
        
        {/* Account Management - comprehensive account settings */}
        <Route 
          path="/account" 
          element={
            <RouteWrapper>
              <Account />
            </RouteWrapper>
          } 
        />
        
        {/* Betting History - comprehensive betting history and analytics */}
        <Route 
          path="/history" 
          element={
            <RouteWrapper>
              <History />
            </RouteWrapper>
          } 
        />
        
        {/* Layout demo page */}
        <Route 
          path="/layout-demo" 
          element={
            <RouteWrapper>
              <LayoutDemo />
            </RouteWrapper>
          } 
        />
        
        {/* 404 Error page */}
        <Route 
          path="/404" 
          element={
            <RouteWrapper>
              <Error404 />
            </RouteWrapper>
          } 
        />
        
        {/* Catch-all route - show 404 */}
        <Route 
          path="*" 
          element={
            <RouteWrapper>
              <Error404 />
            </RouteWrapper>
          } 
        />
      </Routes>
    </AppLayout>
  );
};

// Notification container
const NotificationContainer: React.FC = () => {
  const { notifications, remove } = useInAppNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className={`notification ${notification.type} notification-enter-active`}
        >
          <div className="notification-content">
            <div className="notification-header">
              <h4 className="notification-title">{notification.title}</h4>
              <button 
                className="notification-close"
                onClick={() => remove(notification.id)}
                aria-label="Close notification"
              >
                ×
              </button>
            </div>
            <p className="notification-message">{notification.message}</p>
            
            {notification.actions && (
              <div className="notification-actions">
                {notification.actions.map((action, index) => (
                  <button
                    key={index}
                    className={`notification-action ${action.style || 'secondary'}`}
                    onClick={() => {
                      action.action();
                      remove(notification.id);
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Offline indicator
const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="offline-indicator">
      <div className="offline-content">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364" />
        </svg>
        <span>You're offline</span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [, setServiceWorkerReady] = useState(false);
  const [showPWAInstall, setShowPWAInstall] = useState(true);

  useEffect(() => {
    // Register service worker
    const registerSW = async () => {
      try {
        await serviceWorkerManager.register('/sw.js');
        setServiceWorkerReady(true);
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    registerSW();

    // Listen for service worker updates
    const handleSWUpdate = () => {
      // Show update notification
      console.log('Service Worker update available');
    };

    window.addEventListener('sw-update-available', handleSWUpdate);

    return () => {
      window.removeEventListener('sw-update-available', handleSWUpdate);
    };
  }, []);

  const handlePWAInstall = () => {
    setShowPWAInstall(false);
    console.log('PWA installed successfully');
  };

  const handlePWADismiss = () => {
    setShowPWAInstall(false);
  };

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('App-level error:', error, errorInfo);
        // In production, send to error tracking service
      }}
    >
      <Router>
        <div className="app">
          {/* Main app routes */}
          <AppRoutes />
          
          {/* Notification system */}
          <NotificationContainer />
          
          {/* Offline indicator */}
          <OfflineIndicator />
          
          {/* PWA install prompt */}
          {showPWAInstall && (
            <PWAInstall 
              onInstall={handlePWAInstall}
              onDismiss={handlePWADismiss}
            />
          )}
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App; 