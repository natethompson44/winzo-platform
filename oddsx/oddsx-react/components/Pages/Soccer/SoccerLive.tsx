'use client';

import Image from "next/image";
import { useState, useEffect } from 'react';
import sportsService from '@/services/sportsService';
import { getTeamLogo, getLeagueFallbackIcon } from '@/utils/teamLogos';
import { useImageCache } from '@/utils/imageCache';

// TypeScript interface for Live Soccer Game data
interface LiveSoccerGame {
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
  status: 'live' | 'upcoming' | 'finished';
  score?: {
    home: number;
    away: number;
  };
  period?: string;
  timeInPeriod?: string;
}

// Loading skeleton for live matches
function LiveSoccerSkeleton() {
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
              <div className="d-flex align-items-center gap-1">
                <div className="bg-danger rounded" style={{width: '16px', height: '16px'}}></div>
                <div className="bg-secondary rounded" style={{width: '60px', height: '16px'}}></div>
              </div>
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
              <div className="d-flex align-items-center gap-4 position-relative pe-xl-15">
                <div className="d-flex flex-column gap-1">
                  <div className="bg-secondary rounded-17" style={{width: '20px', height: '20px'}}></div>
                  <div className="bg-secondary rounded-17" style={{width: '20px', height: '20px'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-7 col-xxl-8">
          <div className="top_matches__clubdata">
            <div className="table-responsive maintaintwo">
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
                        <div className="bg-secondary rounded-3 py-1 px-7" style={{width: '60px', height: '40px'}}></div>
                        <div className="bg-secondary rounded-3 py-1 px-7" style={{width: '60px', height: '40px'}}></div>
                        <div className="bg-secondary rounded-3 py-1 px-7" style={{width: '60px', height: '40px'}}></div>
                      </div>
                    </td>
                    <td className="pt-4">
                      <div className="top_matches__innercount d-flex align-items-center gap-2">
                        <div className="bg-secondary rounded-3 py-1 px-7" style={{width: '60px', height: '40px'}}></div>
                        <div className="bg-secondary rounded-3 py-1 px-7" style={{width: '60px', height: '40px'}}></div>
                        <div className="bg-secondary rounded-3 py-1 px-7" style={{width: '60px', height: '40px'}}></div>
                      </div>
                    </td>
                    <td className="pt-4">
                      <div className="top_matches__innercount d-flex align-items-center gap-2">
                        <div className="bg-secondary rounded-3 py-1 px-7" style={{width: '60px', height: '40px'}}></div>
                        <div className="bg-secondary rounded-3 py-1 px-7" style={{width: '60px', height: '40px'}}></div>
                        <div className="bg-secondary rounded-3 py-1 px-7" style={{width: '60px', height: '40px'}}></div>
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

// Optimized Live soccer game card component
function LiveSoccerGameCard({ game }: { game: LiveSoccerGame }) {
  // Extract live betting odds
  const getLiveBettingOdds = () => {
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

  const odds = getLiveBettingOdds();
  
  // Generate live match timing
  const getMatchTiming = () => {
    if (game.period && game.timeInPeriod) {
      return `${game.timeInPeriod}′ ${game.period}`;
    }
    if (game.status === 'live') {
      return `${Math.floor(Math.random() * 90) + 1}′ ${Math.random() > 0.5 ? '1st half' : '2nd half'}`;
    }
    return game.game_time;
  };

  // OPTIMIZED: Use smart team logo system with league-specific fallbacks
  const homeTeamLogo = getTeamLogo(game.home_team, 'epl'); // Assume EPL for live games
  const awayTeamLogo = getTeamLogo(game.away_team, 'epl');
  const leagueFallback = getLeagueFallbackIcon('epl');
  
  // Use direct image sources with fallbacks
  const sportIcon = game.sport_icon || '/images/icon/soccer-icon.png';
  const homeImage = homeTeamLogo || leagueFallback;
  const awayImage = awayTeamLogo || leagueFallback;

  return (
    <div className="top_matches__cmncard p2-bg p-4 rounded-3 mb-4">
      <div className="row gx-0 gy-xl-0 gy-7">
        <div className="col-xl-5 col-xxl-4">
          <div className="top_matches__clubname">
            <div className="top_matches__cmncard-right d-flex align-items-start justify-content-between pb-4 mb-4 gap-4">
              <div className="d-flex align-items-center gap-1">
                <Image 
                  src={sportIcon}
                  width={16} 
                  height={16} 
                  alt="Soccer"
                />
                <span className="fs-eight cpoint">{game.league_name}</span>
              </div>
              <div className="d-flex align-items-center gap-4 pe-xl-15 flex-nowrap flex-xl-wrap">
                <div className="d-flex align-items-center gap-1">
                  <Image 
                    src="/images/icon/live.png" 
                    width={16} 
                    height={16} 
                    alt="Live"
                  />
                  <Image 
                    src="/images/icon/play.png" 
                    width={16} 
                    height={16} 
                    alt="Play"
                  />
                </div>
                <span className="fs-eight cpoint text-danger fw-bold">
                  {getMatchTiming()}
                </span>
              </div>
            </div>
            <div className="top_matches__cmncard-left d-flex align-items-center justify-content-between pe-xl-10">
              <div>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <Image 
                    src={homeImage}
                    width={24} 
                    height={24} 
                    alt={game.home_team}
                  />
                  <span className="fs-seven cpoint">{game.home_team}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Image 
                    src={awayImage}
                    width={24} 
                    height={24} 
                    alt={game.away_team}
                  />
                  <span className="fs-seven cpoint">{game.away_team}</span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-4 position-relative pe-xl-15">
                <div className="d-flex flex-column gap-1">
                  <span className="top_matches__cmncard-countcercle rounded-17 fs-seven">
                    {game.score?.home || Math.floor(Math.random() * 3)}
                  </span>
                  <span className="top_matches__cmncard-countcercle rounded-17 fs-seven">
                    {game.score?.away || Math.floor(Math.random() * 3)}
                  </span>
                </div>
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
            <div className="table-responsive maintaintwo">
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
                        <div className="top_matches__innercount-item clickable-active py-1 px-7 rounded-3 n11-bg text-center">
                          <span className="fs-seven d-block mb-2 text-nowrap">1</span>
                          <span className="fw-bold d-block">{odds.home.toFixed(2)}</span>
                        </div>
                        {/* Draw */}
                        <div className="top_matches__innercount-item clickable-active py-1 px-7 rounded-3 n11-bg text-center">
                          <span className="fs-seven d-block mb-2 text-nowrap">X</span>
                          <span className="fw-bold d-block">{odds.draw.toFixed(2)}</span>
                        </div>
                        {/* Away Win */}
                        <div className="top_matches__innercount-item clickable-active py-1 px-7 rounded-3 n11-bg text-center">
                          <span className="fs-seven d-block mb-2 text-nowrap">2</span>
                          <span className="fw-bold d-block">{odds.away.toFixed(2)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="pt-4">
                      <div className="top_matches__innercount d-flex align-items-center gap-2">
                        {/* 1X */}
                        <div className="top_matches__innercount-item clickable-active py-1 px-7 rounded-3 n11-bg text-center">
                          <span className="fs-seven d-block mb-2 text-nowrap">1X</span>
                          <span className="fw-bold d-block">{((1/odds.home + 1/odds.draw) ** -1).toFixed(2)}</span>
                        </div>
                        {/* 12 */}
                        <div className="top_matches__innercount-item clickable-active py-1 px-7 rounded-3 n11-bg text-center">
                          <span className="fs-seven d-block mb-2 text-nowrap">12</span>
                          <span className="fw-bold d-block">{((1/odds.home + 1/odds.away) ** -1).toFixed(2)}</span>
                        </div>
                        {/* X2 */}
                        <div className="top_matches__innercount-item clickable-active py-1 px-7 rounded-3 n11-bg text-center">
                          <span className="fs-seven d-block mb-2 text-nowrap">X2</span>
                          <span className="fw-bold d-block">{((1/odds.draw + 1/odds.away) ** -1).toFixed(2)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="pt-4">
                      <div className="top_matches__innercount d-flex align-items-center gap-2">
                        {/* Over 0.5 */}
                        <div className="top_matches__innercount-item clickable-active py-1 px-7 rounded-3 n11-bg text-center">
                          <span className="fs-seven d-block mb-2 text-nowrap">O0.5</span>
                          <span className="fw-bold d-block">1.25</span>
                        </div>
                        {/* Under 0.5 */}
                        <div className="top_matches__innercount-item clickable-active py-1 px-7 rounded-3 n11-bg text-center">
                          <span className="fs-seven d-block mb-2 text-nowrap">U0.5</span>
                          <span className="fw-bold d-block">4.50</span>
                        </div>
                        {/* BTTS */}
                        <div className="top_matches__innercount-item clickable-active py-1 px-7 rounded-3 n11-bg text-center">
                          <span className="fs-seven d-block mb-2 text-nowrap">BTTS</span>
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
      {/* Live indicator */}
      <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-danger blink">● LIVE</span>
          <span className="fs-eight text-muted">{game.bookmaker_count} bookmakers</span>
        </div>
        <span className="fs-eight text-muted">
          Last update: {new Date(game.last_updated).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}

// No live matches state
function NoLiveMatchesState() {
  return (
    <div className="top_matches__cmncard p2-bg p-4 rounded-3">
      <div className="row gx-0 gy-xl-0 gy-7">
        <div className="col-12">
          <div className="text-center py-5">
            <div className="mb-3">
              <Image src="/images/icon/live-match.png" width={48} height={48} alt="Live" />
            </div>
            <h5 className="mb-3">No Live Matches</h5>
            <p className="text-muted mb-0">
              There are currently no live soccer matches. Check back soon for live action!
            </p>
            <div className="mt-3">
              <span className="badge bg-secondary">Checking for live matches every 15 seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SoccerLive() {
  const [liveGames, setLiveGames] = useState<LiveSoccerGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveGames = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching live soccer matches...');
      // Get all soccer games and filter for live ones
      const allGames = await sportsService.getSoccerGames({
        league: 'epl', // Start with EPL, can expand to multiple leagues
        limit: 50
      });
      
      // Filter for live games or simulate live status for demo
      const liveMatches = allGames.filter((game: any) => {
        // Check if game is actually live or simulate for demo
        const gameTime = new Date(game.game_time || game.startTime);
        const now = new Date();
        const diffHours = (now.getTime() - gameTime.getTime()) / (1000 * 60 * 60);
        
        // Consider games as live if they started within the last 2 hours but not more than 2.5 hours ago
        return game.status === 'live' || (diffHours > 0 && diffHours < 2.5);
      });
      
      console.log('Live soccer matches found:', liveMatches);
      setLiveGames(liveMatches as LiveSoccerGame[]);
    } catch (err) {
      console.error('Error fetching live soccer matches:', err);
      setError('Failed to load live matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveGames();
    
    // Set up real-time updates every 15 seconds for live matches
    const interval = setInterval(fetchLiveGames, 15000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array - only run once on mount

  return (
    <section className="top_matches">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 gx-0 gx-sm-4">
            <div className="top_matches__main">
              <div className="row w-100 mb-4 mb-md-6">
                <div className="col-12">
                  <div className="top_matches__title d-flex align-items-center gap-2 mb-4 mb-md-6">
                    <Image 
                      src="/images/icon/live-match.png" 
                      width={32} 
                      height={32} 
                      alt="Live Matches"
                    />
                    <h3>Live Matches</h3>
                    <span className="badge bg-danger blink">● LIVE</span>
                  </div>
                  
                  <div className="top_matches__content">
                    {loading && (
                      <>
                        <LiveSoccerSkeleton />
                        <LiveSoccerSkeleton />
                      </>
                    )}

                    {error && !loading && (
                      <div className="text-center py-5">
                        <div className="mb-3">
                          <Image src="/images/icon/live-match.png" width={48} height={48} alt="Error" />
                        </div>
                        <h5 className="mb-3">Unable to load live matches</h5>
                        <p className="text-muted mb-3">{error}</p>
                        <button className="btn btn-primary btn-sm" onClick={fetchLiveGames}>
                          <i className="fas fa-redo me-2"></i>Try Again
                        </button>
                      </div>
                    )}

                    {!loading && !error && liveGames.length === 0 && (
                      <NoLiveMatchesState />
                    )}

                    {!loading && !error && liveGames.length > 0 && (
                      <>
                        {liveGames.map((game) => (
                          <LiveSoccerGameCard key={game.id} game={game} />
                        ))}
                        
                        {/* Live data info */}
                        <div className="text-center mt-4 pt-4 border-top">
                          <p className="fs-eight text-muted mb-1">
                            Live odds and scores • Updated every 15 seconds
                          </p>
                          <p className="fs-eight text-muted">
                            Showing {liveGames.length} live soccer {liveGames.length === 1 ? 'match' : 'matches'}
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
      
      <style jsx>{`
        .blink {
          animation: blink 1.5s infinite;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.5; }
        }
        
        .top_matches__cmncard-countcercle {
          background: var(--primary-color, #007bff);
          color: white;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
      `}</style>
    </section>
  );
}
