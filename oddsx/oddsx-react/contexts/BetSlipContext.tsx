'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import sportsService, { BetSlipItem, Game } from '@/services/sportsService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface BetSlipContextType {
  betSlipItems: BetSlipItem[];
  isOpen: boolean;
  addToBetSlip: (game: Game, selection: string, odds: number, betType: string) => void;
  removeFromBetSlip: (gameId: string, selection: string) => void;
  clearBetSlip: () => void;
  toggleBetSlip: () => void;
  placeBets: (stakes: { [key: string]: number }) => Promise<boolean>;
  getTotalOdds: () => number;
  getTotalPotentialWin: (stakes: { [key: string]: number }) => number;
  isInBetSlip: (gameId: string, selection: string) => boolean;
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
  const { user, isAuthenticated } = useAuth();

  const addToBetSlip = (game: Game, selection: string, odds: number, betType: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to place bets');
      return;
    }

    const itemKey = `${game.id}-${selection}`;
    
    // Check if item already exists
    const existingItem = betSlipItems.find(
      item => item.gameId === game.id && item.selection === selection
    );

    if (existingItem) {
      // Update odds if they've changed
      setBetSlipItems(prev => 
        prev.map(item => 
          item.gameId === game.id && item.selection === selection
            ? { ...item, odds }
            : item
        )
      );
      toast.success('Bet slip updated with new odds');
    } else {
      // Add new item
      const newItem: BetSlipItem = {
        gameId: game.id,
        selection,
        odds,
        betType,
        game
      };

      setBetSlipItems(prev => [...prev, newItem]);
      toast.success(`${game.homeTeam} vs ${game.awayTeam} added to bet slip`);
    }

    // Auto-open bet slip
    setIsOpen(true);
  };

  const removeFromBetSlip = (gameId: string, selection: string) => {
    setBetSlipItems(prev => 
      prev.filter(item => !(item.gameId === gameId && item.selection === selection))
    );
    toast.success('Removed from bet slip');
  };

  const clearBetSlip = () => {
    setBetSlipItems([]);
    toast.success('Bet slip cleared');
  };

  const toggleBetSlip = () => {
    setIsOpen(prev => !prev);
  };

  const isInBetSlip = (gameId: string, selection: string): boolean => {
    return betSlipItems.some(item => item.gameId === gameId && item.selection === selection);
  };

  const getTotalOdds = (): number => {
    if (betSlipItems.length === 0) return 0;
    return betSlipItems.reduce((total, item) => total * item.odds, 1);
  };

  const getTotalPotentialWin = (stakes: { [key: string]: number }): number => {
    let totalWin = 0;
    
    betSlipItems.forEach(item => {
      const key = `${item.gameId}-${item.selection}`;
      const stake = stakes[key] || 0;
      totalWin += stake * item.odds;
    });

    return totalWin;
  };

  const placeBets = async (stakes: { [key: string]: number }): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      toast.error('Please login to place bets');
      return false;
    }

    if (betSlipItems.length === 0) {
      toast.error('Add selections to your bet slip first');
      return false;
    }

    let successCount = 0;
    let totalBets = 0;

    try {
      for (const item of betSlipItems) {
        const key = `${item.gameId}-${item.selection}`;
        const stake = stakes[key] || 0;

        if (stake > 0) {
          totalBets++;
          
          // Check if user has enough balance
          if (user.wallet_balance < stake) {
            toast.error(`Insufficient balance for ${item.game.homeTeam} vs ${item.game.awayTeam}`);
            continue;
          }

          const result = await sportsService.placeBet({
            gameId: item.gameId,
            betType: item.betType,
            selection: item.selection,
            odds: item.odds,
            stake
          });

          if (result.success) {
            successCount++;
            // Update user balance optimistically
            // This would normally be done by refreshing user data
          } else {
            toast.error(result.error || `Failed to place bet on ${item.game.homeTeam} vs ${item.game.awayTeam}`);
          }
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully placed ${successCount} bet${successCount > 1 ? 's' : ''}!`);
        
        // Clear bet slip after successful bets
        setBetSlipItems([]);
        setIsOpen(false);
        
        return true;
      } else {
        toast.error('No bets were placed');
        return false;
      }

    } catch (error) {
      console.error('Error placing bets:', error);
      toast.error('Failed to place bets. Please try again.');
      return false;
    }
  };

  const contextValue: BetSlipContextType = {
    betSlipItems,
    isOpen,
    addToBetSlip,
    removeFromBetSlip,
    clearBetSlip,
    toggleBetSlip,
    placeBets,
    getTotalOdds,
    getTotalPotentialWin,
    isInBetSlip
  };

  return (
    <BetSlipContext.Provider value={contextValue}>
      {children}
    </BetSlipContext.Provider>
  );
};

export { BetSlipContext };
export default BetSlipProvider;