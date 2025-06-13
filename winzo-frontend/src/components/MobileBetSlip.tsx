import React, { useState, useEffect, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useBetSlip } from '../contexts/BetSlipContext';
import './MobileBetSlip.css';

/**
 * WINZO Mobile Bet Slip Component
 * 
 * Touch-optimized bet slip with mobile-specific features, swipe gestures,
 * and responsive design for optimal mobile betting experience.
 */
const MobileBetSlip: React.FC = () => {
  const { 
    betSlipItems, 
    isOpen, 
    totalStake, 
    totalPayout,
    removeFromBetSlip, 
    updateStake,
    clearBetSlip,
    setIsOpen,
    canPlaceBet
  } = useBetSlip();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [inputValue, setInputValue] = useState(totalStake.toString());
  const [quickStakes] = useState([10, 25, 50, 100, 250, 500]);
  const betSlipRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => {
      if (isOpen && !isExpanded) setIsExpanded(true);
    },
    onSwipedDown: () => {
      if (isOpen && isExpanded) setIsExpanded(false);
    },
    trackMouse: false
  });

  // Handle stake input
  const handleStakeChange = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    setInputValue(value);
    // Update stake for all items
    betSlipItems.forEach(item => {
      updateStake(item.id, numericValue / betSlipItems.length);
    });
  };

  // Quick stake buttons
  const handleQuickStake = (amount: number) => {
    const newStake = totalStake + amount;
    setInputValue(newStake.toString());
    // Distribute stake across all items
    betSlipItems.forEach(item => {
      updateStake(item.id, newStake / betSlipItems.length);
    });
  };

  // Handle bet placement
  const handlePlaceBet = async () => {
    if (betSlipItems.length === 0) {
      alert('Please add at least one selection to your bet slip');
      return;
    }

    if (totalStake <= 0) {
      alert('Please enter a valid stake amount');
      return;
    }

    if (!canPlaceBet()) {
      alert('Please ensure all selections have valid stakes');
      return;
    }

    try {
      // Simulate bet placement
      console.log('Placing bet with items:', betSlipItems);
      console.log('Total stake:', totalStake);
      console.log('Total payout:', totalPayout);
      
      // Success feedback
      alert('Bet placed successfully!');
      clearBetSlip();
    } catch (error) {
      alert('Failed to place bet. Please try again.');
    }
  };

  // Auto-close on escape
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, setIsOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Update input value when totalStake changes
  useEffect(() => {
    setInputValue(totalStake.toString());
  }, [totalStake]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Bet Slip */}
      {isOpen && (
        <div 
          className="mobile-bet-slip"
          style={{ height: isExpanded ? '80vh' : '60vh' }}
          {...swipeHandlers}
        >
          {/* Header */}
          <div className="bet-slip-header">
            <div className="header-content">
              <h3 className="bet-slip-title">
                Bet Slip ({betSlipItems.length})
              </h3>
              <div className="header-actions">
                <button 
                  className="clear-btn"
                  onClick={clearBetSlip}
                  disabled={betSlipItems.length === 0}
                >
                  Clear All
                </button>
                <button 
                  className="close-btn"
                  onClick={() => setIsOpen(false)}
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Swipe indicator */}
            <div className="swipe-indicator">
              <div className="swipe-dot"></div>
            </div>
          </div>

          {/* Selections */}
          <div className="bet-slip-content">
            {betSlipItems.length === 0 ? (
              <div className="empty-selections">
                <div className="empty-icon">📝</div>
                <h4>No selections yet</h4>
                <p>Add selections from the sports events to start betting</p>
              </div>
            ) : (
              <div className="selections-list">
                {betSlipItems.map((item) => (
                  <div key={item.id} className="selection-item">
                    <div className="selection-info">
                      <div className="selection-event">
                        <span className="event-name">{item.homeTeam} vs {item.awayTeam}</span>
                        <span className="event-time">{item.commenceTime}</span>
                      </div>
                      <div className="selection-details">
                        <span className="selection-name">{item.selectedTeam}</span>
                        <span className="selection-odds">{item.odds}</span>
                      </div>
                    </div>
                    
                    <button 
                      className="remove-selection"
                      onClick={() => removeFromBetSlip(item.id)}
                      aria-label="Remove selection"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Stake Input */}
            <div className="stake-section">
              <div className="stake-input-container">
                <label htmlFor="stake-input" className="stake-label">
                  Stake Amount
                </label>
                <div className="input-group">
                  <span className="currency-symbol">$</span>
                  <input
                    ref={inputRef}
                    id="stake-input"
                    type="number"
                    value={inputValue}
                    onChange={(e) => handleStakeChange(e.target.value)}
                    placeholder="0.00"
                    className="stake-input"
                    min="0"
                    step="0.01"
                    onFocus={() => setShowKeyboard(true)}
                    onBlur={() => setShowKeyboard(false)}
                  />
                </div>
              </div>

              {/* Quick Stake Buttons */}
              <div className="quick-stakes">
                {quickStakes.map((amount) => (
                  <button
                    key={amount}
                    className="quick-stake-btn"
                    onClick={() => handleQuickStake(amount)}
                  >
                    +${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Bet Summary */}
            {betSlipItems.length > 0 && (
              <div className="bet-summary">
                <div className="summary-row">
                  <span>Total Odds:</span>
                  <span className="total-odds">
                    {betSlipItems.reduce((acc, item) => {
                      const decimalOdds = item.odds > 0 ? item.odds / 100 + 1 : 100 / Math.abs(item.odds) + 1;
                      return acc * decimalOdds;
                    }, 1).toFixed(2)}
                  </span>
                </div>
                <div className="summary-row">
                  <span>Potential Win:</span>
                  <span className="potential-win">
                    ${totalPayout.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Place Bet Button */}
            <button
              className="place-bet-btn"
              onClick={handlePlaceBet}
              disabled={betSlipItems.length === 0 || totalStake <= 0}
            >
              <span className="bet-btn-text">
                Place Bet - ${totalStake.toFixed(2)}
              </span>
              <span className="bet-btn-win">
                Win: ${totalPayout.toFixed(2)}
              </span>
            </button>
          </div>

          {/* Mobile Keyboard Optimization */}
          {showKeyboard && (
            <div className="mobile-keyboard-hint">
              <p>💡 Tip: Use the quick stake buttons for faster input</p>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="bet-slip-backdrop"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default MobileBetSlip; 