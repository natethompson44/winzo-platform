import axios from "axios";
import * as db from "./db";

interface ESPNGame {
  id: string;
  status: {
    type: {
      completed: boolean;
      state: string;
    };
  };
  competitions: Array<{
    competitors: Array<{
      team: {
        displayName: string;
      };
      score: string;
      homeAway: string;
    }>;
  }>;
}

const SPORT_ENDPOINTS = {
  Football: "football/nfl",
  Basketball: "basketball/nba",
  Hockey: "hockey/nhl",
  Baseball: "baseball/mlb",
};

async function fetchScores(sport: string): Promise<ESPNGame[]> {
  const endpoint = SPORT_ENDPOINTS[sport as keyof typeof SPORT_ENDPOINTS];
  if (!endpoint) return [];

  try {
    const response = await axios.get(
      `https://site.api.espn.com/apis/site/v2/sports/${endpoint}/scoreboard`
    );
    return response.data.events || [];
  } catch (error) {
    console.error(`[ScoreSync] Error fetching ${sport} scores:`, error);
    return [];
  }
}

async function settleGame(gameId: number, homeScore: number, awayScore: number) {
  const game = await db.getGameById(gameId);
  if (!game) return;

  const homeTeam = await db.getTeamById(game.homeTeamId);
  const awayTeam = await db.getTeamById(game.awayTeamId);
  
  if (!homeTeam || !awayTeam) return;

  // Determine winner
  const winnerId = homeScore > awayScore ? game.homeTeamId : game.awayTeamId;

  // Update game status with scores and winner
  await db.updateGameStatus(gameId, "completed", winnerId, homeScore, awayScore);

  // Get all bets for this game
  const bets = await db.getBetsByGameId(gameId);

  for (const bet of bets) {
    if (bet.status !== "pending") continue;

    const won = bet.selectedTeamId === winnerId;
    const newStatus = won ? "won" : "lost";

    // Update bet status
    await db.updateBetStatus(bet.id, newStatus);

    // If won, credit the payout to user's wallet
    if (won && bet.potentialPayout) {
      await db.adjustWalletBalance(bet.userId, bet.potentialPayout, "Bet win payout");
    }
  }

  console.log(`[ScoreSync] Settled game: ${homeTeam.name} ${homeScore} - ${awayScore} ${awayTeam.name}`);
}

async function syncScores() {
  console.log("[ScoreSync] Starting score sync...");

  try {
    const sports = await db.getAllSports();

    for (const sport of sports) {
      const espnGames = await fetchScores(sport.name);

      for (const espnGame of espnGames) {
        if (!espnGame.status.type.completed) continue;

        const competition = espnGame.competitions[0];
        if (!competition) continue;

        const homeCompetitor = competition.competitors.find(c => c.homeAway === "home");
        const awayCompetitor = competition.competitors.find(c => c.homeAway === "away");

        if (!homeCompetitor || !awayCompetitor) continue;

        const homeTeamName = homeCompetitor.team.displayName;
        const awayTeamName = awayCompetitor.team.displayName;
        const homeScore = parseInt(homeCompetitor.score);
        const awayScore = parseInt(awayCompetitor.score);

        // Find matching game in our database
        const homeTeam = await db.getTeamByName(homeTeamName);
        const awayTeam = await db.getTeamByName(awayTeamName);

        if (!homeTeam || !awayTeam) continue;

        const games = await db.getGamesByTeams(homeTeam.id, awayTeam.id);
        const pendingGame = games.find(g => g.status === "upcoming");

        if (pendingGame) {
          await settleGame(pendingGame.id, homeScore, awayScore);
        }
      }
    }

    console.log("[ScoreSync] Score sync complete");
  } catch (error) {
    console.error("[ScoreSync] Error during sync:", error);
  }
}

export function startScoreSyncScheduler() {
  console.log("[ScoreSync] Scheduler started - checking every 5 minutes");
  
  // Run immediately
  syncScores();
  
  // Then run every 5 minutes
  setInterval(syncScores, 5 * 60 * 1000);
}
