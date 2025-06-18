import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  SportsIcon, 
  WalletIcon, 
  HistoryIcon
} from './icons/IconLibrary';
import './Navigation.css';

interface NavigationProps {
  user?: any;
  onLogout?: () => void;
}

/**
 * WINZO Navigation Component - Global Navigation Bar
 * 
 * Provides consistent navigation across all pages with WINZO branding,
 * breadcrumbs, and user controls. Ensures users never get stuck on pages.
 */
const Navigation: React.FC<NavigationProps> = ({ user, onLogout }) => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard';
      case '/sports': return 'Sports Betting';
      case '/wallet': return 'WINZO Wallet';
      case '/history': return 'Betting History';
      default: return 'WINZO';
    }
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', path: '/dashboard' }];
    
    paths.forEach((path, index) => {
      const fullPath = '/' + paths.slice(0, index + 1).join('/');
      let name = path.charAt(0).toUpperCase() + path.slice(1);
      
      switch (path) {
        case 'sports': name = 'Sports Betting'; break;
        case 'wallet': name = 'WINZO Wallet'; break;
        case 'history': name = 'Betting History'; break;
      }
      
      breadcrumbs.push({ name, path: fullPath });
    });
    
    return breadcrumbs;
  };

  // Don't show navigation on public pages
  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav className="winzo-navigation">
      <div className="nav-container">
        {/* Logo and Home Link */}
        <Link to="/dashboard" className="nav-logo">
          <span className="logo-text">WINZO</span>
          <span className="logo-tagline">Premium Sports Betting</span>
        </Link>

        {/* Breadcrumbs */}
        <div className="nav-breadcrumbs">
          {getBreadcrumbs().map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && <span className="breadcrumb-separator">→</span>}
              <Link 
                to={crumb.path} 
                className={`breadcrumb-link ${location.pathname === crumb.path ? 'active' : ''}`}
              >
                {crumb.name}
              </Link>
            </React.Fragment>
          ))}
        </div>

        {/* Page Title */}
        <div className="nav-title">
          <h1>{getPageTitle()}</h1>
        </div>

        {/* User Controls */}
        {user && (
          <div className="nav-user">
            <span className="user-greeting">
              Welcome, <strong>{user.username}</strong>
            </span>
            <button onClick={onLogout} className="logout-btn">
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Quick Navigation Menu */}
      <div className="nav-quick-menu">
        <Link 
          to="/dashboard" 
          className={`quick-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <HomeIcon className="nav-icon" />
          <span className="nav-text">Dashboard</span>
        </Link>
        <Link 
          to="/sports" 
          className={`quick-nav-item ${location.pathname === '/sports' ? 'active' : ''}`}
        >
          <SportsIcon className="nav-icon" />
          <span className="nav-text">Sports</span>
        </Link>
        <Link 
          to="/wallet" 
          className={`quick-nav-item ${location.pathname === '/wallet' ? 'active' : ''}`}
        >
          <WalletIcon className="nav-icon" />
          <span className="nav-text">Wallet</span>
        </Link>
        <Link 
          to="/history" 
          className={`quick-nav-item ${location.pathname === '/history' ? 'active' : ''}`}
        >
          <HistoryIcon className="nav-icon" />
          <span className="nav-text">History</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;

