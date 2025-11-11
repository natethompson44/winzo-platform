import { drizzle } from "drizzle-orm/mysql2";
import { teams, sports } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";
import "dotenv/config";

const db = drizzle(process.env.DATABASE_URL);

/**
 * Generate ESPN logo URL for a team
 */
function getLogoUrl(sportName, abbreviation) {
  if (!abbreviation) return null;
  
  const sportMap = {
    "Football": "nfl",
    "American Football": "nfl",
    "Basketball": "nba",
    "Baseball": "mlb",
    "Hockey": "nhl",
  };
  
  const sportKey = sportMap[sportName];
  if (!sportKey) return null;
  
  // ESPN logo URL pattern
  return `https://a.espncdn.com/i/teamlogos/${sportKey}/500/${abbreviation.toLowerCase()}.png`;
}

async function updateLogos() {
  console.log("Updating team logos...");
  
  try {
    // Get all sports
    const allSports = await db.select().from(sports);
    
    for (const sport of allSports) {
      console.log(`\nProcessing ${sport.name}...`);
      
      // Get all teams for this sport
      const sportTeams = await db.select().from(teams).where(eq(teams.sportId, sport.id));
      
      for (const team of sportTeams) {
        const logoUrl = getLogoUrl(sport.name, team.abbreviation);
        
        if (logoUrl) {
          await db.update(teams)
            .set({ logo: logoUrl })
            .where(eq(teams.id, team.id));
          
          console.log(`  ✓ ${team.name} (${team.abbreviation}): ${logoUrl}`);
        } else {
          console.log(`  ✗ ${team.name}: No abbreviation or sport mapping`);
        }
      }
    }
    
    console.log("\n✅ Logo update complete!");
    
  } catch (error) {
    console.error("Error updating logos:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

updateLogos();
