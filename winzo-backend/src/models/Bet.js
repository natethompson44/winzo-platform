const { DataTypes, Model } = require('sequelize')
const sequelize = require('../../config/database')
const User = require('./User')
const SportsEvent = require('./SportsEvent')
const Odds = require('./Odds')

/**
 * Bet model stores all wagered bets by users on WINZO platform. Each bet belongs
 * to a single user and captures detailed information about sports wagers including
 * the specific event, market, outcome, and settlement details. Enhanced for sports
 * betting with comprehensive tracking and WINZO Wallet integration.
 */
class Bet extends Model {}

Bet.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    sports_event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sports_events',
        key: 'id'
      }
    },
    odds_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'odds',
        key: 'id'
      }
    },
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    // Legacy field for backward compatibility
    game: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Legacy game field for non-sports bets'
    },
    // Sports betting specific fields
    bet_type: {
      type: DataTypes.ENUM('sports', 'casino', 'other'),
      allowNull: false,
      defaultValue: 'sports',
      comment: 'Type of bet placed on WINZO platform'
    },
    market: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Betting market (h2h, spreads, totals, etc.)'
    },
    outcome: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Specific outcome bet on (team name, over/under, etc.)'
    },
    point: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Point spread or total points for the bet'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Amount wagered from WINZO Wallet',
      validate: { min: 0.01 }
    },
    odds: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Odds at time of bet placement (American format)'
    },
    decimalOdds: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'decimal_odds',
      comment: 'Odds in decimal format for calculation'
    },
    potentialPayout: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'potential_payout',
      comment: 'Potential payout including stake'
    },
    potentialProfit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'potential_profit',
      comment: 'Potential profit (payout minus stake)'
    },
    status: {
      type: DataTypes.ENUM('pending', 'won', 'lost', 'cancelled', 'pushed'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Current status of the bet'
    },
    settledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'settled_at',
      comment: 'When the bet was settled'
    },
    actualPayout: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'actual_payout',
      comment: 'Actual amount paid out to WINZO Wallet'
    },
    placedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'placed_at',
      comment: 'When the bet was placed'
    }
  },
  {
    sequelize,
    modelName: 'bet',
    tableName: 'bets',
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['sports_event_id'] },
      { fields: ['odds_id'] },
      { fields: ['status'] }
    ]
  }
)

module.exports = Bet
