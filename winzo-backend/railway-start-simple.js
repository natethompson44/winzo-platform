#!/usr/bin/env node
const path = require('path');

console.log('\n🚀 Starting WINZO Backend on Railway (Simple Mode)...');
console.log('\n📊 Environment:', process.env.NODE_ENV || 'development');
console.log('\n⏰ Start time:', new Date().toISOString());

// Function to start the server directly
function startServer() {
  console.log('\n🌟 Starting Express server (skipping migration)...');
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
    // Wait briefly for Railway environment
    console.log('\n⏳ Waiting for Railway environment...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start the server immediately
    startServer();
  } catch (error) {
    console.error('\n❌ Startup failed:', error);
    process.exit(1);
  }
}

// Add overall timeout
setTimeout(() => {
  console.error('\n💥 Startup timeout reached after 5 minutes');
  process.exit(1);
}, 300000); // 5 minutes

main(); 