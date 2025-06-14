import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDownIcon, ChevronRightIcon, FireIcon, ClockIcon, SearchIcon } from './icons/IconLibrary';
import apiClient from '../utils/axios';
import { API_ENDPOINTS } from '../config/api';
import { useBetSlip } from '../contexts/BetSlipContext';
import './SportsHierarchy.css';

interface SportCategory {
  id: string;
  name: string;
  icon: string;
  leagues: SportLeague[];
  isExpanded: boolean;
  isLive: boolean;
  liveCount: number;
}

interface SportLeague {
  id: string;
  name: string;
  key: string;
  isPopular: boolean;
  isLive: boolean;
  liveEvents: number;
  upcomingEvents: number;
  description: string;
}

interface OddsEvent {
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
  timing: {
    date: string;
    time: string;
    hoursFromNow: number;
    isLive: boolean;
    isUpcoming: boolean;
  };
  featured: boolean;
  markets_count: number;
  live_score?: {
    home: number;
    away: number;
    period: string;
    time_remaining?: string;
  };
  odds_changes?: {
    home: number;
    away: number;
    draw?: number;
  };
  popularity_score?: number;
  confidence_level?: number;
}

interface Bookmaker {
  key: string;
  title: string;
  markets: Market[];
  last_update?: string;
}

interface Market {
  key: string;
  outcomes: Outcome[];
  last_update?: string;
}

interface Outcome {
  name: string;
  price: number;
  point?: number;
  is_winner?: boolean;
  odds_movement?: 'up' | 'down' | 'stable';
}

const SportsHierarchyEnhanced: React.FC = () => {
  const [categories, setCategories] = useState<SportCategory[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [hoveredCategory, setHoveredCategory] = useState<string>('');
  const [events, setEvents] = useState<OddsEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming'>('all');
  const [selectedMarket, setSelectedMarket] = useState<string>('h2h');
  
  const { addToBetSlip } = useBetSlip();

  // Initialize sports hierarchy with bigdog247.com structure
  const initializeSportsHierarchy = useMemo(() => {
    return [
      {
        id: 'football',
        name: 'FOOTBALL',
        icon: '🏈',
        isExpanded: true,
        isLive: true,
        liveCount: 12,
        leagues: [
          {
            id: 'nfl',
            name: 'NFL',
            key: 'americanfootball_nfl',
            isPopular: true,
            isLive: true,
            liveEvents: 8,
            upcomingEvents: 15,
            description: 'National Football League - America\'s favorite sport!'
          },
          {
            id: 'college-football',
            name: 'College Football (CFB)',
            key: 'americanfootball_ncaaf',
            isPopular: true,
            isLive: true,
            liveEvents: 4,
            upcomingEvents: 25,
            description: 'NCAA College Football - Saturday tradition!'
          },
          {
            id: 'ufl',
            name: 'UFL/AFL',
            key: 'americanfootball_ufl',
            isPopular: false,
            isLive: false,
            liveEvents: 0,
            upcomingEvents: 8,
            description: 'United Football League & Arena Football'
          },
          {
            id: 'international-football',
            name: 'International Football',
            key: 'americanfootball_international',
            isPopular: false,
            isLive: false,
            liveEvents: 0,
            upcomingEvents: 5,
            description: 'International American Football leagues'
          }
        ]
      },
      {
        id: 'soccer',
        name: 'SOCCER',
        icon: '⚽',
        isExpanded: false,
        isLive: true,
        liveCount: 18,
        leagues: [
          {
            id: 'premier-league',
            name: 'Premier League',
            key: 'soccer_epl',
            isPopular: true,
            isLive: true,
            liveEvents: 6,
            upcomingEvents: 12,
            description: 'English Premier League - The world\'s most popular league!'
          },
          {
            id: 'la-liga',
            name: 'La Liga',
            key: 'soccer_la_liga',
            isPopular: true,
            isLive: true,
            liveEvents: 4,
            upcomingEvents: 10,
            description: 'Spanish La Liga - Technical excellence!'
          },
          {
            id: 'serie-a',
            name: 'Serie A',
            key: 'soccer_serie_a',
            isPopular: true,
            isLive: true,
            liveEvents: 3,
            upcomingEvents: 8,
            description: 'Italian Serie A - Tactical brilliance!'
          },
          {
            id: 'bundesliga',
            name: 'Bundesliga',
            key: 'soccer_bundesliga',
            isPopular: true,
            isLive: true,
            liveEvents: 3,
            upcomingEvents: 9,
            description: 'German Bundesliga - High-scoring action!'
          },
          {
            id: 'mls',
            name: 'MLS',
            key: 'soccer_mls',
            isPopular: true,
            isLive: true,
            liveEvents: 2,
            upcomingEvents: 6,
            description: 'Major League Soccer - American soccer!'
          },
          {
            id: 'champions-league',
            name: 'Champions League',
            key: 'soccer_uefa_champs_league',
            isPopular: true,
            isLive: false,
            liveEvents: 0,
            upcomingEvents: 4,
            description: 'UEFA Champions League - European elite!'
          },
          {
            id: 'other-soccer',
            name: 'Other Soccer Leagues',
            key: 'soccer_other',
            isPopular: false,
            isLive: true,
            liveEvents: 0,
            upcomingEvents: 15,
            description: 'Other international soccer competitions'
          }
        ]
      },
      {
        id: 'basketball',
        name: 'BASKETBALL',
        icon: '🏀',
        isExpanded: false,
        isLive: true,
        liveCount: 8,
        leagues: [
          {
            id: 'nba',
            name: 'NBA',
            key: 'basketball_nba',
            isPopular: true,
            isLive: true,
            liveEvents: 5,
            upcomingEvents: 12,
            description: 'National Basketball Association - High-flying action!'
          },
          {
            id: 'ncaa-basketball',
            name: 'NCAA Basketball',
            key: 'basketball_ncaab',
            isPopular: true,
            isLive: true,
            liveEvents: 3,
            upcomingEvents: 20,
            description: 'NCAA College Basketball - March Madness!'
          },
          {
            id: 'wnba',
            name: 'WNBA',
            key: 'basketball_wnba',
            isPopular: false,
            isLive: false,
            liveEvents: 0,
            upcomingEvents: 8,
            description: 'Women\'s National Basketball Association'
          },
          {
            id: 'european-basketball',
            name: 'European Basketball',
            key: 'basketball_european',
            isPopular: false,
            isLive: false,
            liveEvents: 0,
            upcomingEvents: 6,
            description: 'European basketball leagues and competitions'
          },
          {
            id: 'other-basketball',
            name: 'Other Basketball',
            key: 'basketball_other',
            isPopular: false,
            isLive: false,
            liveEvents: 0,
            upcomingEvents: 4,
            description: 'Other basketball leagues and tournaments'
          }
        ]
      },
      {
        id: 'baseball',
        name: 'BASEBALL',
        icon: '⚾',
        isExpanded: false,
        isLive: false,
        liveCount: 0,
        leagues: [
          {
            id: 'mlb',
            name: 'MLB',
            key: 'baseball_mlb',
            isPopular: true,
            isLive: false,
            liveEvents: 0,
            upcomingEvents: 15,
            description: 'Major League Baseball - America\'s pastime!'
          },
          {
            id: 'ncaa-baseball',
            name: 'NCAA Baseball',
            key: 'baseball_ncaa',
            isPopular: false,
            isLive: false,
            liveEvents: 0,
            upcomingEvents: 12,
            description: 'NCAA College Baseball - Spring tradition!'
          },
          {
            id: 'minor-league',
            name: 'Minor League Baseball',
            key: 'baseball_minor_league',
            isPopular: false,
            isLive: false,
            liveEvents: 0,
            upcomingEvents: 8,
            description: 'Minor League Baseball - Future stars!'
          },
          {
            id: 'international-baseball',
            name: 'International Baseball',
            key: 'baseball_international',
            isPopular: false,
            isLive: false,
            liveEvents: 0,
            upcomingEvents: 6,
            description: 'International baseball leagues and tournaments'
          }
        ]
      },
      {
        id: 'combat-sports',
        name: 'COMBAT SPORTS',
        icon: '🥊',
        isExpanded: false,
        isLive: true,
        liveCount: 3,
        leagues: [
          {
            id: 'ufc-mma',
            name: 'UFC/MMA',
            key: 'mma_ufc',
            isPopular: true,
            isLive: true,
            liveEvents: 2,
            upcomingEvents: 5,
            description: 'Ultimate Fighting Championship & Mixed Martial Arts'
          },
          {
            id: 'boxing',
            name: 'Boxing',
            key: 'boxing',
            isPopular: true,
            isLive: true,
            liveEvents: 1,
            upcomingEvents: 4,
            description: 'Professional Boxing - The sweet science!'
          },
          {
            id: 'other-combat',
            name: 'Other Combat Sports',
            key: 'combat_other',
            isPopular: false,
            isLive: false,
            liveEvents: 0,
            upcomingEvents: 3,
            description: 'Other combat sports and martial arts'
          }
        ]
      },
      {
        id: 'other-sports',
        name: 'OTHER SPORTS',
        icon: '🏆',
        isExpanded: false,
        isLive: true,
        liveCount: 7,
        leagues: [
          {
            id: 'hockey',
            name: 'Hockey (NHL, NCAA)',
            key: 'icehockey_nhl',
            isPopular: true,
            isLive: true,
            liveEvents: 3,
            upcomingEvents: 10,
            description: 'National Hockey League & NCAA Hockey'
          },
          {
            id: 'tennis',
            name: 'Tennis (ATP, WTA)',
            key: 'tennis_atp',
            isPopular: true,
            isLive: true,
            liveEvents: 2,
            upcomingEvents: 8,
            description: 'ATP & WTA Tennis - Grand Slam action!'
          },
          {
            id: 'golf',
            name: 'Golf (PGA, Major Championships)',
            key: 'golf_pga',
            isPopular: true,
            isLive: false,
            liveEvents: 0,
            upcomingEvents: 6,
            description: 'PGA Tour & Major Golf Championships'
          },
          {
            id: 'auto-racing',
            name: 'Auto Racing (NASCAR, F1)',
            key: 'racing_nascar',
            isPopular: true,
            isLive: true,
            liveEvents: 1,
            upcomingEvents: 4,
            description: 'NASCAR & Formula 1 Racing'
          },
          {
            id: 'niche-sports',
            name: 'Niche Sports',
            key: 'sports_niche',
            isPopular: false,
            isLive: true,
            liveEvents: 1,
            upcomingEvents: 5,
            description: 'Other sports and niche competitions'
          }
        ]
      }
    ];
  }, []);

  useEffect(() => {
    setCategories(initializeSportsHierarchy);
  }, [initializeSportsHierarchy]);

  const fetchEvents = useCallback(async (sportKey: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await apiClient.get(
        API_ENDPOINTS.SPORT_ODDS(sportKey) + `?limit=50&markets=${selectedMarket}`
      );
      
      if (response.data.success) {
        const eventsData = response.data.data || [];
        setEvents(eventsData);
      } else {
        setError(response.data.error || 'Failed to load events');
        setEvents([]);
      }
    } catch (error: any) {
      console.error('Error fetching events:', error);
      setError(error.message || 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMarket]);

  const toggleCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, isExpanded: !cat.isExpanded }
        : cat
    ));
  }, []);

  const handleLeagueSelect = useCallback((leagueKey: string) => {
    setSelectedLeague(leagueKey);
    fetchEvents(leagueKey);
  }, [fetchEvents]);

  const handleCategoryHover = useCallback((categoryId: string, isHovering: boolean) => {
    setHoveredCategory(isHovering ? categoryId : '');
  }, []);

  const handleOddsClick = useCallback((event: OddsEvent, outcome: Outcome, marketType: string = 'h2h') => {
    addToBetSlip({
      eventId: event.id,
      sport: event.sport_key,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      selectedTeam: outcome.name,
      odds: outcome.price,
      marketType: marketType,
      bookmaker: event.bookmakers[0]?.title || 'Unknown',
      commenceTime: event.commence_time
    });
  }, [addToBetSlip]);

  const filteredEvents = useMemo(() => {
    let filtered = events;
    
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.away_team.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filter === 'live') {
      filtered = filtered.filter(event => event.timing?.isLive);
    } else if (filter === 'upcoming') {
      filtered = filtered.filter(event => event.timing?.isUpcoming);
    }
    
    return filtered;
  }, [events, searchTerm, filter]);

  const getEventStatus = useCallback((event: OddsEvent) => {
    if (event.timing?.isLive) {
      return { status: 'live', text: 'LIVE', color: '#ef4444', icon: <FireIcon size="sm" /> };
    } else if (event.timing?.hoursFromNow <= 1) {
      return { status: 'soon', text: 'SOON', color: '#f59e0b', icon: <ClockIcon size="sm" /> };
    } else {
      return { status: 'scheduled', text: event.timing?.time || 'TBD', color: '#6b7280', icon: <ClockIcon size="sm" /> };
    }
  }, []);

  const formatOdds = useCallback((price: number): string => {
    if (price > 0) {
      return `+${price}`;
    }
    return price.toString();
  }, []);

  return (
    <div className="sports-hierarchy-container">
      <div className="sports-hierarchy-sidebar">
        <div className="sidebar-header">
          <h2>Sports</h2>
          <div className="live-indicator">
            <FireIcon size="sm" />
            <span>Live</span>
          </div>
        </div>
        
        <div className="categories-list">
          {categories.map((category) => (
            <div 
              key={category.id}
              className={`category-item ${category.isExpanded ? 'expanded' : ''} ${hoveredCategory === category.id ? 'hovered' : ''}`}
              onMouseEnter={() => handleCategoryHover(category.id, true)}
              onMouseLeave={() => handleCategoryHover(category.id, false)}
            >
              <div 
                className="category-header"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="category-icon">
                  <span className="sport-icon">{category.icon}</span>
                  {category.isLive && (
                    <div className="live-dot"></div>
                  )}
                </div>
                <div className="category-info">
                  <h3>{category.name}</h3>
                  {category.isLive && (
                    <div className="live-count">
                      <FireIcon size="xs" />
                      <span>{category.liveCount} live</span>
                    </div>
                  )}
                </div>
                <div className="expand-icon">
                  {category.isExpanded ? <ChevronDownIcon size="sm" /> : <ChevronRightIcon size="sm" />}
                </div>
              </div>
              
              {category.isExpanded && (
                <div className="leagues-list">
                  {category.leagues.map((league) => (
                    <div 
                      key={league.id}
                      className={`league-item ${league.isPopular ? 'popular' : ''} ${selectedLeague === league.key ? 'selected' : ''}`}
                      onClick={() => handleLeagueSelect(league.key)}
                    >
                      <div className="league-info">
                        <h4>{league.name}</h4>
                        <p>{league.description}</p>
                      </div>
                      <div className="league-stats">
                        {league.isLive && (
                          <div className="live-events">
                            <FireIcon size="xs" />
                            <span>{league.liveEvents}</span>
                          </div>
                        )}
                        {league.upcomingEvents > 0 && (
                          <div className="upcoming-events">
                            <ClockIcon size="xs" />
                            <span>{league.upcomingEvents}</span>
                          </div>
                        )}
                        {league.isPopular && (
                          <div className="popular-badge">🔥</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="sports-hierarchy-content">
        <div className="content-header">
          <h1>Sports Betting</h1>
          <p>Select a league from the sidebar to view events and place bets</p>
        </div>
        
        {selectedLeague ? (
          <div className="selected-league-content">
            <div className="league-header">
              <h2>Events for {categories.flatMap(cat => cat.leagues).find(league => league.key === selectedLeague)?.name}</h2>
              
              <div className="controls-section">
                <div className="filter-controls">
                  <div className="filter-buttons">
                    <button
                      className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                      onClick={() => setFilter('all')}
                    >
                      All Events ({events.length})
                    </button>
                    <button
                      className={`filter-btn ${filter === 'live' ? 'active' : ''}`}
                      onClick={() => setFilter('live')}
                    >
                      <FireIcon size="sm" /> Live ({events.filter(e => e.timing?.isLive).length})
                    </button>
                    <button
                      className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                      onClick={() => setFilter('upcoming')}
                    >
                      <ClockIcon size="sm" /> Upcoming ({events.filter(e => e.timing?.isUpcoming).length})
                    </button>
                  </div>
                </div>

                <div className="search-sort-controls">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search teams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    <SearchIcon size="sm" className="search-icon" />
                  </div>

                  <div className="market-selector">
                    <select
                      value={selectedMarket}
                      onChange={(e) => setSelectedMarket(e.target.value)}
                      className="market-select"
                    >
                      <option value="h2h">Head to Head</option>
                      <option value="spreads">Spreads</option>
                      <option value="totals">Totals</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="loading-events">
                <div className="loading-spinner"></div>
                <p>Loading events...</p>
              </div>
            ) : error ? (
              <div className="error-banner">
                <span>⚠ {error}</span>
                <button onClick={() => fetchEvents(selectedLeague)} className="retry-button">
                  Retry
                </button>
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="events-grid">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="event-header">
                      <div className="event-teams">
                        <div className="team">
                          <span className="team-name">{event.home_team}</span>
                          {event.live_score && (
                            <span className="team-score">{event.live_score.home}</span>
                          )}
                        </div>
                        <div className="vs-separator">vs</div>
                        <div className="team">
                          <span className="team-name">{event.away_team}</span>
                          {event.live_score && (
                            <span className="team-score">{event.live_score.away}</span>
                          )}
                        </div>
                      </div>
                      <div className="event-meta">
                        <div className={`status-badge ${getEventStatus(event).status}`}>
                          {getEventStatus(event).icon}
                          <span>{getEventStatus(event).text}</span>
                        </div>
                        <div className="event-time">{event.timing?.time}</div>
                      </div>
                    </div>

                    <div className="odds-section">
                      {event.bookmakers[0]?.markets[0]?.outcomes.map((outcome, index) => (
                        <button
                          key={index}
                          className="odds-button"
                          onClick={() => handleOddsClick(event, outcome, event.bookmakers[0]?.markets[0]?.key)}
                        >
                          <div className="odds-content">
                            <div className="outcome-name">{outcome.name}</div>
                            <div className="odds-value">{formatOdds(outcome.price)}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-events">
                <p>No events found matching your criteria</p>
                <button onClick={() => setFilter('all')} className="reset-filters-btn">
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="welcome-content">
            <div className="welcome-card">
              <h2>Welcome to WINZO Sports</h2>
              <p>Choose a sport category from the sidebar to start betting on your favorite leagues and teams.</p>
              <div className="featured-stats">
                <div className="stat-item">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Leagues</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">1000+</span>
                  <span className="stat-label">Events</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">24/7</span>
                  <span className="stat-label">Live Betting</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SportsHierarchyEnhanced; 