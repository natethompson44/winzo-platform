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
  size?: 'sm' | 'md' | 'lg';
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
  size = 'md',
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

  // Build classes using design system button classes
  const baseClasses = 'btn odds-button';
  const variantClass = isSelected ? 'btn-accent' : 'btn-secondary';
  const sizeClass = `btn-${size}`;
  const movementClass = movement ? `odds-movement-${movement}` : '';
  const stateClasses = isDisabled ? 'disabled' : '';

  const buttonClasses = [
    baseClasses,
    variantClass,
    sizeClass,
    movementClass,
    stateClasses
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={`Bet on ${selection} at ${formatOdds(odds)} odds`}
    >
      <div className="odds-content">
        <div className="odds-selection text-sm font-medium">
          {selection}
        </div>
        <div className="odds-value font-mono font-semibold">
          {formatOdds(odds)}
          {movement && (
            <span className={`odds-indicator ${movement}`} aria-hidden="true">
              {movement === 'up' ? '▲' : '▼'}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default OddsButton; 