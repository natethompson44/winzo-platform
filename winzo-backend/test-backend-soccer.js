const axios = require('axios');
require('dotenv').config();

async function testBackendSoccerParams() {
  try {
    console.log('🔍 Testing EXACT backend soccer parameters...');
    
    const apiKey = process.env.ODDS_API_KEY;
    console.log(`🔑 Using API key: ${apiKey.substring(0, 8)}...`);
    
    // Test exact backend parameters that are failing
    const sportKey = 'soccer_epl';
    const regions = 'uk,eu';
    const markets = 'h2h,asian_handicaps,over_under';
    const oddsFormat = 'decimal';
    
    console.log(`\n❌ Testing FAILING backend params:`);
    console.log(`   Sport: ${sportKey}`);
    console.log(`   Regions: ${regions}`);
    console.log(`   Markets: ${markets}`);
    console.log(`   Format: ${oddsFormat}`);
    
    try {
      const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds`, {
        params: {
          apiKey: apiKey,
          regions: regions,
          markets: markets,
          oddsFormat: oddsFormat
        }
      });
      console.log('✅ Backend params work! Games returned:', response.data.length);
    } catch (error) {
      console.error('❌ Backend params FAILED:', error.response?.status, error.response?.data);
    }
    
    // Test working parameters
    console.log(`\n✅ Testing WORKING params:`);
    const workingRegions = 'us,uk,eu';
    const workingMarkets = 'h2h';
    
    console.log(`   Regions: ${workingRegions}`);
    console.log(`   Markets: ${workingMarkets}`);
    
    try {
      const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds`, {
        params: {
          apiKey: apiKey,
          regions: workingRegions,
          markets: workingMarkets,
          oddsFormat: oddsFormat
        }
      });
      console.log('✅ Working params succeed! Games returned:', response.data.length);
    } catch (error) {
      console.error('❌ Working params failed:', error.response?.status, error.response?.data);
    }
    
    // Test just the markets issue
    console.log(`\n🔍 Testing just markets issue:`);
    console.log(`   Testing h2h only...`);
    
    try {
      const response = await axios.get(`https://api.the-odds-api.com/v4/sports/${sportKey}/odds`, {
        params: {
          apiKey: apiKey,
          regions: 'uk,eu',
          markets: 'h2h',
          oddsFormat: oddsFormat
        }
      });
      console.log('✅ h2h only works! Games returned:', response.data.length);
    } catch (error) {
      console.error('❌ h2h only failed:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testBackendSoccerParams(); 