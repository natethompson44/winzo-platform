const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');
const League = require('./League');
const Country = require('./Country');
const Venue = require('./Venue');

/**
 * Team model contains club or franchise information. Supports WINZO user
 * favorites and links to a venue. Aligns with API-Sports teams structure.
 * @typedef {import('../types/models').TeamInstance} TeamInstance
 */
class Team extends Model {}

Team.init(
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
    },
    league_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'leagues', key: 'id' },
    },
    country_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'countries', key: 'id' },
    },
    venue_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'venues', key: 'id' },
    },
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: true },
    logo: { type: DataTypes.STRING, allowNull: true },
    founded: { type: DataTypes.INTEGER, allowNull: true },
    favorites: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    createdBy: { type: DataTypes.UUID, allowNull: true },
    updatedBy: { type: DataTypes.UUID, allowNull: true },
  },
  {
    sequelize,
    modelName: 'team',
    tableName: 'teams',
    paranoid: true,
    indexes: [
      { fields: ['apiId'] },
      { fields: ['league_id'] },
      { fields: ['country_id'] },
    ],
  }
);

module.exports = Team;
