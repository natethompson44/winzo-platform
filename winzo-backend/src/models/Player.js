const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * Player model stores detailed info about individual players.
 * Useful for building rich stats and WINZO user features.
 * @typedef {import('../types/models').PlayerInstance} PlayerInstance
 */
class Player extends Model {}

Player.init(
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
      field: 'api_id'
    },
    team_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'teams', key: 'id' },
    },
    country_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'countries', key: 'id' },
    },
    firstName: { type: DataTypes.STRING, allowNull: false, field: 'first_name' },
    lastName: { type: DataTypes.STRING, allowNull: false, field: 'last_name' },
    age: { type: DataTypes.INTEGER, allowNull: true },
    position: { type: DataTypes.STRING, allowNull: true },
    number: { type: DataTypes.INTEGER, allowNull: true },
    height: { type: DataTypes.STRING, allowNull: true },
    weight: { type: DataTypes.STRING, allowNull: true },
    injured: { type: DataTypes.BOOLEAN, allowNull: true },
    photo: { type: DataTypes.STRING, allowNull: true },
    createdBy: { type: DataTypes.UUID, allowNull: true, field: 'created_by' },
    updatedBy: { type: DataTypes.UUID, allowNull: true, field: 'updated_by' },
  },
  {
    sequelize,
    modelName: 'player',
    tableName: 'players',
    paranoid: true,
    indexes: [
      { fields: ['api_id'] },
      { fields: ['team_id'] },
      { fields: ['country_id'] },
    ],
  }
);

module.exports = Player;
