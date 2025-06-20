// WINZO Backend API Integration Tests
const axios = require('axios');

// Test configuration
const API_BASE_URL = process.env.TEST_API_URL || 'https://winzo-platform-production.up.railway.app';
const TEST_USER = {
  username: 'testuser_' + Date.now(),
  password: 'TestPassword123!',
  email: 'test@example.com'
};

// Try existing test user first
const EXISTING_TEST_USER = {
  username: 'testuser2',
  password: 'testuser2'
};

let authToken = null;
let testUserId = null;

console.log('🧪 WINZO API Integration Tests Starting...');
console.log(`🔗 Testing against: ${API_BASE_URL}`);

// Helper function for API requests
async function apiRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
}

// Test suite functions
async function testHealthEndpoint() {
  console.log('\n🏥 Testing Health Endpoint...');
  
  const result = await apiRequest('GET', '/health');
  
  if (result.success) {
    console.log('✅ Health endpoint working');
    console.log(`   Status: ${result.data.status}`);
    console.log(`   Database: ${result.data.database}`);
    return true;
  } else {
    console.log('❌ Health endpoint failed:', result.error);
    return false;
  }
}

async function testUserRegistration() {
  console.log('\n👤 Testing User Registration...');
  
  // Try multiple invite codes
  const inviteCodes = ['WINZO2024', 'TESTCODE', 'DEMO', '', 'MASTER'];
  
  for (const invite_code of inviteCodes) {
    console.log(`   Trying invite code: "${invite_code}"`);
    
    const result = await apiRequest('POST', '/api/auth/register', {
      username: TEST_USER.username,
      password: TEST_USER.password,
      email: TEST_USER.email,
      invite_code: invite_code
    });
    
    if (result.success && result.data.success) {
      console.log('✅ User registration successful');
      authToken = result.data.data.token;
      testUserId = result.data.data.user.id;
      console.log(`   User ID: ${testUserId}`);
      console.log(`   Token: ${authToken ? 'Received' : 'Missing'}`);
      console.log(`   Working invite code: "${invite_code}"`);
      return true;
    } else if (result.error && result.error.message && result.error.message.includes('already taken')) {
      console.log(`   Username taken, trying different username...`);
      TEST_USER.username = 'testuser_' + Date.now();
      continue;
    }
    
    console.log(`   Failed with invite code "${invite_code}":`, result.error);
  }
  
  console.log('❌ User registration failed with all invite codes');
  return false;
}

async function testUserLogin() {
  console.log('\n🔐 Testing User Login...');
  
  // First try with existing test user
  console.log('   Trying existing test user...');
  let result = await apiRequest('POST', '/api/auth/login', {
    username: EXISTING_TEST_USER.username,
    password: EXISTING_TEST_USER.password
  });
  
  if (result.success && result.data.success) {
    console.log('✅ Login successful with existing test user');
    authToken = result.data.data.token;
    console.log(`   Token: ${authToken ? 'Received' : 'Missing'}`);
    return true;
  }
  
  console.log('   Existing test user failed, trying registered user...');
  
  // Try with our registered user
  result = await apiRequest('POST', '/api/auth/login', {
    username: TEST_USER.username,
    password: TEST_USER.password
  });
  
  if (result.success && result.data.success) {
    console.log('✅ User login successful');
    authToken = result.data.data.token;
    console.log(`   Token: ${authToken ? 'Received' : 'Missing'}`);
    return true;
  } else {
    console.log('❌ User login failed:', result.error);
    return false;
  }
}

async function testUserProfile() {
  console.log('\n👤 Testing User Profile...');
  
  if (!authToken) {
    console.log('❌ No auth token available');
    return false;
  }
  
  const result = await apiRequest('GET', '/api/auth/me', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (result.success && result.data.success) {
    console.log('✅ User profile retrieved');
    console.log(`   Username: ${result.data.data.username}`);
    console.log(`   Balance: $${result.data.data.wallet_balance}`);
    return true;
  } else {
    console.log('❌ User profile failed:', result.error);
    return false;
  }
}

async function testSportsEndpoints() {
  console.log('\n🏈 Testing Sports Endpoints...');
  
  // Test sports list
  const sportsResult = await apiRequest('GET', '/api/sports');
  
  if (sportsResult.success) {
    console.log('✅ Sports list endpoint working');
    console.log(`   Sports available: ${sportsResult.data.data?.length || 'Unknown'}`);
  } else {
    console.log('❌ Sports list failed:', sportsResult.error);
    return false;
  }
  
  // Test odds for a specific sport
  const oddsResult = await apiRequest('GET', '/api/sports/americanfootball_nfl/odds');
  
  if (oddsResult.success) {
    console.log('✅ Odds endpoint working');
    console.log(`   Events found: ${oddsResult.data.data?.length || 'Unknown'}`);
    return true;
  } else {
    console.log('❌ Odds endpoint failed:', oddsResult.error);
    return false;
  }
}

async function testWalletEndpoints() {
  console.log('\n💰 Testing Wallet Endpoints...');
  
  if (!authToken) {
    console.log('❌ No auth token available');
    return false;
  }
  
  // Test wallet balance
  const balanceResult = await apiRequest('GET', '/api/wallet/balance', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (balanceResult.success) {
    console.log('✅ Wallet balance endpoint working');
    console.log(`   Balance: ${balanceResult.data.data?.formatted || 'Unknown'}`);
  } else {
    console.log('❌ Wallet balance failed:', balanceResult.error);
  }
  
  // Test wallet transactions
  const transactionsResult = await apiRequest('GET', '/api/wallet/transactions', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (transactionsResult.success) {
    console.log('✅ Wallet transactions endpoint working');
    return true;
  } else {
    console.log('❌ Wallet transactions failed:', transactionsResult.error);
    return false;
  }
}

async function testDashboardEndpoints() {
  console.log('\n📊 Testing Dashboard Endpoints...');
  
  if (!authToken) {
    console.log('❌ No auth token available');
    return false;
  }
  
  const dashboardResult = await apiRequest('GET', '/api/dashboard', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (dashboardResult.success) {
    console.log('✅ Dashboard endpoint working');
    console.log(`   User stats loaded: ${dashboardResult.data.success ? 'Yes' : 'No'}`);
    return true;
  } else {
    console.log('❌ Dashboard failed:', dashboardResult.error);
    return false;
  }
}

async function testBettingEndpoints() {
  console.log('\n🎯 Testing Betting Endpoints...');
  
  if (!authToken) {
    console.log('❌ No auth token available');
    return false;
  }
  
  // Test betting history
  const historyResult = await apiRequest('GET', '/api/bets/history', null, {
    'Authorization': `Bearer ${authToken}`
  });
  
  if (historyResult.success) {
    console.log('✅ Betting history endpoint working');
    console.log(`   Bets found: ${historyResult.data.data?.length || 0}`);
    return true;
  } else {
    console.log('❌ Betting history failed:', historyResult.error);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🧪 WINZO Backend API Integration Tests');
  console.log('==========================================');
  
  const tests = [
    { name: 'Health Endpoint', fn: testHealthEndpoint },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'User Profile', fn: testUserProfile },
    { name: 'Sports Endpoints', fn: testSportsEndpoints },
    { name: 'Wallet Endpoints', fn: testWalletEndpoints },
    { name: 'Dashboard Endpoints', fn: testDashboardEndpoints },
    { name: 'Betting Endpoints', fn: testBettingEndpoints }
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, success: result });
    } catch (error) {
      console.log(`❌ ${test.name} threw an error:`, error.message);
      results.push({ name: test.name, success: false, error: error.message });
    }
  }
  
  // Summary
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Backend is fully functional.');
  } else {
    console.log('⚠️  Some tests failed. Backend needs attention.');
  }
  
  return passed === total;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  apiRequest,
  API_BASE_URL
}; 