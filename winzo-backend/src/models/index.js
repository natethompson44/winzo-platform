const sequelize = require('../../config/database');
const User = require('./User');
const Bet = require('./Bet');
const Sport = require('./Sport');
const SportsEvent = require('./SportsEvent');
const Odds = require('./Odds');

function applyAssociations() {
  User.hasMany(Bet, { foreignKey: 'user_id' });
  Bet.belongsTo(User, { foreignKey: 'user_id' });

  Sport.hasMany(SportsEvent, { foreignKey: 'sport_id' });
  SportsEvent.belongsTo(Sport, { foreignKey: 'sport_id' });

  SportsEvent.hasMany(Odds, { foreignKey: 'event_id' });
  Odds.belongsTo(SportsEvent, { foreignKey: 'event_id' });

  SportsEvent.hasMany(Bet, { foreignKey: 'event_id' });
  Bet.belongsTo(SportsEvent, { foreignKey: 'event_id' });

  Odds.hasMany(Bet, { foreignKey: 'odds_id' });
  Bet.belongsTo(Odds, { foreignKey: 'odds_id' });
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
