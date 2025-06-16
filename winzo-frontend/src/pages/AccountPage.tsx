import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingStates';
import './AccountPage.css';

interface UserProfile {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  preferences: {
    defaultBetAmount: number;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    oddsFormat: 'american' | 'decimal' | 'fractional';
  };
  responsibleGaming: {
    dailyLimit: number;
    sessionLimit: number;
    selfExclusionEnabled: boolean;
    selfExclusionEnd?: Date;
  };
}

const AccountPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'responsible'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Mock profile data - replace with actual API call
  const mockProfile: UserProfile = {
    username: user?.username || 'user123',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1 (555) 123-4567',
    dateOfBirth: '1990-01-01',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345'
    },
    preferences: {
      defaultBetAmount: 25,
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      oddsFormat: 'american'
    },
    responsibleGaming: {
      dailyLimit: 500,
      sessionLimit: 200,
      selfExclusionEnabled: false
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProfile(mockProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async (updatedProfile: UserProfile) => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProfile(updatedProfile);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage('Failed to save settings. Please try again.');
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatBalance = (balance: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(balance);
  };

  if (isLoading) {
    return (
      <div className="account-page__loading">
        <LoadingSpinner size="large" message="Loading account information..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="account-page__error">
        <div className="error-message">
          <h2>Unable to load account</h2>
          <p>Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      {/* Account Header */}
      <div className="account-page__header">
        <div className="account-info">
          <h1>Account Settings</h1>
          <div className="account-balance-display">
            <span className="balance-label">Current Balance</span>
            <span className="balance-amount">{formatBalance(user?.wallet_balance || 0)}</span>
          </div>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`save-message ${saveMessage.includes('Failed') ? 'save-message--error' : 'save-message--success'}`}>
          {saveMessage}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="account-tabs">
        <button
          className={`account-tab ${activeTab === 'profile' ? 'account-tab--active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Personal Information
        </button>
        <button
          className={`account-tab ${activeTab === 'preferences' ? 'account-tab--active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Betting Preferences
        </button>
        <button
          className={`account-tab ${activeTab === 'responsible' ? 'account-tab--active' : ''}`}
          onClick={() => setActiveTab('responsible')}
        >
          Responsible Gaming
        </button>
      </div>

      {/* Tab Content */}
      <div className="account-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <h2>Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Username</label>
                <input type="text" value={profile.username} disabled />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={profile.email} disabled />
              </div>
              <div className="form-group">
                <label>First Name</label>
                <input type="text" value={profile.firstName} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" value={profile.lastName} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" value={profile.phone} />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" value={profile.dateOfBirth} disabled />
              </div>
            </div>
            
            <h3>Address</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Street Address</label>
                <input type="text" value={profile.address.street} />
              </div>
              <div className="form-group">
                <label>City</label>
                <input type="text" value={profile.address.city} />
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" value={profile.address.state} />
              </div>
              <div className="form-group">
                <label>ZIP Code</label>
                <input type="text" value={profile.address.zipCode} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="preferences-section">
            <h2>Betting Preferences</h2>
            
            <div className="form-group">
              <label>Default Bet Amount</label>
              <select value={profile.preferences.defaultBetAmount}>
                <option value={10}>$10</option>
                <option value={25}>$25</option>
                <option value={50}>$50</option>
                <option value={100}>$100</option>
              </select>
            </div>

            <div className="form-group">
              <label>Odds Format</label>
              <select value={profile.preferences.oddsFormat}>
                <option value="american">American (-110, +150)</option>
                <option value="decimal">Decimal (1.91, 2.50)</option>
                <option value="fractional">Fractional (10/11, 3/2)</option>
              </select>
            </div>

            <h3>Notifications</h3>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={profile.preferences.notifications.email} 
                />
                Email notifications
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={profile.preferences.notifications.sms} 
                />
                SMS notifications
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={profile.preferences.notifications.push} 
                />
                Push notifications
              </label>
            </div>
          </div>
        )}

        {activeTab === 'responsible' && (
          <div className="responsible-section">
            <h2>Responsible Gaming</h2>
            <p className="responsible-intro">
              Set limits to help manage your betting activity and promote responsible gaming.
            </p>

            <div className="form-group">
              <label>Daily Betting Limit</label>
              <input 
                type="number" 
                value={profile.responsibleGaming.dailyLimit}
                min="0"
                step="50"
              />
              <span className="form-help">Maximum amount you can bet per day</span>
            </div>

            <div className="form-group">
              <label>Session Limit</label>
              <input 
                type="number" 
                value={profile.responsibleGaming.sessionLimit}
                min="0"
                step="25"
              />
              <span className="form-help">Maximum amount per betting session</span>
            </div>

            <div className="responsible-actions">
              <button className="responsible-button">
                Set Cooling-Off Period
              </button>
              <button className="responsible-button responsible-button--danger">
                Self-Exclusion Options
              </button>
            </div>

            <div className="responsible-resources">
              <h3>Get Help</h3>
              <ul>
                <li><a href="#" target="_blank">National Problem Gambling Helpline</a></li>
                <li><a href="#" target="_blank">Gambling Addiction Resources</a></li>
                <li><a href="#" target="_blank">Responsible Gaming Tools</a></li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="account-actions">
        <button 
          className="save-button"
          onClick={() => handleSave(profile)}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default AccountPage;