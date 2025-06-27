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
   * Get team logo based on team name and sport
   */
  static getTeamLogo(teamName, sport) {
    const logoMappings = {
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
        'Manchester United': '/images/icon/man-utd.png',
        'Liverpool': '/images/icon/liverpool.png',
        'Chelsea': '/images/icon/chelsea.png',
        'Manchester City': '/images/icon/manchester-city.png',
        'Arsenal': '/images/clubs/arsenal.png',
        'Tottenham Hotspur': '/images/clubs/tottenham.png',
        'Newcastle United': '/images/clubs/newcastle.png',
        'Brighton': '/images/clubs/brighton.png',
        'Aston Villa': '/images/clubs/aston-villa.png',
        'West Ham United': '/images/clubs/west-ham.png',
        'Crystal Palace': '/images/clubs/crystal-palace.png',
        'Fulham': '/images/clubs/fulham.png',
        'Wolverhampton Wanderers': '/images/icon/wolverhampton.png',
        'Everton': '/images/clubs/everton.png',
        'Brentford': '/images/clubs/brentford.png',
        'Nottingham Forest': '/images/clubs/nottingham-forest.png',
        'Luton Town': '/images/clubs/luton-town.png',
        'Burnley': '/images/clubs/burnley.png',
        'Sheffield United': '/images/clubs/sheffield-united.png',
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
        'Toronto Raptors': '/images/clubs/toronto-raptors.png'
      },
      hockey: {
        'Boston Bruins': '/images/clubs/boston-bruins.png',
        'Toronto Maple Leafs': '/images/clubs/toronto-maple-leafs.png',
        'Montreal Canadiens': '/images/clubs/montreal-canadiens.png',
        'New York Rangers': '/images/clubs/new-york-rangers.png',
        'Pittsburgh Penguins': '/images/clubs/pittsburgh-penguins.png',
        'Chicago Blackhawks': '/images/clubs/chicago-blackhawks.png',
        'Detroit Red Wings': '/images/clubs/detroit-red-wings.png',
        'Philadelphia Flyers': '/images/clubs/philadelphia-flyers.png'
      }
    };

    return logoMappings[sport]?.[teamName] || this.getDefaultTeamLogo(teamName);
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
   */
  static transformMarkets(bookmakers) {
    if (!bookmakers || bookmakers.length === 0) return {};

    const markets = {};
    
    for (const bookmaker of bookmakers) {
      for (const market of bookmaker.markets || []) {
        if (!markets[market.key]) {
          markets[market.key] = {
            outcomes: {},
            bookmakers: []
          };
        }

        // Store outcomes
        for (const outcome of market.outcomes || []) {
          if (!markets[market.key].outcomes[outcome.name]) {
            markets[market.key].outcomes[outcome.name] = [];
          }
          markets[market.key].outcomes[outcome.name].push({
            bookmaker: bookmaker.key,
            bookmaker_title: bookmaker.title,
            price: outcome.price,
            last_update: bookmaker.last_update
          });
        }

        markets[market.key].bookmakers.push(bookmaker.key);
      }
    }

    return markets;
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
