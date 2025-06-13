import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  DashboardIcon, 
  SportsIcon, 
  WalletIcon, 
  HistoryIcon, 
  UserIcon, 
  LogoutIcon,
  SettingsIcon,
  SupportIcon
} from './icons/IconLibrary';
import './SimplifiedNavigation.css';

interface User {
  name: string;
  balance: number;
}

interface SimplifiedNavigationProps {
  user?: User;
  onLogout: () => void;
}

/**
 * Enhanced Simplified Navigation Component
 * 
 * Addresses critical UX issues:
 * - Touch target optimization (44px minimum)
 * - Navigation simplification with clear hierarchy
 * - Mobile-first responsive design
 * - Professional iconography replacing emojis
 * - Clear visual feedback and states
 */
const SimplifiedNavigation: React.FC<SimplifiedNavigationProps> = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();

  // Handle scroll effect for visual feedback
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle logout with loading state
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(balance);
  };

  // Navigation items with clear hierarchy and purpose
  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon, priority: 'primary' },
    { path: '/sports', label: 'Sports', icon: SportsIcon, priority: 'primary' },
    { path: '/wallet', label: 'Wallet', icon: WalletIcon, priority: 'primary' },
    { path: '/history', label: 'History', icon: HistoryIcon, priority: 'secondary' },
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className={`enhanced-nav ${isScrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="nav-container">
        {/* Enhanced Logo with better brand presentation */}
        <Link to="/" className="nav-logo" aria-label="WINZO Home">
          <div className="logo-container">
            <span className="logo-text">WINZO</span>
            <span className="logo-tagline">Premium Sports Betting</span>
          </div>
        </Link>

        {/* Desktop Navigation - Streamlined and touch-optimized */}
        <div className="nav-desktop">
          <div className="nav-links" role="menubar">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive ? 'active' : ''} ${item.priority}`}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <IconComponent 
                    size="sm" 
                    color={isActive ? 'secondary' : 'neutral'}
                    aria-hidden={true}
                  />
                  <span className="nav-link-text">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Enhanced User Actions */}
          <div className="nav-actions">
            {user ? (
              <div className="user-section">
                <div className="user-info" aria-label={`User: ${user.name}, Balance: ${formatBalance(user.balance)}`}>
                  <div className="user-avatar">
                    <UserIcon size="sm" color="neutral" aria-hidden={true} />
                  </div>
                  <div className="user-details">
                    <span className="user-name">{user.name}</span>
                    <span className="user-balance">{formatBalance(user.balance)}</span>
                  </div>
                </div>
                
                <div className="user-actions">
                  <button 
                    className="btn btn-icon btn-ghost" 
                    aria-label="Settings"
                    title="Settings"
                  >
                    <SettingsIcon size="sm" color="neutral" aria-hidden={true} />
                  </button>
                  
                  <button 
                    className="btn btn-icon btn-ghost" 
                    aria-label="Support"
                    title="Support"
                  >
                    <SupportIcon size="sm" color="neutral" aria-hidden={true} />
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`btn btn-outline btn-sm ${isLoggingOut ? 'btn-loading' : ''}`}
                    aria-label="Logout"
                  >
                    {isLoggingOut ? (
                      <>
                        <span className="spinner" aria-hidden="true"></span>
                        <span className="sr-only">Logging out...</span>
                      </>
                    ) : (
                      <>
                        <LogoutIcon size="sm" color="neutral" aria-hidden={true} />
                        <span>Logout</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-actions">
                <Link to="/login" className="btn btn-primary btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-secondary btn-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Mobile Menu Button - Touch optimized */}
        <button
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav"
        >
          <span className="hamburger-line" aria-hidden="true"></span>
          <span className="hamburger-line" aria-hidden="true"></span>
          <span className="hamburger-line" aria-hidden="true"></span>
        </button>
      </div>

      {/* Enhanced Mobile Navigation */}
      <div 
        id="mobile-nav"
        className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}
        role="dialog"
        aria-label="Mobile navigation menu"
        aria-modal="true"
      >
        <div className="mobile-nav-content">
          {/* Mobile User Info */}
          {user && (
            <div className="mobile-user-section">
              <div className="mobile-user-info">
                <div className="mobile-user-avatar">
                  <UserIcon size="md" color="neutral" aria-hidden={true} />
                </div>
                <div className="mobile-user-details">
                  <div className="mobile-user-name">{user.name}</div>
                  <div className="mobile-user-balance">{formatBalance(user.balance)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Navigation Links */}
          <div className="mobile-nav-links" role="menu">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <IconComponent 
                    size="md" 
                    color={isActive ? 'secondary' : 'neutral'}
                    aria-hidden={true}
                  />
                  <span className="mobile-nav-link-text">{item.label}</span>
                  {isActive && <span className="active-indicator" aria-hidden="true"></span>}
                </Link>
              );
            })}
          </div>

          {/* Mobile Actions */}
          <div className="mobile-nav-actions">
            {user ? (
              <div className="mobile-user-actions">
                <div className="mobile-action-buttons">
                  <button 
                    className="btn btn-icon btn-ghost btn-lg" 
                    aria-label="Settings"
                    title="Settings"
                  >
                    <SettingsIcon size="md" color="neutral" aria-hidden={true} />
                    <span className="action-label">Settings</span>
                  </button>
                  
                  <button 
                    className="btn btn-icon btn-ghost btn-lg" 
                    aria-label="Support"
                    title="Support"
                  >
                    <SupportIcon size="md" color="neutral" aria-hidden={true} />
                    <span className="action-label">Support</span>
                  </button>
                </div>
                
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`btn btn-outline btn-lg full-width ${isLoggingOut ? 'btn-loading' : ''}`}
                  aria-label="Logout"
                >
                  {isLoggingOut ? (
                    <>
                      <span className="spinner" aria-hidden="true"></span>
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogoutIcon size="md" color="neutral" aria-hidden={true} />
                      <span>Logout</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="mobile-auth-actions">
                <Link to="/login" className="btn btn-primary btn-lg full-width">
                  Login
                </Link>
                <Link to="/register" className="btn btn-secondary btn-lg full-width">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={toggleMobileMenu}
          aria-hidden="true"
        ></div>
      )}
    </nav>
  );
};

export default SimplifiedNavigation; 