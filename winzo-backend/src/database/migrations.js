const { sequelize } = require('../models');

/**
 * Basic migration script to create new tables and columns for API-Sports
 * integration. Intended for development environments using `sequelize.sync()`.
 */
async function migrate() {
  const qi = sequelize.getQueryInterface();

  // countries table
  await qi.createTable('countries', {
    id: { type: 'UUID', primaryKey: true, defaultValue: sequelize.literal('gen_random_uuid()') },
    name: { type: 'VARCHAR(255)', allowNull: false },
    code: { type: 'VARCHAR(3)', allowNull: false, unique: true },
    flag_url: { type: 'VARCHAR(255)' },
    created_at: { type: 'TIMESTAMP WITH TIME ZONE', defaultValue: sequelize.literal('NOW()') },
    updated_at: { type: 'TIMESTAMP WITH TIME ZONE', defaultValue: sequelize.literal('NOW()') },
    deleted_at: { type: 'TIMESTAMP WITH TIME ZONE' }
  }).catch(() => {});

  // leagues table
  await qi.createTable('leagues', {
    id: { type: 'UUID', primaryKey: true, defaultValue: sequelize.literal('gen_random_uuid()') },
    api_id: { type: 'INTEGER', allowNull: false, unique: true },
    sport_id: { type: 'UUID', allowNull: false, references: { model: 'sports', key: 'id' } },
    country_id: { type: 'UUID', references: { model: 'countries', key: 'id' } },
    name: { type: 'VARCHAR(255)', allowNull: false },
    logo: { type: 'VARCHAR(255)' },
    flag: { type: 'VARCHAR(255)' },
    season: { type: 'INTEGER' },
    seasons: { type: 'JSONB' },
    current_season: { type: 'INTEGER' },
    created_at: { type: 'TIMESTAMP WITH TIME ZONE', defaultValue: sequelize.literal('NOW()') },
    updated_at: { type: 'TIMESTAMP WITH TIME ZONE', defaultValue: sequelize.literal('NOW()') },
    deleted_at: { type: 'TIMESTAMP WITH TIME ZONE' }
  }).catch(() => {});

  // venues table
  await qi.createTable('venues', {
    id: { type: 'UUID', primaryKey: true, defaultValue: sequelize.literal('gen_random_uuid()') },
    api_id: { type: 'INTEGER', allowNull: false, unique: true },
    country_id: { type: 'UUID', references: { model: 'countries', key: 'id' } },
    name: { type: 'VARCHAR(255)', allowNull: false },
    city: { type: 'VARCHAR(255)' },
    address: { type: 'VARCHAR(255)' },
    capacity: { type: 'INTEGER' },
    surface: { type: 'VARCHAR(255)' },
    image: { type: 'VARCHAR(255)' },
    created_at: { type: 'TIMESTAMP WITH TIME ZONE', defaultValue: sequelize.literal('NOW()') },
    updated_at: { type: 'TIMESTAMP WITH TIME ZONE', defaultValue: sequelize.literal('NOW()') },
    deleted_at: { type: 'TIMESTAMP WITH TIME ZONE' }
  }).catch(() => {});

  // teams table
  await qi.createTable('teams', {
    id: { type: 'UUID', primaryKey: true, defaultValue: sequelize.literal('gen_random_uuid()') },
    api_id: { type: 'INTEGER', allowNull: false, unique: true },
    league_id: { type: 'UUID', references: { model: 'leagues', key: 'id' } },
    country_id: { type: 'UUID', references: { model: 'countries', key: 'id' } },
    venue_id: { type: 'UUID', references: { model: 'venues', key: 'id' } },
    name: { type: 'VARCHAR(255)', allowNull: false },
    code: { type: 'VARCHAR(50)' },
    logo: { type: 'VARCHAR(255)' },
    founded: { type: 'INTEGER' },
    favorites: { type: 'INTEGER', defaultValue: 0 },
    created_at: { type: 'TIMESTAMP WITH TIME ZONE', defaultValue: sequelize.literal('NOW()') },
    updated_at: { type: 'TIMESTAMP WITH TIME ZONE', defaultValue: sequelize.literal('NOW()') },
    deleted_at: { type: 'TIMESTAMP WITH TIME ZONE' }
  }).catch(() => {});

  // players table
  await qi.createTable('players', {
    id: { type: 'UUID', primaryKey: true, defaultValue: sequelize.literal('gen_random_uuid()') },
    api_id: { type: 'INTEGER', allowNull: false, unique: true },
    team_id: { type: 'UUID', references: { model: 'teams', key: 'id' } },
    country_id: { type: 'UUID', references: { model: 'countries', key: 'id' } },
    first_name: { type: 'VARCHAR(255)', allowNull: false },
    last_name: { type: 'VARCHAR(255)', allowNull: false },
    age: { type: 'INTEGER' },
    position: { type: 'VARCHAR(255)' },
    number: { type: 'INTEGER' },
    height: { type: 'VARCHAR(50)' },
    weight: { type: 'VARCHAR(50)' },
    injured: { type: 'BOOLEAN' },
    photo: { type: 'VARCHAR(255)' },
    created_at: { type: 'TIMESTAMP WITH TIME ZONE', defaultValue: sequelize.literal('NOW()') },
    updated_at: { type: 'TIMESTAMP WITH TIME ZONE', defaultValue: sequelize.literal('NOW()') },
    deleted_at: { type: 'TIMESTAMP WITH TIME ZONE' }
  }).catch(() => {});

  // add new columns to existing tables
  await qi.addColumn('sports', 'api_sport_id', { type: 'INTEGER' }).catch(() => {});
  await qi.addColumn('sports', 'country_id', { type: 'UUID' }).catch(() => {});
  await qi.addColumn('sports', 'default_season', { type: 'INTEGER' }).catch(() => {});
  await qi.addColumn('sports', 'big_win_message', { type: 'VARCHAR(255)' }).catch(() => {});

  await qi.addColumn('sports_events', 'league_id', { type: 'UUID' }).catch(() => {});
  await qi.addColumn('sports_events', 'home_team_id', { type: 'UUID' }).catch(() => {});
  await qi.addColumn('sports_events', 'away_team_id', { type: 'UUID' }).catch(() => {});
  await qi.addColumn('sports_events', 'live_home_score', { type: 'INTEGER' }).catch(() => {});
  await qi.addColumn('sports_events', 'live_away_score', { type: 'INTEGER' }).catch(() => {});
  await qi.addColumn('sports_events', 'venue_id', { type: 'UUID' }).catch(() => {});
  await qi.addColumn('sports_events', 'referee', { type: 'VARCHAR(255)' }).catch(() => {});
  await qi.addColumn('sports_events', 'timezone', { type: 'VARCHAR(50)' }).catch(() => {});
  await qi.addColumn('sports_events', 'status_long', { type: 'VARCHAR(50)' }).catch(() => {});
  await qi.addColumn('sports_events', 'status_short', { type: 'VARCHAR(10)' }).catch(() => {});
  await qi.addColumn('sports_events', 'elapsed', { type: 'INTEGER' }).catch(() => {});
  await qi.addColumn('sports_events', 'big_win_message', { type: 'VARCHAR(255)' }).catch(() => {});

  await qi.addColumn('odds', 'bookmaker_id', { type: 'INTEGER' }).catch(() => {});
  await qi.addColumn('odds', 'market_type', { type: 'VARCHAR(50)' }).catch(() => {});
  await qi.addColumn('odds', 'is_live_odds', { type: 'BOOLEAN', defaultValue: false }).catch(() => {});
  await qi.addColumn('odds', 'opening_price', { type: 'FLOAT' }).catch(() => {});
  await qi.addColumn('odds', 'created_by', { type: 'UUID' }).catch(() => {});
  await qi.addColumn('odds', 'updated_by', { type: 'UUID' }).catch(() => {});
}

migrate().then(() => {
  console.log('Migration completed');
  process.exit(0);
}).catch(err => {
  console.error('Migration failed', err);
  process.exit(1);
});
