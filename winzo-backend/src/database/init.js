const { sequelize, applyAssociations } = require('../models');
/**
 * Initialize connection to the PostgreSQL database and synchronize models.
 * Exits the process if authentication fails because the app cannot work
 * without a persistent database connection.
 */
async function initDatabase() {
  try {
    await sequelize.authenticate();
    applyAssociations();
    await sequelize.sync();
    console.log('Database connection established and models synchronized');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  }
}

module.exports = initDatabase;
