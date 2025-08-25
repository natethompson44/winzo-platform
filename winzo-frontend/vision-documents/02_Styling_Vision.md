# 02 Styling Vision

## Purpose
This document defines the comprehensive visual design system for Winzo's sports betting platform, establishing color palettes, typography, spacing, and responsive design patterns that create a trustworthy, professional, and engaging user experience.

## Brand Identity & Design Philosophy

### Winzo Brand Personality
Winzo embodies **modern professionalism with controlled excitement**:
- **Trustworthy**: Clean lines, consistent patterns, and reliable visual cues
- **Professional**: Sophisticated color choices and typography that inspire confidence
- **Energetic**: Strategic use of accent colors to highlight wins and opportunities
- **Accessible**: High contrast ratios and clear visual hierarchy for all users

### Visual Design Goals
- **Build Trust**: Professional appearance that instills confidence in financial decisions
- **Reduce Cognitive Load**: Clear information hierarchy and consistent patterns
- **Enhance Usability**: Intuitive visual cues that guide user actions
- **Support Performance**: Efficient CSS that loads fast and renders smoothly

## Color System

### Primary Color Palette
Per `DEVELOPMENT_GUIDE.md` CSS variables implementation:

```css
:root {
    /* Primary Colors - Trust & Action */
    --primary: #007BFF;        /* Primary CTAs, links */
    --primary-dark: #0056b3;   /* Hover states, emphasis */
    --primary-light: #4da6ff;  /* Backgrounds, subtle accents */
    
    /* Secondary Colors - Navigation & Support */
    --secondary: #6c757d;      /* Secondary elements */
    --secondary-dark: #495057; /* Text on light backgrounds */
    --secondary-light: #adb5bd; /* Borders, dividers */
    
    /* Success & Positive States */
    --accent: #28a745;         /* Winning odds, success states */
    --accent-dark: #1e7e34;    /* Success hover states */
    --accent-light: #48c774;   /* Success backgrounds */
    
    /* Status Colors */
    --success: #28a745;        /* Confirmations, wins */
    --warning: #ffc107;        /* Cautions, pending states */
    --error: #dc3545;          /* Errors, losses, warnings */
    --info: #17a2b8;          /* Information, neutral alerts */
}
```

### Neutral Color System
```css
:root {
    /* Neutral Scale - Backgrounds & Text */
    --white: #ffffff;          /* Pure white backgrounds */
    --light-gray: #f8f9fa;     /* Light backgrounds */
    --gray: #dee2e6;          /* Borders, dividers */
    --dark-gray: #343a40;      /* Dark text, headers */
    --black: #000000;          /* High contrast text */
    
    /* Text Colors */
    --text-primary: #212529;   /* Main body text */
    --text-secondary: #6c757d; /* Secondary text */
    --text-muted: #adb5bd;     /* Muted text, placeholders */
    --text-light: #ffffff;     /* Text on dark backgrounds */
}
```

### Color Usage Guidelines
- **Primary Blue**: Main CTAs, active states, primary navigation
- **Green Accent**: Positive odds, winning states, success confirmations
- **Red Error**: Negative odds, error states, critical warnings
- **Gray Secondary**: Supporting elements, inactive states, borders
- **High Contrast**: Ensure WCAG AA compliance (4.5:1 minimum) per `11_Security_Vision.md`

## Typography System

### Font Stack & Performance
Per `10_Performance_Vision.md` optimization principles:

```css
:root {
    /* System Font Stack - Performance Optimized */
    --font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", 
                        Roboto, "Helvetica Neue", Arial, sans-serif;
    --font-family-monospace: "SF Mono", Monaco, Inconsolata, 
                            "Roboto Mono", monospace;
}
```

### Typographic Scale
Per `DEVELOPMENT_GUIDE.md` rem-based scaling:

```css
:root {
    /* Typography Scale */
    --font-size-xs: 0.75rem;   /* 12px - Small labels */
    --font-size-sm: 0.875rem;  /* 14px - Secondary text */
    --font-size-base: 1rem;    /* 16px - Body text */
    --font-size-lg: 1.125rem;  /* 18px - Large body */
    --font-size-xl: 1.25rem;   /* 20px - Subheadings */
    --font-size-2xl: 1.5rem;   /* 24px - Headings */
    --font-size-3xl: 1.875rem; /* 30px - Large headings */
    --font-size-4xl: 2.25rem;  /* 36px - Hero text */
    
    /* Font Weights */
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
}
```

### Typography Applications
- **Headings**: Bold weight, increased line-height for readability
- **Body Text**: Normal weight, optimized line-height (1.5) for reading
- **UI Text**: Medium weight for buttons and interactive elements
- **Data Display**: Monospace for odds and numerical data alignment

## Spacing & Layout System

### Spacing Scale
Per `DEVELOPMENT_GUIDE.md` consistent spacing rhythm:

```css
:root {
    /* Spacing Scale - 8px base unit */
    --spacing-xs: 0.25rem;   /* 4px - Tight spacing */
    --spacing-sm: 0.5rem;    /* 8px - Small gaps */
    --spacing-md: 1rem;      /* 16px - Standard spacing */
    --spacing-lg: 1.5rem;    /* 24px - Section spacing */
    --spacing-xl: 2rem;      /* 32px - Large sections */
    --spacing-2xl: 3rem;     /* 48px - Major sections */
    --spacing-3xl: 4rem;     /* 64px - Page sections */
}
```

### Layout Principles
- **Consistent Rhythm**: All spacing uses the defined scale
- **Visual Hierarchy**: Larger spacing indicates greater separation
- **Breathing Room**: Minimum 1rem padding prevents cramped layouts
- **Responsive Scaling**: Spacing adapts to screen size appropriately

## Component Styling Standards

### Button Styling System
Per `03_Components_Vision.md` component requirements:

```css
.btn {
    /* Base Button Styles */
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: 4px;
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-base);
    line-height: 1.5;
    transition: all 0.2s ease;
    cursor: pointer;
    border: 2px solid transparent;
}

.btn-primary {
    background-color: var(--primary);
    color: var(--text-light);
    border-color: var(--primary);
}

.btn-primary:hover {
    background-color: var(--primary-dark);
    border-color: var(--primary-dark);
    transform: translateY(-1px);
}

.btn-primary:focus {
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}
```

### Form Element Styling
Per `08_User_Experience_Vision.md` form requirements:

```css
.form-input {
    width: 100%;
    padding: var(--spacing-sm);
    border: 2px solid var(--gray);
    border-radius: 4px;
    font-size: var(--font-size-base);
    line-height: 1.5;
    transition: border-color 0.2s ease;
}

.form-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    outline: none;
}

.form-input.error {
    border-color: var(--error);
}
```

## Responsive Design Strategy

### Breakpoint System
Per `04_Layout_Vision.md` responsive requirements:

```css
/* Mobile First Breakpoints */
:root {
    --breakpoint-sm: 576px;   /* Small devices */
    --breakpoint-md: 768px;   /* Tablets */
    --breakpoint-lg: 1024px;  /* Desktops */
    --breakpoint-xl: 1440px;  /* Large desktops */
}

/* Usage Examples */
@media (min-width: 768px) {
    .container {
        max-width: 720px;
    }
}

@media (min-width: 1024px) {
    .container {
        max-width: 960px;
    }
}
```

### Responsive Typography
```css
/* Fluid Typography */
.hero-title {
    font-size: clamp(1.875rem, 4vw, 2.25rem);
}

.body-text {
    font-size: clamp(0.875rem, 2.5vw, 1rem);
}
```

## Performance Optimization

### CSS Performance Best Practices
Per `10_Performance_Vision.md` optimization strategies:

- **Critical CSS**: Inline above-the-fold styles
- **CSS Custom Properties**: Efficient theme management
- **Minimal Specificity**: Avoid deep selector nesting
- **Hardware Acceleration**: Use `transform` and `opacity` for animations
- **Efficient Selectors**: Class-based selectors over complex combinations

### Animation Guidelines
```css
/* Performance-optimized animations */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.fade-in {
    animation: fadeIn 0.3s ease-out;
    will-change: opacity, transform;
}
```

## Accessibility & Contrast

### Color Accessibility
Per `08_User_Experience_Vision.md` accessibility requirements:

- **WCAG AA Compliance**: Minimum 4.5:1 contrast ratio for normal text
- **WCAG AAA Target**: 7:1 contrast ratio for enhanced accessibility
- **Color Independence**: Information not conveyed by color alone
- **High Contrast Mode**: Support for system high contrast preferences

### Focus States
```css
/* Accessible focus states */
.focusable:focus {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
}

/* For dark backgrounds */
.dark-theme .focusable:focus {
    outline-color: var(--primary-light);
}
```

## Integration with Architecture

This styling vision supports:
- `01_Project_Vision.md`: Professional, trustworthy visual identity
- `03_Components_Vision.md`: Consistent component styling patterns
- `04_Layout_Vision.md`: Responsive grid and layout systems
- `08_User_Experience_Vision.md`: Accessible and intuitive visual design
- `10_Performance_Vision.md`: Optimized CSS delivery and rendering
- `11_Security_Vision.md`: Visual security indicators and trust building

## Style Guide Maintenance

### CSS Organization
Per `DEVELOPMENT_GUIDE.md` structure:
1. **CSS Variables** - Global design tokens
2. **Reset & Base** - Normalize and foundational styles
3. **Typography** - Text and heading styles
4. **Layout** - Grid and container systems
5. **Components** - Reusable UI components
6. **Utilities** - Helper classes and modifiers
7. **Responsive** - Media queries and breakpoint styles

The styling vision ensures Winzo maintains a cohesive, professional, and accessible visual identity that builds user trust while supporting the platform's performance and usability goals.