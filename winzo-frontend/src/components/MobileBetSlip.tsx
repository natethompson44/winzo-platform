import React, { useState, useEffect, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useBetSlip } from '../contexts/BetSlipContext';
import { formatCurrency } from '../utils/numberUtils';
import './MobileBetSlip.css';

/**
 * WINZO Mobile Bet Slip Component
 * 
 * Mobile betting interface following the same pattern as desktop:
 * - Bottom sheet design
 * - Integrated bet types
 * - Touch-optimized interactions
 * - Swipe gestures
 */
const MobileBetSlip: React.FC = () => {
  const { 
    betSlipItems, 
    betType,
    setBetType,
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const betTypeOptions = [
    { id: 'straight' as const, label: 'Straight', description: 'Single bet on one selection' },
    { id: 'parlay' as const, label: 'Parlay', description: 'Multiple selections combined', minSelections: 2 },
    { id: 'teaser' as const, label: 'Teaser', description: 'Adjusted point spreads', minSelections: 2 },
    { id: 'if-bet' as const, label: 'If Bet', description: 'Conditional betting', minSelections: 2 }
  ];

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => {
      if (isOpen && !isExpanded) setIsExpanded(true);
    },
    onSwipedDown: () => {
      if (isOpen && isExpanded) setIsExpanded(false);
      else if (isOpen) setIsOpen(false);
    },
    trackMouse: false
  });

  const getBetTypeLabel = (type: string) => {
    const option = betTypeOptions.find(opt => opt.id === type);
    return option ? option.label : type;
  };

  const isBetTypeDisabled = (type: string) => {
    const option = betTypeOptions.find(opt => opt.id === type);
    if (option && option.minSelections) {
      return betSlipItems.length < option.minSelections;
    }
    return false;
  };

  const handleStakeUpdate = (id: string, value: string) => {
    const stake = parseFloat(value) || 0;
    updateStake(id, stake);
  };

  const handlePlaceBet = async () => {
    if (!canPlaceBet()) return;
    setShowConfirmation(true);
  };

  const confirmBet = async () => {
    setIsProcessing(true);
    
    try {
      // TODO: Implement actual bet placement API call
      console.log('Placing bet:', {
        items: betSlipItems,
        totalStake,
        totalPayout,
        betType
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success - clear bet slip and close
      clearBetSlip();
      setIsOpen(false);
      setShowConfirmation(false);
      
    } catch (error) {
      console.error('Failed to place bet:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelBet = () => {
    setShowConfirmation(false);
  };

  // Only render on mobile devices when open
  if (!isOpen || !isMobile) return null;

  return (
    <>
      {/* Mobile Bet Slip - Bottom Sheet */}
      <div 
        className={`mobile-bet-slip ${isOpen ? 'open' : 'closed'}`}
        {...swipeHandlers}
      >
        {/* Header */}
        <div className="mobile-bet-slip-header">
          <div className="swipe-indicator">
            <div className="swipe-handle"></div>
          </div>
          <div className="header-content">
            <h3 className="mobile-bet-slip-title">
              <span className="bet-slip-icon">📋</span>
              Bet Slip ({betSlipItems.length})
            </h3>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Bet Types Section */}
        <div className="mobile-bet-types-section">
          <h4 className="bet-types-title">Bet Type</h4>
          <div className="mobile-bet-types-grid">
            {betTypeOptions.map((option) => (
              <button
                key={option.id}
                className={`mobile-bet-type ${betType === option.id ? 'active' : ''} ${
                  isBetTypeDisabled(option.id) ? 'disabled' : ''
                }`}
                onClick={() => setBetType(option.id)}
                disabled={isBetTypeDisabled(option.id)}
                title={option.description}
              >
                {option.label}
                {option.minSelections && betSlipItems.length < option.minSelections && (
                  <span className="min-selections">({option.minSelections}+)</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mobile-bet-slip-content">
          {betSlipItems.length === 0 ? (
            <div className="empty-mobile-bet-slip">
              <div className="empty-icon">📝</div>
              <h4>No selections yet</h4>
              <p>Tap on odds to add selections</p>
            </div>
          ) : (
            <div className="mobile-bet-items">
              {betSlipItems.map((item, index) => (
                <div key={item.id} className="mobile-bet-item">
                  <div className="mobile-bet-item-header">
                    <div className="bet-number">#{index + 1}</div>
                    <button
                      className="remove-mobile-bet"
                      onClick={() => removeFromBetSlip(item.id)}
                      aria-label="Remove bet"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="mobile-bet-details">
                    <div className="mobile-teams">
                      <span className="team">{item.homeTeam}</span>
                      <span className="vs">vs</span>
                      <span className="team">{item.awayTeam}</span>
                    </div>
                    
                    <div className="mobile-selection">
                      <span className="selected-team">{item.selectedTeam}</span>
                      <span className="odds">{item.odds > 0 ? `+${item.odds}` : item.odds}</span>
                    </div>

                    {/* Stake Input for Individual Bets */}
                    {betType === 'straight' && (
                      <div className="mobile-stake-input-section">
                        <label className="mobile-stake-label">Stake:</label>
                        <input
                          type="number"
                          className="mobile-stake-input"
                          value={item.stake}
                          onChange={(e) => handleStakeUpdate(item.id, e.target.value)}
                          min="1"
                          step="1"
                          placeholder="0"
                        />
                        <div className="mobile-potential-payout">
                          Win: {formatCurrency(item.potentialPayout)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bet Summary */}
        {betSlipItems.length > 0 && (
          <div className="mobile-bet-summary">
            <div className="mobile-summary-header">
              <h4>Bet Summary</h4>
              <span className="mobile-bet-type-badge">{getBetTypeLabel(betType)}</span>
            </div>
            
            {/* Combined Stake Input for Multi-Bets */}
            {betType !== 'straight' && (
              <div className="mobile-combined-stake-section">
                <label className="mobile-stake-label">Total Stake:</label>
                <input
                  type="number"
                  className="mobile-combined-stake-input"
                  value={totalStake}
                  onChange={(e) => {
                    const newStake = parseFloat(e.target.value) || 0;
                    const stakePerBet = newStake / betSlipItems.length;
                    betSlipItems.forEach(item => {
                      updateStake(item.id, stakePerBet);
                    });
                  }}
                  min="1"
                  step="1"
                  placeholder="0"
                />
              </div>
            )}
            
            <div className="mobile-summary-rows">
              <div className="mobile-summary-row">
                <span>Selections:</span>
                <span className="value">{betSlipItems.length}</span>
              </div>
              
              <div className="mobile-summary-row">
                <span>Total Stake:</span>
                <span className="total-stake">{formatCurrency(totalStake)}</span>
              </div>
              
              <div className="mobile-summary-row highlight">
                <span>Potential Win:</span>
                <span className="potential-win">{formatCurrency(totalPayout)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mobile-bet-actions">
          {betSlipItems.length > 0 ? (
            <>
              <button
                className="mobile-place-bet-btn"
                onClick={handlePlaceBet}
                disabled={!canPlaceBet()}
              >
                PLACE BET
              </button>
              <button className="mobile-clear-all-btn" onClick={clearBetSlip}>
                Clear All
              </button>
            </>
          ) : (
            <button className="mobile-clear-all-btn" disabled>
              No Selections
            </button>
          )}
        </div>
      </div>

      {/* Bet Confirmation Modal */}
      {showConfirmation && (
        <div className="mobile-bet-confirmation-overlay">
          <div className="mobile-bet-confirmation-modal">
            <div className="mobile-modal-header">
              <h3>Confirm Your Bet</h3>
              <button
                className="close-modal"
                onClick={cancelBet}
                disabled={isProcessing}
              >
                ✕
              </button>
            </div>
            
            <div className="mobile-modal-content">
              <div className="mobile-confirmation-details">
                <div className="mobile-detail-row">
                  <span>Bet Type:</span>
                  <span>{getBetTypeLabel(betType)}</span>
                </div>
                <div className="mobile-detail-row">
                  <span>Selections:</span>
                  <span>{betSlipItems.length}</span>
                </div>
                <div className="mobile-detail-row">
                  <span>Total Stake:</span>
                  <span>{formatCurrency(totalStake)}</span>
                </div>
                <div className="mobile-detail-row highlight">
                  <span>Potential Win:</span>
                  <span>{formatCurrency(totalPayout)}</span>
                </div>
              </div>
              
              <div className="mobile-confirmation-actions">
                <button
                  className="mobile-confirm-bet-btn"
                  onClick={confirmBet}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="loading-spinner-small"></span>
                      Processing...
                    </>
                  ) : (
                    'Confirm Bet'
                  )}
                </button>
                <button
                  className="mobile-cancel-bet-btn"
                  onClick={cancelBet}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {(isOpen || showConfirmation) && (
        <div 
          className="mobile-bet-slip-backdrop"
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