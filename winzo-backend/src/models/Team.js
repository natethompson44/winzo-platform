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
    api_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'api_id',
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
    createdBy: { type: DataTypes.UUID, allowNull: true, field: 'created_by' },
    updatedBy: { type: DataTypes.UUID, allowNull: true, field: 'updated_by' },
  },
  {
    sequelize,
    modelName: 'team',
    tableName: 'teams',
    paranoid: true,
    indexes: [
      { fields: ['api_id'] },
      { fields: ['league_id'] },
      { fields: ['country_id'] },
    ],
  }
);

module.exports = Team;
