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
    apiId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
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
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: true },
    position: { type: DataTypes.STRING, allowNull: true },
    number: { type: DataTypes.INTEGER, allowNull: true },
    height: { type: DataTypes.STRING, allowNull: true },
    weight: { type: DataTypes.STRING, allowNull: true },
    injured: { type: DataTypes.BOOLEAN, allowNull: true },
    photo: { type: DataTypes.STRING, allowNull: true },
    createdBy: { type: DataTypes.UUID, allowNull: true },
    updatedBy: { type: DataTypes.UUID, allowNull: true },
  },
  {
    sequelize,
    modelName: 'player',
    tableName: 'players',
    paranoid: true,
    indexes: [
      { fields: ['apiId'] },
      { fields: ['team_id'] },
      { fields: ['country_id'] },
    ],
  }
);

module.exports = Player;
