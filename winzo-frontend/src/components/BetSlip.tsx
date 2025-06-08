import React, { useState } from 'react';
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

interface BetSlipProps {
  isOpen: boolean;
  onClose: () => void;
  bets: BetSlipItem[];
  onRemoveBet: (betId: string) => void;
  onClearAll: () => void;
  onPlaceBets: (bets: BetSlipItem[], amounts: { [key: string]: number }) => void;
  walletBalance: number;
}

/**
 * BetSlip Component - Interactive betting interface
 * 
 * Handles bet selection, stake input, and bet placement with WINZO energy.
 * Provides real-time payout calculations and wallet balance validation.
 */
const BetSlip: React.FC<BetSlipProps> = ({
  isOpen,
  onClose,
  bets,
  onRemoveBet,
  onClearAll,
  onPlaceBets,
  walletBalance
}) => {
  const [betAmounts, setBetAmounts] = useState<{ [key: string]: number }>({});
  const [isPlacing, setIsPlacing] = useState(false);

  const handleAmountChange = (betId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    setBetAmounts(prev => ({
      ...prev,
      [betId]: numAmount
    }));
  };

  const calculatePayout = (betId: string): number => {
    const bet = bets.find(b => b.id === betId);
    const amount = betAmounts[betId] || 0;
    if (!bet || !amount) return 0;
    return amount * bet.decimalOdds;
  };

  const calculateTotalStake = (): number => {
    return Object.values(betAmounts).reduce((sum, amount) => sum + (amount || 0), 0);
  };

  const calculateTotalPayout = (): number => {
    return bets.reduce((sum, bet) => {
      const amount = betAmounts[bet.id] || 0;
      return sum + (amount * bet.decimalOdds);
    }, 0);
  };

  const calculateTotalProfit = (): number => {
    return calculateTotalPayout() - calculateTotalStake();
  };

  const canPlaceBets = (): boolean => {
    const totalStake = calculateTotalStake();
    const hasValidAmounts = bets.every(bet => {
      const amount = betAmounts[bet.id] || 0;
      return amount >= 1; // Minimum $1 bet
    });
    return totalStake > 0 && totalStake <= walletBalance && hasValidAmounts && bets.length > 0;
  };

  const handlePlaceBets = async () => {
    if (!canPlaceBets()) return;

    setIsPlacing(true);
    try {
      await onPlaceBets(bets, betAmounts);
      // Clear bet slip after successful placement
      setBetAmounts({});
      onClearAll();
    } catch (error) {
      console.error('Error placing bets:', error);
    } finally {
      setIsPlacing(false);
    }
  };

  const getQuickBetAmounts = (balance: number): number[] => {
    if (balance >= 100) return [5, 10, 25, 50];
    if (balance >= 50) return [2, 5, 10, 20];
    if (balance >= 20) return [1, 2, 5, 10];
    return [1, 2, 5];
  };

  if (!isOpen) return null;

  return (
    <div className="bet-slip-overlay">
      <div className="bet-slip">
        <div className="bet-slip-header">
          <h3>🎯 Bet Slip</h3>
          <div className="bet-slip-controls">
            {bets.length > 0 && (
              <button onClick={onClearAll} className="clear-all-btn">
                Clear All
              </button>
            )}
            <button onClick={onClose} className="close-btn">
              ✕
            </button>
          </div>
        </div>

        <div className="bet-slip-content">
          {bets.length === 0 ? (
            <div className="empty-bet-slip">
              <div className="empty-icon">🎲</div>
              <h4>Your Bet Slip is Empty</h4>
              <p>Click on odds to add bets and activate your Big Win Energy!</p>
            </div>
          ) : (
            <>
              <div className="wallet-info">
                <div className="wallet-balance">
                  💰 WINZO Wallet: <strong>${walletBalance.toFixed(2)}</strong>
                </div>
              </div>

              <div className="bet-list">
                {bets.map((bet) => (
                  <div key={bet.id} className="bet-item">
                    <div className="bet-header">
                      <div className="bet-event">
                        <span className="sport-badge">{bet.sport}</span>
                        <span className="event-name">{bet.event}</span>
                      </div>
                      <button 
                        onClick={() => onRemoveBet(bet.id)}
                        className="remove-bet-btn"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="bet-details">
                      <div className="bet-selection">
                        <span className="market">{bet.market}:</span>
                        <span className="outcome">{bet.outcome}</span>
                        <span className="odds">{bet.odds}</span>
                      </div>

                      <div className="bet-amount-section">
                        <label>Stake Amount:</label>
                        <div className="amount-input-group">
                          <span className="currency">$</span>
                          <input
                            type="number"
                            min="1"
                            max={walletBalance}
                            step="0.01"
                            value={betAmounts[bet.id] || ''}
                            onChange={(e) => handleAmountChange(bet.id, e.target.value)}
                            placeholder="0.00"
                            className="amount-input"
                          />
                        </div>

                        <div className="quick-amounts">
                          {getQuickBetAmounts(walletBalance).map(amount => (
                            <button
                              key={amount}
                              onClick={() => handleAmountChange(bet.id, amount.toString())}
                              className="quick-amount-btn"
                              disabled={amount > walletBalance}
                            >
                              ${amount}
                            </button>
                          ))}
                        </div>

                        {betAmounts[bet.id] && (
                          <div className="payout-preview">
                            <div className="payout-line">
                              <span>Potential Payout:</span>
                              <span className="payout-amount">
                                ${calculatePayout(bet.id).toFixed(2)}
                              </span>
                            </div>
                            <div className="profit-line">
                              <span>Potential Profit:</span>
                              <span className="profit-amount">
                                ${(calculatePayout(bet.id) - (betAmounts[bet.id] || 0)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bet-slip-summary">
                <div className="summary-line">
                  <span>Total Stake:</span>
                  <span className="total-stake">${calculateTotalStake().toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>Total Potential Payout:</span>
                  <span className="total-payout">${calculateTotalPayout().toFixed(2)}</span>
                </div>
                <div className="summary-line profit-line">
                  <span>Total Potential Profit:</span>
                  <span className="total-profit">${calculateTotalProfit().toFixed(2)}</span>
                </div>
              </div>

              <div className="bet-slip-actions">
                {calculateTotalStake() > walletBalance && (
                  <div className="insufficient-funds-warning">
                    ⚠️ Insufficient funds. Add money to your WINZO Wallet!
                  </div>
                )}

                <button
                  onClick={handlePlaceBets}
                  disabled={!canPlaceBets() || isPlacing}
                  className={`place-bets-btn ${canPlaceBets() ? 'ready' : 'disabled'}`}
                >
                  {isPlacing ? (
                    <>
                      <span className="loading-spinner">⏳</span>
                      Placing Bets...
                    </>
                  ) : (
                    <>
                      🚀 Place {bets.length} Bet{bets.length > 1 ? 's' : ''}
                      {calculateTotalStake() > 0 && (
                        <span className="stake-amount">
                          (${calculateTotalStake().toFixed(2)})
                        </span>
                      )}
                    </>
                  )}
                </button>

                {!canPlaceBets() && bets.length > 0 && calculateTotalStake() <= walletBalance && (
                  <div className="bet-requirements">
                    💡 Minimum $1 per bet required
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BetSlip;

