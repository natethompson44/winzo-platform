const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');
const Country = require('./Country');

/**
 * Sport model represents different sports available for betting on WINZO.
 * Each sport has a unique key from The Odds API and contains metadata
 * about the sport including its current active status.
 */
/**
 * Sport represents a high level category such as Football or Basketball. It now
 * includes references to country and season information for API-Sports
 * compatibility while keeping legacy fields intact.
 * @typedef {import('../types/models').SportInstance} SportInstance
 */
class Sport extends Model {}

Sport.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Sport key from The Odds API (e.g., americanfootball_nfl)',
    },
    group: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Sport group category (e.g., American Football)',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Display title for the sport (e.g., NFL)',
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Brief description of the sport',
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this sport is currently in season and available for betting',
    },
    hasOutrights: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'has_outrights',
      comment: 'Whether this sport supports outright/futures betting',
    },
    apiSportId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true,
      field: 'api_sport_id',
      comment: 'API-Sports sport identifier',
    },
    country_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'countries', key: 'id' },
    },
    defaultSeason: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'default_season',
      comment: 'Default season year for API-Sports calls',
    },
    bigWinMessage: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'big_win_message',
      comment: 'WINZO Big Win Energy celebration message',
    },
    createdBy: { type: DataTypes.UUID, allowNull: true, field: 'created_by' },
    updatedBy: { type: DataTypes.UUID, allowNull: true, field: 'updated_by' },
  },
  {
    sequelize,
    modelName: 'sport',
    tableName: 'sports',
    paranoid: true,
    indexes: [
      { fields: ['key'] },
      { fields: ['api_sport_id'] },
      { fields: ['country_id'] },
    ],
  }
);

module.exports = Sport;

