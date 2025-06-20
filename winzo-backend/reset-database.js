#!/usr/bin/env node
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

console.log('\n🔄 Resetting WINZO Database...');

// Database connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});

async function resetDatabase() {
  try {
    console.log('\n📊 Connecting to database...');
    await sequelize.authenticate();
    console.log('\n✅ Database connection established');
    
    // Drop all tables
    console.log('\n🗑️ Dropping all tables...');
    await sequelize.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `);
    console.log('\n✅ All tables dropped');
    
    // Run basic schema
    console.log('\n📊 Creating fresh schema...');
    const schemaPath = path.join(__dirname, 'src', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await sequelize.query(schema);
    console.log('\n✅ Fresh schema created');
    
    console.log('\n🎉 Database reset completed successfully!');
    console.log('\n📋 Test credentials:');
    console.log('Username: testuser2');
    console.log('Password: testuser2');
    
  } catch (error) {
    console.error('\n❌ Database reset failed:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('\n🎉 Reset process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Reset process failed:', error);
      process.exit(1);
    });
}

module.exports = { resetDatabase }; 