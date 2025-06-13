import React, { useState } from 'react';
import { 
  DashboardIcon, 
  SportsIcon, 
  WalletIcon, 
  HistoryIcon, 
  UserIcon, 
  SettingsIcon,
  SupportIcon,
  SuccessIcon,
  WarningIcon,
  ErrorIcon,
  InfoIcon
} from './icons/IconLibrary';
import Button from './Button';
import ErrorHandler from './ErrorHandler';
import './DesignSystemDemo.css';

/**
 * WINZO Design System Demo Component
 * 
 * Comprehensive showcase of Phase 1 & 2 enhancements:
 * - Enhanced color palette with color psychology
 * - Professional typography system
 * - Touch-optimized component library
 * - Enhanced navigation system
 * - User-friendly error handling
 * - Responsive design implementation
 * - Content strategy improvements
 */
const DesignSystemDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('colors');
  const [showError, setShowError] = useState(false);

  const tabs = [
    { id: 'colors', label: 'Color System', icon: <InfoIcon size="sm" color="neutral" aria-hidden={true} /> },
    { id: 'typography', label: 'Typography', icon: <InfoIcon size="sm" color="neutral" aria-hidden={true} /> },
    { id: 'components', label: 'Components', icon: <InfoIcon size="sm" color="neutral" aria-hidden={true} /> },
    { id: 'navigation', label: 'Navigation', icon: <InfoIcon size="sm" color="neutral" aria-hidden={true} /> },
    { id: 'responsive', label: 'Responsive', icon: <InfoIcon size="sm" color="neutral" aria-hidden={true} /> },
    { id: 'content', label: 'Content Strategy', icon: <InfoIcon size="sm" color="neutral" aria-hidden={true} /> }
  ];

  const renderColorSystem = () => (
    <div className="demo-section">
      <div className="section-header">
        <h2 className="section-title">Enhanced Color Palette</h2>
        <p className="section-subtitle">Professional sports betting colors with color psychology</p>
      </div>

      <div className="content-high-priority">
        <h3 className="priority-title">Primary Colors - Trust & Stability</h3>
        <div className="color-grid">
          <div className="color-swatch primary-900">
            <span className="color-name">Primary 900</span>
            <span className="color-hex">#1a365d</span>
          </div>
          <div className="color-swatch primary-700">
            <span className="color-name">Primary 700</span>
            <span className="color-hex">#334e68</span>
          </div>
          <div className="color-swatch primary-500">
            <span className="color-name">Primary 500</span>
            <span className="color-hex">#627d98</span>
          </div>
          <div className="color-swatch primary-300">
            <span className="color-name">Primary 300</span>
            <span className="color-hex">#9fb3c8</span>
          </div>
          <div className="color-swatch primary-100">
            <span className="color-name">Primary 100</span>
            <span className="color-hex">#d9e2ec</span>
          </div>
        </div>
      </div>

      <div className="content-medium-priority">
        <h3 className="priority-title">Secondary Colors - Premium & Success</h3>
        <div className="color-grid">
          <div className="color-swatch secondary-900">
            <span className="color-name">Secondary 900</span>
            <span className="color-hex">#78350f</span>
          </div>
          <div className="color-swatch secondary-700">
            <span className="color-name">Secondary 700</span>
            <span className="color-hex">#b45309</span>
          </div>
          <div className="color-swatch secondary-500">
            <span className="color-name">Secondary 500</span>
            <span className="color-hex">#f59e0b</span>
          </div>
          <div className="color-swatch secondary-300">
            <span className="color-name">Secondary 300</span>
            <span className="color-hex">#fcd34d</span>
          </div>
          <div className="color-swatch secondary-100">
            <span className="color-name">Secondary 100</span>
            <span className="color-hex">#fef3c7</span>
          </div>
        </div>
      </div>

      <div className="content-low-priority">
        <h3 className="priority-title">Semantic Colors</h3>
        <div className="color-grid">
          <div className="color-swatch success-500">
            <span className="color-name">Success</span>
            <span className="color-hex">#38a169</span>
          </div>
          <div className="color-swatch warning-500">
            <span className="color-name">Warning</span>
            <span className="color-hex">#ed8936</span>
          </div>
          <div className="color-swatch danger-500">
            <span className="color-name">Danger</span>
            <span className="color-hex">#e53e3e</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTypography = () => (
    <div className="demo-section">
      <div className="section-header">
        <h2 className="section-title">Professional Typography System</h2>
        <p className="section-subtitle">Clear hierarchy with 6 font sizes for consistency</p>
      </div>

      <div className="content-primary">
        <div className="typography-showcase">
          <div className="text-display">Display Text - Hero Headings</div>
          <div className="text-title">Title Text - Major Headings</div>
          <div className="text-subtitle">Subtitle Text - Section Headers</div>
          <div className="text-body">Body Text - General Content</div>
          <div className="text-body-lg">Large Body Text - Enhanced Readability</div>
          <div className="text-caption">Caption Text - Supplementary Information</div>
          <div className="text-small">Small Text - Legal Disclaimers</div>
        </div>

        <div className="divider"></div>

        <div className="font-weights">
          <h3>Font Weights</h3>
          <p style={{ fontWeight: 400 }}>Normal (400) - Body text</p>
          <p style={{ fontWeight: 600 }}>Medium (600) - Emphasis & subheadings</p>
          <p style={{ fontWeight: 700 }}>Bold (700) - Headings</p>
        </div>
      </div>
    </div>
  );

  const renderComponents = () => (
    <div className="demo-section">
      <div className="section-header">
        <h2 className="section-title">Enhanced Component Library</h2>
        <p className="section-subtitle">Touch-optimized components with 44px minimum targets</p>
      </div>

      <div className="content-primary">
        <h3>Button System</h3>
        <div className="component-showcase">
          <div className="button-group">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="danger">Danger</Button>
          </div>
          
          <div className="button-group">
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" size="xl">Extra Large</Button>
          </div>
        </div>

        <div className="divider"></div>

        <h3>Form Components</h3>
        <div className="form-showcase">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input type="text" className="form-input" placeholder="Enter your name" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" placeholder="Enter your email" />
            <div className="form-help">We'll never share your email</div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-input" placeholder="Enter your message" rows={4}></textarea>
          </div>
        </div>

        <div className="divider"></div>

        <h3>Card Components</h3>
        <div className="card-showcase">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Basic Card</h4>
              <p className="card-subtitle">Simple card with header and content</p>
            </div>
            <div className="card-content">
              <p>This is a basic card component with consistent spacing and styling.</p>
            </div>
            <div className="card-footer">
              <Button variant="primary" size="sm">Action</Button>
              <Button variant="ghost" size="sm">Cancel</Button>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <h3>Alert Components</h3>
        <div className="alert-showcase">
          <div className="alert alert-info">
            <InfoIcon size="md" color="primary" aria-hidden={true} />
            <div>
              <strong>Info:</strong> This is an informational message for users.
            </div>
          </div>
          
          <div className="alert alert-success">
            <SuccessIcon size="md" color="success" aria-hidden={true} />
            <div>
              <strong>Success:</strong> Your bet has been placed successfully!
            </div>
          </div>
          
          <div className="alert alert-warning">
            <WarningIcon size="md" color="warning" aria-hidden={true} />
            <div>
              <strong>Warning:</strong> Your account balance is running low.
            </div>
          </div>
          
          <div className="alert alert-error">
            <ErrorIcon size="md" color="danger" aria-hidden={true} />
            <div>
              <strong>Error:</strong> Unable to process your request.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNavigation = () => (
    <div className="demo-section">
      <div className="section-header">
        <h2 className="section-title">Enhanced Navigation System</h2>
        <p className="section-subtitle">Touch-optimized with professional iconography</p>
      </div>

      <div className="content-primary">
        <h3>Desktop Navigation</h3>
        <div className="nav-demo">
          <nav className="enhanced-nav">
            <div className="nav-container">
              <div className="nav-logo">
                <div className="logo-container">
                  <span className="logo-text">WINZO</span>
                  <span className="logo-tagline">Premium Sports Betting</span>
                </div>
              </div>
              
              <div className="nav-desktop">
                <div className="nav-links">
                  <button type="button" className="nav-link active">
                    <DashboardIcon size="sm" color="secondary" aria-hidden={true} />
                    <span className="nav-link-text">Dashboard</span>
                  </button>
                  <button type="button" className="nav-link">
                    <SportsIcon size="sm" color="neutral" aria-hidden={true} />
                    <span className="nav-link-text">Sports</span>
                  </button>
                  <button type="button" className="nav-link">
                    <WalletIcon size="sm" color="neutral" aria-hidden={true} />
                    <span className="nav-link-text">Wallet</span>
                  </button>
                  <button type="button" className="nav-link">
                    <HistoryIcon size="sm" color="neutral" aria-hidden={true} />
                    <span className="nav-link-text">History</span>
                  </button>
                </div>
                
                <div className="user-section">
                  <div className="user-info">
                    <div className="user-avatar">
                      <UserIcon size="sm" color="neutral" aria-hidden={true} />
                    </div>
                    <div className="user-details">
                      <span className="user-name">John Doe</span>
                      <span className="user-balance">$1,250.00</span>
                    </div>
                  </div>
                  
                  <div className="user-actions">
                    <button className="btn btn-icon btn-ghost">
                      <SettingsIcon size="sm" color="neutral" aria-hidden={true} />
                    </button>
                    <button className="btn btn-icon btn-ghost">
                      <SupportIcon size="sm" color="neutral" aria-hidden={true} />
                    </button>
                    <Button variant="outline" size="sm">Logout</Button>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>

        <div className="divider"></div>

        <h3>Mobile Navigation</h3>
        <div className="mobile-nav-demo">
          <div className="nav-mobile">
            <div className="nav-items">
              <div className="nav-item">
                <DashboardIcon size="md" color="secondary" aria-hidden={true} />
                <span>Dashboard</span>
              </div>
              <div className="nav-item">
                <SportsIcon size="md" color="neutral" aria-hidden={true} />
                <span>Sports</span>
              </div>
              <div className="nav-item">
                <WalletIcon size="md" color="neutral" aria-hidden={true} />
                <span>Wallet</span>
              </div>
              <div className="nav-item">
                <HistoryIcon size="md" color="neutral" aria-hidden={true} />
                <span>History</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResponsive = () => (
    <div className="demo-section">
      <div className="section-header">
        <h2 className="section-title">Mobile-First Responsive Design</h2>
        <p className="section-subtitle">Optimal experience across all device sizes</p>
      </div>

      <div className="content-primary">
        <h3>Responsive Grid System</h3>
        <div className="grid-responsive grid-mobile-1 grid-tablet-2 grid-desktop-3">
          <div className="content-card">
            <div className="card-header">
              <h4 className="card-title">Mobile: 1 Column</h4>
              <p className="card-subtitle">Tablet: 2 Columns | Desktop: 3 Columns</p>
            </div>
            <div className="card-content">
              <p>This card demonstrates responsive grid behavior.</p>
            </div>
          </div>
          
          <div className="content-card">
            <div className="card-header">
              <h4 className="card-title">Touch Optimized</h4>
              <p className="card-subtitle">44px minimum touch targets</p>
            </div>
            <div className="card-content">
              <p>All interactive elements meet accessibility standards.</p>
            </div>
          </div>
          
          <div className="content-card">
            <div className="card-header">
              <h4 className="card-title">Responsive Typography</h4>
              <p className="card-subtitle">Scales appropriately for each device</p>
            </div>
            <div className="card-content">
              <p>Text sizes adjust for optimal readability.</p>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <h3>Responsive Utilities</h3>
        <div className="responsive-utilities">
          <div className="show-mobile hide-tablet hide-desktop">
            <div className="alert alert-info">
              <strong>Mobile View:</strong> This content is only visible on mobile devices.
            </div>
          </div>
          
          <div className="hide-mobile show-tablet hide-desktop">
            <div className="alert alert-warning">
              <strong>Tablet View:</strong> This content is only visible on tablet devices.
            </div>
          </div>
          
          <div className="hide-mobile hide-tablet show-desktop">
            <div className="alert alert-success">
              <strong>Desktop View:</strong> This content is only visible on desktop devices.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContentStrategy = () => (
    <div className="demo-section">
      <div className="section-header">
        <h2 className="section-title">Content Strategy & User-Friendly Language</h2>
        <p className="section-subtitle">Clear, accessible language for all users</p>
      </div>

      <div className="content-primary">
        <h3>User-Friendly Messaging</h3>
        <div className="message-showcase">
          <div className="message-success">
            <div className="message-title">Bet Placed Successfully!</div>
            <div className="message-text">
              Your bet of $25.00 on Manchester United has been confirmed. 
              You'll receive a notification when the match starts.
            </div>
          </div>
          
          <div className="message-info">
            <div className="message-title">New to Sports Betting?</div>
            <div className="message-text">
              We have helpful guides and tutorials to get you started. 
              Check out our beginner's section for tips and explanations.
            </div>
          </div>
          
          <div className="message-warning">
            <div className="message-title">Account Balance Low</div>
            <div className="message-text">
              Your current balance is $5.50. Consider adding funds to continue betting.
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <h3>Betting Terminology</h3>
        <div className="betting-explanation">
          <div className="explanation-title">Understanding Odds</div>
          <div className="explanation-text">
            <span className="betting-term">Odds</span> represent the probability of an outcome. 
            Higher odds mean lower probability but higher potential winnings. 
            <span className="betting-term">Decimal odds</span> show your total return including stake.
          </div>
        </div>

        <div className="divider"></div>

        <h3>Onboarding Content</h3>
        <div className="onboarding-showcase">
          <div className="onboarding-step">
            <div className="step-number">1</div>
            <div className="step-title">Create Your Account</div>
            <div className="step-description">
              Sign up with your email and create a secure password. 
              We'll verify your identity to keep your account safe.
            </div>
          </div>
          
          <div className="onboarding-step">
            <div className="step-number">2</div>
            <div className="step-title">Add Funds</div>
            <div className="step-description">
              Choose from multiple payment methods to add money to your account. 
              All transactions are secure and encrypted.
            </div>
          </div>
          
          <div className="onboarding-step">
            <div className="step-number">3</div>
            <div className="step-title">Start Betting</div>
            <div className="step-description">
              Browse available sports and events, select your bets, 
              and place them with just a few taps.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'colors':
        return renderColorSystem();
      case 'typography':
        return renderTypography();
      case 'components':
        return renderComponents();
      case 'navigation':
        return renderNavigation();
      case 'responsive':
        return renderResponsive();
      case 'content':
        return renderContentStrategy();
      default:
        return renderColorSystem();
    }
  };

  return (
    <div className="design-system-demo">
      <div className="demo-header">
        <h1 className="text-display">WINZO Design System</h1>
        <p className="text-body-lg">
          Comprehensive showcase of Phase 1 & 2 enhancements for professional sports betting platform
        </p>
      </div>

      <div className="demo-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`demo-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="demo-content">
        {renderTabContent()}
      </div>

      <div className="demo-actions">
        <Button 
          variant="primary" 
          onClick={() => setShowError(true)}
        >
          Test Error Handler
        </Button>
      </div>

      {showError && (
        <ErrorHandler
          error={{
            id: 'demo-error',
            type: 'error',
            title: 'Demo Error Message',
            message: 'This is a user-friendly error message that replaces technical jargon.',
            category: 'server',
            action: {
              label: 'Try Again',
              onClick: () => setShowError(false)
            },
            dismissible: true,
            autoDismiss: 5000
          }}
          onDismiss={() => setShowError(false)}
        />
      )}
    </div>
  );
};

export default DesignSystemDemo; 