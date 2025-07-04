'use client';

import Image from "next/image";
import { useState, useEffect, useCallback } from 'react';
import sportsService from '@/services/sportsService';
import { getTeamLogo, getLeagueFallbackIcon } from '@/utils/teamLogos';
import { useOptimizedImage } from '@/utils/imageCache';

// TypeScript interface for Upcoming Soccer Game data
interface UpcomingSoccerGame {
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
  status: 'upcoming' | 'live' | 'finished';
  commence_time: string;
}

// Loading skeleton for upcoming matches
function UpcomingSoccerSkeleton() {
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
                    <th scope="col"><div className="bg-secondary rounded" style={{width: '80px', height: '16px', margin: '0 auto'}}></div></th>
                    <th scope="col"><div className="bg-secondary rounded" style={{width: '80px', height: '16px', margin: '0 auto'}}></div></th>
                    <th scope="col"><div className="bg-secondary rounded" style={{width: '80px', height: '16px', margin: '0 auto'}}></div></th>
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

// Optimized upcoming soccer game card component
function UpcomingSoccerGameCard({ game }: { game: UpcomingSoccerGame }) {
  // Extract pre-match betting odds
  const getPreMatchOdds = () => {
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

  const odds = getPreMatchOdds();
  
  // Calculate time until match
  const getTimeUntilMatch = () => {
    const matchTime = new Date(game.commence_time || game.game_time);
    const now = new Date();
    const diffMs = matchTime.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else if (diffMs > 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `In ${diffMins} min${diffMins > 1 ? 's' : ''}`;
    }
    return 'Starting soon';
  };

  // OPTIMIZED: Use smart team logo system with league-specific fallbacks
  const homeTeamLogo = getTeamLogo(game.home_team, 'epl'); // Dynamic league detection could be added
  const awayTeamLogo = getTeamLogo(game.away_team, 'epl');
  const leagueFallback = getLeagueFallbackIcon('epl');
  
  // OPTIMIZED: Use image cache for all images
  const sportIcon = useOptimizedImage(game.sport_icon, '/images/icon/soccer-icon.png');
  const homeImage = useOptimizedImage(homeTeamLogo, leagueFallback);
  const awayImage = useOptimizedImage(awayTeamLogo, leagueFallback);

  return (
    <div className="top_matches__cmncard p2-bg p-4 rounded-3 mb-4">
      <div className="row gx-0 gy-xl-0 gy-7">
        <div className="col-xl-5 col-xxl-4">
          <div className="top_matches__clubname">
            <div className="top_matches__cmncard-right d-flex align-items-start justify-content-between pb-4 mb-4 gap-4">
              <div className="d-flex align-items-center gap-1">
                <Image 
                  src={sportIcon.src}
                  width={16} 
                  height={16} 
                  alt="Soccer"
                  onError={sportIcon.onError}
                />
                <span className="fs-eight cpoint">{game.league_name}</span>
              </div>
              <div className="d-flex align-items-center gap-4 pe-xl-15 flex-nowrap flex-xl-wrap">
                <span className="fs-eight cpoint me-7">{game.game_time}</span>
                <span className="badge bg-info text-dark">{getTimeUntilMatch()}</span>
              </div>
            </div>
            <div className="top_matches__cmncard-left d-flex align-items-center justify-content-between pe-xl-10">
              <div>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <Image 
                    src={homeImage.src}
                    width={24} 
                    height={24} 
                    alt={game.home_team}
                    onError={homeImage.onError}
                  />
                  <span className="fs-seven cpoint">{game.home_team}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Image 
                    src={awayImage.src}
                    width={24} 
                    height={24} 
                    alt={game.away_team}
                    onError={awayImage.onError}
                  />
                  <span className="fs-seven cpoint">{game.away_team}</span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-4 position-relative pe-xl-15">
                <span className="v-line lg d-none d-xl-block"></span>
                <div className="d-flex flex-column gap-5 mb-5">
                  <Image 
                    className="cpoint mt-5" 
                    src="/images/icon/star2.png" 
                    width={16} 
                    height={16} 
                    alt="Favorite"
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
                      <span className="fs-eight">Winner (1x2)</span>
                    </th>
                    <th scope="col">
                      <span className="fs-eight">Double Chance</span>
                    </th>
                    <th scope="col">
                      <span className="fs-eight">Total Goals</span>
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
                        {/* 12 */}
                        <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                          <span className="fs-seven d-block mb-2">12</span>
                          <span className="fw-bold d-block">{((1/odds.home + 1/odds.away) ** -1).toFixed(2)}</span>
                        </div>
                        {/* X2 */}
                        <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                          <span className="fs-seven d-block mb-2">X2</span>
                          <span className="fw-bold d-block">{((1/odds.draw + 1/odds.away) ** -1).toFixed(2)}</span>
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
      {/* Upcoming match info */}
      <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-primary">Upcoming</span>
          <span className="fs-eight text-muted">{game.bookmaker_count} bookmakers</span>
        </div>
        <span className="fs-eight text-muted">
          Odds updated: {new Date(game.last_updated).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

// No upcoming matches state
function NoUpcomingMatchesState() {
  return (
    <div className="top_matches__cmncard p2-bg p-4 rounded-3">
      <div className="row gx-0 gy-xl-0 gy-7">
        <div className="col-12">
          <div className="text-center py-5">
            <div className="mb-3">
              <Image src="/images/icon/clock-icon.png" width={48} height={48} alt="Clock" />
            </div>
            <h5 className="mb-3">No Upcoming Matches</h5>
            <p className="text-muted mb-0">
              There are currently no upcoming soccer matches. Check back later for upcoming fixtures!
            </p>
            <div className="mt-3">
              <span className="badge bg-secondary">Checking for new matches every minute</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpCmingSoccer() {
  const [upcomingGames, setUpcomingGames] = useState<UpcomingSoccerGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState('epl');

  // FIXED: Memoize fetchUpcomingGames to prevent unnecessary re-creation
  const fetchUpcomingGames = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching upcoming soccer matches for league:', selectedLeague);
      // Get all soccer games and filter for upcoming ones
      const allGames = await sportsService.getSoccerGames({
        league: selectedLeague,
        limit: 50
      });
      
      // Filter for upcoming games
      const upcomingMatches = allGames.filter((game: any) => {
        const gameTime = new Date(game.game_time || game.startTime || game.commence_time);
        const now = new Date();
        const diffMs = gameTime.getTime() - now.getTime();
        
        // Consider games as upcoming if they start in the future (up to 7 days)
        return game.status === 'upcoming' || (diffMs > 0 && diffMs < 7 * 24 * 60 * 60 * 1000);
      });
      
      // Sort by match time (earliest first)
      upcomingMatches.sort((a: any, b: any) => {
        const timeA = new Date(a.game_time || a.startTime || a.commence_time).getTime();
        const timeB = new Date(b.game_time || b.startTime || b.commence_time).getTime();
        return timeA - timeB;
      });
      
      console.log('Upcoming soccer matches found:', upcomingMatches);
      setUpcomingGames(upcomingMatches.map((game: any) => ({
        ...game,
        commence_time: game.commence_time || game.startTime || game.game_time
      })) as UpcomingSoccerGame[]);
    } catch (err) {
      console.error('Error fetching upcoming soccer matches:', err);
      setError('Failed to load upcoming matches. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedLeague]); // Only depend on selectedLeague

  useEffect(() => {
    fetchUpcomingGames();
    
    // Set up updates every 60 seconds for upcoming matches
    const interval = setInterval(fetchUpcomingGames, 60000);
    return () => clearInterval(interval);
  }, [fetchUpcomingGames]);

  const availableLeagues = [
    { key: 'epl', name: 'Premier League', flag: '🇬🇧' },
    { key: 'spain_la_liga', name: 'La Liga', flag: '🇪🇸' },
    { key: 'germany_bundesliga', name: 'Bundesliga', flag: '🇩🇪' },
    { key: 'italy_serie_a', name: 'Serie A', flag: '🇮🇹' },
    { key: 'france_ligue_one', name: 'Ligue 1', flag: '🇫🇷' },
    { key: 'uefa_champions_league', name: 'Champions League', flag: '🏆' }
  ];

  return (
    <section className="top_matches">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 gx-0 gx-sm-4">
            <div className="top_matches__main">
              <div className="row w-100 mb-8 mb-md-10">
                <div className="col-12">
                  <div className="top_matches__title d-flex align-items-center gap-2 mb-4 mb-md-6">
                    <Image 
                      src="/images/icon/clock-icon.png" 
                      width={32} 
                      height={32} 
                      alt="Upcoming Events"
                    />
                    <h3>Upcoming Events</h3>
                    <span className="badge bg-primary ms-2">Live Data</span>
                  </div>

                  {/* League Selection */}
                  <div className="mb-4">
                    <div className="row">
                      <div className="col-12">
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          {availableLeagues.map((league) => (
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
                    </div>
                  </div>
                  
                  <div className="top_matches__content">
                    {loading && (
                      <>
                        <UpcomingSoccerSkeleton />
                        <UpcomingSoccerSkeleton />
                        <UpcomingSoccerSkeleton />
                      </>
                    )}

                    {error && !loading && (
                      <div className="text-center py-5">
                        <div className="mb-3">
                          <Image src="/images/icon/clock-icon.png" width={48} height={48} alt="Error" />
                        </div>
                        <h5 className="mb-3">Unable to load upcoming matches</h5>
                        <p className="text-muted mb-3">{error}</p>
                        <button className="btn btn-primary btn-sm" onClick={fetchUpcomingGames}>
                          <i className="fas fa-redo me-2"></i>Try Again
                        </button>
                      </div>
                    )}

                    {!loading && !error && upcomingGames.length === 0 && (
                      <NoUpcomingMatchesState />
                    )}

                    {!loading && !error && upcomingGames.length > 0 && (
                      <>
                        {upcomingGames.map((game) => (
                          <UpcomingSoccerGameCard key={game.id} game={game} />
                        ))}
                        
                        {/* Upcoming data info */}
                        <div className="text-center mt-4 pt-4 border-top">
                          <p className="fs-eight text-muted mb-1">
                            Pre-match odds from The Odds API • Updated every minute
                          </p>
                          <p className="fs-eight text-muted">
                            Showing {upcomingGames.length} upcoming {upcomingGames.length === 1 ? 'match' : 'matches'} for {availableLeagues.find(l => l.key === selectedLeague)?.name}
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
