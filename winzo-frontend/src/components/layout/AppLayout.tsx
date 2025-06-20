import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';

export interface AppLayoutProps {
  children: React.ReactNode;
  currentRoute?: string;
  onNavigate?: (route: string) => void;
  onSearch?: (query: string) => void;
  isLoading?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentRoute = '/dashboard',
  onNavigate,
  onSearch,
  isLoading = false
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [betSlipCount, setBetSlipCount] = useState(2); // Mock bet slip count
  const [liveGamesCount, setLiveGamesCount] = useState(12); // Mock live games count

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse sidebar on mobile
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
        setIsMobileSidebarOpen(false);
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [currentRoute]);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  // Handle navigation
  const handleNavigate = (route: string) => {
    if (onNavigate) {
      onNavigate(route);
    }
    // Close mobile sidebar after navigation
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    if (onSearch) {
      onSearch(query);
    }
  };

  // Close mobile sidebar on overlay click
  const handleOverlayClick = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      {/* Desktop Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed && !isMobile}
        onToggleCollapse={!isMobile ? handleSidebarToggle : undefined}
        activeRoute={currentRoute}
        onNavigate={handleNavigate}
      />

      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <>
          <div className="mobile-sidebar-overlay" onClick={handleOverlayClick} />
          <div className="mobile-sidebar">
            <Sidebar
              isCollapsed={false}
              activeRoute={currentRoute}
              onNavigate={handleNavigate}
            />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className={`main-content ${
        !isMobile ? (isSidebarCollapsed ? 'sidebar-collapsed' : '') : 'mobile'
      }`}>
        {/* Header */}
        <Header
          onMobileMenuToggle={handleSidebarToggle}
          isSidebarCollapsed={isSidebarCollapsed}
          onSearch={handleSearch}
        />

        {/* Page Content */}
        <main className="content">
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p className="loading-text">Loading...</p>
              </div>
            </div>
          ) : (
            <div className="content-wrapper">
              {children}
            </div>
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <MobileBottomNav
            activeRoute={currentRoute}
            onNavigate={handleNavigate}
            betSlipCount={betSlipCount}
            liveGamesCount={liveGamesCount}
          />
        )}
      </div>

      {/* Bet Slip (Desktop) */}
      {!isMobile && betSlipCount > 0 && (
        <div className="bet-slip-container">
          <div className="bet-slip">
            <div className="bet-slip-header">
              <h3 className="title">Bet Slip</h3>
              <span className="count">{betSlipCount}</span>
            </div>
            <div className="bet-slip-content">
              {/* Bet slip content will be rendered here */}
              <div className="bet-slip-placeholder">
                <p>Your bets will appear here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout; 