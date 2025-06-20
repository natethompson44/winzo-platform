import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/LoadingStates';
import './AccountPage.css';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  avatar?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  preferences: {
    defaultBetAmount: number;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      betResults: boolean;
      promotions: boolean;
    };
    oddsFormat: 'american' | 'decimal' | 'fractional';
    language: string;
    timezone: string;
  };
  responsibleGaming: {
    dailyLimit: number;
    weeklyLimit: number;
    monthlyLimit: number;
    sessionLimit: number;
    sessionDuration: number;
    selfExclusionEnabled: boolean;
    selfExclusionEnd?: Date;
    coolingOffEnabled: boolean;
    coolingOffEnd?: Date;
  };
  security: {
    twoFactorEnabled: boolean;
    lastLogin: Date;
    loginHistory: Array<{
      id: string;
      timestamp: Date;
      location: string;
      device: string;
      ipAddress: string;
    }>;
  };
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
    identityVerified: boolean;
    addressVerified: boolean;
  };
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'payout';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  method?: string;
  timestamp: Date;
  description: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'crypto' | 'ewallet';
  name: string;
  details: string;
  isDefault: boolean;
  isVerified: boolean;
}

const mockProfile: UserProfile = {
  id: '1',
  username: 'user123',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1 (555) 123-4567',
  dateOfBirth: '1990-01-01',
  avatar: '',
  address: {
    street: '123 Main St',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210',
    country: 'United States'
  },
  preferences: {
    defaultBetAmount: 25,
    notifications: {
      email: true,
      sms: false,
      push: true,
      betResults: true,
      promotions: false
    },
    oddsFormat: 'american',
    language: 'en',
    timezone: 'America/Los_Angeles'
  },
  responsibleGaming: {
    dailyLimit: 500,
    weeklyLimit: 2000,
    monthlyLimit: 8000,
    sessionLimit: 200,
    sessionDuration: 120,
    selfExclusionEnabled: false,
    coolingOffEnabled: false
  },
  security: {
    twoFactorEnabled: false,
    lastLogin: new Date(Date.now() - 3600000),
    loginHistory: [
      {
        id: '1',
        timestamp: new Date(Date.now() - 3600000),
        location: 'Los Angeles, CA',
        device: 'Chrome on Windows',
        ipAddress: '192.168.1.1'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 86400000),
        location: 'Los Angeles, CA',
        device: 'Safari on iPhone',
        ipAddress: '192.168.1.1'
      }
    ]
  },
  verification: {
    emailVerified: true,
    phoneVerified: false,
    identityVerified: true,
    addressVerified: false
  }
};

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    amount: 100,
    status: 'completed',
    method: 'Visa ****1234',
    timestamp: new Date(Date.now() - 3600000),
    description: 'Account deposit'
  },
  {
    id: '2',
    type: 'bet',
    amount: -25,
    status: 'completed',
    timestamp: new Date(Date.now() - 7200000),
    description: 'Lakers vs Warriors - Lakers ML'
  },
  {
    id: '3',
    type: 'payout',
    amount: 45,
    status: 'completed',
    timestamp: new Date(Date.now() - 86400000),
    description: 'Winning bet payout'
  }
];

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    name: 'Visa',
    details: '****1234',
    isDefault: true,
    isVerified: true
  },
  {
    id: '2',
    type: 'bank',
    name: 'Bank of America',
    details: '****5678',
    isDefault: false,
    isVerified: true
  }
];

const AccountPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet' | 'security' | 'preferences' | 'responsible' | 'verification'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadAccountData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProfile(mockProfile);
        setTransactions(mockTransactions);
        setPaymentMethods(mockPaymentMethods);
      } catch (error) {
        console.error('Error loading account data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccountData();
  }, []);

  const handleSave = async (updatedProfile: UserProfile) => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
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

  const handleAvatarUpload = async (file: File) => {
    // Avatar upload simulation
    const reader = new FileReader();
    reader.onload = (e) => {
      if (profile && e.target?.result) {
        setProfile({
          ...profile,
          avatar: e.target.result as string
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const formatBalance = (balance: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(balance);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="account-loading">
        <LoadingSpinner size="large" message="Loading account information..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="account-error">
        <div className="error-content">
          <i className="bi bi-exclamation-triangle"></i>
          <h2>Unable to load account</h2>
          <p>Please try refreshing the page or contact support.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      {/* Account Header */}
      <div className="account-header">
        <div className="account-info">
          <div className="user-avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                <i className="bi bi-person-fill"></i>
              </div>
            )}
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
              style={{ display: 'none' }}
            />
            <button
              className="avatar-edit"
              onClick={() => document.getElementById('avatar-upload')?.click()}
            >
              <i className="bi bi-camera"></i>
            </button>
          </div>
          <div className="user-details">
            <h1>{profile.firstName} {profile.lastName}</h1>
            <p>@{profile.username}</p>
            <div className="verification-badges">
              {profile.verification.emailVerified && (
                <span className="badge verified">
                  <i className="bi bi-envelope-check"></i>
                  Email Verified
                </span>
              )}
              {profile.verification.identityVerified && (
                <span className="badge verified">
                  <i className="bi bi-shield-check"></i>
                  ID Verified
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="account-balance">
          <div className="balance-card">
            <span className="balance-label">Available Balance</span>
            <span className="balance-amount">{formatBalance(user?.wallet_balance || 0)}</span>
            <div className="balance-actions">
              <button className="btn btn-success">
                <i className="bi bi-plus-circle"></i>
                Deposit
              </button>
              <button className="btn btn-outline-primary">
                <i className="bi bi-arrow-up-circle"></i>
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`alert ${saveMessage.includes('Failed') ? 'alert-danger' : 'alert-success'}`}>
          <i className={`bi ${saveMessage.includes('Failed') ? 'bi-exclamation-triangle' : 'bi-check-circle'}`}></i>
          {saveMessage}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="account-nav">
        <button
          className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <i className="bi bi-person"></i>
          <span>Profile</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => setActiveTab('wallet')}
        >
          <i className="bi bi-wallet2"></i>
          <span>Wallet</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <i className="bi bi-shield-lock"></i>
          <span>Security</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <i className="bi bi-gear"></i>
          <span>Preferences</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'responsible' ? 'active' : ''}`}
          onClick={() => setActiveTab('responsible')}
        >
          <i className="bi bi-heart-pulse"></i>
          <span>Responsible Gaming</span>
        </button>
        <button
          className={`nav-tab ${activeTab === 'verification' ? 'active' : ''}`}
          onClick={() => setActiveTab('verification')}
        >
          <i className="bi bi-patch-check"></i>
          <span>Verification</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="account-content">
        {activeTab === 'profile' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Personal Information</h2>
              <p>Manage your personal details and contact information</p>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <input
                    type="email"
                    id="email"
                    value={profile.email}
                    disabled
                  />
                  <i className="bi bi-envelope"></i>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-with-icon">
                  <input
                    type="tel"
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  />
                  <i className="bi bi-telephone"></i>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={profile.username}
                  disabled
                />
              </div>
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  type="date"
                  id="dateOfBirth"
                  value={profile.dateOfBirth}
                  disabled
                />
              </div>
            </div>

            <div className="section-divider">
              <h3>Address Information</h3>
            </div>
            <div className="form-grid">
              <div className="form-group span-2">
                <label htmlFor="street">Street Address</label>
                <input
                  type="text"
                  id="street"
                  value={profile.address.street}
                  onChange={(e) => setProfile({
                    ...profile,
                    address: {...profile.address, street: e.target.value}
                  })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  value={profile.address.city}
                  onChange={(e) => setProfile({
                    ...profile,
                    address: {...profile.address, city: e.target.value}
                  })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="state">State/Province</label>
                <input
                  type="text"
                  id="state"
                  value={profile.address.state}
                  onChange={(e) => setProfile({
                    ...profile,
                    address: {...profile.address, state: e.target.value}
                  })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="zipCode">ZIP/Postal Code</label>
                <input
                  type="text"
                  id="zipCode"
                  value={profile.address.zipCode}
                  onChange={(e) => setProfile({
                    ...profile,
                    address: {...profile.address, zipCode: e.target.value}
                  })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <select
                  id="country"
                  value={profile.address.country}
                  onChange={(e) => setProfile({
                    ...profile,
                    address: {...profile.address, country: e.target.value}
                  })}
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="United Kingdom">United Kingdom</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Wallet & Payments</h2>
              <p>Manage your payment methods and transaction history</p>
            </div>

            <div className="wallet-stats">
              <div className="stat-card">
                <div className="stat-icon deposit">
                  <i className="bi bi-arrow-down-circle"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{formatBalance(2450)}</span>
                  <span className="stat-label">Total Deposited</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon withdrawal">
                  <i className="bi bi-arrow-up-circle"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{formatBalance(1200)}</span>
                  <span className="stat-label">Total Withdrawn</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon profit">
                  <i className="bi bi-graph-up"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{formatBalance(320)}</span>
                  <span className="stat-label">Net Profit</span>
                </div>
              </div>
            </div>

            <div className="section-divider">
              <h3>Payment Methods</h3>
              <button className="btn btn-primary">
                <i className="bi bi-plus-circle"></i>
                Add Payment Method
              </button>
            </div>
            <div className="payment-methods">
              {paymentMethods.map((method) => (
                <div key={method.id} className="payment-method-card">
                  <div className="method-icon">
                    <i className={`bi bi-${
                      method.type === 'card' ? 'credit-card' :
                      method.type === 'bank' ? 'bank' :
                      method.type === 'crypto' ? 'currency-bitcoin' :
                      'wallet2'
                    }`}></i>
                  </div>
                  <div className="method-info">
                    <h4>{method.name} {method.details}</h4>
                    <div className="method-badges">
                      {method.isDefault && <span className="badge default">Default</span>}
                      {method.isVerified && <span className="badge verified">Verified</span>}
                    </div>
                  </div>
                  <div className="method-actions">
                    <button className="btn btn-sm btn-outline-secondary">Edit</button>
                    <button className="btn btn-sm btn-outline-danger">Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-divider">
              <h3>Recent Transactions</h3>
              <button className="btn btn-outline-primary">View All</button>
            </div>
            <div className="transactions-table">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <span className={`transaction-type ${transaction.type}`}>
                          <i className={`bi bi-${
                            transaction.type === 'deposit' ? 'arrow-down-circle' :
                            transaction.type === 'withdrawal' ? 'arrow-up-circle' :
                            transaction.type === 'bet' ? 'dice-3' :
                            'trophy'
                          }`}></i>
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </span>
                      </td>
                      <td>{transaction.description}</td>
                      <td>
                        <span className={transaction.amount > 0 ? 'amount-positive' : 'amount-negative'}>
                          {formatBalance(Math.abs(transaction.amount))}
                        </span>
                      </td>
                      <td>
                        <span className={`status ${transaction.status}`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </td>
                      <td>{formatDate(transaction.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Security Settings</h2>
              <p>Protect your account with enhanced security features</p>
            </div>

            <div className="security-section">
              <div className="security-item">
                <div className="security-info">
                  <h4>Two-Factor Authentication</h4>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <div className="security-action">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={profile.security.twoFactorEnabled}
                      onChange={(e) => setProfile({
                        ...profile,
                        security: {...profile.security, twoFactorEnabled: e.target.checked}
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="security-item">
                <div className="security-info">
                  <h4>Change Password</h4>
                  <p>Update your account password regularly</p>
                </div>
                <div className="security-action">
                  <button className="btn btn-outline-primary">Change Password</button>
                </div>
              </div>

              <div className="security-item">
                <div className="security-info">
                  <h4>Login Notifications</h4>
                  <p>Get notified when someone logs into your account</p>
                </div>
                <div className="security-action">
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="section-divider">
              <h3>Recent Login Activity</h3>
            </div>
            <div className="login-history">
              {profile.security.loginHistory.map((login) => (
                <div key={login.id} className="login-item">
                  <div className="login-icon">
                    <i className="bi bi-geo-alt"></i>
                  </div>
                  <div className="login-info">
                    <h4>{login.location}</h4>
                    <p>{login.device} • {login.ipAddress}</p>
                    <span className="login-time">{formatDate(login.timestamp)}</span>
                  </div>
                  <div className="login-status">
                    <span className="badge success">Successful</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Betting Preferences</h2>
              <p>Customize your betting experience</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="defaultBetAmount">Default Bet Amount</label>
                <select
                  id="defaultBetAmount"
                  value={profile.preferences.defaultBetAmount}
                  onChange={(e) => setProfile({
                    ...profile,
                    preferences: {...profile.preferences, defaultBetAmount: Number(e.target.value)}
                  })}
                >
                  <option value={5}>$5</option>
                  <option value={10}>$10</option>
                  <option value={25}>$25</option>
                  <option value={50}>$50</option>
                  <option value={100}>$100</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="oddsFormat">Odds Format</label>
                <select
                  id="oddsFormat"
                  value={profile.preferences.oddsFormat}
                  onChange={(e) => setProfile({
                    ...profile,
                    preferences: {...profile.preferences, oddsFormat: e.target.value as any}
                  })}
                >
                  <option value="american">American (-110, +150)</option>
                  <option value="decimal">Decimal (1.91, 2.50)</option>
                  <option value="fractional">Fractional (10/11, 3/2)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="language">Language</label>
                <select
                  id="language"
                  value={profile.preferences.language}
                  onChange={(e) => setProfile({
                    ...profile,
                    preferences: {...profile.preferences, language: e.target.value}
                  })}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="timezone">Timezone</label>
                <select
                  id="timezone"
                  value={profile.preferences.timezone}
                  onChange={(e) => setProfile({
                    ...profile,
                    preferences: {...profile.preferences, timezone: e.target.value}
                  })}
                >
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                </select>
              </div>
            </div>

            <div className="section-divider">
              <h3>Notification Preferences</h3>
            </div>
            <div className="notification-settings">
              <div className="notification-item">
                <div className="notification-info">
                  <h4>Email Notifications</h4>
                  <p>Receive important updates via email</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={profile.preferences.notifications.email}
                    onChange={(e) => setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        notifications: {...profile.preferences.notifications, email: e.target.checked}
                      }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="notification-item">
                <div className="notification-info">
                  <h4>SMS Notifications</h4>
                  <p>Get text messages for urgent updates</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={profile.preferences.notifications.sms}
                    onChange={(e) => setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        notifications: {...profile.preferences.notifications, sms: e.target.checked}
                      }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="notification-item">
                <div className="notification-info">
                  <h4>Push Notifications</h4>
                  <p>Receive notifications in your browser</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={profile.preferences.notifications.push}
                    onChange={(e) => setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        notifications: {...profile.preferences.notifications, push: e.target.checked}
                      }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="notification-item">
                <div className="notification-info">
                  <h4>Bet Results</h4>
                  <p>Get notified when your bets are settled</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={profile.preferences.notifications.betResults}
                    onChange={(e) => setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        notifications: {...profile.preferences.notifications, betResults: e.target.checked}
                      }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="notification-item">
                <div className="notification-info">
                  <h4>Promotions</h4>
                  <p>Receive updates about special offers</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={profile.preferences.notifications.promotions}
                    onChange={(e) => setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        notifications: {...profile.preferences.notifications, promotions: e.target.checked}
                      }
                    })}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'responsible' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Responsible Gaming</h2>
              <p>Manage your betting limits and gaming controls</p>
            </div>

            <div className="responsible-notice">
              <i className="bi bi-info-circle"></i>
              <div>
                <h4>Gaming Responsibly</h4>
                <p>Set limits to help maintain control of your betting activity. These tools are designed to promote healthy gaming habits.</p>
              </div>
            </div>

            <div className="limits-grid">
              <div className="limit-card">
                <h4>Daily Limit</h4>
                <div className="limit-input">
                  <span className="currency">$</span>
                  <input
                    type="number"
                    value={profile.responsibleGaming.dailyLimit}
                    onChange={(e) => setProfile({
                      ...profile,
                      responsibleGaming: {...profile.responsibleGaming, dailyLimit: Number(e.target.value)}
                    })}
                  />
                </div>
                <p>Maximum you can bet in 24 hours</p>
              </div>
              <div className="limit-card">
                <h4>Weekly Limit</h4>
                <div className="limit-input">
                  <span className="currency">$</span>
                  <input
                    type="number"
                    value={profile.responsibleGaming.weeklyLimit}
                    onChange={(e) => setProfile({
                      ...profile,
                      responsibleGaming: {...profile.responsibleGaming, weeklyLimit: Number(e.target.value)}
                    })}
                  />
                </div>
                <p>Maximum you can bet in 7 days</p>
              </div>
              <div className="limit-card">
                <h4>Monthly Limit</h4>
                <div className="limit-input">
                  <span className="currency">$</span>
                  <input
                    type="number"
                    value={profile.responsibleGaming.monthlyLimit}
                    onChange={(e) => setProfile({
                      ...profile,
                      responsibleGaming: {...profile.responsibleGaming, monthlyLimit: Number(e.target.value)}
                    })}
                  />
                </div>
                <p>Maximum you can bet in 30 days</p>
              </div>
              <div className="limit-card">
                <h4>Session Duration</h4>
                <div className="limit-input">
                  <input
                    type="number"
                    value={profile.responsibleGaming.sessionDuration}
                    onChange={(e) => setProfile({
                      ...profile,
                      responsibleGaming: {...profile.responsibleGaming, sessionDuration: Number(e.target.value)}
                    })}
                  />
                  <span className="unit">min</span>
                </div>
                <p>Maximum session length</p>
              </div>
            </div>

            <div className="section-divider">
              <h3>Additional Controls</h3>
            </div>
            <div className="responsible-actions">
              <div className="action-card">
                <div className="action-info">
                  <h4>Cooling-Off Period</h4>
                  <p>Take a short break from betting (24 hours to 30 days)</p>
                </div>
                <button className="btn btn-warning">
                  <i className="bi bi-pause-circle"></i>
                  Set Cooling-Off
                </button>
              </div>
              <div className="action-card">
                <div className="action-info">
                  <h4>Self-Exclusion</h4>
                  <p>Temporarily or permanently exclude yourself from betting</p>
                </div>
                <button className="btn btn-danger">
                  <i className="bi bi-shield-x"></i>
                  Self-Exclusion Options
                </button>
              </div>
            </div>

            <div className="section-divider">
              <h3>Get Help</h3>
            </div>
            <div className="help-resources">
              <div className="resource-card">
                <i className="bi bi-telephone"></i>
                <h4>National Problem Gambling Helpline</h4>
                <p>1-800-522-4700</p>
                <button className="btn btn-outline-primary">Call Now</button>
              </div>
              <div className="resource-card">
                <i className="bi bi-globe"></i>
                <h4>Gambling Addiction Resources</h4>
                <p>Professional support and counseling</p>
                <button className="btn btn-outline-primary">Learn More</button>
              </div>
              <div className="resource-card">
                <i className="bi bi-heart-pulse"></i>
                <h4>Responsible Gaming Tools</h4>
                <p>Additional tools and assessments</p>
                <button className="btn btn-outline-primary">Explore Tools</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>Account Verification</h2>
              <p>Verify your account to unlock all features and ensure security</p>
            </div>

            <div className="verification-steps">
              <div className={`verification-step ${profile.verification.emailVerified ? 'completed' : 'pending'}`}>
                <div className="step-icon">
                  <i className={`bi ${profile.verification.emailVerified ? 'bi-check-circle-fill' : 'bi-envelope'}`}></i>
                </div>
                <div className="step-info">
                  <h4>Email Verification</h4>
                  <p>Confirm your email address to secure your account</p>
                  {profile.verification.emailVerified ? (
                    <span className="status verified">Verified</span>
                  ) : (
                    <button className="btn btn-primary btn-sm">Verify Email</button>
                  )}
                </div>
              </div>

              <div className={`verification-step ${profile.verification.phoneVerified ? 'completed' : 'pending'}`}>
                <div className="step-icon">
                  <i className={`bi ${profile.verification.phoneVerified ? 'bi-check-circle-fill' : 'bi-telephone'}`}></i>
                </div>
                <div className="step-info">
                  <h4>Phone Verification</h4>
                  <p>Verify your phone number for additional security</p>
                  {profile.verification.phoneVerified ? (
                    <span className="status verified">Verified</span>
                  ) : (
                    <button className="btn btn-primary btn-sm">Verify Phone</button>
                  )}
                </div>
              </div>

              <div className={`verification-step ${profile.verification.identityVerified ? 'completed' : 'pending'}`}>
                <div className="step-icon">
                  <i className={`bi ${profile.verification.identityVerified ? 'bi-check-circle-fill' : 'bi-person-badge'}`}></i>
                </div>
                <div className="step-info">
                  <h4>Identity Verification</h4>
                  <p>Upload a government-issued ID to verify your identity</p>
                  {profile.verification.identityVerified ? (
                    <span className="status verified">Verified</span>
                  ) : (
                    <button className="btn btn-primary btn-sm">Upload ID</button>
                  )}
                </div>
              </div>

              <div className={`verification-step ${profile.verification.addressVerified ? 'completed' : 'pending'}`}>
                <div className="step-icon">
                  <i className={`bi ${profile.verification.addressVerified ? 'bi-check-circle-fill' : 'bi-house'}`}></i>
                </div>
                <div className="step-info">
                  <h4>Address Verification</h4>
                  <p>Confirm your address with a utility bill or bank statement</p>
                  {profile.verification.addressVerified ? (
                    <span className="status verified">Verified</span>
                  ) : (
                    <button className="btn btn-primary btn-sm">Upload Document</button>
                  )}
                </div>
              </div>
            </div>

            <div className="verification-benefits">
              <h3>Verification Benefits</h3>
              <div className="benefits-grid">
                <div className="benefit-item">
                  <i className="bi bi-shield-check"></i>
                  <h4>Enhanced Security</h4>
                  <p>Protect your account from unauthorized access</p>
                </div>
                <div className="benefit-item">
                  <i className="bi bi-arrow-up-circle"></i>
                  <h4>Higher Withdrawal Limits</h4>
                  <p>Access to increased daily and monthly limits</p>
                </div>
                <div className="benefit-item">
                  <i className="bi bi-lightning"></i>
                  <h4>Faster Transactions</h4>
                  <p>Quicker processing of deposits and withdrawals</p>
                </div>
                <div className="benefit-item">
                  <i className="bi bi-star"></i>
                  <h4>Premium Features</h4>
                  <p>Unlock exclusive betting options and promotions</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="account-footer">
        <button
          className="btn btn-primary save-btn"
          onClick={() => handleSave(profile)}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              Saving...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle"></i>
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AccountPage;