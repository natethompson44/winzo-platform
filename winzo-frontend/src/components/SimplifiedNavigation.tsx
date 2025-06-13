import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
 * Simplified Navigation Component
 * 
 * Streamlined navigation that prioritizes the most important user tasks:
 * - Viewing sports markets
 * - Placing bets
 * - Managing account funds
 * - Accessing betting history
 */
const SimplifiedNavigation: React.FC<SimplifiedNavigationProps> = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
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

  return (
    <nav className={`simplified-nav ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <span className="logo-text">WINZO</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-desktop">
          <div className="nav-links">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/sports" className="nav-link">Sports</Link>
            <Link to="/wallet" className="nav-link">Wallet</Link>
            <Link to="/history" className="nav-link">History</Link>
          </div>

          <div className="nav-actions">
            {user ? (
              <>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-balance">{formatBalance(user.balance)}</span>
                </div>
                <button onClick={onLogout} className="btn btn-outline btn-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-secondary btn-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-content">
          <div className="mobile-nav-links">
            <Link to="/dashboard" className="mobile-nav-link">
              <span className="nav-icon">📊</span>
              Dashboard
            </Link>
            <Link to="/sports" className="mobile-nav-link">
              <span className="nav-icon">⚽</span>
              Sports
            </Link>
            <Link to="/wallet" className="mobile-nav-link">
              <span className="nav-icon">💰</span>
              Wallet
            </Link>
            <Link to="/history" className="mobile-nav-link">
              <span className="nav-icon">📈</span>
              History
            </Link>
          </div>

          <div className="mobile-nav-actions">
            {user ? (
              <>
                <div className="mobile-user-info">
                  <div className="mobile-user-name">{user.name}</div>
                  <div className="mobile-user-balance">{formatBalance(user.balance)}</div>
                </div>
                <button onClick={onLogout} className="btn btn-outline btn-sm full-width">
                  Logout
                </button>
              </>
            ) : (
              <div className="mobile-auth-buttons">
                <Link to="/login" className="btn btn-primary btn-sm full-width">
                  Login
                </Link>
                <Link to="/register" className="btn btn-secondary btn-sm full-width">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={toggleMobileMenu}></div>
      )}
    </nav>
  );
};

export default SimplifiedNavigation; 