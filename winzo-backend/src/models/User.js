const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * User model represents a player on the WINZO platform. Each user is
 * associated with a unique inviteCode which can be used by new players to
 * register. Users maintain a walletBalance that is updated when bets are
 * placed or settled.
 */
class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    inviteCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    walletBalance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'user',
  }
);

module.exports = User;
