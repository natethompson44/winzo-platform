import React from 'react';
import { useSwipeable } from 'react-swipeable';
import { BetSlipCore, BetSlipRenderProps } from './BetSlipCore';
import { formatCurrency } from '../../../utils/numberUtils';
import './BetSlip.mobile.css';

export interface MobileBetSlipProps {
  className?: string;
  onClose?: () => void;
}

export const MobileBetSlip: React.FC<MobileBetSlipProps> = ({ 
  className = '',
  onClose 
}) => {
  return (
    <BetSlipCore className={`mobile-bet-slip-wrapper ${className}`} onClose={onClose}>
      {(renderProps: BetSlipRenderProps) => (
        <MobileBetSlipContent {...renderProps} />
      )}
    </BetSlipCore>
  );
};

const MobileBetSlipContent: React.FC<BetSlipRenderProps> = ({
  betSlipItems,
  betType,
  totalStake,
  totalPayout,
  isProcessing,
  showConfirmation,
  isOpen,
  handlePlaceBet,
  handleConfirmBet,
  handleCancelBet,
  handleStakeUpdate,
  handleBetTypeChange,
  handleClose,
  handleRemoveItem,
  handleClearAll,
  getBetTypeLabel,
  getBetTypeDescription,
  isBetTypeDisabled,
  formatOdds,
  canPlaceBet,
  betTypeOptions
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Swipe handlers for mobile gestures
  const swipeHandlers = useSwipeable({
    onSwipedUp: () => {
      if (isOpen && !isExpanded) setIsExpanded(true);
    },
    onSwipedDown: () => {
      if (isOpen && isExpanded) setIsExpanded(false);
      else if (isOpen) handleClose();
    },
    trackMouse: false
  });

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Bet Slip - Bottom Sheet */}
      <div 
        className={`mobile-bet-slip ${isOpen ? 'open' : 'closed'} ${isExpanded ? 'expanded' : ''}`}
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
              className="close-btn touch-target"
              onClick={handleClose}
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
                className={`mobile-bet-type touch-target ${betType === option.id ? 'active' : ''} ${
                  isBetTypeDisabled(option.id) ? 'disabled' : ''
                }`}
                onClick={() => handleBetTypeChange(option.id)}
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
          
          {/* Bet Type Description */}
          <div className="mobile-bet-type-info">
            <p className="bet-type-description">{getBetTypeDescription(betType)}</p>
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
                      className="remove-mobile-bet touch-target"
                      onClick={() => handleRemoveItem(item.id)}
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
                      <span className="odds">{formatOdds(item.odds)}</span>
                    </div>

                    {/* Stake Input for Individual Bets */}
                    {betType === 'straight' && (
                      <div className="mobile-stake-input-section">
                        <label className="mobile-stake-label">Stake:</label>
                        <input
                          type="number"
                          className="mobile-stake-input touch-target"
                          value={item.stake || ''}
                          onChange={(e) => handleStakeUpdate(item.id, e.target.value)}
                          min="1"
                          step="1"
                          placeholder="0"
                        />
                        <div className="mobile-potential-payout">
                          Win: {formatCurrency(item.potentialPayout || 0)}
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
                  className="mobile-combined-stake-input touch-target"
                  value={totalStake || ''}
                  onChange={(e) => {
                    const newStake = parseFloat(e.target.value) || 0;
                    const stakePerBet = newStake / betSlipItems.length;
                    betSlipItems.forEach(item => {
                      handleStakeUpdate(item.id, stakePerBet.toString());
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
                className="mobile-place-bet-btn touch-target"
                onClick={handlePlaceBet}
                disabled={!canPlaceBet()}
              >
                PLACE BET
              </button>
              <button 
                className="mobile-clear-all-btn touch-target" 
                onClick={handleClearAll}
              >
                Clear All
              </button>
            </>
          ) : (
            <button className="mobile-clear-all-btn touch-target" disabled>
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
                className="close-modal touch-target"
                onClick={handleCancelBet}
                disabled={isProcessing}
                aria-label="Close confirmation"
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
                  className="mobile-confirm-bet-btn touch-target"
                  onClick={handleConfirmBet}
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
                  className="mobile-cancel-bet-btn touch-target"
                  onClick={handleCancelBet}
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
              handleCancelBet();
            } else {
              handleClose();
            }
          }}
        />
      )}
    </>
  );
};

export default MobileBetSlip;