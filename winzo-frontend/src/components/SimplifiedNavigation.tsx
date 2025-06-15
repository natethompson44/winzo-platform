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
 * Enhanced Simplified Navigation Component with Luxury Features
 * 
 * Addresses critical UX issues:
 * - Touch target optimization (44px minimum)
 * - Navigation simplification with clear hierarchy
 * - Mobile-first responsive design
 * - Professional iconography replacing emojis
 * - Clear visual feedback and states
 * - Luxury animations and premium styling
 */
const SimplifiedNavigation: React.FC<SimplifiedNavigationProps> = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeHover, setActiveHover] = useState<string | null>(null);
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
    <nav className={`enhanced-nav luxury-nav ${isScrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      <div className="nav-container luxury-nav-container">
        {/* Enhanced Logo with better brand presentation */}
        <Link to="/" className="nav-logo luxury-nav-logo luxury-hover-lift" aria-label="WINZO Home">
          <div className="logo-container luxury-logo-container">
            <span className="logo-text luxury-logo-text luxury-text-gradient">WINZO</span>
            <span className="logo-tagline luxury-logo-tagline">Premium Sports Betting</span>
          </div>
        </Link>

        {/* Desktop Navigation - Streamlined and touch-optimized */}
        <div className="nav-desktop luxury-nav-desktop">
          <div className="nav-links luxury-nav-links" role="menubar">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link luxury-nav-link luxury-hover-lift ${isActive ? 'active' : ''} ${item.priority}`}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                  onMouseEnter={() => setActiveHover(item.path)}
                  onMouseLeave={() => setActiveHover(null)}
                >
                  <IconComponent 
                    size="sm" 
                    color={isActive ? 'secondary' : 'neutral'}
                    aria-hidden={true}
                    className={activeHover === item.path ? 'nav-icon-hover luxury-icon-hover' : ''}
                  />
                  <span className="nav-link-text luxury-nav-link-text">{item.label}</span>
                  {isActive && <div className="nav-link-indicator luxury-nav-link-indicator luxury-glow"></div>}
                </Link>
              );
            })}
          </div>

          {/* Enhanced User Actions */}
          <div className="nav-actions luxury-nav-actions">
            {user ? (
              <div className="user-section luxury-user-section">
                <div className="user-info luxury-user-info luxury-hover-lift" aria-label={`User: ${user.name}, Balance: ${formatBalance(user.balance)}`}>
                  <div className="user-avatar luxury-user-avatar">
                    <UserIcon size="sm" color="neutral" aria-hidden={true} />
                  </div>
                  <div className="user-details luxury-user-details">
                    <span className="user-name luxury-user-name">{user.name}</span>
                    <span className="user-balance luxury-user-balance luxury-text-gradient-gold">{formatBalance(user.balance)}</span>
                  </div>
                </div>
                
                <div className="user-actions luxury-user-actions">
                  <button 
                    className="luxury-btn luxury-btn-icon luxury-hover-glow" 
                    aria-label="Settings"
                    title="Settings"
                    onMouseEnter={() => setActiveHover('settings')}
                    onMouseLeave={() => setActiveHover(null)}
                  >
                    <SettingsIcon 
                      size="sm" 
                      color="neutral" 
                      aria-hidden={true}
                      className={activeHover === 'settings' ? 'btn-icon-hover luxury-icon-hover' : ''}
                    />
                  </button>
                  
                  <button 
                    className="luxury-btn luxury-btn-icon luxury-hover-glow" 
                    aria-label="Support"
                    title="Support"
                    onMouseEnter={() => setActiveHover('support')}
                    onMouseLeave={() => setActiveHover(null)}
                  >
                    <SupportIcon 
                      size="sm" 
                      color="neutral" 
                      aria-hidden={true}
                      className={activeHover === 'support' ? 'btn-icon-hover luxury-icon-hover' : ''}
                    />
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`luxury-btn luxury-btn-outline luxury-btn-ruby ${isLoggingOut ? 'btn-loading' : ''}`}
                    aria-label="Logout"
                    onMouseEnter={() => setActiveHover('logout')}
                    onMouseLeave={() => setActiveHover(null)}
                  >
                    {isLoggingOut ? (
                      <>
                        <span className="luxury-spinner luxury-loading-spin" aria-hidden="true"></span>
                        <span className="sr-only">Logging out...</span>
                      </>
                    ) : (
                      <>
                        <LogoutIcon 
                          size="sm" 
                          color="neutral" 
                          aria-hidden={true}
                          className={activeHover === 'logout' ? 'btn-icon-hover luxury-icon-hover' : ''}
                        />
                        <span>Logout</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-actions luxury-auth-actions">
                <Link to="/login" className="luxury-btn luxury-btn-secondary luxury-hover-lift">
                  Login
                </Link>
                <Link to="/register" className="luxury-btn luxury-btn-primary luxury-hover-lift">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`mobile-menu-toggle luxury-mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <span className="hamburger-line luxury-hamburger-line"></span>
          <span className="hamburger-line luxury-hamburger-line"></span>
          <span className="hamburger-line luxury-hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav luxury-mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-backdrop luxury-mobile-nav-backdrop" onClick={toggleMobileMenu}></div>
        <div className="mobile-nav-content luxury-mobile-nav-content luxury-slide-in-right">
          <div className="mobile-nav-header luxury-mobile-nav-header">
            <div className="mobile-user-info luxury-mobile-user-info">
              {user ? (
                <>
                  <div className="mobile-user-avatar luxury-mobile-user-avatar">
                    <UserIcon size="lg" color="neutral" aria-hidden={true} />
                  </div>
                  <div className="mobile-user-details luxury-mobile-user-details">
                    <span className="mobile-user-name luxury-mobile-user-name">{user.name}</span>
                    <span className="mobile-user-balance luxury-mobile-user-balance luxury-text-gradient-gold">{formatBalance(user.balance)}</span>
                  </div>
                </>
              ) : (
                <div className="mobile-auth-prompt luxury-mobile-auth-prompt">
                  <span className="mobile-auth-text luxury-mobile-auth-text">Welcome to WINZO</span>
                  <span className="mobile-auth-subtext luxury-mobile-auth-subtext">Sign in to start betting</span>
                </div>
              )}
            </div>
          </div>

          <div className="mobile-nav-links luxury-mobile-nav-links">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-link luxury-mobile-nav-link luxury-hover-lift ${isActive ? 'active' : ''}`}
                  onClick={toggleMobileMenu}
                >
                  <IconComponent 
                    size="sm" 
                    color={isActive ? 'secondary' : 'neutral'}
                    aria-hidden={true}
                  />
                  <span className="mobile-nav-link-text luxury-mobile-nav-link-text">{item.label}</span>
                  {isActive && <div className="mobile-nav-link-indicator luxury-mobile-nav-link-indicator luxury-glow"></div>}
                </Link>
              );
            })}
          </div>

          <div className="mobile-nav-actions luxury-mobile-nav-actions">
            {user ? (
              <>
                <button className="luxury-btn luxury-btn-secondary luxury-hover-lift">
                  <SettingsIcon size="sm" color="neutral" aria-hidden={true} />
                  <span>Settings</span>
                </button>
                <button className="luxury-btn luxury-btn-secondary luxury-hover-lift">
                  <SupportIcon size="sm" color="neutral" aria-hidden={true} />
                  <span>Support</span>
                </button>
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`luxury-btn luxury-btn-ruby luxury-hover-lift ${isLoggingOut ? 'btn-loading' : ''}`}
                >
                  {isLoggingOut ? (
                    <>
                      <span className="luxury-spinner luxury-loading-spin" aria-hidden="true"></span>
                      <span>Logging out...</span>
                    </>
                  ) : (
                    <>
                      <LogoutIcon size="sm" color="neutral" aria-hidden={true} />
                      <span>Logout</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="luxury-btn luxury-btn-secondary luxury-hover-lift" onClick={toggleMobileMenu}>
                  Login
                </Link>
                <Link to="/register" className="luxury-btn luxury-btn-primary luxury-hover-lift" onClick={toggleMobileMenu}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SimplifiedNavigation; 