const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');
const Sport = require('./Sport');
const League = require('./League');
const Team = require('./Team');
const Venue = require('./Venue');

/**
 * SportsEvent model represents individual sporting events available for betting.
 * Each event belongs to a sport and contains teams, timing, and current status.
 * Events are synchronized with The Odds API to ensure accurate data.
 */
/**
 * SportsEvent represents a single game or match. Additional fields allow live
 * tracking with venue and referee details from API-Sports.
 * @typedef {import('../types/models').SportsEventInstance} SportsEventInstance
 */
class SportsEvent extends Model {
  /**
   * Determine if this event is currently live.
   * @returns {boolean}
   */
  isLive() {
    return !this.completed;
  }
}

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
      field: 'external_id',
      comment: 'Event ID from The Odds API for synchronization',
    },
    sportKey: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'sport_key',
      comment: 'Sport key from The Odds API',
    },
    homeTeam: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'home_team',
      comment: 'Name of the home team',
    },
    awayTeam: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'away_team',
      comment: 'Name of the away team',
    },
    commenceTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'commence_time',
      comment: 'When the event is scheduled to start',
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether the event has been completed',
    },
    homeScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'home_score',
      comment: 'Final or current score for home team',
    },
    awayScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'away_score',
      comment: 'Final or current score for away team',
    },
    liveHomeScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'live_home_score',
    },
    liveAwayScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'live_away_score',
    },
    venue_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'venues', key: 'id' },
    },
    referee: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    statusLong: { type: DataTypes.STRING, allowNull: true, field: 'status_long' },
    statusShort: { type: DataTypes.STRING, allowNull: true, field: 'status_short' },
    elapsed: { type: DataTypes.INTEGER, allowNull: true },
    lastUpdate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'last_update',
      comment: 'When this event data was last synchronized',
    },
    bigWinMessage: { type: DataTypes.STRING, allowNull: true, field: 'big_win_message' },
    createdBy: { type: DataTypes.UUID, allowNull: true, field: 'created_by' },
    updatedBy: { type: DataTypes.UUID, allowNull: true, field: 'updated_by' },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: 'sportsEvent',
    tableName: 'sports_events',
    paranoid: true,
    indexes: [
      { fields: ['external_id'] },
      { fields: ['sport_key'] },
      { fields: ['commence_time'] },
    ],
    hooks: {
      beforeUpdate(event) {
        event.lastUpdate = new Date();
      },
    },
  }
);

module.exports = SportsEvent;

