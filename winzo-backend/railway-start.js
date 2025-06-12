#!/usr/bin/env node
const { exec } = require('child_process');
const path = require('path');

console.log('\n🚀 Starting WINZO Backend on Railway...');

// Function to run migration
function runMigration() {
  return new Promise((resolve) => {
    console.log('\n📊 Running database migrations...');
    const migrationPath = path.join(__dirname, 'src', 'database', 'migrate.js');
    exec(`node ${migrationPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error('\n❌ Migration failed:', error.message);
        // Don't reject - continue with server start even if migration fails
        console.log('\n⚠️ Continuing with server start...');
        resolve();
      } else {
        console.log('\n✅ Migration completed successfully');
        console.log(stdout);
        resolve();
      }
    });
  });
}

// Function to start the server
function startServer() {
  console.log('\n🌟 Starting Express server...');
  const serverPath = path.join(__dirname, 'src', 'server.js');
  require(serverPath);
}

// Main execution
async function main() {
  try {
    // Wait a moment for Railway to fully initialize the environment
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Run migrations first
    await runMigration();
    // Start the server
    startServer();
  } catch (error) {
    console.error('\n❌ Startup failed:', error);
    process.exit(1);
  }
}

main();
