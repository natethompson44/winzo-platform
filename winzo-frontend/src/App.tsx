import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from './components/layout';
import ErrorBoundary from './components/ErrorBoundary';
import PWAInstall from './components/PWAInstall';
import { FullPageLoading } from './components/ui/LoadingStates';
import { useInAppNotifications } from './utils/notifications';
import { useOnlineStatus } from './utils/offline';
import { serviceWorkerManager } from './utils/offline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './styles/globals.css';

// Lazy load pages for better performance
const HomePage = React.lazy(() => import('./pages/HomePage'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Sports = React.lazy(() => import('./pages/Sports'));
const Account = React.lazy(() => import('./pages/Account'));
const History = React.lazy(() => import('./pages/History'));
const LayoutDemo = React.lazy(() => import('./pages/LayoutDemo'));
const Error404 = React.lazy(() => import('./pages/Error404'));

// Admin pages
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = React.lazy(() => import('./pages/admin/UserManagement'));

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

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <FullPageLoading message="Checking authentication..." />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public route wrapper (redirects to dashboard if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <FullPageLoading message="Checking authentication..." />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// App routes component
const AppRoutes: React.FC = () => {
  const location = useLocation();
  const [currentRoute, setCurrentRoute] = useState(location.pathname);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setCurrentRoute(location.pathname);
  }, [location.pathname]);

  // Handle navigation (this will be passed to AppLayout)
  const handleNavigate = (route: string) => {
    // React Router will handle the actual navigation
    // This is just for any additional logic we might need
    console.log('Navigating to:', route);
  };

  // Handle search
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Add search logic here when needed
  };

  // Public routes don't need AppLayout
  const isPublicRoute = ['/', '/login', '/register'].includes(location.pathname);

  if (isPublicRoute) {
    return (
      <Routes>
        {/* Public HomePage */}
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <RouteWrapper>
                <HomePage />
              </RouteWrapper>
            </PublicRoute>
          } 
        />
        
        {/* Login Page */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <RouteWrapper>
                <Login />
              </RouteWrapper>
            </PublicRoute>
          } 
        />
        
        {/* Register Page */}
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RouteWrapper>
                <Register />
              </RouteWrapper>
            </PublicRoute>
          } 
        />
        
        {/* Catch-all for public routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Protected routes use AppLayout with navigation handlers
  return (
    <AppLayout 
      currentRoute={currentRoute}
      onNavigate={handleNavigate}
      onSearch={handleSearch}
    >
      <Routes>
        {/* Dashboard - main landing page after login */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <RouteWrapper>
                <Dashboard />
              </RouteWrapper>
            </ProtectedRoute>
          } 
        />
        
        {/* Sports Betting - main money-making interface */}
        <Route 
          path="/sports" 
          element={
            <ProtectedRoute>
              <RouteWrapper>
                <Sports />
              </RouteWrapper>
            </ProtectedRoute>
          } 
        />
        
        {/* Account Management - comprehensive account settings */}
        <Route 
          path="/account" 
          element={
            <ProtectedRoute>
              <RouteWrapper>
                <Account />
              </RouteWrapper>
            </ProtectedRoute>
          } 
        />
        
        {/* Betting History - comprehensive betting history and analytics */}
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <RouteWrapper>
                <History />
              </RouteWrapper>
            </ProtectedRoute>
          } 
        />
        
        {/* Layout demo page */}
        <Route 
          path="/layout-demo" 
          element={
            <ProtectedRoute>
              <RouteWrapper>
                <LayoutDemo />
              </RouteWrapper>
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <RouteWrapper>
                <AdminDashboard />
              </RouteWrapper>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute>
              <RouteWrapper>
                <UserManagement />
              </RouteWrapper>
            </ProtectedRoute>
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
        
        {/* Catch-all route - redirect to dashboard or login */}
        <Route 
          path="*" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Navigate to="/login" replace />
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
      <AuthProvider>
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
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App; 