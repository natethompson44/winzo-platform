import React, { useState, useCallback } from 'react';
import { useBetSlip } from '../../../contexts/BetSlipContext';
import { formatCurrency } from '../../../utils/numberUtils';

// Shared interfaces and types
export interface BetTypeOption {
  id: 'straight' | 'parlay' | 'teaser' | 'if-bet';
  label: string;
  description: string;
  minSelections?: number;
}

export interface BetSlipCoreProps {
  className?: string;
  onClose?: () => void;
  showConfirmation?: boolean;
  onConfirmationChange?: (show: boolean) => void;
  children?: (renderProps: BetSlipRenderProps) => React.ReactNode;
}

export interface BetSlipRenderProps {
  // State
  betSlipItems: any[];
  betType: string;
  totalStake: number;
  totalPayout: number;
  isProcessing: boolean;
  showConfirmation: boolean;
  isOpen: boolean;

  // Actions
  handlePlaceBet: () => void;
  handleConfirmBet: () => void;
  handleCancelBet: () => void;
  handleStakeUpdate: (id: string, value: string) => void;
  handleBetTypeChange: (type: string) => void;
  handleClose: () => void;
  handleRemoveItem: (id: string) => void;
  handleClearAll: () => void;

  // Utilities
  getBetTypeLabel: (type: string) => string;
  getBetTypeDescription: (type: string) => string;
  isBetTypeDisabled: (type: string) => boolean;
  formatOdds: (odds: number) => string;
  canPlaceBet: () => boolean;

  // Data
  betTypeOptions: BetTypeOption[];
}

// Shared bet type options
export const BET_TYPE_OPTIONS: BetTypeOption[] = [
  { id: 'straight', label: 'Straight', description: 'Single bet on one selection' },
  { id: 'parlay', label: 'Parlay', description: 'Multiple selections combined', minSelections: 2 },
  { id: 'teaser', label: 'Teaser', description: 'Adjusted point spreads', minSelections: 2 },
  { id: 'if-bet', label: 'If Bet', description: 'Conditional betting', minSelections: 2 }
];

// Core BetSlip logic component using render props pattern
export const BetSlipCore: React.FC<BetSlipCoreProps> = ({
  className,
  onClose,
  showConfirmation: externalShowConfirmation,
  onConfirmationChange,
  children
}) => {
  const {
    betSlipItems,
    betType,
    setBetType,
    removeFromBetSlip,
    clearBetSlip,
    totalStake,
    totalPayout,
    canPlaceBet,
    isOpen,
    setIsOpen,
    updateStake
  } = useBetSlip();

  // Internal state
  const [internalShowConfirmation, setInternalShowConfirmation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Use external confirmation state if provided, otherwise use internal
  const showConfirmation = externalShowConfirmation ?? internalShowConfirmation;
  const setShowConfirmation = onConfirmationChange ?? setInternalShowConfirmation;

  // Shared utility functions
  const formatOdds = useCallback((odds: number): string => {
    if (odds > 0) {
      return `+${odds}`;
    }
    return odds.toString();
  }, []);

  const getBetTypeLabel = useCallback((type: string): string => {
    const option = BET_TYPE_OPTIONS.find(opt => opt.id === type);
    return option ? option.label : type;
  }, []);

  const getBetTypeDescription = useCallback((type: string): string => {
    const option = BET_TYPE_OPTIONS.find(opt => opt.id === type);
    return option ? option.description : '';
  }, []);

  const isBetTypeDisabled = useCallback((type: string): boolean => {
    const option = BET_TYPE_OPTIONS.find(opt => opt.id === type);
    if (option && option.minSelections) {
      return betSlipItems.length < option.minSelections;
    }
    return false;
  }, [betSlipItems.length]);

  // Shared action handlers
  const handlePlaceBet = useCallback(async () => {
    if (!canPlaceBet()) return;
    setShowConfirmation(true);
  }, [canPlaceBet, setShowConfirmation]);

  const handleConfirmBet = useCallback(async () => {
    setIsProcessing(true);
    
    try {
      // TODO: Implement actual bet placement API call
      console.log('Placing bet:', {
        items: betSlipItems,
        totalStake,
        totalPayout,
        betType
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success - clear bet slip and close
      clearBetSlip();
      setIsOpen(false);
      setShowConfirmation(false);
      
      // TODO: Show success notification
      
    } catch (error) {
      console.error('Failed to place bet:', error);
      // TODO: Show error notification
    } finally {
      setIsProcessing(false);
    }
  }, [
    betSlipItems,
    totalStake,
    totalPayout,
    betType,
    clearBetSlip,
    setIsOpen,
    setShowConfirmation
  ]);

  const handleCancelBet = useCallback(() => {
    setShowConfirmation(false);
  }, [setShowConfirmation]);

  const handleStakeUpdate = useCallback((id: string, value: string) => {
    const stake = parseFloat(value) || 0;
    updateStake(id, stake);
  }, [updateStake]);

  const handleBetTypeChange = useCallback((type: string) => {
    setBetType(type as any);
  }, [setBetType]);

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      setIsOpen(false);
    }
  }, [onClose, setIsOpen]);

  const handleRemoveItem = useCallback((id: string) => {
    removeFromBetSlip(id);
  }, [removeFromBetSlip]);

  const handleClearAll = useCallback(() => {
    clearBetSlip();
  }, [clearBetSlip]);

  // Render props object
  const renderProps: BetSlipRenderProps = {
    // State
    betSlipItems,
    betType,
    totalStake,
    totalPayout,
    isProcessing,
    showConfirmation,
    isOpen,

    // Actions
    handlePlaceBet,
    handleConfirmBet,
    handleCancelBet,
    handleStakeUpdate,
    handleBetTypeChange,
    handleClose,
    handleRemoveItem,
    handleClearAll,

    // Utilities
    getBetTypeLabel,
    getBetTypeDescription,
    isBetTypeDisabled,
    formatOdds,
    canPlaceBet,

    // Data
    betTypeOptions: BET_TYPE_OPTIONS
  };

  // Render using children as render prop
  return (
    <div className={className}>
      {children ? children(renderProps) : null}
    </div>
  );
};

export default BetSlipCore;