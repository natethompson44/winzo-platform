import React, { useState } from 'react';
import { AppLayout } from '../components/layout';

const LayoutDemo: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState('/dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    console.log('Navigating to:', route);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Searching for:', query);
  };

  const getPageContent = () => {
    switch (currentRoute) {
      case '/dashboard':
        return (
          <div>
            <h1 className="text-3xl font-bold text-primary mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="card">
                <div className="card-body">
                  <h3 className="text-xl font-semibold mb-4">Active Bets</h3>
                  <div className="metric-value text-2xl font-bold text-primary">5</div>
                  <p className="text-secondary mt-2">Currently placed bets</p>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <h3 className="text-xl font-semibold mb-4">Total Winnings</h3>
                  <div className="metric-value text-2xl font-bold text-success">$2,450.75</div>
                  <p className="text-secondary mt-2">This month</p>
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <h3 className="text-xl font-semibold mb-4">Win Rate</h3>
                  <div className="metric-value text-2xl font-bold text-info">68%</div>
                  <p className="text-secondary mt-2">Last 30 days</p>
                </div>
              </div>
            </div>
          </div>
        );
      case '/sports':
        return (
          <div>
            <h1 className="text-3xl font-bold text-primary mb-6">Sports</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold">NBA Games</h3>
                </div>
                <div className="card-body">
                  <p>Lakers vs Warriors - Tonight 8:00 PM</p>
                  <p>Celtics vs Heat - Tonight 10:30 PM</p>
                </div>
              </div>
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold">NFL Games</h3>
                </div>
                <div className="card-body">
                  <p>Patriots vs Bills - Sunday 1:00 PM</p>
                  <p>Cowboys vs Giants - Sunday 4:30 PM</p>
                </div>
              </div>
            </div>
          </div>
        );
      case '/live':
        return (
          <div>
            <h1 className="text-3xl font-bold text-primary mb-6">Live Sports</h1>
            <div className="live-indicator mb-4">
              <span className="pulse"></span>
              <span className="text-sm font-medium text-error">12 LIVE GAMES</span>
            </div>
            <div className="card">
              <div className="card-body">
                <p>Live betting interface would be implemented here with real-time odds updates.</p>
              </div>
            </div>
          </div>
        );
      case '/account':
        return (
          <div>
            <h1 className="text-3xl font-bold text-primary mb-6">My Account</h1>
            <div className="card">
              <div className="card-body">
                <p>User account management interface would be implemented here.</p>
              </div>
            </div>
          </div>
        );
      case '/history':
        return (
          <div>
            <h1 className="text-3xl font-bold text-primary mb-6">Betting History</h1>
            <div className="card">
              <div className="card-body">
                <p>Betting history and transaction records would be displayed here.</p>
              </div>
            </div>
          </div>
        );
      case '/settings':
        return (
          <div>
            <h1 className="text-3xl font-bold text-primary mb-6">Settings</h1>
            <div className="card">
              <div className="card-body">
                <p>User preferences and system settings would be configured here.</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div>
            <h1 className="text-3xl font-bold text-primary mb-6">Page Not Found</h1>
            <div className="card">
              <div className="card-body">
                <p>The requested page could not be found.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AppLayout
      currentRoute={currentRoute}
      onNavigate={handleNavigate}
      onSearch={handleSearch}
    >
      {getPageContent()}
      
      {/* Demo Info */}
      <div className="mt-8 card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Layout Demo Information</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Current Route:</h4>
              <code className="bg-secondary p-2 rounded text-sm">{currentRoute}</code>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Search Query:</h4>
              <code className="bg-secondary p-2 rounded text-sm">{searchQuery || 'None'}</code>
            </div>
          </div>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Features Demonstrated:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-secondary">
              <li>Responsive sidebar navigation (desktop)</li>
              <li>Collapsible sidebar functionality</li>
              <li>Mobile bottom navigation</li>
              <li>Header with search and user menu</li>
              <li>Mobile sidebar overlay</li>
              <li>Route-based active states</li>
              <li>Loading states and transitions</li>
              <li>Consistent spacing and typography</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LayoutDemo; 