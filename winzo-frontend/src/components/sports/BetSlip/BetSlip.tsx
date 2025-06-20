import React, { useState, useEffect, useMemo } from 'react';

export interface BetSlipItem {
  id: string;
  gameId: string;
  market: string;
  selection: string;
  odds: number;
  teamId?: string;
  stake: number;
  gameInfo?: {
    homeTeam: string;
    awayTeam: string;
    startTime: string;
    league: string;
  };
}

export interface BetSlipProps {
  bets: BetSlipItem[];
  isOpen?: boolean;
  onRemoveBet: (betId: string) => void;
  onUpdateStake: (betId: string, stake: number) => void;
  onPlaceBets: (bets: BetSlipItem[]) => Promise<void>;
  onClearAll: () => void;
  onToggle?: () => void;
  className?: string;
}

export const BetSlip: React.FC<BetSlipProps> = ({
  bets,
  isOpen = true,
  onRemoveBet,
  onUpdateStake,
  onPlaceBets,
  onClearAll,
  onToggle,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [stakeInputs, setStakeInputs] = useState<Record<string, string>>({});

  // Sync stake inputs with bet stakes
  useEffect(() => {
    const newStakeInputs: Record<string, string> = {};
    bets.forEach(bet => {
      newStakeInputs[bet.id] = bet.stake > 0 ? bet.stake.toString() : '';
    });
    setStakeInputs(newStakeInputs);
  }, [bets]);

  const calculations = useMemo(() => {
    const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
    const totalPayout = bets.reduce((sum, bet) => {
      if (bet.stake > 0) {
        const americanOdds = bet.odds;
        let payout = 0;
        
        if (americanOdds > 0) {
          // Positive odds: payout = stake * (odds / 100)
          payout = bet.stake * (americanOdds / 100);
        } else {
          // Negative odds: payout = stake / (abs(odds) / 100)
          payout = bet.stake / (Math.abs(americanOdds) / 100);
        }
        
        return sum + bet.stake + payout;
      }
      return sum;
    }, 0);

    const totalProfit = totalPayout - totalStake;

    return {
      totalStake: Math.round(totalStake * 100) / 100,
      totalPayout: Math.round(totalPayout * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100
    };
  }, [bets]);

  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };

  const calculatePotentialWin = (stake: number, odds: number): number => {
    if (stake <= 0) return 0;
    
    if (odds > 0) {
      return stake * (odds / 100);
    } else {
      return stake / (Math.abs(odds) / 100);
    }
  };

  const handleStakeChange = (betId: string, value: string) => {
    // Update local input state immediately for responsiveness
    setStakeInputs(prev => ({ ...prev, [betId]: value }));
    
    // Parse and validate the stake value
    const numericValue = parseFloat(value) || 0;
    const validatedStake = Math.max(0, Math.min(numericValue, 10000)); // Max $10,000 bet
    
    // Update the actual bet stake
    onUpdateStake(betId, validatedStake);
  };

  const handlePlaceBets = async () => {
    if (bets.length === 0 || calculations.totalStake === 0) return;
    
    setIsLoading(true);
    try {
      await onPlaceBets(bets);
    } catch (error) {
      console.error('Failed to place bets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canPlaceBets = bets.length > 0 && calculations.totalStake > 0 && !isLoading;

  if (bets.length === 0) {
    return (
      <div className={`bet-slip ${isOpen ? 'open' : ''} ${className}`.trim()}>
        <div className="bet-slip-header">
          <h3 className="title">Bet Slip</h3>
          {onToggle && (
            <button 
              className="btn btn-ghost btn-sm mobile-close"
              onClick={onToggle}
              aria-label="Close bet slip"
            >
              ✕
            </button>
          )}
        </div>
        <div className="bet-slip-empty">
          <div className="empty-icon">🎯</div>
          <p>Click on odds to add bets to your slip</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bet-slip ${isOpen ? 'open' : ''} ${className}`.trim()}>
      {/* Header */}
      <div className="bet-slip-header">
        <h3 className="title">Bet Slip</h3>
        <div className="header-actions">
          <span className="count">{bets.length}</span>
          {onToggle && (
            <button 
              className="btn btn-ghost btn-sm mobile-close"
              onClick={onToggle}
              aria-label="Close bet slip"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bet-slip-content">
        {bets.map((bet) => (
          <div key={bet.id} className="bet-slip-item">
            <div className="bet-header">
              <div className="bet-details">
                <div className="game">
                  {bet.gameInfo ? 
                    `${bet.gameInfo.awayTeam} @ ${bet.gameInfo.homeTeam}` : 
                    `Game ${bet.gameId}`
                  }
                </div>
                <div className="selection">
                  {bet.market}: {bet.selection}
                </div>
                <div className="odds">{formatOdds(bet.odds)}</div>
              </div>
              <button
                className="remove-btn"
                onClick={() => onRemoveBet(bet.id)}
                aria-label="Remove bet"
              >
                ✕
              </button>
            </div>

            <div className="bet-input">
              <div className="stake-input-group">
                <label htmlFor={`stake-${bet.id}`} className="sr-only">
                  Stake amount for {bet.selection}
                </label>
                <div className="input-addon">$</div>
                <input
                  id={`stake-${bet.id}`}
                  type="number"
                  className="stake-input form-input"
                  placeholder="0.00"
                  value={stakeInputs[bet.id] || ''}
                  onChange={(e) => handleStakeChange(bet.id, e.target.value)}
                  min="0"
                  max="10000"
                  step="0.01"
                />
              </div>
              
              {bet.stake > 0 && (
                <div className="potential-win">
                  To Win: <span className="amount">
                    ${calculatePotentialWin(bet.stake, bet.odds).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="bet-slip-footer">
        <div className="bet-summary">
          <div className="total-stake">
            Total Stake: <span className="amount">${calculations.totalStake.toFixed(2)}</span>
          </div>
          {calculations.totalStake > 0 && (
            <div className="potential-payout">
              Potential Payout: <span className="amount">${calculations.totalPayout.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="bet-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={onClearAll}
            disabled={isLoading}
          >
            Clear All
          </button>
          <button
            className="place-bet-btn btn btn-accent btn-lg btn-full"
            onClick={handlePlaceBets}
            disabled={!canPlaceBets}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Placing Bets...
              </>
            ) : (
              `Place Bet${bets.length > 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetSlip; 