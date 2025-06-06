const { Sequelize } = require('sequelize');

// Centralized database configuration. Supports DATABASE_URL for Railway or
// individual connection parameters for local development.
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: false,
      define: { underscored: true, freezeTableName: true }
    })
  : new Sequelize(
      process.env.DB_NAME || 'winzo',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: false,
        define: { underscored: true, freezeTableName: true }
      }
    );

module.exports = sequelize;
