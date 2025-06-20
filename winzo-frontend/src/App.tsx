import React from 'react';
import './styles/globals.css';

// Temporary App component for demonstration
const App: React.FC = () => {
  return (
    <div className="app">
      <div className="content">
        <h1>WINZO Platform</h1>
        <p>Fresh foundation ready for development!</p>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button className="btn btn-primary btn-md">Primary Button</button>
          <button className="btn btn-secondary btn-md">Secondary Button</button>
          <button className="btn btn-accent btn-md">Accent Button</button>
        </div>
        <div className="card" style={{ marginTop: '2rem', maxWidth: '400px' }}>
          <div className="card-header">
            <h3>Design System Test</h3>
          </div>
          <div className="card-body">
            <p>This card demonstrates the new design system foundation.</p>
            <div className="badge badge-success">Foundation Ready</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 