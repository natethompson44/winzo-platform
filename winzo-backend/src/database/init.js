const { sequelize, applyAssociations } = require('../models');

/**
 * Run database migrations to ensure all required columns exist
 */
async function runMigrations() {
  const qi = sequelize.getQueryInterface();
  
  try {
    // Check if api_sport_id column exists in sports table
    const tableDescription = await qi.describeTable('sports');
    
    if (!tableDescription.api_sport_id) {
      console.log('Running database migrations...');
      
      // Add missing columns to sports table
      await qi.addColumn('sports', 'api_sport_id', { 
        type: sequelize.Sequelize.INTEGER,
        allowNull: true,
        unique: true
      }).catch(() => {});
      
      await qi.addColumn('sports', 'country_id', { 
        type: sequelize.Sequelize.UUID,
        allowNull: true
      }).catch(() => {});
      
      await qi.addColumn('sports', 'default_season', { 
        type: sequelize.Sequelize.INTEGER,
        allowNull: true
      }).catch(() => {});
      
      await qi.addColumn('sports', 'big_win_message', { 
        type: sequelize.Sequelize.STRING,
        allowNull: true
      }).catch(() => {});
      
      console.log('Database migrations completed successfully');
    }
  } catch (error) {
    // If sports table doesn't exist yet, migrations will be handled by sync
    console.log('Sports table not found, will be created during sync');
  }
}

/**
 * Initialize connection to the PostgreSQL database and synchronize models.
 * Runs migrations first to ensure all required columns exist.
 * Exits the process if authentication fails because the app cannot work
 * without a persistent database connection.
 */
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');
    
    // Apply model associations
    applyAssociations();
    
    // Run migrations before sync to ensure columns exist
    await runMigrations();
    
    // Synchronize models with database
    await sequelize.sync();
    
    console.log('Database models synchronized successfully');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  }
}

module.exports = initDatabase;

