const { sequelize, applyAssociations } = require('../models');

/**
 * Initialize connection to the PostgreSQL database.
 * Only applies model associations, no migrations or sync.
 * Exits the process if authentication fails because the app cannot work
 * without a persistent database connection.
 */
async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established');
    
    // Apply model associations only
    applyAssociations();
    console.log('Database models synchronized successfully');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  }
}

module.exports = initDatabase;

