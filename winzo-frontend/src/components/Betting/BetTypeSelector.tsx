import React from 'react';
import './BetTypeSelector.css';

interface BetTypeSelectorProps {
  selectedType: 'straight' | 'parlay' | 'teaser' | 'if-bet';
  onTypeChange: (type: 'straight' | 'parlay' | 'teaser' | 'if-bet') => void;
}

const BetTypeSelector: React.FC<BetTypeSelectorProps> = ({ 
  selectedType, 
  onTypeChange 
}) => {
  const betTypes = [
    { id: 'straight' as const, label: 'Straight', description: 'Single bet on one selection' },
    { id: 'parlay' as const, label: 'Parlay', description: 'Multiple selections combined' },
    { id: 'teaser' as const, label: 'Teaser', description: 'Adjusted point spreads' },
    { id: 'if-bet' as const, label: 'If Bet', description: 'Conditional betting' }
  ];

  return (
    <div className="bet-type-selector">
      <div className="bet-type-selector__header">
        <h3>Bet Type</h3>
        <p>Choose how you want to place your bets</p>
      </div>
      
      <div className="bet-type-selector__options">
        {betTypes.map((betType) => (
          <button
            key={betType.id}
            className={`bet-type-option ${
              selectedType === betType.id ? 'bet-type-option--active' : ''
            }`}
            onClick={() => onTypeChange(betType.id)}
            aria-pressed={selectedType === betType.id}
          >
            <div className="bet-type-option__content">
              <span className="bet-type-option__label">{betType.label}</span>
              <span className="bet-type-option__description">{betType.description}</span>
            </div>
          </button>
        ))}
      </div>
      
      {selectedType === 'parlay' && (
        <div className="bet-type-info">
          <p><strong>Parlay Betting:</strong> All selections must win for the bet to pay out. Higher risk, higher reward!</p>
        </div>
      )}
      
      {selectedType === 'teaser' && (
        <div className="bet-type-info">
          <p><strong>Teaser Betting:</strong> Adjust point spreads in your favor. All selections must still win.</p>
        </div>
      )}
      
      {selectedType === 'if-bet' && (
        <div className="bet-type-info">
          <p><strong>If Betting:</strong> Your second bet only processes if your first bet wins.</p>
        </div>
      )}
    </div>
  );
};

export default BetTypeSelector;