const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');
const SportsEvent = require('./SportsEvent');

/**
 * Odds model stores betting odds for different markets on sporting events.
 * Odds are synchronized from multiple bookmakers via The Odds API to provide
 * competitive pricing for WINZO users. Each odds entry represents a specific
 * betting outcome with its current price.
 */
class Odds extends Model {}

Odds.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
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
      comment: 'Odds price in decimal format for easier calculation',
    },
    point: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Point spread or total points (for spreads/totals markets)',
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'When these odds were last updated from the API',
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether these odds are currently available for betting',
    },
  },
  {
    sequelize,
    modelName: 'odds',
    tableName: 'odds',
  }
);

// Define relationships
SportsEvent.hasMany(Odds, { foreignKey: 'eventId' });
Odds.belongsTo(SportsEvent, { foreignKey: 'eventId' });

module.exports = Odds;

