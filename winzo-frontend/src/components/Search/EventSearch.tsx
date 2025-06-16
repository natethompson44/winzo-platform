import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EventSearch.css';

interface SearchResult {
  id: string;
  homeTeam: string;
  awayTeam: string;
  rotationNumbers: { home: string; away: string };
  gameTime: Date;
  sport: string;
  league: string;
  isLive: boolean;
}

const EventSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Mock search function - replace with actual API call
  const searchEvents = async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery.trim()) return [];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock data - replace with actual API call
    const mockEvents: SearchResult[] = [
      {
        id: '1',
        homeTeam: 'Lakers',
        awayTeam: 'Warriors',
        rotationNumbers: { home: '501', away: '502' },
        gameTime: new Date('2024-01-15T20:00:00'),
        sport: 'Basketball',
        league: 'NBA',
        isLive: false
      },
      {
        id: '2',
        homeTeam: 'Cowboys',
        awayTeam: 'Eagles',
        rotationNumbers: { home: '601', away: '602' },
        gameTime: new Date('2024-01-15T21:00:00'),
        sport: 'Football',
        league: 'NFL',
        isLive: true
      }
    ];

    // Filter based on search query
    return mockEvents.filter(event => 
      event.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.rotationNumbers.home.includes(searchQuery) ||
      event.rotationNumbers.away.includes(searchQuery) ||
      event.league.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Handle search input changes
  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        try {
          const searchResults = await searchEvents(query);
          setResults(searchResults);
          setShowResults(true);
          setSelectedIndex(-1);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
    }
  };

  // Handle result selection
  const handleResultClick = (result: SearchResult) => {
    const targetPage = result.isLive ? '/live-sports' : '/sports';
    navigate(`${targetPage}?highlight=${result.id}`);
    setQuery('');
    setShowResults(false);
    setSelectedIndex(-1);
    searchRef.current?.blur();
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node) &&
          searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatGameTime = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <div className="event-search">
      <div className="event-search__input-container">
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && setShowResults(true)}
          placeholder="Search teams, rotation numbers, or leagues..."
          className="event-search__input"
          aria-label="Search events"
          aria-autocomplete="list"
          aria-expanded={showResults}
          aria-controls="event-search-results"
          role="combobox"
        />
        
        <div className="event-search__icon">
          {isLoading ? (
            <div className="event-search__spinner" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          )}
        </div>
      </div>

      {showResults && (
        <div ref={resultsRef} className="event-search__results" role="listbox" id="event-search-results">
          {results.length > 0 ? (
            results.map((result, index) => (
              <div
                key={result.id}
                className={`event-search__result ${
                  index === selectedIndex ? 'event-search__result--selected' : ''
                }`}
                onClick={() => handleResultClick(result)}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="event-search__result-header">
                  <span className="event-search__matchup">
                    {result.awayTeam} @ {result.homeTeam}
                  </span>
                  {result.isLive && (
                    <span className="event-search__live-badge">LIVE</span>
                  )}
                </div>
                
                <div className="event-search__result-details">
                  <span className="event-search__rotation">
                    Rot: {result.rotationNumbers.away}/{result.rotationNumbers.home}
                  </span>
                  <span className="event-search__league">{result.league}</span>
                  <span className="event-search__time">
                    {result.isLive ? 'Live Now' : formatGameTime(result.gameTime)}
                  </span>
                </div>
              </div>
            ))
          ) : query.trim().length >= 2 && !isLoading ? (
            <div className="event-search__no-results">
              No events found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default EventSearch;