// Direct Registration Test - Debug Mode
const axios = require('axios');

const API_BASE_URL = 'https://winzo-platform-production.up.railway.app';

async function testDirectRegistration() {
  console.log('🔍 WINZO Direct Registration Debug Test');
  console.log('========================================');
  
  const testUsers = [
    {
      username: 'debuguser1_' + Date.now(),
      password: 'TestPass123!',
      email: 'debug1@test.com',
      invite_code: 'WINZO2024'
    },
    {
      username: 'debuguser2_' + Date.now(),
      password: 'TestPass123!',
      email: 'debug2@test.com',
      invite_code: 'TESTCODE'
    },
    {
      username: 'debuguser3_' + Date.now(),
      password: 'TestPass123!',
      email: 'debug3@test.com',
      invite_code: 'DEMO'
    }
  ];
  
  for (const user of testUsers) {
    console.log(`\n🧪 Testing registration for: ${user.username}`);
    console.log('📋 Payload:', JSON.stringify(user, null, 2));
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, user, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Registration successful!');
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
      
      // Test login with the new user
      try {
        const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          username: user.username,
          password: user.password
        });
        console.log('✅ Login also successful!');
        console.log('🔑 Login token:', loginResponse.data.data?.token ? 'Received' : 'Missing');
      } catch (loginError) {
        console.log('❌ Login failed:', loginError.response?.data || loginError.message);
      }
      
      break; // Exit on first success
      
    } catch (error) {
      console.log('❌ Registration failed');
      console.log('📊 Status:', error.response?.status);
      console.log('📋 Headers:', JSON.stringify(error.response?.headers, null, 2));
      console.log('📄 Response:', JSON.stringify(error.response?.data, null, 2));
      console.log('🔍 Error message:', error.message);
      
      if (error.code) {
        console.log('🔍 Error code:', error.code);
      }
      
      if (error.response?.data?.error) {
        console.log('🔍 Detailed error:', error.response.data.error);
      }
    }
  }
  
  console.log('\n🏁 Direct registration test complete');
}

// Test with existing user to verify login works
async function testExistingLogin() {
  console.log('\n🔐 Testing existing user login...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      username: 'testuser2',
      password: 'testuser2'
    });
    
    console.log('✅ Existing login successful');
    console.log('🔑 Token:', response.data.data?.token ? 'Received' : 'Missing');
    
    // Test profile endpoint
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${response.data.data.token}`
        }
      });
      console.log('✅ Profile endpoint working');
      console.log('👤 Username:', profileResponse.data.data.username);
      console.log('💰 Balance:', profileResponse.data.data.wallet_balance);
    } catch (profileError) {
      console.log('❌ Profile endpoint failed:', profileError.response?.data || profileError.message);
    }
    
  } catch (error) {
    console.log('❌ Existing login failed:', error.response?.data || error.message);
  }
}

// Run all tests
async function runTests() {
  await testExistingLogin();
  await testDirectRegistration();
}

runTests().catch(console.error); 