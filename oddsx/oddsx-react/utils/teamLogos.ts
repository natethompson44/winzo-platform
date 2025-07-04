/**
 * Team Logo Utilities
 * Provides direct path generation for team logos across all sports
 * Prevents path mismatch issues and reduces HTTP requests to default logos
 */

/**
 * STRATEGIC TEAM LOGO MANAGEMENT
 * 
 * This utility prevents the default-team.png spam by:
 * 1. Using sport-specific fallbacks instead of generic default
 * 2. Caching failed logo requests to prevent repeated attempts
 * 3. Providing league-specific team mappings
 */

// Cache for failed logo requests to prevent spam
const failedLogosCache = new Set<string>();

// Sport-specific fallback icons (prevent default-team.png spam)
const sportFallbacks = {
  'epl': '/images/icon/epl-icon.png',
  'spain_la_liga': '/images/icon/laliga-icon.png', 
  'germany_bundesliga': '/images/icon/bundesliga-icon.png',
  'italy_serie_a': '/images/icon/seriea-icon.png',
  'france_ligue_one': '/images/icon/ligue1-icon.png',
  'uefa_champions_league': '/images/icon/champions-league-icon.png',
  'soccer': '/images/icon/soccer-icon.png', // Generic soccer
  'default': '/images/icon/team-icon.png' // Last resort
};

// League-specific team logo mappings
const leagueTeamMappings = {
  'epl': {
    'Manchester United': '/images/clubs/epl/manchester-united.png',
    'Liverpool': '/images/clubs/epl/liverpool.png',
    'Chelsea': '/images/clubs/epl/chelsea.png',
    'Manchester City': '/images/clubs/epl/manchester-city.png',
    'Arsenal': '/images/clubs/epl/arsenal.png',
    'Tottenham Hotspur': '/images/clubs/epl/tottenham-hotspur.png',
    'Tottenham': '/images/clubs/epl/tottenham-hotspur.png',
    'Newcastle United': '/images/clubs/epl/newcastle-united.png',
    'Newcastle': '/images/clubs/epl/newcastle-united.png',
    'Brighton & Hove Albion': '/images/clubs/epl/brighton-hove-albion.png',
    'Brighton': '/images/clubs/epl/brighton-hove-albion.png',
    'Aston Villa': '/images/clubs/epl/aston-villa.png',
    'West Ham United': '/images/clubs/epl/west-ham-united.png',
    'West Ham': '/images/clubs/epl/west-ham-united.png',
    'Fulham': '/images/clubs/epl/fulham.png',
    'Brentford': '/images/clubs/epl/brentford.png',
    'Crystal Palace': '/images/clubs/epl/crystal-palace.png',
    'Everton': '/images/clubs/epl/everton.png',
    'Nottingham Forest': '/images/clubs/epl/nottingham-forest.png',
    'Wolverhampton Wanderers': '/images/clubs/epl/wolverhampton-wanderers.png',
    'Wolves': '/images/clubs/epl/wolverhampton-wanderers.png',
    'Bournemouth': '/images/clubs/epl/bournemouth.png',
    'AFC Bournemouth': '/images/clubs/epl/bournemouth.png',
    'Leicester City': '/images/clubs/epl/leicester-city.png',
    'Leicester': '/images/clubs/epl/leicester-city.png',
    'Leeds United': '/images/clubs/epl/leeds-united.png',
    'Leeds': '/images/clubs/epl/leeds-united.png',
    'Southampton': '/images/clubs/epl/southampton.png',
    'Watford': '/images/clubs/epl/watford.png',
    'Norwich City': '/images/clubs/epl/norwich-city.png',
    'Norwich': '/images/clubs/epl/norwich-city.png',
    'Burnley': '/images/clubs/epl/burnley.png',
    'Sheffield United': '/images/clubs/epl/sheffield-united.png',
    'Sheffield Utd': '/images/clubs/epl/sheffield-united.png',
    'Luton Town': '/images/clubs/epl/luton-town.png',
    'Luton': '/images/clubs/epl/luton-town.png',
    'Ipswich Town': '/images/clubs/epl/ipswich-town.png',
    'Ipswich': '/images/clubs/epl/ipswich-town.png'
  },
  'spain_la_liga': {
    'Real Madrid': '/images/clubs/laliga/real-madrid.png',
    'Barcelona': '/images/clubs/laliga/barcelona.png',
    'Atletico Madrid': '/images/clubs/laliga/atletico-madrid.png',
    'Sevilla': '/images/clubs/laliga/sevilla.png',
    'Valencia': '/images/clubs/laliga/valencia.png',
    'Villarreal': '/images/clubs/laliga/villarreal.png',
    'Athletic Bilbao': '/images/clubs/laliga/athletic-bilbao.png',
    'Athletic Club': '/images/clubs/laliga/athletic-bilbao.png',
    'Real Sociedad': '/images/clubs/laliga/real-sociedad.png',
    'Real Betis': '/images/clubs/laliga/real-betis.png',
    'Celta Vigo': '/images/clubs/laliga/celta-vigo.png',
    'Espanyol': '/images/clubs/laliga/espanyol.png',
    'Getafe': '/images/clubs/laliga/getafe.png',
    'Granada': '/images/clubs/laliga/granada.png',
    'Mallorca': '/images/clubs/laliga/mallorca.png',
    'Osasuna': '/images/clubs/laliga/osasuna.png',
    'Rayo Vallecano': '/images/clubs/laliga/rayo-vallecano.png',
    'Cadiz': '/images/clubs/laliga/cadiz.png',
    'Elche': '/images/clubs/laliga/elche.png',
    'Alaves': '/images/clubs/laliga/alaves.png'
  },
  'germany_bundesliga': {
    'Bayern Munich': '/images/clubs/bundesliga/bayern-munich.png',
    'Borussia Dortmund': '/images/clubs/bundesliga/borussia-dortmund.png',
    'RB Leipzig': '/images/clubs/bundesliga/rb-leipzig.png',
    'Bayer Leverkusen': '/images/clubs/bundesliga/bayer-leverkusen.png',
    'Borussia Monchengladbach': '/images/clubs/bundesliga/borussia-monchengladbach.png',
    'Eintracht Frankfurt': '/images/clubs/bundesliga/eintracht-frankfurt.png',
    'VfL Wolfsburg': '/images/clubs/bundesliga/vfl-wolfsburg.png',
    'Hoffenheim': '/images/clubs/bundesliga/hoffenheim.png',
    'FC Koln': '/images/clubs/bundesliga/fc-koln.png',
    'Hertha Berlin': '/images/clubs/bundesliga/hertha-berlin.png',
    'Werder Bremen': '/images/clubs/bundesliga/werder-bremen.png',
    'Schalke 04': '/images/clubs/bundesliga/schalke-04.png',
    'Mainz': '/images/clubs/bundesliga/mainz.png',
    'Freiburg': '/images/clubs/bundesliga/freiburg.png',
    'Augsburg': '/images/clubs/bundesliga/augsburg.png',
    'Union Berlin': '/images/clubs/bundesliga/union-berlin.png',
    'Stuttgart': '/images/clubs/bundesliga/stuttgart.png',
    'Arminia Bielefeld': '/images/clubs/bundesliga/arminia-bielefeld.png'
  },
  'italy_serie_a': {
    'Juventus': '/images/clubs/seriea/juventus.png',
    'AC Milan': '/images/clubs/seriea/ac-milan.png',
    'Inter Milan': '/images/clubs/seriea/inter-milan.png',
    'Napoli': '/images/clubs/seriea/napoli.png',
    'AS Roma': '/images/clubs/seriea/as-roma.png',
    'Lazio': '/images/clubs/seriea/lazio.png',
    'Atalanta': '/images/clubs/seriea/atalanta.png',
    'Fiorentina': '/images/clubs/seriea/fiorentina.png',
    'Torino': '/images/clubs/seriea/torino.png',
    'Sassuolo': '/images/clubs/seriea/sassuolo.png',
    'Udinese': '/images/clubs/seriea/udinese.png',
    'Sampdoria': '/images/clubs/seriea/sampdoria.png',
    'Bologna': '/images/clubs/seriea/bologna.png',
    'Genoa': '/images/clubs/seriea/genoa.png',
    'Cagliari': '/images/clubs/seriea/cagliari.png',
    'Spezia': '/images/clubs/seriea/spezia.png',
    'Venezia': '/images/clubs/seriea/venezia.png',
    'Salernitana': '/images/clubs/seriea/salernitana.png'
  },
  'france_ligue_one': {
    'PSG': '/images/clubs/ligue1/psg.png',
    'Paris Saint-Germain': '/images/clubs/ligue1/psg.png',
    'Marseille': '/images/clubs/ligue1/marseille.png',
    'Lyon': '/images/clubs/ligue1/lyon.png',
    'AS Monaco': '/images/clubs/ligue1/as-monaco.png',
    'Monaco': '/images/clubs/ligue1/as-monaco.png',
    'Lille': '/images/clubs/ligue1/lille.png',
    'Rennes': '/images/clubs/ligue1/rennes.png',
    'Nice': '/images/clubs/ligue1/nice.png',
    'Montpellier': '/images/clubs/ligue1/montpellier.png',
    'Strasbourg': '/images/clubs/ligue1/strasbourg.png',
    'Nantes': '/images/clubs/ligue1/nantes.png',
    'Bordeaux': '/images/clubs/ligue1/bordeaux.png',
    'Reims': '/images/clubs/ligue1/reims.png',
    'Lens': '/images/clubs/ligue1/lens.png',
    'Angers': '/images/clubs/ligue1/angers.png',
    'Brest': '/images/clubs/ligue1/brest.png',
    'Clermont': '/images/clubs/ligue1/clermont.png',
    'Lorient': '/images/clubs/ligue1/lorient.png',
    'Metz': '/images/clubs/ligue1/metz.png',
    'Saint-Etienne': '/images/clubs/ligue1/saint-etienne.png'
  }
};

/**
 * Get team logo with smart fallback system
 */
export function getTeamLogo(teamName: string, league: string = 'soccer'): string {
  // Check if we have a specific mapping for this team in this league
  const leagueMapping = leagueTeamMappings[league as keyof typeof leagueTeamMappings];
  
  if (leagueMapping && (teamName in leagueMapping)) {
    return leagueMapping[teamName as keyof typeof leagueMapping];
  }
  
  // If no specific mapping, use league-specific fallback
  const leagueFallback = sportFallbacks[league as keyof typeof sportFallbacks];
  if (leagueFallback) {
    return leagueFallback;
  }
  
  // Final fallback
  return sportFallbacks.default;
}

/**
 * Handle image load errors with smart fallback
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement>, teamName: string, league: string) {
  const img = event.currentTarget;
  const originalSrc = img.src;
  
  // Cache this failed request to prevent repeated attempts
  failedLogosCache.add(originalSrc);
  
  // Set smart fallback
  img.src = getTeamLogo(teamName, league);
  
  // Prevent infinite loops
  img.onerror = null;
}

/**
 * Check if a logo URL has previously failed
 */
export function hasLogoPreviouslyFailed(logoUrl: string): boolean {
  return failedLogosCache.has(logoUrl);
}

/**
 * Get league-specific fallback icon
 */
export function getLeagueFallbackIcon(league: string): string {
  return sportFallbacks[league as keyof typeof sportFallbacks] || sportFallbacks.default;
}

/**
 * Clear failed logos cache (useful for testing or cache refresh)
 */
export function clearFailedLogosCache(): void {
  failedLogosCache.clear();
}

/**
 * Get team logo path with proper error handling and fallbacks
 * @param teamName - The team name as received from API
 * @param sport - Sport identifier (nfl, epl, nba, etc.)
 * @returns Complete path to team logo
 */
export const getTeamLogoPath = (teamName: string, sport: string): string => {
  if (!teamName || !sport) {
    return '/images/clubs/default-team.png';
  }

  // Direct path generation to match actual file structure
  switch (sport.toLowerCase()) {
    case 'nfl':
    case 'americanfootball':
      return getNFLTeamLogo(teamName);
    
    case 'epl':
    case 'soccer':
    case 'football':
      return getEPLTeamLogo(teamName);
    
    case 'nba':
    case 'basketball':
      return getNBATeamLogo(teamName);
    
    case 'nhl':
    case 'hockey':
    case 'icehockey':
      return getNHLTeamLogo(teamName);
    
    case 'mlb':
    case 'baseball':
      return getMLBTeamLogo(teamName);
    
    default:
      return getGenericTeamLogo(teamName, sport);
  }
};

/**
 * NFL Team Logo Path Generator
 * Converts team names to /images/clubs/nfl/[team-name].png format
 */
export const getNFLTeamLogo = (teamName: string): string => {
  const logoPath = `/images/clubs/nfl/${teamName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')}.png`;
  return logoPath;
};

/**
 * EPL/Soccer Team Logo Path Generator  
 * Converts team names to /images/clubs/epl/[team-name].png format
 */
export const getEPLTeamLogo = (teamName: string): string => {
  // Handle specific team name variations that come from API
  const teamNameMappings: { [key: string]: string } = {
    'Brighton & Hove Albion': 'brighton-hove-albion',
    'Brighton': 'brighton-hove-albion',
    'Tottenham Hotspur': 'tottenham-hotspur',
    'Tottenham': 'tottenham-hotspur',
    'Newcastle United': 'newcastle-united',
    'Newcastle': 'newcastle-united',
    'West Ham United': 'west-ham-united',
    'West Ham': 'west-ham-united',
    'Crystal Palace': 'crystal-palace',
    'Manchester United': 'manchester-united',
    'Man United': 'manchester-united',
    'Manchester City': 'manchester-city',
    'Man City': 'manchester-city',
    'Wolverhampton Wanderers': 'wolverhampton-wanderers',
    'Wolves': 'wolverhampton-wanderers',
    'Nottingham Forest': 'nottingham-forest',
    'Leicester City': 'leicester-city',
    'Leicester': 'leicester-city',
    'Ipswich Town': 'ipswich-town',
    'Ipswich': 'ipswich-town',
    'Aston Villa': 'aston-villa'
  };

  // Use mapping if available, otherwise generate from team name
  const fileName = teamNameMappings[teamName] || teamName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  return `/images/clubs/epl/${fileName}.png`;
};

/**
 * NBA Team Logo Path Generator
 * Converts team names to /images/clubs/nba/[team-name].png format
 */
export const getNBATeamLogo = (teamName: string): string => {
  const logoPath = `/images/clubs/nba/${teamName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')}.png`;
  return logoPath;
};

/**
 * NHL Team Logo Path Generator
 * Converts team names to /images/clubs/nhl/[team-name].png format
 */
export const getNHLTeamLogo = (teamName: string): string => {
  const logoPath = `/images/clubs/nhl/${teamName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')}.png`;
  return logoPath;
};

/**
 * MLB Team Logo Path Generator
 * Converts team names to /images/clubs/mlb/[team-name].png format
 */
export const getMLBTeamLogo = (teamName: string): string => {
  const logoPath = `/images/clubs/mlb/${teamName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')}.png`;
  return logoPath;
};

/**
 * Generic Team Logo Path Generator for other sports
 * Converts team names to /images/clubs/[sport]/[team-name].png format
 */
export const getGenericTeamLogo = (teamName: string, sport: string): string => {
  const logoPath = `/images/clubs/${sport.toLowerCase()}/${teamName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')}.png`;
  return logoPath;
};

/**
 * Soccer League Specific Logo Generators
 */
export const getLaLigaTeamLogo = (teamName: string): string => {
  return `/images/clubs/laliga/${teamName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')}.png`;
};

export const getBundesligaTeamLogo = (teamName: string): string => {
  return `/images/clubs/bundesliga/${teamName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')}.png`;
};

export const getSerieATeamLogo = (teamName: string): string => {
  return `/images/clubs/seriea/${teamName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')}.png`;
};

export const getLigue1TeamLogo = (teamName: string): string => {
  return `/images/clubs/ligue1/${teamName.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')}.png`;
};

/**
 * Multi-league Soccer Team Logo Generator
 * Handles different soccer leagues based on league parameter
 */
export const getSoccerTeamLogo = (teamName: string, league: string = 'epl'): string => {
  switch (league.toLowerCase()) {
    case 'epl':
    case 'premier-league':
      return getEPLTeamLogo(teamName);
    case 'laliga':
    case 'spain_la_liga':
      return getLaLigaTeamLogo(teamName);
    case 'bundesliga':
    case 'germany_bundesliga':
      return getBundesligaTeamLogo(teamName);
    case 'seriea':
    case 'italy_serie_a':
      return getSerieATeamLogo(teamName);
    case 'ligue1':
    case 'france_ligue_one':
      return getLigue1TeamLogo(teamName);
    default:
      return getEPLTeamLogo(teamName); // Default to EPL
  }
};

/**
 * Validate team logo path exists (frontend utility)
 * Note: This doesn't actually check file existence but provides consistent path format
 */
export const validateTeamLogoPath = (path: string): boolean => {
  return path.startsWith('/images/clubs/') && path.endsWith('.png');
};

/**
 * Get default team logo path
 */
export const getDefaultTeamLogo = (): string => {
  return '/images/clubs/default-team.png';
}; 