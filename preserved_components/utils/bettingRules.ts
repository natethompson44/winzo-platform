export interface BetSelection {
  id: string;
  eventId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  selectedTeam: string;
  odds: number;
  marketType: 'h2h' | 'spreads' | 'totals' | 'player_props' | 'team_props';
  point?: number;
  stake: number;
  bookmaker: string;
  commenceTime: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  compatibleSelections?: BetSelection[];
  incompatibleSelections?: BetSelection[];
}

export interface BettingRules {
  straight: {
    allowedMarkets: string[];
    conflictRules: string[];
  };
  parlay: {
    minSelections: number;
    maxSelections: number;
    allowedMarkets: string[];
    conflictRules: string[];
  };
  sgp: {
    minSelections: number;
    maxSelections: number;
    allowedCombinations: string[][];
    restrictedCombinations: string[][];
  };
  teaser: {
    minSelections: number;
    maxSelections: number;
    allowedSports: string[];
    allowedMarkets: string[];
    pointOptions: Record<string, number[]>;
    pushLogic: 'reduce' | 'loss';
  };
  ifBet: {
    minSelections: number;
    maxSelections: number;
    allowedMarkets: string[];
    sequentialOnly: boolean;
  };
}

// Default sportsbook rules configuration
export const DEFAULT_BETTING_RULES: BettingRules = {
  straight: {
    allowedMarkets: ['h2h', 'spreads', 'totals', 'player_props', 'team_props'],
    conflictRules: [
      'no_ml_spread_same_team',
      'no_multiple_straight_same_market'
    ]
  },
  parlay: {
    minSelections: 2,
    maxSelections: 12,
    allowedMarkets: ['h2h', 'spreads', 'totals'],
    conflictRules: [
      'no_ml_both_teams_same_game',
      'no_ml_spread_same_team',
      'no_correlated_outcomes'
    ]
  },
  sgp: {
    minSelections: 2,
    maxSelections: 8,
    allowedCombinations: [
      ['h2h', 'totals'],
      ['spreads', 'totals'],
      ['spreads', 'player_props'],
      ['player_props', 'team_props'],
      ['h2h', 'player_props']
    ],
    restrictedCombinations: [
      ['h2h', 'spreads'], // Same team ML + Spread
      ['totals_over', 'totals_under'], // Opposing totals
      ['player_props_conflicting'] // Conflicting player props
    ]
  },
  teaser: {
    minSelections: 2,
    maxSelections: 8,
    allowedSports: ['american_football', 'basketball'],
    allowedMarkets: ['spreads', 'totals'],
    pointOptions: {
      'american_football': [6, 6.5, 7],
      'basketball': [4, 4.5, 5]
    },
    pushLogic: 'reduce'
  },
  ifBet: {
    minSelections: 2,
    maxSelections: 4,
    allowedMarkets: ['h2h', 'spreads', 'totals'],
    sequentialOnly: true
  }
};

export class BettingRulesValidator {
  private rules: BettingRules;

  constructor(rules: BettingRules = DEFAULT_BETTING_RULES) {
    this.rules = rules;
  }

  /**
   * Validate bet selections based on bet type
   */
  validate(
    selections: BetSelection[],
    betType: 'straight' | 'parlay' | 'sgp' | 'teaser' | 'if-bet'
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      compatibleSelections: [],
      incompatibleSelections: []
    };

    if (!selections || selections.length === 0) {
      result.isValid = false;
      result.errors.push('No selections provided');
      return result;
    }

    switch (betType) {
      case 'straight':
        return this.validateStraightBet(selections);
      case 'parlay':
        return this.validateParlayBet(selections);
      case 'sgp':
        return this.validateSameGameParlay(selections);
      case 'teaser':
        return this.validateTeaserBet(selections);
      case 'if-bet':
        return this.validateIfBet(selections);
      default:
        result.isValid = false;
        result.errors.push('Invalid bet type');
        return result;
    }
  }

  private validateStraightBet(selections: BetSelection[]): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      compatibleSelections: [...selections],
      incompatibleSelections: []
    };

    if (selections.length !== 1) {
      result.isValid = false;
      result.errors.push('Straight bets must have exactly one selection');
      return result;
    }

    const selection = selections[0];

    // Check if market type is allowed
    if (!this.rules.straight.allowedMarkets.includes(selection.marketType)) {
      result.isValid = false;
      result.errors.push(`Market type '${selection.marketType}' not allowed for straight bets`);
    }

    return result;
  }

  private validateParlayBet(selections: BetSelection[]): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      compatibleSelections: [],
      incompatibleSelections: []
    };

    // Check minimum selections
    if (selections.length < this.rules.parlay.minSelections) {
      result.isValid = false;
      result.errors.push(`Parlay requires at least ${this.rules.parlay.minSelections} selections`);
      return result;
    }

    // Check maximum selections
    if (selections.length > this.rules.parlay.maxSelections) {
      result.isValid = false;
      result.errors.push(`Parlay cannot exceed ${this.rules.parlay.maxSelections} selections`);
    }

    // Validate each selection and check for conflicts
    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i];
      let isCompatible = true;

      // Check if market type is allowed
      if (!this.rules.parlay.allowedMarkets.includes(selection.marketType)) {
        result.errors.push(`Market type '${selection.marketType}' not allowed in parlays`);
        isCompatible = false;
      }

      // Check for conflicts with other selections
      for (let j = i + 1; j < selections.length; j++) {
        const otherSelection = selections[j];
        const conflict = this.checkParlayConflicts(selection, otherSelection);
        if (conflict) {
          result.errors.push(conflict);
          isCompatible = false;
        }
      }

      if (isCompatible) {
        result.compatibleSelections!.push(selection);
      } else {
        result.incompatibleSelections!.push(selection);
      }
    }

    if (result.errors.length > 0) {
      result.isValid = false;
    }

    return result;
  }

  private validateSameGameParlay(selections: BetSelection[]): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      compatibleSelections: [],
      incompatibleSelections: []
    };

    // Check minimum selections
    if (selections.length < this.rules.sgp.minSelections) {
      result.isValid = false;
      result.errors.push(`Same Game Parlay requires at least ${this.rules.sgp.minSelections} selections`);
      return result;
    }

    // Check maximum selections
    if (selections.length > this.rules.sgp.maxSelections) {
      result.isValid = false;
      result.errors.push(`Same Game Parlay cannot exceed ${this.rules.sgp.maxSelections} selections`);
    }

    // All selections must be from the same game
    const firstEventId = selections[0].eventId;
    if (!selections.every(s => s.eventId === firstEventId)) {
      result.isValid = false;
      result.errors.push('All selections must be from the same game for Same Game Parlay');
      return result;
    }

    // Check allowed combinations
    const marketTypes = selections.map(s => s.marketType);
    const hasAllowedCombination = this.rules.sgp.allowedCombinations.some(combo =>
      combo.every(market => marketTypes.includes(market as any))
    );

    if (!hasAllowedCombination) {
      result.warnings.push('This combination may have reduced odds or limited availability');
    }

    // Check for restricted combinations
    for (const restrictedCombo of this.rules.sgp.restrictedCombinations) {
      if (this.hasRestrictedCombination(selections, restrictedCombo)) {
        result.isValid = false;
        result.errors.push(`Restricted combination: ${restrictedCombo.join(' + ')}`);
      }
    }

    // Check for same team ML + Spread conflict
    const mlSelection = selections.find(s => s.marketType === 'h2h');
    const spreadSelection = selections.find(s => s.marketType === 'spreads');
    if (mlSelection && spreadSelection && mlSelection.selectedTeam === spreadSelection.selectedTeam) {
      result.isValid = false;
      result.errors.push('Cannot combine Moneyline and Spread for the same team');
    }

    result.compatibleSelections = result.isValid ? selections : [];
    result.incompatibleSelections = result.isValid ? [] : selections;

    return result;
  }

  private validateTeaserBet(selections: BetSelection[]): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      compatibleSelections: [],
      incompatibleSelections: []
    };

    // Check minimum selections
    if (selections.length < this.rules.teaser.minSelections) {
      result.isValid = false;
      result.errors.push(`Teaser requires at least ${this.rules.teaser.minSelections} selections`);
      return result;
    }

    // Check maximum selections
    if (selections.length > this.rules.teaser.maxSelections) {
      result.isValid = false;
      result.errors.push(`Teaser cannot exceed ${this.rules.teaser.maxSelections} selections`);
    }

    // All selections must be from different games
    const eventIds = new Set(selections.map(s => s.eventId));
    if (eventIds.size !== selections.length) {
      result.isValid = false;
      result.errors.push('Teaser selections must be from different games');
    }

    // Check allowed sports and markets
    for (const selection of selections) {
      let isCompatible = true;

      if (!this.rules.teaser.allowedSports.includes(selection.sport)) {
        result.errors.push(`Sport '${selection.sport}' not allowed in teasers`);
        isCompatible = false;
      }

      if (!this.rules.teaser.allowedMarkets.includes(selection.marketType)) {
        result.errors.push(`Market type '${selection.marketType}' not allowed in teasers`);
        isCompatible = false;
      }

      if (isCompatible) {
        result.compatibleSelections!.push(selection);
      } else {
        result.incompatibleSelections!.push(selection);
      }
    }

    if (result.errors.length > 0) {
      result.isValid = false;
    }

    return result;
  }

  private validateIfBet(selections: BetSelection[]): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      compatibleSelections: [...selections],
      incompatibleSelections: []
    };

    // Check minimum and maximum selections
    if (selections.length < this.rules.ifBet.minSelections) {
      result.isValid = false;
      result.errors.push(`If Bet requires at least ${this.rules.ifBet.minSelections} selections`);
      return result;
    }

    if (selections.length > this.rules.ifBet.maxSelections) {
      result.isValid = false;
      result.errors.push(`If Bet cannot exceed ${this.rules.ifBet.maxSelections} selections`);
    }

    // Check allowed markets
    for (const selection of selections) {
      if (!this.rules.ifBet.allowedMarkets.includes(selection.marketType)) {
        result.isValid = false;
        result.errors.push(`Market type '${selection.marketType}' not allowed in If Bets`);
      }
    }

    // All stakes should be equal for if bets
    const firstStake = selections[0].stake;
    if (!selections.every(s => s.stake === firstStake)) {
      result.warnings.push('All bets in an If Bet sequence should have equal stakes');
    }

    return result;
  }

  private checkParlayConflicts(selection1: BetSelection, selection2: BetSelection): string | null {
    // Same game conflicts
    if (selection1.eventId === selection2.eventId) {
      // Both teams ML in same game
      if (selection1.marketType === 'h2h' && selection2.marketType === 'h2h') {
        return `Cannot parlay both team moneylines in the same game: ${selection1.homeTeam} vs ${selection1.awayTeam}`;
      }

      // ML + Spread same team
      if ((selection1.marketType === 'h2h' && selection2.marketType === 'spreads') ||
          (selection1.marketType === 'spreads' && selection2.marketType === 'h2h')) {
        if (selection1.selectedTeam === selection2.selectedTeam) {
          return `Cannot combine Moneyline and Spread for the same team: ${selection1.selectedTeam}`;
        }
      }

      // Player prop + Team ML in same game (unless SGP)
      if ((selection1.marketType === 'player_props' && selection2.marketType === 'h2h') ||
          (selection1.marketType === 'h2h' && selection2.marketType === 'player_props')) {
        return 'Cannot combine Player Props and Moneyline in the same game (use Same Game Parlay)';
      }
    }

    return null;
  }

  private hasRestrictedCombination(selections: BetSelection[], restricted: string[]): boolean {
    // Handle special cases for restricted combinations
    if (restricted.includes('totals_over') && restricted.includes('totals_under')) {
      const totalsSelections = selections.filter(s => s.marketType === 'totals');
      if (totalsSelections.length >= 2) {
        // Check if there are conflicting over/under selections with same point
        for (let i = 0; i < totalsSelections.length; i++) {
          for (let j = i + 1; j < totalsSelections.length; j++) {
            if (totalsSelections[i].point === totalsSelections[j].point) {
              return true; // Same total point with different over/under
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Get invalid selections that should be auto-disabled
   */
  getInvalidSelections(
    currentSelections: BetSelection[],
    betType: 'straight' | 'parlay' | 'sgp' | 'teaser' | 'if-bet'
  ): string[] {
    const invalidSelectionIds: string[] = [];
    
    // Implementation for auto-disabling incompatible selections
    // This would be used by the UI to disable incompatible options
    
    return invalidSelectionIds;
  }

  /**
   * Get tooltips explaining why certain selections are blocked
   */
  getBlockedReasonTooltip(
    selection: BetSelection,
    currentSelections: BetSelection[],
    betType: 'straight' | 'parlay' | 'sgp' | 'teaser' | 'if-bet'
  ): string {
    // Return explanation for why a selection is blocked
    const validation = this.validate([...currentSelections, selection], betType);
    return validation.errors.join('; ');
  }
}

// Export singleton instance
export const bettingRulesValidator = new BettingRulesValidator();

// Helper functions for UI integration
export const getBetTypeDisplayName = (betType: string): string => {
  const displayNames: Record<string, string> = {
    'straight': 'Straight',
    'parlay': 'Parlay',
    'sgp': 'Same Game Parlay',
    'teaser': 'Teaser',
    'if-bet': 'If Bet'
  };
  return displayNames[betType] || betType;
};

export const getBetTypeDescription = (betType: string): string => {
  const descriptions: Record<string, string> = {
    'straight': 'Single bet on one selection',
    'parlay': 'Multiple selections combined - all must win',
    'sgp': 'Multiple selections from the same game',
    'teaser': 'Adjusted point spreads in your favor',
    'if-bet': 'Sequential bets - next bet only placed if previous wins'
  };
  return descriptions[betType] || '';
}; 