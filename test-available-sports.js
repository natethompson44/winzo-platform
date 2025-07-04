const axios = require('axios');

async function testAvailableSports() {
  try {
    console.log('🔍 Testing available sports from The Odds API...');
    
    // First test: Get all sports (this endpoint doesn't require API key for basic info)
    const response = await axios.get('https://api.the-odds-api.com/v4/sports', {
      params: {
        apiKey: process.env.ODDS_API_KEY || 'test-key'
      }
    });
    
    const allSports = response.data;
    console.log(`📊 Total sports found: ${allSports.length}`);
    
    // Filter for soccer sports
    const soccerSports = allSports.filter(sport => 
      sport.key.includes('soccer') && sport.active
    );
    
    console.log('\n⚽ Active Soccer Sports:');
    soccerSports.forEach(sport => {
      console.log(`  ✓ ${sport.key} - ${sport.title} (${sport.description})`);
    });
    
    // Check specifically for EPL
    const eplSport = allSports.find(sport => sport.key === 'soccer_epl');
    if (eplSport) {
      console.log(`\n🎯 Found soccer_epl: Active=${eplSport.active}`);
    } else {
      console.log(`\n❌ soccer_epl NOT FOUND in available sports`);
    }
    
    // Check for other common soccer leagues
    const commonSoccerKeys = [
      'soccer_epl', 
      'soccer_spain_la_liga',
      'soccer_germany_bundesliga',
      'soccer_italy_serie_a',
      'soccer_france_ligue_one',
      'soccer_usa_mls'
    ];
    
    console.log('\n🔍 Common Soccer League Status:');
    commonSoccerKeys.forEach(key => {
      const sport = allSports.find(s => s.key === key);
      if (sport) {
        console.log(`  ✓ ${key}: Active=${sport.active}, Title="${sport.title}"`);
      } else {
        console.log(`  ❌ ${key}: NOT FOUND`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error testing sports:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

testAvailableSports(); 