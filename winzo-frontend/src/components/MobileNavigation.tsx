import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import winzoLogo from '../assets/winzo-logo.png';
import './MobileNavigation.css';

interface MobileNavigationProps {
  user?: any;
  onLogout?: () => void;
}

/**
 * WINZO Mobile Navigation Component
 * 
 * Touch-optimized navigation with swipe gestures, mobile-specific patterns,
 * and responsive design for all mobile devices.
 */
const MobileNavigation: React.FC<MobileNavigationProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (isMenuOpen) setIsMenuOpen(false);
    },
    onSwipedRight: () => {
      if (!isMenuOpen) setIsMenuOpen(true);
    },
    trackMouse: false
  });

  // Navigation items with touch-optimized targets
  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠', color: '#00b4d8' },
    { path: '/sports', label: 'Sports', icon: '🏈', color: '#10b981' },
    { path: '/wallet', label: 'Wallet', icon: '💰', color: '#f59e0b' },
    { path: '/history', label: 'History', icon: '📊', color: '#8b5cf6' }
  ];

  // Quick actions for mobile
  const quickActions = [
    { label: 'Quick Bet', icon: '⚡', action: () => navigate('/sports') },
    { label: 'Deposit', icon: '💳', action: () => navigate('/wallet') },
    { label: 'Support', icon: '💬', action: () => window.open('mailto:support@winzo.com') }
  ];

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic here
    console.log('Searching for:', query);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
      }
      if (e.key === 's' && e.ctrlKey) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
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
      {/* Mobile Navigation Bar */}
      <nav className="mobile-nav" {...swipeHandlers}>
        <div className="mobile-nav-header">
          {/* Menu Toggle Button */}
          <button 
            className="mobile-nav-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {/* Logo */}
          <Link to="/dashboard" className="mobile-nav-logo">
            <img src={winzoLogo} alt="WINZO" />
          </Link>

          {/* Search Toggle */}
          <button 
            className="mobile-nav-search-toggle"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Toggle search"
          >
            🔍
          </button>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="mobile-search-container">
            <div className="mobile-search">
              <input
                type="text"
                placeholder="Search events, bets, transactions..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="mobile-search-input"
              />
              <button className="mobile-search-clear" onClick={() => setSearchQuery('')}>
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Bottom Tab Navigation */}
        <div className="mobile-tab-nav">
          {navigationItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-tab-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              <div className="mobile-tab-icon" style={{ backgroundColor: item.color }}>
                {item.icon}
              </div>
              <span className="mobile-tab-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Side Menu */}
      {isMenuOpen && (
        <div 
          ref={menuRef}
          className="mobile-side-menu"
        >
          <div className="mobile-menu-header">
            <div className="mobile-user-info">
              <div className="mobile-user-avatar">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="mobile-user-details">
                <h3>{user?.username || 'User'}</h3>
                <p>Welcome back!</p>
              </div>
            </div>
          </div>

          <div className="mobile-menu-content">
            {/* Quick Actions */}
            <div className="mobile-quick-actions">
              <h4>Quick Actions</h4>
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="mobile-quick-action-btn"
                  onClick={action.action}
                >
                  <span className="quick-action-icon">{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>

            {/* Navigation Links */}
            <div className="mobile-menu-links">
              <h4>Navigation</h4>
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-menu-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="menu-link-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* User Actions */}
            <div className="mobile-user-actions">
              <button className="mobile-settings-btn">
                ⚙️ Settings
              </button>
              <button className="mobile-help-btn">
                ❓ Help
              </button>
              <button className="mobile-logout-btn" onClick={onLogout}>
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isMenuOpen && (
        <div 
          className="mobile-menu-backdrop"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};

export default MobileNavigation; 