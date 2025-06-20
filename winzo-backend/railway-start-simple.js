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
    // Check for RESET_DATABASE flag and warn if it's causing issues
    if (process.env.RESET_DATABASE === 'true') {
      console.log('\n⚠️  WARNING: RESET_DATABASE=true detected!');
      console.log('\n📋 This will reset your database on every startup.');
      console.log('\n💡 To fix Railway crashes, set RESET_DATABASE=false in Railway dashboard.');
      console.log('\n🔄 Proceeding with database reset (this may take time)...');
      
      try {
        const { resetDatabase } = require('./reset-database');
        // Add timeout for database reset (reduced to 45 seconds)
        const resetPromise = resetDatabase();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database reset timeout - Railway may kill the process')), 45000)
        );
        await Promise.race([resetPromise, timeoutPromise]);
        console.log('\n✅ Database reset completed');
      } catch (resetError) {
        console.error('\n❌ Database reset failed:', resetError.message);
        console.log('\n⚠️ Continuing with server start...');
      }
    } else {
      console.log('\n✅ RESET_DATABASE not set - normal startup mode');
    }
    
    // Wait briefly for Railway environment
    console.log('\n⏳ Waiting for Railway environment...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced wait time
    
    // Start server immediately
    startServer();
  } catch (error) {
    console.error('\n❌ Startup failed:', error);
    process.exit(1);
  }
}

// Shorter timeout for simple mode (2.5 minutes to avoid Railway timeout)
setTimeout(() => {
  console.error('\n💥 Startup timeout reached after 2.5 minutes');
  console.error('\n🔧 To fix this issue:');
  console.error('1. Go to Railway dashboard → Variables');
  console.error('2. Set RESET_DATABASE=false');
  console.error('3. Redeploy the service');
  process.exit(1);
}, 150000); // 2.5 minutes

main(); 