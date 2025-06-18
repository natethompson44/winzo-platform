import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDownIcon, ChevronRightIcon, ClockIcon } from './icons/IconLibrary';
import './SportsHierarchy.css';

interface SportCategory {
  id: string;
  name: string;
  icon: string;
  leagues: SportLeague[];
  isExpanded: boolean;
  isLive: boolean;
  liveCount: number;
  priority: 'high' | 'medium' | 'low';
  description: string;
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
  priority: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

const SportsHierarchy: React.FC = () => {
  const [categories, setCategories] = useState<SportCategory[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [hoveredCategory, setHoveredCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'live' | 'popular'>('all');

  // ENHANCED SPORTS HIERARCHY WITH BETTER ORGANIZATION
  const initializeSportsHierarchy = useMemo(() => {
    return [
      {
        id: 'football',
        name: 'FOOTBALL',
        icon: '🏈',
        isExpanded: true,
        isLive: true,
        liveCount: 12,
        priority: 'high' as const,
        description: 'America\'s favorite sport with NFL, College Football, and more',
        leagues: [
          {
            id: 'nfl',
            name: 'NFL',
            key: 'americanfootball_nfl',
            isPopular: true,
            isLive: true,
            liveEvents: 8,
            upcomingEvents: 15,
            priority: 'high' as const,
            lastUpdated: new Date().toISOString(),
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
            priority: 'high' as const,
            lastUpdated: new Date().toISOString(),
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
            priority: 'medium' as const,
            lastUpdated: new Date().toISOString(),
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
            priority: 'low' as const,
            lastUpdated: new Date().toISOString(),
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
        priority: 'high' as const,
        description: 'The world\'s most popular sport with global leagues',
        leagues: [
          {
            id: 'premier-league',
            name: 'Premier League',
            key: 'soccer_epl',
            isPopular: true,
            isLive: true,
            liveEvents: 6,
            upcomingEvents: 12,
            priority: 'high' as const,
            lastUpdated: new Date().toISOString(),
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
            priority: 'high' as const,
            lastUpdated: new Date().toISOString(),
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
            priority: 'high' as const,
            lastUpdated: new Date().toISOString(),
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
            priority: 'high' as const,
            lastUpdated: new Date().toISOString(),
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
            priority: 'medium' as const,
            lastUpdated: new Date().toISOString(),
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
            priority: 'high' as const,
            lastUpdated: new Date().toISOString(),
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
            priority: 'low' as const,
            lastUpdated: new Date().toISOString(),
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
        priority: 'high' as const,
        description: 'High-flying action with NBA and College Basketball',
        leagues: [
          {
            id: 'nba',
            name: 'NBA',
            key: 'basketball_nba',
            isPopular: true,
            isLive: true,
            liveEvents: 5,
            upcomingEvents: 12,
            priority: 'high' as const,
            lastUpdated: new Date().toISOString(),
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
            priority: 'high' as const,
            lastUpdated: new Date().toISOString(),
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
            priority: 'medium' as const,
            lastUpdated: new Date().toISOString(),
            description: 'Women\'s National Basketball Association'
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

  // ENHANCED CATEGORY TOGGLE WITH SMOOTH ANIMATION
  const toggleCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.map(category => 
      category.id === categoryId 
        ? { ...category, isExpanded: !category.isExpanded }
        : category
    ));
  }, []);

  // ENHANCED LEAGUE SELECTION WITH BETTER FEEDBACK
  const selectLeague = useCallback((leagueId: string) => {
    setSelectedLeague(leagueId);
    // Add smooth transition effect
    const leagueElement = document.querySelector(`[data-league-id="${leagueId}"]`);
    if (leagueElement) {
      leagueElement.classList.add('selected');
      setTimeout(() => {
        leagueElement.classList.remove('selected');
      }, 300);
    }
  }, []);

  // ENHANCED SEARCH FUNCTIONALITY
  const filteredCategories = useMemo(() => {
    if (!searchTerm && filterType === 'all') return categories;
    
    return categories.map(category => ({
      ...category,
      leagues: category.leagues.filter(league => {
        const matchesSearch = !searchTerm || 
          league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          league.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filterType === 'all' ||
          (filterType === 'live' && league.isLive) ||
          (filterType === 'popular' && league.isPopular);
        
        return matchesSearch && matchesFilter;
      })
    })).filter(category => category.leagues.length > 0);
  }, [categories, searchTerm, filterType]);

  // ENHANCED INITIALIZATION
  useEffect(() => {
    setCategories(initializeSportsHierarchy as SportCategory[]);
  }, [initializeSportsHierarchy]);

  // ENHANCED HOVER EFFECTS
  const handleCategoryHover = useCallback((categoryId: string) => {
    setHoveredCategory(categoryId);
  }, []);

  const handleCategoryLeave = useCallback(() => {
    setHoveredCategory('');
  }, []);

  // ENHANCED RENDERING WITH BETTER ORGANIZATION
  return (
    <div className="sports-hierarchy-container">
      {/* ENHANCED HEADER */}
      <header className="sports-header">
        <div className="header-left">
          <div className="logo">WINZO SPORTS</div>
          <nav className="header-nav">
            <button className="nav-item active">Sports</button>
            <button className="nav-item">Live</button>
            <button className="nav-item">Favorites</button>
            <button className="nav-item">History</button>
          </nav>
        </div>
        <div className="header-right">
          <div className="user-balance">
            <span>Balance:</span>
            <span className="balance-amount">$1,250.00</span>
          </div>
          <div className="user-account">
            <span>John D.</span>
          </div>
        </div>
      </header>

      {/* ENHANCED SIDEBAR */}
      <aside className="sports-hierarchy-sidebar">
        <div className="sidebar-header">
          <h2>Sports Categories</h2>
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span>Live Events</span>
          </div>
        </div>

        {/* ENHANCED SEARCH AND FILTERS */}
        <div className="search-filters">
          <input
            type="text"
            placeholder="Search leagues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filterType === 'live' ? 'active' : ''}`}
              onClick={() => setFilterType('live')}
            >
              Live
            </button>
            <button
              className={`filter-btn ${filterType === 'popular' ? 'active' : ''}`}
              onClick={() => setFilterType('popular')}
            >
              Popular
            </button>
          </div>
        </div>

        {/* ENHANCED CATEGORIES LIST */}
        <div className="categories-list">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className={`category-item ${category.isExpanded ? 'expanded' : ''} ${hoveredCategory === category.id ? 'hovered' : ''}`}
              onMouseEnter={() => handleCategoryHover(category.id)}
              onMouseLeave={handleCategoryLeave}
            >
              <div
                className="category-header"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="category-info">
                  <span className="sport-icon">{category.icon}</span>
                  <h3>{category.name}</h3>
                  {category.isLive && (
                    <span className="live-count">
                      {category.liveCount} live
                    </span>
                  )}
                </div>
                <div className="expand-icon">
                  {category.isExpanded ? <ChevronDownIcon size="sm" /> : <ChevronRightIcon size="sm" />}
                </div>
              </div>

              {/* ENHANCED LEAGUES LIST */}
              {category.isExpanded && (
                <div className="leagues-list">
                  {category.leagues.map((league) => (
                    <div
                      key={league.id}
                      className={`league-item ${league.isPopular ? 'popular' : ''} ${selectedLeague === league.id ? 'selected' : ''}`}
                      onClick={() => selectLeague(league.id)}
                      data-league-id={league.id}
                    >
                      <div className="league-info">
                        <h4>{league.name}</h4>
                        <p>{league.description}</p>
                        <div className="league-stats">
                          {league.isLive && (
                            <span className="live-events">
                              <span className="live-dot"></span>
                              {league.liveEvents} live
                            </span>
                          )}
                          <span className="upcoming-events">
                            <ClockIcon size="sm" />
                            {league.upcomingEvents} upcoming
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* ENHANCED MAIN CONTENT */}
      <main className="sports-hierarchy-content">
        <div className="content-header">
          <h1>Welcome to WINZO Sports</h1>
          <p>Select a league from the sidebar to view available events and place your bets</p>
        </div>

        {selectedLeague ? (
          <div className="selected-league-content">
            <h2>Selected League: {selectedLeague}</h2>
            <p>Events and betting options will appear here</p>
          </div>
        ) : (
          <div className="welcome-content">
            <div className="welcome-card">
              <h2>🎯 Ready to Bet?</h2>
              <p>Choose your favorite sport and league to get started with live betting action!</p>
              <div className="featured-stats">
                <div className="stat-item">
                  <div className="stat-number">24</div>
                  <div className="stat-label">Live Events</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">156</div>
                  <div className="stat-label">Upcoming Events</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">12</div>
                  <div className="stat-label">Sports</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SportsHierarchy; 