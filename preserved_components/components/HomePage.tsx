import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <header className="hero-section">
        <h1 className="hero-title">WINZO</h1>
        <p className="hero-subtitle">Exclusive Platform</p>
        <div className="hero-actions">
          <Link to="/login" className="luxury-btn luxury-btn-primary">Login</Link>
          <Link to="/register" className="luxury-btn luxury-btn-secondary">Register</Link>
        </div>
      </header>
    </div>
  );
};

export default HomePage;
