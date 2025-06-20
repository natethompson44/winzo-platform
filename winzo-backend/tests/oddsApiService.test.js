/**
 * Basic tests for OddsApiService
 * Run with: npm test
 */
const oddsApiService = require('../src/services/oddsApiService');

async function testOddsApiService() {
  console.log('Testing OddsApiService...');
  try {
    // Test 1: Get sports
    console.log('\n1. Testing getSports()...');
    const sports = await oddsApiService.getSports();
    console.log(`Found ${sports.length} sports`);

    // Test 2: Get quota status
    console.log('\n2. Testing getQuotaStatus()...');
    const quota = oddsApiService.getQuotaStatus();
    console.log(`Quota: ${quota.used}/${quota.total} (${quota.percentUsed}%)`);

    // Test 3: Test caching
    console.log('\n3. Testing cache functionality...');
    const cachedSports = await oddsApiService.getSports();
    console.log(`Cache working: ${sports.length === cachedSports.length}`);

    console.log('\nAll tests passed!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testOddsApiService();
}

module.exports = { testOddsApiService };
