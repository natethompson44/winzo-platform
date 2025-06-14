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
 * WINZO Mobile Navigation Component - Website Experience
 * 
 * Professional mobile web navigation that maintains website feel:
 * - Collapsible hamburger menu for sports categories
 * - Hierarchical structure from desktop
 * - Touch-friendly category expansion
 * - Quick access to popular sports
 * - Search functionality optimized for mobile
 * - NO mobile app-style bottom navigation
 */
const MobileNavigation: React.FC<MobileNavigationProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sports categories for hamburger menu
  const sportsCategories = [
    { id: 'football', name: 'Football', icon: '🏈', isLive: true, liveCount: 12 },
    { id: 'soccer', name: 'Soccer', icon: '⚽', isLive: true, liveCount: 18 },
    { id: 'basketball', name: 'Basketball', icon: '🏀', isLive: true, liveCount: 8 },
    { id: 'baseball', name: 'Baseball', icon: '⚾', isLive: false, liveCount: 0 },
    { id: 'hockey', name: 'Hockey', icon: '🏒', isLive: true, liveCount: 6 },
    { id: 'tennis', name: 'Tennis', icon: '🎾', isLive: true, liveCount: 4 },
    { id: 'mma', name: 'MMA', icon: '🥊', isLive: false, liveCount: 0 },
    { id: 'esports', name: 'Esports', icon: '🎮', isLive: true, liveCount: 3 }
  ];

  // Popular sports for quick access
  const popularSports = ['football', 'soccer', 'basketball', 'hockey'];

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

  // Navigation items - website-style navigation
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/sports', label: 'Sports Betting', icon: '🏈' },
    { path: '/wallet', label: 'Wallet', icon: '💰' },
    { path: '/history', label: 'Betting History', icon: '📈' }
  ];

  // Quick actions for mobile
  const quickActions = [
    { label: 'Quick Bet', icon: '⚡', action: () => navigate('/sports') },
    { label: 'Deposit', icon: '💳', action: () => navigate('/wallet') },
    { label: 'Support', icon: '💬', action: () => window.open('mailto:support@winzo.com') }
  ];

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

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
      {/* Mobile Navigation Bar - Website Style */}
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

        {/* Website-style navigation links */}
        <div className="mobile-nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="nav-link-icon">{item.icon}</span>
              <span className="nav-link-label">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Side Menu with Sports Categories */}
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

            {/* Sports Categories - Hierarchical Structure */}
            <div className="mobile-sports-categories">
              <h4>Sports Categories</h4>
              
              {/* Popular Sports Quick Access */}
              <div className="popular-sports">
                <h5>Popular Sports</h5>
                <div className="popular-sports-grid">
                  {popularSports.map(sportId => {
                    const sport = sportsCategories.find(s => s.id === sportId);
                    return sport ? (
                      <button
                        key={sport.id}
                        className="popular-sport-btn"
                        onClick={() => navigate(`/sports/${sport.id}`)}
                      >
                        <span className="sport-icon">{sport.icon}</span>
                        <span className="sport-name">{sport.name}</span>
                        {sport.isLive && (
                          <span className="live-indicator">LIVE</span>
                        )}
                      </button>
                    ) : null;
                  })}
                </div>
              </div>

              {/* All Sports Categories */}
              <div className="all-sports-categories">
                <h5>All Sports</h5>
                {sportsCategories.map((category) => (
                  <div key={category.id} className="sport-category">
                    <button
                      className="category-toggle"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <span className="category-icon">{category.icon}</span>
                      <span className="category-name">{category.name}</span>
                      <span className="category-count">
                        {category.isLive && `${category.liveCount} live`}
                      </span>
                      <span className={`expand-icon ${expandedCategories.includes(category.id) ? 'expanded' : ''}`}>
                        {expandedCategories.includes(category.id) ? '▼' : '▶'}
                      </span>
                    </button>
                    
                    {expandedCategories.includes(category.id) && (
                      <div className="category-submenu">
                        <Link to={`/sports/${category.id}`} className="submenu-link">
                          View All {category.name} Events
                        </Link>
                        <Link to={`/sports/${category.id}/live`} className="submenu-link">
                          Live {category.name} Events
                        </Link>
                        <Link to={`/sports/${category.id}/upcoming`} className="submenu-link">
                          Upcoming {category.name} Events
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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