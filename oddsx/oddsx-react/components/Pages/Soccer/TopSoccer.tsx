'use client';

import Image from "next/image";
import { useState, useEffect, useCallback } from 'react';
import sportsService from '@/services/sportsService';
import { getTeamLogo, handleImageError } from '@/utils/teamLogos';

// TypeScript interface for Soccer Game data
interface SoccerGame {
  id: string;
  sport_key: string;
  sport_icon: string;
  league_name: string;
  game_time: string;
  home_team: string;
  away_team: string;
  home_team_logo: string;
  away_team_logo: string;
  markets: any;
  best_odds: any;
  bookmaker_count: number;
  last_updated: string;
  featured: boolean;
}

// Loading skeleton component
function SoccerGameSkeleton() {
  return (
    <div className="top_matches__cmncard p2-bg p-4 rounded-3 mb-4">
      <div className="row gx-0 gy-xl-0 gy-7">
        <div className="col-xl-5 col-xxl-4">
          <div className="top_matches__clubname">
            <div className="top_matches__cmncard-right d-flex align-items-start justify-content-between pb-4 mb-4 gap-4">
              <div className="d-flex align-items-center gap-1">
                <div className="bg-secondary rounded" style={{width: '16px', height: '16px'}}></div>
                <div className="bg-secondary rounded" style={{width: '120px', height: '16px'}}></div>
              </div>
              <div className="bg-secondary rounded" style={{width: '80px', height: '16px'}}></div>
            </div>
            <div className="top_matches__cmncard-left d-flex align-items-center justify-content-between pe-xl-10">
              <div>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <div className="bg-secondary rounded" style={{width: '24px', height: '24px'}}></div>
                  <div className="bg-secondary rounded" style={{width: '100px', height: '16px'}}></div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-secondary rounded" style={{width: '24px', height: '24px'}}></div>
                  <div className="bg-secondary rounded" style={{width: '100px', height: '16px'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-7 col-xxl-8">
          <div className="top_matches__clubdata">
            <div className="table-responsive">
              <table className="table mb-0 pb-0">
                <thead>
                  <tr className="text-center">
                    <th scope="col"><div className="bg-secondary rounded" style={{width: '40px', height: '16px', margin: '0 auto'}}></div></th>
                    <th scope="col"><div className="bg-secondary rounded" style={{width: '80px', height: '16px', margin: '0 auto'}}></div></th>
                    <th scope="col"><div className="bg-secondary rounded" style={{width: '40px', height: '16px', margin: '0 auto'}}></div></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="pt-4">
                      <div className="top_matches__innercount d-flex align-items-center gap-2">
                        <div className="bg-secondary rounded-3 py-1 px-8" style={{width: '60px', height: '40px'}}></div>
                        <div className="bg-secondary rounded-3 py-1 px-8" style={{width: '60px', height: '40px'}}></div>
                        <div className="bg-secondary rounded-3 py-1 px-8" style={{width: '60px', height: '40px'}}></div>
                      </div>
                    </td>
                    <td className="pt-4">
                      <div className="top_matches__innercount d-flex align-items-center gap-2">
                        <div className="bg-secondary rounded-3 py-1 px-8" style={{width: '60px', height: '40px'}}></div>
                        <div className="bg-secondary rounded-3 py-1 px-8" style={{width: '60px', height: '40px'}}></div>
                        <div className="bg-secondary rounded-3 py-1 px-8" style={{width: '60px', height: '40px'}}></div>
                      </div>
                    </td>
                    <td className="pt-4">
                      <div className="top_matches__innercount d-flex align-items-center gap-2">
                        <div className="bg-secondary rounded-3 py-1 px-8" style={{width: '60px', height: '40px'}}></div>
                        <div className="bg-secondary rounded-3 py-1 px-8" style={{width: '60px', height: '40px'}}></div>
                        <div className="bg-secondary rounded-3 py-1 px-8" style={{width: '60px', height: '40px'}}></div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Error state component
function SoccerErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="text-center py-5">
      <div className="mb-3">
        <Image src="/images/icon/soccer-icon.png" width={48} height={48} alt="Soccer" />
      </div>
      <h5 className="mb-3">Unable to load soccer matches</h5>
      <p className="text-muted mb-3">{message}</p>
      <button className="btn btn-primary btn-sm" onClick={onRetry}>
        <i className="fas fa-redo me-2"></i>Try Again
      </button>
    </div>
  );
}

// Soccer game card component with 3-way betting
function SoccerGameCard({ game, selectedLeague }: { game: SoccerGame; selectedLeague: string }) {
  // Extract 3-way betting odds
  const get3WayOdds = () => {
    if (game.best_odds?.h2h) {
      const outcomes = Object.keys(game.best_odds.h2h);
      return {
        home: game.best_odds.h2h[outcomes[0]]?.price || 2.50,
        draw: game.best_odds.h2h[outcomes[1]]?.price || 3.20,
        away: game.best_odds.h2h[outcomes[2]]?.price || 2.80
      };
    }
    return { home: 2.50, draw: 3.20, away: 2.80 };
  };

  const odds = get3WayOdds();
  
  // Get smart team logos with fallback
  const homeTeamLogo = getTeamLogo(game.home_team, selectedLeague);
  const awayTeamLogo = getTeamLogo(game.away_team, selectedLeague);

  return (
    <div className="top_matches__cmncard p2-bg p-4 rounded-3 mb-4">
      <div className="row gx-0 gy-xl-0 gy-7">
        <div className="col-xl-5 col-xxl-4">
          <div className="top_matches__clubname">
            <div className="top_matches__cmncard-right d-flex align-items-start justify-content-between pb-4 mb-4 gap-4">
              <div className="d-flex align-items-center gap-1">
                <Image 
                  src={game.sport_icon} 
                  width={16} 
                  height={16} 
                  alt="Soccer"
                />
                <span className="fs-eight cpoint">{game.league_name}</span>
              </div>
              <div className="d-flex align-items-center gap-4 pe-xl-15 flex-nowrap flex-xl-wrap">
                <span className="fs-eight cpoint">{game.game_time}</span>
                <div className="d-flex align-items-center gap-1">
                  <Image 
                    src="/images/icon/updwon.png" 
                    width={16} 
                    height={16} 
                    alt="Icon"
                  />
                  <Image 
                    src="/images/icon/t-shart.png" 
                    width={16} 
                    height={16} 
                    alt="Icon"
                  />
                </div>
                {game.featured && (
                  <span className="badge bg-warning text-dark">Featured</span>
                )}
              </div>
            </div>
            <div className="top_matches__cmncard-left d-flex align-items-center justify-content-between pe-xl-10">
              <div>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <Image 
                    src={homeTeamLogo} 
                    width={24} 
                    height={24} 
                    alt={game.home_team}
                    onError={(e) => handleImageError(e, game.home_team, selectedLeague)}
                  />
                  <span className="fs-seven cpoint">{game.home_team}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Image 
                    src={awayTeamLogo} 
                    width={24} 
                    height={24} 
                    alt={game.away_team}
                    onError={(e) => handleImageError(e, game.away_team, selectedLeague)}
                  />
                  <span className="fs-seven cpoint">{game.away_team}</span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-4 position-relative pe-xl-15">
                <span className="v-line lg d-none d-xl-block"></span>
                <div className="d-flex flex-column gap-5">
                  <Image 
                    className="cpoint" 
                    src="/images/icon/line-chart.png" 
                    width={16} 
                    height={16} 
                    alt="Chart"
                  />
                  <Image 
                    className="cpoint" 
                    src="/images/icon/star2.png" 
                    width={16} 
                    height={16} 
                    alt="Star"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-7 col-xxl-8">
          <div className="top_matches__clubdata">
            <div className="table-responsive">
              <table className="table mb-0 pb-0">
                <thead>
                  <tr className="text-center">
                    <th scope="col">
                      <span className="fs-eight">1x2</span>
                    </th>
                    <th scope="col">
                      <span className="fs-eight">Double chance</span>
                    </th>
                    <th scope="col">
                      <span className="fs-eight">Total</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="pt-4">
                      <div className="top_matches__innercount d-flex align-items-center gap-2">
                        {/* Home Win */}
                        <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                          <span className="fs-seven d-block mb-2">1</span>
                          <span className="fw-bold d-block">{odds.home.toFixed(2)}</span>
                        </div>
                        {/* Draw */}
                        <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                          <span className="fs-seven d-block mb-2">X</span>
                          <span className="fw-bold d-block">{odds.draw.toFixed(2)}</span>
                        </div>
                        {/* Away Win */}
                        <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                          <span className="fs-seven d-block mb-2">2</span>
                          <span className="fw-bold d-block">{odds.away.toFixed(2)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="pt-4">
                      <div className="top_matches__innercount d-flex align-items-center gap-2">
                        {/* 1X */}
                        <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                          <span className="fs-seven d-block mb-2">1X</span>
                          <span className="fw-bold d-block">{((1/odds.home + 1/odds.draw) ** -1).toFixed(2)}</span>
                        </div>
                        {/* X2 */}
                        <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                          <span className="fs-seven d-block mb-2">X2</span>
                          <span className="fw-bold d-block">{((1/odds.draw + 1/odds.away) ** -1).toFixed(2)}</span>
                        </div>
                        {/* 12 */}
                        <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                          <span className="fs-seven d-block mb-2">12</span>
                          <span className="fw-bold d-block">{((1/odds.home + 1/odds.away) ** -1).toFixed(2)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="pt-4">
                      <div className="top_matches__innercount d-flex align-items-center gap-2">
                        {/* Over 2.5 */}
                        <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                          <span className="fs-seven d-block mb-2">O2.5</span>
                          <span className="fw-bold d-block">1.85</span>
                        </div>
                        {/* Under 2.5 */}
                        <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                          <span className="fs-seven d-block mb-2">U2.5</span>
                          <span className="fw-bold d-block">2.05</span>
                        </div>
                        {/* BTTS */}
                        <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                          <span className="fs-seven d-block mb-2">BTTS</span>
                          <span className="fw-bold d-block">1.95</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Live data indicator */}
      <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-success">Live Data</span>
          <span className="fs-eight text-muted">{game.bookmaker_count} bookmakers</span>
        </div>
        <span className="fs-eight text-muted">
          Updated: {new Date(game.last_updated).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

export default function TopSoccer() {
  const [soccerGames, setSoccerGames] = useState<SoccerGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // STRATEGIC CHANGE: Progressive League Rollout
  // Only show leagues we have comprehensive data for
  const availableLeagues = [
    { 
      key: 'epl', 
      name: 'Premier League', 
      flag: '🇬🇧',
      status: 'live', // Live data + comprehensive logos
      dataQuality: 'excellent'
    },
    { 
      key: 'spain_la_liga', 
      name: 'La Liga', 
      flag: '🇪🇸',
      status: 'preview', // Live data but limited logos
      dataQuality: 'partial'
    },
    { 
      key: 'germany_bundesliga', 
      name: 'Bundesliga', 
      flag: '🇩🇪',
      status: 'preview',
      dataQuality: 'partial'
    },
    { 
      key: 'italy_serie_a', 
      name: 'Serie A', 
      flag: '🇮🇹',
      status: 'preview',
      dataQuality: 'partial'
    },
    { 
      key: 'france_ligue_one', 
      name: 'Ligue 1', 
      flag: '🇫🇷',
      status: 'coming_soon', // Coming soon
      dataQuality: 'limited'
    },
    { 
      key: 'uefa_champions_league', 
      name: 'Champions League', 
      flag: '🏆',
      status: 'coming_soon',
      dataQuality: 'limited'
    }
  ];

  // Filter leagues based on data quality for main display
  const primaryLeagues = availableLeagues.filter(league => league.status === 'live');
  const previewLeagues = availableLeagues.filter(league => league.status === 'preview');
  const comingSoonLeagues = availableLeagues.filter(league => league.status === 'coming_soon');

  // Default to EPL (only fully ready league)
  const [selectedLeague, setSelectedLeague] = useState('epl');

  // FIXED: Memoize fetchSoccerGames to prevent unnecessary re-creation
  const fetchSoccerGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching soccer games for league:', selectedLeague);
      const games = await sportsService.getSoccerGames({
        league: selectedLeague,
        limit: 20
      });
      
      console.log('Soccer games received:', games);
      setSoccerGames(games as SoccerGame[]);
    } catch (err) {
      console.error('Error fetching soccer games:', err);
      setError('Failed to load soccer matches. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedLeague]); // Only depend on selectedLeague

  useEffect(() => {
    fetchSoccerGames();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchSoccerGames, 30000);
    return () => clearInterval(interval);
  }, [fetchSoccerGames]); // Remove selectedLeague from here since it's in fetchSoccerGames deps

  const handleRetry = () => {
    fetchSoccerGames();
  };

  return (
    <section className="top_matches">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 gx-0 gx-sm-4">
            <div className="top_matches__main pt-20">
              <div className="row w-100 pt-md-5">
                <div className="col-12">
                  <div className="top_matches__title d-flex align-items-center gap-2 mb-4 mb-md-5">
                    <Image 
                      src="/images/icon/soccer-icon.png" 
                      width={32} 
                      height={32} 
                      alt="Soccer"
                    />
                    <h3>Top Soccer</h3>
                    <span className="badge bg-success ms-2">Live Data</span>
                  </div>

                  {/* League Selection with Status Indicators */}
                  <div className="mb-4">
                    <div className="row">
                      <div className="col-12">
                        
                        {/* Primary Leagues (Full Data) */}
                        <div className="mb-3">
                          <h6 className="mb-2 d-flex align-items-center gap-2">
                            <span className="badge bg-success">Live</span>
                            Premium Leagues
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            {primaryLeagues.map((league) => (
                              <button
                                key={league.key}
                                className={`btn btn-sm ${selectedLeague === league.key ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSelectedLeague(league.key)}
                              >
                                {league.flag} {league.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Preview Leagues (Limited Data) */}
                        <div className="mb-3">
                          <h6 className="mb-2 d-flex align-items-center gap-2">
                            <span className="badge bg-warning">Preview</span>
                            Additional Leagues
                            <small className="text-muted">(Limited team logos)</small>
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            {previewLeagues.map((league) => (
                              <button
                                key={league.key}
                                className={`btn btn-sm ${selectedLeague === league.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                                onClick={() => setSelectedLeague(league.key)}
                              >
                                {league.flag} {league.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Coming Soon Leagues */}
                        <div className="mb-3">
                          <h6 className="mb-2 d-flex align-items-center gap-2">
                            <span className="badge bg-secondary">Coming Soon</span>
                            Future Leagues
                          </h6>
                          <div className="d-flex flex-wrap gap-2">
                            {comingSoonLeagues.map((league) => (
                              <button
                                key={league.key}
                                className="btn btn-sm btn-outline-secondary"
                                disabled
                              >
                                {league.flag} {league.name}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  <div className="top_matches__content">
                    {loading && (
                      <>
                        <SoccerGameSkeleton />
                        <SoccerGameSkeleton />
                        <SoccerGameSkeleton />
                      </>
                    )}

                    {error && !loading && (
                      <SoccerErrorState message={error} onRetry={handleRetry} />
                    )}

                    {!loading && !error && soccerGames.length === 0 && (
                      <div className="text-center py-5">
                        <div className="mb-3">
                          <Image src="/images/icon/soccer-icon.png" width={48} height={48} alt="Soccer" />
                        </div>
                        <h5 className="mb-3">No matches available</h5>
                        <p className="text-muted">No soccer matches are currently available for {availableLeagues.find(l => l.key === selectedLeague)?.name}.</p>
                      </div>
                    )}

                    {!loading && !error && soccerGames.length > 0 && (
                      <>
                        {soccerGames.map((game) => (
                          <SoccerGameCard key={game.id} game={game} selectedLeague={selectedLeague} />
                        ))}
                        
                        {/* Data source info */}
                        <div className="text-center mt-4 pt-4 border-top">
                          <p className="fs-eight text-muted mb-1">
                            Live odds from The Odds API • Updated every 30 seconds
                          </p>
                          <p className="fs-eight text-muted">
                            Showing {soccerGames.length} matches for {availableLeagues.find(l => l.key === selectedLeague)?.name}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
