import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './TopNavigation.css';

interface User {
  username: string;
  balance: number;
}

interface TopNavigationProps {
  currentPage: 'sports' | 'live-sports' | 'account' | 'history';
  user?: User;
  onLogout: () => void;
}

const TopNavigation: React.FC<TopNavigationProps> = ({ currentPage, user, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    setShowUserMenu(false);
    navigate('/login');
  };

  const formatBalance = (balance: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(balance);
  };

  return (
    <nav className="top-navigation">
      <div className="top-navigation__container">
        {/* Logo */}
        <Link to="/sports" className="top-navigation__logo">
          <div className="logo">
            <span className="logo__text">WINZO</span>
            <span className="logo__tagline">SPORTS</span>
          </div>
        </Link>

        {/* Main Navigation Tabs */}
        <div className="top-navigation__tabs">
          <Link 
            to="/sports" 
            className={`nav-tab ${currentPage === 'sports' ? 'nav-tab--active' : ''}`}
          >
            <span className="nav-tab__icon">🏈</span>
            <span className="nav-tab__text">SPORTS</span>
          </Link>
          
          <Link 
            to="/live-sports" 
            className={`nav-tab ${currentPage === 'live-sports' ? 'nav-tab--active' : ''}`}
          >
            <span className="nav-tab__icon nav-tab__icon--live">📺</span>
            <span className="nav-tab__text">LIVE SPORTS</span>
            <span className="nav-tab__live-indicator">LIVE</span>
          </Link>
          
          <Link 
            to="/account" 
            className={`nav-tab ${currentPage === 'account' ? 'nav-tab--active' : ''}`}
          >
            <span className="nav-tab__icon">👤</span>
            <span className="nav-tab__text">ACCOUNT</span>
          </Link>
          
          <Link 
            to="/history" 
            className={`nav-tab ${currentPage === 'history' ? 'nav-tab--active' : ''}`}
          >
            <span className="nav-tab__icon">📊</span>
            <span className="nav-tab__text">HISTORY</span>
          </Link>
        </div>

        {/* Account Balance and User Menu */}
        {user && (
          <div className="top-navigation__user">
            {/* Account Balance Display (NOT wallet) */}
            <div className="account-balance">
              <span className="account-balance__label">Balance</span>
              <span className="account-balance__amount">{formatBalance(user.balance)}</span>
            </div>

            {/* User Menu */}
            <div className="user-menu">
              <button 
                className="user-menu__trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <span className="user-menu__username">{user.username}</span>
                <span className="user-menu__arrow">▼</span>
              </button>

              {showUserMenu && (
                <div className="user-menu__dropdown">
                  <Link 
                    to="/account" 
                    className="user-menu__item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Account Settings
                  </Link>
                  <Link 
                    to="/history" 
                    className="user-menu__item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Betting History
                  </Link>
                  <hr className="user-menu__divider" />
                  <button 
                    className="user-menu__item user-menu__item--logout"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default TopNavigation;