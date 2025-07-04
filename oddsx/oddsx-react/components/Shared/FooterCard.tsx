"use client"
import React, { useEffect } from 'react'
import { useState } from "react";
import Link from 'next/link';
import Image from 'next/image'
import { IconX, IconArrowBadgeUpFilled, IconTrash, IconSettings } from "@tabler/icons-react";
import { Tab } from '@headlessui/react'
import { useAuth } from '@/contexts/AuthContext';
import { useBetSlip } from '@/contexts/BetSlipContext';

export default function FooterCard() {
    const { isAuthenticated } = useAuth();
    const { betSlipItems, removeFromBetSlip, clearBetSlip, getTotalPotentialWin } = useBetSlip();

    const [isCardExpanded, setIsCardExpanded] = useState(false);
    const [betAmount, setBetAmount] = useState('');
    const [selectedStake, setSelectedStake] = useState(25);

    const toggleCard = () => {
      setIsCardExpanded(!isCardExpanded);
    };
  
    useEffect(() => {
      const handleClickOutside = (event: any) => {
        if (isCardExpanded && !event.target.closest(".fixed_footer")) {
          setIsCardExpanded(false);
        }
      };
      document.body.addEventListener("click", handleClickOutside);
      return () => {
        document.body.removeEventListener("click", handleClickOutside);
      };
    }, [isCardExpanded]);

    const items = ['Single', 'Multiple', 'System']
    const [activeItem, setActiveItem] = useState(items[0]);
    const handleClick = (itemName: string) => {
        setActiveItem(itemName);
    };
    const getItemStyle = (itemName: string) => {
        return {
            backgroundColor: activeItem === itemName ? '#0F1B42' : '#0A1436',
            cursor: 'pointer',
        };
    };

    const quickStakeAmounts = [25, 50, 100, 200];
    
    const handleStakeClick = (amount: number) => {
        setSelectedStake(amount);
        setBetAmount(amount.toString());
    };

    const handleMaxClick = () => {
        // In a real app, this would use the user's wallet balance
        const maxAmount = 1000;
        setBetAmount(maxAmount.toString());
        setSelectedStake(maxAmount);
    };

    const calculatePotentialWin = () => {
        const stakes: { [key: string]: number } = {};
        const stake = parseFloat(betAmount) || 0;
        
        betSlipItems.forEach(item => {
            const key = `${item.gameId}-${item.selection}`;
            stakes[key] = stake;
        });
        
        return getTotalPotentialWin(stakes);
    };

    const renderEmptyBetSlip = () => (
        <div className="fixed_footer__content-live px-4 py-5 mb-5 text-center">
            <div className="mb-4">
                <p className="fs-seven text-muted">Your bet slip is empty</p>
                <p className="fs-nine text-muted">Add selections to start betting</p>
            </div>
        </div>
    );

    const renderBetSlipItem = (item: any, index: number) => (
        <div key={index} className="fixed_footer__content-live px-4 py-5 mb-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-content-center gap-1">
                    <Image src={item.game?.homeTeamLogo || '/images/icon/team-icon.png'} width={20} height={20} alt="Home Team" />
                    <span className="fs-seven cpoint">{item.game?.homeTeam}</span>
                    <span className="fs-seven">vs.</span>
                    <span className="fs-seven cpoint">{item.game?.awayTeam}</span>
                </div>
                <span className="r1-color fs-seven">Live</span>
                <IconX 
                    className="ti ti-x n4-color cpoint" 
                    onClick={() => removeFromBetSlip(item.gameId, item.selection)}
                />
            </div>
            <div className="d-flex align-items-center gap-2">
                <span className="fixed_footer__content-scr py-1 px-2 fs-seven">{item.odds}</span>
                <div>
                    <span className="fs-seven d-block">{item.selection}</span>
                    <span className="fs-nine d-block">{item.betType}</span>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className={`fixed_footer p3-bg rounded-5 ${isCardExpanded ? "expandedtexta" : "expanded2"}`}>
                <div className="fixed_footer__head py-3 px-4">
                    <div className="d-flex justify-content-between">
                        <div className="fixed_footer__head-betslip d-flex align-items-center gap-2">
                            <span className="fw-bold">Betslip</span>
                            <span className="fixed_footer__head-n1">{betSlipItems.length}</span>
                            <button onClick={toggleCard} className="footfixedbtn" type="button">
                                <IconArrowBadgeUpFilled className="ti ti-arrow-badge-down-filled n5-color fs-four fixediconstyle" />
                            </button>
                        </div>
                        <div className="fixed_footer__head-quickbet d-flex align-items-center gap-1">
                            <span className="fw-bold">Quick Bet</span>
                            <input type="checkbox" id="switch" /><label>Toggle</label>
                        </div>
                    </div>
                </div>
                <div className="fixed_footer__content position-relative">
                    <Tab.Group>
                        <Tab.List className="tab-list">
                            {items.map((item) => (
                                <Tab className="tab-item"
                                    key={item}
                                    onClick={() => handleClick(item)}
                                    style={getItemStyle(item)}
                                >
                                    <span className="tab-trigger cpoint">{item}</span>
                                </Tab>
                            ))}
                        </Tab.List>
                        <Tab.Panels className="tab-container n11-bg">
                            <Tab.Panel className="">
                                {betSlipItems.length === 0 ? renderEmptyBetSlip() : (
                                    <>
                                        {betSlipItems.map((item, index) => renderBetSlipItem(item, index))}
                                        <div className="fixed_footer__content-formarea px-4">
                                            <form>
                                                <div className="border-four d-flex align-items-center justify-content-between pe-2 rounded-3 mb-4">
                                                    <input 
                                                        placeholder="Bet amount" 
                                                        className="place-style" 
                                                        type="number" 
                                                        value={betAmount}
                                                        onChange={(e) => setBetAmount(e.target.value)}
                                                    />
                                                    <button 
                                                        className="cmn-btn p-1 fs-seven fw-normal" 
                                                        type="button"
                                                        onClick={handleMaxClick}
                                                    >
                                                        Max
                                                    </button>
                                                </div>
                                                <div className="fixed_footer__content-selectammount d-flex align-items-center justify-content-between mb-4">
                                                    {quickStakeAmounts.map((amount) => (
                                                        <span
                                                            key={amount}
                                                            className={`fs-seven cpoint py-1 px-4 border-four rounded-2 clickable-active ${selectedStake === amount ? 'active' : ''}`}
                                                            onClick={() => handleStakeClick(amount)}
                                                        >
                                                            {amount}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="fixed_footer__content-possible d-flex align-items-center justify-content-between gap-2 mb-7">
                                                    <span className="fs-seven">Possible win</span>
                                                    <span className="fs-seven fw-bold">
                                                        ${calculatePotentialWin()}
                                                    </span>
                                                </div>
                                                <button type="button" className="cmn-btn px-5 py-3 w-100 mb-4">Place Bet</button>
                                                <button type="button" className="cmn-btn third-alt px-5 py-3 w-100 mb-6">Book</button>
                                            </form>
                                        </div>
                                    </>
                                )}
                                <div className="fixed_footer__content-bottom d-flex align-items-center justify-content-between">
                                    <div className="right-border d-flex align-items-center gap-2">
                                        <IconTrash 
                                            height={20} 
                                            width={20} 
                                            className="ti ti-trash n3-color fs-five cpoint" 
                                            onClick={clearBetSlip}
                                        />
                                        {isAuthenticated ? (
                                            <span className="n3-color fs-seven cpoint" onClick={clearBetSlip}>Clear Bet</span>
                                        ) : (
                                            <Link href="/login" className="n3-color fs-seven">Sign In & Bet</Link>
                                        )}
                                    </div>
                                    <div className="right-border2 d-flex align-items-center justify-content-end gap-2">
                                        <IconSettings height={20} width={20} className="ti ti-settings n3-color fs-five cpoint" />
                                        <Link href="/dashboard" className="n3-color fs-seven">Settings</Link>
                                    </div>
                                </div>
                            </Tab.Panel>
                            <Tab.Panel className="">
                                <div className="fixed_footer__content-live px-4 py-5 mb-5 text-center">
                                    <p className="fs-seven text-muted">Multiple betting coming soon</p>
                                    <p className="fs-nine text-muted">Combine multiple selections for higher odds</p>
                                </div>
                            </Tab.Panel>
                            <Tab.Panel className="">
                                <div className="fixed_footer__content-live px-4 py-5 mb-5 text-center">
                                    <p className="fs-seven text-muted">System betting coming soon</p>
                                    <p className="fs-nine text-muted">Advanced betting strategies</p>
                                </div>
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>
        </>
    )
}
