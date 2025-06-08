export interface SportInstance {
  id: string;
  key: string;
  group: string;
  title: string;
  description: string;
  active: boolean;
  hasOutrights: boolean;
  apiSportId?: number;
  country_id?: string;
  defaultSeason?: number;
  bigWinMessage?: string;
}

export interface LeagueInstance {
  id: string;
  apiId: number;
  sport_id: string;
  country_id?: string;
  name: string;
  logo?: string;
  flag?: string;
  season?: number;
  seasons?: any;
  currentSeason?: number;
}

export interface CountryInstance {
  id: string;
  name: string;
  code: string;
  flagUrl?: string;
}

export interface VenueInstance {
  id: string;
  apiId: number;
  country_id?: string;
  name: string;
  city?: string;
  address?: string;
  capacity?: number;
  surface?: string;
  image?: string;
}

export interface TeamInstance {
  id: string;
  apiId: number;
  league_id?: string;
  country_id?: string;
  venue_id?: string;
  name: string;
  code?: string;
  logo?: string;
  founded?: number;
  favorites: number;
}

export interface PlayerInstance {
  id: string;
  apiId: number;
  team_id?: string;
  country_id?: string;
  firstName: string;
  lastName: string;
  age?: number;
  position?: string;
  number?: number;
  height?: string;
  weight?: string;
  injured?: boolean;
  photo?: string;
}

export interface SportsEventInstance {
  id: string;
  externalId: string;
  sport_id: string;
  homeTeam: string;
  awayTeam: string;
  league_id?: string;
  home_team_id?: string;
  away_team_id?: string;
  commenceTime: string;
  status: string;
  homeScore?: number;
  awayScore?: number;
  liveHomeScore?: number;
  liveAwayScore?: number;
  venue_id?: string;
  referee?: string;
  timezone?: string;
  statusLong?: string;
  statusShort?: string;
  elapsed?: number;
  lastUpdated: string;
  bigWinMessage?: string;
}

export interface OddsInstance {
  id: string;
  event_id: string;
  bookmaker: string;
  bookmakerTitle: string;
  market: string;
  outcome: string;
  price: number;
  decimalPrice: number;
  point?: number;
  bookmakerId?: number;
  marketType?: string;
  isLiveOdds: boolean;
  openingPrice?: number;
  lastUpdated: string;
  active: boolean;
}
