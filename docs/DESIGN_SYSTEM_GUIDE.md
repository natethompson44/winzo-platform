# WINZO Platform Design System Guide

## Table of Contents
- [Overview](#overview)
- [Design Philosophy](#design-philosophy)
- [Color System](#color-system)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Component Library](#component-library)
- [Responsive Design](#responsive-design)
- [Design Tokens](#design-tokens)
- [Usage Guidelines](#usage-guidelines)
- [Brand Guidelines](#brand-guidelines)

## Overview

The WINZO Design System is a comprehensive collection of reusable components, design tokens, and guidelines that ensure consistency, accessibility, and efficiency across the entire platform. Built with a mobile-first approach and optimized for sports betting functionality.

### Design System Goals
- **Consistency**: Unified visual language across all interfaces
- **Efficiency**: Faster development with reusable components
- **Accessibility**: WCAG 2.1 AA compliant design standards
- **Scalability**: Flexible system that grows with the platform
- **Performance**: Optimized for fast loading and smooth interactions

## Design Philosophy

### Core Principles

#### 1. Functionality First
Every design decision prioritizes user functionality and task completion over decorative elements.

#### 2. Professional Trust
Clean, reliable interface that builds confidence in betting decisions and financial transactions.

#### 3. Desktop Excellence
Advanced features and data density optimized for serious sports bettors on desktop.

#### 4. Mobile Simplicity
Essential features delivered efficiently on mobile devices with touch-optimized interactions.

#### 5. Cognitive Clarity
Clear information hierarchy and reduced cognitive load for quick decision-making.

### Brand Personality
- **Professional**: Serious, reliable, trustworthy
- **Sophisticated**: Advanced functionality for experienced users
- **Efficient**: Fast, streamlined, no-nonsense interface
- **Innovative**: Modern technology and user experience

## Color System

### Primary Color Palette

#### Brand Colors
```css
/* Primary Blue - Main brand color */
--color-primary-50: #eff6ff;   /* Lightest blue backgrounds */
--color-primary-100: #dbeafe;  /* Light blue accents */
--color-primary-200: #bfdbfe;  /* Subtle blue borders */
--color-primary-300: #93c5fd;  /* Medium blue elements */
--color-primary-400: #60a5fa;  /* Active blue states */
--color-primary-500: #3b82f6;  /* Standard blue (main) */
--color-primary-600: #2563eb;  /* Dark blue (hover) */
--color-primary-700: #1d4ed8;  /* Darker blue */
--color-primary-800: #1e40af;  /* Very dark blue */
--color-primary-900: #1e3a8a;  /* Darkest blue */

/* Accent Gold - Call-to-action and highlights */
--color-accent-50: #fffbeb;    /* Light gold backgrounds */
--color-accent-100: #fef3c7;   /* Subtle gold accents */
--color-accent-200: #fde68a;   /* Light gold borders */
--color-accent-300: #fcd34d;   /* Medium gold elements */
--color-accent-400: #fbbf24;   /* Active gold states */
--color-accent-500: #f59e0b;   /* Standard gold (main) */
--color-accent-600: #d97706;   /* Dark gold (hover) */
--color-accent-700: #b45309;   /* Darker gold */
--color-accent-800: #92400e;   /* Very dark gold */
--color-accent-900: #78350f;   /* Darkest gold */
```

#### Neutral Colors
```css
/* Grayscale - Text, backgrounds, borders */
--color-neutral-0: #ffffff;    /* Pure white */
--color-neutral-50: #f9fafb;   /* Lightest gray */
--color-neutral-100: #f3f4f6;  /* Light gray backgrounds */
--color-neutral-200: #e5e7eb;  /* Border gray */
--color-neutral-300: #d1d5db;  /* Disabled elements */
--color-neutral-400: #9ca3af;  /* Placeholder text */
--color-neutral-500: #6b7280;  /* Secondary text */
--color-neutral-600: #4b5563;  /* Primary text */
--color-neutral-700: #374151;  /* Dark text */
--color-neutral-800: #1f2937;  /* Very dark backgrounds */
--color-neutral-900: #111827;  /* Darkest backgrounds */
```

#### Status Colors
```css
/* Success - Wins, profits, confirmations */
--color-success-50: #ecfdf5;
--color-success-500: #10b981;
--color-success-600: #059669;

/* Error - Losses, errors, warnings */
--color-error-50: #fef2f2;
--color-error-500: #ef4444;
--color-error-600: #dc2626;

/* Warning - Cautions, pending states */
--color-warning-50: #fffbeb;
--color-warning-500: #f59e0b;
--color-warning-600: #d97706;

/* Info - Information, neutral states */
--color-info-50: #eff6ff;
--color-info-500: #3b82f6;
--color-info-600: #2563eb;
```

### Color Usage Guidelines

#### Primary Blue Usage
- **Navigation**: Sidebar, active states, primary buttons
- **Branding**: Logo, header elements, key CTAs
- **Links**: Text links, interactive elements
- **Focus States**: Form inputs, keyboard navigation

#### Accent Gold Usage
- **Call-to-Action**: "Place Bet", "Deposit", high-priority actions
- **Highlights**: Featured games, promotions, important notifications
- **Success States**: Winning bets, successful transactions
- **Premium Features**: VIP elements, special offers

#### Neutral Colors Usage
- **Text Hierarchy**: Primary (900), Secondary (600), Tertiary (500)
- **Backgrounds**: White (0), Light (50-100), Medium (200-300)
- **Borders**: Light (200), Medium (300), Dark (400)
- **Disabled States**: Gray (300-400)

## Typography

### Font System
```css
/* Font Families */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, 'Liberation Mono', monospace;
```

### Type Scale
```css
/* Font Sizes */
--text-xs: 0.75rem;      /* 12px - Small labels, captions */
--text-sm: 0.875rem;     /* 14px - Body text, buttons */
--text-base: 1rem;       /* 16px - Default body text */
--text-lg: 1.125rem;     /* 18px - Large body text */
--text-xl: 1.25rem;      /* 20px - Small headings */
--text-2xl: 1.5rem;      /* 24px - Medium headings */
--text-3xl: 1.875rem;    /* 30px - Large headings */
--text-4xl: 2.25rem;     /* 36px - Extra large headings */
--text-5xl: 3rem;        /* 48px - Display text */
```

### Font Weights
```css
--font-light: 300;       /* Light text */
--font-normal: 400;      /* Body text */
--font-medium: 500;      /* Emphasized text */
--font-semibold: 600;    /* Headings, important text */
--font-bold: 700;        /* Strong emphasis */
```

### Line Heights
```css
--leading-tight: 1.25;   /* Headings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.75; /* Long-form content */
```

### Typography Hierarchy

#### Headings
```css
/* H1 - Page titles */
.text-h1 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--color-primary-800);
}

/* H2 - Section headers */
.text-h2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--color-neutral-700);
}

/* H3 - Subsection headers */
.text-h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-medium);
  line-height: var(--leading-tight);
  color: var(--color-neutral-600);
}
```

#### Body Text
```css
/* Primary body text */
.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--color-neutral-600);
}

/* Secondary body text */
.text-body-secondary {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--color-neutral-500);
}

/* Small text */
.text-small {
  font-size: var(--text-xs);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--color-neutral-400);
}
```

## Spacing & Layout

### Spacing System
Based on a 4px grid system for consistent spacing throughout the platform.

```css
/* Base spacing units */
--space-0: 0;
--space-1: 0.25rem;      /* 4px */
--space-2: 0.5rem;       /* 8px */
--space-3: 0.75rem;      /* 12px */
--space-4: 1rem;         /* 16px */
--space-5: 1.25rem;      /* 20px */
--space-6: 1.5rem;       /* 24px */
--space-8: 2rem;         /* 32px */
--space-10: 2.5rem;      /* 40px */
--space-12: 3rem;        /* 48px */
--space-16: 4rem;        /* 64px */
--space-20: 5rem;        /* 80px */
--space-24: 6rem;        /* 96px */
```

### Layout Guidelines

#### Spacing Hierarchy
- **Micro spacing**: 4px-8px (space-1 to space-2) - Between related elements
- **Component spacing**: 12px-16px (space-3 to space-4) - Component internal padding
- **Section spacing**: 24px-32px (space-6 to space-8) - Between sections
- **Page spacing**: 48px+ (space-12+) - Major page sections

#### Container Widths
```css
--container-sm: 640px;   /* Small containers */
--container-md: 768px;   /* Medium containers */
--container-lg: 1024px;  /* Large containers */
--container-xl: 1280px;  /* Extra large containers */
--container-max: 1400px; /* Maximum content width */
```

## Component Library

### Buttons

#### Button Variants
```css
/* Primary Button - Main actions */
.btn-primary {
  background-color: var(--color-primary-600);
  color: var(--color-neutral-0);
  border: 2px solid var(--color-primary-600);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background-color: var(--color-primary-700);
  border-color: var(--color-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--shadow-primary);
}

/* Accent Button - Call-to-action */
.btn-accent {
  background-color: var(--color-accent-500);
  color: var(--color-neutral-0);
  border: 2px solid var(--color-accent-500);
  font-weight: var(--font-semibold);
}

.btn-accent:hover {
  background-color: var(--color-accent-600);
  border-color: var(--color-accent-600);
  transform: translateY(-1px);
  box-shadow: var(--shadow-accent);
}

/* Secondary Button - Alternative actions */
.btn-secondary {
  background-color: transparent;
  color: var(--color-primary-600);
  border: 2px solid var(--color-primary-600);
}

.btn-secondary:hover {
  background-color: var(--color-primary-600);
  color: var(--color-neutral-0);
}
```

#### Button Sizes
```css
.btn-sm { padding: var(--space-2) var(--space-4); font-size: var(--text-sm); }
.btn-md { padding: var(--space-3) var(--space-6); font-size: var(--text-base); }
.btn-lg { padding: var(--space-4) var(--space-8); font-size: var(--text-lg); }
```

### Cards

#### Standard Card
```css
.card {
  background-color: var(--color-neutral-0);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-normal);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-header {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-neutral-200);
}

.card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-neutral-700);
}

.card-body {
  color: var(--color-neutral-600);
}
```

### Form Elements

#### Input Fields
```css
.input-field {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  background-color: var(--color-neutral-0);
  transition: var(--transition-fast);
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-field::placeholder {
  color: var(--color-neutral-400);
}

.input-field:disabled {
  background-color: var(--color-neutral-100);
  color: var(--color-neutral-400);
  cursor: not-allowed;
}
```

#### Labels
```css
.input-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-700);
  margin-bottom: var(--space-2);
}

.input-label--required::after {
  content: " *";
  color: var(--color-error-500);
}
```

### Navigation Components

#### Sidebar Navigation
```css
.sidebar {
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--color-neutral-900);
  padding: var(--space-6) 0;
  position: fixed;
  left: 0;
  top: 0;
  z-index: var(--z-fixed);
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-6);
  color: var(--color-neutral-300);
  text-decoration: none;
  transition: var(--transition-fast);
}

.sidebar-item:hover {
  background-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}

.sidebar-item--active {
  background-color: var(--color-primary-600);
  color: var(--color-neutral-0);
}
```

## Responsive Design

### Breakpoint System
```css
--breakpoint-sm: 640px;   /* Small devices (phones) */
--breakpoint-md: 768px;   /* Medium devices (tablets) */
--breakpoint-lg: 1024px;  /* Large devices (laptops) */
--breakpoint-xl: 1280px;  /* Extra large devices */
--breakpoint-2xl: 1536px; /* 2X large devices */
```

### Responsive Strategy

#### Mobile-First Approach
Start with mobile design and enhance for larger screens.

#### Desktop vs Mobile Layout
- **Desktop**: Sidebar navigation, multi-column layouts, hover states
- **Mobile**: Bottom navigation, single-column, touch interactions

#### Touch Targets
- Minimum 44px height for interactive elements
- Adequate spacing between clickable items
- Thumb-friendly navigation zones

## Design Tokens

### Border Radius
```css
--radius-none: 0;
--radius-sm: 0.125rem;   /* 2px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-full: 9999px;   /* Fully rounded */
```

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

/* Colored shadows */
--shadow-primary: 0 4px 12px rgba(30, 58, 138, 0.15);
--shadow-accent: 0 4px 12px rgba(245, 158, 11, 0.15);
```

### Transitions
```css
--transition-fast: 0.15s ease;
--transition-normal: 0.2s ease;
--transition-slow: 0.3s ease;
```

### Z-Index Scale
```css
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-tooltip: 1070;
```

## Usage Guidelines

### Component Usage

#### When to Use Buttons
- **Primary**: Main actions (Place Bet, Login, Save)
- **Accent**: High-priority CTAs (Deposit, Withdraw, Bet Now)
- **Secondary**: Alternative actions (Cancel, Reset, Back)
- **Ghost**: Subtle actions (More Info, Details, Settings)

#### Card Usage
- Group related information
- Contain interactive elements
- Display sports events, bets, or user info
- Provide clear boundaries between content

#### Color Application
- Maintain sufficient contrast ratios (4.5:1 minimum)
- Use color consistently across similar elements
- Don't rely solely on color to convey information
- Test with colorblind users

### Accessibility Guidelines

#### Color Contrast
- Text on background: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- Interactive elements: Clear focus indicators

#### Typography
- Minimum 16px base font size
- Adequate line spacing (1.5x font size)
- Clear hierarchy with size and weight

#### Interactive Elements
- Minimum 44px touch targets
- Clear focus indicators
- Keyboard navigation support

## Brand Guidelines

### Logo Usage
- Maintain clear space around logo
- Use appropriate size for context
- Don't distort or modify colors
- Ensure adequate contrast

### Voice & Tone
- **Professional**: Clear, confident, reliable
- **Helpful**: Informative without being condescending
- **Efficient**: Concise, direct communication
- **Trustworthy**: Honest, transparent, responsible

### Content Guidelines
- Use consistent terminology
- Write in active voice
- Provide clear instructions
- Include helpful error messages

---

**Design System Version**: 2.0  
**Last Updated**: December 2024  
**Maintained By**: Design Team  
**Next Review**: Quarterly

*This design system guide is a living document. For component implementation details, see the `/winzo-frontend/src/styles/design-system/` directory.* 