import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { teams, sports } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

// All NFL teams with their abbreviations for logo URLs
const nflTeams = [
  { city: "Arizona", name: "Cardinals", abbr: "ari" },
  { city: "Atlanta", name: "Falcons", abbr: "atl" },
  { city: "Baltimore", name: "Ravens", abbr: "bal" },
  { city: "Buffalo", name: "Bills", abbr: "buf" },
  { city: "Carolina", name: "Panthers", abbr: "car" },
  { city: "Chicago", name: "Bears", abbr: "chi" },
  { city: "Cincinnati", name: "Bengals", abbr: "cin" },
  { city: "Cleveland", name: "Browns", abbr: "cle" },
  { city: "Dallas", name: "Cowboys", abbr: "dal" },
  { city: "Denver", name: "Broncos", abbr: "den" },
  { city: "Detroit", name: "Lions", abbr: "det" },
  { city: "Green Bay", name: "Packers", abbr: "gb" },
  { city: "Houston", name: "Texans", abbr: "hou" },
  { city: "Indianapolis", name: "Colts", abbr: "ind" },
  { city: "Jacksonville", name: "Jaguars", abbr: "jax" },
  { city: "Kansas City", name: "Chiefs", abbr: "kc" },
  { city: "Las Vegas", name: "Raiders", abbr: "lv" },
  { city: "Los Angeles", name: "Chargers", abbr: "lac" },
  { city: "Los Angeles", name: "Rams", abbr: "lar" },
  { city: "Miami", name: "Dolphins", abbr: "mia" },
  { city: "Minnesota", name: "Vikings", abbr: "min" },
  { city: "New England", name: "Patriots", abbr: "ne" },
  { city: "New Orleans", name: "Saints", abbr: "no" },
  { city: "New York", name: "Giants", abbr: "nyg" },
  { city: "New York", name: "Jets", abbr: "nyj" },
  { city: "Philadelphia", name: "Eagles", abbr: "phi" },
  { city: "Pittsburgh", name: "Steelers", abbr: "pit" },
  { city: "San Francisco", name: "49ers", abbr: "sf" },
  { city: "Seattle", name: "Seahawks", abbr: "sea" },
  { city: "Tampa Bay", name: "Buccaneers", abbr: "tb" },
  { city: "Tennessee", name: "Titans", abbr: "ten" },
  { city: "Washington", name: "Commanders", abbr: "wsh" },
];

// All NBA teams
const nbaTeams = [
  { city: "Atlanta", name: "Hawks", abbr: "atl" },
  { city: "Boston", name: "Celtics", abbr: "bos" },
  { city: "Brooklyn", name: "Nets", abbr: "bkn" },
  { city: "Charlotte", name: "Hornets", abbr: "cha" },
  { city: "Chicago", name: "Bulls", abbr: "chi" },
  { city: "Cleveland", name: "Cavaliers", abbr: "cle" },
  { city: "Dallas", name: "Mavericks", abbr: "dal" },
  { city: "Denver", name: "Nuggets", abbr: "den" },
  { city: "Detroit", name: "Pistons", abbr: "det" },
  { city: "Golden State", name: "Warriors", abbr: "gsw" },
  { city: "Houston", name: "Rockets", abbr: "hou" },
  { city: "Indiana", name: "Pacers", abbr: "ind" },
  { city: "Los Angeles", name: "Clippers", abbr: "lac" },
  { city: "Los Angeles", name: "Lakers", abbr: "lal" },
  { city: "Memphis", name: "Grizzlies", abbr: "mem" },
  { city: "Miami", name: "Heat", abbr: "mia" },
  { city: "Milwaukee", name: "Bucks", abbr: "mil" },
  { city: "Minnesota", name: "Timberwolves", abbr: "min" },
  { city: "New Orleans", name: "Pelicans", abbr: "no" },
  { city: "New York", name: "Knicks", abbr: "ny" },
  { city: "Oklahoma City", name: "Thunder", abbr: "okc" },
  { city: "Orlando", name: "Magic", abbr: "orl" },
  { city: "Philadelphia", name: "76ers", abbr: "phi" },
  { city: "Phoenix", name: "Suns", abbr: "phx" },
  { city: "Portland", name: "Trail Blazers", abbr: "por" },
  { city: "Sacramento", name: "Kings", abbr: "sac" },
  { city: "San Antonio", name: "Spurs", abbr: "sa" },
  { city: "Toronto", name: "Raptors", abbr: "tor" },
  { city: "Utah", name: "Jazz", abbr: "utah" },
  { city: "Washington", name: "Wizards", abbr: "wsh" },
];

// All NHL teams
const nhlTeams = [
  { city: "Anaheim", name: "Ducks", abbr: "ana" },
  { city: "Boston", name: "Bruins", abbr: "bos" },
  { city: "Buffalo", name: "Sabres", abbr: "buf" },
  { city: "Calgary", name: "Flames", abbr: "cgy" },
  { city: "Carolina", name: "Hurricanes", abbr: "car" },
  { city: "Chicago", name: "Blackhawks", abbr: "chi" },
  { city: "Colorado", name: "Avalanche", abbr: "col" },
  { city: "Columbus", name: "Blue Jackets", abbr: "cbj" },
  { city: "Dallas", name: "Stars", abbr: "dal" },
  { city: "Detroit", name: "Red Wings", abbr: "det" },
  { city: "Edmonton", name: "Oilers", abbr: "edm" },
  { city: "Florida", name: "Panthers", abbr: "fla" },
  { city: "Los Angeles", name: "Kings", abbr: "la" },
  { city: "Minnesota", name: "Wild", abbr: "min" },
  { city: "Montréal", name: "Canadiens", abbr: "mtl" },
  { city: "Nashville", name: "Predators", abbr: "nsh" },
  { city: "New Jersey", name: "Devils", abbr: "nj" },
  { city: "New York", name: "Islanders", abbr: "nyi" },
  { city: "New York", name: "Rangers", abbr: "nyr" },
  { city: "Ottawa", name: "Senators", abbr: "ott" },
  { city: "Philadelphia", name: "Flyers", abbr: "phi" },
  { city: "Pittsburgh", name: "Penguins", abbr: "pit" },
  { city: "San Jose", name: "Sharks", abbr: "sj" },
  { city: "Seattle", name: "Kraken", abbr: "sea" },
  { city: "St Louis", name: "Blues", abbr: "stl" },
  { city: "Tampa Bay", name: "Lightning", abbr: "tb" },
  { city: "Toronto", name: "Maple Leafs", abbr: "tor" },
  { city: "Vancouver", name: "Canucks", abbr: "van" },
  { city: "Vegas", name: "Golden Knights", abbr: "vgk" },
  { city: "Washington", name: "Capitals", abbr: "wsh" },
  { city: "Winnipeg", name: "Jets", abbr: "wpg" },
];

async function addAllTeams() {
  console.log("Adding all teams from major leagues...\n");
  
  // Get sports
  const allSports = await db.select().from(sports);
  const footballSport = allSports.find(s => s.name === "Football");
  const basketballSport = allSports.find(s => s.name === "Basketball");
  const hockeySport = allSports.find(s => s.name === "Hockey");
  
  if (!footballSport || !basketballSport || !hockeySport) {
    console.error("❌ Sports not found in database");
    process.exit(1);
  }
  
  // Delete existing teams to start fresh
  await db.delete(teams);
  console.log("✓ Cleared existing teams\n");
  
  // Add NFL teams
  console.log("Adding NFL teams...");
  for (const team of nflTeams) {
    await db.insert(teams).values({
      sportId: footballSport.id,
      city: team.city,
      name: team.name,
      abbreviation: team.abbr.toUpperCase(),
      logo: `https://a.espncdn.com/i/teamlogos/nfl/500/${team.abbr}.png`,
    });
    console.log(`  ✓ ${team.city} ${team.name}`);
  }
  
  // Add NBA teams
  console.log("\nAdding NBA teams...");
  for (const team of nbaTeams) {
    await db.insert(teams).values({
      sportId: basketballSport.id,
      city: team.city,
      name: team.name,
      abbreviation: team.abbr.toUpperCase(),
      logo: `https://a.espncdn.com/i/teamlogos/nba/500/${team.abbr}.png`,
    });
    console.log(`  ✓ ${team.city} ${team.name}`);
  }
  
  // Add NHL teams
  console.log("\nAdding NHL teams...");
  for (const team of nhlTeams) {
    await db.insert(teams).values({
      sportId: hockeySport.id,
      city: team.city,
      name: team.name,
      abbreviation: team.abbr.toUpperCase(),
      logo: `https://a.espncdn.com/i/teamlogos/nhl/500/${team.abbr}.png`,
    });
    console.log(`  ✓ ${team.city} ${team.name}`);
  }
  
  console.log("\n✅ All teams added successfully!");
  console.log(`   NFL: ${nflTeams.length} teams`);
  console.log(`   NBA: ${nbaTeams.length} teams`);
  console.log(`   NHL: ${nhlTeams.length} teams`);
  console.log(`   Total: ${nflTeams.length + nbaTeams.length + nhlTeams.length} teams`);
}

addAllTeams()
  .then(async () => {
    await client.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("❌ Error:", err);
    await client.end();
    process.exit(1);
  });
