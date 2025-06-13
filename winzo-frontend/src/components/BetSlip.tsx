import React, { useState } from 'react';
import { useBetSlip } from '../contexts/BetSlipContext';
import apiClient from '../utils/axios';
import { API_ENDPOINTS, handleApiError } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/numberUtils';
import ValidatedInput from './ValidatedInput';
import './BetSlip.css';

interface PlaceBetResponse {
  success: boolean;
  message: string;
  data?: {
    betIds: string[];
    betType: string;
    totalStake: number;
    potentialPayout: number;
    newBalance: number;
  };
  error?: string;
}

const BetSlip: React.FC = () => {
  const {
    betSlipItems,
    isOpen,
    betType,
    totalStake,
    totalPayout,
    removeFromBetSlip,
    updateStake,
    clearBetSlip,
    setBetType,
    setIsOpen,
    canPlaceBet,
  } = useBetSlip();

  const { user, updateBalance, refreshUser } = useAuth();

  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [placeBetError, setPlaceBetError] = useState<string>('');

  const handleStakeChange = (itemId: string, value: string, isValid: boolean, numericValue?: number) => {
    if (isValid && numericValue !== undefined) {
      updateStake(itemId, numericValue);
    }
  };

  const setQuickStake = (itemId: string, amount: number) => {
    updateStake(itemId, amount);
  };

  const hasInsufficientFunds = user ? user.wallet_balance < totalStake : false;

  const placeBets = async () => {
    if (!canPlaceBet() || !user) {
      setPlaceBetError('Please log in to place bets');
      return;
    }
    setIsPlacingBet(true);
    setPlaceBetError('');
    try {
      const betData = {
        bets: betSlipItems.map(item => ({
          eventId: item.eventId,
          selectedTeam: item.selectedTeam,
          odds: item.odds,
          stake: item.stake,
          marketType: item.marketType,
          bookmaker: item.bookmaker
        })),
        betType,
        totalStake,
        potentialPayout: totalPayout
      };
      const response = await apiClient.post<PlaceBetResponse>(API_ENDPOINTS.PLACE_BET, betData);
      if (response.data.success) {
        if (response.data.data?.newBalance !== undefined) {
          updateBalance(response.data.data.newBalance);
        }
        clearBetSlip();
        showSuccessNotification(
          response.data.message,
          response.data.data?.newBalance,
          response.data.data?.betIds?.length || 0
        );
        await refreshUser();
      } else {
        setPlaceBetError(response.data.error || 'Failed to place bets');
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      setPlaceBetError(errorMessage);
      if (error.response?.status === 401) {
        setPlaceBetError('Please log in to place bets');
      } else if (error.response?.status === 400) {
        setPlaceBetError(error.response.data.error || 'Invalid bet data');
      }
    } finally {
      setIsPlacingBet(false);
    }
  };

  const showSuccessNotification = (
    message: string,
    newBalance?: number,
    betCount?: number
  ) => {
    const notification = document.createElement('div');
    notification.className = 'bet-success-notification';
    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px; color: #48bb78;">
        ${message}
      </div>
      <div style="font-size: 0.9rem; margin-bottom: 4px;">
        ${betCount} bet${betCount !== 1 ? 's' : ''} placed successfully
      </div>
      ${newBalance ? `<div style="font-size: 0.9rem; color: #68d391;">New Balance: ${formatCurrency(newBalance)}</div>` : ''}
    `;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      color: white;
      background: linear-gradient(135deg, #1a365d 0%, #2d5a87 100%);
      padding: 20px 24px;
      border-radius: 12px;
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
      box-shadow: 0 8px 24px rgba(72, 187, 120, 0.3);
      max-width: 320px;
      border: 1px solid #48bb78;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-in';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 5000);
  };

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="bet-slip-overlay" onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}>
        <div className="bet-slip-container">
          <div className="bet-slip-header">
            <h2> Bet Slip</h2>
            <button className="close-button" onClick={() => setIsOpen(false)}></button>
          </div>
          <div className="auth-required">
            <div className="auth-icon"></div>
            <h3>Login Required</h3>
            <p>Please log in to place bets and manage your bet slip.</p>
            <button
              className="login-button"
              onClick={() => {
                setIsOpen(false);
                window.location.href = '/login';
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bet-slip-overlay" onClick={e => e.target === e.currentTarget && setIsOpen(false)}>
      <div className="bet-slip-container">
        <div className="bet-slip-header">
          <h2>Bet Slip</h2>
          <div className="bet-slip-controls">
            <span className="bet-count">{betSlipItems.length} bet{betSlipItems.length !== 1 ? 's' : ''}</span>
            <button className="close-button" onClick={() => setIsOpen(false)}>✕</button>
          </div>
        </div>
        {betSlipItems.length === 0 ? (
          <div className="empty-bet-slip">
            <div className="empty-icon">🎲</div>
            <h3>Your bet slip is empty</h3>
            <p>Click on odds to add bets and start winning!</p>
          </div>
        ) : (
          <>
            <div className="bet-type-selector">
              <button
                className={`bet-type-button ${betType === 'single' ? 'active' : ''}`}
                onClick={() => setBetType('single')}
              >
                Single Bets
              </button>
              <button
                className={`bet-type-button ${betType === 'parlay' ? 'active' : ''}`}
                onClick={() => setBetType('parlay')}
                disabled={betSlipItems.length < 2}
              >
                Parlay {betSlipItems.length < 2 && '(2+ bets)'}
              </button>
            </div>
            <div className="bet-slip-items">
              {betSlipItems.map(item => (
                <BetSlipItemCard
                  key={item.id}
                  item={item}
                  onRemove={() => removeFromBetSlip(item.id)}
                  onStakeChange={(value, isValid, numericValue) => 
                    handleStakeChange(item.id, value, isValid, numericValue)
                  }
                  onQuickStake={amount => setQuickStake(item.id, amount)}
                />
              ))}
            </div>
            {placeBetError && (
              <div className="bet-error">
                <span>{placeBetError}</span>
                <button onClick={() => setPlaceBetError('')}>✕</button>
              </div>
            )}
            <div className="bet-slip-summary">
              <div className="summary-row">
                <span>Total Stake:</span>
                <span className="amount">{formatCurrency(totalStake)}</span>
              </div>
              <div className="summary-row total">
                <span>Potential Payout:</span>
                <span className="amount">{formatCurrency(totalPayout)}</span>
              </div>
              <div className="summary-row profit">
                <span>Potential Profit:</span>
                <span className="amount profit-amount">{formatCurrency(totalPayout - totalStake)}</span>
              </div>
            </div>
            <div className="bet-slip-actions">
              <button className="clear-button" onClick={clearBetSlip}>
                Clear All
              </button>
              <button
                className={`place-bet-button ${hasInsufficientFunds ? 'insufficient-funds' : ''}`}
                onClick={placeBets}
                disabled={!canPlaceBet() || isPlacingBet || hasInsufficientFunds}
              >
                {isPlacingBet ? (
                  <>
                    <span className="loading-spinner-small"></span>
                    Placing...
                  </>
                ) : hasInsufficientFunds ? (
                  'Insufficient Funds'
                ) : (
                  `Place ${betType === 'parlay' ? 'Parlay' : 'Bet'}${
                    betSlipItems.length > 1 && betType === 'single' ? 's' : ''
                  }`
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface BetSlipItemCardProps {
  item: any;
  onRemove: () => void;
  onStakeChange: (value: string, isValid: boolean, numericValue?: number) => void;
  onQuickStake: (amount: number) => void;
}

const BetSlipItemCard: React.FC<BetSlipItemCardProps> = ({ item, onRemove, onStakeChange, onQuickStake }) => {
  const { user } = useAuth();

  return (
    <div className="bet-slip-item">
      <div className="bet-header">
        <div className="teams">
          <span className="matchup">
            {item.awayTeam} @ {item.homeTeam}
          </span>
          <span className="sport">{item.sport.toUpperCase()}</span>
        </div>
        <button className="remove-bet" onClick={onRemove}>✕</button>
      </div>
      <div className="bet-details">
        <div className="selection">
          <span className="selected-team">{item.selectedTeam}</span>
          <span className="odds">{item.odds > 0 ? `+${item.odds}` : item.odds.toString()}</span>
        </div>
        <div className="bookmaker">{item.bookmaker}</div>
        <div className="stake-section">
          <label>Stake:</label>
          <div className="stake-input-group">
            <ValidatedInput
              type="wallet-operation"
              value={item.stake.toString()}
              onChange={(value, isValid, numericValue) => 
                onStakeChange(value, isValid, numericValue)
              }
              walletBalance={user?.wallet_balance || 0}
              operation="bet"
              rules={{ min: 1, max: 1000, precision: 2 }}
              placeholder="Enter stake amount"
              className="stake-input"
            />
            <div className="quick-stakes">
              {[5, 10, 25, 50].map(amount => (
                <button
                  key={amount}
                  className="quick-stake-button"
                  onClick={() => onQuickStake(amount)}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="payout-info">
          <span>Payout: {formatCurrency(item.potentialPayout)}</span>
          <span>Profit: {formatCurrency(item.potentialPayout - item.stake)}</span>
        </div>
      </div>
    </div>
  );
};

export default BetSlip;

