import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { bettingRulesValidator, BetSelection, ValidationResult } from '../utils/bettingRules';

export interface BetSlipItem {
  id: string;
  eventId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  selectedTeam: string;
  odds: number;
  stake: number;
  potentialPayout: number;
  bookmaker: string;
  marketType: 'h2h' | 'spreads' | 'totals' | 'player_props' | 'team_props';
  point?: number;
  commenceTime: string;
  addedAt: Date;
}

export interface BetSlipContextType {
  betSlipItems: BetSlipItem[];
  isOpen: boolean;
  betType: 'straight' | 'parlay' | 'sgp' | 'teaser' | 'if-bet';
  totalStake: number;
  totalPayout: number;
  validationResult: ValidationResult;
  teaserPoints?: number;
  addToBetSlip: (item: Omit<BetSlipItem, 'id' | 'stake' | 'potentialPayout' | 'addedAt'>) => void;
  removeFromBetSlip: (id: string) => void;
  updateStake: (id: string, stake: number) => void;
  clearBetSlip: () => void;
  setBetType: (type: 'straight' | 'parlay' | 'sgp' | 'teaser' | 'if-bet') => void;
  setTeaserPoints: (points: number) => void;
  setIsOpen: (open: boolean) => void;
  getItemCount: () => number;
  getTotalStake: () => number;
  getTotalPayout: () => number;
  canPlaceBet: () => boolean;
  isSelectionBlocked: (eventId: string, marketType: string, selectedTeam: string) => boolean;
  getBlockedReason: (eventId: string, marketType: string, selectedTeam: string) => string;
  validateCurrentBet: () => ValidationResult;
}

const BetSlipContext = createContext<BetSlipContextType | undefined>(undefined);

export const useBetSlip = (): BetSlipContextType => {
  const context = useContext(BetSlipContext);
  if (!context) {
    throw new Error('useBetSlip must be used within a BetSlipProvider');
  }
  return context;
};

interface BetSlipProviderProps {
  children: ReactNode;
}

export const BetSlipProvider: React.FC<BetSlipProviderProps> = ({ children }) => {
  const [betSlipItems, setBetSlipItems] = useState<BetSlipItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [betType, setBetType] = useState<'straight' | 'parlay' | 'sgp' | 'teaser' | 'if-bet'>('straight');
  const [totalStake, setTotalStake] = useState(0);
  const [totalPayout, setTotalPayout] = useState(0);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true, errors: [], warnings: [] });
  const [teaserPoints, setTeaserPoints] = useState<number>(6);

  // Body class management for bet slip sidebar
  useEffect(() => {
    const handleBodyClass = () => {
      if (isOpen && window.innerWidth > 768) {
        document.body.classList.add('bet-slip-mode');
      } else {
        document.body.classList.remove('bet-slip-mode');
      }
    };

    handleBodyClass();

    // Handle window resize to manage body class properly
    window.addEventListener('resize', handleBodyClass);
    return () => {
      window.removeEventListener('resize', handleBodyClass);
      document.body.classList.remove('bet-slip-mode');
    };
  }, [isOpen]);

  // Load bet slip from localStorage on mount
  useEffect(() => {
    const savedBetSlip = localStorage.getItem('winzo_betslip');
    if (savedBetSlip) {
      try {
        const parsed = JSON.parse(savedBetSlip);
        setBetSlipItems(parsed.items || []);
        setBetType(parsed.betType || 'straight');
      } catch (error) {
        console.error('Error loading bet slip from localStorage:', error);
      }
    }
  }, []);

  // Save bet slip to localStorage whenever it changes
  useEffect(() => {
    const betSlipData = {
      items: betSlipItems,
      betType: betType,
    };
    localStorage.setItem('winzo_betslip', JSON.stringify(betSlipData));
  }, [betSlipItems, betType]);

  // Recalculate totals whenever items or bet type changes
  useEffect(() => {
    calculateTotals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [betSlipItems, betType]);

  // Update validation result whenever betslip items or bet type changes
  useEffect(() => {
    const newValidation = validateCurrentBet();
    setValidationResult(newValidation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [betSlipItems, betType]);

  const calculatePayout = (stake: number, odds: number): number => {
    if (odds > 0) {
      return stake * (odds / 100);
    }
    return stake * (100 / Math.abs(odds));
  };

  const calculateTotals = () => {
    const stake = betSlipItems.reduce((sum, item) => sum + item.stake, 0);
    setTotalStake(stake);
    
    if (betType === 'straight') {
      const payout = betSlipItems.reduce((sum, item) => sum + item.potentialPayout, 0);
      setTotalPayout(payout);
    } else if (betType === 'parlay') {
      if (betSlipItems.length > 1 && stake > 0) {
        const combinedOdds = betSlipItems.reduce((product, item) => {
          const decimalOdds = item.odds > 0 ? item.odds / 100 + 1 : 100 / Math.abs(item.odds) + 1;
          return product * decimalOdds;
        }, 1);
        setTotalPayout(stake * (combinedOdds - 1));
      } else {
        setTotalPayout(betSlipItems[0]?.potentialPayout || 0);
      }
    } else if (betType === 'sgp') {
      // Same Game Parlay - similar to parlay but typically with adjusted odds
      if (betSlipItems.length > 1 && stake > 0) {
        const combinedOdds = betSlipItems.reduce((product, item) => {
          // SGP odds are often adjusted down due to correlation
          const decimalOdds = item.odds > 0 ? (item.odds * 0.85) / 100 + 1 : (100 / Math.abs(item.odds * 0.85)) + 1;
          return product * decimalOdds;
        }, 1);
        setTotalPayout(stake * (combinedOdds - 1));
      } else {
        setTotalPayout(betSlipItems[0]?.potentialPayout || 0);
      }
    } else if (betType === 'teaser') {
      // Teaser betting with adjusted odds based on point selection
      if (betSlipItems.length >= 2 && stake > 0) {
        // Teaser odds based on points and number of legs
        const legs = betSlipItems.length;
        let teaserOdds = 1;
        
        // Standard teaser odds table (simplified)
        if (teaserPoints === 6) {
          teaserOdds = legs === 2 ? -110 : legs === 3 ? 160 : legs === 4 ? 260 : 400;
        } else if (teaserPoints === 6.5) {
          teaserOdds = legs === 2 ? -120 : legs === 3 ? 140 : legs === 4 ? 240 : 380;
        } else if (teaserPoints === 7) {
          teaserOdds = legs === 2 ? -130 : legs === 3 ? 120 : legs === 4 ? 200 : 350;
        }
        
        const payout = teaserOdds > 0 ? stake * (teaserOdds / 100) : stake * (100 / Math.abs(teaserOdds));
        setTotalPayout(payout);
      } else {
        setTotalPayout(0); // Teaser requires at least 2 selections
      }
    } else if (betType === 'if-bet') {
      // If betting - conditional betting where subsequent bets only process if previous wins
      if (betSlipItems.length >= 2) {
        // For if-bet, calculate cascading potential
        let cascadingPayout = 0;
        let currentStake = betSlipItems[0]?.stake || 0;
        
        for (const item of betSlipItems) {
          const itemPayout = calculatePayout(currentStake, item.odds);
          cascadingPayout += itemPayout;
          currentStake = itemPayout; // Next bet uses previous payout as stake
        }
        
        setTotalPayout(cascadingPayout);
      } else {
        setTotalPayout(betSlipItems[0]?.potentialPayout || 0);
      }
    }
  };

  const addToBetSlip = (
    item: Omit<BetSlipItem, 'id' | 'stake' | 'potentialPayout' | 'addedAt'>
  ) => {
    const existingBet = betSlipItems.find(
      bet => bet.eventId === item.eventId && bet.selectedTeam === item.selectedTeam
    );
    if (existingBet) {
      updateBetOdds(existingBet.id, item.odds);
      return;
    }
    const id = `${item.eventId}_${item.selectedTeam}_${Date.now()}`;
    const defaultStake = 10;
    const potentialPayout = calculatePayout(defaultStake, item.odds);
    const newBet: BetSlipItem = {
      ...item,
      id,
      stake: defaultStake,
      potentialPayout,
      addedAt: new Date(),
    };
    setBetSlipItems(prev => [...prev, newBet]);
    setIsOpen(true); // Auto-open bet slip when bet added
    showAddToBetSlipFeedback(item.selectedTeam);
  };

  const removeFromBetSlip = (id: string) => {
    setBetSlipItems(prev => prev.filter(item => item.id !== id));
    if (betSlipItems.length === 1) {
      setIsOpen(false);
    }
  };

  const updateStake = (id: string, stake: number) => {
    setBetSlipItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const potentialPayout = calculatePayout(stake, item.odds);
          return { ...item, stake, potentialPayout };
        }
        return item;
      })
    );
  };

  const updateBetOdds = (id: string, newOdds: number) => {
    setBetSlipItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const potentialPayout = calculatePayout(item.stake, newOdds);
          return { ...item, odds: newOdds, potentialPayout };
        }
        return item;
      })
    );
  };

  const clearBetSlip = () => {
    setBetSlipItems([]);
    setIsOpen(false);
    setTotalStake(0);
    setTotalPayout(0);
  };

  const getItemCount = (): number => betSlipItems.length;

  const getTotalStake = (): number => totalStake;

  const getTotalPayout = (): number => totalPayout;

  const canPlaceBet = (): boolean => {
    if (betSlipItems.length === 0 || totalStake === 0) return false;
    
    // Use the comprehensive validation system
    const validation = validateCurrentBet();
    if (!validation.isValid) return false;
    
    return betSlipItems.every(item => item.stake > 0);
  };

  const validateCurrentBet = (): ValidationResult => {
    const selections: BetSelection[] = betSlipItems.map(item => ({
      id: item.id,
      eventId: item.eventId,
      sport: item.sport,
      homeTeam: item.homeTeam,
      awayTeam: item.awayTeam,
      selectedTeam: item.selectedTeam,
      odds: item.odds,
      marketType: item.marketType,
      point: item.point,
      stake: item.stake,
      bookmaker: item.bookmaker,
      commenceTime: item.commenceTime
    }));

    return bettingRulesValidator.validate(selections, betType);
  };

  const isSelectionBlocked = (eventId: string, marketType: string, selectedTeam: string): boolean => {
    // Create a mock selection to test against current betslip
    const mockSelection: BetSelection = {
      id: `test_${Date.now()}`,
      eventId,
      sport: 'american_football', // Default sport for validation
      homeTeam: 'Team A',
      awayTeam: 'Team B',
      selectedTeam,
      odds: -110,
      marketType: marketType as any,
      stake: 10,
      bookmaker: 'test',
      commenceTime: new Date().toISOString()
    };

    const currentSelections: BetSelection[] = betSlipItems.map(item => ({
      id: item.id,
      eventId: item.eventId,
      sport: item.sport,
      homeTeam: item.homeTeam,
      awayTeam: item.awayTeam,
      selectedTeam: item.selectedTeam,
      odds: item.odds,
      marketType: item.marketType,
      point: item.point,
      stake: item.stake,
      bookmaker: item.bookmaker,
      commenceTime: item.commenceTime
    }));

    const validation = bettingRulesValidator.validate([...currentSelections, mockSelection], betType);
    return !validation.isValid;
  };

  const getBlockedReason = (eventId: string, marketType: string, selectedTeam: string): string => {
    const mockSelection: BetSelection = {
      id: `test_${Date.now()}`,
      eventId,
      sport: 'american_football',
      homeTeam: 'Team A',
      awayTeam: 'Team B',
      selectedTeam,
      odds: -110,
      marketType: marketType as any,
      stake: 10,
      bookmaker: 'test',
      commenceTime: new Date().toISOString()
    };

    return bettingRulesValidator.getBlockedReasonTooltip(
      mockSelection,
      betSlipItems.map(item => ({
        id: item.id,
        eventId: item.eventId,
        sport: item.sport,
        homeTeam: item.homeTeam,
        awayTeam: item.awayTeam,
        selectedTeam: item.selectedTeam,
        odds: item.odds,
        marketType: item.marketType,
        point: item.point,
        stake: item.stake,
        bookmaker: item.bookmaker,
        commenceTime: item.commenceTime
      })),
      betType
    );
  };

  const showAddToBetSlipFeedback = (teamName: string) => {
    const notification = document.createElement('div');
    notification.className = 'bet-slip-notification';
    notification.textContent = `${teamName} added to bet slip!`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      color: white;
      background: linear-gradient(135deg, var(--color-success) 0%, var(--color-success-dark) 100%);
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: bold;
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const contextValue: BetSlipContextType = {
    betSlipItems,
    isOpen,
    betType,
    totalStake,
    totalPayout,
    validationResult,
    teaserPoints,
    addToBetSlip,
    removeFromBetSlip,
    updateStake,
    clearBetSlip,
    setBetType,
    setTeaserPoints,
    setIsOpen,
    getItemCount,
    getTotalStake,
    getTotalPayout,
    canPlaceBet,
    isSelectionBlocked,
    getBlockedReason,
    validateCurrentBet,
  };

  return <BetSlipContext.Provider value={contextValue}>{children}</BetSlipContext.Provider>;
};

const style = document.createElement('style');
style.textContent = `
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes slideOutRight {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}

/* Bet Slip Sidebar Body Class Pattern */
body.bet-slip-mode {
  margin-right: 350px;
  transition: margin-right 0.3s ease-in-out;
}

@media (max-width: 768px) {
  body.bet-slip-mode {
    margin-right: 0;
  }
}`;
document.head.appendChild(style);

