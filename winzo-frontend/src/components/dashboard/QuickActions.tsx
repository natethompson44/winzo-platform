import React from 'react';

interface QuickActionsProps {
  onQuickBet?: () => void;
  onViewLiveGames?: () => void;
  onDeposit?: () => void;
  onViewHistory?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onQuickBet,
  onViewLiveGames,
  onDeposit,
  onViewHistory
}) => {
  const handleQuickBet = () => {
    if (onQuickBet) {
      onQuickBet();
    } else {
      // Default action - navigate to sports page
      console.log('Navigate to quick bet');
    }
  };

  const handleViewLiveGames = () => {
    if (onViewLiveGames) {
      onViewLiveGames();
    } else {
      // Default action - navigate to live games
      console.log('Navigate to live games');
    }
  };

  const handleDeposit = () => {
    if (onDeposit) {
      onDeposit();
    } else {
      // Default action - open deposit modal
      console.log('Open deposit modal');
    }
  };

  const handleViewHistory = () => {
    if (onViewHistory) {
      onViewHistory();
    } else {
      // Default action - navigate to bet history
      console.log('Navigate to bet history');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-xl font-semibold text-primary">Quick Actions</h3>
        <p className="text-sm text-secondary mt-1">Get started with these popular actions</p>
      </div>
      <div className="card-body">
        <div className="quick-actions-grid">
          
          {/* Primary Action - Place Quick Bet */}
          <div className="quick-action-item primary">
            <div className="quick-action-content">
              <div className="quick-action-icon">
                <span className="action-icon">🎯</span>
              </div>
              <div className="quick-action-info">
                <h4 className="quick-action-title">Place Quick Bet</h4>
                <p className="quick-action-description">
                  Jump straight into betting on today's games
                </p>
                <button 
                  className="btn btn-accent btn-md mt-3"
                  onClick={handleQuickBet}
                >
                  Start Betting
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Actions Grid */}
          <div className="quick-actions-secondary">
            
            {/* View Live Games */}
            <div className="quick-action-item secondary">
              <div className="quick-action-content">
                <div className="quick-action-icon-small">
                  <span className="action-icon-small">🔴</span>
                </div>
                <div className="quick-action-info-compact">
                  <h5 className="quick-action-title-small">Live Games</h5>
                  <p className="quick-action-description-small">
                    Watch and bet on live events
                  </p>
                </div>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleViewLiveGames}
                >
                  View Live
                </button>
              </div>
            </div>

            {/* Deposit Funds */}
            <div className="quick-action-item secondary">
              <div className="quick-action-content">
                <div className="quick-action-icon-small">
                  <span className="action-icon-small">💳</span>
                </div>
                <div className="quick-action-info-compact">
                  <h5 className="quick-action-title-small">Add Funds</h5>
                  <p className="quick-action-description-small">
                    Deposit money to your account
                  </p>
                </div>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={handleDeposit}
                >
                  Deposit
                </button>
              </div>
            </div>

            {/* View History */}
            <div className="quick-action-item secondary">
              <div className="quick-action-content">
                <div className="quick-action-icon-small">
                  <span className="action-icon-small">📊</span>
                </div>
                <div className="quick-action-info-compact">
                  <h5 className="quick-action-title-small">Bet History</h5>
                  <p className="quick-action-description-small">
                    Review your past bets
                  </p>
                </div>
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={handleViewHistory}
                >
                  View All
                </button>
              </div>
            </div>

            {/* Promotions */}
            <div className="quick-action-item secondary featured">
              <div className="quick-action-content">
                <div className="quick-action-icon-small">
                  <span className="action-icon-small">🎁</span>
                </div>
                <div className="quick-action-info-compact">
                  <h5 className="quick-action-title-small">Promotions</h5>
                  <p className="quick-action-description-small">
                    Check out special offers
                  </p>
                </div>
                <button className="btn btn-accent btn-sm">
                  View Offers
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="quick-stats-summary">
          <div className="stats-divider"></div>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">Active Bets</span>
              <span className="stat-value">3</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Live Events</span>
              <span className="stat-value">12</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Today's Games</span>
              <span className="stat-value">45</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 