import React, { useState, useMemo } from 'react';
import { useBetSlip } from '../contexts/BetSlipContext';
import apiClient from '../utils/axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/numberUtils';
import ValidatedInput from './ValidatedInput';
import './BetSlip.css';
import { toast } from 'react-hot-toast';

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

interface BetSlipItem {
  id: string;
  eventId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  selectedTeam: string;
  odds: number;
  marketType: string;
  bookmaker: string;
  commenceTime: string;
}

const BetSlip: React.FC = () => {
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
    setIsOpen
  } = useBetSlip();

  const { user, updateBalance, refreshUser } = useAuth();

  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [placeBetError, setPlaceBetError] = useState<string>('');
  const [betAmount, setBetAmount] = useState<string>('10.00');
  const [isExpanded, setIsExpanded] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const totalOdds = useMemo(() => {
    if (betType === 'single') {
      return betSlipItems.length > 0 ? betSlipItems[0].odds : 0;
    } else {
      return betSlipItems.reduce((total, item) => total * item.odds, 1);
    }
  }, [betSlipItems, betType]);

  const potentialWinnings = useMemo(() => {
    const amount = parseFloat(betAmount) || 0;
    return amount * totalOdds - amount;
  }, [betAmount, totalOdds]);

  const formatOdds = (odds: number): string => {
    if (odds > 0) {
      return `+${odds}`;
    }
    return odds.toString();
  };

  const handlePlaceBet = () => {
    if (betSlipItems.length === 0 || !betAmount || parseFloat(betAmount) <= 0) {
      return;
    }
    setShowConfirmation(true);
  };

  const confirmBet = () => {
    const betData = {
      items: betSlipItems,
      betAmount: parseFloat(betAmount),
      betType,
      totalOdds,
      potentialWinnings,
      timestamp: new Date().toISOString()
    };
    // Here you would typically call an API to place the bet
    console.log('Placing bet:', betData);
    setShowConfirmation(false);
    clearBetSlip();
    setBetAmount('10.00');
  };

  const getBetTypeLabel = (type: string) => {
    switch (type) {
      case 'single': return 'Single Bet';
      case 'parlay': return 'Parlay';
      default: return type;
    }
  };

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
      const errorMessage = error.message || 'Failed to place bet';
      console.error('Error placing bet:', error);
      toast.error(errorMessage);
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
    <div className={`bet-slip ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Header */}
      <div className="bet-slip-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-content">
          <h3>Bet Slip</h3>
          <div className="bet-count">
            {betSlipItems.length} {betSlipItems.length === 1 ? 'Selection' : 'Selections'}
          </div>
        </div>
        <div className="expand-icon">
          {isExpanded ? '−' : '+'}
        </div>
      </div>

      {isExpanded && (
        <div className="bet-slip-content">
          {/* Bet Type Selector */}
          <div className="bet-type-selector">
            <div className="bet-type-options">
              <button
                className={`bet-type-btn ${betType === 'single' ? 'active' : ''}`}
                onClick={() => setBetType('single')}
              >
                Single
              </button>
              <button
                className={`bet-type-btn ${betType === 'parlay' ? 'active' : ''}`}
                onClick={() => setBetType('parlay')}
                disabled={betSlipItems.length < 2}
              >
                Parlay
              </button>
            </div>
          </div>

          {/* Bet Items */}
          <div className="bet-items">
            {betSlipItems.length === 0 ? (
              <div className="empty-bet-slip">
                <div className="empty-icon">📋</div>
                <p>No selections yet</p>
                <span>Click on odds to add selections to your bet slip</span>
              </div>
            ) : (
              betSlipItems.map((item, index) => (
                <div key={item.id} className="bet-item">
                  <div className="bet-item-header">
                    <div className="bet-number">#{index + 1}</div>
                    <button
                      className="remove-bet"
                      onClick={() => removeFromBetSlip(item.id)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="bet-details">
                    <div className="teams">
                      <span className="team">{item.homeTeam}</span>
                      <span className="vs">vs</span>
                      <span className="team">{item.awayTeam}</span>
                    </div>
                    
                    <div className="selection">
                      <span className="selected-team">{item.selectedTeam}</span>
                      <span className="odds">{formatOdds(item.odds)}</span>
                    </div>
                    
                    <div className="market-info">
                      <span className="market-type">{getBetTypeLabel(item.marketType)}</span>
                      <span className="bookmaker">{item.bookmaker}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bet Summary */}
          {betSlipItems.length > 0 && (
            <div className="bet-summary">
              <div className="summary-row">
                <span>Bet Type:</span>
                <span className="bet-type-label">{getBetTypeLabel(betType)}</span>
              </div>
              
              <div className="summary-row">
                <span>Total Odds:</span>
                <span className="total-odds">{formatOdds(totalOdds)}</span>
              </div>
              
              <div className="bet-amount-section">
                <label htmlFor="bet-amount">Bet Amount ($)</label>
                <input
                  id="bet-amount"
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                  className="bet-amount-input"
                  placeholder="0.00"
                />
              </div>
              
              <div className="summary-row winnings">
                <span>Potential Winnings:</span>
                <span className="potential-winnings">${potentialWinnings.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bet-actions">
            {betSlipItems.length > 0 ? (
              <>
                <button
                  className="place-bet-btn"
                  onClick={handlePlaceBet}
                  disabled={!betAmount || parseFloat(betAmount) <= 0}
                >
                  Place Bet
                </button>
                <button className="clear-all-btn" onClick={clearBetSlip}>
                  Clear All
                </button>
              </>
            ) : (
              <button className="clear-all-btn" disabled>
                No Selections
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bet Confirmation Modal */}
      {showConfirmation && (
        <div className="bet-confirmation-overlay">
          <div className="bet-confirmation-modal">
            <div className="modal-header">
              <h3>Confirm Your Bet</h3>
              <button
                className="close-modal"
                onClick={() => setShowConfirmation(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="confirmation-details">
                <div className="detail-row">
                  <span>Bet Type:</span>
                  <span>{getBetTypeLabel(betType)}</span>
                </div>
                <div className="detail-row">
                  <span>Selections:</span>
                  <span>{betSlipItems.length}</span>
                </div>
                <div className="detail-row">
                  <span>Total Odds:</span>
                  <span>{formatOdds(totalOdds)}</span>
                </div>
                <div className="detail-row">
                  <span>Bet Amount:</span>
                  <span>${betAmount}</span>
                </div>
                <div className="detail-row highlight">
                  <span>Potential Winnings:</span>
                  <span>${potentialWinnings.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="confirmation-actions">
                <button
                  className="confirm-bet-btn"
                  onClick={confirmBet}
                >
                  Confirm Bet
                </button>
                <button
                  className="cancel-bet-btn"
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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

