import React from 'react';
import { ValidationResult } from '../../utils/bettingRules';
import './ValidationDisplay.css';

interface ValidationDisplayProps {
  validationResult: ValidationResult;
  betType: string;
  className?: string;
}

const ValidationDisplay: React.FC<ValidationDisplayProps> = ({
  validationResult,
  betType,
  className = ''
}) => {
  if (validationResult.isValid && validationResult.warnings.length === 0) {
    return null;
  }

  return (
    <div className={`validation-display ${className}`}>
      {/* Errors */}
      {validationResult.errors.length > 0 && (
        <div className="validation-section errors">
          <div className="validation-header">
            <span className="validation-icon error">⚠️</span>
            <span className="validation-title">Betting Rules Violations</span>
          </div>
          <div className="validation-list">
            {validationResult.errors.map((error, index) => (
              <div key={index} className="validation-item error">
                <span className="validation-bullet">•</span>
                <span className="validation-text">{error}</span>
              </div>
            ))}
          </div>
          <div className="validation-help">
            <span className="help-text">
              Fix these issues to place your {betType} bet
            </span>
          </div>
        </div>
      )}

      {/* Warnings */}
      {validationResult.warnings.length > 0 && (
        <div className="validation-section warnings">
          <div className="validation-header">
            <span className="validation-icon warning">ℹ️</span>
            <span className="validation-title">Information</span>
          </div>
          <div className="validation-list">
            {validationResult.warnings.map((warning, index) => (
              <div key={index} className="validation-item warning">
                <span className="validation-bullet">•</span>
                <span className="validation-text">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bet Type Specific Help */}
      <BetTypeHelp betType={betType} hasErrors={validationResult.errors.length > 0} />
    </div>
  );
};

interface BetTypeHelpProps {
  betType: string;
  hasErrors: boolean;
}

const BetTypeHelp: React.FC<BetTypeHelpProps> = ({ betType, hasErrors }) => {
  if (!hasErrors) return null;

  const helpText = getBetTypeHelpText(betType);
  if (!helpText) return null;

  return (
    <div className="bet-type-help">
      <div className="help-header">
        <span className="help-icon">💡</span>
        <span className="help-title">{betType.toUpperCase()} Rules</span>
      </div>
      <div className="help-content">
        {helpText.map((rule, index) => (
          <div key={index} className="help-rule">
            <span className="rule-bullet">•</span>
            <span className="rule-text">{rule}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

function getBetTypeHelpText(betType: string): string[] | null {
  const helpTexts: Record<string, string[]> = {
    'straight': [
      'Single bet on one selection only',
      'All market types allowed (ML, Spread, Totals, Props)'
    ],
    'parlay': [
      'Requires 2+ selections from different games',
      'Cannot combine both team MLs in same game',
      'Cannot mix ML + Spread for same team',
      'No player props with team markets in same game'
    ],
    'sgp': [
      'All selections must be from the same game',
      'Cannot combine ML + Spread for same team',
      'Cannot combine Over + Under same total',
      'Allows mixing of team markets and player props'
    ],
    'teaser': [
      'Requires 2+ selections from different games',
      'Only Spreads and Totals allowed',
      'Only NFL, NBA, and NCAAF supported',
      'Choose your point adjustment (6, 6.5, or 7 pts)'
    ],
    'if-bet': [
      'Sequential betting - next bet only if previous wins',
      'Requires 2-4 selections',
      'All stakes should be equal',
      'Only ML, Spreads, and Totals allowed'
    ]
  };

  return helpTexts[betType] || null;
}

export default ValidationDisplay; 