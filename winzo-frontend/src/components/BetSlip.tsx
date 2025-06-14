import React, { useState, useMemo } from 'react';
import { useBetSlip } from '../contexts/BetSlipContext';
import './BetSlip.css';

const BetSlip: React.FC = () => {
  const {
    betSlipItems,
    betType,
    setBetType,
    removeFromBetSlip,
    clearBetSlip,
    isOpen,
    setIsOpen
  } = useBetSlip();

  const [betAmount, setBetAmount] = useState<string>('10.00');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const totalOdds = useMemo(() => {
    if (betType === 'single') {
      return betSlipItems.length > 0 ? betSlipItems[0].odds : 0;
    } else {
      return betSlipItems.reduce((total, item) => total * item.odds, 1);
    }
  }, [betSlipItems, betType]);

  const potentialWinnings = useMemo(() => {
    const amount = parseFloat(betAmount) || 0;
    return amount * totalOdds - amount;
  }, [betAmount, totalOdds]);

  const formatOdds = (odds: number): string => {
    if (odds > 0) {
      return `+${odds}`;
    }
    return odds.toString();
  };

  const handlePlaceBet = () => {
    if (betSlipItems.length === 0 || !betAmount || parseFloat(betAmount) <= 0) {
      return;
    }
    setShowConfirmation(true);
  };

  const confirmBet = () => {
    const betData = {
      items: betSlipItems,
      betAmount: parseFloat(betAmount),
      betType,
      totalOdds,
      potentialWinnings,
      timestamp: new Date().toISOString()
    };
    // Here you would typically call an API to place the bet
    console.log('Placing bet:', betData);
    setShowConfirmation(false);
    clearBetSlip();
    setBetAmount('10.00');
  };

  const getBetTypeLabel = (type: string) => {
    switch (type) {
      case 'single': return 'Single Bet';
      case 'parlay': return 'Parlay';
      default: return type;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={`bet-slip ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Header */}
      <div className="bet-slip-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-content">
          <h3>Bet Slip</h3>
          <div className="bet-count">
            {betSlipItems.length} {betSlipItems.length === 1 ? 'Selection' : 'Selections'}
          </div>
        </div>
        <div className="expand-icon">
          {isExpanded ? '−' : '+'}
        </div>
      </div>

      {isExpanded && (
        <div className="bet-slip-content">
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
          <div className="bet-items">
            {betSlipItems.length === 0 ? (
              <div className="empty-bet-slip">
                <div className="empty-icon">📋</div>
                <p>No selections yet</p>
                <span>Click on odds to add selections to your bet slip</span>
              </div>
            ) : (
              betSlipItems.map((item, index) => (
                <div key={item.id} className="bet-item">
                  <div className="bet-item-header">
                    <div className="bet-number">#{index + 1}</div>
                    <button
                      className="remove-bet"
                      onClick={() => removeFromBetSlip(item.id)}
                    >
                      ×
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
              ))
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
                <span>Total Odds:</span>
                <span className="total-odds">{formatOdds(totalOdds)}</span>
              </div>
              
              <div className="bet-amount-section">
                <label htmlFor="bet-amount">Bet Amount ($)</label>
                <input
                  id="bet-amount"
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  className="bet-amount-input"
                  placeholder="0.00"
                />
              </div>
              
              <div className="summary-row winnings">
                <span>Potential Winnings:</span>
                <span className="potential-winnings">${potentialWinnings.toFixed(2)}</span>
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
                  disabled={!betAmount || parseFloat(betAmount) <= 0}
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
      )}

      {/* Bet Confirmation Modal */}
      {showConfirmation && (
        <div className="bet-confirmation-overlay">
          <div className="bet-confirmation-modal">
            <div className="modal-header">
              <h3>Confirm Your Bet</h3>
              <button
                className="close-modal"
                onClick={() => setShowConfirmation(false)}
              >
                ×
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
                  <span>Total Odds:</span>
                  <span>{formatOdds(totalOdds)}</span>
                </div>
                <div className="detail-row">
                  <span>Bet Amount:</span>
                  <span>${betAmount}</span>
                </div>
                <div className="detail-row highlight">
                  <span>Potential Winnings:</span>
                  <span>${potentialWinnings.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="confirmation-actions">
                <button
                  className="confirm-bet-btn"
                  onClick={confirmBet}
                >
                  Confirm Bet
                </button>
                <button
                  className="cancel-bet-btn"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BetSlip;

