// Advanced Live Betting Features - Competition-level functionality
import React, { useState, useEffect, useCallback } from 'react';
import './LiveBettingFeatures.css';

interface LiveOdds {
  id: string;
  eventId: string;
  market: string;
  selection: string;
  odds: number;
  timestamp: number;
  trend: 'up' | 'down' | 'stable';
}

interface LiveBet {
  id: string;
  eventId: string;
  market: string;
  selection: string;
  stake: number;
  currentOdds: number;
  originalOdds: number;
  cashOutValue?: number;
  canCashOut: boolean;
  status: 'active' | 'settled' | 'cashed_out';
}

interface LiveEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  sport: string;
  status: 'live' | 'halftime' | 'finished';
  score: {
    home: number;
    away: number;
  };
  timeElapsed: string;
  period: string;
  isStreaming: boolean;
  keyStats: Array<{
    label: string;
    home: string | number;
    away: string | number;
  }>;
}

export const LiveOddsTracker: React.FC<{ eventId: string }> = ({ eventId }) => {
  const [odds, setOdds] = useState<LiveOdds[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate WebSocket connection for live odds
    const interval = setInterval(() => {
      setOdds(prevOdds => 
        prevOdds.map(odd => ({
          ...odd,
          odds: odd.odds + (Math.random() - 0.5) * 0.1,
          trend: Math.random() > 0.5 ? 'up' : 'down',
          timestamp: Date.now()
        }))
      );
    }, 2000);

    setIsConnected(true);

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [eventId]);

  return (
    <div className="live-odds-tracker">
      <div className="tracker-header">
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
          <span>Live Odds</span>
        </div>
        <div className="last-update">
          Updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      <div className="odds-grid">
        {odds.map(odd => (
          <div key={odd.id} className={`odds-card ${odd.trend}`}>
            <div className="odds-header">
              <span className="market">{odd.market}</span>
              <div className={`trend-arrow ${odd.trend}`}>
                {odd.trend === 'up' ? '↗' : odd.trend === 'down' ? '↘' : '→'}
              </div>
            </div>
            <div className="selection">{odd.selection}</div>
            <div className="odds-value">
              {odd.odds > 0 ? '+' : ''}{odd.odds.toFixed(0)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const CashOutManager: React.FC<{ bet: LiveBet }> = ({ bet }) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const calculateCashOut = useCallback(async () => {
    setIsCalculating(true);
    // Simulate cash out calculation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsCalculating(false);
  }, []);

  const handleCashOut = async () => {
    if (!bet.canCashOut || !bet.cashOutValue) return;
    
    try {
      // API call to cash out bet
      console.log('Cashing out bet:', bet.id, 'for', bet.cashOutValue);
      setShowConfirm(false);
    } catch (error) {
      console.error('Cash out failed:', error);
    }
  };

  useEffect(() => {
    if (bet.canCashOut) {
      calculateCashOut();
    }
  }, [bet.currentOdds, calculateCashOut, bet.canCashOut]);

  if (!bet.canCashOut) {
    return (
      <div className="cash-out-unavailable">
        <span>Cash Out Unavailable</span>
        <small>This bet cannot be cashed out</small>
      </div>
    );
  }

  return (
    <div className="cash-out-manager">
      <div className="cash-out-info">
        <div className="original-stake">
          <label>Original Stake:</label>
          <span>${bet.stake.toFixed(2)}</span>
        </div>
        <div className="cash-out-value">
          <label>Cash Out Value:</label>
          <span className="value">
            {isCalculating ? (
              <div className="calculating">
                <div className="spinner" />
                Calculating...
              </div>
            ) : (
              `$${bet.cashOutValue?.toFixed(2) || '0.00'}`
            )}
          </span>
        </div>
        <div className="profit-loss">
          <label>Profit/Loss:</label>
          <span className={`amount ${(bet.cashOutValue || 0) > bet.stake ? 'profit' : 'loss'}`}>
            {(bet.cashOutValue || 0) > bet.stake ? '+' : ''}$
            {((bet.cashOutValue || 0) - bet.stake).toFixed(2)}
          </span>
        </div>
      </div>

      <button 
        className="cash-out-btn"
        onClick={() => setShowConfirm(true)}
        disabled={isCalculating || !bet.cashOutValue}
      >
        Cash Out ${bet.cashOutValue?.toFixed(2)}
      </button>

      {showConfirm && (
        <div className="cash-out-modal">
          <div className="modal-content">
            <h3>Confirm Cash Out</h3>
            <p>
              Are you sure you want to cash out this bet for{' '}
              <strong>${bet.cashOutValue?.toFixed(2)}</strong>?
            </p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCashOut}
              >
                Confirm Cash Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const LiveGameTracker: React.FC<{ event: LiveEvent }> = ({ event }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return '#28a745';
      case 'halftime': return '#ffc107';
      case 'finished': return '#6c757d';
      default: return '#6c757d';
    }
  };

  return (
    <div className="live-game-tracker">
      <div className="game-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="teams">
          <div className="team">
            <span className="team-name">{event.homeTeam}</span>
            <span className="score">{event.score.home}</span>
          </div>
          <div className="vs">vs</div>
          <div className="team">
            <span className="team-name">{event.awayTeam}</span>
            <span className="score">{event.score.away}</span>
          </div>
        </div>
        
        <div className="game-status">
          <div 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(event.status) }}
          >
            {event.status.toUpperCase()}
          </div>
          <div className="time-info">
            <span className="period">{event.period}</span>
            <span className="elapsed">{event.timeElapsed}</span>
          </div>
        </div>

        {event.isStreaming && (
          <div className="streaming-indicator">
            <div className="live-dot" />
            LIVE STREAM
          </div>
        )}

        <div className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </div>
      </div>

      {isExpanded && (
        <div className="game-details">
          <div className="stats-grid">
            {event.keyStats.map((stat, index) => (
              <div key={index} className="stat-row">
                <span className="stat-home">{stat.home}</span>
                <span className="stat-label">{stat.label}</span>
                <span className="stat-away">{stat.away}</span>
              </div>
            ))}
          </div>
          
          <div className="game-actions">
            <button className="btn btn-outline-primary">
              View Full Stats
            </button>
            {event.isStreaming && (
              <button className="btn btn-primary">
                Watch Live
              </button>
            )}
            <button className="btn btn-outline-secondary">
              Place Live Bet
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const BetBuilder: React.FC = () => {
  const [selections, setSelections] = useState<Array<{
    id: string;
    eventId: string;
    market: string;
    selection: string;
    odds: number;
  }>>([]);
  const [betType, setBetType] = useState<'single' | 'parlay' | 'system'>('single');
  const [stake, setStake] = useState<number>(0);

  const calculatePayout = () => {
    if (selections.length === 0 || stake === 0) return 0;
    
    if (betType === 'single') {
      return stake * (selections[0]?.odds || 1);
    } else if (betType === 'parlay') {
      return selections.reduce((acc, sel) => acc * sel.odds, stake);
    }
    return 0;
  };

  // const addSelection = (selection: any) => {
  //   setSelections(prev => [...prev, selection]);
  // };

  const removeSelection = (id: string) => {
    setSelections(prev => prev.filter(sel => sel.id !== id));
  };

  return (
    <div className="bet-builder">
      <div className="builder-header">
        <h3>Bet Builder</h3>
        <div className="bet-type-selector">
          {(['single', 'parlay', 'system'] as const).map(type => (
            <button
              key={type}
              className={`bet-type-btn ${betType === type ? 'active' : ''}`}
              onClick={() => setBetType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="selections-list">
        {selections.length === 0 ? (
          <div className="empty-selections">
            <p>No selections added yet</p>
            <small>Click on odds to add to your bet</small>
          </div>
        ) : (
          selections.map(selection => (
            <div key={selection.id} className="selection-item">
              <div className="selection-info">
                <span className="market">{selection.market}</span>
                <span className="selection">{selection.selection}</span>
              </div>
              <div className="selection-odds">
                {selection.odds > 0 ? '+' : ''}{selection.odds.toFixed(0)}
              </div>
              <button 
                className="remove-btn"
                onClick={() => removeSelection(selection.id)}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {selections.length > 0 && (
        <div className="bet-summary">
          <div className="stake-input">
            <label>Stake:</label>
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              placeholder="Enter stake"
              min="1"
              step="1"
            />
          </div>
          
          <div className="payout-info">
            <div className="total-odds">
              Total Odds: {betType === 'parlay' 
                ? selections.reduce((acc, sel) => acc * sel.odds, 1).toFixed(2)
                : selections[0]?.odds.toFixed(2) || '0.00'
              }
            </div>
            <div className="potential-payout">
              Potential Payout: ${calculatePayout().toFixed(2)}
            </div>
          </div>

          <button 
            className="place-bet-btn"
            disabled={stake === 0}
          >
            Place Bet
          </button>
        </div>
      )}
    </div>
  );
};

const LiveBettingComponents = {
  LiveOddsTracker,
  CashOutManager,
  LiveGameTracker,
  BetBuilder
};

export default LiveBettingComponents; 