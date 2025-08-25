// ========================================
// WINZO SPORTS BETTING PLATFORM
// JavaScript Functionality
// ========================================

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    console.log('Winzo Sports Betting Platform loaded successfully');
    
    // Initialize all functionality
    initMobileNavigation();
    initButtonInteractions();
    initFormValidation();
    initAccessibilityFeatures();
});

// ========================================
// MOBILE NAVIGATION
// ========================================

function initMobileNavigation() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburgerMenu && navMenu) {
        hamburgerMenu.addEventListener('click', function() {
            // Toggle navigation menu visibility
            const isVisible = navMenu.style.display === 'flex';
            
            if (isVisible) {
                navMenu.style.display = 'none';
                hamburgerMenu.setAttribute('aria-expanded', 'false');
            } else {
                navMenu.style.display = 'flex';
                hamburgerMenu.setAttribute('aria-expanded', 'true');
            }
            
            // Animate hamburger icon
            animateHamburgerIcon();
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!hamburgerMenu.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.style.display = 'none';
                hamburgerMenu.setAttribute('aria-expanded', 'false');
                resetHamburgerIcon();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                navMenu.style.display = 'flex';
                hamburgerMenu.setAttribute('aria-expanded', 'false');
                resetHamburgerIcon();
            } else {
                navMenu.style.display = 'none';
                hamburgerMenu.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

function animateHamburgerIcon() {
    const spans = document.querySelectorAll('.hamburger-menu span');
    
    if (spans.length === 3) {
        // Animate to X
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
    }
}

function resetHamburgerIcon() {
    const spans = document.querySelectorAll('.hamburger-menu span');
    
    if (spans.length === 3) {
        // Reset to hamburger
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
}

// ========================================
// BUTTON INTERACTIONS
// ========================================

function initButtonInteractions() {
    // Add loading states to buttons
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Prevent multiple rapid clicks
            if (button.classList.contains('loading')) {
                e.preventDefault();
                return;
            }
            
            // Add loading state for primary buttons
            if (button.classList.contains('btn-primary') && !button.disabled) {
                addLoadingState(button);
            }
        });
    });
    
    // Handle disabled button states
    const disabledButtons = document.querySelectorAll('.btn:disabled');
    disabledButtons.forEach(button => {
        button.setAttribute('aria-disabled', 'true');
    });
}

function addLoadingState(button) {
    const originalText = button.textContent;
    
    button.classList.add('loading');
    button.disabled = true;
    button.innerHTML = '<span class="loading-spinner"></span> Loading...';
    
    // Simulate loading (remove in production)
    setTimeout(() => {
        button.classList.remove('loading');
        button.disabled = false;
        button.textContent = originalText;
    }, 2000);
}

// ========================================
// FORM VALIDATION
// ========================================

function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(form)) {
                // Form is valid, proceed with submission
                handleFormSubmission(form);
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(input);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(input);
            });
        });
    });
}

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(input) {
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (input.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (input.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Password validation
    if (input.type === 'password' && value) {
        if (value.length < 6) {
            isValid = false;
            errorMessage = 'Password must be at least 6 characters long';
        }
    }
    
    if (!isValid) {
        showFieldError(input, errorMessage);
    } else {
        clearFieldError(input);
    }
    
    return isValid;
}

function showFieldError(input, message) {
    // Remove existing error
    clearFieldError(input);
    
    // Add error class
    input.classList.add('error');
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = 'var(--error)';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';
    
    // Insert after input
    input.parentNode.appendChild(errorDiv);
}

function clearFieldError(input) {
    input.classList.remove('error');
    
    const errorDiv = input.parentNode.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function handleFormSubmission(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    
    if (submitButton) {
        addLoadingState(submitButton);
    }
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        if (submitButton) {
            submitButton.classList.remove('loading');
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        }
        
        // Show success message
        showSuccessMessage(form, 'Form submitted successfully!');
        
        // Reset form
        setTimeout(() => {
            form.reset();
        }, 1000);
    }, 2000);
}

function showSuccessMessage(form, message) {
    // Remove existing messages
    const existingMessage = form.querySelector('.success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.color = 'var(--accent)';
    successDiv.style.fontSize = '1rem';
    successDiv.style.marginTop = '1rem';
    successDiv.style.textAlign = 'center';
    successDiv.style.padding = '0.5rem';
    successDiv.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
    successDiv.style.borderRadius = '4px';
    
    form.appendChild(successDiv);
}

// ========================================
// ACCESSIBILITY FEATURES
// ========================================

function initAccessibilityFeatures() {
    // Add skip to main content link
    addSkipToMainLink();
    
    // Add focus indicators
    addFocusIndicators();
    
    // Handle keyboard navigation
    handleKeyboardNavigation();
}

function addSkipToMainLink() {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary);
        color: var(--text-light);
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1001;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

function addFocusIndicators() {
    // Add focus-visible class for better focus management
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    
    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });
}

function handleKeyboardNavigation() {
    // Handle escape key to close mobile menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const navMenu = document.querySelector('.nav-menu');
            const hamburgerMenu = document.querySelector('.hamburger-menu');
            
            if (navMenu && hamburgerMenu && window.innerWidth <= 768) {
                navMenu.style.display = 'none';
                hamburgerMenu.setAttribute('aria-expanded', 'false');
                resetHamburgerIcon();
                hamburgerMenu.focus();
            }
        }
    });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Debounce function for performance
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

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ========================================
// EVENT LISTENERS FOR SPORTS TEMPLATE
// ========================================

// Initialize sports template specific functionality
function initSportsTemplate() {
    const eventCards = document.querySelectorAll('.event-card');
    
    if (eventCards.length > 0) {
        eventCards.forEach(card => {
            // Add click handlers for bet buttons
            const betButtons = card.querySelectorAll('.btn');
            betButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    if (this.textContent.includes('Bet Now')) {
                        handleBetNowClick(card);
                    } else if (this.textContent.includes('Add to Slip')) {
                        handleAddToSlipClick(card);
                    }
                });
            });
        });
    }
}

function handleBetNowClick(card) {
    const teamNames = card.querySelectorAll('.team-info h4');
    const teams = Array.from(teamNames).map(team => team.textContent);
    
    console.log(`Betting on: ${teams.join(' vs ')}`);
    
    // Show bet confirmation (replace with actual betting logic)
    showBetConfirmation(teams);
}

function handleAddToSlipClick(card) {
    const teamNames = card.querySelectorAll('.team-info h4');
    const teams = Array.from(teamNames).map(team => team.textContent);
    
    console.log(`Added to slip: ${teams.join(' vs ')}`);
    
    // Show slip confirmation (replace with actual slip logic)
    showSlipConfirmation(teams);
}

function showBetConfirmation(teams) {
    const message = `Betting on: ${teams.join(' vs ')}`;
    alert(message); // Replace with proper UI notification
}

function showSlipConfirmation(teams) {
    const message = `Added to slip: ${teams.join(' vs ')}`;
    alert(message); // Replace with proper UI notification
}

// ========================================
// INITIALIZATION
// ========================================

// Check if we're on the sports template page
if (document.querySelector('.event-card')) {
    initSportsTemplate();
}

// Export functions for potential external use
window.WinzoApp = {
    initMobileNavigation,
    initButtonInteractions,
    initFormValidation,
    initAccessibilityFeatures,
    initSportsTemplate
};
