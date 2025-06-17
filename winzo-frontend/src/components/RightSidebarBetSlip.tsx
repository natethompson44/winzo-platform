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
    updateStake,
    addToBetSlip
  } = useBetSlip();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const betTypeOptions = [
    { id: 'straight' as const, label: 'Straight', description: 'Single bet on one selection' },
    { id: 'parlay' as const, label: 'Parlay', description: 'Multiple selections combined', minSelections: 2 },
    { id: 'teaser' as const, label: 'Teaser', description: 'Adjusted point spreads', minSelections: 2 },
    { id: 'if-bet' as const, label: 'If Bet', description: 'Conditional betting', minSelections: 2 }
  ];

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
      
      // Show success notification
      // You can integrate with your notification system here
      
    } catch (error) {
      console.error('Failed to place bet:', error);
      // Show error notification
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelBet = () => {
    setShowConfirmation(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const getBetTypeLabel = (type: string) => {
    const option = betTypeOptions.find(opt => opt.id === type);
    return option ? option.label : type;
  };

  const getBetTypeDescription = (type: string) => {
    const option = betTypeOptions.find(opt => opt.id === type);
    return option ? option.description : '';
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

  // TEMPORARY: Add test bet function for debugging
  const addTestBet = () => {
    const testBet = {
      eventId: `test-${Date.now()}`,
      sport: 'basketball',
      homeTeam: 'Lakers',
      awayTeam: 'Warriors',
      selectedTeam: 'Lakers -3.5',
      odds: -110,
      bookmaker: 'WINZO',
      marketType: 'spread' as const,
      commenceTime: new Date().toISOString()
    };
    addToBetSlip(testBet);
  };

  // Only render on desktop (mobile uses MobileBetSlip)
  if (window.innerWidth <= 768) {
    return null;
  }

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
            <button className="close-button" onClick={handleClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Bet Types Section (Moved from top of page) */}
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
          
          {/* TEMPORARY DEBUG SECTION - REMOVE IN PRODUCTION */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(255,0,0,0.1)', borderRadius: '4px' }}>
              <small style={{ color: '#ff6b6b', fontWeight: '600' }}>DEBUG MODE</small>
              <br />
              <small style={{ color: '#94a3b8' }}>Items: {betSlipItems.length} | isOpen: {isOpen.toString()}</small>
              <br />
              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                <button 
                  style={{ 
                    padding: '4px 8px', 
                    background: '#10b981', 
                    border: 'none', 
                    borderRadius: '4px', 
                    color: 'white', 
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                  onClick={addTestBet}
                >
                  Add Test Bet
                </button>
                <button 
                  style={{ 
                    padding: '4px 8px', 
                    background: '#3b82f6', 
                    border: 'none', 
                    borderRadius: '4px', 
                    color: 'white', 
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  Toggle Open
                </button>
                <button 
                  style={{ 
                    padding: '4px 8px', 
                    background: '#ef4444', 
                    border: 'none', 
                    borderRadius: '4px', 
                    color: 'white', 
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                  onClick={clearBetSlip}
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
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
                      onClick={() => removeFromBetSlip(item.id)}
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
                          value={item.stake}
                          onChange={(e) => handleStakeUpdate(item.id, e.target.value)}
                          min="1"
                          step="1"
                          placeholder="0"
                        />
                        <div className="potential-payout">
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
          {betSlipItems.length > 0 ? (
            <>
              <button
                className="place-bet-btn"
                onClick={handlePlaceBets}
                disabled={!canPlaceBet()}
              >
                PLACE BET
              </button>
              <button className="clear-all-btn" onClick={clearBetSlip}>
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
                onClick={cancelBet}
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
              
              <div className="confirmation-actions">
                <button
                  className="confirm-bet-btn"
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
                  className="cancel-bet-btn"
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
    </>
  );
};

export default RightSidebarBetSlip; 