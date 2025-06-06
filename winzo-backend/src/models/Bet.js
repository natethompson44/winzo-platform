const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('./User');

/**
 * Bet model stores all wagered bets by users. Each bet belongs to a single
 * user and captures the basic information about the wager and its outcome.
 */
class Bet extends Model {}

Bet.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    game: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    odds: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    potentialPayout: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'won', 'lost'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    modelName: 'bet',
  }
);

User.hasMany(Bet, { foreignKey: 'userId' });
Bet.belongsTo(User, { foreignKey: 'userId' });

module.exports = Bet;
