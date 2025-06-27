'use client';

import Image from "next/image";
import { useState, useEffect } from 'react';
import sportsService from '@/services/sportsService';

interface NFLGame {
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

interface LoadingSkeletonProps {
  count?: number;
}

function LoadingSkeleton({ count = 3 }: LoadingSkeletonProps) {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div key={index} className="top_matches__cmncard p2-bg p-4 rounded-3 mb-4">
          <div className="row gx-0 gy-xl-0 gy-7">
            <div className="col-xl-5 col-xxl-4">
              <div className="top_matches__clubname">
                <div className="top_matches__cmncard-right d-flex align-items-start justify-content-between pb-4 mb-4 gap-4">
                  <div className="d-flex align-items-center gap-1">
                    <div className="skeleton-loader" style={{ width: '16px', height: '16px', borderRadius: '50%' }}></div>
                    <div className="skeleton-loader" style={{ width: '120px', height: '16px' }}></div>
                  </div>
                  <div className="d-flex align-items-center gap-4">
                    <div className="skeleton-loader" style={{ width: '80px', height: '16px' }}></div>
                  </div>
                </div>
                <div className="top_matches__cmncard-left">
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <div className="skeleton-loader" style={{ width: '24px', height: '24px', borderRadius: '50%' }}></div>
                    <div className="skeleton-loader" style={{ width: '120px', height: '16px' }}></div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="skeleton-loader" style={{ width: '24px', height: '24px', borderRadius: '50%' }}></div>
                    <div className="skeleton-loader" style={{ width: '120px', height: '16px' }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-7 col-xxl-8">
              <div className="skeleton-loader" style={{ width: '100%', height: '100px' }}></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function ErrorMessage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="text-center py-5">
      <div className="alert alert-warning" role="alert">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {message}
      </div>
      <button 
        className="btn btn-primary btn-sm" 
        onClick={onRetry}
      >
        <i className="fas fa-redo me-2"></i>
        Try Again
      </button>
    </div>
  );
}

function NFLGameCard({ game }: { game: NFLGame }) {
  const getGameStatus = () => {
    if (game.game_time.toLowerCase().includes('live')) {
      return { status: 'LIVE', className: 'badge bg-danger' };
    } else if (game.game_time.toLowerCase().includes('today')) {
      return { status: 'Today', className: 'badge bg-success' };
    } else if (game.game_time.toLowerCase().includes('tomorrow')) {
      return { status: 'Tomorrow', className: 'badge bg-info' };
    }
    return { status: 'Upcoming', className: 'badge bg-secondary' };
  };

  const gameStatus = getGameStatus();

  // Extract odds data for display (enhanced with spreads and totals)
  const getDisplayOdds = () => {
    const markets = game.markets || {};
    const homeTeam = game.home_team;
    const awayTeam = game.away_team;
    
    // Moneyline odds
    const moneyline = markets.h2h?.outcomes ? {
      homeOdds: markets.h2h.outcomes[homeTeam]?.[0]?.price || 'N/A',
      awayOdds: markets.h2h.outcomes[awayTeam]?.[0]?.price || 'N/A'
    } : null;
    
    // Spread odds
    const spread = markets.spreads?.outcomes ? {
      homeSpread: markets.spreads.outcomes[homeTeam]?.[0] || null,
      awaySpread: markets.spreads.outcomes[awayTeam]?.[0] || null
    } : null;
    
    // Total odds
    const total = markets.totals?.outcomes ? {
      over: (() => {
        const overKey = Object.keys(markets.totals.outcomes).find(key => key.toLowerCase().includes('over'));
        return overKey ? markets.totals.outcomes[overKey]?.[0] : null;
      })(),
      under: (() => {
        const underKey = Object.keys(markets.totals.outcomes).find(key => key.toLowerCase().includes('under'));
        return underKey ? markets.totals.outcomes[underKey]?.[0] : null;
      })()
    } : null;
    
    return { moneyline, spread, total };
  };

  const odds = getDisplayOdds();

  return (
    <div className="top_matches__cmncard p2-bg p-4 rounded-3 mb-4">
      <div className="row gx-0 gy-xl-0 gy-7">
        <div className="col-xl-5 col-xxl-4">
          <div className="top_matches__clubname">
            <div className="top_matches__cmncard-right d-flex align-items-start justify-content-between pb-4 mb-4 gap-4">
              <div className="d-flex align-items-center gap-1">
                <Image src={game.sport_icon} width={16} height={16} alt="NFL" />
                <span className="fs-eight cpoint">{game.league_name}</span>
                {game.featured && (
                  <span className="badge bg-warning text-dark ms-2">
                    <i className="fas fa-star"></i> Featured
                  </span>
                )}
              </div>
              <div className="d-flex align-items-center gap-4 pe-xl-15 flex-nowrap flex-xl-wrap">
                <span className={gameStatus.className}>{gameStatus.status}</span>
                <span className="fs-eight cpoint">{game.game_time}</span>
                <div className="d-flex align-items-center gap-1">
                  <Image src="/images/icon/updwon.png" width={16} height={16} alt="Icon" />
                  <Image src="/images/icon/t-shart.png" width={16} height={16} alt="Icon" />
                </div>
              </div>
            </div>
            <div className="top_matches__cmncard-left d-flex align-items-center justify-content-between pe-xl-10">
              <div>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <Image 
                    src={game.home_team_logo} 
                    width={24} 
                    height={24}
                    alt={game.home_team}
                    onError={(e) => {
                      e.currentTarget.src = '/images/clubs/default-team.png';
                    }}
                  />
                  <span className="fs-seven cpoint">{game.home_team}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Image 
                    src={game.away_team_logo} 
                    width={24} 
                    height={24}
                    alt={game.away_team}
                    onError={(e) => {
                      e.currentTarget.src = '/images/clubs/default-team.png';
                    }}
                  />
                  <span className="fs-seven cpoint">{game.away_team}</span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-4 position-relative pe-xl-15">
                <span className="v-line lg d-none d-xl-block"></span>
                <div className="d-flex flex-column gap-5 mb-5">
                  <Image 
                    className="cpoint mt-5"
                    src="/images/icon/line-chart.png" 
                    width={16} 
                    height={16}
                    alt="Chart" 
                  />
                  {game.featured && (
                    <Image 
                      className="cpoint"
                      src="/images/icon/star2.png" 
                      width={16} 
                      height={16}
                      alt="Star" 
                    />
                  )}
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
                      <span className="fs-eight">Moneyline</span>
                    </th>
                    <th scope="col">
                      <span className="fs-eight">Spread</span>
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
                        <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                          <span className="fs-seven d-block mb-2">{game.home_team.split(' ').pop()}</span>
                          <span className="fw-bold d-block">
                            {odds?.moneyline?.homeOdds !== 'N/A' ? (
                              odds?.moneyline?.homeOdds > 0 ? `+${odds?.moneyline?.homeOdds}` : odds?.moneyline?.homeOdds
                            ) : 'N/A'}
                          </span>
                        </div>
                        <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                          <span className="fs-seven d-block mb-2">{game.away_team.split(' ').pop()}</span>
                          <span className="fw-bold d-block">
                            {odds?.moneyline?.awayOdds !== 'N/A' ? (
                              odds?.moneyline?.awayOdds > 0 ? `+${odds?.moneyline?.awayOdds}` : odds?.moneyline?.awayOdds
                            ) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="pt-4">
                      <div className="top_matches__innercount d-flex align-items-center gap-2">
                        {odds?.spread ? (
                          <>
                            <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                              <span className="fs-seven d-block mb-2">
                                {game.home_team.split(' ').pop()} {odds.spread.homeSpread?.point ? `(${odds.spread.homeSpread.point > 0 ? '+' : ''}${odds.spread.homeSpread.point})` : ''}
                              </span>
                              <span className="fw-bold d-block">
                                {odds.spread.homeSpread?.price ? (
                                  odds.spread.homeSpread.price > 0 ? `+${odds.spread.homeSpread.price}` : odds.spread.homeSpread.price
                                ) : '-'}
                              </span>
                            </div>
                            <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                              <span className="fs-seven d-block mb-2">
                                {game.away_team.split(' ').pop()} {odds.spread.awaySpread?.point ? `(${odds.spread.awaySpread.point > 0 ? '+' : ''}${odds.spread.awaySpread.point})` : ''}
                              </span>
                              <span className="fw-bold d-block">
                                {odds.spread.awaySpread?.price ? (
                                  odds.spread.awaySpread.price > 0 ? `+${odds.spread.awaySpread.price}` : odds.spread.awaySpread.price
                                ) : '-'}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                              <span className="fs-seven d-block mb-2">Coming Soon</span>
                              <span className="fw-bold d-block">-</span>
                            </div>
                            <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                              <span className="fs-seven d-block mb-2">Coming Soon</span>
                              <span className="fw-bold d-block">-</span>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="pt-4">
                      <div className="top_matches__innercount d-flex align-items-center gap-2">
                        {odds?.total ? (
                          <>
                            <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                              <span className="fs-seven d-block mb-2">
                                Over {odds.total.over?.point || ''}
                              </span>
                              <span className="fw-bold d-block">
                                {odds.total.over?.price ? (
                                  odds.total.over.price > 0 ? `+${odds.total.over.price}` : odds.total.over.price
                                ) : '-'}
                              </span>
                            </div>
                            <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                              <span className="fs-seven d-block mb-2">
                                Under {odds.total.under?.point || ''}
                              </span>
                              <span className="fw-bold d-block">
                                {odds.total.under?.price ? (
                                  odds.total.under.price > 0 ? `+${odds.total.under.price}` : odds.total.under.price
                                ) : '-'}
                              </span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                              <span className="fs-seven d-block mb-2">Over</span>
                              <span className="fw-bold d-block">-</span>
                            </div>
                            <div className="top_matches__innercount-item clickable-active py-1 px-8 rounded-3 n11-bg">
                              <span className="fs-seven d-block mb-2">Under</span>
                              <span className="fw-bold d-block">-</span>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-end mt-2">
              <small className="text-muted">
                <i className="fas fa-building me-1"></i>
                {game.bookmaker_count} bookmakers
                <span className="mx-2">•</span>
                <i className="fas fa-clock me-1"></i>
                Updated: {new Date(game.last_updated).toLocaleTimeString()}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpCmingAmericanFootball() {
  const [nflGames, setNflGames] = useState<NFLGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchNFLGames = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🏈 Fetching NFL games...');
      const games = await sportsService.getNFLGames({
        limit: 10
      });
      
      console.log('🏈 NFL games fetched:', games);
      
      if (games && Array.isArray(games)) {
        setNflGames(games as NFLGame[]);
        setLastUpdate(new Date());
        
        if (games.length === 0) {
          setError('No NFL games available at the moment. Please check back later.');
        }
      } else {
        console.warn('🏈 Invalid games data received:', games);
        throw new Error('Invalid data format received from API');
      }
    } catch (err: any) {
      console.error('🏈 Failed to fetch NFL games:', err);
      
      // Handle different types of errors gracefully without causing crashes
      let errorMessage = 'Failed to load NFL games. Showing sample data.';
      let shouldUseFallback = true;
      
      if (err?.response?.status === 401) {
        errorMessage = 'Authentication may be required for live data. Showing sample games.';
        console.warn('🏈 Authentication required for NFL data - but this should not cause logout');
      } else if (err?.response?.status === 404) {
        errorMessage = 'NFL data service not available. Showing sample games.';
      } else if (err?.code === 'NETWORK_ERROR' || !err?.response) {
        errorMessage = 'Network error. Showing sample data while offline.';
      } else if (err?.message?.includes('Invalid data format')) {
        errorMessage = 'Data format error. Showing sample games while we fix this.';
      }
      
      setError(errorMessage);
      
      // Enhanced fallback data with proper structure
      const sampleGames: NFLGame[] = [
        {
          id: 'sample-nfl-1',
          sport_key: 'americanfootball_nfl',
          sport_icon: '/images/icon/america-football.png',
          league_name: 'NFL Sample',
          game_time: 'Today, 20:20',
          home_team: 'Philadelphia Eagles',
          away_team: 'Dallas Cowboys',
          home_team_logo: '/images/clubs/nfl/philadelphia-eagles.png',
          away_team_logo: '/images/clubs/nfl/dallas-cowboys.png',
          markets: {
            h2h: {
              outcomes: {
                'Philadelphia Eagles': [{ price: -180, bookmaker: 'sample' }],
                'Dallas Cowboys': [{ price: 160, bookmaker: 'sample' }]
              }
            },
            spreads: {
              outcomes: {
                'Philadelphia Eagles': [{ price: -110, point: -3.5, bookmaker: 'sample' }],
                'Dallas Cowboys': [{ price: -110, point: 3.5, bookmaker: 'sample' }]
              }
            },
            totals: {
              outcomes: {
                'Over 47.5': [{ price: -105, point: 47.5, bookmaker: 'sample' }],
                'Under 47.5': [{ price: -115, point: 47.5, bookmaker: 'sample' }]
              }
            }
          },
          best_odds: {},
          bookmaker_count: 5,
          last_updated: new Date().toISOString(),
          featured: true
        },
        {
          id: 'sample-nfl-2',
          sport_key: 'americanfootball_nfl',
          sport_icon: '/images/icon/america-football.png',
          league_name: 'NFL Sample',
          game_time: 'Tomorrow, 13:00',
          home_team: 'Green Bay Packers',
          away_team: 'Chicago Bears',
          home_team_logo: '/images/clubs/nfl/green-bay-packers.png',
          away_team_logo: '/images/clubs/nfl/chicago-bears.png',
          markets: {
            h2h: {
              outcomes: {
                'Green Bay Packers': [{ price: -250, bookmaker: 'sample' }],
                'Chicago Bears': [{ price: 200, bookmaker: 'sample' }]
              }
            }
          },
          best_odds: {},
          bookmaker_count: 4,
          last_updated: new Date().toISOString(),
          featured: false
        }
      ];
      
      if (shouldUseFallback) {
        setNflGames(sampleGames);
        setLastUpdate(new Date());
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNFLGames();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchNFLGames, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="top_matches mb-10">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 gx-0 gx-sm-4">
            <div className="top_matches__main pt-20">
              <div className="row w-100 pt-md-5">
                <div className="col-12">
                  <div className="top_matches__title d-flex align-items-center gap-2 mb-4 mb-md-5">
                    <Image src="/images/icon/america-football.png" width={32} height={32} alt="NFL" />
                    <h3>NFL Games</h3>
                    <span className="badge bg-success ms-2">
                      <i className="fas fa-satellite-dish me-1"></i>
                      Live Data
                    </span>
                    <div className="ms-auto d-flex align-items-center gap-2">
                      <small className="text-muted">
                        Last updated: {lastUpdate.toLocaleTimeString()}
                      </small>
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={fetchNFLGames}
                        disabled={loading}
                      >
                        <i className={`fas fa-sync ${loading ? 'fa-spin' : ''} me-1`}></i>
                        Refresh
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="alert alert-info" role="alert">
                      <i className="fas fa-info-circle me-2"></i>
                      {error}
                    </div>
                  )}

                  <div className="top_matches__content">
                    {loading ? (
                      <LoadingSkeleton count={3} />
                    ) : nflGames.length > 0 ? (
                      nflGames.map((game) => (
                        <NFLGameCard key={game.id} game={game} />
                      ))
                    ) : (
                      <ErrorMessage 
                        message="No NFL games available at the moment."
                        onRetry={fetchNFLGames}
                      />
                    )}
                  </div>

                  {nflGames.length > 0 && (
                    <div className="text-center mt-4">
                      <p className="text-muted">
                        <i className="fas fa-shield-alt me-1"></i>
                        Live odds from {Math.max(...nflGames.map(g => g.bookmaker_count))} trusted bookmakers
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .skeleton-loader {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
        
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        .clickable-active:hover {
          background-color: var(--primary-color) !important;
          color: white;
          cursor: pointer;
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }
        
        .top_matches__cmncard {
          transition: box-shadow 0.3s ease;
        }
        
        .top_matches__cmncard:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
      `}</style>
    </section>
  );
}
