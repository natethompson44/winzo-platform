import React from 'react';
import { BetSlipCore, BetSlipRenderProps } from './BetSlipCore';
import { formatCurrency } from '../../../utils/numberUtils';
import './BetSlip.desktop.css';

export interface DesktopBetSlipProps {
  className?: string;
  onClose?: () => void;
}

export const DesktopBetSlip: React.FC<DesktopBetSlipProps> = ({ 
  className = '',
  onClose 
}) => {
  return (
    <BetSlipCore className={`desktop-bet-slip-wrapper ${className}`} onClose={onClose}>
      {(renderProps: BetSlipRenderProps) => (
        <DesktopBetSlipContent {...renderProps} />
      )}
    </BetSlipCore>
  );
};

const DesktopBetSlipContent: React.FC<BetSlipRenderProps> = ({
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
  return (
    <>
      {/* Backdrop only when open */}
      {isOpen && (
        <div className="bet-slip-backdrop" onClick={handleClose} />
      )}
      
      {/* Right Sidebar Bet Slip - Always render for smooth animations */}
      <div className={`bet-slip-sidebar ${isOpen ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="bet-slip-header">
          <div className="header-content">
            <h3 className="bet-slip-title">
              <span className="bet-slip-icon">📋</span>
              Bet Slip ({betSlipItems.length})
            </h3>
            <button 
              className="close-button" 
              onClick={handleClose}
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
          
          {/* Bet Type Info */}
          <div className="bet-type-info">
            <p className="bet-type-description">{getBetTypeDescription(betType)}</p>
            {betType === 'teaser' && betSlipItems.length >= 2 && (
              <div className="teaser-info">
                <small>✨ Adjusted odds with better spreads but lower payouts</small>
              </div>
            )}
            {betType === 'if-bet' && betSlipItems.length >= 2 && (
              <div className="if-bet-info">
                <small>🔄 Second bet only processes if first bet wins</small>
              </div>
            )}
            {betType === 'parlay' && betSlipItems.length >= 2 && (
              <div className="parlay-info">
                <small>🚀 All selections must win - Higher risk, higher reward!</small>
              </div>
            )}
          </div>
        </div>

        {/* Bet Items */}
        <div className="bet-slip-content">
          {betSlipItems.length === 0 ? (
            <div className="empty-bet-slip">
              <div className="empty-icon">📝</div>
              <h4>No selections yet</h4>
              <p>Click on odds to add selections to your bet slip</p>
            </div>
          ) : (
            <div className="bet-items">
              {betSlipItems.map((item, index) => (
                <div key={item.id} className="bet-item">
                  <div className="bet-item-header">
                    <div className="bet-number">#{index + 1}</div>
                    <button
                      className="remove-bet"
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label="Remove bet"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="bet-details">
                    <div className="teams">
                      <span className="team">{item.homeTeam}</span>
                      <span className="vs">vs</span>
                      <span className="team">{item.awayTeam}</span>
                    </div>
                    
                    <div className="selection">
                      <span className="selected-team">{item.selectedTeam}</span>
                      <span className="odds">{formatOdds(item.odds)}</span>
                    </div>
                    
                    <div className="market-info">
                      <span className="market-type">{item.marketType}</span>
                      <span className="bookmaker">{item.bookmaker}</span>
                    </div>

                    {/* Stake Input for Individual Bets */}
                    {betType === 'straight' && (
                      <div className="stake-input-section">
                        <label className="stake-label">Stake:</label>
                        <input
                          type="number"
                          className="stake-input"
                          value={item.stake || ''}
                          onChange={(e) => handleStakeUpdate(item.id, e.target.value)}
                          min="1"
                          step="1"
                          placeholder="0"
                        />
                        <div className="potential-payout">
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
          <div className="bet-summary">
            <div className="summary-header">
              <h4>Bet Summary</h4>
              <span className="bet-type-badge">{getBetTypeLabel(betType)}</span>
            </div>
            
            {/* Combined Stake Input for Parlay/Teaser/If-Bet */}
            {betType !== 'straight' && (
              <div className="combined-stake-section">
                <label className="stake-label">Total Stake:</label>
                <input
                  type="number"
                  className="combined-stake-input"
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
            
            <div className="summary-rows">
              <div className="summary-row">
                <span>Selections:</span>
                <span className="value">{betSlipItems.length}</span>
              </div>
              
              <div className="summary-row">
                <span>Total Stake:</span>
                <span className="total-stake">{formatCurrency(totalStake)}</span>
              </div>
              
              <div className="summary-row highlight">
                <span>Potential Win:</span>
                <span className="potential-win">{formatCurrency(totalPayout)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bet-actions">
          {betSlipItems.length > 0 ? (
            <>
              <button
                className="place-bet-btn"
                onClick={handlePlaceBet}
                disabled={!canPlaceBet()}
              >
                PLACE BET
              </button>
              <button className="clear-all-btn" onClick={handleClearAll}>
                Clear All
              </button>
            </>
          ) : (
            <button className="clear-all-btn" disabled>
              No Selections
            </button>
          )}
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
                onClick={handleCancelBet}
                disabled={isProcessing}
                aria-label="Close confirmation"
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
              
              <div className="confirmation-actions">
                <button
                  className="confirm-bet-btn"
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
                  className="cancel-bet-btn"
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
    </>
  );
};

export default DesktopBetSlip;