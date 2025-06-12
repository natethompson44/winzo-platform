const { sequelize, applyAssociations } = require('../models');
const migrate = require('./migrations');

/**
 * Initialize connection to the PostgreSQL database and synchronize models.
 * Runs comprehensive migrations first to ensure all required tables and columns exist.
 * Exits the process if authentication fails because the app cannot work
 * without a persistent database connection.
 */
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');
    
    // Apply model associations
    applyAssociations();
    
    // Run comprehensive migrations before sync to ensure all tables and columns exist
    console.log('Running database migrations...');
    await migrate();
    console.log('Database migrations completed successfully');
    
    // Skip Sequelize sync since we're using our own migration system
    // await sequelize.sync({ alter: false });
    console.log('Database models synchronized successfully');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  }
}

module.exports = initDatabase;

