const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');
const Sport = require('./Sport');

/**
 * SportsEvent model represents individual sporting events available for betting.
 * Each event belongs to a sport and contains teams, timing, and current status.
 * Events are synchronized with The Odds API to ensure accurate data.
 */
class SportsEvent extends Model {}

SportsEvent.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    externalId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Event ID from The Odds API for synchronization',
    },
    homeTeam: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Name of the home team',
    },
    awayTeam: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Name of the away team',
    },
    commenceTime: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'When the event is scheduled to start',
    },
    status: {
      type: DataTypes.ENUM('upcoming', 'live', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'upcoming',
      comment: 'Current status of the sporting event',
    },
    homeScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Final or current score for home team',
    },
    awayScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Final or current score for away team',
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'When this event data was last synchronized',
    },
  },
  {
    sequelize,
    modelName: 'sportsEvent',
    tableName: 'sports_events',
  }
);

// Define relationships
Sport.hasMany(SportsEvent, { foreignKey: 'sportId' });
SportsEvent.belongsTo(Sport, { foreignKey: 'sportId' });

module.exports = SportsEvent;

