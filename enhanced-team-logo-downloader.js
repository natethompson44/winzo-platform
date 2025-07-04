#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Base paths
const clubsDir = path.join(__dirname, 'oddsx/oddsx-react/public/images/clubs');

// Enhanced team data with multiple sources
const sportsData = {
  nhl: {
    name: 'NHL',
    apiEndpoint: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams',
    teams: [
      { name: 'Anaheim Ducks', code: 'ANA', id: '25' },
      { name: 'Arizona Coyotes', code: 'ARI', id: '26' },
      { name: 'Boston Bruins', code: 'BOS', id: '6' },
      { name: 'Buffalo Sabres', code: 'BUF', id: '7' },
      { name: 'Calgary Flames', code: 'CGY', id: '8' },
      { name: 'Carolina Hurricanes', code: 'CAR', id: '12' },
      { name: 'Chicago Blackhawks', code: 'CHI', id: '11' },
      { name: 'Colorado Avalanche', code: 'COL', id: '21' },
      { name: 'Columbus Blue Jackets', code: 'CBJ', id: '29' },
      { name: 'Dallas Stars', code: 'DAL', id: '10' },
      { name: 'Detroit Red Wings', code: 'DET', id: '17' },
      { name: 'Edmonton Oilers', code: 'EDM', id: '22' },
      { name: 'Florida Panthers', code: 'FLA', id: '13' },
      { name: 'Los Angeles Kings', code: 'LAK', id: '14' },
      { name: 'Minnesota Wild', code: 'MIN', id: '30' },
      { name: 'Montreal Canadiens', code: 'MTL', id: '15' },
      { name: 'Nashville Predators', code: 'NSH', id: '18' },
      { name: 'New Jersey Devils', code: 'NJD', id: '16' },
      { name: 'New York Islanders', code: 'NYI', id: '2' },
      { name: 'New York Rangers', code: 'NYR', id: '3' },
      { name: 'Ottawa Senators', code: 'OTT', id: '9' },
      { name: 'Philadelphia Flyers', code: 'PHI', id: '4' },
      { name: 'Pittsburgh Penguins', code: 'PIT', id: '5' },
      { name: 'San Jose Sharks', code: 'SJS', id: '28' },
      { name: 'Seattle Kraken', code: 'SEA', id: '52' },
      { name: 'St. Louis Blues', code: 'STL', id: '19' },
      { name: 'Tampa Bay Lightning', code: 'TBL', id: '27' },
      { name: 'Toronto Maple Leafs', code: 'TOR', id: '23' },
      { name: 'Vancouver Canucks', code: 'VAN', id: '24' },
      { name: 'Vegas Golden Knights', code: 'VGK', id: '37' },
      { name: 'Washington Capitals', code: 'WSH', id: '20' },
      { name: 'Winnipeg Jets', code: 'WPG', id: '1' }
    ]
  },
  mlb: {
    name: 'MLB',
    apiEndpoint: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams',
    teams: [
      { name: 'Arizona Diamondbacks', code: 'ARI', id: '29' },
      { name: 'Atlanta Braves', code: 'ATL', id: '15' },
      { name: 'Baltimore Orioles', code: 'BAL', id: '1' },
      { name: 'Boston Red Sox', code: 'BOS', id: '2' },
      { name: 'Chicago Cubs', code: 'CHC', id: '16' },
      { name: 'Chicago White Sox', code: 'CWS', id: '4' },
      { name: 'Cincinnati Reds', code: 'CIN', id: '17' },
      { name: 'Cleveland Guardians', code: 'CLE', id: '5' },
      { name: 'Colorado Rockies', code: 'COL', id: '27' },
      { name: 'Detroit Tigers', code: 'DET', id: '6' },
      { name: 'Houston Astros', code: 'HOU', id: '18' },
      { name: 'Kansas City Royals', code: 'KC', id: '7' },
      { name: 'Los Angeles Angels', code: 'LAA', id: '3' },
      { name: 'Los Angeles Dodgers', code: 'LAD', id: '19' },
      { name: 'Miami Marlins', code: 'MIA', id: '28' },
      { name: 'Milwaukee Brewers', code: 'MIL', id: '8' },
      { name: 'Minnesota Twins', code: 'MIN', id: '9' },
      { name: 'New York Mets', code: 'NYM', id: '21' },
      { name: 'New York Yankees', code: 'NYY', id: '10' },
      { name: 'Oakland Athletics', code: 'OAK', id: '11' },
      { name: 'Philadelphia Phillies', code: 'PHI', id: '22' },
      { name: 'Pittsburgh Pirates', code: 'PIT', id: '23' },
      { name: 'San Diego Padres', code: 'SD', id: '25' },
      { name: 'San Francisco Giants', code: 'SF', id: '26' },
      { name: 'Seattle Mariners', code: 'SEA', id: '12' },
      { name: 'St. Louis Cardinals', code: 'STL', id: '24' },
      { name: 'Tampa Bay Rays', code: 'TB', id: '30' },
      { name: 'Texas Rangers', code: 'TEX', id: '13' },
      { name: 'Toronto Blue Jays', code: 'TOR', id: '14' },
      { name: 'Washington Nationals', code: 'WSH', id: '20' }
    ]
  },
  laliga: {
    name: 'La Liga',
    teams: [
      { name: 'Athletic Bilbao', code: 'ATH', sportsDbId: '134301' },
      { name: 'Atletico Madrid', code: 'ATM', sportsDbId: '134299' },
      { name: 'Barcelona', code: 'BAR', sportsDbId: '134302' },
      { name: 'Real Betis', code: 'BET', sportsDbId: '134304' },
      { name: 'Celta Vigo', code: 'CEL', sportsDbId: '134305' },
      { name: 'Deportivo Alaves', code: 'ALA', sportsDbId: '134306' },
      { name: 'Espanyol', code: 'ESP', sportsDbId: '134307' },
      { name: 'Getafe', code: 'GET', sportsDbId: '134308' },
      { name: 'Girona', code: 'GIR', sportsDbId: '135051' },
      { name: 'Las Palmas', code: 'LPA', sportsDbId: '134309' },
      { name: 'Leganes', code: 'LEG', sportsDbId: '134310' },
      { name: 'Mallorca', code: 'MLL', sportsDbId: '134311' },
      { name: 'Osasuna', code: 'OSA', sportsDbId: '134312' },
      { name: 'Rayo Vallecano', code: 'RAY', sportsDbId: '134313' },
      { name: 'Real Madrid', code: 'RMA', sportsDbId: '134296' },
      { name: 'Real Sociedad', code: 'RSO', sportsDbId: '134314' },
      { name: 'Sevilla', code: 'SEV', sportsDbId: '134298' },
      { name: 'Valencia', code: 'VAL', sportsDbId: '134300' },
      { name: 'Valladolid', code: 'VLL', sportsDbId: '134315' },
      { name: 'Villarreal', code: 'VIL', sportsDbId: '134297' }
    ]
  },
  bundesliga: {
    name: 'Bundesliga',
    teams: [
      { name: 'Augsburg', code: 'AUG', sportsDbId: '134182' },
      { name: 'Bayer Leverkusen', code: 'B04', sportsDbId: '134161' },
      { name: 'Bayern Munich', code: 'BAY', sportsDbId: '134151' },
      { name: 'Borussia Dortmund', code: 'BVB', sportsDbId: '134152' },
      { name: 'Borussia Monchengladbach', code: 'BMG', sportsDbId: '134154' },
      { name: 'Eintracht Frankfurt', code: 'SGE', sportsDbId: '134155' },
      { name: 'SC Freiburg', code: 'SCF', sportsDbId: '134156' },
      { name: 'Heidenheim', code: 'HDH', sportsDbId: '134985' },
      { name: 'Hoffenheim', code: 'HOF', sportsDbId: '134157' },
      { name: 'Holstein Kiel', code: 'KIE', sportsDbId: '135052' },
      { name: 'Mainz', code: 'M05', sportsDbId: '134158' },
      { name: 'RB Leipzig', code: 'RBL', sportsDbId: '135024' },
      { name: 'St. Pauli', code: 'STP', sportsDbId: '134159' },
      { name: 'Union Berlin', code: 'FCU', sportsDbId: '134986' },
      { name: 'VfB Stuttgart', code: 'VFB', sportsDbId: '134160' },
      { name: 'VfL Bochum', code: 'BOC', sportsDbId: '134162' },
      { name: 'VfL Wolfsburg', code: 'WOB', sportsDbId: '134163' },
      { name: 'Werder Bremen', code: 'SVW', sportsDbId: '134164' }
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
    
    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        file.close();
        fs.unlink(filepath, () => {});
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      } else {
        file.close();
        fs.unlink(filepath, () => {});
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function fetchESPNTeams(sport) {
  return new Promise((resolve, reject) => {
    const sportData = sportsData[sport];
    if (!sportData.apiEndpoint) {
      reject(new Error('No API endpoint for this sport'));
      return;
    }

    https.get(sportData.apiEndpoint, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.sports[0].leagues[0].teams || []);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function downloadTeamLogos(sport, data) {
  console.log(`\n🏒 Downloading ${data.name} team logos...`);
  
  const sportDir = path.join(clubsDir, sport);
  if (!fs.existsSync(sportDir)) {
    fs.mkdirSync(sportDir, { recursive: true });
  }

  const mapping = {};
  const downloaded = [];
  const failed = [];

  // Try to fetch from ESPN API first
  try {
    if (sport === 'nhl' || sport === 'mlb') {
      console.log(`   📡 Fetching live data from ESPN API...`);
      const espnTeams = await fetchESPNTeams(sport);
      
      for (const espnTeam of espnTeams) {
        const team = espnTeam.team;
        const filename = `${slugify(team.name)}.png`;
        const filepath = path.join(sportDir, filename);
        
        if (fs.existsSync(filepath)) {
          console.log(`✅ ${team.name} - already exists`);
          mapping[team.abbreviation] = {
            name: team.name,
            filename: filename,
            espnId: team.id
          };
          continue;
        }

        // Multiple logo URL attempts
        const logoUrls = [
          team.logos?.[0]?.href,
          `https://a.espncdn.com/i/teamlogos/${sport}/500/${team.id}.png`,
          `https://a.espncdn.com/i/teamlogos/${sport}/500/scoreboard/${team.id}.png`,
          `https://a.espncdn.com/combiner/i?img=/i/teamlogos/${sport}/500/${team.id}.png&h=200&w=200`
        ].filter(Boolean);

        let success = false;
        for (const logoUrl of logoUrls) {
          try {
            await downloadImage(logoUrl, filepath);
            console.log(`✅ ${team.name} - downloaded`);
            downloaded.push(team.name);
            success = true;
            
            mapping[team.abbreviation] = {
              name: team.name,
              filename: filename,
              espnId: team.id
            };
            break;
          } catch (error) {
            // Try next URL
          }
        }
        
        if (!success) {
          console.log(`❌ ${team.name} - failed from ESPN`);
          failed.push(team.name);
        }
      }
    }
  } catch (error) {
    console.log(`   ⚠️ ESPN API failed, using fallback data...`);
  }

  // Fallback to manual data for soccer leagues or if ESPN failed
  if (sport === 'laliga' || sport === 'bundesliga' || failed.length > 0) {
    for (const team of data.teams) {
      const filename = `${slugify(team.name)}.png`;
      const filepath = path.join(sportDir, filename);
      
      if (fs.existsSync(filepath)) {
        console.log(`✅ ${team.name} - already exists`);
        mapping[team.code] = {
          name: team.name,
          filename: filename,
          sportsDbId: team.sportsDbId
        };
        continue;
      }

      // Try TheSportsDB
      const logoUrls = [];
      if (team.sportsDbId) {
        logoUrls.push(`https://www.thesportsdb.com/images/media/team/badge/${team.sportsDbId}.png`);
      }

      let success = false;
      for (const logoUrl of logoUrls) {
        try {
          await downloadImage(logoUrl, filepath);
          console.log(`✅ ${team.name} - downloaded`);
          downloaded.push(team.name);
          success = true;
          
          mapping[team.code] = {
            name: team.name,
            filename: filename,
            sportsDbId: team.sportsDbId
          };
          break;
        } catch (error) {
          // Try next URL
        }
      }
      
      if (!success) {
        console.log(`❌ ${team.name} - failed`);
        failed.push(team.name);
      }
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
  console.log('🚀 Starting enhanced team logo download process...');
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
  
  console.log('\n✨ Enhanced team logo download process completed!');
}

if (require.main === module) {
  main().catch(console.error);
} 