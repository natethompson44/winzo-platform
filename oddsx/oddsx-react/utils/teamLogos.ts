/**
 * Team Logo Utilities
 * Provides direct path generation for team logos across all sports
 * Prevents path mismatch issues and reduces HTTP requests to default logos
 */

/**
 * Get team logo path with proper error handling and fallbacks
 * @param teamName - The team name as received from API
 * @param sport - Sport identifier (nfl, epl, nba, etc.)
 * @returns Complete path to team logo
 */
export const getTeamLogo = (teamName: string, sport: string): string => {
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