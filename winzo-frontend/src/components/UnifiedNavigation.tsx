import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import winzoLogo from '../assets/winzo-logo.png';
import './UnifiedNavigation.css';

interface UnifiedNavigationProps {
  user?: any;
  onLogout?: () => void;
}

/**
 * WINZO Unified Navigation Component
 * 
 * Consolidated navigation system that merges multiple navigation bars
 * into one clean, responsive system with proper hierarchy.
 */
const UnifiedNavigation: React.FC<UnifiedNavigationProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Primary navigation items
  const primaryNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', description: 'View your betting overview' },
    { path: '/sports', label: 'Sports', icon: '🏈', description: 'Browse sports events' },
    { path: '/wallet', label: 'Wallet', icon: '💰', description: 'Manage your funds' },
    { path: '/history', label: 'History', icon: '📈', description: 'View betting history' }
  ];

  // Secondary navigation items (quick actions)
  const secondaryNavItems = [
    { label: 'Quick Bet', icon: '⚡', action: () => navigate('/sports'), description: 'Place a quick bet' },
    { label: 'Deposit', icon: '💳', action: () => navigate('/wallet'), description: 'Add funds to wallet' },
    { label: 'Support', icon: '💬', action: () => window.open('mailto:support@winzo.com'), description: 'Contact support' },
    { label: 'Settings', icon: '⚙️', action: () => navigate('/settings'), description: 'Account settings' }
  ];

  // Breadcrumb generation
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/dashboard' }];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ label, path: currentPath });
    });
    
    return breadcrumbs;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't show navigation on public pages
  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="unified-nav desktop-nav">
        <div className="nav-container">
          {/* Logo and Brand */}
          <div className="nav-brand">
            <Link to="/dashboard" className="nav-logo">
              <img src={winzoLogo} alt="WINZO" />
            </Link>
          </div>

          {/* Primary Navigation */}
          <div className="nav-primary">
            {primaryNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                title={item.description}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Breadcrumbs */}
          <div className="nav-breadcrumbs">
            {generateBreadcrumbs().map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                {index > 0 && <span className="breadcrumb-separator">/</span>}
                <Link 
                  to={crumb.path}
                  className={`breadcrumb-item ${location.pathname === crumb.path ? 'active' : ''}`}
                >
                  {crumb.label}
                </Link>
              </React.Fragment>
            ))}
          </div>

          {/* User Controls */}
          <div className="nav-user">
            {user && (
              <div className="user-info">
                <span className="user-greeting">
                  Welcome, <strong>{user.username}</strong>
                </span>
              </div>
            )}
            
            {/* Quick Actions Dropdown */}
            <div className="nav-dropdown" ref={dropdownRef}>
              <button 
                className="dropdown-toggle"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-label="Quick actions"
              >
                ⚡ Quick Actions
                <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
              </button>
              
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  {secondaryNavItems.map((item, index) => (
                    <button
                      key={index}
                      className="dropdown-item"
                      onClick={() => {
                        item.action();
                        setIsDropdownOpen(false);
                      }}
                      title={item.description}
                    >
                      <span className="dropdown-icon">{item.icon}</span>
                      <span className="dropdown-label">{item.label}</span>
                    </button>
                  ))}
                  
                  {user && (
                    <button
                      className="dropdown-item logout-item"
                      onClick={() => {
                        onLogout?.();
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span className="dropdown-icon">🚪</span>
                      <span className="dropdown-label">Sign Out</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="unified-nav mobile-nav">
        <div className="mobile-nav-header">
          {/* Mobile Menu Toggle */}
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

          {/* Logo */}
          <Link to="/dashboard" className="mobile-nav-logo">
            <img src={winzoLogo} alt="WINZO" />
          </Link>

          {/* User Avatar */}
          {user && (
            <div className="mobile-user-avatar">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu" ref={mobileMenuRef}>
            {/* User Info */}
            {user && (
              <div className="mobile-user-info">
                <h3>{user.username}</h3>
                <p>Welcome back!</p>
              </div>
            )}

            {/* Primary Navigation */}
            <div className="mobile-nav-section">
              <h4>Navigation</h4>
              {primaryNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mobile-nav-icon">{item.icon}</span>
                  <span className="mobile-nav-label">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mobile-nav-section">
              <h4>Quick Actions</h4>
              {secondaryNavItems.map((item, index) => (
                <button
                  key={index}
                  className="mobile-quick-action"
                  onClick={() => {
                    item.action();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span className="mobile-action-icon">{item.icon}</span>
                  <span className="mobile-action-label">{item.label}</span>
                </button>
              ))}
              
              {user && (
                <button
                  className="mobile-quick-action logout-action"
                  onClick={() => {
                    onLogout?.();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span className="mobile-action-icon">🚪</span>
                  <span className="mobile-action-label">Sign Out</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bottom Tab Navigation */}
        <div className="mobile-tab-nav">
          {primaryNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-tab-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="mobile-tab-icon">{item.icon}</div>
              <span className="mobile-tab-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default UnifiedNavigation; 