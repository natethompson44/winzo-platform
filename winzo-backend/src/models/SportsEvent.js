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
    return this.status === 'live';
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
    league_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'leagues', key: 'id' },
    },
    home_team_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'teams', key: 'id' },
    },
    away_team_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'teams', key: 'id' },
    },
    commenceTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'commence_time',
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
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'last_updated',
      comment: 'When this event data was last synchronized',
    },
    bigWinMessage: { type: DataTypes.STRING, allowNull: true, field: 'big_win_message' },
    createdBy: { type: DataTypes.UUID, allowNull: true, field: 'created_by' },
    updatedBy: { type: DataTypes.UUID, allowNull: true, field: 'updated_by' },
  },
  {
    sequelize,
    modelName: 'sportsEvent',
    tableName: 'sports_events',
    paranoid: true,
    indexes: [
      { fields: ['external_id'] },
      { fields: ['league_id'] },
      { fields: ['commence_time'] },
      { fields: ['status'] },
    ],
    hooks: {
      beforeUpdate(event) {
        event.lastUpdated = new Date();
      },
    },
  }
);

module.exports = SportsEvent;

