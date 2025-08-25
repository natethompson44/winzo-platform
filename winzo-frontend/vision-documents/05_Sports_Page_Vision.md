# 05 Sports Page Vision

## Purpose
This document defines the comprehensive design and functionality strategy for sports-specific pages within Winzo's betting platform, establishing consistent templates, data presentation patterns, and user interaction flows that work seamlessly across all sports while maintaining scalability and performance.

## Sports Page Design Philosophy

### Core Principles
- **Sport-Agnostic Design**: Templates that work universally across different sports
- **Data-First Approach**: Clear, scannable presentation of betting information
- **Consistent User Experience**: Predictable layouts and interactions across all sports
- **Performance Optimized**: Fast loading and rendering of sports data
- **Mobile-Responsive**: Optimal experience on all device sizes

### Strategic Goals
Per `01_Project_Vision.md` scalability requirements:
- **Template Reusability**: Single template structure for all sports
- **Easy Sport Addition**: New sports can be added without code changes
- **Data Flexibility**: Accommodate varying data structures across sports
- **User Engagement**: Intuitive betting workflows that encourage interaction

## Event Card Architecture

### Information Hierarchy
Per `02_Styling_Vision.md` visual hierarchy:

#### Primary Information (Most Prominent)
- **Team Names**: Large, bold typography for easy identification
- **Odds Values**: Highlighted with accent colors and monospace fonts
- **Event Status**: Color-coded status indicators (Live, Upcoming, Final)

#### Secondary Information (Supporting Details)
- **Event Date/Time**: Clear but not overwhelming
- **Team Records**: Contextual information for betting decisions
- **Game Type**: Regular season, playoffs, etc.

### Event Card Structure
Per `sport_template.html` implementation:

```html
<div class="event-card" data-event-id="{{EVENT_ID}}">
    <!-- Event Header -->
    <div class="event-header">
        <div class="event-date">
            <span class="date">{{EVENT_DATE}}</span>
            <span class="time">{{EVENT_TIME}}</span>
        </div>
        <div class="event-status {{STATUS_CLASS}}">{{STATUS}}</div>
    </div>

    <!-- Teams Section -->
    <div class="teams-section">
        <div class="team team-home">
            <div class="team-logo">
                <img src="{{HOME_LOGO}}" alt="{{HOME_TEAM}} Logo" loading="lazy">
            </div>
            <div class="team-info">
                <h4>{{HOME_TEAM}}</h4>
                <span class="team-record">{{HOME_RECORD}}</span>
            </div>
        </div>

        <div class="vs-section">
            <span class="vs-text">VS</span>
            <span class="game-type">{{GAME_TYPE}}</span>
        </div>

        <div class="team team-away">
            <div class="team-info">
                <h4>{{AWAY_TEAM}}</h4>
                <span class="team-record">{{AWAY_RECORD}}</span>
            </div>
            <div class="team-logo">
                <img src="{{AWAY_LOGO}}" alt="{{AWAY_TEAM}} Logo" loading="lazy">
            </div>
        </div>
    </div>

    <!-- Odds Section -->
    <div class="odds-section">
        <div class="odds-grid">
            <div class="odds-column">
                <h5>Spread</h5>
                <div class="odds-row">
                    <span class="team-name">{{HOME_ABBR}}</span>
                    <span class="odds-value">{{HOME_SPREAD}}</span>
                </div>
                <div class="odds-row">
                    <span class="team-name">{{AWAY_ABBR}}</span>
                    <span class="odds-value">{{AWAY_SPREAD}}</span>
                </div>
            </div>
            
            <div class="odds-column">
                <h5>Total</h5>
                <div class="odds-row">
                    <span class="team-name">Over</span>
                    <span class="odds-value">{{OVER_ODDS}}</span>
                </div>
                <div class="odds-row">
                    <span class="team-name">Under</span>
                    <span class="odds-value">{{UNDER_ODDS}}</span>
                </div>
            </div>
            
            <div class="odds-column">
                <h5>Moneyline</h5>
                <div class="odds-row">
                    <span class="team-name">{{HOME_ABBR}}</span>
                    <span class="odds-value">{{HOME_ML}}</span>
                </div>
                <div class="odds-row">
                    <span class="team-name">{{AWAY_ABBR}}</span>
                    <span class="odds-value">{{AWAY_ML}}</span>
                </div>
            </div>
        </div>
        
        <div class="bet-actions">
            <button class="btn btn-primary btn-small">Bet Now</button>
            <button class="btn btn-outline btn-small">Add to Slip</button>
        </div>
    </div>
</div>
```

## Odds Display System

### Odds Grid Layout
Per `04_Layout_Vision.md` grid system:

```css
.odds-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
}

.odds-column {
    background: var(--light-gray);
    border-radius: 4px;
    padding: var(--spacing-sm);
    text-align: center;
}

.odds-column h5 {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--text-secondary);
    text-transform: uppercase;
    margin-bottom: var(--spacing-xs);
}

.odds-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-xs) 0;
}

.odds-value {
    font-family: var(--font-family-monospace);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    font-size: var(--font-size-sm);
}
```

### Responsive Odds Display
```css
@media (max-width: 767px) {
    .odds-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-xs);
    }
    
    .odds-column {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-sm);
    }
    
    .odds-column h5 {
        margin-bottom: 0;
        flex-shrink: 0;
    }
}
```

## Sports Template System

### Universal Template Variables
Per `09_Data_Management_Vision.md` data structure:

```javascript
const SportTemplate = {
    // Universal fields for all sports
    universal: {
        sportName: 'string',
        eventId: 'string',
        startTime: 'ISO8601',
        status: 'upcoming|live|finished',
        homeTeam: { name: 'string', record: 'string', logo: 'url' },
        awayTeam: { name: 'string', record: 'string', logo: 'url' }
    },
    
    // Odds structure (consistent across sports)
    odds: {
        spread: { home: 'number', away: 'number' },
        total: { over: 'number', under: 'number' },
        moneyline: { home: 'number', away: 'number' }
    }
};
```

### Sport-Specific Customizations
```css
/* Sport-specific color themes */
.sport-football {
    --sport-accent: #28a745;
}

.sport-basketball {
    --sport-accent: #fd7e14;
}

.sport-baseball {
    --sport-accent: #007bff;
}

/* Apply sport theme */
.event-status.live {
    background-color: var(--sport-accent, var(--error));
}
```

## Interactive Features

### Betting Actions
Per `07_JavaScript_Architecture_Vision.md` event handling:

```javascript
function initSportsPageInteractions() {
    const eventCards = document.querySelectorAll('.event-card');
    
    eventCards.forEach(card => {
        const betButtons = card.querySelectorAll('.bet-actions .btn');
        
        betButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const eventId = card.dataset.eventId;
                const action = this.textContent.trim();
                
                if (action === 'Bet Now') {
                    handleQuickBet(eventId);
                } else if (action === 'Add to Slip') {
                    handleAddToSlip(eventId);
                }
            });
        });
    });
}
```

### Real-Time Updates
Per `09_Data_Management_Vision.md` real-time data:

```javascript
function updateEventOdds(eventId, newOdds) {
    const eventCard = document.querySelector(`[data-event-id="${eventId}"]`);
    if (!eventCard) return;
    
    const oddsElements = eventCard.querySelectorAll('.odds-value');
    
    oddsElements.forEach((element, index) => {
        element.classList.add('odds-updating');
        setTimeout(() => {
            element.classList.remove('odds-updating');
        }, 1000);
    });
}
```

## Performance Optimization

### Image Optimization
Per `10_Performance_Vision.md` image strategy:

```html
<picture class="team-logo">
    <source srcset="team-logo-40.webp 1x, team-logo-80.webp 2x" type="image/webp">
    <img 
        src="team-logo-40.jpg" 
        alt="Team Logo"
        width="40" 
        height="40"
        loading="lazy"
    >
</picture>
```

### Progressive Loading
```javascript
async function loadSportsPage(sportType) {
    showSkeletonLoading();
    
    try {
        const events = await loadSportsEvents(sportType);
        renderEvents(events);
        hideSkeletonLoading();
    } catch (error) {
        showErrorState('Unable to load events');
    }
}
```

## Accessibility Features

### Screen Reader Support
Per `08_User_Experience_Vision.md` accessibility:

```html
<div class="event-card" role="article" aria-labelledby="event-title-{{EVENT_ID}}">
    <h4 id="event-title-{{EVENT_ID}}" class="sr-only">
        {{HOME_TEAM}} vs {{AWAY_TEAM}} - {{EVENT_DATE}}
    </h4>
    
    <div class="odds-section" role="group" aria-label="Betting odds">
        <button 
            class="odds-value" 
            aria-label="{{HOME_TEAM}} spread {{SPREAD_VALUE}}"
        >
            {{SPREAD_VALUE}}
        </button>
    </div>
</div>
```

## Data Consistency

### Placeholder Strategy
Per original vision requirements:
- Use consistent placeholder data across development
- "Team A" vs "Team B" for generic examples
- Placeholder team logos with consistent dimensions
- Sample odds that reflect realistic betting scenarios

### Layout Stability
Per `10_Performance_Vision.md` CLS prevention:
- Reserve space for team logos (40x40px)
- Fixed heights for event cards prevent layout shift
- Skeleton loading maintains layout dimensions
- Progressive enhancement doesn't break existing layout

## Integration with Architecture

This sports page vision supports:
- `01_Project_Vision.md`: Template-based scalable architecture
- `02_Styling_Vision.md`: Consistent visual design systems
- `03_Components_Vision.md`: Reusable card and button components
- `04_Layout_Vision.md`: Responsive grid layouts
- `07_JavaScript_Architecture_Vision.md`: Interactive patterns
- `08_User_Experience_Vision.md`: User-centered betting workflows
- `09_Data_Management_Vision.md`: Real-time data integration
- `10_Performance_Vision.md`: Optimized loading strategies

## Scalability Strategy

### Template Duplication
- Copy `sport_template.html` for new sports
- Update sport name and accent color variables
- Maintain identical structure for consistency
- No code changes required for new sports

### Data Adaptation
- Universal data structure accommodates all sports
- Sport-specific fields handled through configuration
- Consistent API response format across sports
- Template variables populated dynamically

The sports page vision ensures Winzo delivers consistent, engaging, and performant sports betting experiences that scale seamlessly across all sports while maintaining platform usability and accessibility standards.