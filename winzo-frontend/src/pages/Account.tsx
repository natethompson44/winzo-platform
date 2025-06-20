import React, { useState } from 'react';
import PersonalInfo from '../components/account/PersonalInfo';
import BettingPreferences from '../components/account/BettingPreferences';
import ResponsibleGaming from '../components/account/ResponsibleGaming';
import SecuritySettings from '../components/account/SecuritySettings';
import TransactionHistory from '../components/account/TransactionHistory';
import '../styles/account.css';

interface TabItem {
  id: string;
  label: string;
  component: React.ComponentType;
  icon: string;
}

const Account: React.FC = () => {
  const [activeTab, setActiveTab] = useState('personal');

  const tabs: TabItem[] = [
    { id: 'personal', label: 'Personal Info', component: PersonalInfo, icon: '👤' },
    { id: 'betting', label: 'Betting Preferences', component: BettingPreferences, icon: '🎯' },
    { id: 'responsible', label: 'Responsible Gaming', component: ResponsibleGaming, icon: '🛡️' },
    { id: 'security', label: 'Security', component: SecuritySettings, icon: '🔒' },
    { id: 'transactions', label: 'Transaction History', component: TransactionHistory, icon: '📊' }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);
  const CurrentTabComponent = currentTab?.component || PersonalInfo;

  return (
    <div className="content-wrapper">
      {/* Account Header */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* User Avatar and Info */}
            <div className="flex items-center gap-4">
              <div className="user-avatar user-avatar-large">
                <div className="avatar-placeholder">
                  JD
                </div>
              </div>
              <div className="user-details">
                <h1 className="text-2xl font-bold text-primary">John Doe</h1>
                <p className="text-secondary">Premium Member</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-success-100 text-success-700 px-2 py-1 rounded">
                    ✓ Verified
                  </span>
                  <span className="text-xs text-tertiary">Member since Jan 2024</span>
                </div>
              </div>
            </div>

            {/* Account Balance */}
            <div className="flex-1 md:text-right">
              <div className="balance-display">
                <div className="balance-info">
                  <div className="balance-label">Available Balance</div>
                  <div className="balance-amount">$1,245.67</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-primary">
            <button className="btn btn-primary btn-sm">
              💰 Deposit
            </button>
            <button className="btn btn-secondary btn-sm">
              💸 Withdraw
            </button>
            <button className="btn btn-ghost btn-sm">
              📈 View Bets
            </button>
            <button className="btn btn-ghost btn-sm">
              🎁 Bonuses
            </button>
          </div>
        </div>
      </div>

      {/* Tabbed Interface */}
      <div className="card">
        {/* Tab Navigation */}
        <div className="border-b border-primary">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-interactive-primary text-interactive-primary'
                    : 'border-transparent text-secondary hover:text-primary hover:border-border-secondary'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="card-body">
          <CurrentTabComponent />
        </div>
      </div>
    </div>
  );
};

export default Account; 