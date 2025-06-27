/**
 * OddsDataTransformer - Transforms The Odds API data to OddsX component format
 * Handles team logo mapping, odds formatting, and bookmaker prioritization
 */
class OddsDataTransformer {
  
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
   * Get team logo based on team name and sport using new organized structure
   */
  static getTeamLogo(teamName, sport) {
    // Team name mappings for each sport using new directory structure
    const teamMappings = {
      nfl: {
        'Philadelphia Eagles': '/images/clubs/nfl/philadelphia-eagles.png',
        'Dallas Cowboys': '/images/clubs/nfl/dallas-cowboys.png',
        'New England Patriots': '/images/clubs/nfl/new-england-patriots.png',
        'Pittsburgh Steelers': '/images/clubs/nfl/pittsburgh-steelers.png',
        'Green Bay Packers': '/images/clubs/nfl/green-bay-packers.png',
        'Kansas City Chiefs': '/images/clubs/nfl/kansas-city-chiefs.png',
        'Buffalo Bills': '/images/clubs/nfl/buffalo-bills.png',
        'San Francisco 49ers': '/images/clubs/nfl/san-francisco-49ers.png',
        'Seattle Seahawks': '/images/clubs/nfl/seattle-seahawks.png',
        'Los Angeles Rams': '/images/clubs/nfl/los-angeles-rams.png',
        'Tampa Bay Buccaneers': '/images/clubs/nfl/tampa-bay-buccaneers.png',
        'Baltimore Ravens': '/images/clubs/nfl/baltimore-ravens.png',
        'Cincinnati Bengals': '/images/clubs/nfl/cincinnati-bengals.png',
        'Cleveland Browns': '/images/clubs/nfl/cleveland-browns.png',
        'Denver Broncos': '/images/clubs/nfl/denver-broncos.png',
        'Indianapolis Colts': '/images/clubs/nfl/indianapolis-colts.png',
        'Jacksonville Jaguars': '/images/clubs/nfl/jacksonville-jaguars.png',
        'Tennessee Titans': '/images/clubs/nfl/tennessee-titans.png',
        'Houston Texans': '/images/clubs/nfl/houston-texans.png',
        'Las Vegas Raiders': '/images/clubs/nfl/las-vegas-raiders.png',
        'Los Angeles Chargers': '/images/clubs/nfl/los-angeles-chargers.png',
        'Miami Dolphins': '/images/clubs/nfl/miami-dolphins.png',
        'New York Jets': '/images/clubs/nfl/new-york-jets.png',
        'New York Giants': '/images/clubs/nfl/new-york-giants.png',
        'Washington Commanders': '/images/clubs/nfl/washington-commanders.png',
        'Chicago Bears': '/images/clubs/nfl/chicago-bears.png',
        'Detroit Lions': '/images/clubs/nfl/detroit-lions.png',
        'Minnesota Vikings': '/images/clubs/nfl/minnesota-vikings.png',
        'Atlanta Falcons': '/images/clubs/nfl/atlanta-falcons.png',
        'Carolina Panthers': '/images/clubs/nfl/carolina-panthers.png',
        'New Orleans Saints': '/images/clubs/nfl/new-orleans-saints.png',
        'Arizona Cardinals': '/images/clubs/nfl/arizona-cardinals.png'
      },
      soccer: {
        'Manchester United': '/images/clubs/epl/manchester-united.png',
        'Liverpool': '/images/clubs/epl/liverpool.png',
        'Chelsea': '/images/clubs/epl/chelsea.png',
        'Manchester City': '/images/clubs/epl/manchester-city.png',
        'Arsenal': '/images/clubs/epl/arsenal.png',
        'Tottenham Hotspur': '/images/clubs/epl/tottenham-hotspur.png',
        'Newcastle United': '/images/clubs/epl/newcastle-united.png',
        'Brighton & Hove Albion': '/images/clubs/epl/brighton-hove-albion.png',
        'Brighton': '/images/clubs/epl/brighton-hove-albion.png',
        'Aston Villa': '/images/clubs/epl/aston-villa.png',
        'West Ham United': '/images/clubs/epl/west-ham-united.png',
        'Crystal Palace': '/images/clubs/epl/crystal-palace.png',
        'Fulham': '/images/clubs/epl/fulham.png',
        'Wolverhampton Wanderers': '/images/clubs/epl/wolverhampton-wanderers.png',
        'Everton': '/images/clubs/epl/everton.png',
        'Brentford': '/images/clubs/epl/brentford.png',
        'Nottingham Forest': '/images/clubs/epl/nottingham-forest.png',
        'Leicester City': '/images/clubs/epl/leicester-city.png',
        'Ipswich Town': '/images/clubs/epl/ipswich-town.png',
        'Southampton': '/images/clubs/epl/southampton.png',
        'Bournemouth': '/images/clubs/epl/bournemouth.png'
      },
      basketball: {
        'Los Angeles Lakers': '/images/clubs/nba/los-angeles-lakers.png',
        'Boston Celtics': '/images/clubs/nba/boston-celtics.png',
        'Golden State Warriors': '/images/clubs/nba/golden-state-warriors.png',
        'Chicago Bulls': '/images/clubs/nba/chicago-bulls.png',
        'Miami Heat': '/images/clubs/nba/miami-heat.png',
        'Brooklyn Nets': '/images/clubs/nba/brooklyn-nets.png',
        'New York Knicks': '/images/clubs/nba/new-york-knicks.png',
        'Philadelphia 76ers': '/images/clubs/nba/philadelphia-76ers.png',
        'Milwaukee Bucks': '/images/clubs/nba/milwaukee-bucks.png',
        'Toronto Raptors': '/images/clubs/nba/toronto-raptors.png',
        'Los Angeles Clippers': '/images/clubs/nba/los-angeles-clippers.png',
        'Denver Nuggets': '/images/clubs/nba/denver-nuggets.png',
        'Phoenix Suns': '/images/clubs/nba/phoenix-suns.png',
        'Sacramento Kings': '/images/clubs/nba/sacramento-kings.png',
        'Dallas Mavericks': '/images/clubs/nba/dallas-mavericks.png',
        'Houston Rockets': '/images/clubs/nba/houston-rockets.png',
        'Memphis Grizzlies': '/images/clubs/nba/memphis-grizzlies.png',
        'New Orleans Pelicans': '/images/clubs/nba/new-orleans-pelicans.png',
        'San Antonio Spurs': '/images/clubs/nba/san-antonio-spurs.png',
        'Utah Jazz': '/images/clubs/nba/utah-jazz.png',
        'Oklahoma City Thunder': '/images/clubs/nba/oklahoma-city-thunder.png',
        'Portland Trail Blazers': '/images/clubs/nba/portland-trail-blazers.png',
        'Minnesota Timberwolves': '/images/clubs/nba/minnesota-timberwolves.png',
        'Indiana Pacers': '/images/clubs/nba/indiana-pacers.png',
        'Detroit Pistons': '/images/clubs/nba/detroit-pistons.png',
        'Cleveland Cavaliers': '/images/clubs/nba/cleveland-cavaliers.png',
        'Atlanta Hawks': '/images/clubs/nba/atlanta-hawks.png',
        'Charlotte Hornets': '/images/clubs/nba/charlotte-hornets.png',
        'Orlando Magic': '/images/clubs/nba/orlando-magic.png',
        'Washington Wizards': '/images/clubs/nba/washington-wizards.png'
      }
    };

    return teamMappings[sport]?.[teamName] || this.getDefaultTeamLogo(teamName);
  }

  /**
   * Generate default team logo based on team initials
   */
  static getDefaultTeamLogo(teamName) {
    // For now, return a default logo - in production this could generate initials-based logos
    return '/images/clubs/default-team.png';
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
   * Format game time for display
   */
  static formatGameTime(commenceTime) {
    const gameTime = new Date(commenceTime);
    const now = new Date();
    const diffMs = gameTime - now;
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));

    if (diffHours < 0) {
      return 'Live';
    } else if (diffHours < 24) {
      return `Today, ${gameTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffHours < 48) {
      return `Tomorrow, ${gameTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else {
      return gameTime.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      });
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
