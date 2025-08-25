# 09 Data Management Vision

## Purpose
This document defines the data management strategy for Winzo's sports betting platform, establishing patterns for state management, API integration, data flow, and caching that maintain performance while ensuring data consistency and reliability.

## Core Data Principles
Per `01_Project_Vision.md`, the platform emphasizes maintainability and scalability. Our data management follows:
- **Single Source of Truth**: Centralized state management to prevent data inconsistencies
- **Predictable Updates**: Clear data flow patterns that are easy to debug and maintain
- **Performance First**: Efficient data handling that doesn't compromise user experience
- **Offline Resilience**: Graceful degradation when network connectivity is limited

## Data Architecture Overview

### Data Flow Pattern
```
API Layer → State Management → UI Components → User Interactions → State Updates → API Layer
```

Per `07_JavaScript_Architecture_Vision.md`, we use vanilla JavaScript patterns:
- **State Container**: Simple object-based state without external dependencies
- **Event-Driven Updates**: DOM events trigger state changes
- **Reactive UI**: UI updates automatically reflect state changes
- **API Integration**: Fetch-based communication with backend services

## State Management Structure

### Application State Schema
Based on `script.js` and `07_JavaScript_Architecture_Vision.md` patterns:

```javascript
const AppState = {
    // User Authentication
    user: {
        isLoggedIn: false,
        id: null,
        username: null,
        email: null,
        balance: 0,
        preferences: {
            oddsFormat: 'american', // american, decimal, fractional
            favoriteTeams: [],
            notifications: true
        }
    },
    
    // Sports Data
    sports: {
        available: [], // List of available sports
        current: null, // Currently selected sport
        events: [], // Current sport's events
        favorites: [] // User's favorite events
    },
    
    // Betting State
    betting: {
        slip: [], // Items in betting slip
        activeEvents: [], // Events with live updates
        history: [], // Past betting history
        limits: {
            daily: 1000,
            weekly: 5000,
            monthly: 20000
        }
    },
    
    // UI State
    ui: {
        loading: false,
        error: null,
        mobileMenuOpen: false,
        currentPage: 'home',
        notifications: []
    },
    
    // Cache Management
    cache: {
        timestamp: null,
        ttl: 300000, // 5 minutes
        data: {}
    }
};
```

### State Management Functions
Per `07_JavaScript_Architecture_Vision.md` module pattern:

```javascript
const StateManager = (function() {
    'use strict';
    
    let state = { ...AppState };
    const listeners = {};
    
    // Subscribe to state changes
    function subscribe(key, callback) {
        if (!listeners[key]) {
            listeners[key] = [];
        }
        listeners[key].push(callback);
    }
    
    // Update state and notify listeners
    function setState(key, value) {
        const oldValue = state[key];
        state[key] = value;
        
        if (listeners[key]) {
            listeners[key].forEach(callback => {
                callback(value, oldValue);
            });
        }
    }
    
    // Get current state
    function getState(key = null) {
        return key ? state[key] : state;
    }
    
    return {
        subscribe,
        setState,
        getState
    };
})();
```

## API Integration Strategy

### API Configuration
Per `06_Deployment_Vision.md` environment variables:

```javascript
const API_CONFIG = {
    baseURL: process.env.API_URL || 'https://api.winzo.app',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
    endpoints: {
        auth: '/auth',
        sports: '/sports',
        events: '/events',
        betting: '/bets',
        user: '/user'
    }
};
```

### API Client Implementation
Building on `07_JavaScript_Architecture_Vision.md` fetch wrapper:

```javascript
const APIClient = (function() {
    'use strict';
    
    // Enhanced fetch with retry logic
    async function apiCall(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getAuthToken(),
                ...options.headers
            },
            timeout: API_CONFIG.timeout,
            ...options
        };
        
        let lastError;
        
        for (let attempt = 1; attempt <= API_CONFIG.retryAttempts; attempt++) {
            try {
                StateManager.setState('ui', {
                    ...StateManager.getState('ui'),
                    loading: true
                });
                
                const response = await fetchWithTimeout(
                    `${API_CONFIG.baseURL}${endpoint}`,
                    config
                );
                
                if (!response.ok) {
                    throw new APIError(response.status, response.statusText);
                }
                
                const data = await response.json();
                
                StateManager.setState('ui', {
                    ...StateManager.getState('ui'),
                    loading: false,
                    error: null
                });
                
                return data;
                
            } catch (error) {
                lastError = error;
                
                if (attempt < API_CONFIG.retryAttempts) {
                    await delay(API_CONFIG.retryDelay * attempt);
                    continue;
                }
                
                StateManager.setState('ui', {
                    ...StateManager.getState('ui'),
                    loading: false,
                    error: error.message
                });
                
                throw error;
            }
        }
    }
    
    return {
        get: (endpoint, options) => apiCall(endpoint, { method: 'GET', ...options }),
        post: (endpoint, data, options) => apiCall(endpoint, { 
            method: 'POST', 
            body: JSON.stringify(data), 
            ...options 
        }),
        put: (endpoint, data, options) => apiCall(endpoint, { 
            method: 'PUT', 
            body: JSON.stringify(data), 
            ...options 
        }),
        delete: (endpoint, options) => apiCall(endpoint, { method: 'DELETE', ...options })
    };
})();
```

## Sports Data Management

### Event Data Structure
Per `05_Sports_Page_Vision.md` and `sport_template.html`:

```javascript
const EventDataSchema = {
    id: 'string',
    sport: 'string',
    startTime: 'ISO8601',
    status: 'upcoming|live|finished',
    homeTeam: {
        name: 'string',
        record: 'string',
        logo: 'url'
    },
    awayTeam: {
        name: 'string',
        record: 'string',
        logo: 'url'
    },
    odds: {
        spread: {
            home: { value: 'number', odds: 'number' },
            away: { value: 'number', odds: 'number' }
        },
        total: {
            over: { value: 'number', odds: 'number' },
            under: { value: 'number', odds: 'number' }
        },
        moneyline: {
            home: 'number',
            away: 'number'
        }
    },
    lastUpdated: 'ISO8601'
};
```

### Sports Data Loading
Per `07_JavaScript_Architecture_Vision.md` patterns:

```javascript
const SportsDataManager = (function() {
    'use strict';
    
    async function loadSportsEvents(sportType) {
        try {
            // Check cache first
            const cached = getCachedData(`events_${sportType}`);
            if (cached && !isCacheExpired(cached)) {
                updateEventsUI(cached.data);
                return cached.data;
            }
            
            // Fetch from API
            const events = await APIClient.get(`/sports/${sportType}/events`);
            
            // Update state
            StateManager.setState('sports', {
                ...StateManager.getState('sports'),
                current: sportType,
                events: events
            });
            
            // Cache the data
            setCachedData(`events_${sportType}`, events);
            
            // Update UI
            updateEventsUI(events);
            
            return events;
            
        } catch (error) {
            handleDataError('Failed to load events', error);
            throw error;
        }
    }
    
    function updateEventsUI(events) {
        const container = document.querySelector('.events-section');
        if (!container) return;
        
        container.innerHTML = events.map(event => 
            generateEventHTML(event)
        ).join('');
        
        // Reattach event listeners
        attachEventListeners();
    }
    
    return {
        loadSportsEvents,
        updateEventsUI
    };
})();
```

## Caching Strategy

### Client-Side Caching
To improve performance and reduce API calls:

```javascript
const CacheManager = (function() {
    'use strict';
    
    const CACHE_KEYS = {
        EVENTS: 'winzo_events_',
        USER_PREFS: 'winzo_user_prefs',
        SPORTS_LIST: 'winzo_sports_list'
    };
    
    function setCachedData(key, data, ttl = 300000) {
        const cacheItem = {
            data: data,
            timestamp: Date.now(),
            ttl: ttl
        };
        
        try {
            localStorage.setItem(key, JSON.stringify(cacheItem));
            
            // Update state cache
            StateManager.setState('cache', {
                ...StateManager.getState('cache'),
                [key]: cacheItem
            });
        } catch (error) {
            console.warn('Cache storage failed:', error);
        }
    }
    
    function getCachedData(key) {
        try {
            // Check memory cache first
            const stateCache = StateManager.getState('cache');
            if (stateCache[key] && !isCacheExpired(stateCache[key])) {
                return stateCache[key];
            }
            
            // Check localStorage
            const cached = localStorage.getItem(key);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (!isCacheExpired(parsed)) {
                    return parsed;
                }
            }
        } catch (error) {
            console.warn('Cache retrieval failed:', error);
        }
        
        return null;
    }
    
    function isCacheExpired(cacheItem) {
        return Date.now() - cacheItem.timestamp > cacheItem.ttl;
    }
    
    function clearCache(pattern = null) {
        if (pattern) {
            Object.keys(localStorage).forEach(key => {
                if (key.includes(pattern)) {
                    localStorage.removeItem(key);
                }
            });
        } else {
            localStorage.clear();
        }
        
        // Clear state cache
        StateManager.setState('cache', { timestamp: null, ttl: 300000, data: {} });
    }
    
    return {
        setCachedData,
        getCachedData,
        isCacheExpired,
        clearCache
    };
})();
```

## Real-Time Data Updates

### WebSocket Integration (Future Enhancement)
For live odds and event updates:

```javascript
const RealtimeManager = (function() {
    'use strict';
    
    let websocket = null;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
    
    function connect() {
        try {
            websocket = new WebSocket('wss://api.winzo.app/ws');
            
            websocket.onopen = function() {
                console.log('WebSocket connected');
                reconnectAttempts = 0;
                subscribeToEvents();
            };
            
            websocket.onmessage = function(event) {
                handleRealtimeUpdate(JSON.parse(event.data));
            };
            
            websocket.onclose = function() {
                console.log('WebSocket disconnected');
                attemptReconnect();
            };
            
            websocket.onerror = function(error) {
                console.error('WebSocket error:', error);
            };
            
        } catch (error) {
            console.error('WebSocket connection failed:', error);
        }
    }
    
    function handleRealtimeUpdate(data) {
        switch (data.type) {
            case 'odds_update':
                updateEventOdds(data.eventId, data.odds);
                break;
            case 'event_status':
                updateEventStatus(data.eventId, data.status);
                break;
            case 'new_event':
                addNewEvent(data.event);
                break;
        }
    }
    
    return {
        connect,
        disconnect: () => websocket?.close(),
        send: (data) => websocket?.send(JSON.stringify(data))
    };
})();
```

## Data Validation and Sanitization

### Input Validation
Per `08_User_Experience_Vision.md` form handling:

```javascript
const DataValidator = (function() {
    'use strict';
    
    const validators = {
        email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        password: (value) => value.length >= 6,
        betAmount: (value) => {
            const amount = parseFloat(value);
            return amount > 0 && amount <= getUserBettingLimit();
        },
        required: (value) => value.trim().length > 0
    };
    
    function validateField(field, value) {
        const rules = field.dataset.validate?.split(',') || [];
        const errors = [];
        
        rules.forEach(rule => {
            if (validators[rule] && !validators[rule](value)) {
                errors.push(getErrorMessage(rule, field));
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    function sanitizeInput(input) {
        return input
            .trim()
            .replace(/[<>]/g, '') // Basic XSS prevention
            .substring(0, 1000); // Limit input length
    }
    
    return {
        validateField,
        sanitizeInput
    };
})();
```

## Error Handling and Recovery

### Data Error Management
Per `07_JavaScript_Architecture_Vision.md` error patterns:

```javascript
const ErrorManager = (function() {
    'use strict';
    
    const ERROR_TYPES = {
        NETWORK: 'network',
        VALIDATION: 'validation',
        AUTHENTICATION: 'auth',
        PERMISSION: 'permission',
        SERVER: 'server'
    };
    
    function handleDataError(message, error, context = {}) {
        console.error('Data Error:', { message, error, context });
        
        const errorInfo = {
            type: classifyError(error),
            message: getUserFriendlyMessage(error),
            timestamp: Date.now(),
            context: context
        };
        
        // Update UI state
        StateManager.setState('ui', {
            ...StateManager.getState('ui'),
            error: errorInfo,
            loading: false
        });
        
        // Show user notification
        showErrorNotification(errorInfo);
        
        // Log for analytics (future)
        logError(errorInfo);
    }
    
    function classifyError(error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return ERROR_TYPES.NETWORK;
        }
        if (error.status === 401) {
            return ERROR_TYPES.AUTHENTICATION;
        }
        if (error.status === 403) {
            return ERROR_TYPES.PERMISSION;
        }
        if (error.status >= 500) {
            return ERROR_TYPES.SERVER;
        }
        return ERROR_TYPES.VALIDATION;
    }
    
    return {
        handleDataError,
        ERROR_TYPES
    };
})();
```

## Data Persistence Strategy

### Local Storage Management
For user preferences and offline functionality:

```javascript
const PersistenceManager = (function() {
    'use strict';
    
    const STORAGE_KEYS = {
        USER_PREFS: 'winzo_user_preferences',
        BETTING_HISTORY: 'winzo_betting_history',
        FAVORITE_TEAMS: 'winzo_favorite_teams'
    };
    
    function saveUserPreferences(preferences) {
        try {
            localStorage.setItem(
                STORAGE_KEYS.USER_PREFS, 
                JSON.stringify(preferences)
            );
            
            StateManager.setState('user', {
                ...StateManager.getState('user'),
                preferences: preferences
            });
        } catch (error) {
            console.warn('Failed to save preferences:', error);
        }
    }
    
    function loadUserPreferences() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.USER_PREFS);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.warn('Failed to load preferences:', error);
            return null;
        }
    }
    
    return {
        saveUserPreferences,
        loadUserPreferences
    };
})();
```

## Integration with Architecture

This data management vision integrates with:
- `02_Styling_Vision.md`: Loading states use defined color palette
- `03_Components_Vision.md`: Form validation enhances component interactions
- `07_JavaScript_Architecture_Vision.md`: Builds upon established JavaScript patterns
- `08_User_Experience_Vision.md`: Supports defined user workflows and error states

## Performance Considerations

### Data Loading Optimization
- **Lazy Loading**: Load data only when needed
- **Pagination**: Handle large datasets efficiently
- **Compression**: Use gzip for API responses
- **CDN Integration**: Cache static sports data

### Memory Management
- **Cleanup**: Remove unused event listeners and cached data
- **Limits**: Set maximum cache sizes to prevent memory leaks
- **Garbage Collection**: Regular cleanup of expired cache entries

The data management vision ensures Winzo maintains fast, reliable data handling while supporting the scalable architecture defined in the project's technical foundation.
