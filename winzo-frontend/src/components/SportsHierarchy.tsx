import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronDownIcon, ChevronRightIcon, FireIcon, ClockIcon } from './icons/IconLibrary';
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

const SportsHierarchy: React.FC = () => {
  const [categories, setCategories] = useState<SportCategory[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>('');
  const [hoveredCategory, setHoveredCategory] = useState<string>('');

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

  const toggleCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, isExpanded: !cat.isExpanded }
        : cat
    ));
  }, []);

  const handleLeagueSelect = useCallback((leagueKey: string) => {
    setSelectedLeague(leagueKey);
    // Here you would typically trigger navigation or event loading
    console.log('Selected league:', leagueKey);
  }, []);

  const handleCategoryHover = useCallback((categoryId: string, isHovering: boolean) => {
    setHoveredCategory(isHovering ? categoryId : '');
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
            <h2>Events for {categories.flatMap(cat => cat.leagues).find(league => league.key === selectedLeague)?.name}</h2>
            <p>Loading events...</p>
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

export default SportsHierarchy; 