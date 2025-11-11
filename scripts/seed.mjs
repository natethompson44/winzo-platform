import { drizzle } from "drizzle-orm/mysql2";
import { sports, teams, games } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const sportsData = [
  { name: "American Football", code: "NFL", icon: "🏈" },
  { name: "Basketball", code: "NBA", icon: "🏀" },
  { name: "Baseball", code: "MLB", icon: "⚾" },
  { name: "Hockey", code: "NHL", icon: "🏒" },
];

const teamsData = [
  // NFL Teams
  { sportCode: "NFL", name: "Kansas City Chiefs", city: "Kansas City", abbreviation: "KC", primaryColor: "#E31837" },
  { sportCode: "NFL", name: "San Francisco 49ers", city: "San Francisco", abbreviation: "SF", primaryColor: "#AA0000" },
  { sportCode: "NFL", name: "Dallas Cowboys", city: "Dallas", abbreviation: "DAL", primaryColor: "#041E42" },
  { sportCode: "NFL", name: "Buffalo Bills", city: "Buffalo", abbreviation: "BUF", primaryColor: "#00338D" },
  { sportCode: "NFL", name: "Philadelphia Eagles", city: "Philadelphia", abbreviation: "PHI", primaryColor: "#004C54" },
  { sportCode: "NFL", name: "Green Bay Packers", city: "Green Bay", abbreviation: "GB", primaryColor: "#203731" },
  
  // NBA Teams
  { sportCode: "NBA", name: "Los Angeles Lakers", city: "Los Angeles", abbreviation: "LAL", primaryColor: "#552583" },
  { sportCode: "NBA", name: "Boston Celtics", city: "Boston", abbreviation: "BOS", primaryColor: "#007A33" },
  { sportCode: "NBA", name: "Golden State Warriors", city: "Golden State", abbreviation: "GSW", primaryColor: "#1D428A" },
  { sportCode: "NBA", name: "Miami Heat", city: "Miami", abbreviation: "MIA", primaryColor: "#98002E" },
  { sportCode: "NBA", name: "Milwaukee Bucks", city: "Milwaukee", abbreviation: "MIL", primaryColor: "#00471B" },
  { sportCode: "NBA", name: "Brooklyn Nets", city: "Brooklyn", abbreviation: "BKN", primaryColor: "#000000" },
  
  // MLB Teams
  { sportCode: "MLB", name: "New York Yankees", city: "New York", abbreviation: "NYY", primaryColor: "#003087" },
  { sportCode: "MLB", name: "Los Angeles Dodgers", city: "Los Angeles", abbreviation: "LAD", primaryColor: "#005A9C" },
  { sportCode: "MLB", name: "Boston Red Sox", city: "Boston", abbreviation: "BOS", primaryColor: "#BD3039" },
  { sportCode: "MLB", name: "Houston Astros", city: "Houston", abbreviation: "HOU", primaryColor: "#002D62" },
  { sportCode: "MLB", name: "Atlanta Braves", city: "Atlanta", abbreviation: "ATL", primaryColor: "#CE1141" },
  { sportCode: "MLB", name: "San Francisco Giants", city: "San Francisco", abbreviation: "SF", primaryColor: "#FD5A1E" },
  
  // NHL Teams
  { sportCode: "NHL", name: "Toronto Maple Leafs", city: "Toronto", abbreviation: "TOR", primaryColor: "#00205B" },
  { sportCode: "NHL", name: "Montreal Canadiens", city: "Montreal", abbreviation: "MTL", primaryColor: "#AF1E2D" },
  { sportCode: "NHL", name: "Boston Bruins", city: "Boston", abbreviation: "BOS", primaryColor: "#FFB81C" },
  { sportCode: "NHL", name: "Tampa Bay Lightning", city: "Tampa Bay", abbreviation: "TB", primaryColor: "#002868" },
  { sportCode: "NHL", name: "Colorado Avalanche", city: "Colorado", abbreviation: "COL", primaryColor: "#6F263D" },
  { sportCode: "NHL", name: "Vegas Golden Knights", city: "Vegas", abbreviation: "VGK", primaryColor: "#B4975A" },
];

async function seed() {
  console.log("Starting seed...");

  // Insert sports
  console.log("Seeding sports...");
  for (const sport of sportsData) {
    await db.insert(sports).values(sport).onDuplicateKeyUpdate({ set: { name: sport.name } });
  }

  // Get sport IDs
  const sportRecords = await db.select().from(sports);
  const sportMap = {};
  sportRecords.forEach(s => {
    sportMap[s.code] = s.id;
  });

  // Insert teams
  console.log("Seeding teams...");
  for (const team of teamsData) {
    const sportId = sportMap[team.sportCode];
    if (sportId) {
      await db.insert(teams).values({
        sportId,
        name: team.name,
        city: team.city,
        abbreviation: team.abbreviation,
        primaryColor: team.primaryColor,
        logo: null,
      });
    }
  }

  // Create sample games
  console.log("Seeding sample games...");
  const teamRecords = await db.select().from(teams);
  
  // Group teams by sport
  const teamsBySport = {};
  teamRecords.forEach(t => {
    if (!teamsBySport[t.sportId]) {
      teamsBySport[t.sportId] = [];
    }
    teamsBySport[t.sportId].push(t);
  });

  // Create games for each sport
  const now = new Date();
  for (const [sportId, sportTeams] of Object.entries(teamsBySport)) {
    if (sportTeams.length >= 2) {
      // Create 3 upcoming games per sport
      for (let i = 0; i < 3; i++) {
        const homeTeam = sportTeams[i * 2 % sportTeams.length];
        const awayTeam = sportTeams[(i * 2 + 1) % sportTeams.length];
        const scheduledAt = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000); // i+1 days from now

        await db.insert(games).values({
          sportId: parseInt(sportId),
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          homeOdds: -110 + Math.floor(Math.random() * 50),
          awayOdds: -110 + Math.floor(Math.random() * 50),
          scheduledAt,
          status: "upcoming",
        });
      }
    }
  }

  console.log("Seed completed!");
}

seed().catch(console.error);
