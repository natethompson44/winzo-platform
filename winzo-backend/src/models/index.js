const sequelize = require('../../config/database');
const User = require('./User');
const Bet = require('./Bet');
const Sport = require('./Sport');
const SportsEvent = require('./SportsEvent');
const Odds = require('./Odds');

function applyAssociations() {
  User.hasMany(Bet, { foreignKey: 'userId' });
  Bet.belongsTo(User, { foreignKey: 'userId' });

  Sport.hasMany(SportsEvent, { foreignKey: 'sportId' });
  SportsEvent.belongsTo(Sport, { foreignKey: 'sportId' });

  SportsEvent.hasMany(Odds, { foreignKey: 'eventId' });
  Odds.belongsTo(SportsEvent, { foreignKey: 'eventId' });

  SportsEvent.hasMany(Bet, { foreignKey: 'eventId' });
  Bet.belongsTo(SportsEvent, { foreignKey: 'eventId' });

  Odds.hasMany(Bet, { foreignKey: 'oddsId' });
  Bet.belongsTo(Odds, { foreignKey: 'oddsId' });
}

module.exports = {
  sequelize,
  User,
  Bet,
  Sport,
  SportsEvent,
  Odds,
  applyAssociations
};
