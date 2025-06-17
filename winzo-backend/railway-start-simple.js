#!/usr/bin/env node
const path = require('path');

console.log('\n🚀 Starting WINZO Backend on Railway (Simple Mode)...');
console.log('\n📊 Environment:', process.env.NODE_ENV || 'development');
console.log('\n⏰ Start time:', new Date().toISOString());

// Simple startup function
function startServer() {
  console.log('\n🌟 Starting Express server...');
  console.log('\n⏰ Server start time:', new Date().toISOString());
  
  try {
    const serverPath = path.join(__dirname, 'src', 'server.js');
    require(serverPath);
    console.log('\n✅ Server module loaded successfully');
  } catch (error) {
    console.error('\n❌ Server startup failed:', error);
    process.exit(1);
  }
}

// Main execution - simplified
async function main() {
  try {
    // Handle database reset if needed
    if (process.env.RESET_DATABASE === 'true') {
      console.log('\n🔄 RESET_DATABASE flag detected, resetting database...');
      try {
        const { resetDatabase } = require('./reset-database');
        // Add timeout for database reset
        const resetPromise = resetDatabase();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database reset timeout')), 60000)
        );
        await Promise.race([resetPromise, timeoutPromise]);
        console.log('\n✅ Database reset completed');
      } catch (resetError) {
        console.error('\n❌ Database reset failed:', resetError.message);
        console.log('\n⚠️ Continuing with server start...');
      }
    }
    
    // Wait briefly for Railway environment
    console.log('\n⏳ Waiting for Railway environment...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start server immediately
    startServer();
  } catch (error) {
    console.error('\n❌ Startup failed:', error);
    process.exit(1);
  }
}

// Shorter timeout for simple mode
setTimeout(() => {
  console.error('\n💥 Startup timeout reached after 3 minutes');
  process.exit(1);
}, 180000); // 3 minutes

main(); 