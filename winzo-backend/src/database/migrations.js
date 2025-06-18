const { sequelize } = require('../models')

// Add this function to execute the odds API migration
async function executeOddsApiMigration () {
  try {
    console.log(' Executing Odds API migration...')
    const fs = require('fs')
    const path = require('path')
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'odds_api_migration.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    // Execute the migration
    await sequelize.query(migrationSQL)
    console.log(' Odds API migration completed successfully')
  } catch (error) {
    console.error(' Odds API migration failed:', error)
    throw error
  }
}

/**
 * Comprehensive migration script to create new tables and columns for API-Sports
 * integration. This script is safe to run multiple times and will only create
 * missing tables and columns.
 */
async function migrate () {
  const qi = sequelize.getQueryInterface()

  try {
    // Helper function to safely add columns
    const addColumnSafely = async (table, column, definition) => {
      try {
        await qi.addColumn(table, column, definition)
        console.log(`Added column ${column} to ${table} table`)
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate column')) {
          console.log(`Column ${column} already exists in ${table} table`)
        } else {
          console.log(`Could not add column ${column} to ${table}: ${error.message}`)
        }
      }
    }

    // Helper function to safely create tables
    const createTableSafely = async (tableName, definition) => {
      try {
        await qi.createTable(tableName, definition)
        console.log(`Created ${tableName} table`)
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`${tableName} table already exists`)
        } else {
          console.log(`Could not create ${tableName} table: ${error.message}`)
        }
      }
    }

    // countries table
    await createTableSafely('countries', {
      id: {
        type: sequelize.Sequelize.UUID,
        primaryKey: true,
        defaultValue: sequelize.Sequelize.UUIDV4
      },
      name: { type: sequelize.Sequelize.STRING(255), allowNull: false },
      code: { type: sequelize.Sequelize.STRING(3), allowNull: false, unique: true },
      flag_url: { type: sequelize.Sequelize.STRING(255) },
      created_by: { type: sequelize.Sequelize.UUID, allowNull: true },
      updated_by: { type: sequelize.Sequelize.UUID, allowNull: true },
      created_at: {
        type: sequelize.Sequelize.DATE,
        defaultValue: sequelize.Sequelize.NOW
      },
      updated_at: {
        type: sequelize.Sequelize.DATE,
        defaultValue: sequelize.Sequelize.NOW
      },
      deleted_at: { type: sequelize.Sequelize.DATE }
    })

    // leagues table
    await createTableSafely('leagues', {
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
      created_by: { type: sequelize.Sequelize.UUID, allowNull: true },
      updated_by: { type: sequelize.Sequelize.UUID, allowNull: true },
      created_at: {
        type: sequelize.Sequelize.DATE,
        defaultValue: sequelize.Sequelize.NOW
      },
      updated_at: {
        type: sequelize.Sequelize.DATE,
        defaultValue: sequelize.Sequelize.NOW
      },
      deleted_at: { type: sequelize.Sequelize.DATE }
    })

    // venues table
    await createTableSafely('venues', {
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
      created_by: { type: sequelize.Sequelize.UUID, allowNull: true },
      updated_by: { type: sequelize.Sequelize.UUID, allowNull: true },
      created_at: {
        type: sequelize.Sequelize.DATE,
        defaultValue: sequelize.Sequelize.NOW
      },
      updated_at: {
        type: sequelize.Sequelize.DATE,
        defaultValue: sequelize.Sequelize.NOW
      },
      deleted_at: { type: sequelize.Sequelize.DATE }
    })

    // teams table
    await createTableSafely('teams', {
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
      created_by: { type: sequelize.Sequelize.UUID, allowNull: true },
      updated_by: { type: sequelize.Sequelize.UUID, allowNull: true },
      created_at: {
        type: sequelize.Sequelize.DATE,
        defaultValue: sequelize.Sequelize.NOW
      },
      updated_at: {
        type: sequelize.Sequelize.DATE,
        defaultValue: sequelize.Sequelize.NOW
      },
      deleted_at: { type: sequelize.Sequelize.DATE }
    })

    // players table
    await createTableSafely('players', {
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
      created_by: { type: sequelize.Sequelize.UUID, allowNull: true },
      updated_by: { type: sequelize.Sequelize.UUID, allowNull: true },
      created_at: {
        type: sequelize.Sequelize.DATE,
        defaultValue: sequelize.Sequelize.NOW
      },
      updated_at: {
        type: sequelize.Sequelize.DATE,
        defaultValue: sequelize.Sequelize.NOW
      },
      deleted_at: { type: sequelize.Sequelize.DATE }
    })

    // Add columns to sports table
    await addColumnSafely('sports', 'api_sport_id', {
      type: sequelize.Sequelize.INTEGER,
      allowNull: true,
      unique: true
    })
    await addColumnSafely('sports', 'country_id', {
      type: sequelize.Sequelize.UUID,
      allowNull: true
    })
    await addColumnSafely('sports', 'default_season', {
      type: sequelize.Sequelize.INTEGER,
      allowNull: true
    })
    await addColumnSafely('sports', 'big_win_message', {
      type: sequelize.Sequelize.STRING(255),
      allowNull: true
    })
    await addColumnSafely('sports', 'has_outrights', {
      type: sequelize.Sequelize.BOOLEAN,
      defaultValue: false
    })
    await addColumnSafely('sports', 'created_by', {
      type: sequelize.Sequelize.UUID,
      allowNull: true
    })
    await addColumnSafely('sports', 'updated_by', {
      type: sequelize.Sequelize.UUID,
      allowNull: true
    })

    // Add columns to sports_events table
    await addColumnSafely('sports_events', 'league_id', {
      type: sequelize.Sequelize.UUID,
      allowNull: true
    })
    await addColumnSafely('sports_events', 'external_id', {
      type: sequelize.Sequelize.STRING,
      allowNull: true,
      unique: true
    })
    await addColumnSafely('sports_events', 'home_team', {
      type: sequelize.Sequelize.STRING,
      allowNull: true
    })
    await addColumnSafely('sports_events', 'away_team', {
      type: sequelize.Sequelize.STRING,
      allowNull: true
    })
    await addColumnSafely('sports_events', 'commence_time', {
      type: sequelize.Sequelize.DATE,
      allowNull: true
    })
    await addColumnSafely('sports_events', 'home_team_id', {
      type: sequelize.Sequelize.UUID,
      allowNull: true
    })
    await addColumnSafely('sports_events', 'away_team_id', {
      type: sequelize.Sequelize.UUID,
      allowNull: true
    })
    await addColumnSafely('sports_events', 'home_score', {
      type: sequelize.Sequelize.INTEGER,
      allowNull: true
    })
    await addColumnSafely('sports_events', 'away_score', {
      type: sequelize.Sequelize.INTEGER,
      allowNull: true
    })
    await addColumnSafely('sports_events', 'live_home_score', {
      type: sequelize.Sequelize.INTEGER,
      allowNull: true
    })
    await addColumnSafely('sports_events', 'live_away_score', {
      type: sequelize.Sequelize.INTEGER,
      allowNull: true
    })
    await addColumnSafely('sports_events', 'venue_id', {
      type: sequelize.Sequelize.UUID,
      allowNull: true
    })
    await addColumnSafely('sports_events', 'referee', {
      type: sequelize.Sequelize.STRING(255),
      allowNull: true
    })
    await addColumnSafely('sports_events', 'timezone', {
      type: sequelize.Sequelize.STRING(50),
      allowNull: true
    })
    await addColumnSafely('sports_events', 'status_long', {
      type: sequelize.Sequelize.STRING(50),
      allowNull: true
    })
    await addColumnSafely('sports_events', 'status_short', {
      type: sequelize.Sequelize.STRING(10),
      allowNull: true
    })
    await addColumnSafely('sports_events', 'elapsed', {
      type: sequelize.Sequelize.INTEGER,
      allowNull: true
    })
    await addColumnSafely('sports_events', 'big_win_message', {
      type: sequelize.Sequelize.STRING(255),
      allowNull: true
    })
    await addColumnSafely('sports_events', 'last_updated', {
      type: sequelize.Sequelize.DATE,
      defaultValue: sequelize.Sequelize.NOW
    })
    await addColumnSafely('sports_events', 'created_by', {
      type: sequelize.Sequelize.UUID,
      allowNull: true
    })
    await addColumnSafely('sports_events', 'updated_by', {
      type: sequelize.Sequelize.UUID,
      allowNull: true
    })

    // Add columns to odds table
    await addColumnSafely('odds', 'bookmaker_id', {
      type: sequelize.Sequelize.INTEGER,
      allowNull: true
    })
    await addColumnSafely('odds', 'bookmaker_title', {
      type: sequelize.Sequelize.STRING(255),
      allowNull: true
    })
    await addColumnSafely('odds', 'decimal_price', {
      type: sequelize.Sequelize.FLOAT,
      allowNull: true
    })
    await addColumnSafely('odds', 'market_type', {
      type: sequelize.Sequelize.STRING(50),
      allowNull: true
    })
    await addColumnSafely('odds', 'is_live_odds', {
      type: sequelize.Sequelize.BOOLEAN,
      defaultValue: false
    })
    await addColumnSafely('odds', 'opening_price', {
      type: sequelize.Sequelize.FLOAT,
      allowNull: true
    })
    await addColumnSafely('odds', 'last_updated', {
      type: sequelize.Sequelize.DATE,
      defaultValue: sequelize.Sequelize.NOW
    })
    await addColumnSafely('odds', 'created_by', {
      type: sequelize.Sequelize.UUID,
      allowNull: true
    })
    await addColumnSafely('odds', 'updated_by', {
      type: sequelize.Sequelize.UUID,
      allowNull: true
    })

    // Add columns to bets table
    await addColumnSafely('bets', 'decimal_odds', {
      type: sequelize.Sequelize.FLOAT,
      allowNull: true
    })
    await addColumnSafely('bets', 'potential_payout', {
      type: sequelize.Sequelize.DECIMAL(10, 2),
      allowNull: true
    })
    await addColumnSafely('bets', 'potential_profit', {
      type: sequelize.Sequelize.DECIMAL(10, 2),
      allowNull: true
    })
    await addColumnSafely('bets', 'settled_at', {
      type: sequelize.Sequelize.DATE,
      allowNull: true
    })
    await addColumnSafely('bets', 'actual_payout', {
      type: sequelize.Sequelize.DECIMAL(10, 2),
      allowNull: true
    })
    await addColumnSafely('bets', 'placed_at', {
      type: sequelize.Sequelize.DATE,
      defaultValue: sequelize.Sequelize.NOW
    })

    // Execute SQL migration for The Odds API schema updates
    await executeOddsApiMigration()

    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}

// Only run migration if this file is executed directly
if (require.main === module) {
  migrate().then(() => {
    console.log('Migration completed')
    process.exit(0)
  }).catch(err => {
    console.error('Migration failed', err)
    process.exit(1)
  })
}

module.exports = migrate
