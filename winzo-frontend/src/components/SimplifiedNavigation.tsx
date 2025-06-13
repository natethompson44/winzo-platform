import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './SimplifiedNavigation.css';

interface SimplifiedNavigationProps {
  user?: {
    name: string;
    balance: number;
  };
  onLogout?: () => void;
}

/**
 * Simplified Navigation Component
 * 
 * Streamlined navigation that prioritizes the most important user tasks:
 * - Viewing sports markets
 * - Placing bets
 * - Managing account funds
 * - Accessing betting history
 */
const SimplifiedNavigation: React.FC<SimplifiedNavigationProps> = ({
  user,
  onLogout
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Primary navigation items - prioritized by importance
  const primaryNavItems = [
    {
      path: '/sports',
      label: 'Sports',
      icon: '🏈',
      description: 'Browse and bet on sports'
    },
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊',
      description: 'View your betting overview'
    },
    {
      path: '/wallet',
      label: 'Wallet',
      icon: '💰',
      description: 'Manage your funds'
    },
    {
      path: '/history',
      label: 'History',
      icon: '📋',
      description: 'View betting history'
    }
  ];

  // Quick actions for immediate access
  const quickActions = [
    {
      label: 'Quick Bet',
      icon: '⚡',
      action: () => navigate('/sports'),
      color: 'success'
    },
    {
      label: 'Deposit',
      icon: '💳',
      action: () => navigate('/wallet'),
      color: 'primary'
    }
  ];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="simplified-nav desktop-only">
        <div className="nav-container">
          {/* Logo */}
          <Link to="/dashboard" className="nav-logo">
            <span className="logo-text">WINZO</span>
          </Link>

          {/* Primary Navigation */}
          <div className="nav-primary">
            {primaryNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                title={item.description}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="nav-actions">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className={`btn btn-${action.color} btn-sm`}
                onClick={action.action}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label}</span>
              </button>
            ))}
          </div>

          {/* User Menu */}
          <div className="nav-user" ref={userMenuRef}>
            {user ? (
              <>
                <button
                  className="user-menu-toggle"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="User menu"
                >
                  <span className="user-avatar">👤</span>
                  <span className="user-name">{user.name}</span>
                  <span className="user-balance">${user.balance.toFixed(2)}</span>
                </button>

                {showUserMenu && (
                  <div className="user-menu">
                    <div className="user-menu-header">
                      <span className="user-menu-name">{user.name}</span>
                      <span className="user-menu-balance">${user.balance.toFixed(2)}</span>
                    </div>
                    
                    <div className="user-menu-actions">
                      <Link to="/profile" className="user-menu-item">
                        <span className="menu-icon">⚙️</span>
                        <span>Settings</span>
                      </Link>
                      <Link to="/support" className="user-menu-item">
                        <span className="menu-icon">💬</span>
                        <span>Support</span>
                      </Link>
                      <Link to="/components" className="user-menu-item">
                        <span className="menu-icon">🎨</span>
                        <span>Components</span>
                      </Link>
                      <button 
                        className="user-menu-item logout"
                        onClick={onLogout}
                      >
                        <span className="menu-icon">🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="simplified-nav mobile-only">
        <div className="mobile-nav-container">
          {/* Mobile Header */}
          <div className="mobile-nav-header">
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>

            <Link to="/dashboard" className="mobile-logo">
              <span className="logo-text">WINZO</span>
            </Link>

            {user && (
              <div className="mobile-user-info">
                <span className="mobile-balance">${user.balance.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="mobile-menu" ref={mobileMenuRef}>
              {/* Primary Navigation */}
              <div className="mobile-nav-section">
                <h3 className="mobile-section-title">Navigation</h3>
                {primaryNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="mobile-nav-icon">{item.icon}</span>
                    <div className="mobile-nav-content">
                      <span className="mobile-nav-label">{item.label}</span>
                      <span className="mobile-nav-description">{item.description}</span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mobile-nav-section">
                <h3 className="mobile-section-title">Quick Actions</h3>
                <div className="mobile-quick-actions">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      className={`btn btn-${action.color}`}
                      onClick={() => {
                        action.action();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <span className="action-icon">{action.icon}</span>
                      <span className="action-label">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* User Actions */}
              {user && (
                <div className="mobile-nav-section">
                  <h3 className="mobile-section-title">Account</h3>
                  <div className="mobile-user-actions">
                    <Link to="/profile" className="mobile-user-item">
                      <span className="menu-icon">⚙️</span>
                      <span>Settings</span>
                    </Link>
                    <Link to="/support" className="mobile-user-item">
                      <span className="menu-icon">💬</span>
                      <span>Support</span>
                    </Link>
                    <Link to="/components" className="mobile-user-item">
                      <span className="menu-icon">🎨</span>
                      <span>Components</span>
                    </Link>
                    <button 
                      className="mobile-user-item logout"
                      onClick={() => {
                        onLogout?.();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <span className="menu-icon">🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default SimplifiedNavigation; 