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
      color: var(--big-win-gold);
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
        <h1 className="hero-title">BIG WIN ENERGY</h1>
        <p className="hero-subtitle">Exclusive sports betting for champions only.</p>
        <div className="hero-actions">
          <Link to="/login" className="winzo-btn winzo-btn-primary">Login</Link>
          <Link to="/register" className="winzo-btn winzo-btn-secondary">Register</Link>
        </div>
      </header>

      <section className="sports-preview">
        <h2 className="section-title">⚡ Live Sports Odds</h2>
        <p className="section-text">Bet on every play with real-time updates and fast payouts.</p>
        <Link to="/login" className="winzo-btn winzo-btn-success">View Odds</Link>
      </section>

      <section className="community-proof">
        <h2 className="section-title">Winzo Community</h2>
        <div className="proof-grid">
          <div className="proof-item">
            <span className="proof-value">1K+</span>
            <span className="proof-label">Private Members</span>
          </div>
          <div className="proof-item">
            <span className="proof-value">$500K+</span>
            <span className="proof-label">Winnings Paid</span>
          </div>
        </div>
      </section>

      <section className="win-showcase">
        <h2 className="section-title">Recent Wins</h2>
        <ul className="win-feed">
          <li>🔥 Alex turned $10 into $150 on last night's game!</li>
          <li>🏆 Priya hit a 3-leg parlay for $2,000!</li>
          <li>💰 Chris just cashed out a huge soccer win!</li>
        </ul>
      </section>

      <footer className="home-footer">
        <p>&copy; 2024 WINZO Platform. Invite only. Play responsibly.</p>
      </footer>
    </div>
  );
};

export default HomePage;
