import React from 'react';
import { useBetSlip } from '../contexts/BetSlipContext';
import { formatCurrency } from '../utils/numberUtils';
import './BetSlipToggle.css';

const BetSlipToggle: React.FC = () => {
  const { getItemCount, setIsOpen, getTotalStake } = useBetSlip();
  const itemCount = getItemCount();
  const totalStake = getTotalStake();

  if (itemCount === 0) return null;

  return (
    <button className="bet-slip-toggle" onClick={() => setIsOpen(true)}>
      <div className="bet-slip-toggle-content">
        <span className="bet-count-badge">{itemCount}</span>
        <div className="bet-slip-toggle-text">
          <div className="bet-slip-label">Bet Slip</div>
          <div className="bet-slip-total">{formatCurrency(totalStake)}</div>
        </div>
      </div>
    </button>
  );
};

export default BetSlipToggle;
