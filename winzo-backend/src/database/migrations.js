const { sequelize } = require('../models');

/**
 * Comprehensive migration script to create new tables and columns for API-Sports
 * integration. This script is safe to run multiple times and will only create
 * missing tables and columns.
 */
async function migrate() {
  const qi = sequelize.getQueryInterface();

  try {
    // countries table
    await qi.createTable('countries', {
      id: { 
        type: sequelize.Sequelize.UUID, 
        primaryKey: true, 
        defaultValue: sequelize.Sequelize.UUIDV4 
      },
      name: { type: sequelize.Sequelize.STRING(255), allowNull: false },
      code: { type: sequelize.Sequelize.STRING(3), allowNull: false, unique: true },
      flag_url: { type: sequelize.Sequelize.STRING(255) },
      created_at: { 
        type: sequelize.Sequelize.DATE, 
        defaultValue: sequelize.Sequelize.NOW 
      },
      updated_at: { 
        type: sequelize.Sequelize.DATE, 
        defaultValue: sequelize.Sequelize.NOW 
      },
      deleted_at: { type: sequelize.Sequelize.DATE }
    }).catch(() => {
      console.log('Countries table already exists');
    });

    // leagues table
    await qi.createTable('leagues', {
      id: { 
        type: sequelize.Sequelize.UUID, 
        primaryKey: true, 
        defaultValue: sequelize.Sequelize.UUIDV4 
      },
      api_id: { type: sequelize.Sequelize.INTEGER, allowNull: false, unique: true },
      sport_id: { 
        type: sequelize.Sequelize.UUID, 
        allowNull: false, 
        references: { model: 'sports', key: 'id' } 
      },
      country_id: { 
        type: sequelize.Sequelize.UUID, 
        references: { model: 'countries', key: 'id' } 
      },
      name: { type: sequelize.Sequelize.STRING(255), allowNull: false },
      logo: { type: sequelize.Sequelize.STRING(255) },
      flag: { type: sequelize.Sequelize.STRING(255) },
      season: { type: sequelize.Sequelize.INTEGER },
      seasons: { type: sequelize.Sequelize.JSONB },
      current_season: { type: sequelize.Sequelize.INTEGER },
      created_at: { 
        type: sequelize.Sequelize.DATE, 
        defaultValue: sequelize.Sequelize.NOW 
      },
      updated_at: { 
        type: sequelize.Sequelize.DATE, 
        defaultValue: sequelize.Sequelize.NOW 
      },
      deleted_at: { type: sequelize.Sequelize.DATE }
    }).catch(() => {
      console.log('Leagues table already exists');
    });

    // venues table
    await qi.createTable('venues', {
      id: { 
        type: sequelize.Sequelize.UUID, 
        primaryKey: true, 
        defaultValue: sequelize.Sequelize.UUIDV4 
      },
      api_id: { type: sequelize.Sequelize.INTEGER, allowNull: false, unique: true },
      country_id: { 
        type: sequelize.Sequelize.UUID, 
        references: { model: 'countries', key: 'id' } 
      },
      name: { type: sequelize.Sequelize.STRING(255), allowNull: false },
      city: { type: sequelize.Sequelize.STRING(255) },
      address: { type: sequelize.Sequelize.STRING(255) },
      capacity: { type: sequelize.Sequelize.INTEGER },
      surface: { type: sequelize.Sequelize.STRING(255) },
      image: { type: sequelize.Sequelize.STRING(255) },
      created_at: { 
        type: sequelize.Sequelize.DATE, 
        defaultValue: sequelize.Sequelize.NOW 
      },
      updated_at: { 
        type: sequelize.Sequelize.DATE, 
        defaultValue: sequelize.Sequelize.NOW 
      },
      deleted_at: { type: sequelize.Sequelize.DATE }
    }).catch(() => {
      console.log('Venues table already exists');
    });

    // teams table
    await qi.createTable('teams', {
      id: { 
        type: sequelize.Sequelize.UUID, 
        primaryKey: true, 
        defaultValue: sequelize.Sequelize.UUIDV4 
      },
      api_id: { type: sequelize.Sequelize.INTEGER, allowNull: false, unique: true },
      league_id: { 
        type: sequelize.Sequelize.UUID, 
        references: { model: 'leagues', key: 'id' } 
      },
      country_id: { 
        type: sequelize.Sequelize.UUID, 
        references: { model: 'countries', key: 'id' } 
      },
      venue_id: { 
        type: sequelize.Sequelize.UUID, 
        references: { model: 'venues', key: 'id' } 
      },
      name: { type: sequelize.Sequelize.STRING(255), allowNull: false },
      code: { type: sequelize.Sequelize.STRING(50) },
      logo: { type: sequelize.Sequelize.STRING(255) },
      founded: { type: sequelize.Sequelize.INTEGER },
      favorites: { type: sequelize.Sequelize.INTEGER, defaultValue: 0 },
      created_at: { 
        type: sequelize.Sequelize.DATE, 
        defaultValue: sequelize.Sequelize.NOW 
      },
      updated_at: { 
        type: sequelize.Sequelize.DATE, 
        defaultValue: sequelize.Sequelize.NOW 
      },
      deleted_at: { type: sequelize.Sequelize.DATE }
    }).catch(() => {
      console.log('Teams table already exists');
    });

    // players table
    await qi.createTable('players', {
      id: { 
        type: sequelize.Sequelize.UUID, 
        primaryKey: true, 
        defaultValue: sequelize.Sequelize.UUIDV4 
      },
      api_id: { type: sequelize.Sequelize.INTEGER, allowNull: false, unique: true },
      team_id: { 
        type: sequelize.Sequelize.UUID, 
        references: { model: 'teams', key: 'id' } 
      },
      country_id: { 
        type: sequelize.Sequelize.UUID, 
        references: { model: 'countries', key: 'id' } 
      },
      first_name: { type: sequelize.Sequelize.STRING(255), allowNull: false },
      last_name: { type: sequelize.Sequelize.STRING(255), allowNull: false },
      age: { type: sequelize.Sequelize.INTEGER },
      position: { type: sequelize.Sequelize.STRING(255) },
      number: { type: sequelize.Sequelize.INTEGER },
      height: { type: sequelize.Sequelize.STRING(50) },
      weight: { type: sequelize.Sequelize.STRING(50) },
      injured: { type: sequelize.Sequelize.BOOLEAN },
      photo: { type: sequelize.Sequelize.STRING(255) },
      created_at: { 
        type: sequelize.Sequelize.DATE, 
        defaultValue: sequelize.Sequelize.NOW 
      },
      updated_at: { 
        type: sequelize.Sequelize.DATE, 
        defaultValue: sequelize.Sequelize.NOW 
      },
      deleted_at: { type: sequelize.Sequelize.DATE }
    }).catch(() => {
      console.log('Players table already exists');
    });

    // Add new columns to existing tables (safe to run multiple times)
    const addColumnSafely = async (table, column, definition) => {
      try {
        await qi.addColumn(table, column, definition);
        console.log(`Added column ${column} to ${table} table`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`Column ${column} already exists in ${table} table`);
        } else {
          console.log(`Could not add column ${column} to ${table}: ${error.message}`);
        }
      }
    };

    // Add columns to sports table
    await addColumnSafely('sports', 'api_sport_id', { 
      type: sequelize.Sequelize.INTEGER,
      allowNull: true,
      unique: true
    });
    await addColumnSafely('sports', 'country_id', { 
      type: sequelize.Sequelize.UUID,
      allowNull: true
    });
    await addColumnSafely('sports', 'default_season', { 
      type: sequelize.Sequelize.INTEGER,
      allowNull: true
    });
    await addColumnSafely('sports', 'big_win_message', { 
      type: sequelize.Sequelize.STRING(255),
      allowNull: true
    });

    // Add columns to sports_events table
    await addColumnSafely('sports_events', 'league_id', { 
      type: sequelize.Sequelize.UUID,
      allowNull: true
    });
    await addColumnSafely('sports_events', 'home_team_id', { 
      type: sequelize.Sequelize.UUID,
      allowNull: true
    });
    await addColumnSafely('sports_events', 'away_team_id', { 
      type: sequelize.Sequelize.UUID,
      allowNull: true
    });
    await addColumnSafely('sports_events', 'live_home_score', { 
      type: sequelize.Sequelize.INTEGER,
      allowNull: true
    });
    await addColumnSafely('sports_events', 'live_away_score', { 
      type: sequelize.Sequelize.INTEGER,
      allowNull: true
    });
    await addColumnSafely('sports_events', 'venue_id', { 
      type: sequelize.Sequelize.UUID,
      allowNull: true
    });
    await addColumnSafely('sports_events', 'referee', { 
      type: sequelize.Sequelize.STRING(255),
      allowNull: true
    });
    await addColumnSafely('sports_events', 'timezone', { 
      type: sequelize.Sequelize.STRING(50),
      allowNull: true
    });
    await addColumnSafely('sports_events', 'status_long', { 
      type: sequelize.Sequelize.STRING(50),
      allowNull: true
    });
    await addColumnSafely('sports_events', 'status_short', { 
      type: sequelize.Sequelize.STRING(10),
      allowNull: true
    });
    await addColumnSafely('sports_events', 'elapsed', { 
      type: sequelize.Sequelize.INTEGER,
      allowNull: true
    });
    await addColumnSafely('sports_events', 'big_win_message', { 
      type: sequelize.Sequelize.STRING(255),
      allowNull: true
    });

    // Add columns to odds table
    await addColumnSafely('odds', 'bookmaker_id', { 
      type: sequelize.Sequelize.INTEGER,
      allowNull: true
    });
    await addColumnSafely('odds', 'market_type', { 
      type: sequelize.Sequelize.STRING(50),
      allowNull: true
    });
    await addColumnSafely('odds', 'is_live_odds', { 
      type: sequelize.Sequelize.BOOLEAN,
      defaultValue: false
    });
    await addColumnSafely('odds', 'opening_price', { 
      type: sequelize.Sequelize.FLOAT,
      allowNull: true
    });
    await addColumnSafely('odds', 'created_by', { 
      type: sequelize.Sequelize.UUID,
      allowNull: true
    });
    await addColumnSafely('odds', 'updated_by', { 
      type: sequelize.Sequelize.UUID,
      allowNull: true
    });

    console.log('Migration completed successfully');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Only run migration if this file is executed directly
if (require.main === module) {
  migrate().then(() => {
    console.log('Migration completed');
    process.exit(0);
  }).catch(err => {
    console.error('Migration failed', err);
    process.exit(1);
  });
}

module.exports = migrate;

