import React from 'react';
import { Link } from 'react-router-dom';
import winzoLogo from '../assets/winzo-logo.png';
import './HomePage.css';

const HomePage: React.FC = () => {
  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // Fallback to text if logo fails to load
    e.currentTarget.style.display = 'none';
    const textLogo = document.createElement('div');
    textLogo.className = 'hero-logo-text';
    textLogo.textContent = 'WINZO';
    textLogo.style.cssText = `
      font-size: 2rem;
      font-weight: 700;
      color: var(--luxury-gold);
      margin: 0 auto 1rem;
      text-align: center;
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
        <p className="hero-subtitle">Exclusive Platform</p>
        <div className="hero-actions">
          <Link to="/login" className="luxury-btn luxury-btn-primary">Access</Link>
          <Link to="/register" className="luxury-btn luxury-btn-secondary">Request Invite</Link>
        </div>
      </header>

      <section className="exclusive-preview">
        <h2 className="section-title">Members Only</h2>
        <p className="section-text">Premium access to exclusive opportunities and real-time insights.</p>
        <Link to="/login" className="luxury-btn luxury-btn-accent">Enter Platform</Link>
      </section>

      <section className="prestige-proof">
        <h2 className="section-title">Trusted by Elite Members</h2>
        <div className="proof-grid">
          <div className="proof-item">
            <span className="proof-value">10K+</span>
            <span className="proof-label">Members</span>
          </div>
          <div className="proof-item">
            <span className="proof-value">99.9%</span>
            <span className="proof-label">Uptime</span>
          </div>
          <div className="proof-item">
            <span className="proof-value">24/7</span>
            <span className="proof-label">Support</span>
          </div>
        </div>
      </section>

      <section className="exclusive-features">
        <h2 className="section-title">Why WINZO</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <h3>Secure Access</h3>
            <p>Bank-level security with exclusive member verification</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h3>Real-Time</h3>
            <p>Instant updates and live data streams</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">💎</div>
            <h3>Premium Experience</h3>
            <p>Exclusive features for discerning members</p>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-content">
          <p>&copy; 2024 WINZO. Exclusive platform for premium members.</p>
          <div className="footer-links">
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/support">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
