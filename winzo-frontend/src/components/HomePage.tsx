import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <header className="hero-section">
        <h1 className="hero-title">WINZO</h1>
        <p className="hero-subtitle">Premium Sports Betting Platform</p>
        <div className="hero-actions">
          <Link to="/login" className="luxury-btn luxury-btn-primary">Login</Link>
          <Link to="/register" className="luxury-btn luxury-btn-secondary">Register</Link>
        </div>
      </header>

      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>WINZO</h3>
            <p>Premium Sports Betting Experience</p>
          </div>
          <div className="footer-section">
            <p>&copy; {new Date().getFullYear()} WINZO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
