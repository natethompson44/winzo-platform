import React from 'react';
import { formatCurrency } from '../../utils/numberUtils';

interface PayoutDisplayProps {
  totalStake: number;
  totalPayout: number;
  betType: 'straight' | 'parlay' | 'sgp' | 'teaser' | 'if-bet';
  betCount: number;
}

const PayoutDisplay: React.FC<PayoutDisplayProps> = ({
  totalStake,
  totalPayout,
  betType,
  betCount
}) => {
  return (
    <div className="payout-display">
      <div className="payout-header">
        <h4>Bet Summary</h4>
        <span className="bet-type-badge">
          {betType === 'sgp' ? 'SGP' : betType.toUpperCase()}
        </span>
      </div>
      
      <div className="payout-rows">
        <div className="payout-row">
          <span>Selections:</span>
          <span className="value">{betCount}</span>
        </div>
        
        <div className="payout-row">
          <span>Total Stake:</span>
          <span className="value total-stake">{formatCurrency(totalStake)}</span>
        </div>
        
        <div className="payout-row highlight">
          <span>Potential Win:</span>
          <span className="value potential-win">{formatCurrency(totalPayout)}</span>
        </div>
      </div>
    </div>
  );
};

export default PayoutDisplay; 