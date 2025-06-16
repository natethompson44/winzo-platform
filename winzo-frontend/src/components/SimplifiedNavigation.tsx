import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  DashboardIcon,
  SportsIcon,
  WalletIcon,
  HistoryIcon
} from './icons/IconLibrary';
import './SimplifiedNavigation.css';

interface SimplifiedNavigationProps {
  user?: {
    username: string;
    balance: number;
  };
  onLogout?: () => void;
}

/**
 * WINZO Simplified Navigation - Premium Desktop Experience
 * 
 * A streamlined, luxury navigation system that provides:
 * - Clear visual hierarchy
 * - Premium animations and transitions
 * - Consistent branding
 * - Responsive design
 * - Accessibility features
 */
const SimplifiedNavigation: React.FC<SimplifiedNavigationProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeHover, setActiveHover] = useState<string | null>(null);

  // Enhanced luxury navigation items with clear hierarchy and purpose
  const navigationItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: DashboardIcon, 
      priority: 'primary',
      'aria-label': 'Go to Dashboard'
    },
    { 
      path: '/sports', 
      label: 'Sports', 
      icon: SportsIcon, 
      priority: 'primary',
      'aria-label': 'View Sports Betting'
    },
    { 
      path: '/wallet', 
      label: 'Wallet', 
      icon: WalletIcon, 
      priority: 'primary',
      'aria-label': 'Manage Wallet'
    },
    { 
      path: '/history', 
      label: 'History', 
      icon: HistoryIcon, 
      priority: 'secondary',
      'aria-label': 'View Betting History'
    }
  ];

  // Handle scroll events for nav appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle escape key for mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Don't show navigation on public pages
  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav 
      className={`enhanced-nav ${isScrolled ? 'scrolled' : ''}`} 
      role="navigation" 
      aria-label="Main navigation"
    >
      <div className="luxury-nav-container">
        {/* Enhanced Logo with better brand presentation */}
        <Link 
          to="/" 
          className="luxury-nav-logo" 
          aria-label="WINZO Home"
        >
          <div className="luxury-logo-container">
            <span className="luxury-logo-text">WINZO</span>
            <span className="luxury-logo-tagline">Premium Sports Betting</span>
          </div>
        </Link>

        {/* Desktop Navigation - Streamlined and touch-optimized */}
        <div className="luxury-nav-links" role="menubar">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = isActiveRoute(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`luxury-nav-link ${isActive ? 'active' : ''} ${item.priority}`}
                role="menuitem"
                aria-current={isActive ? 'page' : undefined}
                aria-label={item['aria-label']}
                onMouseEnter={() => setActiveHover(item.path)}
                onMouseLeave={() => setActiveHover(null)}
              >
                <IconComponent 
                  size="sm" 
                  color={isActive ? 'secondary' : 'neutral'}
                  aria-hidden={true}
                  className={activeHover === item.path ? 'nav-icon-hover' : ''}
                />
                <span className="luxury-nav-link-text">{item.label}</span>
                {isActive && <div className="luxury-nav-link-indicator" />}
              </Link>
            );
          })}
        </div>

        {/* Enhanced User Section */}
        {user && (
          <div className="luxury-user-section">
            <div className="luxury-user-info">
              <div className="luxury-user-avatar" aria-hidden="true">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="luxury-user-details">
                <span className="luxury-user-name">{user.username}</span>
                <span className="luxury-user-balance">
                  ${user.balance.toLocaleString()}
                </span>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="luxury-nav-link"
                aria-label="Sign out"
              >
                Sign Out
              </button>
            )}
          </div>
        )}

        {/* Mobile Menu Toggle */}
        <button
          className={`luxury-mobile-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav"
        >
          <span className="luxury-toggle-line" />
          <span className="luxury-toggle-line" />
          <span className="luxury-toggle-line" />
        </button>
      </div>

      {/* Enhanced Mobile Navigation */}
      <div 
        id="mobile-nav"
        className={`luxury-mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="luxury-mobile-nav-content">
          {/* Mobile Navigation Links */}
          <div className="luxury-mobile-nav-links">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`luxury-mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item['aria-label']}
                >
                  <IconComponent 
                    size="md" 
                    color={isActive ? 'secondary' : 'neutral'}
                    aria-hidden={true}
                  />
                  <span className="luxury-nav-link-text">{item.label}</span>
                  {isActive && <div className="luxury-nav-link-indicator" />}
                </Link>
              );
            })}
          </div>

          {/* Mobile User Section */}
          {user && (
            <div className="luxury-user-section">
              <div className="luxury-user-info">
                <div className="luxury-user-avatar" aria-hidden="true">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="luxury-user-details">
                  <span className="luxury-user-name">{user.username}</span>
                  <span className="luxury-user-balance">
                    ${user.balance.toLocaleString()}
                  </span>
                </div>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="luxury-mobile-nav-link"
                  aria-label="Sign out"
                >
                  Sign Out
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default SimplifiedNavigation; 