const fs = require('fs').promises;
const path = require('path');

// In-memory event log storage
let eventLogs = [];

// Maximum number of events to keep in memory
const MAX_EVENTS = 1000;

// Event types
const EVENT_TYPES = {
    BET_PLACED: 'bet_placed',
    DEPOSIT: 'deposit',
    WITHDRAW: 'withdraw',
    LOGIN: 'login',
    REGISTER: 'register'
};

// Helper function to create event log entry
function createEventLog(eventType, user, additionalData = {}) {
    const event = {
        event: eventType,
        user: user?.email || user?.userId || 'unknown',
        timestamp: new Date().toISOString(),
        ...additionalData
    };
    
    return event;
}

// Helper function to add event to log
function addEventToLog(event) {
    // Add to in-memory storage
    eventLogs.unshift(event);
    
    // Keep only the most recent events
    if (eventLogs.length > MAX_EVENTS) {
        eventLogs = eventLogs.slice(0, MAX_EVENTS);
    }
    
    // Log to console for debugging
    console.log(`📊 Event logged: ${event.event} - ${event.user}`, event);
}

// Event tracking middleware factory
function createEventTracker(eventType, extractData = () => ({})) {
    return (req, res, next) => {
        // Store original response methods
        const originalJson = res.json;
        const originalSend = res.send;
        
        // Override res.json to capture successful responses
        res.json = function(data) {
            // Only log if the response indicates success
            if (data && (data.success === true || res.statusCode < 400)) {
                const user = req.user || {};
                const additionalData = extractData(req, data);
                const event = createEventLog(eventType, user, additionalData);
                addEventToLog(event);
            }
            
            // Call original method
            return originalJson.call(this, data);
        };
        
        // Override res.send for other response types
        res.send = function(data) {
            // Only log if the response indicates success
            if (res.statusCode < 400) {
                const user = req.user || {};
                const additionalData = extractData(req, data);
                const event = createEventLog(eventType, user, additionalData);
                addEventToLog(event);
            }
            
            // Call original method
            return originalSend.call(this, data);
        };
        
        next();
    };
}

// Specific event trackers
const betEventTracker = createEventTracker(EVENT_TYPES.BET_PLACED, (req, data) => ({
    amount: req.body?.stake,
    odds: req.body?.odds,
    match: req.body?.match,
    team: req.body?.team
}));

const depositEventTracker = createEventTracker(EVENT_TYPES.DEPOSIT, (req, data) => ({
    amount: req.body?.amount
}));

const withdrawEventTracker = createEventTracker(EVENT_TYPES.WITHDRAW, (req, data) => ({
    amount: req.body?.amount
}));

const loginEventTracker = createEventTracker(EVENT_TYPES.LOGIN, (req, data) => ({
    email: req.body?.email
}));

const registerEventTracker = createEventTracker(EVENT_TYPES.REGISTER, (req, data) => ({
    email: req.body?.email
}));

// Function to get recent events
function getRecentEvents(limit = 100) {
    return eventLogs.slice(0, limit);
}

// Function to get events by type
function getEventsByType(eventType, limit = 100) {
    return eventLogs
        .filter(event => event.event === eventType)
        .slice(0, limit);
}

// Function to get events by user
function getEventsByUser(userEmail, limit = 100) {
    return eventLogs
        .filter(event => event.user === userEmail)
        .slice(0, limit);
}

// Function to clear event logs
function clearEventLogs() {
    eventLogs = [];
    console.log('Event logs cleared');
}

module.exports = {
    EVENT_TYPES,
    betEventTracker,
    depositEventTracker,
    withdrawEventTracker,
    loginEventTracker,
    registerEventTracker,
    getRecentEvents,
    getEventsByType,
    getEventsByUser,
    clearEventLogs,
    addEventToLog,
    createEventLog
};


