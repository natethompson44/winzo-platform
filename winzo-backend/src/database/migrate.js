const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, // Reduce logging for faster startup
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

async function checkIfDatabaseIsEmpty() {
  try {
    const result = await sequelize.query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'");
    return result[0][0].count === '0';
  } catch (error) {
    // If query fails, database might not exist or be empty
    return true;
  }
}

async function runMigrations() {
  try {
    console.log('\n🔄 Checking database state...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('\n✅ Database connection established');
    
    // Check if database is empty or if we should force migration
    const isEmpty = await checkIfDatabaseIsEmpty();
    const forceMigration = process.env.FORCE_MIGRATION === 'true';
    
    if (!isEmpty && !forceMigration) {
      console.log('\n✅ Database already initialized, skipping migration');
      return;
    }
    
    if (isEmpty) {
      console.log('\n📊 Database is empty, running initial migration...');
    } else {
      console.log('\n📊 Force migration requested, running migration...');
    }
    
    // Read and execute basic schema only
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('\n📊 Executing basic database schema...');
    await sequelize.query(schema);
    console.log('\n✅ Database migration completed successfully');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('\n🎉 Migration process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations };
