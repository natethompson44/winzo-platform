import React, { useState, useEffect, useMemo } from 'react';
import { useBetSlip } from '../contexts/BetSlipContext';
import { QuickStakeButton } from './ButtonV2';
import '../styles/design-system-v2.css';

interface BetSlipV2Props {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * WINZO Bet Slip v2.0 - Mobile-First Design
 * 
 * Improvements based on audit findings:
 * - Large, prominent "Place Bet" button
 * - Quick stake buttons ($10, $25, $50, $100)
 * - Real-time validation with clear error messages
 * - Full-width on mobile (like DraftKings)
 * - Simplified bet type selection
 * - Better visual hierarchy for betting actions
 * 
 * Mobile-first approach with desktop enhancements
 */
const BetSlipV2: React.FC<BetSlipV2Props> = ({
  isOpen = true,
  onClose,
  className = ''
}) => {
  const {
    betSlipItems,
    betType,
    setBetType,
    removeFromBetSlip,
    clearBetSlip,
    updateStake,
    totalStake,
    totalPayout,
    canPlaceBet
  } = useBetSlip();

  const [stakeInput, setStakeInput] = useState('10.00');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  // Quick stake amounts - optimized for typical betting amounts
  const quickStakeAmounts = [10, 25, 50, 100];

  // Validation logic
  const validateBet = useMemo(() => {
    const newErrors: string[] = [];
    const stake = parseFloat(stakeInput) || 0;

    if (betSlipItems.length === 0) {
      newErrors.push('Add at least one selection to your bet slip');
    }

    if (stake <= 0) {
      newErrors.push('Enter a valid stake amount');
    }

    if (stake > 1000) {
      newErrors.push('Maximum stake is $1,000');
    }

    if (stake < 1) {
      newErrors.push('Minimum stake is $1.00');
    }

    if (betType === 'parlay' && betSlipItems.length < 2) {
      newErrors.push('Parlay bets require at least 2 selections');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  }, [stakeInput, betSlipItems, betType]);

  // Calculate potential winnings
  const potentialWinnings = useMemo(() => {
    const stake = parseFloat(stakeInput) || 0;
    if (stake <= 0 || betSlipItems.length === 0) return 0;

    if (betType === 'single') {
      // For single bets, calculate based on first selection
      const odds = betSlipItems[0]?.odds || 0;
      const decimalOdds = odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;
      return stake * decimalOdds - stake;
    } else {
      // For parlays, multiply all odds
      const combinedOdds = betSlipItems.reduce((acc, item) => {
        const decimalOdds = item.odds > 0 ? (item.odds / 100) + 1 : (100 / Math.abs(item.odds)) + 1;
        return acc * decimalOdds;
      }, 1);
      return stake * combinedOdds - stake;
    }
  }, [stakeInput, betSlipItems, betType]);

  // Handle stake input changes
  const handleStakeChange = (value: string) => {
    // Allow empty string and valid numbers only
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setStakeInput(value);
    }
  };

  // Handle quick stake buttons
  const handleQuickStake = (amount: number) => {
    setStakeInput(amount.toString());
  };

  // Handle bet placement
  const handlePlaceBet = async () => {
    if (!validateBet) return;
    
    setShowConfirmation(true);
  };

  // Confirm bet placement
  const confirmBet = async () => {
    setIsPlacingBet(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Placing bet:', {
        selections: betSlipItems,
        betType,
        stake: parseFloat(stakeInput),
        potentialWinnings
      });
      
      // Success - clear bet slip
      clearBetSlip();
      setStakeInput('10.00');
      setShowConfirmation(false);
      
      // Show success message (in real app, use toast/notification)
      alert('Bet placed successfully! Good luck!');
      
    } catch (error) {
      console.error('Error placing bet:', error);
      alert('Failed to place bet. Please try again.');
    } finally {
      setIsPlacingBet(false);
    }
  };

  // Format odds display
  const formatOdds = (odds: number): string => {
    return odds > 0 ? `+${odds}` : odds.toString();
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Main Bet Slip */}
      <div className={`
        bg-white border border-gray-200 rounded-lg shadow-lg
        tablet:w-80 tablet:max-h-screen tablet:overflow-hidden
        mobile:fixed mobile:inset-x-0 mobile:bottom-0 mobile:rounded-t-lg mobile:rounded-b-none
        mobile:max-h-[85vh] mobile:z-50
        ${className}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Bet Slip ({betSlipItems.length})
          </h3>
          <div className="flex items-center gap-2">
            {betSlipItems.length > 0 && (
              <button
                onClick={clearBetSlip}
                className="btn btn-tertiary btn-sm"
              >
                Clear All
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-md transition-fast"
                aria-label="Close bet slip"
              >
                <span className="text-xl text-gray-500">×</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full tablet:max-h-[calc(100vh-120px)]">
          {/* Selections */}
          <div className="flex-1 overflow-y-auto p-4">
            {betSlipItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📋</div>
                <h4 className="text-lg font-medium text-gray-900 mb-1">No selections yet</h4>
                <p className="text-sm text-gray-500">Click on odds to add selections</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Bet Type Selector */}
                <div className="flex bg-gray-100 rounded-md p-1">
                  <button
                    className={`flex-1 py-2 px-3 rounded-sm text-sm font-medium transition-fast ${
                      betType === 'single' 
                        ? 'bg-white shadow-sm text-primary' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setBetType('single')}
                  >
                    Single
                  </button>
                  <button
                    className={`flex-1 py-2 px-3 rounded-sm text-sm font-medium transition-fast ${
                      betType === 'parlay' 
                        ? 'bg-white shadow-sm text-primary' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setBetType('parlay')}
                    disabled={betSlipItems.length < 2}
                  >
                    Parlay
                  </button>
                </div>

                {/* Selection Items */}
                {betSlipItems.map((item, index) => (
                  <div key={item.id} className="bg-gray-50 rounded-md p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {item.homeTeam} vs {item.awayTeam}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-primary font-medium">
                            {item.selectedTeam}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatOdds(item.odds)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromBetSlip(item.id)}
                        className="p-1 hover:bg-gray-200 rounded-sm transition-fast"
                        aria-label={`Remove ${item.selectedTeam} from bet slip`}
                      >
                        <span className="text-gray-500">×</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stake Input Section */}
          {betSlipItems.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Stake Input */}
              <div>
                <label htmlFor="stake-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Stake Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    id="stake-input"
                    type="text"
                    value={stakeInput}
                    onChange={(e) => handleStakeChange(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-md text-lg font-semibold focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Quick Stake Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {quickStakeAmounts.map((amount) => (
                  <QuickStakeButton
                    key={amount}
                    amount={amount}
                    onClick={() => handleQuickStake(amount)}
                    className="text-xs"
                  />
                ))}
              </div>

              {/* Bet Summary */}
              <div className="bg-gray-50 rounded-md p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Bet Type:</span>
                  <span className="font-medium capitalize">{betType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Stake:</span>
                  <span className="font-medium">${stakeInput || '0.00'}</span>
                </div>
                <div className="flex justify-between text-base border-t border-gray-200 pt-2">
                  <span className="font-medium text-gray-900">Potential Win:</span>
                  <span className="font-bold text-success">${potentialWinnings.toFixed(2)}</span>
                </div>
              </div>

              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="bg-danger-light bg-opacity-10 border border-danger-light rounded-md p-3">
                  {errors.map((error, index) => (
                    <p key={index} className="text-sm text-danger">{error}</p>
                  ))}
                </div>
              )}

              {/* Place Bet Button */}
              <button
                onClick={handlePlaceBet}
                disabled={!validateBet || errors.length > 0}
                className="btn btn-primary btn-lg btn-full"
              >
                <span>Place Bet</span>
                <span className="text-sm opacity-75">Win ${potentialWinnings.toFixed(2)}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Your Bet</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Selections:</span>
                  <span className="font-medium">{betSlipItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bet Type:</span>
                  <span className="font-medium capitalize">{betType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stake:</span>
                  <span className="font-medium">${stakeInput}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="font-medium text-gray-900">Potential Win:</span>
                  <span className="font-bold text-success text-lg">${potentialWinnings.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 btn btn-tertiary"
                  disabled={isPlacingBet}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBet}
                  className="flex-1 btn btn-primary"
                  disabled={isPlacingBet}
                >
                  {isPlacingBet ? 'Placing...' : 'Confirm Bet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Backdrop */}
      <div 
        className="tablet:hidden fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />
    </>
  );
};

export default BetSlipV2;