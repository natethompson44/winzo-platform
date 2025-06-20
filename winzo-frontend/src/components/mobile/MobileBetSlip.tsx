import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';

interface Bet {
  id: string;
  game: string;
  team: string;
  odds: number;
  stake: number;
  potentialWin: number;
}

interface MobileBetSlipProps {
  isOpen: boolean;
  onClose: () => void;
  bets: Bet[];
  totalStake: number;
  totalPotentialWin: number;
  onRemoveBet: (betId: string) => void;
  onUpdateStake: (betId: string, stake: number) => void;
  onPlaceBets: () => void;
}

const MobileBetSlip: React.FC<MobileBetSlipProps> = ({
  isOpen,
  onClose,
  bets,
  totalStake,
  totalPotentialWin,
  onRemoveBet,
  onUpdateStake,
  onPlaceBets
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [stakeValues, setStakeValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handlers = useSwipeable({
    onSwipedDown: () => {
      if (isOpen) {
        onClose();
      }
    },
    trackMouse: true,
    delta: 50
  });

  const handleStakeChange = (betId: string, value: string) => {
    setStakeValues(prev => ({
      ...prev,
      [betId]: value
    }));

    const numericValue = parseFloat(value) || 0;
    onUpdateStake(betId, numericValue);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div 
      className={`mobile-bet-slip-overlay ${isOpen ? 'open' : ''}`}
      onClick={handleOverlayClick}
    >
      <div 
        className={`mobile-bet-slip ${isOpen ? 'open' : ''}`}
        {...handlers}
        onAnimationEnd={() => {
          if (!isOpen) setIsAnimating(false);
        }}
      >
        {/* Handle Bar */}
        <div className="bet-slip-handle">
          <div className="handle-bar"></div>
        </div>

        {/* Header */}
        <div className="bet-slip-header">
          <h3 className="bet-slip-title">
            Bet Slip
            {bets.length > 0 && (
              <span className="bet-count">({bets.length})</span>
            )}
          </h3>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Close bet slip"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="bet-slip-content">
          {bets.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="empty-title">No bets selected</p>
              <p className="empty-description">Tap on odds to add bets to your slip</p>
            </div>
          ) : (
            <>
              {/* Bet Items */}
              <div className="bet-items">
                {bets.map((bet) => (
                  <div key={bet.id} className="bet-item">
                    <div className="bet-info">
                      <div className="bet-game">{bet.game}</div>
                      <div className="bet-selection">
                        <span className="team">{bet.team}</span>
                        <span className="odds">@{bet.odds.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="bet-stake">
                      <label className="stake-label">Stake</label>
                      <div className="stake-input-container">
                        <span className="currency">$</span>
                        <input
                          type="number"
                          className="stake-input"
                          value={stakeValues[bet.id] || bet.stake.toString()}
                          onChange={(e) => handleStakeChange(bet.id, e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="potential-win">
                        Win: <span className="amount">${bet.potentialWin.toFixed(2)}</span>
                      </div>
                    </div>
                    <button
                      className="remove-bet"
                      onClick={() => onRemoveBet(bet.id)}
                      aria-label="Remove bet"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bet-summary">
                <div className="summary-row">
                  <span className="label">Total Stake</span>
                  <span className="value">${totalStake.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span className="label">Potential Win</span>
                  <span className="value">${totalPotentialWin.toFixed(2)}</span>
                </div>
              </div>

              {/* Place Bet Button */}
              <button
                className="place-bet-button"
                onClick={onPlaceBets}
                disabled={bets.length === 0 || totalStake === 0}
              >
                Place Bet{bets.length > 1 ? 's' : ''}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileBetSlip; 