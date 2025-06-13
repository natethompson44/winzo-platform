import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AuthProvider, { useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import MobileNavigation from './components/MobileNavigation';
import EnhancedNavigation from './components/EnhancedNavigation';
import SimplifiedNavigation from './components/SimplifiedNavigation';
import ComponentLibrary from './components/ComponentLibrary';
import DesignSystemTest from './components/DesignSystemTest';
import Login from './components/Login';
import Register from './components/Register';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import SportsBetting from './components/SportsBetting';
import WalletDashboard from './components/WalletDashboardEnhanced';
import BettingHistory from './components/BettingHistory';
import { BetSlipProvider } from './contexts/BetSlipContext';
import BetSlip from './components/BetSlip';
import MobileBetSlip from './components/MobileBetSlip';
import BetSlipToggle from './components/BetSlipToggle';
import { ProgressiveLoading, LoadingSpinner } from './components/LoadingStates';

// Admin Components
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import BettingManagement from './components/admin/BettingManagement';

import './App.css';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

/**
 * Protected Route Component with Loading States
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="app-loading">
        <LoadingSpinner size="large" message="Loading WINZO..." />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

/**
 * Admin Protected Route Component
 */
const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="app-loading">
        <LoadingSpinner size="large" message="Loading Admin Portal..." />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  // TODO: Add admin role check here
  // For now, we'll allow any authenticated user to access admin
  // In production, you should check for admin privileges
  
  return <>{children}</>;
};

/**
 * App Layout Component with Responsive Navigation
 */
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);

  // Detect mobile and enhanced features
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth <= 768;
      const enhanced = window.innerWidth > 1024;
      setIsMobile(mobile);
      setIsEnhanced(enhanced);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return (
    <div className="app-layout">
      {/* Use Simplified Navigation */}
      <SimplifiedNavigation 
        user={user ? {
          name: user.username,
          balance: user.wallet_balance
        } : undefined}
        onLogout={logout} 
      />
      
      <main className="app-main">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
};

/**
 * Main App Component with Enhanced Error Handling, Navigation, and Performance
 */
function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BetSlipProvider>
            <ErrorBoundary>
              <Router>
                <div className="App">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    
                    {/* Protected Admin Routes */}
                    <Route path="/admin" element={
                      <AdminProtectedRoute>
                        <AdminLayout />
                      </AdminProtectedRoute>
                    }>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="users" element={<UserManagement />} />
                      <Route path="betting" element={<BettingManagement />} />
                      <Route path="financial" element={<div>Financial Management (Coming Soon)</div>} />
                      <Route path="content" element={<div>Content Management (Coming Soon)</div>} />
                      <Route path="system" element={<div>System Administration (Coming Soon)</div>} />
                      <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    </Route>
                    
                    {/* Protected Routes with Layout */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <AppLayout>
                          <ProgressiveLoading
                            isLoading={false}
                            skeleton={<div>Dashboard Skeleton</div>}
                          >
                            <Dashboard />
                          </ProgressiveLoading>
                        </AppLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/sports" element={
                      <ProtectedRoute>
                        <AppLayout>
                          <ProgressiveLoading
                            isLoading={false}
                            skeleton={<div>Sports Skeleton</div>}
                          >
                            <SportsBetting />
                          </ProgressiveLoading>
                        </AppLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/wallet" element={
                      <ProtectedRoute>
                        <AppLayout>
                          <ProgressiveLoading
                            isLoading={false}
                            skeleton={<div>Wallet Skeleton</div>}
                          >
                            <WalletDashboard />
                          </ProgressiveLoading>
                        </AppLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/history" element={
                      <ProtectedRoute>
                        <AppLayout>
                          <ProgressiveLoading
                            isLoading={false}
                            skeleton={<div>History Skeleton</div>}
                          >
                            <BettingHistory />
                          </ProgressiveLoading>
                        </AppLayout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Design System Component Library */}
                    <Route path="/components" element={
                      <ProtectedRoute>
                        <AppLayout>
                          <ComponentLibrary />
                        </AppLayout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Design System Test */}
                    <Route path="/design-system-test" element={
                      <ProtectedRoute>
                        <AppLayout>
                          <DesignSystemTest />
                        </AppLayout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Catch-all redirect */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </Router>
              
              {/* Responsive Bet Slip */}
              <div className="bet-slip-container">
                <BetSlip />
                <MobileBetSlip />
              </div>
              
              <BetSlipToggle />
              
              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--winzo-navy)',
                    color: 'var(--white)',
                    border: '1px solid var(--winzo-teal)',
                    borderRadius: '12px',
                  },
                  success: {
                    iconTheme: {
                      primary: 'var(--win-green)',
                      secondary: 'var(--white)',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: 'var(--danger-red)',
                      secondary: 'var(--white)',
                    },
                  },
                }}
              />
            </ErrorBoundary>
          </BetSlipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;

