import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout';
import Dashboard from './pages/Dashboard';
import Sports from './pages/Sports';
import LayoutDemo from './pages/LayoutDemo';
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Default route redirects to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard - main landing page after login */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Sports Betting - main money-making interface */}
          <Route path="/sports" element={<Sports />} />
          
          {/* Layout demo page */}
          <Route path="/layout-demo" element={<LayoutDemo />} />
          
          {/* Catch-all route - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App; 