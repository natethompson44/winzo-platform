import React, { useState } from 'react';
import './ComponentLibrary.css';

/**
 * WINZO Component Library - Phase 1 Implementation
 * 
 * Demonstrates all standardized components from the design system
 * including buttons, forms, cards, badges, and alerts with proper
 * touch targets and accessibility features.
 */

// Button Components
export const ButtonExamples: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="component-section">
      <h2 className="text-title">Button Components</h2>
      <p className="text-body">All buttons meet 44px minimum touch target requirements</p>
      
      <div className="component-grid">
        <div className="component-group">
          <h3 className="text-lg">Button Variants</h3>
          <div className="button-group">
            <button className="btn btn-primary">Primary</button>
            <button className="btn btn-secondary">Secondary</button>
            <button className="btn btn-success">Success</button>
            <button className="btn btn-warning">Warning</button>
            <button className="btn btn-danger">Danger</button>
            <button className="btn btn-outline">Outline</button>
            <button className="btn btn-ghost">Ghost</button>
          </div>
        </div>

        <div className="component-group">
          <h3 className="text-lg">Button Sizes</h3>
          <div className="button-group">
            <button className="btn btn-primary btn-sm">Small</button>
            <button className="btn btn-primary">Default</button>
            <button className="btn btn-primary btn-lg">Large</button>
          </div>
        </div>

        <div className="component-group">
          <h3 className="text-lg">Button States</h3>
          <div className="button-group">
            <button className="btn btn-primary" onClick={handleClick}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Loading...
                </>
              ) : (
                'Click Me'
              )}
            </button>
            <button className="btn btn-primary" disabled>Disabled</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Form Components
export const FormExamples: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    amount: '',
    message: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="component-section">
      <h2 className="text-title">Form Components</h2>
      <p className="text-body">All form inputs meet 44px minimum touch target requirements</p>
      
      <div className="form-examples">
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="Enter your name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Bet Amount</label>
          <input
            type="number"
            className="form-input"
            placeholder="Enter amount"
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
          />
          <div className="form-help">Minimum bet: $1.00</div>
        </div>

        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea
            className="form-input"
            placeholder="Enter your message"
            rows={4}
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button className="btn btn-primary">Submit</button>
          <button className="btn btn-ghost">Cancel</button>
        </div>
      </div>
    </div>
  );
};

// Card Components
export const CardExamples: React.FC = () => {
  return (
    <div className="component-section">
      <h2 className="text-title">Card Components</h2>
      <p className="text-body">Consistent elevation, spacing, and content organization</p>
      
      <div className="card-grid">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Basic Card</h3>
            <p className="card-subtitle">Simple card with header and content</p>
          </div>
          <div className="card-content">
            <p className="text-body">This is a basic card component with consistent spacing and styling.</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Card with Actions</h3>
            <p className="card-subtitle">Card with footer actions</p>
          </div>
          <div className="card-content">
            <p className="text-body">This card includes action buttons in the footer.</p>
          </div>
          <div className="card-footer">
            <button className="btn btn-primary btn-sm">Action</button>
            <button className="btn btn-ghost btn-sm">Cancel</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Interactive Card</h3>
            <p className="card-subtitle">Hover to see effects</p>
          </div>
          <div className="card-content">
            <p className="text-body">This card has hover effects and interactive states.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Badge Components
export const BadgeExamples: React.FC = () => {
  return (
    <div className="component-section">
      <h2 className="text-title">Badge Components</h2>
      <p className="text-body">Status indicators and labels</p>
      
      <div className="badge-examples">
        <div className="badge-group">
          <h3 className="text-lg">Badge Variants</h3>
          <div className="badge-list">
            <span className="badge badge-primary">Primary</span>
            <span className="badge badge-secondary">Secondary</span>
            <span className="badge badge-success">Success</span>
            <span className="badge badge-warning">Warning</span>
            <span className="badge badge-danger">Danger</span>
          </div>
        </div>

        <div className="badge-group">
          <h3 className="text-lg">Usage Examples</h3>
          <div className="badge-usage">
            <div className="usage-item">
              <span className="text-body">Bet Status: </span>
              <span className="badge badge-success">Won</span>
            </div>
            <div className="usage-item">
              <span className="text-body">Payment: </span>
              <span className="badge badge-warning">Pending</span>
            </div>
            <div className="usage-item">
              <span className="text-body">Account: </span>
              <span className="badge badge-danger">Suspended</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Alert Components
export const AlertExamples: React.FC = () => {
  return (
    <div className="component-section">
      <h2 className="text-title">Alert Components</h2>
      <p className="text-body">User-friendly error messages and notifications</p>
      
      <div className="alert-examples">
        <div className="alert alert-info">
          <strong>Info:</strong> This is an informational message for users.
        </div>

        <div className="alert alert-success">
          <strong>Success:</strong> Your bet has been placed successfully!
        </div>

        <div className="alert alert-warning">
          <strong>Warning:</strong> Your account balance is running low.
        </div>

        <div className="alert alert-error">
          <strong>Error:</strong> There was a problem processing your payment.
        </div>
      </div>
    </div>
  );
};

// Typography Examples
export const TypographyExamples: React.FC = () => {
  return (
    <div className="component-section">
      <h2 className="text-title">Typography System</h2>
      <p className="text-body">Reduced from 11+ font sizes to 6 structured sizes</p>
      
      <div className="typography-examples">
        <div className="typography-group">
          <h3 className="text-lg">Text Sizes</h3>
          <div className="text-sizes">
            <p className="text-display">Display Text (24px)</p>
            <p className="text-title">Title Text (20px)</p>
            <p className="text-body">Body Text (16px)</p>
            <p className="text-caption">Caption Text (14px)</p>
            <p className="text-small">Small Text (12px)</p>
          </div>
        </div>

        <div className="typography-group">
          <h3 className="text-lg">Font Weights</h3>
          <div className="font-weights">
            <p className="text-body winzo-font-normal">Normal Weight (400)</p>
            <p className="text-body winzo-font-medium">Medium Weight (600)</p>
            <p className="text-body winzo-font-bold">Bold Weight (700)</p>
          </div>
        </div>

        <div className="typography-group">
          <h3 className="text-lg">Color Variants</h3>
          <div className="text-colors">
            <p className="text-body text-primary">Primary Text</p>
            <p className="text-body text-secondary">Secondary Text</p>
            <p className="text-body text-success">Success Text</p>
            <p className="text-body text-warning">Warning Text</p>
            <p className="text-body text-danger">Danger Text</p>
            <p className="text-body text-muted">Muted Text</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component Library
const ComponentLibrary: React.FC = () => {
  return (
    <div className="component-library">
      <div className="container">
        <header className="library-header">
          <h1 className="text-display">WINZO Component Library</h1>
          <p className="text-body">Phase 1 Design System Implementation</p>
        </header>

        <div className="library-content">
          <ButtonExamples />
          <FormExamples />
          <CardExamples />
          <BadgeExamples />
          <AlertExamples />
          <TypographyExamples />
        </div>
      </div>
    </div>
  );
};

export default ComponentLibrary; 