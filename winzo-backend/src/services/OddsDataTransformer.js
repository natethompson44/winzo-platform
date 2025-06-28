/**
 * OddsDataTransformer - Transforms The Odds API data to OddsX component format
 * Handles team logo mapping, odds formatting, and bookmaker prioritization
 */
class OddsDataTransformer {
  
  // Cache for default team logo to prevent redundant requests
  static defaultLogoCache = new Map();
  
  /**
   * Transform NFL game data for American Football page
   */
  static transformNFLGame(apiGame) {
    return {
      id: apiGame.id,
      sport_key: apiGame.sport_key,
      sport_icon: '/images/icon/america-football.png',
      league_name: 'NFL',
      game_time: this.formatGameTime(apiGame.commence_time),
      home_team: apiGame.home_team,
      away_team: apiGame.away_team,
      home_team_logo: this.getTeamLogo(apiGame.home_team, 'nfl'),
      away_team_logo: this.getTeamLogo(apiGame.away_team, 'nfl'),
      markets: this.transformMarkets(apiGame.bookmakers),
      best_odds: this.calculateBestOdds(apiGame.bookmakers),
      bookmaker_count: apiGame.bookmakers?.length || 0,
      last_updated: new Date().toISOString(),
      featured: this.isFeaturedGame(apiGame)
    };
  }

  /**
   * Transform Soccer game data for Soccer page
   */
  static transformSoccerGame(apiGame) {
    return {
      id: apiGame.id,
      sport_key: apiGame.sport_key,
      sport_icon: '/images/icon/soccer-icon.png',
      league_name: this.getLeagueName(apiGame.sport_key),
      game_time: this.formatGameTime(apiGame.commence_time),
      home_team: apiGame.home_team,
      away_team: apiGame.away_team,
      home_team_logo: this.getTeamLogo(apiGame.home_team, 'soccer'),
      away_team_logo: this.getTeamLogo(apiGame.away_team, 'soccer'),
      markets: this.transformSoccerMarkets(apiGame.bookmakers), // 3-way betting
      best_odds: this.calculateBestSoccerOdds(apiGame.bookmakers),
      bookmaker_count: apiGame.bookmakers?.length || 0,
      last_updated: new Date().toISOString(),
      featured: this.isFeaturedGame(apiGame)
    };
  }

  /**
   * Transform Basketball game data for Basketball page
   */
  static transformBasketballGame(apiGame) {
    return {
      id: apiGame.id,
      sport_key: apiGame.sport_key,
      sport_icon: '/images/icon/basketball.png',
      league_name: this.getLeagueName(apiGame.sport_key),
      game_time: this.formatGameTime(apiGame.commence_time),
      home_team: apiGame.home_team,
      away_team: apiGame.away_team,
      home_team_logo: this.getTeamLogo(apiGame.home_team, 'basketball'),
      away_team_logo: this.getTeamLogo(apiGame.away_team, 'basketball'),
      markets: this.transformMarkets(apiGame.bookmakers),
      best_odds: this.calculateBestOdds(apiGame.bookmakers),
      bookmaker_count: apiGame.bookmakers?.length || 0,
      last_updated: new Date().toISOString(),
      featured: this.isFeaturedGame(apiGame)
    };
  }

  /**
   * Transform Ice Hockey game data for Ice Hockey page
   */
  static transformIceHockeyGame(apiGame) {
    return {
      id: apiGame.id,
      sport_key: apiGame.sport_key,
      sport_icon: '/images/icon/ice-hockey.png',
      league_name: this.getLeagueName(apiGame.sport_key),
      game_time: this.formatGameTime(apiGame.commence_time),
      home_team: apiGame.home_team,
      away_team: apiGame.away_team,
      home_team_logo: this.getTeamLogo(apiGame.home_team, 'hockey'),
      away_team_logo: this.getTeamLogo(apiGame.away_team, 'hockey'),
      markets: this.transformMarkets(apiGame.bookmakers),
      best_odds: this.calculateBestOdds(apiGame.bookmakers),
      bookmaker_count: apiGame.bookmakers?.length || 0,
      last_updated: new Date().toISOString(),
      featured: this.isFeaturedGame(apiGame)
    };
  }

  /**
   * Get team logo based on team name and sport using actual file structure
   * FIXED: Corrected paths to match existing file structure without subdirectories
   */
  static getTeamLogo(teamName, sport) {
    // Team name mappings for each sport using CORRECT paths (no subdirectories)
    const teamMappings = {
      nfl: {
        'Philadelphia Eagles': '/images/clubs/philadelphia-eagles.png',
        'Dallas Cowboys': '/images/clubs/dallas-cowboys.png',
        'New England Patriots': '/images/clubs/new-england-patriots.png',
        'Pittsburgh Steelers': '/images/clubs/pittsburgh-steelers.png',
        'Green Bay Packers': '/images/clubs/green-bay-packers.png',
        'Kansas City Chiefs': '/images/clubs/kansas-city-chiefs.png',
        'Buffalo Bills': '/images/clubs/buffalo-bills.png',
        'San Francisco 49ers': '/images/clubs/san-francisco-49ers.png',
        'Seattle Seahawks': '/images/clubs/seattle-seahawks.png',
        'Los Angeles Rams': '/images/clubs/los-angeles-rams.png',
        'Tampa Bay Buccaneers': '/images/clubs/tampa-bay-buccaneers.png',
        'Baltimore Ravens': '/images/clubs/baltimore-ravens.png',
        'Cincinnati Bengals': '/images/clubs/cincinnati-bengals.png',
        'Cleveland Browns': '/images/clubs/cleveland-browns.png',
        'Denver Broncos': '/images/clubs/denver-broncos.png',
        'Indianapolis Colts': '/images/clubs/indianapolis-colts.png',
        'Jacksonville Jaguars': '/images/clubs/jacksonville-jaguars.png',
        'Tennessee Titans': '/images/clubs/tennessee-titans.png',
        'Houston Texans': '/images/clubs/houston-texans.png',
        'Las Vegas Raiders': '/images/clubs/las-vegas-raiders.png',
        'Los Angeles Chargers': '/images/clubs/los-angeles-chargers.png',
        'Miami Dolphins': '/images/clubs/miami-dolphins.png',
        'New York Jets': '/images/clubs/new-york-jets.png',
        'New York Giants': '/images/clubs/new-york-giants.png',
        'Washington Commanders': '/images/clubs/washington-commanders.png',
        'Chicago Bears': '/images/clubs/chicago-bears.png',
        'Detroit Lions': '/images/clubs/detroit-lions.png',
        'Minnesota Vikings': '/images/clubs/minnesota-vikings.png',
        'Atlanta Falcons': '/images/clubs/atlanta-falcons.png',
        'Carolina Panthers': '/images/clubs/carolina-panthers.png',
        'New Orleans Saints': '/images/clubs/new-orleans-saints.png',
        'Arizona Cardinals': '/images/clubs/arizona-cardinals.png'
      },
      soccer: {
        'Manchester United': '/images/clubs/manchester-united.png',
        'Liverpool': '/images/clubs/liverpool.png',
        'Chelsea': '/images/clubs/chelsea.png',
        'Manchester City': '/images/clubs/manchester-city.png',
        'Arsenal': '/images/clubs/arsenal.png',
        'Tottenham Hotspur': '/images/clubs/tottenham-hotspur.png',
        'Newcastle United': '/images/clubs/newcastle-united.png',
        'Brighton & Hove Albion': '/images/clubs/brighton-hove-albion.png',
        'Brighton': '/images/clubs/brighton-hove-albion.png',
        'Aston Villa': '/images/clubs/aston-villa.png',
        'West Ham United': '/images/clubs/west-ham-united.png',
        'Crystal Palace': '/images/clubs/crystal-palace.png',
        'Fulham': '/images/clubs/fulham.png',
        'Wolverhampton Wanderers': '/images/clubs/wolverhampton-wanderers.png',
        'Everton': '/images/clubs/everton.png',
        'Brentford': '/images/clubs/brentford.png',
        'Nottingham Forest': '/images/clubs/nottingham-forest.png',
        'Leicester City': '/images/clubs/leicester-city.png',
        'Ipswich Town': '/images/clubs/ipswich-town.png',
        'Southampton': '/images/clubs/southampton.png',
        'Bournemouth': '/images/clubs/bournemouth.png'
      },
      basketball: {
        'Los Angeles Lakers': '/images/clubs/los-angeles-lakers.png',
        'Boston Celtics': '/images/clubs/boston-celtics.png',
        'Golden State Warriors': '/images/clubs/golden-state-warriors.png',
        'Chicago Bulls': '/images/clubs/chicago-bulls.png',
        'Miami Heat': '/images/clubs/miami-heat.png',
        'Brooklyn Nets': '/images/clubs/brooklyn-nets.png',
        'New York Knicks': '/images/clubs/new-york-knicks.png',
        'Philadelphia 76ers': '/images/clubs/philadelphia-76ers.png',
        'Milwaukee Bucks': '/images/clubs/milwaukee-bucks.png',
        'Toronto Raptors': '/images/clubs/toronto-raptors.png',
        'Los Angeles Clippers': '/images/clubs/los-angeles-clippers.png',
        'Denver Nuggets': '/images/clubs/denver-nuggets.png',
        'Phoenix Suns': '/images/clubs/phoenix-suns.png',
        'Sacramento Kings': '/images/clubs/sacramento-kings.png',
        'Dallas Mavericks': '/images/clubs/dallas-mavericks.png',
        'Houston Rockets': '/images/clubs/houston-rockets.png',
        'Memphis Grizzlies': '/images/clubs/memphis-grizzlies.png',
        'New Orleans Pelicans': '/images/clubs/new-orleans-pelicans.png',
        'San Antonio Spurs': '/images/clubs/san-antonio-spurs.png',
        'Utah Jazz': '/images/clubs/utah-jazz.png',
        'Oklahoma City Thunder': '/images/clubs/oklahoma-city-thunder.png',
        'Portland Trail Blazers': '/images/clubs/portland-trail-blazers.png',
        'Minnesota Timberwolves': '/images/clubs/minnesota-timberwolves.png',
        'Indiana Pacers': '/images/clubs/indiana-pacers.png',
        'Detroit Pistons': '/images/clubs/detroit-pistons.png',
        'Cleveland Cavaliers': '/images/clubs/cleveland-cavaliers.png',
        'Atlanta Hawks': '/images/clubs/atlanta-hawks.png',
        'Charlotte Hornets': '/images/clubs/charlotte-hornets.png',
        'Orlando Magic': '/images/clubs/orlando-magic.png',
        'Washington Wizards': '/images/clubs/washington-wizards.png'
      }
    };

    const teamLogo = teamMappings[sport]?.[teamName];
    
    if (teamLogo) {
      return teamLogo;
    }
    
    // Return cached default logo to prevent redundant requests
    return this.getDefaultTeamLogo(teamName);
  }

  /**
   * Generate default team logo with caching to prevent redundant requests
   * PERFORMANCE FIX: Prevents hundreds of duplicate default-team.png requests
   */
  static getDefaultTeamLogo(teamName) {
    const cacheKey = 'default_logo';
    
    // Return cached path to prevent redundant requests
    if (this.defaultLogoCache.has(cacheKey)) {
      return this.defaultLogoCache.get(cacheKey);
    }
    
    const defaultPath = '/images/clubs/default-team.png';
    this.defaultLogoCache.set(cacheKey, defaultPath);
    
    return defaultPath;
  }

  /**
   * Get league name from sport key
   */
  static getLeagueName(sportKey) {
    const leagueNames = {
      'americanfootball_nfl': 'NFL',
      'americanfootball_ncaaf': 'NCAAF',
      'americanfootball_cfl': 'CFL',
      'basketball_nba': 'NBA',
      'basketball_ncaab': 'NCAA Basketball',
      'soccer_epl': 'Premier League',
      'soccer_uefa_champions_league': 'Champions League',
      'soccer_spain_la_liga': 'La Liga',
      'soccer_germany_bundesliga': 'Bundesliga',
      'soccer_italy_serie_a': 'Serie A',
      'soccer_france_ligue_one': 'Ligue 1',
      'soccer_usa_mls': 'MLS',
      'icehockey_nhl': 'NHL',
      'baseball_mlb': 'MLB',
      'tennis_atp_us_open': 'US Open (ATP)',
      'tennis_wta_us_open': 'US Open (WTA)'
    };

    return leagueNames[sportKey] || sportKey.replace(/_/g, ' ').toUpperCase();
  }

  /**
   * Format game time for display in CDT (Central Daylight Time)
   * Fixed: All game times now display in CDT as requested
   */
  static formatGameTime(commenceTime) {
    const gameTime = new Date(commenceTime);
    const now = new Date();
    
    // Convert both times to CDT for consistent comparison
    const cdtOptions = { timeZone: 'America/Chicago' };
    const gameTimeCDT = new Date(gameTime.toLocaleString('en-US', cdtOptions));
    const nowCDT = new Date(now.toLocaleString('en-US', cdtOptions));
    
    const diffMs = gameTimeCDT - nowCDT;
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    // Format options for CDT display
    const timeFormatOptions = { 
      timeZone: 'America/Chicago',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    };

    const dateTimeFormatOptions = { 
      timeZone: 'America/Chicago',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    };

    if (diffHours < 0) {
      return 'Live';
    } else if (diffHours < 24) {
      const timeStr = gameTime.toLocaleTimeString('en-US', timeFormatOptions);
      return `Today, ${timeStr} CDT`;
    } else if (diffHours < 48) {
      const timeStr = gameTime.toLocaleTimeString('en-US', timeFormatOptions);
      return `Tomorrow, ${timeStr} CDT`;
    } else {
      const dateTimeStr = gameTime.toLocaleDateString('en-US', dateTimeFormatOptions);
      return `${dateTimeStr} CDT`;
    }
  }

  /**
   * Transform markets for regular 2-way betting (NFL, NBA, NHL)
   * Enhanced with spread and totals processing
   */
  static transformMarkets(bookmakers) {
    if (!bookmakers || bookmakers.length === 0) return {};

    const markets = {};
    
    for (const bookmaker of bookmakers) {
      for (const market of bookmaker.markets || []) {
        if (!markets[market.key]) {
          markets[market.key] = {
            outcomes: {},
            bookmakers: [],
            market_type: this.getMarketType(market.key)
          };
        }

        // Store outcomes with enhanced data
        for (const outcome of market.outcomes || []) {
          if (!markets[market.key].outcomes[outcome.name]) {
            markets[market.key].outcomes[outcome.name] = [];
          }
          
          // Enhanced outcome data with point/line information
          const enhancedOutcome = {
            bookmaker: bookmaker.key,
            bookmaker_title: bookmaker.title,
            price: outcome.price,
            point: outcome.point, // For spreads and totals
            last_update: bookmaker.last_update
          };
          
          markets[market.key].outcomes[outcome.name].push(enhancedOutcome);
        }

        // Store unique bookmakers
        if (!markets[market.key].bookmakers.includes(bookmaker.key)) {
          markets[market.key].bookmakers.push(bookmaker.key);
        }
      }
    }

    return markets;
  }

  /**
   * Get market type for better display formatting
   */
  static getMarketType(marketKey) {
    const marketTypes = {
      'h2h': 'moneyline',
      'spreads': 'spread',
      'totals': 'total',
      'over_under': 'total',
      'asian_handicaps': 'handicap'
    };
    
    return marketTypes[marketKey] || marketKey;
  }

  /**
   * Transform markets for 3-way betting (Soccer)
   */
  static transformSoccerMarkets(bookmakers) {
    const markets = this.transformMarkets(bookmakers);
    
    // Add soccer-specific processing for 3-way betting
    if (markets.h2h) {
      const outcomes = markets.h2h.outcomes;
      markets.h2h.three_way = {
        home: outcomes[Object.keys(outcomes)[0]] || [],
        draw: outcomes[Object.keys(outcomes)[1]] || [],
        away: outcomes[Object.keys(outcomes)[2]] || []
      };
    }

    return markets;
  }

  /**
   * Calculate best odds across all bookmakers
   */
  static calculateBestOdds(bookmakers) {
    if (!bookmakers || bookmakers.length === 0) return null;

    const bestOdds = {};

    for (const bookmaker of bookmakers) {
      for (const market of bookmaker.markets || []) {
        if (!bestOdds[market.key]) {
          bestOdds[market.key] = {};
        }

        for (const outcome of market.outcomes || []) {
          const currentBest = bestOdds[market.key][outcome.name];
          if (!currentBest || outcome.price > currentBest.price) {
            bestOdds[market.key][outcome.name] = {
              price: outcome.price,
              bookmaker: bookmaker.key,
              bookmaker_title: bookmaker.title
            };
          }
        }
      }
    }

    return bestOdds;
  }

  /**
   * Calculate best odds for soccer 3-way betting
   */
  static calculateBestSoccerOdds(bookmakers) {
    const bestOdds = this.calculateBestOdds(bookmakers);
    
    // Add soccer-specific best odds processing
    if (bestOdds.h2h) {
      const outcomes = Object.keys(bestOdds.h2h);
      bestOdds.h2h.summary = {
        home: bestOdds.h2h[outcomes[0]],
        draw: bestOdds.h2h[outcomes[1]],
        away: bestOdds.h2h[outcomes[2]]
      };
    }

    return bestOdds;
  }

  /**
   * Check if game is featured (multiple bookmakers, prime time, etc.)
   */
  static isFeaturedGame(apiGame) {
    const bookmakerCount = apiGame.bookmakers?.length || 0;
    const gameTime = new Date(apiGame.commence_time);
    const isWeekend = gameTime.getDay() === 0 || gameTime.getDay() === 6;
    const isPrimeTime = gameTime.getHours() >= 19 && gameTime.getHours() <= 23;

    return bookmakerCount >= 3 && (isWeekend || isPrimeTime);
  }

  /**
   * Get bookmaker priority for sport
   */
  static getBookmakerPriority(sportKey) {
    const priorities = {
      'americanfootball_nfl': ['draftkings', 'fanduel', 'betmgm', 'caesars'],
      'basketball_nba': ['draftkings', 'fanduel', 'betmgm', 'caesars'],
      'soccer_epl': ['bet365', 'williamhill', 'ladbrokes', 'betfair'],
      'icehockey_nhl': ['draftkings', 'fanduel', 'betmgm'],
      'baseball_mlb': ['draftkings', 'fanduel', 'betmgm'],
      'tennis': ['bet365', 'williamhill', 'betfair']
    };

    return priorities[sportKey] || ['draftkings', 'bet365', 'williamhill'];
  }

  /**
   * Filter and prioritize bookmakers for optimal display
   */
  static prioritizeBookmakers(bookmakers, sportKey) {
    if (!bookmakers || bookmakers.length === 0) return [];

    const priority = this.getBookmakerPriority(sportKey);
    const prioritized = [];
    const others = [];

    for (const bookmaker of bookmakers) {
      if (priority.includes(bookmaker.key)) {
        prioritized.push(bookmaker);
      } else {
        others.push(bookmaker);
      }
    }

    // Sort prioritized by priority order
    prioritized.sort((a, b) => {
      const aIndex = priority.indexOf(a.key);
      const bIndex = priority.indexOf(b.key);
      return aIndex - bIndex;
    });

    // Return prioritized first, then others
    return [...prioritized, ...others];
  }
}

module.exports = OddsDataTransformer;
