import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  marketType: string;
  commenceTime: string;
  addedAt: Date;
}

export interface BetSlipContextType {
  betSlipItems: BetSlipItem[];
  isOpen: boolean;
  betType: 'single' | 'parlay';
  totalStake: number;
  totalPayout: number;
  addToBetSlip: (item: Omit<BetSlipItem, 'id' | 'stake' | 'potentialPayout' | 'addedAt'>) => void;
  removeFromBetSlip: (id: string) => void;
  updateStake: (id: string, stake: number) => void;
  clearBetSlip: () => void;
  setBetType: (type: 'single' | 'parlay') => void;
  setIsOpen: (open: boolean) => void;
  getItemCount: () => number;
  getTotalStake: () => number;
  getTotalPayout: () => number;
  canPlaceBet: () => boolean;
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
  const [betType, setBetType] = useState<'single' | 'parlay'>('single');
  const [totalStake, setTotalStake] = useState(0);
  const [totalPayout, setTotalPayout] = useState(0);

  // Load bet slip from localStorage on mount
  useEffect(() => {
    const savedBetSlip = localStorage.getItem('winzo_betslip');
    if (savedBetSlip) {
      try {
        const parsed = JSON.parse(savedBetSlip);
        setBetSlipItems(parsed.items || []);
        setBetType(parsed.betType || 'single');
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

  const calculatePayout = (stake: number, odds: number): number => {
    if (odds > 0) {
      return stake * (odds / 100);
    }
    return stake * (100 / Math.abs(odds));
  };

  const calculateTotals = () => {
    const stake = betSlipItems.reduce((sum, item) => sum + item.stake, 0);
    setTotalStake(stake);
    if (betType === 'single') {
      const payout = betSlipItems.reduce((sum, item) => sum + item.potentialPayout, 0);
      setTotalPayout(payout);
    } else {
      if (betSlipItems.length > 1 && stake > 0) {
        const combinedOdds = betSlipItems.reduce((product, item) => {
          const decimalOdds = item.odds > 0 ? item.odds / 100 + 1 : 100 / Math.abs(item.odds) + 1;
          return product * decimalOdds;
        }, 1);
        setTotalPayout(stake * (combinedOdds - 1));
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
    setIsOpen(true);
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
    return betSlipItems.length > 0 && totalStake > 0 && betSlipItems.every(item => item.stake > 0);
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
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: bold;
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
      box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
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
    addToBetSlip,
    removeFromBetSlip,
    updateStake,
    clearBetSlip,
    setBetType,
    setIsOpen,
    getItemCount,
    getTotalStake,
    getTotalPayout,
    canPlaceBet,
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
}`;
document.head.appendChild(style);

