import { fetchOddsForSport, OddsApiGame } from "./oddsApi";
import * as db from "./db";

/**
 * Sync odds from Odds API to database
 * Fetches current odds for all supported sports and updates games
 */
export async function syncOdds(): Promise<{
  success: boolean;
  gamesUpdated: number;
  gamesCreated: number;
  errors: string[];
}> {
  const results = {
    success: true,
    gamesUpdated: 0,
    gamesCreated: 0,
    errors: [] as string[],
  };

  try {
    console.log("[OddsSync] Starting odds sync...");
    
    // Fetch all sports from database
    const sports = await db.getAllSports();
    
    for (const sport of sports) {
      try {
        // Map our sport names to Odds API sport keys
        const sportKeyMap: Record<string, string> = {
          "Football": "americanfootball_nfl",
          "Basketball": "basketball_nba",
          "Baseball": "baseball_mlb",
          "Hockey": "icehockey_nhl",
        };
        
        const sportKey = sportKeyMap[sport.name];
        if (!sportKey) {
          console.log(`[OddsSync] Skipping ${sport.name} - no API mapping`);
          continue;
        }
        
        console.log(`[OddsSync] Fetching odds for ${sport.name}...`);
        const oddsData = await fetchOddsForSport(sportKey);
        
        if (!oddsData || oddsData.length === 0) {
          console.log(`[OddsSync] No odds data for ${sport.name}`);
          continue;
        }
        
        // Process each game from the API
        for (const game of oddsData) {
          try {
            await processGame(game, sport.id, results);
          } catch (error) {
            const err = error as Error;
            console.error(`[OddsSync] Error processing game ${game.id}:`, err.message);
            results.errors.push(`Game ${game.id}: ${err.message}`);
          }
        }
      } catch (error) {
        const err = error as Error;
        console.error(`[OddsSync] Error syncing ${sport.name}:`, err.message);
        results.errors.push(`${sport.name}: ${err.message}`);
        results.success = false;
      }
    }
    
    console.log(`[OddsSync] Sync complete: ${results.gamesCreated} created, ${results.gamesUpdated} updated, ${results.errors.length} errors`);
    
  } catch (error) {
    const err = error as Error;
    console.error("[OddsSync] Fatal error during sync:", err.message);
    results.success = false;
    results.errors.push(`Fatal: ${err.message}`);
  }
  
  return results;
}

/**
 * Process a single game from the Odds API
 */
async function processGame(
  apiGame: OddsApiGame,
  sportId: number,
  results: { gamesUpdated: number; gamesCreated: number }
): Promise<void> {
  const gameDate = new Date(apiGame.commence_time);
  
  // Find or create teams
  const homeTeam = await db.getTeamByName(apiGame.home_team);
  const awayTeam = await db.getTeamByName(apiGame.away_team);
  
  if (!homeTeam || !awayTeam) {
    console.log(`[OddsSync] Teams not found for game: ${apiGame.home_team} vs ${apiGame.away_team}`);
    return;
  }
  
  // Extract odds from bookmakers (use first available bookmaker)
  const bookmaker = apiGame.bookmakers?.[0];
  if (!bookmaker) {
    console.log(`[OddsSync] No bookmaker data for game ${apiGame.id}`);
    return;
  }
  
  // Find h2h (moneyline) market
  const h2hMarket = bookmaker.markets.find((m: any) => m.key === "h2h");
  
  if (!h2hMarket) {
    console.log(`[OddsSync] Missing h2h market for game ${apiGame.id}`);
    return;
  }
  
  // Extract moneyline odds
  const homeOutcome = h2hMarket.outcomes.find((o: any) => o.name === apiGame.home_team);
  const awayOutcome = h2hMarket.outcomes.find((o: any) => o.name === apiGame.away_team);
  
  if (!homeOutcome || !awayOutcome) {
    console.log(`[OddsSync] Incomplete odds for game ${apiGame.id}`);
    return;
  }
  
  // Convert American odds to our format (store as integers, e.g., -110 or +150)
  const homeOdds = Math.round(homeOutcome.price);
  const awayOdds = Math.round(awayOutcome.price);
  
  // Check if game already exists by external ID
  const existingGame = await db.getGameByExternalId(apiGame.id);
  
  if (existingGame) {
    // Update existing game
    await db.updateGameOddsAndSpread(existingGame.id, {
      homeOdds,
      awayOdds,
      scheduledAt: gameDate,
    });
    results.gamesUpdated++;
    console.log(`[OddsSync] Updated game: ${apiGame.away_team} @ ${apiGame.home_team}`);
  } else {
    // Create new game
    await db.createGame({
      sportId,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      scheduledAt: gameDate,
      homeOdds,
      awayOdds,
      status: "upcoming",
      externalId: apiGame.id,
    });
    results.gamesCreated++;
    console.log(`[OddsSync] Created game: ${apiGame.away_team} @ ${apiGame.home_team}`);
  }
}

/**
 * Start the odds sync scheduler
 * Runs every 5 minutes
 */
export function startOddsSyncScheduler(): NodeJS.Timeout {
  console.log("[OddsSync] Starting scheduler (every 5 minutes)");
  
  // Run immediately on start
  syncOdds().catch(err => {
    console.error("[OddsSync] Initial sync failed:", err);
  });
  
  // Then run every 5 minutes
  const interval = setInterval(() => {
    syncOdds().catch(err => {
      console.error("[OddsSync] Scheduled sync failed:", err);
    });
  }, 5 * 60 * 1000); // 5 minutes
  
  return interval;
}
