import React, { useState } from 'react';
import ErrorHandler from './ErrorHandler';
import './DesignSystemTest.css';

/**
 * Design System Test Component
 * 
 * Simple test to verify that the Phase 1 design system is working properly
 */
const DesignSystemTest: React.FC = () => {
  const [showError, setShowError] = useState(false);
  const [testError, setTestError] = useState<Error | null>(null);

  const testErrorHandler = () => {
    const error = new Error('Test network error - Failed to fetch data');
    setTestError(error);
    setShowError(true);
  };

  const clearError = () => {
    setTestError(null);
    setShowError(false);
  };

  return (
    <div className="design-system-test">
      <div className="test-container">
        <h1 className="text-display">🎨 Design System Test</h1>
        <p className="text-body">Testing Phase 1 implementation</p>

        {/* Color Palette Test */}
        <section className="test-section">
          <h2 className="text-title">Color Palette</h2>
          <div className="color-grid">
            <div className="color-swatch primary">Primary</div>
            <div className="color-swatch secondary">Secondary</div>
            <div className="color-swatch success">Success</div>
            <div className="color-swatch warning">Warning</div>
            <div className="color-swatch danger">Danger</div>
          </div>
        </section>

        {/* Typography Test */}
        <section className="test-section">
          <h2 className="text-title">Typography Scale</h2>
          <div className="typography-test">
            <h1 className="text-display">Display Text (24px)</h1>
            <h2 className="text-title">Title Text (20px)</h2>
            <p className="text-body">Body Text (16px) - This is the main content text.</p>
            <p className="text-caption">Caption Text (14px) - Supplementary information.</p>
            <p className="text-small">Small Text (12px) - Legal disclaimers.</p>
          </div>
        </section>

        {/* Button Test */}
        <section className="test-section">
          <h2 className="text-title">Button System</h2>
          <div className="button-test">
            <button className="winzo-btn winzo-btn-primary">Primary Button</button>
            <button className="winzo-btn winzo-btn-secondary">Secondary Button</button>
            <button className="winzo-btn winzo-btn-success">Success Button</button>
            <button className="winzo-btn winzo-btn-warning">Warning Button</button>
            <button className="winzo-btn winzo-btn-danger">Danger Button</button>
          </div>
        </section>

        {/* Form Test */}
        <section className="test-section">
          <h2 className="text-title">Form Components</h2>
          <div className="form-test">
            <div className="form-group">
              <label className="form-label">Test Input</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Enter test data"
              />
              <div className="form-help">This is help text</div>
            </div>
          </div>
        </section>

        {/* Card Test */}
        <section className="test-section">
          <h2 className="text-title">Card Components</h2>
          <div className="card-test">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Test Card</h3>
              </div>
              <div className="card-content">
                <p className="text-body">This is a test card with content.</p>
              </div>
              <div className="card-footer">
                <button className="winzo-btn winzo-btn-primary winzo-btn-sm">Action</button>
              </div>
            </div>
          </div>
        </section>

        {/* Badge Test */}
        <section className="test-section">
          <h2 className="text-title">Badge System</h2>
          <div className="badge-test">
            <span className="badge badge-primary">Primary</span>
            <span className="badge badge-secondary">Secondary</span>
            <span className="badge badge-success">Success</span>
            <span className="badge badge-warning">Warning</span>
            <span className="badge badge-danger">Danger</span>
          </div>
        </section>

        {/* Alert Test */}
        <section className="test-section">
          <h2 className="text-title">Alert System</h2>
          <div className="alert-test">
            <div className="alert alert-success">
              <strong>Success:</strong> This is a success message.
            </div>
            <div className="alert alert-warning">
              <strong>Warning:</strong> This is a warning message.
            </div>
            <div className="alert alert-error">
              <strong>Error:</strong> This is an error message.
            </div>
          </div>
        </section>

        {/* Error Handler Test */}
        <section className="test-section">
          <h2 className="text-title">Error Handler</h2>
          <div className="error-test">
            <button className="winzo-btn winzo-btn-danger" onClick={testErrorHandler}>
              Test Error Handler
            </button>
            {showError && testError && (
              <ErrorHandler 
                error={testError} 
                onDismiss={clearError}
              />
            )}
          </div>
        </section>

        {/* Touch Target Test */}
        <section className="test-section">
          <h2 className="text-title">Touch Target Test</h2>
          <p className="text-caption">All interactive elements should be at least 44px in height/width</p>
          <div className="touch-test">
            <button className="winzo-btn winzo-btn-primary winzo-btn-sm">Small (36px)</button>
            <button className="winzo-btn winzo-btn-primary">Default (44px)</button>
            <button className="winzo-btn winzo-btn-primary winzo-btn-lg">Large (48px)</button>
          </div>
        </section>

        <div className="test-footer">
          <p className="text-caption">✅ Design System Test Complete</p>
        </div>
      </div>
    </div>
  );
};

export default DesignSystemTest; 