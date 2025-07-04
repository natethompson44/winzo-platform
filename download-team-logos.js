#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Base paths
const clubsDir = path.join(__dirname, 'oddsx/oddsx-react/public/images/clubs');
const baseESPNUrl = 'https://a.espncdn.com/i/teamlogos';

// Team data for each sport
const sportsData = {
  nhl: {
    name: 'NHL',
    teams: [
      { name: 'Anaheim Ducks', code: 'ANA', espnId: '25' },
      { name: 'Arizona Coyotes', code: 'ARI', espnId: '26' },
      { name: 'Boston Bruins', code: 'BOS', espnId: '6' },
      { name: 'Buffalo Sabres', code: 'BUF', espnId: '7' },
      { name: 'Calgary Flames', code: 'CGY', espnId: '8' },
      { name: 'Carolina Hurricanes', code: 'CAR', espnId: '12' },
      { name: 'Chicago Blackhawks', code: 'CHI', espnId: '11' },
      { name: 'Colorado Avalanche', code: 'COL', espnId: '21' },
      { name: 'Columbus Blue Jackets', code: 'CBJ', espnId: '29' },
      { name: 'Dallas Stars', code: 'DAL', espnId: '10' },
      { name: 'Detroit Red Wings', code: 'DET', espnId: '17' },
      { name: 'Edmonton Oilers', code: 'EDM', espnId: '22' },
      { name: 'Florida Panthers', code: 'FLA', espnId: '13' },
      { name: 'Los Angeles Kings', code: 'LAK', espnId: '14' },
      { name: 'Minnesota Wild', code: 'MIN', espnId: '30' },
      { name: 'Montreal Canadiens', code: 'MTL', espnId: '15' },
      { name: 'Nashville Predators', code: 'NSH', espnId: '18' },
      { name: 'New Jersey Devils', code: 'NJD', espnId: '16' },
      { name: 'New York Islanders', code: 'NYI', espnId: '2' },
      { name: 'New York Rangers', code: 'NYR', espnId: '3' },
      { name: 'Ottawa Senators', code: 'OTT', espnId: '9' },
      { name: 'Philadelphia Flyers', code: 'PHI', espnId: '4' },
      { name: 'Pittsburgh Penguins', code: 'PIT', espnId: '5' },
      { name: 'San Jose Sharks', code: 'SJS', espnId: '28' },
      { name: 'Seattle Kraken', code: 'SEA', espnId: '52' },
      { name: 'St. Louis Blues', code: 'STL', espnId: '19' },
      { name: 'Tampa Bay Lightning', code: 'TBL', espnId: '27' },
      { name: 'Toronto Maple Leafs', code: 'TOR', espnId: '23' },
      { name: 'Vancouver Canucks', code: 'VAN', espnId: '24' },
      { name: 'Vegas Golden Knights', code: 'VGK', espnId: '37' },
      { name: 'Washington Capitals', code: 'WSH', espnId: '20' },
      { name: 'Winnipeg Jets', code: 'WPG', espnId: '1' }
    ]
  },
  mlb: {
    name: 'MLB',
    teams: [
      { name: 'Arizona Diamondbacks', code: 'ARI', espnId: '29' },
      { name: 'Atlanta Braves', code: 'ATL', espnId: '15' },
      { name: 'Baltimore Orioles', code: 'BAL', espnId: '1' },
      { name: 'Boston Red Sox', code: 'BOS', espnId: '2' },
      { name: 'Chicago Cubs', code: 'CHC', espnId: '16' },
      { name: 'Chicago White Sox', code: 'CWS', espnId: '4' },
      { name: 'Cincinnati Reds', code: 'CIN', espnId: '17' },
      { name: 'Cleveland Guardians', code: 'CLE', espnId: '5' },
      { name: 'Colorado Rockies', code: 'COL', espnId: '27' },
      { name: 'Detroit Tigers', code: 'DET', espnId: '6' },
      { name: 'Houston Astros', code: 'HOU', espnId: '18' },
      { name: 'Kansas City Royals', code: 'KC', espnId: '7' },
      { name: 'Los Angeles Angels', code: 'LAA', espnId: '3' },
      { name: 'Los Angeles Dodgers', code: 'LAD', espnId: '19' },
      { name: 'Miami Marlins', code: 'MIA', espnId: '28' },
      { name: 'Milwaukee Brewers', code: 'MIL', espnId: '8' },
      { name: 'Minnesota Twins', code: 'MIN', espnId: '9' },
      { name: 'New York Mets', code: 'NYM', espnId: '21' },
      { name: 'New York Yankees', code: 'NYY', espnId: '10' },
      { name: 'Oakland Athletics', code: 'OAK', espnId: '11' },
      { name: 'Philadelphia Phillies', code: 'PHI', espnId: '22' },
      { name: 'Pittsburgh Pirates', code: 'PIT', espnId: '23' },
      { name: 'San Diego Padres', code: 'SD', espnId: '25' },
      { name: 'San Francisco Giants', code: 'SF', espnId: '26' },
      { name: 'Seattle Mariners', code: 'SEA', espnId: '12' },
      { name: 'St. Louis Cardinals', code: 'STL', espnId: '24' },
      { name: 'Tampa Bay Rays', code: 'TB', espnId: '30' },
      { name: 'Texas Rangers', code: 'TEX', espnId: '13' },
      { name: 'Toronto Blue Jays', code: 'TOR', espnId: '14' },
      { name: 'Washington Nationals', code: 'WSH', espnId: '20' }
    ]
  },
  laliga: {
    name: 'La Liga',
    teams: [
      { name: 'Athletic Bilbao', code: 'ATH', espnId: '448' },
      { name: 'Atletico Madrid', code: 'ATM', espnId: '1068' },
      { name: 'Barcelona', code: 'BAR', espnId: '83' },
      { name: 'Real Betis', code: 'BET', espnId: '244' },
      { name: 'Celta Vigo', code: 'CEL', espnId: '558' },
      { name: 'Deportivo Alaves', code: 'ALA', espnId: '1108' },
      { name: 'Espanyol', code: 'ESP', espnId: '466' },
      { name: 'Getafe', code: 'GET', espnId: '3009' },
      { name: 'Girona', code: 'GIR', espnId: '9783' },
      { name: 'Las Palmas', code: 'LPA', espnId: '275' },
      { name: 'Leganes', code: 'LEG', espnId: '9814' },
      { name: 'Mallorca', code: 'MLL', espnId: '1082' },
      { name: 'Osasuna', code: 'OSA', espnId: '3420' },
      { name: 'Rayo Vallecano', code: 'RAY', espnId: '367' },
      { name: 'Real Madrid', code: 'RMA', espnId: '86' },
      { name: 'Real Sociedad', code: 'RSO', espnId: '278' },
      { name: 'Sevilla', code: 'SEV', espnId: '243' },
      { name: 'Valencia', code: 'VAL', espnId: '94' },
      { name: 'Valladolid', code: 'VLL', espnId: '95' },
      { name: 'Villarreal', code: 'VIL', espnId: '449' }
    ]
  },
  bundesliga: {
    name: 'Bundesliga',
    teams: [
      { name: 'Augsburg', code: 'AUG', espnId: '9777' },
      { name: 'Bayer Leverkusen', code: 'B04', espnId: '131' },
      { name: 'Bayern Munich', code: 'BAY', espnId: '132' },
      { name: 'Borussia Dortmund', code: 'BVB', espnId: '124' },
      { name: 'Borussia Monchengladbach', code: 'BMG', espnId: '134' },
      { name: 'Eintracht Frankfurt', code: 'SGE', espnId: '125' },
      { name: 'SC Freiburg', code: 'SCF', espnId: '151' },
      { name: 'Heidenheim', code: 'HDH', espnId: '10189' },
      { name: 'Hoffenheim', code: 'HOF', espnId: '3331' },
      { name: 'Holstein Kiel', code: 'KIE', espnId: '10226' },
      { name: 'Mainz', code: 'M05', espnId: '3332' },
      { name: 'RB Leipzig', code: 'RBL', espnId: '11420' },
      { name: 'St. Pauli', code: 'STP', espnId: '6514' },
      { name: 'Union Berlin', code: 'FCU', espnId: '598' },
      { name: 'VfB Stuttgart', code: 'VFB', espnId: '128' },
      { name: 'VfL Bochum', code: 'BOC', espnId: '129' },
      { name: 'VfL Wolfsburg', code: 'WOB', espnId: '130' },
      { name: 'Werder Bremen', code: 'SVW', espnId: '135' }
    ]
  },
  seriea: {
    name: 'Serie A',
    teams: [
      { name: 'AC Milan', code: 'MIL', espnId: '103' },
      { name: 'Atalanta', code: 'ATA', espnId: '104' },
      { name: 'Bologna', code: 'BOL', espnId: '2419' },
      { name: 'Cagliari', code: 'CAG', espnId: '106' },
      { name: 'Como', code: 'COM', espnId: '10736' },
      { name: 'Empoli', code: 'EMP', espnId: '2421' },
      { name: 'Fiorentina', code: 'FIO', espnId: '110' },
      { name: 'Genoa', code: 'GEN', espnId: '111' },
      { name: 'Hellas Verona', code: 'VER', espnId: '450' },
      { name: 'Inter Milan', code: 'INT', espnId: '112' },
      { name: 'Juventus', code: 'JUV', espnId: '111' },
      { name: 'Lazio', code: 'LAZ', espnId: '114' },
      { name: 'Lecce', code: 'LEC', espnId: '1107' },
      { name: 'Monza', code: 'MON', espnId: '15947' },
      { name: 'Napoli', code: 'NAP', espnId: '115' },
      { name: 'Parma', code: 'PAR', espnId: '1030' },
      { name: 'AS Roma', code: 'ROM', espnId: '117' },
      { name: 'Torino', code: 'TOR', espnId: '118' },
      { name: 'Udinese', code: 'UDI', espnId: '119' },
      { name: 'Venezia', code: 'VEN', espnId: '2425' }
    ]
  },
  ligue1: {
    name: 'Ligue 1',
    teams: [
      { name: 'Angers', code: 'ANG', espnId: '294' },
      { name: 'AS Monaco', code: 'MON', espnId: '174' },
      { name: 'AJ Auxerre', code: 'AUX', espnId: '273' },
      { name: 'Brest', code: 'BRE', espnId: '3411' },
      { name: 'Le Havre', code: 'HAV', espnId: '3413' },
      { name: 'Lille', code: 'LIL', espnId: '172' },
      { name: 'Marseille', code: 'OM', espnId: '176' },
      { name: 'Montpellier', code: 'MON', espnId: '180' },
      { name: 'Nantes', code: 'NAN', espnId: '177' },
      { name: 'Nice', code: 'NIC', espnId: '2284' },
      { name: 'Paris Saint-Germain', code: 'PSG', espnId: '174' },
      { name: 'RC Lens', code: 'RCL', espnId: '175' },
      { name: 'Rennes', code: 'REN', espnId: '178' },
      { name: 'Reims', code: 'REI', espnId: '3412' },
      { name: 'Saint-Etienne', code: 'STE', espnId: '179' },
      { name: 'RC Strasbourg', code: 'STR', espnId: '3379' },
      { name: 'Toulouse', code: 'TOU', espnId: '181' },
      { name: 'Nimes Olympique', code: 'NIM', espnId: '2283' }
    ]
  }
};

// Utility functions
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      } else {
        file.close();
        fs.unlink(filepath, () => {}); // Delete the file async
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(filepath, () => {}); // Delete the file async
      reject(err);
    });
  });
}

async function downloadTeamLogos(sport, data) {
  console.log(`\n🏈 Downloading ${data.name} team logos...`);
  
  const sportDir = path.join(clubsDir, sport);
  if (!fs.existsSync(sportDir)) {
    fs.mkdirSync(sportDir, { recursive: true });
  }

  const mapping = {};
  const downloaded = [];
  const failed = [];

  for (const team of data.teams) {
    const filename = `${slugify(team.name)}.png`;
    const filepath = path.join(sportDir, filename);
    
    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`✅ ${team.name} - already exists`);
      mapping[team.code] = {
        name: team.name,
        filename: filename,
        espnId: team.espnId
      };
      continue;
    }

    // Construct ESPN logo URL based on sport
    let logoUrl;
    if (sport === 'nhl') {
      logoUrl = `${baseESPNUrl}/nhl/500/scoreboard/${team.espnId}.png`;
    } else if (sport === 'mlb') {
      logoUrl = `${baseESPNUrl}/mlb/500/scoreboard/${team.espnId}.png`;
    } else {
      // Soccer leagues use different ESPN structure
      logoUrl = `${baseESPNUrl}/soccer/500/scoreboard/${team.espnId}.png`;
    }

    try {
      await downloadImage(logoUrl, filepath);
      console.log(`✅ ${team.name} - downloaded`);
      downloaded.push(team.name);
      
      mapping[team.code] = {
        name: team.name,
        filename: filename,
        espnId: team.espnId
      };
    } catch (error) {
      console.log(`❌ ${team.name} - failed: ${error.message}`);
      failed.push(team.name);
    }
  }

  // Create team mapping JSON
  const mappingPath = path.join(sportDir, 'team-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  
  console.log(`\n📊 ${data.name} Summary:`);
  console.log(`   ✅ Downloaded: ${downloaded.length}`);
  console.log(`   ❌ Failed: ${failed.length}`);
  console.log(`   📁 Total teams: ${data.teams.length}`);
  
  return { downloaded, failed };
}

async function main() {
  console.log('🚀 Starting team logo download process...');
  console.log(`📁 Target directory: ${clubsDir}`);
  
  const results = {};
  
  // Download logos for each sport
  for (const [sport, data] of Object.entries(sportsData)) {
    try {
      results[sport] = await downloadTeamLogos(sport, data);
    } catch (error) {
      console.error(`❌ Failed to download ${sport} logos:`, error);
      results[sport] = { downloaded: [], failed: data.teams.map(t => t.name) };
    }
  }
  
  // Final summary
  console.log('\n🎯 Final Summary:');
  console.log('================');
  
  let totalDownloaded = 0;
  let totalFailed = 0;
  
  for (const [sport, result] of Object.entries(results)) {
    const sportData = sportsData[sport];
    console.log(`\n${sportData.name}:`);
    console.log(`  ✅ Downloaded: ${result.downloaded.length}/${sportData.teams.length}`);
    console.log(`  ❌ Failed: ${result.failed.length}/${sportData.teams.length}`);
    
    totalDownloaded += result.downloaded.length;
    totalFailed += result.failed.length;
  }
  
  console.log(`\n🏆 Overall Results:`);
  console.log(`   ✅ Total Downloaded: ${totalDownloaded}`);
  console.log(`   ❌ Total Failed: ${totalFailed}`);
  console.log(`   📊 Success Rate: ${((totalDownloaded / (totalDownloaded + totalFailed)) * 100).toFixed(1)}%`);
  
  console.log('\n✨ Team logo download process completed!');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { downloadTeamLogos, sportsData }; 