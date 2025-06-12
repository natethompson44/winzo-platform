#!/usr/bin/env node
const { exec } = require('child_process');
const path = require('path');

console.log('\n🚀 Starting WINZO Backend on Railway...');
console.log('\n📊 Environment:', process.env.NODE_ENV || 'development');
console.log('\n⏰ Start time:', new Date().toISOString());

// Function to run migration with better error handling and timeout
function runMigration() {
  return new Promise((resolve) => {
    console.log('\n📊 Running database migrations...');
    const migrationPath = path.join(__dirname, 'src', 'database', 'migrate.js');
    
    // Add timeout to prevent hanging
    const migrationProcess = exec(`node ${migrationPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error('\n❌ Migration failed:', error.message);
        console.log('\n⚠️ Continuing with server start (migration may have already run)...');
      } else {
        console.log('\n✅ Migration completed successfully');
        if (stdout) console.log(stdout);
      }
      resolve(); // Always resolve to continue with server start
    });
    
    // Set a timeout for migration (5 minutes max)
    setTimeout(() => {
      console.log('\n⏰ Migration timeout reached, continuing with server start...');
      migrationProcess.kill();
      resolve();
    }, 300000); // 5 minutes
  });
}

// Function to start the server
function startServer() {
  console.log('\n🌟 Starting Express server...');
  console.log('\n⏰ Server start time:', new Date().toISOString());
  try {
    const serverPath = path.join(__dirname, 'src', 'server.js');
    require(serverPath);
  } catch (error) {
    console.error('\n❌ Server startup failed:', error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  try {
    // Wait for Railway environment to be ready
    console.log('\n⏳ Waiting for Railway environment...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Run migrations with timeout
    await runMigration();
    
    // Start the server
    startServer();
  } catch (error) {
    console.error('\n❌ Startup failed:', error);
    process.exit(1);
  }
}

// Add overall timeout
setTimeout(() => {
  console.error('\n💥 Startup timeout reached after 10 minutes');
  process.exit(1);
}, 600000); // 10 minutes

main();
