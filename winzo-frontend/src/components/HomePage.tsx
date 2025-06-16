import React from 'react';
import { Link } from 'react-router-dom';
import winzoLogo from '../assets/winzo-logo.png';
import './HomePage.css';

const HomePage: React.FC = () => {
  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none';
    const textLogo = document.createElement('div');
    textLogo.className = 'hero-logo-text';
    textLogo.textContent = 'WINZO';
    textLogo.style.cssText = `
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--luxury-gold);
      margin: 0 auto 1rem;
      text-align: center;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    `;
    e.currentTarget.parentNode?.insertBefore(textLogo, e.currentTarget);
  };

  return (
    <div className="home-page">
      <header className="hero-section">
        <img 
          src={winzoLogo} 
          alt="WINZO" 
          className="hero-logo" 
          onError={handleLogoError}
        />
        <h1 className="hero-title">WINZO</h1>
        <p className="hero-subtitle">Premium Sports Betting Platform</p>
        <div className="hero-actions">
          <Link to="/login" className="luxury-btn luxury-btn-primary">Login</Link>
          <Link to="/register" className="luxury-btn luxury-btn-secondary">Register</Link>
        </div>
      </header>

      <section className="platform-features">
        <div className="feature-grid">
          <div className="feature-item">
            <h3>Real-Time Betting</h3>
            <p>Live odds and instant updates</p>
          </div>
          <div className="feature-item">
            <h3>Secure Platform</h3>
            <p>Bank-level security and encryption</p>
          </div>
          <div className="feature-item">
            <h3>24/7 Support</h3>
            <p>Dedicated member assistance</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
