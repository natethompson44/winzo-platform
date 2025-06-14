import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDownIcon, ChevronRightIcon, FireIcon, ClockIcon, SearchIcon } from './icons/IconLibrary';
import apiClient from '../utils/axios';
import { API_ENDPOINTS } from '../config/api';
import { useBetSlip } from '../contexts/BetSlipContext';
import BetSlip from './BetSlip';
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

/**
 * Enhanced Sports Hierarchy Component with Mobile Optimization
 * 
 * Professional mobile web interface that maintains website feel:
 * - Responsive odds tables for mobile screens
 * - Touch-optimized interactions
 * - Swipe gestures for odds browsing
 * - Professional confirmation flows
 * - Fast loading optimized for mobile networks
 */
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
  const [userBalance] = useState<number>(1250.75);
  const [isMobileView, setIsMobileView] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<string[]>([]);
  
  const { addToBetSlip } = useBetSlip();

  // Detect mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

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
            description: 'Major League Soccer - American soccer at its finest!'
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
            liveEvents: 4,
            upcomingEvents: 12,
            description: 'National Basketball Association - The best basketball in the world!'
          },
          {
            id: 'college-basketball',
            name: 'College Basketball (NCAAB)',
            key: 'basketball_ncaab',
            isPopular: true,
            isLive: true,
            liveEvents: 4,
            upcomingEvents: 20,
            description: 'NCAA College Basketball - March Madness excitement!'
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

  // Initialize categories
  useEffect(() => {
    setCategories(initializeSportsHierarchy);
  }, [initializeSportsHierarchy]);

  // Toggle category expansion
  const toggleCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, isExpanded: !cat.isExpanded }
        : cat
    ));
  }, []);

  // Toggle event expansion for mobile
  const toggleEventExpansion = useCallback((eventId: string) => {
    setExpandedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  }, []);

  // Handle bet selection with mobile optimization
  const handleBetSelection = useCallback((event: OddsEvent, outcome: Outcome, bookmaker: Bookmaker) => {
    // Provide haptic feedback on mobile
    if (navigator.vibrate && isMobileView) {
      navigator.vibrate(50);
    }

    addToBetSlip({
      eventId: event.id,
      sport: event.sport_key,
      homeTeam: event.home_team,
      awayTeam: event.away_team,
      selectedTeam: outcome.name,
      odds: outcome.price,
      commenceTime: event.commence_time,
      bookmaker: bookmaker.title,
      marketType: bookmaker.markets.find(m => m.outcomes.includes(outcome))?.key || 'unknown'
    });
  }, [addToBetSlip, isMobileView]);

  // Mobile-optimized odds rendering
  const renderMobileOdds = useCallback((event: OddsEvent) => {
    const isExpanded = expandedEvents.includes(event.id);
    
    return (
      <div key={event.id} className="mobile-event-card">
        <div 
          className="mobile-event-header"
          onClick={() => toggleEventExpansion(event.id)}
        >
          <div className="event-info">
            <div className="teams">
              <span className="home-team">{event.home_team}</span>
              <span className="vs">vs</span>
              <span className="away-team">{event.away_team}</span>
            </div>
            <div className="event-meta">
              <span className="time">{event.timing.time}</span>
              {event.timing.isLive && (
                <span className="live-badge">LIVE</span>
              )}
            </div>
          </div>
          <div className="expand-icon">
            {isExpanded ? '▼' : '▶'}
          </div>
        </div>
        
        {isExpanded && (
          <div className="mobile-odds-container">
            {event.bookmakers.slice(0, 2).map(bookmaker => (
              <div key={bookmaker.key} className="mobile-bookmaker">
                <div className="bookmaker-name">{bookmaker.title}</div>
                <div className="mobile-outcomes">
                  {bookmaker.markets[0]?.outcomes.slice(0, 3).map(outcome => (
                    <button
                      key={outcome.name}
                      className="mobile-outcome-btn"
                      onClick={() => handleBetSelection(event, outcome, bookmaker)}
                    >
                      <span className="outcome-name">{outcome.name}</span>
                      <span className="outcome-odds">{outcome.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }, [expandedEvents, toggleEventExpansion, handleBetSelection]);

  // Desktop odds rendering
  const renderDesktopOdds = useCallback((event: OddsEvent) => {
    return (
      <div key={event.id} className="event-card">
        <div className="event-header">
          <div className="event-info">
            <div className="teams">
              <span className="home-team">{event.home_team}</span>
              <span className="vs">vs</span>
              <span className="away-team">{event.away_team}</span>
            </div>
            <div className="event-meta">
              <span className="time">{event.timing.time}</span>
              {event.timing.isLive && (
                <span className="live-badge">LIVE</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="odds-table">
          {event.bookmakers.map(bookmaker => (
            <div key={bookmaker.key} className="bookmaker-row">
              <div className="bookmaker-name">{bookmaker.title}</div>
              <div className="outcomes">
                {bookmaker.markets[0]?.outcomes.map(outcome => (
                  <button
                    key={outcome.name}
                    className="outcome-btn"
                    onClick={() => handleBetSelection(event, outcome, bookmaker)}
                  >
                    <span className="outcome-name">{outcome.name}</span>
                    <span className="outcome-odds">{outcome.price}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }, [handleBetSelection]);

  // Filter events based on search and filter
  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.home_team.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.away_team.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filter === 'live') {
      filtered = filtered.filter(event => event.timing.isLive);
    } else if (filter === 'upcoming') {
      filtered = filtered.filter(event => event.timing.isUpcoming);
    }

    return filtered;
  }, [events, searchTerm, filter]);

  return (
    <div className="sports-hierarchy-enhanced">
      {/* Header */}
      <div className="sports-header">
        <h1 className="sports-title">Sports Betting</h1>
        <div className="sports-controls">
          <div className="search-container">
            <SearchIcon size="sm" color="neutral" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'live' ? 'active' : ''}`}
              onClick={() => setFilter('live')}
            >
              <FireIcon size="sm" color="neutral" />
              Live
            </button>
            <button
              className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
              onClick={() => setFilter('upcoming')}
            >
              <ClockIcon size="sm" color="neutral" />
              Upcoming
            </button>
          </div>
        </div>
      </div>

      {/* Sports Categories */}
      <div className="sports-categories">
        {categories.map((category) => (
          <div key={category.id} className="sport-category">
            <button
              className={`category-header ${category.isExpanded ? 'expanded' : ''}`}
              onClick={() => toggleCategory(category.id)}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory('')}
            >
              <div className="category-info">
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                {category.isLive && (
                  <span className="live-count">{category.liveCount} live</span>
                )}
              </div>
              <ChevronRightIcon 
                size="sm" 
                color="neutral"
                className={`expand-icon ${category.isExpanded ? 'expanded' : ''}`}
              />
            </button>
            
            {category.isExpanded && (
              <div className="leagues-container">
                {category.leagues.map((league) => (
                  <div key={league.id} className="league-item">
                    <div className="league-info">
                      <span className="league-name">{league.name}</span>
                      <div className="league-stats">
                        {league.isLive && (
                          <span className="live-events">{league.liveEvents} live</span>
                        )}
                        <span className="upcoming-events">{league.upcomingEvents} upcoming</span>
                      </div>
                    </div>
                    <p className="league-description">{league.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Events Section */}
      <div className="events-section">
        <h2 className="events-title">Available Events</h2>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading events...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-container">
            <p>No events found. Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="events-grid">
            {filteredEvents.map(event => 
              isMobileView ? renderMobileOdds(event) : renderDesktopOdds(event)
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SportsHierarchyEnhanced; 