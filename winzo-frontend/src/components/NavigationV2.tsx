import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  DashboardIcon,
  SportsIcon,
  WalletIcon,
  HistoryIcon,
  BetSlipIcon
} from './icons/IconLibrary';
import '../styles/design-system-v2.css';

interface NavigationProps {
  user?: {
    username: string;
    balance: number;
  };
  betSlipCount?: number;
  onLogout?: () => void;
}

/**
 * WINZO Navigation v2.0 - Mobile-First Sports Betting
 * 
 * Simplified navigation focused on:
 * - Mobile-first design with betting priorities
 * - Clean visual hierarchy without luxury bloat
 * - Prominent bet slip and sports actions
 * - WCAG-compliant accessibility
 * - 8px grid spacing system
 * 
 * Inspired by FanDuel/DraftKings clean approach
 */
const Navigation: React.FC<NavigationProps> = ({ 
  user, 
  betSlipCount = 0,
  onLogout 
}) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items prioritized for betting
  const navigationItems = [
    { 
      path: '/sports', 
      label: 'Sports', 
      icon: SportsIcon,
      priority: 'high',
      'aria-label': 'Browse sports betting odds'
    },
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: DashboardIcon,
      priority: 'medium',
      'aria-label': 'View your dashboard'
    },
    { 
      path: '/wallet', 
      label: 'Wallet', 
      icon: WalletIcon,
      priority: 'high',
      'aria-label': 'Manage your wallet'
    },
    { 
      path: '/history', 
      label: 'History', 
      icon: HistoryIcon,
      priority: 'low',
      'aria-label': 'View betting history'
    }
  ];

  // Close mobile menu on escape
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

  // Don't show navigation on public pages
  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <>
      {/* Main Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm" role="navigation" aria-label="Main navigation">
        <div className="container flex items-center justify-between" style={{ height: '56px' }}>
          {/* Logo */}
          <Link 
            to="/dashboard" 
            className="flex items-center gap-3 text-xl font-bold text-primary"
            aria-label="WINZO Home"
          >
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="hidden tablet:block">WINZO</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden tablet:flex items-center gap-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = isActiveRoute(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-fast
                    ${isActive 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item['aria-label']}
                >
                  <IconComponent 
                    size="sm" 
                    color={isActive ? 'inverse' : 'neutral'}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Section & Actions */}
          <div className="flex items-center gap-3">
            {/* Bet Slip Button - Always visible */}
            <button
              className="relative p-2 rounded-md hover:bg-gray-100 transition-fast"
              aria-label={`Open bet slip (${betSlipCount} selections)`}
            >
              <BetSlipIcon size="md" color="neutral" />
              {betSlipCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {betSlipCount > 9 ? '9+' : betSlipCount}
                </span>
              )}
            </button>

            {/* User Info - Desktop */}
            {user && (
              <div className="hidden tablet:flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                  <div className="text-sm text-secondary font-semibold">${user.balance.toLocaleString()}</div>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="btn btn-tertiary btn-sm"
                    aria-label="Sign out"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="tablet:hidden p-2 rounded-md hover:bg-gray-100 transition-fast"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav"
            >
              <div className="w-6 h-6 flex flex-col justify-center gap-1">
                <span className={`h-0.5 bg-gray-700 transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`h-0.5 bg-gray-700 transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`h-0.5 bg-gray-700 transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-nav"
          className="tablet:hidden bg-white border-b shadow-lg"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="container py-4">
            {/* Primary Navigation - Sports First */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {navigationItems
                .filter(item => item.priority === 'high')
                .map((item) => {
                  const IconComponent = item.icon;
                  const isActive = isActiveRoute(item.path);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex flex-col items-center gap-2 p-4 rounded-lg text-center transition-fast
                        ${isActive 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={item['aria-label']}
                    >
                      <IconComponent 
                        size="lg" 
                        color={isActive ? 'inverse' : 'neutral'}
                      />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
            </div>

            {/* Secondary Navigation */}
            <div className="flex flex-col gap-2 mb-6">
              {navigationItems
                .filter(item => item.priority !== 'high')
                .map((item) => {
                  const IconComponent = item.icon;
                  const isActive = isActiveRoute(item.path);
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center gap-3 p-3 rounded-md transition-fast
                        ${isActive 
                          ? 'bg-primary text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={item['aria-label']}
                    >
                      <IconComponent 
                        size="sm" 
                        color={isActive ? 'inverse' : 'neutral'}
                      />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
            </div>

            {/* User Section - Mobile */}
            {user && (
              <div className="border-t pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.username}</div>
                    <div className="text-lg font-bold text-secondary">${user.balance.toLocaleString()}</div>
                  </div>
                </div>
                
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="btn btn-tertiary btn-full"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-40 tablet:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Navigation;