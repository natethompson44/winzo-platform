import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider, { useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Register from './components/Register';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import SportsBetting from './components/SportsBetting';
import WalletDashboard from './components/WalletDashboardEnhanced';
import BettingHistory from './components/BettingHistory';
import { BetSlipProvider } from './contexts/BetSlipContext';
import BetSlip from './components/BetSlip';
import BetSlipToggle from './components/BetSlipToggle';
import './App.css';

/**
 * Protected Route Component
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading WINZO...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

/**
 * App Layout Component
 */
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  
  return (
    <div className="app-layout">
      <Navigation user={user} onLogout={logout} />
      <main className="app-main">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
};

/**
 * Main App Component with Enhanced Error Handling and Navigation
 */
function App() {
  return (
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
              
              {/* Protected Routes with Layout */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/sports" element={
                <ProtectedRoute>
                  <AppLayout>
                    <SportsBetting />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/wallet" element={
                <ProtectedRoute>
                  <AppLayout>
                    <WalletDashboard />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/history" element={
                <ProtectedRoute>
                  <AppLayout>
                    <BettingHistory />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
        <BetSlip />
        <BetSlipToggle />
        </ErrorBoundary>
      </BetSlipProvider>
    </AuthProvider>
  );
}

export default App;

