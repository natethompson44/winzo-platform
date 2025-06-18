import React, { useState } from 'react';
import { useBetSlip } from '../contexts/BetSlipContext';
import { formatCurrency } from '../utils/numberUtils';
import './RightSidebarBetSlip.css';

const RightSidebarBetSlip: React.FC = () => {
  const {
    betSlipItems,
    betType,
    setBetType,
    removeFromBetSlip,
    clearBetSlip,
    totalStake,
    totalPayout,
    canPlaceBet,
    isOpen,
    setIsOpen,
    updateStake
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
      {/* Backdrop */}
      <div className="bet-slip-backdrop" onClick={() => setIsOpen(false)} />
      
      {/* Right Sidebar Bet Slip */}
      <div className="bet-slip-sidebar">
        {/* Header */}
        <div className="bet-slip-header">
          <div className="header-content">
            <h3 className="bet-slip-title">
              <span className="bet-slip-icon">📋</span>
              Bet Slip ({betSlipItems.length})
            </h3>
            <button 
              className="close-button"
              onClick={() => setIsOpen(false)}
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
          
          <div className="bet-type-info">
            <p className="bet-type-description">
              {betTypeOptions.find(opt => opt.id === betType)?.description}
            </p>
            
            {betType === 'teaser' && (
              <div className="teaser-info">
                <small>Teaser bets adjust point spreads in your favor but reduce potential payouts.</small>
              </div>
            )}
            
            {betType === 'if-bet' && (
              <div className="if-bet-info">
                <small>If-bets allow conditional betting where subsequent bets only occur if previous bets win.</small>
              </div>
            )}
            
            {betType === 'parlay' && (
              <div className="parlay-info">
                <small>Parlay bets combine multiple selections for higher potential payouts.</small>
              </div>
            )}
          </div>
        </div>

        {/* Bet Slip Content */}
        <div className="bet-slip-content">
          {betSlipItems.length === 0 ? (
            <div className="empty-bet-slip">
              <div className="empty-icon">📋</div>
              <h4>Your Bet Slip is Empty</h4>
              <p>Select teams and odds from the sports listings to start building your bet.</p>
            </div>
          ) : (
            <div className="bet-items">
              {betSlipItems.map((item, index) => (
                <div key={item.id} className="bet-item">
                  <div className="bet-item-header">
                    <span className="bet-number">{index + 1}</span>
                    <button 
                      className="remove-bet"
                      onClick={() => removeFromBetSlip(item.id)}
                      aria-label={`Remove ${item.selectedTeam} from bet slip`}
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
                  </div>
                  
                  {/* Individual Stake Input for Straight Bets */}
                  {betType === 'straight' && (
                    <div className="stake-input-section">
                      <label className="stake-label">Stake Amount:</label>
                      <input
                        type="number"
                        className="stake-input"
                        value={item.stake}
                        onChange={(e) => {
                          const newStake = parseFloat(e.target.value) || 0;
                          updateStake(item.id, newStake);
                        }}
                        min="1"
                        step="1"
                        placeholder="0"
                      />
                      <div className="potential-payout">
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
          <div className="bet-summary">
            <div className="summary-header">
              <h4>Bet Summary</h4>
              <span className="bet-type-badge">{getBetTypeLabel(betType)}</span>
            </div>
            
            {/* Preset Stake Buttons */}
            <div className="preset-stakes-section">
              <label className="stake-label">Quick Stake:</label>
              <div className="preset-stakes-grid">
                {presetStakes.map((amount) => (
                  <button
                    key={amount}
                    className="preset-stake-btn"
                    onClick={() => handlePresetStake(amount)}
                    title={`Set stake to $${amount}`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Combined Stake Input for Parlay/Teaser/If-Bet */}
            {betType !== 'straight' && (
              <div className="combined-stake-section">
                <label className="stake-label">Total Stake:</label>
                <input
                  type="number"
                  className="combined-stake-input"
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
          <button 
            className="place-bet-btn"
            onClick={handlePlaceBets}
            disabled={!canPlaceBet()}
          >
            Place Bet
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

export default RightSidebarBetSlip; 