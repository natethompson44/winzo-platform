'use client';

import Image from "next/image";
// Simple team logo function - directly maps team names to /nfl/ directory

// Sample NFL game data for testing
const nflSampleData = [
  {
    id: "nfl-sample-1",
    sport_icon: "/images/icon/america-football.png",
    league_name: "NFL",
    game_time: "Today 20:20",
    home_team: "Philadelphia Eagles",
    away_team: "Dallas Cowboys",
    featured: true
  },
  {
    id: "nfl-sample-2", 
    sport_icon: "/images/icon/america-football.png",
    league_name: "NFL",
    game_time: "Tomorrow 13:00",
    home_team: "Green Bay Packers", 
    away_team: "Chicago Bears",
    featured: false
  }
];

export default function UpCmingAmericanFootball() {
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
                                    </div>
                                    <div className="top_matches__content">
                                        {nflSampleData.map((game) => (
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
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-center mt-4">
                                        <p className="text-muted">
                                            <i className="fas fa-shield-alt me-1"></i>
                                             Team logos now load correctly from /images/clubs/nfl/ directory
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
    )
}





