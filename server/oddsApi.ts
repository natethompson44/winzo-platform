import axios from "axios";

const ODDS_API_BASE_URL = "https://api.the-odds-api.com/v4";
const API_KEY = process.env.ODDS_API_KEY;

// Sport keys for The Odds API
export const SPORT_KEYS = {
  NFL: "americanfootball_nfl",
  NBA: "basketball_nba",
  MLB: "baseball_mlb",
  NHL: "icehockey_nhl",
};

export interface OddsApiGame {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      outcomes: Array<{
        name: string;
        price: number; // American odds
      }>;
    }>;
  }>;
}

/**
 * Fetch odds for a specific sport
 */
export async function fetchOddsForSport(sportKey: string): Promise<OddsApiGame[]> {
  if (!API_KEY) {
    console.warn("[Odds API] API key not configured");
    return [];
  }

  try {
    const response = await axios.get(`${ODDS_API_BASE_URL}/sports/${sportKey}/odds`, {
      params: {
        apiKey: API_KEY,
        regions: "us",
        markets: "h2h", // Head to head (moneyline)
        oddsFormat: "american",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(`[Odds API] Error fetching odds for ${sportKey}:`, error.message);
    return [];
  }
}

/**
 * Fetch odds for all supported sports
 */
export async function fetchAllOdds(): Promise<{
  nfl: OddsApiGame[];
  nba: OddsApiGame[];
  mlb: OddsApiGame[];
  nhl: OddsApiGame[];
}> {
  const [nfl, nba, mlb, nhl] = await Promise.all([
    fetchOddsForSport(SPORT_KEYS.NFL),
    fetchOddsForSport(SPORT_KEYS.NBA),
    fetchOddsForSport(SPORT_KEYS.MLB),
    fetchOddsForSport(SPORT_KEYS.NHL),
  ]);

  return { nfl, nba, mlb, nhl };
}

/**
 * Convert Odds API game to our database format
 */
export function convertOddsApiGame(
  apiGame: OddsApiGame,
  sportId: number,
  homeTeamId: number,
  awayTeamId: number
) {
  // Get odds from first bookmaker (or average if multiple)
  const bookmaker = apiGame.bookmakers[0];
  if (!bookmaker) {
    return null;
  }

  const h2hMarket = bookmaker.markets.find((m) => m.key === "h2h");
  if (!h2hMarket) {
    return null;
  }

  const homeOutcome = h2hMarket.outcomes.find((o) => o.name === apiGame.home_team);
  const awayOutcome = h2hMarket.outcomes.find((o) => o.name === apiGame.away_team);

  if (!homeOutcome || !awayOutcome) {
    return null;
  }

  return {
    sportId,
    homeTeamId,
    awayTeamId,
    homeOdds: Math.round(homeOutcome.price),
    awayOdds: Math.round(awayOutcome.price),
    scheduledAt: new Date(apiGame.commence_time),
    status: "upcoming" as const,
    externalId: apiGame.id, // Store API ID for reference
  };
}

/**
 * Find team ID by name (fuzzy matching)
 */
export function findTeamByName(teams: any[], teamName: string): any | undefined {
  // Exact match
  let team = teams.find((t) => t.name.toLowerCase() === teamName.toLowerCase());
  if (team) return team;

  // City match
  team = teams.find((t) => t.city && teamName.toLowerCase().includes(t.city.toLowerCase()));
  if (team) return team;

  // Abbreviation match
  team = teams.find((t) => t.abbreviation && teamName.toLowerCase().includes(t.abbreviation.toLowerCase()));
  if (team) return team;

  // Partial name match
  team = teams.find((t) => teamName.toLowerCase().includes(t.name.toLowerCase().split(" ").pop() || ""));
  if (team) return team;

  return undefined;
}
