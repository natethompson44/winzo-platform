import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AuthProvider, { useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import WinzoLayout from './components/Layout/WinzoLayout';
import WinzoDashboard from './components/WinzoDashboard';
import ComponentLibrary from './components/ComponentLibrary';
import DesignSystemTest from './components/DesignSystemTest';
import Login from './components/Login';
import Register from './components/Register';
import SportsPage from './pages/SportsPage';
import LiveSportsPage from './pages/LiveSportsPage';
import AccountPage from './pages/AccountPage';
import BettingHistory from './components/BettingHistory';
import { BetSlipProvider, useBetSlip } from './contexts/BetSlipContext';
import { BetslipPanel, BetslipTrigger } from './components/betslip';
import { ProgressiveLoading, LoadingSpinner } from './components/LoadingStates';
import HomePage from './components/HomePage';

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
        <LoadingSpinner size="large" message="Loading WINZO Platform..." />
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
 * Betslip Container Component
 */
const BetslipContainer: React.FC = () => {
  const { isOpen, setIsOpen } = useBetSlip();
  
  return (
    <>
      <BetslipPanel 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
      <BetslipTrigger />
    </>
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
                    
                    {/* NEW: WINZO Platform Routes with New Layout */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <WinzoLayout>
                          <ProgressiveLoading
                            isLoading={false}
                            skeleton={<div>Dashboard Loading...</div>}
                          >
                            <WinzoDashboard />
                          </ProgressiveLoading>
                        </WinzoLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/sports" element={
                      <ProtectedRoute>
                        <WinzoLayout>
                          <ProgressiveLoading
                            isLoading={false}
                            skeleton={<div>Sports Loading...</div>}
                          >
                            <SportsPage />
                          </ProgressiveLoading>
                        </WinzoLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/live-sports" element={
                      <ProtectedRoute>
                        <WinzoLayout>
                          <ProgressiveLoading
                            isLoading={false}
                            skeleton={<div>Live Sports Loading...</div>}
                          >
                            <LiveSportsPage />
                          </ProgressiveLoading>
                        </WinzoLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/account" element={
                      <ProtectedRoute>
                        <WinzoLayout>
                          <ProgressiveLoading
                            isLoading={false}
                            skeleton={<div>Account Loading...</div>}
                          >
                            <AccountPage />
                          </ProgressiveLoading>
                        </WinzoLayout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/history" element={
                      <ProtectedRoute>
                        <WinzoLayout>
                          <ProgressiveLoading
                            isLoading={false}
                            skeleton={<div>History Loading...</div>}
                          >
                            <BettingHistory />
                          </ProgressiveLoading>
                        </WinzoLayout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Design System Component Library */}
                    <Route path="/components" element={
                      <ProtectedRoute>
                        <WinzoLayout>
                          <ComponentLibrary />
                        </WinzoLayout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Design System Test */}
                    <Route path="/design-system-test" element={
                      <ProtectedRoute>
                        <WinzoLayout>
                          <DesignSystemTest />
                        </WinzoLayout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Catch-all redirect to dashboard */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </div>
              </Router>
              
              {/* Unified Betslip System */}
              <BetslipContainer />
              
              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1a365d',
                    color: '#ffffff',
                    border: '1px solid #d69e2e',
                    borderRadius: '12px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#38a169',
                      secondary: '#ffffff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#e53e3e',
                      secondary: '#ffffff',
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

