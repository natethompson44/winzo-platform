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
    textLogo.textContent = 'NEXUS';
    textLogo.style.cssText = `
      font-size: 2rem;
      font-weight: 700;
      color: var(--corporate-blue);
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
          alt="NEXUS" 
          className="hero-logo" 
          onError={handleLogoError}
        />
        <h1 className="hero-title">Advanced Business Intelligence Platform</h1>
        <p className="hero-subtitle">Enterprise-grade analytics, real-time insights, and secure data management in one comprehensive solution.</p>
        <div className="hero-actions">
          <Link to="/login" className="corporate-btn corporate-btn-primary">Access Platform</Link>
          <Link to="/register" className="corporate-btn corporate-btn-secondary">Request Access</Link>
        </div>
      </header>

      <section className="analytics-preview">
        <h2 className="section-title">Real-Time Data Analytics</h2>
        <p className="section-text">Monitor key performance indicators with advanced visualization and predictive modeling capabilities.</p>
        <Link to="/login" className="corporate-btn corporate-btn-success">View Dashboard</Link>
      </section>

      <section className="enterprise-proof">
        <h2 className="section-title">Trusted by Industry Leaders</h2>
        <div className="proof-grid">
          <div className="proof-item">
            <span className="proof-value">500+</span>
            <span className="proof-label">Enterprise Clients</span>
          </div>
          <div className="proof-item">
            <span className="proof-value">99.9%</span>
            <span className="proof-label">Uptime SLA</span>
          </div>
          <div className="proof-item">
            <span className="proof-value">24/7</span>
            <span className="proof-label">Support</span>
          </div>
        </div>
      </section>

      <section className="insights-showcase">
        <h2 className="section-title">Recent Performance Insights</h2>
        <div className="insights-feed">
          <div className="insight-item">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <div className="insight-user">Financial Services Division</div>
              <div className="insight-details">Achieved 15% efficiency improvement through predictive analytics</div>
              <div className="insight-time">2 hours ago</div>
            </div>
          </div>
          <div className="insight-item">
            <div className="insight-icon">⚡</div>
            <div className="insight-content">
              <div className="insight-user">Operations Team</div>
              <div className="insight-details">Reduced processing time by 40% using automated workflows</div>
              <div className="insight-time">5 hours ago</div>
            </div>
          </div>
          <div className="insight-item">
            <div className="insight-icon">🎯</div>
            <div className="insight-content">
              <div className="insight-user">Strategic Planning</div>
              <div className="insight-details">Identified $2M in cost optimization opportunities</div>
              <div className="insight-time">1 day ago</div>
            </div>
          </div>
        </div>
      </section>

      <section className="platform-features">
        <h2 className="section-title">Why Choose Our Platform</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🔒</div>
            <h3>Enterprise Security</h3>
            <p>Bank-level encryption with full regulatory compliance and audit trails</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">⚡</div>
            <h3>Real-Time Processing</h3>
            <p>Instant data updates and automated decision-making capabilities</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📊</div>
            <h3>Advanced Analytics</h3>
            <p>Machine learning algorithms for predictive insights and trend analysis</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🌐</div>
            <h3>Global Infrastructure</h3>
            <p>Multi-region deployment with 99.9% availability guarantee</p>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-content">
          <p>&copy; 2024 NEXUS Business Intelligence Platform. Enterprise solutions for forward-thinking organizations.</p>
          <div className="footer-links">
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/support">Enterprise Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
