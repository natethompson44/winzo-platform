import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useHotkeys } from 'react-hotkeys-hook';
import winzoLogo from '../assets/winzo-logo.png';
import './EnhancedNavigation.css';

interface EnhancedNavigationProps {
  user?: any;
  onLogout?: () => void;
}

/**
 * WINZO Enhanced Navigation Component
 * 
 * Advanced navigation with breadcrumbs, global search, quick access toolbar,
 * contextual help, and keyboard navigation support.
 */
const EnhancedNavigation: React.FC<EnhancedNavigationProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcuts
  useHotkeys('ctrl+k, cmd+k', (e) => {
    e.preventDefault();
    setIsSearchOpen(true);
  });

  useHotkeys('f1', (e) => {
    e.preventDefault();
    setShowHelp(true);
  });

  useHotkeys('escape', () => {
    setIsSearchOpen(false);
    setShowHelp(false);
    setActiveTooltip(null);
  });

  // Navigation items with enhanced features
  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', description: 'View your betting overview' },
    { path: '/sports', label: 'Sports', icon: '🏈', description: 'Browse sports events' },
    { path: '/wallet', label: 'Wallet', icon: '💰', description: 'Manage your funds' },
    { path: '/history', label: 'History', icon: '📈', description: 'View betting history' }
  ];

  // Quick actions for enhanced toolbar
  const quickActions = [
    { label: 'Quick Bet', icon: '⚡', action: () => navigate('/sports'), description: 'Place a quick bet' },
    { label: 'Deposit', icon: '💳', action: () => navigate('/wallet'), description: 'Add funds to wallet' },
    { label: 'Support', icon: '💬', action: () => window.open('mailto:support@winzo.com'), description: 'Contact support' },
    { label: 'Settings', icon: '⚙️', action: () => navigate('/settings'), description: 'Account settings' }
  ];

  // Breadcrumb generation
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/' }];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ label, path: currentPath });
    });
    
    return breadcrumbs;
  };

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic here
    console.log('Searching for:', query);
  };

  // Global search results (mock data)
  const searchResults = [
    { type: 'event', title: 'Manchester United vs Liverpool', path: '/sports' },
    { type: 'bet', title: 'Recent bet on Premier League', path: '/history' },
    { type: 'wallet', title: 'Wallet transaction', path: '/wallet' }
  ];

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close help when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setShowHelp(false);
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
      {/* Enhanced Navigation Bar */}
      <nav className="enhanced-nav">
        <div className="nav-container">
          {/* Logo and Brand */}
          <div className="nav-brand">
            <Link to="/dashboard" className="nav-logo">
              <img src={winzoLogo} alt="WINZO" />
            </Link>
          </div>

          {/* Breadcrumb Navigation */}
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

          {/* Global Search */}
          <div className="nav-search" ref={searchRef}>
            <button 
              className="search-toggle"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Toggle search"
            >
              🔍
            </button>
            
            {isSearchOpen && (
              <div className="nav-search-dropdown">
                <div className="search-input-container">
                  <input
                    type="text"
                    placeholder="Search events, bets, transactions..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="search-input"
                    autoFocus
                  />
                  <button className="search-clear" onClick={() => setSearchQuery('')}>
                    ✕
                  </button>
                </div>
                
                {searchQuery && (
                  <div className="search-results">
                    {searchResults.map((result, index) => (
                      <Link
                        key={index}
                        to={result.path}
                        className="search-result-item"
                        onClick={() => setIsSearchOpen(false)}
                      >
                        <span className="result-icon">
                          {result.type === 'event' ? '🏈' : result.type === 'bet' ? '💰' : '💳'}
                        </span>
                        <span className="result-title">{result.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Access Toolbar */}
          <div className="nav-toolbar">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="toolbar-action"
                onClick={action.action}
                onMouseEnter={() => setActiveTooltip(action.label)}
                onMouseLeave={() => setActiveTooltip(null)}
                aria-label={action.description}
              >
                <span className="action-icon">{action.icon}</span>
                <span className="action-label">{action.label}</span>
                
                {/* Tooltip */}
                {activeTooltip === action.label && (
                  <div className="action-tooltip">
                    {action.description}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* User Menu */}
          <div className="nav-user">
            <div className="user-info">
              <div className="user-avatar">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <span className="username">{user?.username || 'User'}</span>
                <span className="user-balance">${user?.balance || '0.00'}</span>
              </div>
            </div>
            
            <div className="user-menu">
              <button className="help-btn" onClick={() => setShowHelp(true)}>
                ❓
              </button>
              <button className="settings-btn">
                ⚙️
              </button>
              <button className="logout-btn" onClick={onLogout}>
                🚪
              </button>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="nav-main">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onMouseEnter={() => setActiveTooltip(item.label)}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              
              {/* Tooltip */}
              {activeTooltip === item.label && (
                <div className="nav-tooltip">
                  {item.description}
                </div>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Contextual Help Panel */}
      {showHelp && (
        <div ref={helpRef} className="help-panel">
          <div className="help-content">
            <div className="help-header">
              <h3>Help & Support</h3>
              <button className="help-close" onClick={() => setShowHelp(false)}>
                ✕
              </button>
            </div>
            
            <div className="help-sections">
              <div className="help-section">
                <h4>Keyboard Shortcuts</h4>
                <ul>
                  <li><kbd>Ctrl+K</kbd> or <kbd>Cmd+K</kbd> - Open search</li>
                  <li><kbd>F1</kbd> - Open help</li>
                  <li><kbd>Esc</kbd> - Close dialogs</li>
                </ul>
              </div>
              
              <div className="help-section">
                <h4>Quick Actions</h4>
                <ul>
                  <li>Use the toolbar for quick access to common features</li>
                  <li>Search for events, bets, and transactions</li>
                  <li>Navigate using breadcrumbs for easy location tracking</li>
                </ul>
              </div>
              
              <div className="help-section">
                <h4>Need More Help?</h4>
                <button className="contact-support">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Backdrop */}
      {showHelp && (
        <div 
          className="help-backdrop"
          onClick={() => setShowHelp(false)}
        />
      )}
    </>
  );
};

export default EnhancedNavigation; 