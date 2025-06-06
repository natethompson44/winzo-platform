const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const User = require('./User');

const Bet = sequelize.define('Bet', {
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

Bet.belongsTo(User);
User.hasMany(Bet);

module.exports = Bet;
