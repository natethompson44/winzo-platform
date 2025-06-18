import React, { useState } from 'react';
import { useBetSlip } from '../contexts/BetSlipContext';
import { formatCurrency } from '../utils/numberUtils';
import './BetSlipToggle.css';

const BetSlipToggle: React.FC = () => {
  const { getItemCount, setIsOpen, getTotalStake, betSlipItems, totalPayout } = useBetSlip();
  const [isExpanded, setIsExpanded] = useState(false);
  const itemCount = getItemCount();
  const totalStake = getTotalStake();

  if (itemCount === 0) return null;

  // Get preview of first few bets
  const previewBets = betSlipItems.slice(0, 2);
  const remainingCount = itemCount - 2;

  const formatOdds = (odds: number): string => {
    if (odds > 0) {
      return `+${odds}`;
    }
    return odds.toString();
  };

  return (
    <div 
      className="bet-slip-toggle-container"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Enhanced Floating Button */}
      <button 
        className="bet-slip-toggle" 
        onClick={() => setIsOpen(true)}
        aria-label={`Open bet slip with ${itemCount} selections`}
      >
        <div className="bet-slip-toggle-content">
          <span className="bet-count-badge">{itemCount}</span>
          <div className="bet-slip-toggle-text">
            <div className="bet-slip-label">Bet Slip</div>
            <div className="bet-slip-total">{formatCurrency(totalStake)}</div>
          </div>
          <div className="bet-slip-toggle-arrow">›</div>
        </div>
      </button>

      {/* Enhanced Preview Panel */}
      {isExpanded && (
        <div className="bet-slip-preview-panel">
          <div className="preview-header">
            <h4>Bet Preview</h4>
            <span className="preview-count">{itemCount} selections</span>
          </div>
          
          <div className="preview-bets">
            {previewBets.map((bet, index) => (
              <div key={bet.id} className="preview-bet-item">
                <div className="preview-teams">
                  <span className="preview-team">{bet.homeTeam}</span>
                  <span className="preview-vs">vs</span>
                  <span className="preview-team">{bet.awayTeam}</span>
                </div>
                <div className="preview-selection">
                  <span className="preview-selected-team">{bet.selectedTeam}</span>
                  <span className="preview-odds">{formatOdds(bet.odds)}</span>
                </div>
              </div>
            ))}
            
            {remainingCount > 0 && (
              <div className="preview-remaining">
                +{remainingCount} more selection{remainingCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          <div className="preview-summary">
            <div className="preview-row">
              <span>Total Stake:</span>
              <span className="preview-stake">{formatCurrency(totalStake)}</span>
            </div>
            <div className="preview-row highlight">
              <span>Potential Win:</span>
              <span className="preview-payout">{formatCurrency(totalPayout)}</span>
            </div>
          </div>
          
          <button 
            className="preview-open-btn"
            onClick={() => setIsOpen(true)}
          >
            Open Bet Slip
          </button>
        </div>
      )}
    </div>
  );
};

export default BetSlipToggle;
