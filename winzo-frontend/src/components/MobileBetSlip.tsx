import React, { useState, useEffect, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useBetSlip } from '../contexts/BetSlipContext';
import './MobileBetSlip.css';

/**
 * WINZO Mobile Bet Slip Component - Website Experience
 * 
 * Professional mobile betting interface that maintains website feel:
 * - Responsive odds tables
 * - Touch-optimized bet slip
 * - Easy bet amount entry
 * - Professional confirmation flows
 * - Swipe gestures for odds browsing
 * - NO mobile app-style interactions
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Swipe handlers for professional website feel
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => {
      if (isOpen && !isExpanded) setIsExpanded(true);
    },
    onSwipedDown: () => {
      if (isOpen && isExpanded) setIsExpanded(false);
    },
    trackMouse: false
  });

  // Handle stake input with professional validation
  const handleStakeChange = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    setInputValue(value);
    
    // Validate stake amount
    if (numericValue < 0) {
      setInputValue('0');
      return;
    }
    
    if (numericValue > 10000) {
      setInputValue('10000');
      return;
    }
    
    // Update stake for all items
    betSlipItems.forEach(item => {
      updateStake(item.id, numericValue / betSlipItems.length);
    });
  };

  // Quick stake buttons with professional feedback
  const handleQuickStake = (amount: number) => {
    const newStake = Math.min(totalStake + amount, 10000);
    setInputValue(newStake.toString());
    
    // Distribute stake across all items
    betSlipItems.forEach(item => {
      updateStake(item.id, newStake / betSlipItems.length);
    });
    
    // Provide haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Professional bet placement with confirmation
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

    setShowConfirmation(true);
  };

  // Confirm bet placement
  const confirmBet = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate bet placement with professional loading
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Placing bet with items:', betSlipItems);
      console.log('Total stake:', totalStake);
      console.log('Total payout:', totalPayout);
      
      // Success feedback
      alert('Bet placed successfully! Good luck!');
      clearBetSlip();
      setShowConfirmation(false);
    } catch (error) {
      alert('Failed to place bet. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Cancel bet placement
  const cancelBet = () => {
    setShowConfirmation(false);
  };

  // Auto-close on escape
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (showConfirmation) {
          setShowConfirmation(false);
        } else {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, setIsOpen, showConfirmation]);

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
      {/* Mobile Bet Slip - Website Style */}
      {isOpen && (
        <div 
          className="mobile-bet-slip"
          style={{ height: isExpanded ? '85vh' : '65vh' }}
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

            {/* Stake Input Section */}
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
                    max="10000"
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
              disabled={betSlipItems.length === 0 || totalStake <= 0 || !canPlaceBet()}
            >
              <span className="bet-btn-text">Place Bet</span>
              <span className="bet-btn-win">Win: ${totalPayout.toFixed(2)}</span>
            </button>

            {/* Keyboard hint */}
            {showKeyboard && (
              <div className="mobile-keyboard-hint">
                <p>💡 Tip: Use quick stake buttons for faster betting</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bet Confirmation Modal */}
      {showConfirmation && (
        <div className="bet-confirmation-modal">
          <div className="confirmation-content">
            <div className="confirmation-header">
              <h3>Confirm Your Bet</h3>
              <button 
                className="close-confirmation"
                onClick={cancelBet}
                disabled={isProcessing}
              >
                ✕
              </button>
            </div>
            
            <div className="confirmation-details">
              <div className="confirmation-summary">
                <div className="summary-item">
                  <span>Selections:</span>
                  <span>{betSlipItems.length}</span>
                </div>
                <div className="summary-item">
                  <span>Total Stake:</span>
                  <span>${totalStake.toFixed(2)}</span>
                </div>
                <div className="summary-item">
                  <span>Potential Win:</span>
                  <span>${totalPayout.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="confirmation-selections">
                <h4>Your Selections:</h4>
                {betSlipItems.map((item) => (
                  <div key={item.id} className="confirmation-selection">
                    <span className="selection-text">
                      {item.selectedTeam} @ {item.odds}
                    </span>
                    <span className="selection-event">
                      {item.homeTeam} vs {item.awayTeam}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="confirmation-actions">
              <button 
                className="cancel-btn"
                onClick={cancelBet}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn"
                onClick={confirmBet}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  'Confirm Bet'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {(isOpen || showConfirmation) && (
        <div 
          className="bet-slip-backdrop"
          onClick={() => {
            if (showConfirmation) {
              cancelBet();
            } else {
              setIsOpen(false);
            }
          }}
        />
      )}
    </>
  );
};

export default MobileBetSlip; 