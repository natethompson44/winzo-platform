const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');
const SportsEvent = require('./SportsEvent');

/**
 * Odds model stores betting odds for different markets on sporting events.
 * Enhanced with live tracking and additional bookmaker information.
 * @typedef {import('../types/models').OddsInstance} OddsInstance
 */
class Odds extends Model {
  /**
   * Determine if the odds are live.
   * @returns {boolean}
   */
  isLive() {
    return this.isLiveOdds;
  }
}

Odds.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    bookmaker: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Name of the bookmaker providing these odds (e.g., fanduel)',
    },
    bookmakerTitle: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'bookmaker_title',
      comment: 'Display title of the bookmaker (e.g., FanDuel)',
    },
    market: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Type of betting market (e.g., h2h, spreads, totals)',
    },
    outcome: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'The specific outcome being bet on (team name, over/under, etc.)',
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Odds price in American format (positive/negative)',
    },
    decimalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'decimal_price',
      comment: 'Odds price in decimal format for easier calculation',
    },
    point: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Point spread or total points (for spreads/totals markets)',
    },
    bookmakerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'bookmaker_id',
      comment: 'Bookmaker id from API-Sports',
    },
    marketType: { type: DataTypes.STRING, allowNull: true, field: 'market_type' },
    isLiveOdds: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_live_odds' },
    openingPrice: { type: DataTypes.FLOAT, allowNull: true, field: 'opening_price' },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'last_updated',
      comment: 'When these odds were last updated from the API',
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether these odds are currently available for betting',
    },
    sports_event_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sports_events',
        key: 'id',
      },
    },
    createdBy: { type: DataTypes.UUID, allowNull: true, field: 'created_by' },
    updatedBy: { type: DataTypes.UUID, allowNull: true, field: 'updated_by' },
  },
  {
    sequelize,
    modelName: 'odds',
    tableName: 'odds',
    paranoid: true,
    indexes: [
      { fields: ['sports_event_id'] },
      { fields: ['bookmaker'] },
      { fields: ['market'] },
      { fields: ['is_live_odds'] },
    ],
    hooks: {
      beforeUpdate(odds) {
        odds.lastUpdated = new Date();
      },
    },
  }
);

module.exports = Odds;

