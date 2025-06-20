#!/usr/bin/env node
const { Sequelize } = require('sequelize');
const { exec } = require('child_process');
const path = require('path');

console.log('\n🚀 WINZO Backend - Reset and Start Process');

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

// SQL to drop all tables
const dropTablesSQL = `
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS bets CASCADE;
DROP TABLE IF EXISTS odds CASCADE;
DROP TABLE IF EXISTS bookmakers CASCADE;
DROP TABLE IF EXISTS sports_events CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sports CASCADE;
`;

async function resetDatabase() {
  try {
    console.log('\n🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('\n✅ Database connected');
    console.log('\n🗑️ Dropping existing tables...');
    await sequelize.query(dropTablesSQL);
    console.log('\n✅ Tables dropped successfully');
    await sequelize.close();
    console.log('\n✅ Database reset complete');
  } catch (error) {
    console.log('\n⚠️ Reset failed (tables may not exist):', error.message);
    // Continue anyway - tables might not exist yet
  }
}

function runMigration() {
  return new Promise((resolve) => {
    console.log('\n📊 Running database migrations...');
    const migrationPath = path.join(__dirname, 'src', 'database', 'migrate.js');
    exec(`node ${migrationPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error('\n❌ Migration failed:', error.message);
      } else {
        console.log('\n✅ Migration completed successfully');
        if (stdout) console.log(stdout);
      }
      resolve(); // Always continue
    });
  });
}

function startServer() {
  console.log('\n🌟 Starting Express server...');
  const serverPath = path.join(__dirname, 'src', 'server.js');
  try {
    require(serverPath);
  } catch (error) {
    console.error('\n❌ Server startup failed:', error);
    process.exit(1);
  }
}

async function main() {
  try {
    // Wait for Railway environment
    console.log('\n⏳ Waiting for Railway environment...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Reset database (drop tables)
    await resetDatabase();

    // Run migrations (recreate tables)
    await runMigration();

    // Start server
    startServer();
  } catch (error) {
    console.error('\n❌ Startup process failed:', error);
    process.exit(1);
  }
}

main();
