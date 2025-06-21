# WINZO Platform Design System & Style Guide

## Executive Summary

This comprehensive design system provides the foundation for rebuilding the WINZO sports betting platform with consistency, professionalism, and optimal user experience across desktop and mobile devices. Based on analysis of current issues and user requirements, this system prioritizes functionality, consistency, and a clean slate approach using modern design principles.

## Design Philosophy

### Core Principles
1. **Consistency First**: Every element follows systematic rules
2. **Functionality Over Form**: User experience drives design decisions
3. **Desktop Optimization**: Advanced features for serious gamblers
4. **Mobile Simplicity**: Essential functionality that works flawlessly
5. **Professional Trust**: Clean, reliable, trustworthy appearance
6. **Unique Identity**: Distinctive from generic betting platforms

### Brand Positioning
- **Target Audience**: Serious sports bettors who value functionality and reliability
- **Brand Personality**: Professional, trustworthy, efficient, sophisticated
- **Competitive Advantage**: Superior user experience and consistent interface

## Color System

### Primary Color Palette
```css
:root {
  /* Primary Brand Colors */
  --primary-blue: #1e3a8a;        /* Deep professional blue */
  --primary-blue-light: #3b82f6;  /* Lighter blue for accents */
  --primary-blue-dark: #1e40af;   /* Darker blue for depth */
  
  /* Secondary Colors */
  --accent-gold: #f59e0b;         /* Premium gold for highlights */
  --accent-gold-light: #fbbf24;   /* Light gold for hover states */
  --accent-gold-dark: #d97706;    /* Dark gold for active states */
  
  /* Neutral Colors */
  --neutral-white: #ffffff;       /* Pure white */
  --neutral-gray-50: #f9fafb;     /* Lightest gray */
  --neutral-gray-100: #f3f4f6;    /* Light gray backgrounds */
  --neutral-gray-200: #e5e7eb;    /* Border gray */
  --neutral-gray-300: #d1d5db;    /* Disabled elements */
  --neutral-gray-400: #9ca3af;    /* Placeholder text */
  --neutral-gray-500: #6b7280;    /* Secondary text */
  --neutral-gray-600: #4b5563;    /* Primary text */
  --neutral-gray-700: #374151;    /* Dark text */
  --neutral-gray-800: #1f2937;    /* Very dark backgrounds */
  --neutral-gray-900: #111827;    /* Darkest backgrounds */
  
  /* Status Colors */
  --success-green: #10b981;       /* Win/profit indicators */
  --success-green-light: #34d399; /* Light success states */
  --error-red: #ef4444;           /* Loss/error indicators */
  --error-red-light: #f87171;     /* Light error states */
  --warning-yellow: #f59e0b;      /* Warning states */
  --info-blue: #3b82f6;          /* Information states */
}
```

### Color Usage Guidelines
- **Primary Blue**: Main navigation, primary buttons, brand elements
- **Accent Gold**: Call-to-action buttons, highlights, premium features
- **Neutral Grays**: Text, backgrounds, borders, subtle elements
- **Status Colors**: Wins/losses, alerts, notifications, system feedback

## Typography System

### Font Stack
```css
:root {
  /* Primary Font Family */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Monospace Font for Numbers */
  --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
}
```

### Typography Scale
```css
:root {
  /* Font Sizes */
  --text-xs: 0.75rem;     /* 12px - Small labels */
  --text-sm: 0.875rem;    /* 14px - Body text, buttons */
  --text-base: 1rem;      /* 16px - Default body */
  --text-lg: 1.125rem;    /* 18px - Large body */
  --text-xl: 1.25rem;     /* 20px - Small headings */
  --text-2xl: 1.5rem;     /* 24px - Medium headings */
  --text-3xl: 1.875rem;   /* 30px - Large headings */
  --text-4xl: 2.25rem;    /* 36px - Extra large headings */
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
  
  /* Font Weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Typography Hierarchy
1. **H1 - Page Titles**: `--text-3xl`, `--font-bold`, `--primary-blue`
2. **H2 - Section Headers**: `--text-2xl`, `--font-semibold`, `--neutral-gray-700`
3. **H3 - Subsection Headers**: `--text-xl`, `--font-medium`, `--neutral-gray-600`
4. **Body Text**: `--text-base`, `--font-normal`, `--neutral-gray-600`
5. **Small Text**: `--text-sm`, `--font-normal`, `--neutral-gray-500`
6. **Labels**: `--text-xs`, `--font-medium`, `--neutral-gray-400`

## Spacing System

### Spacing Scale
```css
:root {
  /* Spacing Units (based on 4px grid) */
  --space-0: 0;
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */
}
```

### Spacing Guidelines
- **Component Padding**: Use `--space-4` (16px) as default
- **Section Margins**: Use `--space-8` (32px) between major sections
- **Element Gaps**: Use `--space-2` (8px) for tight spacing, `--space-4` (16px) for normal
- **Page Margins**: Use `--space-6` (24px) minimum on mobile, `--space-12` (48px) on desktop

## Component Library

### Buttons

#### Primary Button
```css
.btn-primary {
  background-color: var(--primary-blue);
  color: var(--neutral-white);
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--primary-blue-dark);
  transform: translateY(-1px);
}
```

#### Secondary Button
```css
.btn-secondary {
  background-color: transparent;
  color: var(--primary-blue);
  border: 2px solid var(--primary-blue);
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: var(--primary-blue);
  color: var(--neutral-white);
}
```

#### Accent Button (Call-to-Action)
```css
.btn-accent {
  background-color: var(--accent-gold);
  color: var(--neutral-white);
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
}

.btn-accent:hover {
  background-color: var(--accent-gold-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
}
```

### Cards

#### Standard Card
```css
.card {
  background-color: var(--neutral-white);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--neutral-gray-200);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
```

#### Metric Card
```css
.metric-card {
  background-color: var(--neutral-white);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  text-align: center;
  border: 1px solid var(--neutral-gray-200);
  transition: all 0.2s ease;
}

.metric-card-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--primary-blue);
  font-family: var(--font-mono);
}

.metric-card-label {
  font-size: var(--text-sm);
  color: var(--neutral-gray-500);
  margin-top: var(--space-2);
}
```

### Forms

#### Input Fields
```css
.input-field {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  border: 2px solid var(--neutral-gray-200);
  border-radius: var(--radius-md);
  background-color: var(--neutral-white);
  transition: all 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-field::placeholder {
  color: var(--neutral-gray-400);
}
```

#### Labels
```css
.input-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--neutral-gray-700);
  margin-bottom: var(--space-2);
}
```

### Navigation

#### Sidebar Navigation
```css
.sidebar {
  width: 280px;
  background-color: var(--neutral-gray-900);
  height: 100vh;
  padding: var(--space-6) 0;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-6);
  color: var(--neutral-gray-300);
  text-decoration: none;
  transition: all 0.2s ease;
}

.sidebar-item:hover {
  background-color: var(--neutral-gray-800);
  color: var(--neutral-white);
}

.sidebar-item.active {
  background-color: var(--primary-blue);
  color: var(--neutral-white);
}
```

## Border Radius System

```css
:root {
  --radius-sm: 0.25rem;   /* 4px - Small elements */
  --radius-md: 0.5rem;    /* 8px - Standard elements */
  --radius-lg: 0.75rem;   /* 12px - Cards, large elements */
  --radius-xl: 1rem;      /* 16px - Special elements */
  --radius-full: 9999px;  /* Fully rounded */
}
```

## Shadow System

```css
:root {
  /* Shadow Levels */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
  
  /* Colored Shadows */
  --shadow-primary: 0 4px 12px rgba(30, 58, 138, 0.15);
  --shadow-accent: 0 4px 12px rgba(245, 158, 11, 0.15);
}
```

## Responsive Breakpoints

```css
:root {
  /* Breakpoint Values */
  --breakpoint-sm: 640px;   /* Small devices */
  --breakpoint-md: 768px;   /* Medium devices */
  --breakpoint-lg: 1024px;  /* Large devices */
  --breakpoint-xl: 1280px;  /* Extra large devices */
  --breakpoint-2xl: 1536px; /* 2X large devices */
}
```

### Responsive Strategy
- **Mobile First**: Design for mobile, enhance for desktop
- **Desktop Optimization**: Advanced features and layouts for larger screens
- **Tablet Considerations**: Hybrid approach between mobile and desktop
- **Touch Targets**: Minimum 44px touch targets on mobile devices


## Desktop vs Mobile Strategy

### Desktop Experience (Primary Focus)
**Target Users**: Serious gamblers, advanced bettors, professional users

#### Layout Characteristics
- **Sidebar Navigation**: Fixed left sidebar with comprehensive menu
- **Multi-Column Layouts**: Utilize screen real estate effectively
- **Data Density**: More information per screen
- **Advanced Features**: Complex betting tools, detailed analytics
- **Hover States**: Rich interactive feedback
- **Keyboard Navigation**: Full keyboard accessibility

#### Desktop-Specific Components
```css
/* Desktop Sidebar */
.desktop-sidebar {
  width: 280px;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background-color: var(--neutral-gray-900);
  z-index: 1000;
}

/* Desktop Main Content */
.desktop-main {
  margin-left: 280px;
  padding: var(--space-8);
  min-height: 100vh;
}

/* Desktop Grid Layouts */
.desktop-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
}

.desktop-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-6);
}
```

### Mobile Experience (Simplified)
**Target Users**: Casual bettors, on-the-go users, quick access needs

#### Layout Characteristics
- **Bottom Navigation**: Thumb-friendly navigation bar
- **Single Column**: Stacked content for easy scrolling
- **Essential Features**: Core functionality only
- **Large Touch Targets**: Minimum 44px touch areas
- **Swipe Gestures**: Natural mobile interactions
- **Simplified UI**: Reduced cognitive load

#### Mobile-Specific Components
```css
/* Mobile Bottom Navigation */
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: var(--neutral-white);
  border-top: 1px solid var(--neutral-gray-200);
  padding: var(--space-2) 0;
  z-index: 1000;
}

.mobile-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-2);
  min-height: 44px;
  min-width: 44px;
}

/* Mobile Main Content */
.mobile-main {
  padding: var(--space-4);
  padding-bottom: 80px; /* Account for bottom nav */
}

/* Mobile Cards */
.mobile-card {
  margin-bottom: var(--space-4);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}
```

## Animation System

### Transition Standards
```css
:root {
  /* Transition Durations */
  --transition-fast: 0.15s;
  --transition-normal: 0.2s;
  --transition-slow: 0.3s;
  
  /* Easing Functions */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Standard Animations
```css
/* Hover Lift Effect */
.hover-lift {
  transition: transform var(--transition-normal) var(--ease-out);
}

.hover-lift:hover {
  transform: translateY(-2px);
}

/* Fade In Animation */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn var(--transition-normal) var(--ease-out);
}

/* Loading Spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

## Sports Betting Specific Components

### Bet Slip
```css
.bet-slip {
  position: fixed;
  right: 0;
  top: 0;
  width: 320px;
  height: 100vh;
  background-color: var(--neutral-white);
  border-left: 1px solid var(--neutral-gray-200);
  padding: var(--space-6);
  overflow-y: auto;
  z-index: 999;
}

.bet-slip-item {
  background-color: var(--neutral-gray-50);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  border: 1px solid var(--neutral-gray-200);
}

.bet-slip-total {
  background-color: var(--primary-blue);
  color: var(--neutral-white);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  text-align: center;
  font-weight: var(--font-semibold);
}
```

### Odds Display
```css
.odds-button {
  background-color: var(--neutral-white);
  border: 2px solid var(--neutral-gray-200);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-family: var(--font-mono);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all var(--transition-fast) var(--ease-out);
}

.odds-button:hover {
  border-color: var(--primary-blue);
  background-color: var(--primary-blue);
  color: var(--neutral-white);
}

.odds-button.selected {
  background-color: var(--accent-gold);
  border-color: var(--accent-gold);
  color: var(--neutral-white);
}
```

### Game Cards
```css
.game-card {
  background-color: var(--neutral-white);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  border: 1px solid var(--neutral-gray-200);
  margin-bottom: var(--space-4);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--neutral-gray-200);
}

.team-name {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--neutral-gray-700);
}

.game-time {
  font-size: var(--text-sm);
  color: var(--neutral-gray-500);
}
```

## Status and Feedback Components

### Success States
```css
.success-message {
  background-color: var(--success-green);
  color: var(--neutral-white);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
}

.success-badge {
  background-color: var(--success-green-light);
  color: var(--success-green);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}
```

### Error States
```css
.error-message {
  background-color: var(--error-red);
  color: var(--neutral-white);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
}

.error-badge {
  background-color: var(--error-red-light);
  color: var(--error-red);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
}
```

### Loading States
```css
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--neutral-gray-200);
  border-top: 4px solid var(--primary-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

## Accessibility Guidelines

### Color Contrast
- **Text on White**: Minimum 4.5:1 contrast ratio
- **Large Text**: Minimum 3:1 contrast ratio
- **Interactive Elements**: Clear visual distinction
- **Focus States**: High contrast focus indicators

### Keyboard Navigation
```css
/* Focus Styles */
.focusable:focus {
  outline: 2px solid var(--primary-blue);
  outline-offset: 2px;
}

/* Skip Links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--primary-blue);
  color: var(--neutral-white);
  padding: 8px;
  text-decoration: none;
  z-index: 10000;
}

.skip-link:focus {
  top: 6px;
}
```

### Screen Reader Support
- **Semantic HTML**: Proper heading hierarchy
- **ARIA Labels**: Descriptive labels for interactive elements
- **Alt Text**: Meaningful descriptions for images
- **Live Regions**: Dynamic content announcements

## Performance Guidelines

### CSS Optimization
- **CSS Variables**: Use for consistent theming
- **Minimal Specificity**: Avoid deep nesting
- **Critical CSS**: Inline critical styles
- **Lazy Loading**: Non-critical styles loaded asynchronously

### Image Optimization
- **WebP Format**: Modern image format for better compression
- **Responsive Images**: Multiple sizes for different devices
- **Lazy Loading**: Load images as needed
- **Proper Sizing**: Avoid oversized images

## Implementation Checklist

### Phase 1: Foundation
- [ ] Set up CSS variables system
- [ ] Implement base typography styles
- [ ] Create color system
- [ ] Establish spacing system

### Phase 2: Components
- [ ] Build button component library
- [ ] Create card components
- [ ] Implement form elements
- [ ] Design navigation components

### Phase 3: Layout
- [ ] Desktop sidebar navigation
- [ ] Mobile bottom navigation
- [ ] Responsive grid system
- [ ] Page layout templates

### Phase 4: Sports-Specific
- [ ] Bet slip component
- [ ] Odds display components
- [ ] Game card layouts
- [ ] Live betting interfaces

### Phase 5: Polish
- [ ] Animation system
- [ ] Loading states
- [ ] Error handling
- [ ] Accessibility testing

This design system provides the foundation for a consistent, professional, and user-friendly sports betting platform that addresses all current issues while establishing a scalable foundation for future development.

