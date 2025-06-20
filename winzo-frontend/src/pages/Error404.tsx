import React from 'react';
import { Link } from 'react-router-dom';

const Error404: React.FC = () => {
  return (
    <div className="error-404">
      <div className="error-404-container">
        <div className="error-animation">
          <div className="error-number">
            <span className="four">4</span>
            <span className="zero">0</span>
            <span className="four">4</span>
          </div>
        </div>
        
        <div className="error-content">
          <h1 className="error-title">Page Not Found</h1>
          <p className="error-description">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="error-actions">
            <Link to="/dashboard" className="error-button primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </Link>
            
            <Link to="/sports" className="error-button secondary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Browse Sports
            </Link>
            
            <button 
              className="error-button ghost"
              onClick={() => window.history.back()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
          </div>
        </div>
        
        <div className="helpful-links">
          <h3>Popular Pages</h3>
          <div className="links-grid">
            <Link to="/dashboard" className="helpful-link">
              <span className="link-icon">📊</span>
              <span className="link-text">Dashboard</span>
            </Link>
            <Link to="/sports" className="helpful-link">
              <span className="link-icon">⚽</span>
              <span className="link-text">Sports</span>
            </Link>
            <Link to="/history" className="helpful-link">
              <span className="link-icon">📈</span>
              <span className="link-text">History</span>
            </Link>
            <Link to="/account" className="helpful-link">
              <span className="link-icon">👤</span>
              <span className="link-text">Account</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error404; 