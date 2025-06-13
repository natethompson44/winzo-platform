import React, { useState } from 'react';
import { formatCurrency } from '../utils/numberUtils';
import './BetSlip.css';

interface BetSlipItem {
  id: string;
  eventId: string;
  oddsId: string;
  event: string;
  market: string;
  outcome: string;
  odds: string;
  decimalOdds: number;
  sport: string;
}

interface EnhancedBetSlipProps {
  isOpen: boolean;
  onClose: () => void;
  bets: BetSlipItem[];
  onRemoveBet: (betId: string) => void;
  onClearAll: () => void;
  onPlaceBets: (bets: BetSlipItem[], amounts: { [key: string]: number }) => Promise<void>;
  walletBalance: number;
}

const EnhancedBetSlip: React.FC<EnhancedBetSlipProps> = ({
  isOpen,
  onClose,
  bets,
  onRemoveBet,
  onClearAll,
  onPlaceBets,
  walletBalance
}) => {
  const [betAmounts, setBetAmounts] = useState<{ [key: string]: number }>({});
  const [isPlacingBets, setIsPlacingBets] = useState(false);
  const [error, setError] = useState<string>('');

  const formatOdds = (odds: string): string => {
    const numOdds = parseFloat(odds);
    return numOdds > 0 ? `+${odds}` : odds;
  };

  const handleAmountChange = (betId: string, value: string) => {
    const amount = parseFloat(value) || 0;
    setBetAmounts(prev => ({
      ...prev,
      [betId]: amount
    }));
  };

  const getTotalStake = (): number => {
    return Object.values(betAmounts).reduce((sum, amount) => sum + amount, 0);
  };

  const canPlaceBets = (): boolean => {
    return bets.length > 0 && getTotalStake() > 0 && getTotalStake() <= walletBalance;
  };

  const handlePlaceBets = async () => {
    if (!canPlaceBets()) return;
    
    setIsPlacingBets(true);
    setError('');
    
    try {
      await onPlaceBets(bets, betAmounts);
      setBetAmounts({});
      onClose();
    } catch (err) {
      setError('Failed to place bets. Please try again.');
    } finally {
      setIsPlacingBets(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bet-slip-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bet-slip-container">
        <div className="bet-slip-header">
          <h2>Bet Slip</h2>
          <div className="bet-slip-controls">
            <span className="bet-count">{bets.length} bet{bets.length !== 1 ? 's' : ''}</span>
            <button className="close-button" onClick={onClose}>✕</button>
          </div>
        </div>
        
        {bets.length === 0 ? (
          <div className="empty-bet-slip">
            <div className="empty-icon">🎲</div>
            <h3>Your bet slip is empty</h3>
            <p>Click on odds to add bets and start winning!</p>
          </div>
        ) : (
          <>
            <div className="bet-slip-items">
              {bets.map(bet => (
                <div key={bet.id} className="bet-slip-item">
                  <div className="bet-header">
                    <div className="teams">
                      <span className="matchup">{bet.event}</span>
                      <span className="sport">{bet.sport.toUpperCase()}</span>
                    </div>
                    <button className="remove-bet" onClick={() => onRemoveBet(bet.id)}>✕</button>
                  </div>
                  <div className="bet-details">
                    <div className="selection">
                      <span className="selected-team">{bet.outcome}</span>
                      <span className="odds">{formatOdds(bet.odds)}</span>
                    </div>
                    <div className="market">{bet.market}</div>
                    <div className="stake-section">
                      <label>Stake:</label>
                      <div className="stake-input-group">
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          step="1"
                          value={betAmounts[bet.id] || ''}
                          onChange={e => handleAmountChange(bet.id, e.target.value)}
                          className="stake-input"
                          placeholder="Enter amount"
                        />
                        <div className="quick-stakes">
                          {[5, 10, 25, 50].map(amount => (
                            <button
                              key={amount}
                              className="quick-stake-button"
                              onClick={() => handleAmountChange(bet.id, amount.toString())}
                            >
                              ${amount}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    {betAmounts[bet.id] && (
                      <div className="payout-info">
                        <span>Potential Payout: {formatCurrency(betAmounts[bet.id] * bet.decimalOdds)}</span>
                        <span>Profit: {formatCurrency((betAmounts[bet.id] * bet.decimalOdds) - betAmounts[bet.id])}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {error && (
              <div className="bet-error">
                <span>{error}</span>
                <button onClick={() => setError('')}>✕</button>
              </div>
            )}
            
            <div className="bet-slip-summary">
              <div className="summary-row">
                <span>Total Stake:</span>
                <span className="amount">{formatCurrency(getTotalStake())}</span>
              </div>
              <div className="summary-row">
                <span>Wallet Balance:</span>
                <span className="amount">{formatCurrency(walletBalance)}</span>
              </div>
              {getTotalStake() > walletBalance && (
                <div className="summary-row error">
                  <span>Insufficient Funds</span>
                </div>
              )}
            </div>
            
            <div className="bet-slip-actions">
              <button className="clear-button" onClick={onClearAll}>
                Clear All
              </button>
              <button
                className={`place-bet-button ${!canPlaceBets() ? 'insufficient-funds' : ''}`}
                onClick={handlePlaceBets}
                disabled={!canPlaceBets() || isPlacingBets}
              >
                {isPlacingBets ? (
                  <>
                    <span className="loading-spinner-small"></span>
                    Placing...
                  </>
                ) : getTotalStake() > walletBalance ? (
                  'Insufficient Funds'
                ) : (
                  `Place ${bets.length > 1 ? 'Bets' : 'Bet'}`
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedBetSlip; 