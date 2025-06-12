const { sequelize } = require('../models');
const migrate = require('./migrations');

// Check if we're in a build environment (Railway build phase)
if (process.env.RAILWAY_ENVIRONMENT === 'build') {
  console.log('\n⏭️ Skipping migration during build phase');
  process.exit(0);
}

// Add better error handling for connection issues
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

async function connectWithRetry(retries = MAX_RETRIES) {
  try {
    await sequelize.authenticate();
    console.log('\n✅ Database connection established successfully');
    return true;
  } catch (error) {
    console.error(`\n❌ Database connection failed (attempt ${MAX_RETRIES - retries + 1}/${MAX_RETRIES}):`, error.message);
    if (retries > 0) {
      console.log(`\n⏳ Retrying in ${RETRY_DELAY/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectWithRetry(retries - 1);
    } else {
      throw error;
    }
  }
}

async function runMigrations() {
  await connectWithRetry();
  await migrate();
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed', err);
      process.exit(1);
    });
}

module.exports = runMigrations;
