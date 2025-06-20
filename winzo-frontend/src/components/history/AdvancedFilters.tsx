import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { FilterOptions } from '../../types/betting';

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  availableSports: string[];
  availableBetTypes: string[];
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFilterChange,
  availableSports,
  availableBetTypes
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const quickFilters = [
    { label: 'Today', days: 1 },
    { label: 'This Week', days: 7 },
    { label: 'This Month', days: 30 },
    { label: 'Last 3 Months', days: 90 },
    { label: 'This Year', days: 365 }
  ];

  const statusOptions = [
    { value: 'won', label: 'Won', color: 'success' },
    { value: 'lost', label: 'Lost', color: 'error' },
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'cancelled', label: 'Cancelled', color: 'neutral' },
    { value: 'void', label: 'Void', color: 'neutral' }
  ];

  const handleQuickFilter = (days: number) => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    
    onFilterChange({
      dateRange: { start: startDate, end: endDate }
    });
  };

  const handleSportToggle = (sport: string) => {
    const newSports = filters.sports.includes(sport)
      ? filters.sports.filter(s => s !== sport)
      : [...filters.sports, sport];
    
    onFilterChange({ sports: newSports });
  };

  const handleBetTypeToggle = (betType: string) => {
    const newBetTypes = filters.betTypes.includes(betType)
      ? filters.betTypes.filter(bt => bt !== betType)
      : [...filters.betTypes, betType];
    
    onFilterChange({ betTypes: newBetTypes });
  };

  const handleStatusToggle = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    
    onFilterChange({ statuses: newStatuses });
  };

  const clearAllFilters = () => {
    onFilterChange({
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      },
      sports: [],
      betTypes: [],
      statuses: [],
      stakeRange: { min: 0, max: 1000 },
      search: ''
    });
  };

  const hasActiveFilters = 
    filters.sports.length > 0 ||
    filters.betTypes.length > 0 ||
    filters.statuses.length > 0 ||
    filters.search.length > 0 ||
    filters.stakeRange.min > 0 ||
    filters.stakeRange.max < 1000;

  return (
    <Card className="filters-card">
      <div className="filters-header">
        <div className="filters-title">
          <h3>Filters</h3>
          {hasActiveFilters && (
            <span className="active-filters-count">
              {[
                ...filters.sports,
                ...filters.betTypes,
                ...filters.statuses,
                ...(filters.search ? [filters.search] : [])
              ].length} active
            </span>
          )}
        </div>
        <div className="filters-actions">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Less Filters' : 'More Filters'}
          </Button>
        </div>
      </div>

      <div className="filters-content">
        {/* Quick Filters */}
        <div className="filter-section">
          <label className="filter-label">Quick Date Filters</label>
          <div className="quick-filters">
            {quickFilters.map((filter) => (
              <Button
                key={filter.label}
                variant="ghost"
                size="sm"
                onClick={() => handleQuickFilter(filter.days)}
                className="quick-filter-btn"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="filter-section">
          <label className="filter-label" htmlFor="search-input">Search</label>
          <input
            id="search-input"
            type="text"
            className="search-input"
            placeholder="Search events, sports, bet types..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
          />
        </div>

        {/* Date Range */}
        <div className="filter-section">
          <label className="filter-label">Date Range</label>
          <div className="date-range-inputs">
            <input
              type="date"
              className="date-input"
              value={filters.dateRange.start}
              onChange={(e) => onFilterChange({
                dateRange: { ...filters.dateRange, start: e.target.value }
              })}
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              className="date-input"
              value={filters.dateRange.end}
              onChange={(e) => onFilterChange({
                dateRange: { ...filters.dateRange, end: e.target.value }
              })}
            />
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <>
            {/* Sports Filter */}
            <div className="filter-section">
              <label className="filter-label">Sports</label>
              <div className="checkbox-group">
                {availableSports.map((sport) => (
                  <label key={sport} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={filters.sports.includes(sport)}
                      onChange={() => handleSportToggle(sport)}
                    />
                    <span className="checkbox-label">{sport}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bet Types Filter */}
            <div className="filter-section">
              <label className="filter-label">Bet Types</label>
              <div className="checkbox-group">
                {availableBetTypes.map((betType) => (
                  <label key={betType} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={filters.betTypes.includes(betType)}
                      onChange={() => handleBetTypeToggle(betType)}
                    />
                    <span className="checkbox-label">{betType}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="filter-section">
              <label className="filter-label">Status</label>
              <div className="checkbox-group">
                {statusOptions.map((status) => (
                  <label key={status.value} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes(status.value)}
                      onChange={() => handleStatusToggle(status.value)}
                    />
                    <span className={`checkbox-label status-${status.color}`}>
                      {status.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stake Range Filter */}
            <div className="filter-section">
              <label className="filter-label">Stake Range</label>
              <div className="stake-range">
                <input
                  type="number"
                  className="stake-input"
                  placeholder="Min"
                  value={filters.stakeRange.min}
                  onChange={(e) => onFilterChange({
                    stakeRange: { ...filters.stakeRange, min: Number(e.target.value) || 0 }
                  })}
                />
                <span className="range-separator">-</span>
                <input
                  type="number"
                  className="stake-input"
                  placeholder="Max"
                  value={filters.stakeRange.max}
                  onChange={(e) => onFilterChange({
                    stakeRange: { ...filters.stakeRange, max: Number(e.target.value) || 1000 }
                  })}
                />
              </div>
              <div className="stake-range-display">
                ${filters.stakeRange.min} - ${filters.stakeRange.max}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="active-filters">
          <div className="active-filters-header">
            <span>Active Filters:</span>
          </div>
          <div className="active-filters-list">
            {filters.sports.map((sport) => (
              <span key={sport} className="filter-tag">
                {sport}
                <button
                  className="filter-tag-remove"
                  onClick={() => handleSportToggle(sport)}
                >
                  ×
                </button>
              </span>
            ))}
            {filters.betTypes.map((betType) => (
              <span key={betType} className="filter-tag">
                {betType}
                <button
                  className="filter-tag-remove"
                  onClick={() => handleBetTypeToggle(betType)}
                >
                  ×
                </button>
              </span>
            ))}
            {filters.statuses.map((status) => (
              <span key={status} className="filter-tag">
                {status}
                <button
                  className="filter-tag-remove"
                  onClick={() => handleStatusToggle(status)}
                >
                  ×
                </button>
              </span>
            ))}
            {filters.search && (
              <span className="filter-tag">
                "{filters.search}"
                <button
                  className="filter-tag-remove"
                  onClick={() => onFilterChange({ search: '' })}
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default AdvancedFilters; 