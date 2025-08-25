# 04 Layout Vision

## Purpose
This document defines the comprehensive layout system for Winzo's sports betting platform, establishing responsive grid structures, navigation patterns, and content organization that ensures optimal user experience across all devices and screen sizes.

## Layout Design Philosophy

### Core Principles
- **Mobile-First**: Layouts designed for small screens first, then enhanced for larger displays
- **Flexible Grid**: Responsive system that adapts to content and screen size
- **Consistent Spacing**: Uniform spacing rhythm throughout the application
- **Content Hierarchy**: Clear visual organization that guides user attention
- **Performance-Oriented**: Efficient layouts that render quickly and smoothly

### Layout Strategy
Per `01_Project_Vision.md` scalability requirements:
- **Template-Based**: Reusable layout patterns for different page types
- **Component-Driven**: Layouts built from standardized components
- **Progressive Enhancement**: Core content accessible without advanced CSS features
- **Accessibility-First**: Layouts that work with assistive technologies

## Grid System Architecture

### 12-Column Grid Foundation
Per `DEVELOPMENT_GUIDE.md` grid implementation:

```css
.container {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: var(--spacing-md);
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-md);
}

/* Grid Column Classes */
.col-1 { grid-column: span 1; }
.col-2 { grid-column: span 2; }
.col-3 { grid-column: span 3; }
.col-4 { grid-column: span 4; }
.col-6 { grid-column: span 6; }
.col-8 { grid-column: span 8; }
.col-12 { grid-column: span 12; }
```

### Responsive Grid Behavior
Per `02_Styling_Vision.md` breakpoint system:

```css
/* Mobile: All columns stack */
@media (max-width: 767px) {
    .col-1, .col-2, .col-3, .col-4, .col-6, .col-8 {
        grid-column: span 12;
    }
    
    .container {
        gap: var(--spacing-sm);
        padding: 0 var(--spacing-sm);
    }
}

/* Tablet: Selective stacking */
@media (min-width: 768px) and (max-width: 1023px) {
    .col-1, .col-2, .col-3 {
        grid-column: span 6;
    }
    
    .col-4 {
        grid-column: span 6;
    }
}

/* Desktop: Full grid system */
@media (min-width: 1024px) {
    .container {
        max-width: 1200px;
    }
}
```

### Specialized Grid Layouts
```css
/* Event Grid - Sports Pages */
.events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
}

/* Sports Cards Grid - Home Page */
.sports-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
}

/* Odds Grid - Event Cards */
.odds-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-sm);
}
```

## Navigation Layout System

### Header Structure
Per `03_Components_Vision.md` navigation components:

```css
.header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--white);
    border-bottom: 1px solid var(--gray);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: var(--spacing-md);
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-sm) var(--spacing-md);
}

.logo {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-bold);
    color: var(--primary);
}

.navigation {
    justify-self: end;
}
```

### Navigation States
Per `08_User_Experience_Vision.md` user states:

```css
/* Authenticated User Navigation */
.nav-menu.authenticated .guest-link {
    display: none;
}

.nav-menu.authenticated .auth-link {
    display: block;
}

/* Guest User Navigation */
.nav-menu.guest .auth-link {
    display: none;
}

.nav-menu.guest .guest-link {
    display: block;
}
```

### Mobile Navigation Layout
Per `10_Performance_Vision.md` touch optimization:

```css
@media (max-width: 767px) {
    .header-content {
        grid-template-columns: auto 1fr auto;
    }
    
    .navigation {
        position: relative;
    }
    
    .nav-menu {
        position: absolute;
        top: calc(100% + 1px);
        right: 0;
        left: -var(--spacing-md);
        background: var(--white);
        border: 1px solid var(--gray);
        border-radius: 0 0 8px 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        transform: translateY(-10px);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .nav-menu.nav-menu-open {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
    }
    
    .nav-link {
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--gray);
        min-height: 48px; /* Touch target */
    }
}
```

## Page Layout Templates

### Home Page Layout
Per `index.html` structure:

```css
.home-layout {
    display: grid;
    grid-template-areas:
        "header header"
        "hero hero"
        "featured featured"
        "components components"
        "footer footer";
    grid-template-rows: auto auto 1fr auto auto;
    min-height: 100vh;
}

.hero {
    grid-area: hero;
    text-align: center;
    padding: var(--spacing-3xl) var(--spacing-md);
    background: linear-gradient(135deg, var(--primary-light), var(--primary));
    color: var(--text-light);
}

.featured-sports {
    grid-area: featured;
    padding: var(--spacing-xl) 0;
}
```

### Sports Page Layout
Per `05_Sports_Page_Vision.md` sports template:

```css
.sports-layout {
    display: grid;
    grid-template-areas:
        "header header"
        "sport-header sport-header"
        "main sidebar"
        "footer footer";
    grid-template-columns: 1fr 300px;
    grid-template-rows: auto auto 1fr auto;
    gap: var(--spacing-lg);
    min-height: 100vh;
}

.sport-header {
    grid-area: sport-header;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg) 0;
    border-bottom: 1px solid var(--gray);
}

.events-section {
    grid-area: main;
}

.sidebar {
    grid-area: sidebar;
}

/* Mobile Sports Layout */
@media (max-width: 767px) {
    .sports-layout {
        grid-template-areas:
            "header"
            "sport-header"
            "main"
            "sidebar"
            "footer";
        grid-template-columns: 1fr;
    }
    
    .sport-header {
        flex-direction: column;
        gap: var(--spacing-md);
        text-align: center;
    }
}
```

## Content Organization Patterns

### Section Spacing System
Per `02_Styling_Vision.md` spacing scale:

```css
/* Section Spacing */
.section {
    padding: var(--spacing-xl) 0;
}

.section-large {
    padding: var(--spacing-3xl) 0;
}

.section-small {
    padding: var(--spacing-lg) 0;
}

/* Content Containers */
.content-wrapper {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 var(--spacing-md);
}

.full-width {
    width: 100%;
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
}
```

### Content Hierarchy
```css
/* Visual Hierarchy */
.content-primary {
    grid-column: span 8;
    order: 1;
}

.content-secondary {
    grid-column: span 4;
    order: 2;
}

/* Mobile Priority */
@media (max-width: 767px) {
    .content-primary,
    .content-secondary {
        grid-column: span 12;
    }
    
    .content-primary {
        order: 1;
    }
    
    .content-secondary {
        order: 2;
    }
}
```

## Responsive Behavior Patterns

### Breakpoint Strategy
Per `02_Styling_Vision.md` responsive design:

```css
/* Container Responsive Behavior */
.container {
    width: 100%;
    padding-left: var(--spacing-md);
    padding-right: var(--spacing-md);
}

@media (min-width: 576px) {
    .container {
        max-width: 540px;
    }
}

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

@media (min-width: 1440px) {
    .container {
        max-width: 1200px;
    }
}
```

### Flexible Component Layouts
```css
/* Adaptive Card Layouts */
.card-layout {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
}

@media (min-width: 768px) {
    .card-layout {
        flex-direction: row;
        align-items: center;
    }
    
    .card-content {
        flex: 1;
    }
    
    .card-actions {
        flex-shrink: 0;
    }
}
```

## Performance Considerations

### Layout Optimization
Per `10_Performance_Vision.md` performance targets:

```css
/* Prevent Layout Thrashing */
.layout-stable {
    contain: layout style;
}

/* Optimize Animations */
.layout-animate {
    will-change: transform;
    transform: translateZ(0); /* Hardware acceleration */
}

/* Efficient Grid */
.grid-efficient {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
}
```

### Loading States
```css
/* Skeleton Loading */
.skeleton {
    background: linear-gradient(90deg, var(--light-gray) 25%, var(--gray) 50%, var(--light-gray) 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
```

## Accessibility Layout Features

### Focus Management
Per `08_User_Experience_Vision.md` accessibility:

```css
/* Skip Navigation */
.skip-nav {
    position: absolute;
    top: -40px;
    left: 6px;
    background: var(--primary);
    color: var(--text-light);
    padding: var(--spacing-sm);
    text-decoration: none;
    border-radius: 4px;
    z-index: 1001;
}

.skip-nav:focus {
    top: 6px;
}

/* Focus Containers */
.focus-container:focus-within {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
    border-radius: 4px;
}
```

### Screen Reader Layout
```css
/* Screen Reader Only Content */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Landmark Regions */
main {
    scroll-margin-top: 2rem;
}
```

## Integration with Architecture

This layout vision supports:
- `01_Project_Vision.md`: Scalable, template-based architecture
- `02_Styling_Vision.md`: Responsive design and spacing systems
- `03_Components_Vision.md`: Component-based layout building blocks
- `05_Sports_Page_Vision.md`: Sports-specific layout requirements
- `08_User_Experience_Vision.md`: User-centered layout organization
- `10_Performance_Vision.md`: Optimized rendering and loading

## Layout Maintenance

### Design System Integration
- **Grid Variables**: Centralized grid configuration in CSS custom properties
- **Responsive Utilities**: Helper classes for common responsive patterns
- **Layout Testing**: Automated tests for layout consistency per `12_Testing_Vision.md`
- **Performance Monitoring**: Regular audits of layout performance impact

The layout vision ensures Winzo delivers consistent, accessible, and performant page structures that adapt seamlessly across all devices while supporting the platform's content hierarchy and user experience goals.