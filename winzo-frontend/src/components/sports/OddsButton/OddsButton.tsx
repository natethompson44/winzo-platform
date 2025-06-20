import React from 'react';

export interface OddsButtonProps {
  odds: number;
  selection: string;
  market: string;
  gameId: string;
  teamId?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  movement?: 'up' | 'down' | null;
  onClick: (bet: {
    gameId: string;
    market: string;
    selection: string;
    odds: number;
    teamId?: string;
  }) => void;
}

export const OddsButton: React.FC<OddsButtonProps> = ({
  odds,
  selection,
  market,
  gameId,
  teamId,
  isSelected = false,
  isDisabled = false,
  movement = null,
  onClick
}) => {
  const formatOdds = (odds: number): string => {
    if (odds > 0) {
      return `+${odds}`;
    }
    return odds.toString();
  };

  const handleClick = () => {
    if (!isDisabled) {
      onClick({
        gameId,
        market,
        selection,
        odds,
        teamId
      });
    }
  };

  return (
    <button
      className={`
        odds-button
        ${isSelected ? 'selected' : ''}
        ${movement === 'up' ? 'odds-up' : ''}
        ${movement === 'down' ? 'odds-down' : ''}
      `.trim()}
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={`Bet on ${selection} at ${formatOdds(odds)} odds`}
    >
      <div className="odds-selection">
        {selection}
      </div>
      <div className="odds-value">
        {formatOdds(odds)}
        {movement && (
          <span className={`odds-movement ${movement}`} aria-hidden="true">
            {movement === 'up' ? '▲' : '▼'}
          </span>
        )}
      </div>
    </button>
  );
};

export default OddsButton; 