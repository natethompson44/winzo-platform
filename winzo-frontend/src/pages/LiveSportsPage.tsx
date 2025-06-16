import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SportsCategories from '../components/Sports/SportsCategories';
import LiveEventsList from '../components/Sports/LiveEventsList';
import BetTypeSelector from '../components/Betting/BetTypeSelector';
import { LoadingSpinner } from '../components/LoadingStates';
import './LiveSportsPage.css';

export interface LiveGameEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  gameTime: Date;
  rotationNumbers: { home: string; away: string };
  odds: {
    spread: { home: number; away: number; odds: number };
    total: { over: number; under: number; odds: number };
    moneyline: { home: number; away: number };
  };
  sport: string;
  league: string;
  isLive: true;
  currentScore: { home: number; away: number };
  gameStatus: string; // "Q3 2:45", "Bottom 7th", etc.
  timeRemaining: string;
}

export interface SportCategory {
  id: string;
  name: string;
  icon: string;
  eventCount: number;
  isActive: boolean;
}

const LiveSportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedBetType, setSelectedBetType] = useState<'straight' | 'parlay' | 'teaser' | 'if-bet'>('straight');
  const [events, setEvents] = useState<LiveGameEvent[]>([]);
  const [categories, setCategories] = useState<SportCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get highlighted event from search
  const highlightedEventId = searchParams.get('highlight');

  // Mock live data - replace with actual API calls
  const mockCategories: SportCategory[] = [
    { id: 'all', name: 'All Live', icon: '🔴', eventCount: 8, isActive: false },
    { id: 'football', name: 'Football', icon: '🏈', eventCount: 3, isActive: false },
    { id: 'basketball', name: 'Basketball', icon: '🏀', eventCount: 4, isActive: false },
    { id: 'hockey', name: 'Hockey', icon: '🏒', eventCount: 1, isActive: false },
  ];

  const mockLiveEvents: LiveGameEvent[] = [
    {
      id: '1',
      homeTeam: 'Lakers',
      awayTeam: 'Warriors',
      gameTime: new Date(),
      rotationNumbers: { home: '501', away: '502' },
      odds: {
        spread: { home: -2.5, away: 2.5, odds: -110 },
        total: { over: 215.5, under: 215.5, odds: -110 },
        moneyline: { home: -130, away: +110 }
      },
      sport: 'basketball',
      league: 'NBA',
      isLive: true,
      currentScore: { home: 78, away: 82 },
      gameStatus: 'Q3 8:32',
      timeRemaining: '8:32'
    },
    {
      id: '2',
      homeTeam: 'Cowboys',
      awayTeam: 'Eagles',
      gameTime: new Date(),
      rotationNumbers: { home: '601', away: '602' },
      odds: {
        spread: { home: -3, away: 3, odds: -110 },
        total: { over: 42.5, under: 42.5, odds: -110 },
        moneyline: { home: -150, away: +130 }
      },
      sport: 'football',
      league: 'NFL',
      isLive: true,
      currentScore: { home: 14, away: 21 },
      gameStatus: '2nd Quarter',
      timeRemaining: '3:45'
    }
  ];

  // Auto-refresh live data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Set active category
        const updatedCategories = mockCategories.map(cat => ({
          ...cat,
          isActive: cat.id === selectedSport
        }));
        
        setCategories(updatedCategories);
        
        // Filter events by selected sport
        let filteredEvents = mockLiveEvents;
        if (selectedSport !== 'all') {
          filteredEvents = mockLiveEvents.filter(event => event.sport === selectedSport);
        }
        
        setEvents(filteredEvents);
      } catch (err) {
        setError('Failed to load live events. Please try again.');
        console.error('Error loading live sports data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Auto-refresh every 10 seconds for live data
    const refreshInterval = setInterval(loadData, 10000);
    
    return () => clearInterval(refreshInterval);
  }, [selectedSport]);

  const handleSportChange = (sportId: string) => {
    setSelectedSport(sportId);
  };

  const handleBetTypeChange = (betType: 'straight' | 'parlay' | 'teaser' | 'if-bet') => {
    setSelectedBetType(betType);
  };

  if (error) {
    return (
      <div className="live-sports-page__error">
        <div className="error-message">
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Reconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="live-sports-page">
      {/* Live Status Indicator */}
      <div className="live-status-bar">
        <div className="live-indicator">
          <span className="live-dot"></span>
          <span className="live-text">LIVE BETTING</span>
        </div>
        <span className="last-updated">Last updated: just now</span>
      </div>

      {/* Left Sidebar - Sports Categories */}
      <aside className="live-sports-page__sidebar">
        <div className="live-sports-page__categories">
          <h2 className="sidebar-title">
            <span className="live-icon">🔴</span>
            Live Sports
          </h2>
          {isLoading ? (
            <div className="categories-loading">
              <LoadingSpinner size="medium" message="Loading live sports..." />
            </div>
          ) : (
            <SportsCategories
              categories={categories}
              selectedSport={selectedSport}
              onSportChange={handleSportChange}
            />
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="live-sports-page__main">
        {/* Bet Type Selector */}
        <div className="live-sports-page__bet-types">
          <BetTypeSelector
            selectedType={selectedBetType}
            onTypeChange={handleBetTypeChange}
          />
        </div>

        {/* Live Events Content */}
        <div className="live-sports-page__events">
          {isLoading ? (
            <div className="events-loading">
              <LoadingSpinner size="large" message="Loading live events..." />
            </div>
          ) : (
            <LiveEventsList
              events={events}
              highlightedEventId={highlightedEventId}
              selectedBetType={selectedBetType}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default LiveSportsPage;