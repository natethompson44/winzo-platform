import { promotionData } from '@/public/data/allPageData'
import Image from 'next/image'
import React from 'react'
import Link from 'next/link'

export default function Promotions() {
    return (
        <>
            <section className="Promotions pb-120">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12 gx-0 gx-lg-4">
                            <div className="Promotions__main">
                                <div className="row w-100 gy-6">
                                    <div className="col-12">
                                        <h3>Promotions for you</h3>
                                    </div>

                                    <div className="col-lg-6 col-xl-4">
                                        <div className="cmn-card p-4 p-md-6 radius10">
                                            <div className="mb-4 mb-md-6">
                                                <div className="n4-bg radius10 d-center p-4 mb-4" style={{ height: '214px' }}>
                                                    <div className="text-center">
                                                        <h4 className="s1-color mb-2">🎯 Welcome Bonus</h4>
                                                        <p className="text-muted">Get started with WINZO</p>
                                                    </div>
                                                </div>
                                                <h4 className="mb-3">Welcome Sports Bonus</h4>
                                                <p className="fs-seven">Join WINZO today and receive a generous welcome bonus to kickstart your sports betting journey.</p>
                                            </div>
                                            <Link href="#" className="cmn-btn third-alt py-2 px-4 radius30">Claim Offer</Link>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-xl-4">
                                        <div className="cmn-card p-4 p-md-6 radius10">
                                            <div className="mb-4 mb-md-6">
                                                <div className="n4-bg radius10 d-center p-4 mb-4" style={{ height: '203px' }}>
                                                    <div className="text-center">
                                                        <h4 className="s1-color mb-2">⚽ Live Betting</h4>
                                                        <p className="text-muted">Bet on live matches</p>
                                                    </div>
                                                </div>
                                                <h4 className="mb-3">Live Match Betting</h4>
                                                <p className="fs-seven">Experience the thrill of live betting with real-time odds updates and instant bet placement.</p>
                                            </div>
                                            <Link href="#" className="cmn-btn third-alt py-2 px-4 radius30">Bet Live</Link>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-xl-4">
                                        <div className="cmn-card p-4 p-md-6 radius10">
                                            <div className="mb-4 mb-md-6">
                                                <div className="n4-bg radius10 d-center p-4 mb-4" style={{ height: '249px' }}>
                                                    <div className="text-center">
                                                        <h4 className="s1-color mb-2">🏆 Best Odds</h4>
                                                        <p className="text-muted">Competitive markets</p>
                                                    </div>
                                                </div>
                                                <h4 className="mb-3">Premium Sports Markets</h4>
                                                <p className="fs-seven">Access comprehensive sports markets with competitive odds across all major leagues and tournaments.</p>
                                            </div>
                                            <Link href="#" className="cmn-btn third-alt py-2 px-4 radius30">Explore Markets</Link>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-xl-4">
                                        <div className="cmn-card p-4 p-md-6 radius10">
                                            <div className="mb-4 mb-md-6">
                                                <div className="n4-bg radius10 d-center p-4 mb-4" style={{ height: '254px' }}>
                                                    <div className="text-center">
                                                        <h4 className="s1-color mb-2">📱 Mobile App</h4>
                                                        <p className="text-muted">Bet on the go</p>
                                                    </div>
                                                </div>
                                                <h4 className="mb-3">Mobile Experience</h4>
                                                <p className="fs-seven">Enjoy seamless betting on mobile with our responsive platform optimized for all devices.</p>
                                            </div>
                                            <Link href="#" className="cmn-btn third-alt py-2 px-4 radius30">Mobile Betting</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
