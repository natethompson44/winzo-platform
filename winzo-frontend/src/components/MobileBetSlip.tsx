import React, { useState } from 'react';
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

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const betTypeOptions = [
    { id: 'straight' as const, label: 'Straight', description: 'Single bet on one selection' },
    { id: 'parlay' as const, label: 'Parlay', description: 'Multiple selections combined', minSelections: 2 },
    { id: 'teaser' as const, label: 'Teaser', description: 'Adjusted point spreads', minSelections: 2 },
    { id: 'if-bet' as const, label: 'If Bet', description: 'Conditional betting', minSelections: 2 }
  ];

  // Preset stake amounts for quick selection
  const presetStakes = [5, 10, 25, 50, 100, 250];

  // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedDown: () => setIsOpen(false),
    onSwipedUp: () => setIsOpen(true),
    trackMouse: false
  });

  const formatOdds = (odds: number): string => {
    if (odds > 0) {
      return `+${odds}`;
    }
    return odds.toString();
  };

  const handlePlaceBets = async () => {
    if (!canPlaceBet()) return;
    
    setShowConfirmation(true);
  };

  const handleConfirmBet = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear bet slip after successful placement
      clearBetSlip();
      setShowConfirmation(false);
      
      // Show success message (you can integrate with your toast system)
      console.log('Bet placed successfully!');
    } catch (error) {
      console.error('Error placing bet:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePresetStake = (amount: number) => {
    if (betType === 'straight') {
      // For straight bets, apply to all individual bets
      betSlipItems.forEach(item => {
        updateStake(item.id, amount);
      });
    } else {
      // For multi-bets, set the total stake
      const stakePerBet = amount / betSlipItems.length;
      betSlipItems.forEach(item => {
        updateStake(item.id, stakePerBet);
      });
    }
  };

  const getBetTypeLabel = (type: string): string => {
    const option = betTypeOptions.find(opt => opt.id === type);
    return option ? option.label : type;
  };

  const isBetTypeDisabled = (type: string): boolean => {
    const option = betTypeOptions.find(opt => opt.id === type);
    if (!option) return true;
    
    if (option.minSelections && betSlipItems.length < option.minSelections) {
      return true;
    }
    
    return false;
  };

  if (!isOpen) return null;

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
              aria-label="Close bet slip"
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
            <div className="mobile-empty-bet-slip">
              <div className="mobile-empty-icon">📋</div>
              <h4>Your Bet Slip is Empty</h4>
              <p>Select teams and odds from the sports listings to start building your bet.</p>
            </div>
          ) : (
            <div className="mobile-bet-items">
              {betSlipItems.map((item, index) => (
                <div key={item.id} className="mobile-bet-item">
                  <div className="mobile-bet-item-header">
                    <span className="mobile-bet-number">{index + 1}</span>
                    <button 
                      className="mobile-remove-bet"
                      onClick={() => removeFromBetSlip(item.id)}
                      aria-label={`Remove ${item.selectedTeam} from bet slip`}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="mobile-bet-details">
                    <div className="mobile-teams">
                      <span className="mobile-team">{item.homeTeam}</span>
                      <span className="mobile-vs">vs</span>
                      <span className="mobile-team">{item.awayTeam}</span>
                    </div>
                    
                    <div className="mobile-selection">
                      <span className="mobile-selected-team">{item.selectedTeam}</span>
                      <span className="mobile-odds">{formatOdds(item.odds)}</span>
                    </div>
                    
                    <div className="mobile-market-info">
                      <span className="mobile-market-type">{item.marketType}</span>
                      <span className="mobile-bookmaker">{item.bookmaker}</span>
                    </div>
                  </div>
                  
                  {/* Individual Stake Input for Straight Bets */}
                  {betType === 'straight' && (
                    <div className="mobile-stake-input-section">
                      <label className="mobile-stake-label">Stake Amount:</label>
                      <input
                        type="number"
                        className="mobile-stake-input"
                        value={item.stake}
                        onChange={(e) => {
                          const newStake = parseFloat(e.target.value) || 0;
                          updateStake(item.id, newStake);
                        }}
                        min="1"
                        step="1"
                        placeholder="0"
                      />
                      <div className="mobile-potential-payout">
                        Potential Win: {formatCurrency(item.potentialPayout)}
                      </div>
                    </div>
                  )}
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
            
            {/* Preset Stake Buttons */}
            <div className="mobile-preset-stakes-section">
              <label className="mobile-stake-label">Quick Stake:</label>
              <div className="mobile-preset-stakes-grid">
                {presetStakes.map((amount) => (
                  <button
                    key={amount}
                    className="mobile-preset-stake-btn"
                    onClick={() => handlePresetStake(amount)}
                    title={`Set stake to $${amount}`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
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
          <button 
            className="mobile-place-bet-btn"
            onClick={handlePlaceBets}
            disabled={!canPlaceBet()}
          >
            Place Bet
          </button>
          
          <button 
            className="mobile-clear-all-btn"
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
                  <span>{getBetTypeLabel(betType)}</span>
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
                  <span>{formatCurrency(totalPayout)}</span>
                </div>
              </div>
            </div>
            
            <div className="confirmation-actions">
              <button 
                className="confirm-bet-btn"
                onClick={handleConfirmBet}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    Processing...
                    <div className="loading-spinner-small"></div>
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
      )}
    </>
  );
};

export default MobileBetSlip; 