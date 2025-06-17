import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SportsCategories from '../components/Sports/SportsCategories';
import EventsList from '../components/Sports/EventsList';
import { LoadingSpinner } from '../components/LoadingStates';
import './SportsPage.css';

export interface GameEvent {
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
}

export interface SportCategory {
  id: string;
  name: string;
  icon: string;
  eventCount: number;
  isActive: boolean;
}

export const mockCategories: SportCategory[] = [
  { id: 'all', name: 'All Sports', icon: '🏆', eventCount: 28, isActive: false },
  { id: 'football', name: 'Football', icon: '🏈', eventCount: 12, isActive: false },
  { id: 'basketball', name: 'Basketball', icon: '🏀', eventCount: 8, isActive: false },
  { id: 'baseball', name: 'Baseball', icon: '⚾', eventCount: 6, isActive: false },
  { id: 'hockey', name: 'Hockey', icon: '🏒', eventCount: 2, isActive: false },
];

export const mockEvents: GameEvent[] = [
  {
    id: '1',
    homeTeam: 'Lakers',
    awayTeam: 'Warriors',
    gameTime: new Date('2024-01-15T20:00:00'),
    rotationNumbers: { home: '501', away: '502' },
    odds: {
      spread: { home: -3.5, away: 3.5, odds: -110 },
      total: { over: 220.5, under: 220.5, odds: -110 },
      moneyline: { home: -150, away: +130 }
    },
    sport: 'basketball',
    league: 'NBA'
  },
  {
    id: '2',
    homeTeam: 'Cowboys',
    awayTeam: 'Eagles',
    gameTime: new Date('2024-01-15T21:00:00'),
    rotationNumbers: { home: '601', away: '602' },
    odds: {
      spread: { home: -7, away: 7, odds: -110 },
      total: { over: 45.5, under: 45.5, odds: -110 },
      moneyline: { home: -280, away: +220 }
    },
    sport: 'football',
    league: 'NFL'
  },
  {
    id: '3',
    homeTeam: 'Yankees',
    awayTeam: 'Red Sox',
    gameTime: new Date('2024-01-15T19:00:00'),
    rotationNumbers: { home: '701', away: '702' },
    odds: {
      spread: { home: -1.5, away: 1.5, odds: -110 },
      total: { over: 8.5, under: 8.5, odds: -110 },
      moneyline: { home: -140, away: +120 }
    },
    sport: 'baseball',
    league: 'MLB'
  }
];

const SportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [categories, setCategories] = useState<SportCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get highlighted event from search
  const highlightedEventId = searchParams.get('highlight');

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set active category
        const updatedCategories = mockCategories.map(cat => ({
          ...cat,
          isActive: cat.id === selectedSport
        }));
        
        setCategories(updatedCategories);
        
        // Filter events by selected sport
        let filteredEvents = mockEvents;
        if (selectedSport !== 'all') {
          filteredEvents = mockEvents.filter(event => event.sport === selectedSport);
        }
        
        setEvents(filteredEvents);
      } catch (err) {
        setError('Failed to load sports events. Please try again.');
        console.error('Error loading sports data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedSport]);

  const handleSportChange = (sportId: string) => {
    setSelectedSport(sportId);
  };

  if (error) {
    return (
      <div className="sports-page__error">
        <div className="error-message">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sports-page">
      {/* Left Sidebar - Sports Categories */}
      <aside className="sports-page__sidebar">
        <div className="sports-page__categories">
          <h2 className="sidebar-title">Sports</h2>
          {isLoading ? (
            <div className="categories-loading">
              <LoadingSpinner size="medium" message="Loading sports..." />
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
      <main className="sports-page__main">
        {/* Events Content - Bet types now managed in bet slip */}
        <div className="sports-page__events">
          {isLoading ? (
            <div className="events-loading">
              <LoadingSpinner size="large" message="Loading upcoming events..." />
            </div>
          ) : (
            <EventsList
              events={events}
              highlightedEventId={highlightedEventId}
              isLiveMode={false}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default SportsPage;