import React from 'react';

interface Activity {
  id: string;
  type: 'bet_placed' | 'bet_won' | 'bet_lost' | 'deposit' | 'withdrawal';
  description: string;
  amount: number;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  loading = false
}) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'bet_placed':
        return '🎯';
      case 'bet_won':
        return '✅';
      case 'bet_lost':
        return '❌';
      case 'deposit':
        return '💳';
      case 'withdrawal':
        return '💸';
      default:
        return '📊';
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'bet_won':
      case 'deposit':
        return 'success';
      case 'bet_lost':
      case 'withdrawal':
        return 'error';
      case 'bet_placed':
        return 'info';
      default:
        return 'neutral';
    }
  };

  const formatAmount = (amount: number) => {
    const safeAmount = Number(amount || 0);
    const sign = safeAmount >= 0 ? '+' : '';
    return `${sign}$${Math.abs(safeAmount).toFixed(2)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-xl font-semibold text-primary">Recent Activity</h3>
        </div>
        <div className="card-body">
          <div className="activity-feed-loading">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="activity-item-skeleton">
                <div className="skeleton-icon"></div>
                <div className="skeleton-content">
                  <div className="skeleton-description"></div>
                  <div className="skeleton-timestamp"></div>
                </div>
                <div className="skeleton-amount"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-xl font-semibold text-primary">Recent Activity</h3>
        <p className="text-sm text-secondary mt-1">Your latest betting activities</p>
      </div>
      <div className="card-body p-0">
        {activities.length === 0 ? (
          <div className="activity-empty-state">
            <div className="empty-state-icon">📊</div>
            <h4 className="empty-state-title">No Recent Activity</h4>
            <p className="empty-state-message">
              Your betting activities will appear here once you start placing bets.
            </p>
            <button className="btn btn-primary btn-sm mt-4">
              Place Your First Bet
            </button>
          </div>
        ) : (
          <div className="activity-feed">
            {activities.map((activity, index) => (
              <div 
                key={activity.id} 
                className={`activity-item ${getActivityColor(activity.type)} ${
                  index === activities.length - 1 ? 'last' : ''
                }`}
              >
                <div className="activity-icon">
                  <span className="activity-type-icon">
                    {getActivityIcon(activity.type)}
                  </span>
                </div>
                
                <div className="activity-content">
                  <div className="activity-description">
                    {activity.description}
                  </div>
                  <div className="activity-timestamp">
                    {formatTimestamp(activity.timestamp)}
                  </div>
                </div>
                
                <div className={`activity-amount ${activity.amount >= 0 ? 'positive' : 'negative'}`}>
                  {formatAmount(activity.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {activities.length > 0 && (
        <div className="card-footer">
          <button className="btn btn-ghost btn-sm btn-full">
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
}; 