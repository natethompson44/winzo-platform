const { Sequelize } = require('sequelize');
require('dotenv').config();

// Centralized database configuration with optional pooling and logging.
// Supports DATABASE_URL for Railway or individual connection parameters
// for local development. Pool values are configurable via environment
// variables so they can be tuned per deployment environment.

const baseConfig = {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  define: { underscored: true, freezeTableName: true },
  pool: {
    max: parseInt(process.env.DB_MAX_POOL || '3', 10),
    min: parseInt(process.env.DB_MIN_POOL || '0', 10),
    acquire: parseInt(process.env.DB_ACQUIRE || '60000', 10),
    idle: parseInt(process.env.DB_IDLE || '30000', 10)
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000
  },
  migrationStorageTableName: null,
  seederStorageTableName: null,
  timestamps: false,
  paranoid: false,
  sync: false,
  migrationRun: false
};

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, baseConfig)
  : new Sequelize(
      process.env.DB_NAME || 'winzo',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || '',
      {
        ...baseConfig,
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432
      }
    );

module.exports = sequelize;
