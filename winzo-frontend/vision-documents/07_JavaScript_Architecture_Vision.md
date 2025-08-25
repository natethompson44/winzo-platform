# 07 JavaScript Architecture Vision

## Purpose
This document defines the JavaScript architecture for Winzo's front-end, emphasizing vanilla ES6+ patterns, modularity, and maintainability while keeping the codebase lightweight and framework-free.

## Core Principles
Per `01_Project_Vision.md`, we use vanilla JavaScript to maintain a lightweight foundation. The architecture focuses on:
- **Simplicity**: Clear, readable code without complex abstractions
- **Modularity**: Reusable functions and clear separation of concerns  
- **Performance**: Minimal overhead with efficient DOM manipulation
- **Maintainability**: Consistent patterns that scale with the project

## File Organization
Following `DEVELOPMENT_GUIDE.md` structure:
```
script.js               # Main JavaScript file
├── Initialization     # DOM ready and setup
├── Navigation         # Mobile menu and routing logic
├── Form Handling      # User input validation and submission
├── Event Listeners    # Interactive element handlers
├── Data Management    # API calls and state handling
└── Utility Functions  # Reusable helper functions
```

## Code Structure Patterns

### Module Pattern
Use IIFE (Immediately Invoked Function Expression) to create modules:
```javascript
const WinzoApp = (function() {
    'use strict';
    
    // Private variables
    let currentSport = null;
    let userData = {};
    
    // Private methods
    function init() {
        setupEventListeners();
        loadInitialData();
    }
    
    // Public API
    return {
        init: init,
        // Other public methods
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', WinzoApp.init);
```

### Event Delegation
Per `03_Components_Vision.md`, use event delegation for dynamic content:
```javascript
// Single event listener for all buttons
document.addEventListener('click', function(e) {
    if (e.target.matches('.btn-primary')) {
        handlePrimaryAction(e);
    }
    if (e.target.matches('.nav-toggle')) {
        toggleMobileMenu(e);
    }
});
```

### State Management
Simple object-based state without external libraries:
```javascript
const AppState = {
    user: {
        isLoggedIn: false,
        preferences: {}
    },
    sports: {
        current: null,
        events: []
    },
    ui: {
        mobileMenuOpen: false,
        loading: false
    }
};
```

## Navigation System
Per `04_Layout_Vision.md`, implement responsive navigation:

### Mobile Menu Toggle
```javascript
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const isOpen = navMenu.classList.contains('nav-menu-open');
    
    navMenu.classList.toggle('nav-menu-open');
    AppState.ui.mobileMenuOpen = !isOpen;
    
    // Update aria attributes for accessibility
    document.querySelector('.nav-toggle')
        .setAttribute('aria-expanded', !isOpen);
}
```

### Authentication State Handling
```javascript
function updateNavigationForUser(isLoggedIn) {
    const authLinks = document.querySelectorAll('.auth-link');
    const guestLinks = document.querySelectorAll('.guest-link');
    
    if (isLoggedIn) {
        authLinks.forEach(link => link.style.display = 'block');
        guestLinks.forEach(link => link.style.display = 'none');
    } else {
        authLinks.forEach(link => link.style.display = 'none');
        guestLinks.forEach(link => link.style.display = 'block');
    }
}
```

## Form Handling
Per `03_Components_Vision.md`, implement consistent form validation:

### Input Validation
```javascript
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('.form-input');
    let isValid = true;
    
    inputs.forEach(input => {
        const errorElement = input.parentElement.querySelector('.form-error');
        
        if (!input.value.trim()) {
            showFieldError(input, 'This field is required');
            isValid = false;
        } else {
            clearFieldError(input);
        }
    });
    
    return isValid;
}

function showFieldError(input, message) {
    input.classList.add('form-input-error');
    let errorElement = input.parentElement.querySelector('.form-error');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        input.parentElement.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}
```

## API Integration
Future-ready patterns for backend integration per `01_Project_Vision.md`:

### Fetch Wrapper
```javascript
async function apiCall(endpoint, options = {}) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showErrorMessage('Unable to connect to server. Please try again.');
        throw error;
    }
}
```

### Sports Data Loading
Per `05_Sports_Page_Vision.md`, replace placeholder data:
```javascript
async function loadSportsEvents(sportType) {
    AppState.ui.loading = true;
    showLoadingSpinner();
    
    try {
        const events = await apiCall(`/sports/${sportType}/events`);
        renderSportsEvents(events);
        AppState.sports.events = events;
    } catch (error) {
        renderErrorState('Unable to load events');
    } finally {
        AppState.ui.loading = false;
        hideLoadingSpinner();
    }
}

function renderSportsEvents(events) {
    const eventsContainer = document.querySelector('.events-grid');
    
    eventsContainer.innerHTML = events.map(event => `
        <div class="event-card" data-event-id="${event.id}">
            <div class="event-time">${formatEventTime(event.startTime)}</div>
            <div class="event-teams">
                <span class="team">${event.homeTeam}</span>
                <span class="vs">vs</span>
                <span class="team">${event.awayTeam}</span>
            </div>
            <div class="event-odds">
                <button class="btn btn-outline odds-btn" data-bet-type="spread">
                    ${event.odds.spread}
                </button>
                <button class="btn btn-outline odds-btn" data-bet-type="total">
                    ${event.odds.total}
                </button>
                <button class="btn btn-outline odds-btn" data-bet-type="moneyline">
                    ${event.odds.moneyline}
                </button>
            </div>
        </div>
    `).join('');
}
```

## Error Handling
Consistent error handling patterns:

### Global Error Handler
```javascript
window.addEventListener('error', function(e) {
    console.error('Global Error:', e.error);
    showErrorMessage('Something went wrong. Please refresh the page.');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled Promise Rejection:', e.reason);
    showErrorMessage('Unable to complete request. Please try again.');
});
```

### User-Friendly Error Messages
```javascript
function showErrorMessage(message, duration = 5000) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-toast';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, duration);
}
```

## Performance Considerations
Per `DEVELOPMENT_GUIDE.md` principles:

### Debounced Input Handling
```javascript
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Usage for search inputs
const searchHandler = debounce(function(query) {
    performSearch(query);
}, 300);
```

### Efficient DOM Updates
```javascript
function updateMultipleElements(updates) {
    // Batch DOM updates to prevent layout thrashing
    const fragment = document.createDocumentFragment();
    
    updates.forEach(update => {
        const element = document.querySelector(update.selector);
        if (element) {
            element.textContent = update.content;
            fragment.appendChild(element.cloneNode(true));
        }
    });
    
    // Single DOM update
    document.body.appendChild(fragment);
}
```

## Code Quality Standards
Following `DEVELOPMENT_GUIDE.md` patterns:

### Consistent Naming
- Variables: camelCase (`currentUser`, `eventData`)
- Functions: camelCase verbs (`loadEvents`, `validateForm`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRY_ATTEMPTS`)
- CSS classes: kebab-case (`.event-card`, `.nav-menu`)

### Documentation
```javascript
/**
 * Loads and renders sports events for a specific sport
 * @param {string} sportType - The sport identifier (e.g., 'football', 'basketball')
 * @param {Object} options - Optional configuration
 * @param {boolean} options.showLoading - Whether to show loading spinner
 * @returns {Promise<Array>} Array of event objects
 */
async function loadSportsEvents(sportType, options = {}) {
    // Implementation
}
```

## Integration with Existing Architecture
This JavaScript architecture integrates seamlessly with:
- `02_Styling_Vision.md`: Uses CSS classes defined in style guide
- `03_Components_Vision.md`: Implements component interaction patterns
- `04_Layout_Vision.md`: Handles responsive navigation and layout
- `05_Sports_Page_Vision.md`: Manages sports data presentation
- `06_Deployment_Vision.md`: Ensures compatibility with static deployment

The vanilla JavaScript approach maintains the project's lightweight philosophy while providing a solid foundation for future enhancements and backend integration.
