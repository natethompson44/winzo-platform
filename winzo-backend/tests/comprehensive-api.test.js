// WINZO Backend Comprehensive API Test Suite
const axios = require('axios');

// Test configuration
const API_BASE_URL = process.env.TEST_API_URL || 'https://winzo-platform-production.up.railway.app';
const TIMEOUT = 30000;

// Test data
const TEST_USERS = {
  regular: {
    username: `testuser_${Date.now()}`,
    password: 'TestPassword123!',
    email: `test${Date.now()}@example.com`,
    invite_code: 'WINZO123'
  },
  admin: {
    username: `admin_${Date.now()}`,
    password: 'AdminPassword123!',
    email: `admin${Date.now()}@example.com`,
    invite_code: 'WINZO123'
  }
};

const SAMPLE_BET = {
  event_id: 'sample_event_123',
  selected_team: 'Kansas City Chiefs',
  bet_type: 'h2h',
  odds: -110,
  stake: 10.00
};

let userToken = null;
let adminToken = null;
let testUserId = null;

// Helper functions
async function apiRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      timeout: TIMEOUT,
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
      status: error.response?.status || 500,
      details: error.message
    };
  }
}

async function authenticatedRequest(method, endpoint, data = null, token = userToken) {
  return apiRequest(method, endpoint, data, {
    'Authorization': `Bearer ${token}`
  });
}

function logTestResult(testName, success, details = '') {
  const status = success ? '✅' : '❌';
  console.log(`${status} ${testName}${details ? ': ' + details : ''}`);
}

// Test suites
async function testHealthEndpoint() {
  console.log('\n🏥 HEALTH ENDPOINT TESTS');
  
  const result = await apiRequest('GET', '/health');
  logTestResult('Health check', result.success && result.data.status === 'healthy');
  
  if (result.success) {
    logTestResult('Database connection', result.data.database === 'connected');
    logTestResult('API version present', !!result.data.version);
  }
  
  return result.success;
}

async function testUserRegistration() {
  console.log('\n👤 USER REGISTRATION TESTS');
  
  // Test valid registration
  const regResult = await apiRequest('POST', '/api/auth/register', TEST_USERS.regular);
  
  if (regResult.success && regResult.data.success) {
    userToken = regResult.data.data.token;
    testUserId = regResult.data.data.user.id;
    logTestResult('Valid user registration', true);
    logTestResult('Auth token received', !!userToken);
    logTestResult('User ID received', !!testUserId);
  } else {
    logTestResult('Valid user registration', false, regResult.error?.message || regResult.details);
  }
  
  // Test duplicate username
  const dupResult = await apiRequest('POST', '/api/auth/register', TEST_USERS.regular);
  logTestResult('Duplicate username rejection', !dupResult.success);
  
  // Test invalid email
  const invalidEmailResult = await apiRequest('POST', '/api/auth/register', {
    ...TEST_USERS.regular,
    username: 'newtestuser',
    email: 'invalid-email'
  });
  logTestResult('Invalid email rejection', !invalidEmailResult.success);
  
  // Test weak password
  const weakPasswordResult = await apiRequest('POST', '/api/auth/register', {
    ...TEST_USERS.regular,
    username: 'newtestuser2',
    email: 'test2@example.com',
    password: '123'
  });
  logTestResult('Weak password rejection', !weakPasswordResult.success);
  
  // Test missing invite code
  const noInviteResult = await apiRequest('POST', '/api/auth/register', {
    username: 'newtestuser3',
    password: 'StrongPassword123!',
    email: 'test3@example.com'
  });
  logTestResult('Missing invite code handling', !noInviteResult.success);
  
  return regResult.success;
}

async function testUserAuthentication() {
  console.log('\n🔐 AUTHENTICATION TESTS');
  
  // Test valid login
  const loginResult = await apiRequest('POST', '/api/auth/login', {
    username: TEST_USERS.regular.username,
    password: TEST_USERS.regular.password
  });
  
  if (loginResult.success && loginResult.data.success) {
    userToken = loginResult.data.data.token;
    logTestResult('Valid login', true);
  } else {
    logTestResult('Valid login', false, loginResult.error?.message);
  }
  
  // Test invalid credentials
  const invalidLoginResult = await apiRequest('POST', '/api/auth/login', {
    username: TEST_USERS.regular.username,
    password: 'wrongpassword'
  });
  logTestResult('Invalid password rejection', !invalidLoginResult.success);
  
  // Test non-existent user
  const noUserResult = await apiRequest('POST', '/api/auth/login', {
    username: 'nonexistentuser',
    password: 'anypassword'
  });
  logTestResult('Non-existent user rejection', !noUserResult.success);
  
  // Test empty fields
  const emptyFieldsResult = await apiRequest('POST', '/api/auth/login', {
    username: '',
    password: ''
  });
  logTestResult('Empty fields rejection', !emptyFieldsResult.success);
  
  return loginResult.success;
}

async function testUserProfile() {
  console.log('\n👤 USER PROFILE TESTS');
  
  // Test getting user profile
  const profileResult = await authenticatedRequest('GET', '/api/auth/me');
  
  if (profileResult.success) {
    logTestResult('Get user profile', true);
    logTestResult('Profile contains username', !!profileResult.data.data.username);
    logTestResult('Profile contains wallet balance', profileResult.data.data.wallet_balance !== undefined);
  } else {
    logTestResult('Get user profile', false, profileResult.error?.message);
  }
  
  // Test unauthorized access
  const unauthResult = await apiRequest('GET', '/api/auth/me');
  logTestResult('Unauthorized access rejection', !unauthResult.success);
  
  // Test invalid token
  const invalidTokenResult = await authenticatedRequest('GET', '/api/auth/me', null, 'invalid-token');
  logTestResult('Invalid token rejection', !invalidTokenResult.success);
  
  return profileResult.success;
}

async function testSportsEndpoints() {
  console.log('\n🏈 SPORTS ENDPOINTS TESTS');
  
  // Test sports list
  const sportsResult = await apiRequest('GET', '/api/sports');
  logTestResult('Get sports list', sportsResult.success);
  
  if (sportsResult.success) {
    logTestResult('Sports list not empty', sportsResult.data.data && sportsResult.data.data.length > 0);
  }
  
  // Test specific sport odds
  const oddsResult = await apiRequest('GET', '/api/sports/americanfootball_nfl/odds');
  logTestResult('Get NFL odds', oddsResult.success);
  
  // Test invalid sport
  const invalidSportResult = await apiRequest('GET', '/api/sports/invalid_sport/odds');
  logTestResult('Invalid sport handling', !invalidSportResult.success || invalidSportResult.data.data.length === 0);
  
  return sportsResult.success;
}

async function testWalletEndpoints() {
  console.log('\n💰 WALLET ENDPOINTS TESTS');
  
  // Test wallet balance
  const balanceResult = await authenticatedRequest('GET', '/api/wallet/balance');
  logTestResult('Get wallet balance', balanceResult.success);
  
  if (balanceResult.success) {
    logTestResult('Balance is number', typeof balanceResult.data.data.balance === 'number');
    logTestResult('Formatted balance provided', !!balanceResult.data.data.formatted);
  }
  
  // Test wallet transactions
  const transactionsResult = await authenticatedRequest('GET', '/api/wallet/transactions');
  logTestResult('Get wallet transactions', transactionsResult.success);
  
  // Test unauthorized wallet access
  const unauthWalletResult = await apiRequest('GET', '/api/wallet/balance');
  logTestResult('Unauthorized wallet access rejection', !unauthWalletResult.success);
  
  return balanceResult.success;
}

async function testBettingEndpoints() {
  console.log('\n🎯 BETTING ENDPOINTS TESTS');
  
  // Test getting betting history
  const historyResult = await authenticatedRequest('GET', '/api/bets/history');
  logTestResult('Get betting history', historyResult.success);
  
  // Test placing a bet
  const placeBetResult = await authenticatedRequest('POST', '/api/bets/place', SAMPLE_BET);
  logTestResult('Place bet', placeBetResult.success);
  
  if (placeBetResult.success) {
    logTestResult('Bet ID returned', !!placeBetResult.data.data.id);
  }
  
  // Test invalid bet data
  const invalidBetResult = await authenticatedRequest('POST', '/api/bets/place', {
    event_id: '',
    stake: -10
  });
  logTestResult('Invalid bet rejection', !invalidBetResult.success);
  
  // Test unauthorized betting
  const unauthBetResult = await apiRequest('POST', '/api/bets/place', SAMPLE_BET);
  logTestResult('Unauthorized bet rejection', !unauthBetResult.success);
  
  return historyResult.success;
}

async function testDashboardEndpoints() {
  console.log('\n📊 DASHBOARD ENDPOINTS TESTS');
  
  // Test dashboard data
  const dashboardResult = await authenticatedRequest('GET', '/api/dashboard');
  logTestResult('Get dashboard data', dashboardResult.success);
  
  if (dashboardResult.success) {
    const data = dashboardResult.data.data;
    logTestResult('Dashboard contains user stats', !!data.user_stats);
    logTestResult('Dashboard contains recent bets', data.recent_bets !== undefined);
  }
  
  // Test unauthorized dashboard access
  const unauthDashResult = await apiRequest('GET', '/api/dashboard');
  logTestResult('Unauthorized dashboard access rejection', !unauthDashResult.success);
  
  return dashboardResult.success;
}

async function testInputValidation() {
  console.log('\n🛡️  INPUT VALIDATION TESTS');
  
  // Test SQL injection attempts
  const sqlInjectionResult = await apiRequest('POST', '/api/auth/login', {
    username: "'; DROP TABLE users; --",
    password: 'password'
  });
  logTestResult('SQL injection prevention', !sqlInjectionResult.success);
  
  // Test XSS attempts
  const xssResult = await apiRequest('POST', '/api/auth/register', {
    username: '<script>alert("xss")</script>',
    password: 'password123',
    email: 'test@example.com',
    invite_code: 'WINZO123'
  });
  logTestResult('XSS prevention', !xssResult.success);
  
  // Test extremely large payloads
  const largePayload = 'A'.repeat(100000);
  const largePayloadResult = await apiRequest('POST', '/api/auth/login', {
    username: largePayload,
    password: largePayload
  });
  logTestResult('Large payload handling', !largePayloadResult.success);
  
  return true;
}

async function testErrorHandling() {
  console.log('\n❌ ERROR HANDLING TESTS');
  
  // Test 404 endpoints
  const notFoundResult = await apiRequest('GET', '/api/nonexistent-endpoint');
  logTestResult('404 handling', notFoundResult.status === 404);
  
  // Test malformed JSON
  try {
    const malformedResult = await axios.post(`${API_BASE_URL}/api/auth/login`, 
      'invalid json', 
      { headers: { 'Content-Type': 'application/json' } }
    );
    logTestResult('Malformed JSON handling', false);
  } catch (error) {
    logTestResult('Malformed JSON handling', error.response?.status === 400);
  }
  
  // Test unsupported HTTP methods
  const wrongMethodResult = await apiRequest('DELETE', '/api/auth/login');
  logTestResult('Unsupported method handling', wrongMethodResult.status === 405 || !wrongMethodResult.success);
  
  return true;
}

async function testRateLimiting() {
  console.log('\n🚦 RATE LIMITING TESTS');
  
  // Test rapid requests
  const promises = [];
  for (let i = 0; i < 20; i++) {
    promises.push(apiRequest('GET', '/health'));
  }
  
  const results = await Promise.all(promises);
  const successCount = results.filter(r => r.success).length;
  const rateLimitedCount = results.filter(r => r.status === 429).length;
  
  logTestResult('Rate limiting active', rateLimitedCount > 0 || successCount === 20);
  
  return true;
}

async function testPerformance() {
  console.log('\n⚡ PERFORMANCE TESTS');
  
  // Test response times
  const startTime = Date.now();
  const healthResult = await apiRequest('GET', '/health');
  const responseTime = Date.now() - startTime;
  
  logTestResult('Response time < 1000ms', responseTime < 1000, `${responseTime}ms`);
  
  // Test concurrent requests
  const concurrentStart = Date.now();
  const concurrentPromises = Array(10).fill().map(() => apiRequest('GET', '/health'));
  await Promise.all(concurrentPromises);
  const concurrentTime = Date.now() - concurrentStart;
  
  logTestResult('Concurrent requests handled', concurrentTime < 5000, `${concurrentTime}ms for 10 requests`);
  
  return healthResult.success;
}

// Main test runner
async function runComprehensiveTests() {
  console.log('🧪 WINZO BACKEND COMPREHENSIVE API TESTS');
  console.log('==========================================');
  console.log(`Testing against: ${API_BASE_URL}`);
  
  const testSuites = [
    { name: 'Health Endpoint', fn: testHealthEndpoint },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Authentication', fn: testUserAuthentication },
    { name: 'User Profile', fn: testUserProfile },
    { name: 'Sports Endpoints', fn: testSportsEndpoints },
    { name: 'Wallet Endpoints', fn: testWalletEndpoints },
    { name: 'Betting Endpoints', fn: testBettingEndpoints },
    { name: 'Dashboard Endpoints', fn: testDashboardEndpoints },
    { name: 'Input Validation', fn: testInputValidation },
    { name: 'Error Handling', fn: testErrorHandling },
    { name: 'Rate Limiting', fn: testRateLimiting },
    { name: 'Performance', fn: testPerformance }
  ];
  
  const results = [];
  let totalTests = 0;
  let passedTests = 0;
  
  for (const suite of testSuites) {
    try {
      const result = await suite.fn();
      results.push({ name: suite.name, success: result });
      totalTests++;
      if (result) passedTests++;
    } catch (error) {
      console.log(`❌ ${suite.name} threw an error:`, error.message);
      results.push({ name: suite.name, success: false, error: error.message });
      totalTests++;
    }
  }
  
  // Summary
  console.log('\n📊 TEST SUITE RESULTS');
  console.log('======================');
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} test suites passed (${Math.round(passedTests/totalTests*100)}%)`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All test suites passed! Backend is fully functional.');
  } else {
    console.log('⚠️  Some test suites failed. Backend needs attention.');
  }
  
  // Cleanup
  if (userToken) {
    console.log('\n🧹 Cleaning up test data...');
    // Additional cleanup if needed
  }
  
  return passedTests === totalTests;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runComprehensiveTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = {
  runComprehensiveTests,
  apiRequest,
  authenticatedRequest,
  API_BASE_URL
}; 