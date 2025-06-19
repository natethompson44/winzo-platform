import React, { useState } from 'react';
import { BetSlipItem } from '../../contexts/BetSlipContext';

interface StakeInputProps {
  betType: 'straight' | 'parlay' | 'sgp' | 'teaser' | 'if-bet';
  betSlipItems: BetSlipItem[];
  onUpdateStake: (id: string, stake: number) => void;
}

const StakeInput: React.FC<StakeInputProps> = ({
  betType,
  betSlipItems,
  onUpdateStake
}) => {
  const [combinedStake, setCombinedStake] = useState(10);

  // Preset stake amounts for quick selection
  const presetStakes = [5, 10, 25, 50, 100, 250];

  const handleQuickStake = (amount: number) => {
    if (betType === 'straight') {
      // For straight bets, set individual stakes
      betSlipItems.forEach(item => {
        onUpdateStake(item.id, amount);
      });
    } else {
      // For parlay/sgp/teaser/if-bet, set combined stake
      setCombinedStake(amount);
      const stakePerBet = amount / betSlipItems.length;
      betSlipItems.forEach(item => {
        onUpdateStake(item.id, stakePerBet);
      });
    }
  };

  const handleCombinedStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setCombinedStake(value);
    
    if (betType !== 'straight') {
      const stakePerBet = value / betSlipItems.length;
      betSlipItems.forEach(item => {
        onUpdateStake(item.id, stakePerBet);
      });
    }
  };

  return (
    <div className="stake-input-container">
      {/* Quick Stake Buttons */}
      <div className="preset-stakes-section">
        <h5 className="preset-stakes-title">Quick Stakes</h5>
        <div className="preset-stakes-grid">
          {presetStakes.map((amount) => (
            <button
              key={amount}
              className="preset-stake-btn"
              onClick={() => handleQuickStake(amount)}
            >
              ${amount}
            </button>
          ))}
        </div>
      </div>

      {/* Combined Stake Input for Parlay/SGP/Teaser/If-Bet */}
      {betType !== 'straight' && betSlipItems.length > 1 && (
        <div className="combined-stake-section">
          <label className="combined-stake-label">Total Stake</label>
          <input
            type="number"
            className="combined-stake-input"
            value={combinedStake}
            onChange={handleCombinedStakeChange}
            min="0"
            step="0.01"
            placeholder="0.00"
          />
          <div className="stake-per-bet">
            ${(combinedStake / betSlipItems.length).toFixed(2)} per bet
          </div>
        </div>
      )}
    </div>
  );
};

export default StakeInput; 