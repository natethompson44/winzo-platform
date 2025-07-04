const axios = require('axios');
require('dotenv').config();

async function testSoccerOdds() {
  try {
    console.log('🔍 Testing soccer odds API call (same as backend)...');
    
    const apiKey = process.env.ODDS_API_KEY;
    if (!apiKey || apiKey === 'dummy-key') {
      console.error('❌ No valid API key found');
      return;
    }
    
    console.log(`🔑 Using API key: ${apiKey.substring(0, 8)}...`);
    
    // Test the exact same call that our backend makes
    const sportKey = 'soccer_epl';
    const regions = 'us,uk,eu';
    const markets = 'h2h';
    const oddsFormat = 'decimal';
    
    console.log(`\n📊 Testing: /v4/sports/${sportKey}/odds`);
    console.log(`   Regions: ${regions}`);
    console.log(`   Markets: ${markets}`);
    console.log(`   Format: ${oddsFormat}`);
    
    const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds`, {
      params: {
        apiKey: apiKey,
        regions: regions,
        markets: markets,
        oddsFormat: oddsFormat
      }
    });
    
    console.log('\n✅ SUCCESS! Soccer odds API call worked!');
    console.log(`📈 Games returned: ${response.data.length}`);
    
    if (response.data.length > 0) {
      console.log('\n🎯 Sample game:');
      const game = response.data[0];
      console.log(`   ID: ${game.id}`);
      console.log(`   Teams: ${game.away_team} vs ${game.home_team}`);
      console.log(`   Start: ${game.commence_time}`);
      console.log(`   Bookmakers: ${game.bookmakers?.length || 0}`);
    }
    
    // Check response headers for quota info
    console.log('\n📊 Quota Status:');
    console.log(`   Remaining: ${response.headers['x-requests-remaining']}`);
    console.log(`   Used: ${response.headers['x-requests-used']}`);
    console.log(`   Last: ${response.headers['x-requests-last']}`);
    
  } catch (error) {
    console.error('❌ Error testing soccer odds:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

testSoccerOdds(); 