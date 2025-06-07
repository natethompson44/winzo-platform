const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('./User');
const SportsEvent = require('./SportsEvent');
const Odds = require('./Odds');

/**
 * Bet model stores all wagered bets by users on WINZO platform. Each bet belongs 
 * to a single user and captures detailed information about sports wagers including
 * the specific event, market, outcome, and settlement details. Enhanced for sports
 * betting with comprehensive tracking and WINZO Wallet integration.
 */
class Bet extends Model {}

Bet.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // Legacy field for backward compatibility
    game: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Legacy game field for non-sports bets',
    },
    // Sports betting specific fields
    betType: {
      type: DataTypes.ENUM('sports', 'casino', 'other'),
      allowNull: false,
      defaultValue: 'sports',
      comment: 'Type of bet placed on WINZO platform',
    },
    market: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Betting market (h2h, spreads, totals, etc.)',
    },
    outcome: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Specific outcome bet on (team name, over/under, etc.)',
    },
    point: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Point spread or total points for the bet',
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
      comment: 'Odds at time of bet placement (American format)',
    },
    decimalOdds: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Odds in decimal format for calculation',
    },
    potentialPayout: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Potential payout including stake',
    },
    potentialProfit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Potential profit (payout minus stake)',
    },
    status: {
      type: DataTypes.ENUM('pending', 'won', 'lost', 'cancelled', 'pushed'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Current status of the bet',
    },
    settledAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the bet was settled',
    },
    actualPayout: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Actual amount paid out to WINZO Wallet',
    },
    placedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'When the bet was placed',
    },
  },
  {
    sequelize,
    modelName: 'bet',
    tableName: 'bets',
    indexes: [
      { fields: ['userId'] },
      { fields: ['eventId'] },
      { fields: ['status'] }
    ]
  }
);

module.exports = Bet;
