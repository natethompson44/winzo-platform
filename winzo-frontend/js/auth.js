/**
 * Winzo Authentication System
 * Handles login, registration, and session management
 */

// Configuration
const AUTH_CONFIG = {
    INVITE_CODE: 'WINZO123',
    SESSION_KEY: 'winzo_session',
    DEMO_USERS: {
        'admin': 'winzo2024',
        'demo': 'demo123',
        'guest': 'guest123'
    }
};

// DOM Elements
let elements = {};

// Application State
let currentForm = 'login';
let isLoading = false;

/**
 * Initialize the authentication system
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeEventListeners();
    checkExistingSession();
    
    // Add entrance animation
    setTimeout(() => {
        document.querySelector('.auth-card').style.opacity = '1';
        document.querySelector('.auth-card').style.transform = 'translateY(0)';
    }, 100);
});

/**
 * Initialize DOM element references
 */
function initializeElements() {
    elements = {
        loginForm: document.getElementById('login-form'),
        registerForm: document.getElementById('register-form'),
        toggleForm: document.getElementById('toggle-form'),
        toggleMessage: document.getElementById('toggle-message'),
        authStatus: document.getElementById('auth-status'),
        forgotPassword: document.getElementById('forgot-password'),
        
        // Login form fields
        username: document.getElementById('username'),
        password: document.getElementById('password'),
        
        // Registration form fields
        regUsername: document.getElementById('reg-username'),
        regEmail: document.getElementById('reg-email'),
        regPassword: document.getElementById('reg-password'),
        inviteCode: document.getElementById('invite-code')
    };
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Form submissions
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegistration);
    
    // Form toggle
    elements.toggleForm.addEventListener('click', handleFormToggle);
    
    // Forgot password
    elements.forgotPassword.addEventListener('click', handleForgotPassword);
    
    // Real-time validation
    Object.values(elements).forEach(element => {
        if (element && element.tagName === 'INPUT') {
            element.addEventListener('blur', validateField);
            element.addEventListener('input', clearFieldError);
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Check for existing session
 */
function checkExistingSession() {
    const session = getSession();
    if (session && session.isValid) {
        // Redirect to main site
        redirectToMainSite();
    }
}

/**
 * Handle login form submission
 */
async function handleLogin(event) {
    event.preventDefault();
    
    if (isLoading) return;
    
    const formData = new FormData(elements.loginForm);
    const credentials = {
        username: formData.get('username').trim(),
        password: formData.get('password')
    };
    
    // Validate form
    if (!validateLoginForm(credentials)) {
        return;
    }
    
    setLoadingState(true);
    
    try {
        // Simulate API call delay
        await delay(1500);
        
        // Check credentials
        if (authenticateUser(credentials)) {
            showStatus('Welcome back! Redirecting...', 'success');
            
            // Create session
            createSession(credentials.username);
            
            // Redirect after delay
            setTimeout(() => {
                redirectToMainSite();
            }, 1000);
        } else {
            showStatus('Invalid credentials. Please try again.', 'error');
        }
    } catch (error) {
        showStatus('Authentication failed. Please try again.', 'error');
    } finally {
        setLoadingState(false);
    }
}

/**
 * Handle registration form submission
 */
async function handleRegistration(event) {
    event.preventDefault();
    
    if (isLoading) return;
    
    const formData = new FormData(elements.registerForm);
    const registrationData = {
        username: formData.get('username').trim(),
        email: formData.get('email').trim(),
        password: formData.get('password'),
        inviteCode: formData.get('inviteCode').trim()
    };
    
    // Validate form
    if (!validateRegistrationForm(registrationData)) {
        return;
    }
    
    setLoadingState(true);
    
    try {
        // Simulate API call delay
        await delay(2000);
        
        // Check invite code
        if (registrationData.inviteCode !== AUTH_CONFIG.INVITE_CODE) {
            showStatus('Invalid invitation code. Access is by invitation only.', 'error');
            return;
        }
        
        // Simulate successful registration
        showStatus('Access granted! Welcome to Winzo.', 'success');
        
        // Create session
        createSession(registrationData.username);
        
        // Redirect after delay
        setTimeout(() => {
            redirectToMainSite();
        }, 1500);
        
    } catch (error) {
        showStatus('Registration failed. Please try again.', 'error');
    } finally {
        setLoadingState(false);
    }
}

/**
 * Handle form toggle between login and registration
 */
function handleFormToggle(event) {
    event.preventDefault();
    
    if (currentForm === 'login') {
        // Switch to registration
        elements.loginForm.style.display = 'none';
        elements.registerForm.style.display = 'block';
        elements.toggleMessage.textContent = 'Already have access?';
        elements.toggleForm.textContent = 'Sign in';
        currentForm = 'register';
    } else {
        // Switch to login
        elements.registerForm.style.display = 'none';
        elements.loginForm.style.display = 'block';
        elements.toggleMessage.textContent = 'New to Winzo?';
        elements.toggleForm.textContent = 'Request invitation';
        currentForm = 'login';
    }
    
    // Clear any status messages
    hideStatus();
    
    // Clear form errors
    clearAllErrors();
    
    // Add transition effect
    const activeForm = currentForm === 'login' ? elements.loginForm : elements.registerForm;
    activeForm.style.opacity = '0';
    activeForm.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        activeForm.style.opacity = '1';
        activeForm.style.transform = 'translateY(0)';
    }, 100);
}

/**
 * Handle forgot password
 */
function handleForgotPassword(event) {
    event.preventDefault();
    showStatus('Please contact support for credential recovery.', 'warning');
}

/**
 * Validate login form
 */
function validateLoginForm(credentials) {
    let isValid = true;
    
    // Username validation
    if (!credentials.username) {
        showFieldError('username', 'Username is required');
        isValid = false;
    } else if (credentials.username.length < 3) {
        showFieldError('username', 'Username must be at least 3 characters');
        isValid = false;
    }
    
    // Password validation
    if (!credentials.password) {
        showFieldError('password', 'Password is required');
        isValid = false;
    } else if (credentials.password.length < 6) {
        showFieldError('password', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Validate registration form
 */
function validateRegistrationForm(data) {
    let isValid = true;
    
    // Username validation
    if (!data.username) {
        showFieldError('reg-username', 'Username is required');
        isValid = false;
    } else if (data.username.length < 3) {
        showFieldError('reg-username', 'Username must be at least 3 characters');
        isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
        showFieldError('reg-username', 'Username can only contain letters, numbers, and underscores');
        isValid = false;
    }
    
    // Email validation
    if (!data.email) {
        showFieldError('reg-email', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(data.email)) {
        showFieldError('reg-email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Password validation
    if (!data.password) {
        showFieldError('reg-password', 'Password is required');
        isValid = false;
    } else if (data.password.length < 8) {
        showFieldError('reg-password', 'Password must be at least 8 characters');
        isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
        showFieldError('reg-password', 'Password must contain uppercase, lowercase, and number');
        isValid = false;
    }
    
    // Invite code validation
    if (!data.inviteCode) {
        showFieldError('invite-code', 'Invitation code is required');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Validate individual field
 */
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    clearFieldError(field.id);
    
    switch (field.id) {
        case 'username':
        case 'reg-username':
            if (value && value.length < 3) {
                showFieldError(field.id, 'Username must be at least 3 characters');
            }
            break;
            
        case 'reg-email':
            if (value && !isValidEmail(value)) {
                showFieldError(field.id, 'Please enter a valid email address');
            }
            break;
            
        case 'password':
            if (value && value.length < 6) {
                showFieldError(field.id, 'Password must be at least 6 characters');
            }
            break;
            
        case 'reg-password':
            if (value && value.length < 8) {
                showFieldError(field.id, 'Password must be at least 8 characters');
            }
            break;
    }
}

/**
 * Authenticate user credentials
 */
function authenticateUser(credentials) {
    // Check against demo users
    return AUTH_CONFIG.DEMO_USERS[credentials.username] === credentials.password;
}

/**
 * Create user session
 */
function createSession(username) {
    const session = {
        username: username,
        loginTime: Date.now(),
        isValid: true,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(session));
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
 * Redirect to main site
 */
function redirectToMainSite() {
    // Add exit animation
    document.querySelector('.auth-card').style.opacity = '0';
    document.querySelector('.auth-card').style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

/**
 * Show field error
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + '-error');
    
    if (field && errorElement) {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

/**
 * Clear field error
 */
function clearFieldError(fieldId) {
    const field = typeof fieldId === 'string' ? document.getElementById(fieldId) : fieldId;
    if (!field) return;
    
    const errorElement = document.getElementById(field.id + '-error');
    
    if (field && errorElement) {
        field.classList.remove('error');
        field.setAttribute('aria-invalid', 'false');
        errorElement.classList.remove('show');
    }
}

/**
 * Clear all form errors
 */
function clearAllErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    const inputElements = document.querySelectorAll('.form-input');
    
    errorElements.forEach(element => {
        element.classList.remove('show');
    });
    
    inputElements.forEach(element => {
        element.classList.remove('error');
        element.setAttribute('aria-invalid', 'false');
    });
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
    elements.authStatus.textContent = message;
    elements.authStatus.className = `auth-status show ${type}`;
    
    // Auto-hide success messages
    if (type === 'success') {
        setTimeout(() => {
            hideStatus();
        }, 3000);
    }
    
    // Announce to screen readers
    elements.authStatus.setAttribute('aria-live', 'polite');
}

/**
 * Hide status message
 */
function hideStatus() {
    elements.authStatus.classList.remove('show');
}

/**
 * Set loading state
 */
function setLoadingState(loading) {
    isLoading = loading;
    
    const submitButtons = document.querySelectorAll('button[type="submit"]');
    submitButtons.forEach(button => {
        button.disabled = loading;
        if (loading) {
            button.classList.add('loading');
        } else {
            button.classList.remove('loading');
        }
    });
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
    // Escape key to clear status
    if (event.key === 'Escape') {
        hideStatus();
    }
    
    // Enter key on form toggle
    if (event.key === 'Enter' && event.target === elements.toggleForm) {
        event.preventDefault();
        elements.toggleForm.click();
    }
}

/**
 * Utility Functions
 */

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Security Functions
 */

// Prevent form submission via console
Object.defineProperty(window, 'AUTH_CONFIG', {
    value: AUTH_CONFIG,
    writable: false,
    configurable: false
});

// Clear sensitive data on page unload
window.addEventListener('beforeunload', function() {
    // Clear any temporary data
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const passwordFields = form.querySelectorAll('input[type="password"]');
        passwordFields.forEach(field => {
            field.value = '';
        });
    });
});

// Prevent right-click context menu (optional security measure)
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

// Disable text selection for security
document.addEventListener('selectstart', function(event) {
    if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();
    }
});

/**
 * Export functions for testing (if needed)
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        authenticateUser,
        validateLoginForm,
        validateRegistrationForm,
        isValidEmail
    };
}

