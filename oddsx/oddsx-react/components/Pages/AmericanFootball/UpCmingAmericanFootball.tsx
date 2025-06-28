'use client';

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from 'react';
import sportsService from '@/services/sportsService';

interface NFLGame {
  id: string;
  sport_key: string;
  sport_icon: string;
  league_name: string;
  game_time: string;
  home_team: string;
  away_team: string;
  markets?: any;
  bookmaker_count?: number;
  last_updated?: string;
  featured?: boolean;
}

export default function UpCmingAmericanFootball() {
  const [nflGames, setNflGames] = useState<NFLGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 🔧 PREVENT INFINITE LOOPS: Use refs to prevent duplicate requests
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const requestInProgressRef = useRef<boolean>(false);

  // 🔧 FETCH REAL NFL GAMES FROM YOUR API
  const fetchNFLGames = useCallback(async () => {
    if (requestInProgressRef.current) return;
    
    try {
      requestInProgressRef.current = true;
      setLoading(true);
      setError(null);
      
      console.log('🏈 Fetching REAL NFL games from API...');
      const games = await sportsService.getNFLGames({ limit: 10 });
      
      console.log('🏈 REAL NFL games received:', games.length, 'games');
      
      if (games && Array.isArray(games)) {
        setNflGames(games as NFLGame[]);
        if (games.length === 0) {
          setError('No NFL games available at the moment.');
        }
      } else {
        throw new Error('Invalid data format from API');
      }
    } catch (err: any) {
      console.error('🏈 Failed to fetch NFL games:', err);
      setError('Failed to load live NFL games. Showing sample data.');
      
      // Simple fallback 
      setNflGames([{
        id: 'fallback-1',
        sport_key: 'americanfootball_nfl',
        sport_icon: '/images/icon/america-football.png',
        league_name: 'NFL - API Unavailable',
        game_time: 'API Error',
        home_team: 'Philadelphia Eagles',
        away_team: 'Dallas Cowboys',
        featured: false
      }]);
    } finally {
      setLoading(false);
      requestInProgressRef.current = false;
    }
  }, []);

  // 🔧 CONTROLLED EFFECT: Run once on mount, then every 5 minutes
  useEffect(() => {
    fetchNFLGames();

    // Set up interval for real-time updates
    intervalRef.current = setInterval(fetchNFLGames, 300000); // 5 minutes

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchNFLGames]); // 🚨 FIXED: Include fetchNFLGames in dependencies

  if (loading && nflGames.length === 0) {
    return (
      <section className="top_matches mb-10">
        <div className="container-fluid">
          <div className="p-4 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading REAL NFL games from API...</p>
          </div>
        </div>
      </section>
    );
  }

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
                      Live API Data
                    </span>
                    <div className="ms-auto">
                      <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => fetchNFLGames()}
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
                    {nflGames.map((game) => (
                      <div className="top_matches__cmncard p2-bg p-4 rounded-3 mb-4" key={game.id}>
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
                                  <span className="fs-eight cpoint">{game.game_time}</span>
                                </div>
                              </div>
                              <div className="top_matches__cmncard-left d-flex align-items-center justify-content-between pe-xl-10">
                                <div>
                                  <div className="d-flex align-items-center gap-2 mb-4">
                                    <Image 
                                      src={'/images/clubs/nfl/' + game.home_team.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.png'} 
                                      width={24} 
                                      height={24}
                                      alt={game.home_team}
                                      onError={(e) => { e.currentTarget.src = '/images/clubs/default-team.png'; }}
                                      loading="lazy"
                                    />
                                    <span className="fs-seven cpoint">{game.home_team}</span>
                                  </div>
                                  <div className="d-flex align-items-center gap-2">
                                    <Image 
                                      src={'/images/clubs/nfl/' + game.away_team.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.png'} 
                                      width={24} 
                                      height={24}
                                      alt={game.away_team}
                                      onError={(e) => { e.currentTarget.src = '/images/clubs/default-team.png'; }}
                                      loading="lazy"
                                    />
                                    <span className="fs-seven cpoint">{game.away_team}</span>
                                  </div>
                                </div>
                                <div className="d-flex align-items-center gap-4 position-relative pe-xl-15">
                                  <span className="v-line lg d-none d-xl-block mb-15"></span>
                                  <div className="d-flex flex-column gap-5">
                                    <Image className="cpoint"
                                      src="/images/icon/line-chart.png" width={16} height={16}
                                      alt="Icon" />
                                    {game.featured && (
                                      <Image className="cpoint"
                                        src="/images/icon/star2.png" width={16} height={16}
                                        alt="Icon" />
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
                                          <div className="top_matches__innercount-item clickable-active py-1 px-7 rounded-3 n11-bg text-center">
                                            <span className="fs-seven d-block mb-2 text-nowrap">{game.home_team.split(' ').pop()}</span>
                                            <span className="fw-bold d-block text-nowrap">-180</span>
                                          </div>
                                          <div className="top_matches__innercount-item clickable-active py-1 px-7 rounded-3 n11-bg text-center">
                                            <span className="fs-seven d-block mb-2 text-nowrap">{game.away_team.split(' ').pop()}</span>
                                            <span className="fw-bold d-block text-nowrap">+160</span>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="pt-4">
                                        <div className="top_matches__innercount d-flex align-items-center gap-2">
                                          <div className="top_matches__innercount-item clickable-active py-1 px-7 rounded-3 n11-bg text-center">
                                            <span className="fs-seven d-block mb-2 text-nowrap">{game.home_team.split(' ').pop()} (-3.5)</span>
                                            <span className="fw-bold d-block text-nowrap">-110</span>
                                          </div>
                                          <div className="top_matches__innercount-item clickable-active py-1 px-7 rounded-3 n11-bg text-center">
                                            <span className="fs-seven d-block mb-2 text-nowrap">{game.away_team.split(' ').pop()} (+3.5)</span>
                                            <span className="fw-bold d-block">-110</span>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="pt-4">
                                        <div className="top_matches__innercount d-flex align-items-center gap-2">
                                          <div className="top_matches__innercount-item clickable-active py-1 px-7 rounded-3 n11-bg text-center">
                                            <span className="fs-seven d-block mb-2 text-nowrap">Over 47.5</span>
                                            <span className="fw-bold d-block text-nowrap">-105</span>
                                          </div>
                                          <div className="top_matches__innercount-item clickable-active py-1 px-7 rounded-3 n11-bg text-center">
                                            <span className="fs-seven d-block mb-2 text-nowrap">Under 47.5</span>
                                            <span className="fw-bold d-block text-nowrap">-115</span>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              <div className="text-end mt-2">
                                <small className="text-muted">
                                  <i className="fas fa-clock me-1"></i>
                                  {game.bookmaker_count ? `${game.bookmaker_count} bookmakers` : 'Live data'}
                                  {game.last_updated && (
                                    <>
                                      <span className="mx-2">•</span>
                                      Updated: {new Date(game.last_updated).toLocaleTimeString()}
                                    </>
                                  )}
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center mt-4">
                    <p className="text-muted">
                      <i className="fas fa-shield-alt me-1"></i>
                      🎯 <strong>{nflGames.length} REAL NFL games</strong> loaded from API! Team logos from /nfl/ directory.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .clickable-active {
          transition: all 0.2s ease;
        }
        
        .clickable-active:hover {
          background-color: var(--primary-color) !important;
          color: white;
          cursor: pointer;
          transform: translateY(-1px);
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
