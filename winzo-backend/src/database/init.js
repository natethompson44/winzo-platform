const { sequelize, applyAssociations } = require('../models')
const { runCompleteMigration } = require('./complete-migration')

/**
 * Initialize connection to the PostgreSQL database.
 * Runs all necessary migrations and applies model associations.
 * Exits the process if initialization fails because the app cannot work
 * without a proper database setup.
 */
async function initDatabase () {
  try {
    console.log('🔄 Starting database initialization...')
    
    // First, run all necessary migrations
    await runCompleteMigration()
    
    // Then establish connection and apply associations
    await sequelize.authenticate()
    console.log('✅ Database connection established')

    // Apply model associations
    applyAssociations()
    console.log('✅ Database models synchronized successfully')
    
    console.log('🎉 Database initialization completed successfully')
  } catch (err) {
    console.error('❌ Database initialization failed:', err)
    process.exit(1)
  }
}

module.exports = initDatabase
