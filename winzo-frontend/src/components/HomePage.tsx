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
      color: var(--winzo-gold);
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
        <h1 className="hero-title">Smart Sports Betting for Winners</h1>
        <p className="hero-subtitle">Advanced analytics, real-time odds, and secure betting in one platform.</p>
        <div className="hero-actions">
          <Link to="/login" className="winzo-btn winzo-btn-primary">Login</Link>
          <Link to="/register" className="winzo-btn winzo-btn-secondary">Register</Link>
        </div>
      </header>

      <section className="sports-preview">
        <h2 className="section-title">Live Sports Odds</h2>
        <p className="section-text">Bet on every play with real-time updates and fast payouts.</p>
        <Link to="/login" className="winzo-btn winzo-btn-success">View Odds</Link>
      </section>

      <section className="community-proof">
        <h2 className="section-title">Trusted by Champions</h2>
        <div className="proof-grid">
          <div className="proof-item">
            <span className="proof-value">1K+</span>
            <span className="proof-label">Active Members</span>
          </div>
          <div className="proof-item">
            <span className="proof-value">$500K+</span>
            <span className="proof-label">Winnings Paid</span>
          </div>
        </div>
      </section>

      <section className="win-showcase">
        <h2 className="section-title">Recent Success Stories</h2>
        <div className="win-feed">
          <div className="win-item">
            <div className="win-icon">🏆</div>
            <div className="win-content">
              <div className="win-user">Alex M.</div>
              <div className="win-details">Turned $10 into $150 on last night's game</div>
              <div className="win-time">2 hours ago</div>
            </div>
          </div>
          <div className="win-item">
            <div className="win-icon">⚡</div>
            <div className="win-content">
              <div className="win-user">Priya S.</div>
              <div className="win-details">Hit a 3-leg parlay for $2,000</div>
              <div className="win-time">5 hours ago</div>
            </div>
          </div>
          <div className="win-item">
            <div className="win-icon">💰</div>
            <div className="win-content">
              <div className="win-user">Chris R.</div>
              <div className="win-details">Cashed out a huge soccer win</div>
              <div className="win-time">1 day ago</div>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-signals">
        <h2 className="section-title">Why Choose WINZO</h2>
        <div className="trust-grid">
          <div className="trust-item">
            <div className="trust-icon">🔒</div>
            <h3>Secure & Licensed</h3>
            <p>Bank-level security with full regulatory compliance</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">⚡</div>
            <h3>Real-Time Odds</h3>
            <p>Live updates and instant bet placement</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">📊</div>
            <h3>Advanced Analytics</h3>
            <p>Data-driven insights for smarter betting</p>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-content">
          <p>&copy; 2024 WINZO Platform. Play responsibly.</p>
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
