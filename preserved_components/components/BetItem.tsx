import React from 'react';
import { BetSlipItem } from '../../contexts/BetSlipContext';
import { formatCurrency } from '../../utils/numberUtils';

interface BetItemProps {
  bet: BetSlipItem;
  index: number;
  onRemove: () => void;
  onUpdateStake: (stake: number) => void;
  formatOdds: (odds: number) => string;
}

const BetItem: React.FC<BetItemProps> = ({
  bet,
  index,
  onRemove,
  onUpdateStake,
  formatOdds
}) => {
  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    onUpdateStake(value);
  };

  return (
    <div className="bet-item">
      <div className="bet-item-header">
        <span className="bet-number">{index + 1}</span>
        <button 
          className="remove-bet"
          onClick={onRemove}
          aria-label={`Remove ${bet.selectedTeam} from bet slip`}
        >
          ✕
        </button>
      </div>
      
      <div className="bet-details">
        <div className="teams">
          <span className="team">{bet.homeTeam}</span>
          <span className="vs">vs</span>
          <span className="team">{bet.awayTeam}</span>
        </div>
        
        <div className="selection">
          <span className="selected-team">{bet.selectedTeam}</span>
          <span className="odds">{formatOdds(bet.odds)}</span>
        </div>
        
        <div className="market-info">
          <span className="market-type">{bet.marketType}</span>
          <span className="bookmaker">{bet.bookmaker}</span>
        </div>
      </div>
      
      {/* Individual Stake Input */}
      <div className="stake-input-section">
        <label className="stake-label">Stake</label>
        <input
          type="number"
          className="stake-input"
          value={bet.stake}
          onChange={handleStakeChange}
          min="0"
          step="0.01"
          placeholder="0.00"
        />
        <div className="potential-payout">
          Win: {formatCurrency(bet.potentialPayout)}
        </div>
      </div>
    </div>
  );
};

export default BetItem; 