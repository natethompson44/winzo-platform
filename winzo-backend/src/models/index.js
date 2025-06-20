const sequelize = require('../../config/database')
const User = require('./User')
const Bet = require('./Bet')
const Sport = require('./Sport')
const SportsEvent = require('./SportsEvent')
const Odds = require('./Odds')
const Country = require('./Country')
const League = require('./League')
const Team = require('./Team')
const Player = require('./Player')
const Venue = require('./Venue')
const Bookmaker = require('./Bookmaker')(sequelize)
const Transaction = require('./Transaction')(sequelize)

function applyAssociations () {
  User.hasMany(Bet, { foreignKey: 'user_id' })
  Bet.belongsTo(User, { foreignKey: 'user_id' })

  Sport.hasMany(SportsEvent, { foreignKey: 'sport_id' })
  SportsEvent.belongsTo(Sport, { foreignKey: 'sport_id' })

  Sport.hasMany(League, { foreignKey: 'sport_id' })
  League.belongsTo(Sport, { foreignKey: 'sport_id' })

  Country.hasMany(League, { foreignKey: 'country_id' })
  League.belongsTo(Country, { foreignKey: 'country_id' })

  League.hasMany(Team, { foreignKey: 'league_id' })
  Team.belongsTo(League, { foreignKey: 'league_id' })

  Country.hasMany(Team, { foreignKey: 'country_id' })
  Team.belongsTo(Country, { foreignKey: 'country_id' })

  Country.hasMany(Venue, { foreignKey: 'country_id' })
  Venue.belongsTo(Country, { foreignKey: 'country_id' })

  Venue.hasMany(Team, { foreignKey: 'venue_id' })
  Team.belongsTo(Venue, { foreignKey: 'venue_id' })

  Team.hasMany(Player, { foreignKey: 'team_id' })
  Player.belongsTo(Team, { foreignKey: 'team_id' })

  Country.hasMany(Player, { foreignKey: 'country_id' })
  Player.belongsTo(Country, { foreignKey: 'country_id' })

  League.hasMany(SportsEvent, { foreignKey: 'league_id' })
  SportsEvent.belongsTo(League, { foreignKey: 'league_id' })

  Team.hasMany(SportsEvent, { foreignKey: 'home_team_id', as: 'homeEvents' })
  Team.hasMany(SportsEvent, { foreignKey: 'away_team_id', as: 'awayEvents' })
  SportsEvent.belongsTo(Team, { foreignKey: 'home_team_id', as: 'homeTeamObj' })
  SportsEvent.belongsTo(Team, { foreignKey: 'away_team_id', as: 'awayTeamObj' })

  Venue.hasMany(SportsEvent, { foreignKey: 'venue_id' })
  SportsEvent.belongsTo(Venue, { foreignKey: 'venue_id' })

  SportsEvent.hasMany(Odds, { foreignKey: 'sports_event_id' })
  Odds.belongsTo(SportsEvent, { foreignKey: 'sports_event_id' })

  // Bookmaker associations
  Bookmaker.hasMany(Odds, { foreignKey: 'bookmaker_id', as: 'odds' })
  Odds.belongsTo(Bookmaker, { foreignKey: 'bookmaker_id', as: 'bookmakerObj' })

  SportsEvent.hasMany(Bet, { foreignKey: 'sports_event_id' })
  Bet.belongsTo(SportsEvent, { foreignKey: 'sports_event_id' })

  Odds.hasMany(Bet, { foreignKey: 'odds_id' })
  Bet.belongsTo(Odds, { foreignKey: 'odds_id' })

  User.hasMany(Transaction, { foreignKey: 'user_id', as: 'transactions' })
  Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' })
  Bet.hasMany(Transaction, { foreignKey: 'reference_id', as: 'transactions' })
  Transaction.belongsTo(Bet, { foreignKey: 'reference_id', as: 'bet' })
}

module.exports = {
  sequelize,
  User,
  Bet,
  Sport,
  SportsEvent,
  Odds,
  Country,
  League,
  Team,
  Player,
  Venue,
  Bookmaker,
  Transaction,
  applyAssociations
}
