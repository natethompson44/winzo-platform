/**
 * Winzo Sports Betting Platform - Main JavaScript
 * Handles navigation, betting interactions, and responsive behavior
 */

// Authentication Configuration
const AUTH_CONFIG = {
    SESSION_KEY: 'winzo_session'
};

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!checkAuthentication()) {
        redirectToLogin();
        return;
    }
    
    initializeApp();
});

/**
 * Check if user is authenticated
 */
function checkAuthentication() {
    try {
        const sessionData = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);
        if (!sessionData) return false;
        
        const session = JSON.parse(sessionData);
        
        // Check if session is expired
        if (Date.now() > session.expiresAt) {
            localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
            return false;
        }
        
        return session.isValid;
    } catch (error) {
        localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
        return false;
    }
}

/**
 * Redirect to login page
 */
function redirectToLogin() {
    window.location.href = 'login.html';
}

/**
 * Logout user
 */
function logout() {
    localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
    redirectToLogin();
}

/**
 * Initialize the application
 */
function initializeApp() {
    updateNavigationForAuth();
    fetchUserProfile(); // Fetch user profile and balance
    initNavigation();
    initBettingInteractions();
    initResponsiveBehavior();
    initAccessibility();
    
    // Add fade-in animation to main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.classList.add('fade-in');
    }
}

/**
 * Update navigation based on authentication status
 */
function updateNavigationForAuth() {
    const session = getSession();
    if (session) {
        // Hide guest links
        const guestLinks = document.querySelectorAll('.guest-link');
        guestLinks.forEach(link => {
            link.style.display = 'none';
        });
        
        // Show auth links
        const authLinks = document.querySelectorAll('.auth-link');
        authLinks.forEach(link => {
            link.style.display = 'block';
        });
        
        // Add logout functionality
        const logoutLink = document.querySelector('.auth-link[href="#"]:last-child');
        if (logoutLink && logoutLink.textContent.includes('Logout')) {
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
        
        // Update welcome message if element exists
        const welcomeElement = document.getElementById('user-welcome');
        if (welcomeElement) {
            welcomeElement.textContent = `Welcome, ${session.username}`;
        }
    }
}

/**
 * Get current session
 */
function getSession() {
    try {
        const sessionData = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);
        if (!sessionData) return null;
        
        const session = JSON.parse(sessionData);
        
        // Check if session is expired
        if (Date.now() > session.expiresAt) {
            localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
            return null;
        }
        
        return session;
    } catch (error) {
        localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
        return null;
    }
}

/**
 * Fetch user profile and wallet balance from backend
 */
async function fetchUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
                const user = result.data;
                
                // Update user balance display
                const balanceElement = document.getElementById('user-balance');
                if (balanceElement && user.wallet_balance !== undefined) {
                    balanceElement.textContent = '$' + parseFloat(user.wallet_balance).toFixed(2);
                }
                
                // Update welcome message
                const welcomeElement = document.getElementById('user-welcome');
                if (welcomeElement) {
                    welcomeElement.textContent = `Welcome, ${user.username || user.name}`;
                }
                
                // Store updated user data
                localStorage.setItem('user', JSON.stringify(user));
            }
        } else if (response.status === 401) {
            // Token expired or invalid, redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
            redirectToLogin();
        }
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Continue with cached user data if available
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
            try {
                const user = JSON.parse(cachedUser);
                const balanceElement = document.getElementById('user-balance');
                if (balanceElement && user.wallet_balance !== undefined) {
                    balanceElement.textContent = '$' + parseFloat(user.wallet_balance).toFixed(2);
                }
            } catch (parseError) {
                console.error('Error parsing cached user data:', parseError);
            }
        }
    }
}

/**
 * Navigation functionality
 */
function initNavigation() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburgerMenu && navMenu) {
        hamburgerMenu.addEventListener('click', function() {
            const isOpen = navMenu.classList.contains('nav-menu-open');
            
            if (isOpen) {
                closeNavMenu();
            } else {
                openNavMenu();
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!hamburgerMenu.contains(event.target) && !navMenu.contains(event.target)) {
                closeNavMenu();
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeNavMenu();
            }
        });
        
        // Close menu when clicking nav links on mobile
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 767) {
                    closeNavMenu();
                }
            });
        });
    }
}

function openNavMenu() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    navMenu.classList.add('nav-menu-open');
    hamburgerMenu.setAttribute('aria-expanded', 'true');
    
    // Animate hamburger lines
    const lines = hamburgerMenu.querySelectorAll('.hamburger-line');
    lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    lines[1].style.opacity = '0';
    lines[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    
    // Focus first nav link
    const firstNavLink = navMenu.querySelector('.nav-link');
    if (firstNavLink) {
        firstNavLink.focus();
    }
}

function closeNavMenu() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    navMenu.classList.remove('nav-menu-open');
    hamburgerMenu.setAttribute('aria-expanded', 'false');
    
    // Reset hamburger lines
    const lines = hamburgerMenu.querySelectorAll('.hamburger-line');
    lines[0].style.transform = '';
    lines[1].style.opacity = '';
    lines[2].style.transform = '';
}

/**
 * Betting interactions
 */
function initBettingInteractions() {
    // Load real sports data if we're on a sports page
    loadSportsData();
    
    const eventCards = document.querySelectorAll('.event-card');
    
    eventCards.forEach(card => {
        const betButtons = card.querySelectorAll('.bet-actions .btn');
        const oddsButtons = card.querySelectorAll('.odds-value');
        
        // Bet action buttons
        betButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const eventId = card.dataset.eventId;
                const action = this.textContent.trim();
                
                if (action === 'Bet Now') {
                    handleQuickBet(eventId, card);
                } else if (action === 'Add to Slip') {
                    handleAddToSlip(eventId, card);
                }
            });
        });
        
        // Odds buttons
        oddsButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const eventId = card.dataset.eventId;
                const oddsValue = this.textContent.trim();
                const betType = this.closest('.odds-column').querySelector('h5').textContent;
                const teamName = this.closest('.odds-row').querySelector('.team-name').textContent;
                
                handleOddsClick(eventId, betType, teamName, oddsValue, this);
            });
        });
    });
    
    // Initialize bet slip functionality
    initBetSlip();
}

async function handleQuickBet(eventId, cardElement) {
    // Show loading state
    showBettingFeedback(cardElement, 'Processing bet...', 'info');
    
    const token = localStorage.getItem('token');
    if (!token) {
        showBettingFeedback(cardElement, 'Please log in to place bets', 'error');
        return;
    }
    
    // Get default bet amount (could be made configurable)
    const defaultAmount = 10;
    
    // Find the first available odds for quick bet
    const oddsButton = cardElement.querySelector('.odds-value:not([disabled])');
    if (!oddsButton) {
        showBettingFeedback(cardElement, 'No odds available', 'error');
        return;
    }
    
    const betType = oddsButton.closest('.odds-column').querySelector('h5').textContent.toLowerCase();
    const teamName = oddsButton.closest('.odds-row').querySelector('.team-name').textContent;
    const oddsValue = oddsButton.textContent.trim();
    
    try {
        const response = await fetch('/api/sportsEnhanced/place-bet', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                eventId: eventId,
                amount: defaultAmount,
                market: betType,
                outcome: teamName,
                odds: oddsValue
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            showBettingFeedback(cardElement, `Bet placed successfully! $${defaultAmount} on ${teamName}`, 'success');
            
            // Update UI to show bet was placed
            const betButtons = cardElement.querySelectorAll('.bet-actions .btn');
            betButtons.forEach(btn => {
                if (btn.textContent.trim() === 'Bet Now') {
                    btn.textContent = 'Bet Placed';
                    btn.disabled = true;
                }
            });
            
            // Refresh user balance
            fetchUserProfile();
        } else {
            showBettingFeedback(cardElement, result.message || 'Bet placement failed', 'error');
        }
    } catch (error) {
        console.error('Bet placement error:', error);
        // Fallback to demo behavior
        setTimeout(() => {
            showBettingFeedback(cardElement, 'Bet placed successfully! (Demo mode)', 'success');
            
            const betButtons = cardElement.querySelectorAll('.bet-actions .btn');
            betButtons.forEach(btn => {
                if (btn.textContent.trim() === 'Bet Now') {
                    btn.textContent = 'Bet Placed';
                    btn.disabled = true;
                }
            });
        }, 1000);
    }
}

function handleAddToSlip(eventId, cardElement) {
    showBettingFeedback(cardElement, 'Added to bet slip!', 'success');
    
    // Update bet slip UI
    updateBetSlipUI();
}

function handleOddsClick(eventId, betType, teamName, oddsValue, buttonElement) {
    // Visual feedback
    buttonElement.style.backgroundColor = 'var(--primary)';
    buttonElement.style.color = 'var(--text-light)';
    
    // Reset after animation
    setTimeout(() => {
        buttonElement.style.backgroundColor = '';
        buttonElement.style.color = '';
    }, 200);
    
    // Add to bet slip
    addToBetSlip({
        eventId,
        betType,
        teamName,
        oddsValue,
        selection: `${teamName} ${betType} ${oddsValue}`
    });
    
    showNotification(`Added ${teamName} ${betType} to bet slip`, 'success');
}

function showBettingFeedback(cardElement, message, type) {
    // Remove existing feedback
    const existingFeedback = cardElement.querySelector('.betting-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = `betting-feedback betting-feedback-${type}`;
    feedback.textContent = message;
    feedback.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        z-index: 10;
        animation: fadeIn 0.3s ease;
    `;
    
    // Set colors based on type
    if (type === 'success') {
        feedback.style.backgroundColor = 'var(--success)';
        feedback.style.color = 'var(--text-light)';
    } else if (type === 'info') {
        feedback.style.backgroundColor = 'var(--info)';
        feedback.style.color = 'var(--text-light)';
    }
    
    // Make card relative positioned
    cardElement.style.position = 'relative';
    
    // Add feedback
    cardElement.appendChild(feedback);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.remove();
        }
    }, 3000);
}

/**
 * Bet Slip functionality
 */
let betSlipItems = [];

function initBetSlip() {
    updateBetSlipUI();
}

function addToBetSlip(bet) {
    // Check if bet already exists
    const existingIndex = betSlipItems.findIndex(item => 
        item.eventId === bet.eventId && 
        item.betType === bet.betType && 
        item.teamName === bet.teamName
    );
    
    if (existingIndex === -1) {
        betSlipItems.push(bet);
        updateBetSlipUI();
    }
}

function removeBetFromSlip(index) {
    betSlipItems.splice(index, 1);
    updateBetSlipUI();
}

function updateBetSlipUI() {
    const betSlipWidget = document.querySelector('.bet-slip-widget');
    if (!betSlipWidget) return;
    
    const emptyState = betSlipWidget.querySelector('.bet-slip-empty');
    
    if (betSlipItems.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        
        // Remove bet slip items container if it exists
        const itemsContainer = betSlipWidget.querySelector('.bet-slip-items');
        if (itemsContainer) {
            itemsContainer.remove();
        }
    } else {
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        // Create or update bet slip items
        let itemsContainer = betSlipWidget.querySelector('.bet-slip-items');
        if (!itemsContainer) {
            itemsContainer = document.createElement('div');
            itemsContainer.className = 'bet-slip-items';
            betSlipWidget.appendChild(itemsContainer);
        }
        
        itemsContainer.innerHTML = betSlipItems.map((bet, index) => `
            <div class="bet-slip-item">
                <div class="bet-selection">${bet.selection}</div>
                <button class="remove-bet" onclick="removeBetFromSlip(${index})" aria-label="Remove bet">×</button>
            </div>
        `).join('');
        
        // Add styles for bet slip items
        if (!document.querySelector('#bet-slip-styles')) {
            const styles = document.createElement('style');
            styles.id = 'bet-slip-styles';
            styles.textContent = `
                .bet-slip-items {
                    margin-top: var(--spacing-md);
                }
                
                .bet-slip-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--spacing-sm);
                    margin-bottom: var(--spacing-xs);
                    background: var(--white);
                    border: 1px solid var(--gray);
                    border-radius: 4px;
                    font-size: var(--font-size-sm);
                }
                
                .bet-selection {
                    flex: 1;
                    color: var(--text-primary);
                }
                
                .remove-bet {
                    background: none;
                    border: none;
                    color: var(--error);
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .remove-bet:hover {
                    background-color: var(--error);
                    color: var(--text-light);
                    border-radius: 50%;
                }
            `;
            document.head.appendChild(styles);
        }
    }
}

/**
 * Responsive behavior
 */
function initResponsiveBehavior() {
    // Handle window resize
    window.addEventListener('resize', function() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 767) {
            closeNavMenu();
        }
        
        // Update layout calculations if needed
        updateLayoutCalculations();
    });
    
    // Initial layout calculations
    updateLayoutCalculations();
}

function updateLayoutCalculations() {
    // Update any dynamic layout calculations here
    // For example, sticky sidebar positioning
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && window.innerWidth > 1023) {
        // Calculate proper sticky positioning
        const header = document.querySelector('.header');
        const headerHeight = header ? header.offsetHeight : 0;
        sidebar.style.top = `calc(${headerHeight}px + var(--spacing-xl))`;
    }
}

/**
 * Accessibility enhancements
 */
function initAccessibility() {
    // Keyboard navigation for custom elements
    const customButtons = document.querySelectorAll('.odds-value, .sport-card, .event-card');
    
    customButtons.forEach(element => {
        // Make focusable if not already
        if (!element.hasAttribute('tabindex')) {
            element.setAttribute('tabindex', '0');
        }
        
        // Handle keyboard activation
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Announce dynamic content changes to screen readers
    createAriaLiveRegion();
    
    // Focus management for modal-like interactions
    initFocusManagement();
}

function createAriaLiveRegion() {
    if (!document.querySelector('#aria-live-region')) {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(liveRegion);
    }
}

function announceToScreenReader(message) {
    const liveRegion = document.querySelector('#aria-live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}

function initFocusManagement() {
    // Store the last focused element before opening mobile menu
    let lastFocusedElement = null;
    
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', function() {
            const navMenu = document.querySelector('.nav-menu');
            const isOpening = !navMenu.classList.contains('nav-menu-open');
            
            if (isOpening) {
                lastFocusedElement = document.activeElement;
            } else if (lastFocusedElement) {
                lastFocusedElement.focus();
                lastFocusedElement = null;
            }
        });
    }
}

/**
 * Notification system
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 4px;
        font-weight: 500;
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    // Set colors based on type
    if (type === 'success') {
        notification.style.backgroundColor = 'var(--success)';
        notification.style.color = 'var(--text-light)';
    } else if (type === 'error') {
        notification.style.backgroundColor = 'var(--error)';
        notification.style.color = 'var(--text-light)';
    } else {
        notification.style.backgroundColor = 'var(--info)';
        notification.style.color = 'var(--text-light)';
    }
    
    // Add animation styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Announce to screen readers
    announceToScreenReader(message);
    
    // Auto remove
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, duration);
}

/**
 * Sports Data Loading
 */

// Sport key mapping from UI names to backend sport keys
const sportKeyMap = {
    football: 'americanfootball_nfl',
    nfl: 'americanfootball_nfl',
    basketball: 'basketball_nba',
    nba: 'basketball_nba',
    baseball: 'baseball_mlb',
    mlb: 'baseball_mlb',
    nhl: 'icehockey_nhl',
    soccer: 'soccer_epl',
    tennis: 'tennis_atp',
    golf: 'golf',
    ufc: 'boxing'
};

/**
 * Convert decimal odds to American format
 */
function decimalToAmerican(decimal) {
    decimal = parseFloat(decimal);
    if (isNaN(decimal)) return null;
    return decimal >= 2
        ? '+' + Math.round((decimal - 1) * 100)
        : Math.round(-100 / (decimal - 1));
}

/**
 * Load sports data for the current page
 */
function loadSportsData() {
    // Determine current sport from page URL or body class
    const currentSport = getCurrentSport();
    if (currentSport) {
        loadGames(currentSport);
    }
}

/**
 * Get current sport from page context
 */
function getCurrentSport() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().split('.')[0];
    
    // Map filename to sport
    const sportMap = {
        'football': 'football',
        'basketball': 'basketball', 
        'baseball': 'baseball'
    };
    
    return sportMap[filename] || null;
}

/**
 * Load games for a specific sport
 */
async function loadGames(sport) {
    const gamesContainer = document.querySelector('.events-grid');
    if (!gamesContainer) return;
    
    // Show loading state
    gamesContainer.innerHTML = '<div class="loading-container"><i class="fa fa-spinner fa-spin fa-2x"></i><p>Loading games...</p></div>';
    
    const token = localStorage.getItem('token');
    const sportKey = sportKeyMap[sport] || sport;
    
    try {
        const response = await fetch(`/api/sportsEnhanced/${sportKey}/events`, {
            method: 'GET',
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.success && result.data && result.data.events) {
                const events = result.data.events;
                const games = transformEventsToGames(events, sport);
                displayGames(games, gamesContainer);
            } else {
                showNoGamesMessage(gamesContainer);
            }
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Failed to load games:', error);
        // Fallback to placeholder data
        showNoGamesMessage(gamesContainer, 'Failed to load games. Please try again later.');
    }
}

/**
 * Transform backend events to game format
 */
function transformEventsToGames(events, sport) {
    return events.map(event => {
        const h2h = event.markets?.h2h || [];
        const spreads = event.markets?.spread || [];
        const totals = event.markets?.totals || [];
        
        return {
            id: event.id,
            sport: sport,
            team1: event.homeTeam || event.home_team,
            team2: event.awayTeam || event.away_team,
            time: event.commenceTime || event.commence_time,
            moneyline1: h2h[0] ? decimalToAmerican(h2h[0].decimalPrice || h2h[0].price) : null,
            moneyline2: h2h[1] ? decimalToAmerican(h2h[1].decimalPrice || h2h[1].price) : null,
            spread1: spreads[0] ? decimalToAmerican(spreads[0].decimalPrice || spreads[0].price) : null,
            spread2: spreads[1] ? decimalToAmerican(spreads[1].decimalPrice || spreads[1].price) : null,
            spreadLine: spreads[0] ? spreads[0].point : null,
            totalOver: totals[0] ? decimalToAmerican(totals[0].decimalPrice || totals[0].price) : null,
            totalUnder: totals[1] ? decimalToAmerican(totals[1].decimalPrice || totals[1].price) : null,
            totalLine: totals[0] ? totals[0].point : null
        };
    });
}

/**
 * Display games in the UI
 */
function displayGames(games, container) {
    if (games.length === 0) {
        showNoGamesMessage(container);
        return;
    }
    
    const gamesHTML = games.map(game => createGameHTML(game)).join('');
    container.innerHTML = gamesHTML;
    
    // Re-initialize event listeners for new content
    initBettingInteractionsForNewContent();
}

/**
 * Create HTML for a single game
 */
function createGameHTML(game) {
    const gameTime = new Date(game.time);
    const isLive = gameTime <= new Date();
    const status = isLive ? 'live' : 'upcoming';
    const statusText = isLive ? 'Live' : 'Upcoming';
    
    return `
        <div class="event-card" data-event-id="${game.id}" role="article">
            <div class="event-header">
                <div class="event-date">
                    <span class="date">${formatGameDate(gameTime)}</span>
                    <span class="time">${formatGameTime(gameTime)}</span>
                </div>
                <div class="event-status ${status}">${statusText}</div>
            </div>

            <div class="teams-section">
                <div class="team team-home">
                    <div class="team-logo">
                        <div class="logo-placeholder">${game.team1.charAt(0)}</div>
                    </div>
                    <div class="team-info">
                        <h4>${game.team1}</h4>
                    </div>
                </div>

                <div class="vs-section">
                    <span class="vs-text">VS</span>
                </div>

                <div class="team team-away">
                    <div class="team-info">
                        <h4>${game.team2}</h4>
                    </div>
                    <div class="team-logo">
                        <div class="logo-placeholder">${game.team2.charAt(0)}</div>
                    </div>
                </div>
            </div>

            <div class="odds-section" role="group" aria-label="Betting odds">
                <div class="odds-grid">
                    ${createOddsColumnHTML('Spread', [
                        { name: game.team1, value: game.spreadLine ? `${game.spreadLine > 0 ? '+' : ''}${game.spreadLine}` : '-', odds: game.spread1 },
                        { name: game.team2, value: game.spreadLine ? `${game.spreadLine > 0 ? '-' : '+'}${Math.abs(game.spreadLine)}` : '-', odds: game.spread2 }
                    ])}
                    
                    ${createOddsColumnHTML('Total', [
                        { name: 'Over', value: game.totalLine || '-', odds: game.totalOver },
                        { name: 'Under', value: game.totalLine || '-', odds: game.totalUnder }
                    ])}
                    
                    ${createOddsColumnHTML('Moneyline', [
                        { name: game.team1, value: '', odds: game.moneyline1 },
                        { name: game.team2, value: '', odds: game.moneyline2 }
                    ])}
                </div>
                
                <div class="bet-actions">
                    <button class="btn btn-primary btn-small">Bet Now</button>
                    <button class="btn btn-outline btn-small">Add to Slip</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Create HTML for odds column
 */
function createOddsColumnHTML(title, odds) {
    return `
        <div class="odds-column">
            <h5>${title}</h5>
            ${odds.map(odd => `
                <div class="odds-row">
                    <span class="team-name">${odd.name}</span>
                    <button class="odds-value" ${odd.odds ? `aria-label="${odd.name} ${title} ${odd.odds}"` : 'disabled'}>
                        ${odd.value} ${odd.odds || ''}
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Format game date
 */
function formatGameDate(date) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
}

/**
 * Format game time
 */
function formatGameTime(date) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/**
 * Show no games message
 */
function showNoGamesMessage(container, message = 'No games available') {
    container.innerHTML = `<div class="loading-container">${message}</div>`;
}

/**
 * Initialize betting interactions for newly loaded content
 */
function initBettingInteractionsForNewContent() {
    const eventCards = document.querySelectorAll('.event-card');
    
    eventCards.forEach(card => {
        const betButtons = card.querySelectorAll('.bet-actions .btn');
        const oddsButtons = card.querySelectorAll('.odds-value');
        
        // Remove existing listeners to avoid duplicates
        betButtons.forEach(button => {
            button.replaceWith(button.cloneNode(true));
        });
        
        oddsButtons.forEach(button => {
            button.replaceWith(button.cloneNode(true));
        });
        
        // Re-add listeners
        const newBetButtons = card.querySelectorAll('.bet-actions .btn');
        const newOddsButtons = card.querySelectorAll('.odds-value');
        
        newBetButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const eventId = card.dataset.eventId;
                const action = this.textContent.trim();
                
                if (action === 'Bet Now') {
                    handleQuickBet(eventId, card);
                } else if (action === 'Add to Slip') {
                    handleAddToSlip(eventId, card);
                }
            });
        });
        
        newOddsButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const eventId = card.dataset.eventId;
                const oddsValue = this.textContent.trim();
                const betType = this.closest('.odds-column').querySelector('h5').textContent;
                const teamName = this.closest('.odds-row').querySelector('.team-name').textContent;
                
                handleOddsClick(eventId, betType, teamName, oddsValue, this);
            });
        });
    });
}

/**
 * Real-time odds updates simulation
 */
function initRealTimeUpdates() {
    // Simulate real-time odds updates every 30 seconds
    setInterval(() => {
        updateRandomOdds();
    }, 30000);
}

function updateRandomOdds() {
    const oddsValues = document.querySelectorAll('.odds-value');
    if (oddsValues.length === 0) return;
    
    // Update a random odds value
    const randomIndex = Math.floor(Math.random() * oddsValues.length);
    const oddsElement = oddsValues[randomIndex];
    
    // Add updating animation
    oddsElement.classList.add('odds-updating');
    
    // Simulate new odds value
    setTimeout(() => {
        const currentValue = parseFloat(oddsElement.textContent);
        const change = (Math.random() - 0.5) * 2; // Random change between -1 and 1
        const newValue = Math.max(1, currentValue + change).toFixed(1);
        
        oddsElement.textContent = newValue;
        oddsElement.classList.remove('odds-updating');
        
        // Add flash effect
        oddsElement.style.backgroundColor = 'var(--warning)';
        oddsElement.style.color = 'var(--text-primary)';
        
        setTimeout(() => {
            oddsElement.style.backgroundColor = '';
            oddsElement.style.color = '';
        }, 1000);
        
    }, 500);
}

// Add odds updating animation styles
if (!document.querySelector('#odds-animation-styles')) {
    const styles = document.createElement('style');
    styles.id = 'odds-animation-styles';
    styles.textContent = `
        .odds-updating {
            animation: pulse 0.5s ease-in-out;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
    `;
    document.head.appendChild(styles);
}

/**
 * Form validation and security
 */
function initFormSecurity() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Type-specific validation
    if (value && fieldType === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    if (value && fieldType === 'number') {
        if (isNaN(value) || parseFloat(value) < 0) {
            isValid = false;
            errorMessage = 'Please enter a valid positive number';
        }
    }
    
    // Update field appearance
    field.classList.toggle('error', !isValid);
    field.setAttribute('aria-invalid', !isValid);
    
    // Show/hide error message
    showFieldError(field, isValid ? '' : errorMessage);
    
    return isValid;
}

function showFieldError(field, message) {
    const fieldGroup = field.closest('.form-group') || field.parentNode;
    let errorElement = fieldGroup.querySelector('.form-error');
    
    if (message) {
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            errorElement.setAttribute('role', 'alert');
            fieldGroup.appendChild(errorElement);
        }
        errorElement.textContent = message;
        field.setAttribute('aria-describedby', errorElement.id || 'error-' + field.id);
    } else if (errorElement) {
        errorElement.remove();
        field.removeAttribute('aria-describedby');
    }
}

// Initialize real-time updates and form security when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initRealTimeUpdates();
    initFormSecurity();
});

// Export functions for global access
window.removeBetFromSlip = removeBetFromSlip;
window.showNotification = showNotification;

