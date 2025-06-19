import React, { useState, useCallback } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useBetSlip } from '../../contexts/BetSlipContext';
import { formatCurrency } from '../../utils/numberUtils';
import BetItem from './BetItem';
import StakeInput from './StakeInput';
import PayoutDisplay from './PayoutDisplay';
import ValidationDisplay from './ValidationDisplay';
import './BetslipPanel.css';

interface BetslipPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const BetslipPanel: React.FC<BetslipPanelProps> = ({ isOpen, onClose }) => {
  const {
    betSlipItems,
    betType,
    setBetType,
    totalStake,
    totalPayout,
    validationResult,
    teaserPoints,
    setTeaserPoints,
    removeFromBetSlip,
    updateStake,
    clearBetSlip,
    canPlaceBet,
    validateCurrentBet
  } = useBetSlip();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const betTypeOptions = [
    { id: 'straight' as const, label: 'Straight', description: 'Single bet on one selection' },
    { id: 'parlay' as const, label: 'Parlay', description: 'Multiple selections combined', minSelections: 2 },
    { id: 'sgp' as const, label: 'SGP', description: 'Same Game Parlay', minSelections: 2 },
    { id: 'teaser' as const, label: 'Teaser', description: 'Adjusted point spreads', minSelections: 2 },
    { id: 'if-bet' as const, label: 'If Bet', description: 'Conditional betting', minSelections: 2 }
  ];

  // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedDown: () => onClose(),
    onSwipedUp: () => {}, // Could be used to expand panel
    trackMouse: false
  });

  const handlePlaceBets = useCallback(async () => {
    if (!canPlaceBet()) return;
    
    setShowConfirmation(true);
  }, [canPlaceBet]);

  const handleConfirmBets = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      // TODO: Implement actual bet placement API call
      console.log('Placing bets:', betSlipItems);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear betslip after successful placement
      clearBetSlip();
      setShowConfirmation(false);
      
      // Show success notification
      // You can integrate with your toast system here
      
    } catch (error) {
      console.error('Error placing bets:', error);
      // Show error notification
    } finally {
      setIsProcessing(false);
    }
  }, [betSlipItems, clearBetSlip]);

  const isBetTypeDisabled = (type: 'straight' | 'parlay' | 'sgp' | 'teaser' | 'if-bet'): boolean => {
    if (type === 'parlay' && betSlipItems.length < 2) return true;
    if (type === 'sgp' && betSlipItems.length < 2) return true;
    if (type === 'teaser' && betSlipItems.length < 2) return true;
    if (type === 'if-bet' && betSlipItems.length < 2) return true;
    return false;
  };

  const formatOdds = (odds: number): string => {
    if (odds > 0) {
      return `+${odds}`;
    }
    return odds.toString();
  };

  return (
    <>
      {/* Backdrop - only show when open */}
      {isOpen && (
        <div className="betslip-backdrop" onClick={onClose} />
      )}
      
      {/* Unified Betslip Panel */}
      <div 
        className={`betslip-panel ${isOpen ? 'open' : ''}`}
        {...swipeHandlers}
      >
        {/* Header */}
        <div className="betslip-header">
          <div className="swipe-indicator">
            <div className="swipe-handle"></div>
          </div>
          <div className="header-content">
            <h3 className="betslip-title">
              <span className="betslip-icon">📋</span>
              Bet Slip ({betSlipItems.length})
            </h3>
            <button 
              className="close-button"
              onClick={onClose}
              aria-label="Close bet slip"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Bet Types Section */}
        <div className="bet-types-section">
          <h4 className="bet-types-title">Bet Type</h4>
          <div className="bet-types-grid">
            {betTypeOptions.map((option) => (
              <button
                key={option.id}
                className={`bet-type ${betType === option.id ? 'active' : ''} ${
                  isBetTypeDisabled(option.id) ? 'disabled' : ''
                }`}
                onClick={() => setBetType(option.id as any)}
                disabled={isBetTypeDisabled(option.id as any)}
                title={option.description}
              >
                {option.label}
                {option.minSelections && betSlipItems.length < option.minSelections && (
                  <span className="min-selections">({option.minSelections}+)</span>
                )}
              </button>
            ))}
          </div>

          {/* Teaser Points Selection */}
          {betType === 'teaser' && betSlipItems.length >= 2 && (
            <div className="teaser-points-section">
              <h5 className="teaser-points-title">Points</h5>
              <div className="teaser-points-grid">
                {[6, 6.5, 7].map((points) => (
                  <button
                    key={points}
                    className={`teaser-point ${teaserPoints === points ? 'active' : ''}`}
                    onClick={() => setTeaserPoints(points)}
                  >
                    {points}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Real-time Validation Display */}
        {betSlipItems.length > 0 && (
          <ValidationDisplay
            validationResult={validationResult}
            betType={betType}
            className="compact"
          />
        )}

        {/* Content */}
        <div className="betslip-content">
          {betSlipItems.length === 0 ? (
            <div className="empty-betslip">
              <div className="empty-icon">📋</div>
              <h4>Your Bet Slip is Empty</h4>
              <p>Select teams and odds from the sports listings to start building your bet.</p>
            </div>
          ) : (
            <div className="bet-items">
              {betSlipItems.map((item, index) => (
                <BetItem
                  key={item.id}
                  bet={item}
                  index={index}
                  onRemove={() => removeFromBetSlip(item.id)}
                  onUpdateStake={(stake) => updateStake(item.id, stake)}
                  formatOdds={formatOdds}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stake and Payout Section */}
        {betSlipItems.length > 0 && (
          <div className="stake-payout-section">
            <StakeInput 
              betType={betType}
              betSlipItems={betSlipItems}
              onUpdateStake={updateStake}
            />
            
            <PayoutDisplay
              totalStake={totalStake}
              totalPayout={totalPayout}
              betType={betType}
              betCount={betSlipItems.length}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="betslip-actions">
          <button 
            className="place-bet-btn"
            onClick={handlePlaceBets}
            disabled={!canPlaceBet()}
          >
            {isProcessing ? (
              <>
                <span className="loading-spinner"></span>
                Processing...
              </>
            ) : (
              `Place Bet${betSlipItems.length > 1 ? 's' : ''}`
            )}
          </button>
          
          <button 
            className="clear-all-btn"
            onClick={clearBetSlip}
            disabled={betSlipItems.length === 0}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Bet Confirmation Modal */}
      {showConfirmation && (
        <div className="bet-confirmation-overlay">
          <div className="bet-confirmation-modal">
            <div className="modal-header">
              <h3>Confirm Your Bet</h3>
              <button 
                className="close-modal"
                onClick={() => setShowConfirmation(false)}
                disabled={isProcessing}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="confirmation-details">
                <div className="detail-row">
                  <span>Bet Type:</span>
                  <span className="bet-type-badge">{betType.toUpperCase()}</span>
                </div>
                <div className="detail-row">
                  <span>Selections:</span>
                  <span>{betSlipItems.length}</span>
                </div>
                <div className="detail-row">
                  <span>Total Stake:</span>
                  <span>{formatCurrency(totalStake)}</span>
                </div>
                <div className="detail-row highlight">
                  <span>Potential Win:</span>
                  <span className="potential-win">{formatCurrency(totalPayout)}</span>
                </div>
              </div>
              
              <div className="confirmation-actions">
                <button 
                  className="confirm-bet-btn"
                  onClick={handleConfirmBets}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="loading-spinner-small"></span>
                      Placing Bet...
                    </>
                  ) : (
                    'Confirm Bet'
                  )}
                </button>
                
                <button 
                  className="cancel-bet-btn"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BetslipPanel; 