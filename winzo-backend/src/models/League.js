const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');
const Sport = require('./Sport');
const Country = require('./Country');

/**
 * League model aligns with API-Sports league objects. Multiple leagues belong
 * to a single sport and reference a country. Seasons are stored in JSON format
 * to remain flexible with API-Sports structure.
 * @typedef {import('../types/models').LeagueInstance} LeagueInstance
 */
class League extends Model {
  /**
   * Determine if this league is currently active based on current flag.
   * @returns {boolean}
   */
  isCurrent() {
    return !!this.currentSeason && this.currentSeason === this.season;
  }
}

League.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    apiId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      comment: 'API-Sports league id',
    },
    sport_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sports',
        key: 'id',
      },
    },
    country_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'countries',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    flag: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    season: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    seasons: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    currentSeason: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'league',
    tableName: 'leagues',
    paranoid: true,
    indexes: [
      { fields: ['apiId'] },
      { fields: ['sport_id'] },
      { fields: ['country_id'] },
    ],
  }
);

module.exports = League;
