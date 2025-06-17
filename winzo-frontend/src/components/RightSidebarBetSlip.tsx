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
    setIsOpen
  } = useBetSlip();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
    switch (type) {
      case 'single': return 'Single Bet';
      case 'parlay': return 'Parlay';
      default: return type;
    }
  };

  // Don't render on mobile - let MobileBetSlip handle it
  if (!isOpen || window.innerWidth <= 768) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="right-sidebar-betslip-backdrop" onClick={handleClose} />
      
      {/* Right Sidebar Bet Slip */}
      <div className="right-sidebar-betslip">
        {/* Header */}
        <div className="betslip-header">
          <div className="header-content">
            <h3 className="betslip-title">
              <span className="betslip-icon">📋</span>
              Bet Slip ({betSlipItems.length})
            </h3>
            <button className="close-button" onClick={handleClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Bet Type Selector */}
        <div className="bet-type-selector">
          <div className="bet-type-options">
            <button
              className={`bet-type-btn ${betType === 'single' ? 'active' : ''}`}
              onClick={() => setBetType('single')}
            >
              Single
            </button>
            <button
              className={`bet-type-btn ${betType === 'parlay' ? 'active' : ''}`}
              onClick={() => setBetType('parlay')}
              disabled={betSlipItems.length < 2}
            >
              Parlay
            </button>
          </div>
        </div>

        {/* Bet Items */}
        <div className="betslip-content">
          {betSlipItems.length === 0 ? (
            <div className="empty-betslip">
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
                      <span className="market-type">{getBetTypeLabel(item.marketType)}</span>
                      <span className="bookmaker">{item.bookmaker}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bet Summary */}
        {betSlipItems.length > 0 && (
          <div className="bet-summary">
            <div className="summary-row">
              <span>Bet Type:</span>
              <span className="bet-type-label">{getBetTypeLabel(betType)}</span>
            </div>
            
            <div className="summary-row">
              <span>Total Stake:</span>
              <span className="total-stake">{formatCurrency(totalStake)}</span>
            </div>
            
            <div className="summary-row">
              <span>Potential Win:</span>
              <span className="potential-win">{formatCurrency(totalPayout)}</span>
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
                Place Bet
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