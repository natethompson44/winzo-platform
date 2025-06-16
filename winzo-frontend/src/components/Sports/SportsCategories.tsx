import React from 'react';
import './SportsCategories.css';

interface SportCategory {
  id: string;
  name: string;
  icon: string;
  eventCount: number;
  isActive: boolean;
}

interface SportsCategories {
  categories: SportCategory[];
  selectedSport: string;
  onSportChange: (sportId: string) => void;
}

const SportsCategories: React.FC<SportsCategories> = ({ 
  categories, 
  selectedSport, 
  onSportChange 
}) => {
  const handleCategoryClick = (sportId: string) => {
    onSportChange(sportId);
  };

  return (
    <div className="sports-categories">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`sports-category ${
            selectedSport === category.id ? 'sports-category--active' : ''
          }`}
          onClick={() => handleCategoryClick(category.id)}
          aria-pressed={selectedSport === category.id}
        >
          <div className="sports-category__content">
            <span className="sports-category__icon">{category.icon}</span>
            <span className="sports-category__name">{category.name}</span>
          </div>
          <span className="sports-category__count">({category.eventCount})</span>
        </button>
      ))}
    </div>
  );
};

export default SportsCategories;