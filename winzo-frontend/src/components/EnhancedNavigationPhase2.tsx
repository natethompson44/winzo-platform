import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardIcon,
  WalletIcon,
  HistoryIcon,
  SportsIcon,
  QuickBetIcon,
  DepositIcon,
  SettingsIcon,
  SupportIcon,
  LogoutIcon,
  IconWrapper
} from './icons/IconLibrary';
import './EnhancedNavigationPhase2.css';

interface EnhancedNavigationPhase2Props {
  user?: {
    name: string;
    balance: number;
    isFirstTime?: boolean;
  };
  onLogout?: () => void;
}

/**
 * Enhanced Navigation Component - Phase 2
 * 
 * Implements professional iconography, visual hierarchy, brand consistency,
 * and user-friendly content strategy for improved user experience.
 */
const EnhancedNavigationPhase2: React.FC<EnhancedNavigationPhase2Props> = ({
  user,
  onLogout
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Primary navigation items with professional icons
  const primaryNavItems = [
    {
      path: '/sports',
      label: 'Sports',
      icon: SportsIcon,
      description: 'Browse and bet on sports events',
      priority: 'primary'
    },
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: DashboardIcon,
      description: 'View your betting overview and statistics',
      priority: 'primary'
    },
    {
      path: '/wallet',
      label: 'Wallet',
      icon: WalletIcon,
      description: 'Manage your funds and transactions',
      priority: 'primary'
    },
    {
      path: '/history',
      label: 'History',
      icon: HistoryIcon,
      description: 'View your betting history and results',
      priority: 'secondary'
    }
  ];

  // Quick actions with visual hierarchy
  const quickActions = [
    {
      label: 'Quick Bet',
      icon: QuickBetIcon,
      action: () => navigate('/sports'),
      description: 'Place a bet quickly',
      priority: 'primary',
      color: 'success'
    },
    {
      label: 'Deposit',
      icon: DepositIcon,
      action: () => navigate('/wallet'),
      description: 'Add funds to your wallet',
      priority: 'secondary',
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
      <nav className="enhanced-nav-phase2 desktop-only brand-header">
        <div className="nav-container">
          {/* Brand Logo */}
          <Link to="/dashboard" className="brand-logo brand-logo-header">
            <span className="logo-text">WINZO</span>
          </Link>

          {/* Primary Navigation with Visual Hierarchy */}
          <div className="nav-primary">
            {primaryNavItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''} content-${item.priority}`}
                  title={item.description}
                >
                  <IconWrapper>
                    <IconComponent 
                      size="md" 
                      color={isActive(item.path) ? 'primary' : 'neutral'}
                      aria-label={item.label}
                    />
                  </IconWrapper>
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Actions with Priority Hierarchy */}
          <div className="nav-actions">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.label}
                  className={`action-${action.priority} btn-${action.color}`}
                  onClick={action.action}
                  title={action.description}
                >
                  <IconWrapper>
                    <IconComponent 
                      size="sm" 
                      color="inverse"
                      aria-label={action.label}
                    />
                  </IconWrapper>
                  <span className="action-label">{action.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Menu with Brand Consistency */}
          <div className="nav-user" ref={userMenuRef}>
            {user ? (
              <>
                <button
                  className="user-menu-toggle"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="User menu"
                >
                  <div className="user-avatar">
                    <span className="user-avatar-text">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-balance brand-success-text">${user.balance.toFixed(2)}</span>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="user-menu">
                    <div className="user-menu-header">
                      <span className="user-menu-name brand-voice-subheading">{user.name}</span>
                      <span className="user-menu-balance brand-success-text">${user.balance.toFixed(2)}</span>
                    </div>
                    
                    <div className="user-menu-actions">
                      <Link to="/profile" className="user-menu-item">
                        <IconWrapper>
                          <SettingsIcon size="sm" color="neutral" aria-label="Settings" />
                        </IconWrapper>
                        <span>Settings</span>
                      </Link>
                      <Link to="/support" className="user-menu-item">
                        <IconWrapper>
                          <SupportIcon size="sm" color="neutral" aria-label="Support" />
                        </IconWrapper>
                        <span>Support</span>
                      </Link>
                      <button 
                        className="user-menu-item logout"
                        onClick={onLogout}
                      >
                        <IconWrapper>
                          <LogoutIcon size="sm" color="danger" aria-label="Logout" />
                        </IconWrapper>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="action-primary">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="enhanced-nav-phase2 mobile-only">
        <div className="mobile-nav-container">
          {/* Mobile Header */}
          <div className="mobile-nav-header">
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              <span className="menu-icon"></span>
            </button>

            <Link to="/dashboard" className="brand-logo brand-logo-sm">
              <span className="logo-text">WINZO</span>
            </Link>

            {user && (
              <div className="mobile-user-info">
                <span className="mobile-balance brand-success-text">${user.balance.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="mobile-menu" ref={mobileMenuRef}>
              {/* First-time User Welcome */}
              {user?.isFirstTime && (
                <div className="content-first-time">
                  <div className="first-time-icon">🎉</div>
                  <h2>Welcome to WINZO!</h2>
                  <p>Ready to start betting? Let's get you set up with your first bet.</p>
                  <button 
                    className="action-primary"
                    onClick={() => {
                      navigate('/sports');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <IconWrapper>
                      <QuickBetIcon size="sm" color="inverse" aria-label="Quick Bet" />
                    </IconWrapper>
                    Place Your First Bet
                  </button>
                </div>
              )}

              {/* Navigation Items */}
              <div className="mobile-nav-items">
                {primaryNavItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <IconWrapper>
                        <IconComponent 
                          size="lg" 
                          color={isActive(item.path) ? 'primary' : 'neutral'}
                          aria-label={item.label}
                        />
                      </IconWrapper>
                      <span className="mobile-nav-label">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Quick Actions */}
              <div className="mobile-quick-actions">
                {quickActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={action.label}
                      className={`mobile-action-btn action-${action.priority}`}
                      onClick={() => {
                        action.action();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <IconWrapper>
                        <IconComponent 
                          size="md" 
                          color="inverse"
                          aria-label={action.label}
                        />
                      </IconWrapper>
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Help Section */}
              <div className="mobile-help-section">
                <button
                  className="help-toggle"
                  onClick={() => setShowHelp(!showHelp)}
                >
                  <span>Need Help?</span>
                  <span className="help-icon">{showHelp ? '▼' : '▶'}</span>
                </button>
                
                {showHelp && (
                  <div className="content-help">
                    <div className="help-content">
                      <h3>Getting Started</h3>
                      <p>New to sports betting? We're here to help you get started safely and confidently.</p>
                      <div className="help-actions">
                        <Link to="/tutorial" className="action-tertiary">
                          View Tutorial
                        </Link>
                        <Link to="/support" className="action-tertiary">
                          Contact Support
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default EnhancedNavigationPhase2;
