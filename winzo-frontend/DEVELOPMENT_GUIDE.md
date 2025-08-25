# Winzo Frontend Development Guide

## Quick Reference for Cursor AI

### Tech Stack
- **HTML**: Semantic HTML5 with accessibility focus
- **CSS**: Vanilla CSS3 with CSS Grid and Flexbox
- **JavaScript**: ES6+ vanilla JS only
- **No frameworks, libraries, or external dependencies**

### File Structure
```
winzo-frontend/
├── index.html          # Main landing page
├── sport_template.html # Sports page template
├── style.css          # All styles (organized by sections)
├── script.js          # Basic interactions only
├── README.md          # Project documentation
├── .cursorrules       # Cursor AI rules
├── .cursorignore      # Cursor AI ignore patterns
├── DEVELOPMENT_GUIDE.md # This file
└── vision-documents/  # Project vision files
```

### CSS Organization Structure
```css
/* ========================================
   RESETS & BASE STYLES
   ======================================== */

/* ========================================
   CSS VARIABLES
   ======================================== */

/* ========================================
   TYPOGRAPHY
   ======================================== */

/* ========================================
   LAYOUT & GRID
   ======================================== */

/* ========================================
   COMPONENTS
   ======================================== */

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */
```

### Color Palette (CSS Variables)
```css
:root {
    /* Primary Colors */
    --primary: #007BFF;
    --primary-dark: #0056b3;
    --primary-light: #4da6ff;
    
    /* Secondary Colors */
    --secondary: #6c757d;
    --secondary-dark: #495057;
    --secondary-light: #adb5bd;
    
    /* Accent Colors */
    --accent: #28a745;
    --accent-dark: #1e7e34;
    --accent-light: #48c774;
    
    /* Neutral Colors */
    --white: #ffffff;
    --light-gray: #f8f9fa;
    --gray: #dee2e6;
    --dark-gray: #343a40;
    --black: #000000;
    
    /* Status Colors */
    --success: #28a745;
    --warning: #ffc107;
    --error: #dc3545;
    --info: #17a2b8;
}
```

### Typography Scale
```css
/* Typography Scale (rem-based) */
--font-size-xs: 0.75rem;   /* 12px */
--font-size-sm: 0.875rem;  /* 14px */
--font-size-base: 1rem;    /* 16px */
--font-size-lg: 1.125rem;  /* 18px */
--font-size-xl: 1.25rem;   /* 20px */
--font-size-2xl: 1.5rem;   /* 24px */
--font-size-3xl: 1.875rem; /* 30px */
--font-size-4xl: 2.25rem;  /* 36px */
```

### Spacing Rhythm
```css
/* Spacing Rhythm (multiples of 0.5rem) */
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
```

### Breakpoints
```css
/* Mobile First Breakpoints */
/* Base styles: < 768px */
@media (min-width: 768px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Large Desktop */ }
```

### Grid System
```css
/* 12-Column Grid System */
.container {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: var(--spacing-md);
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-md);
}

/* Grid Spans */
.col-1 { grid-column: span 1; }
.col-2 { grid-column: span 2; }
.col-3 { grid-column: span 3; }
.col-4 { grid-column: span 4; }
.col-6 { grid-column: span 6; }
.col-8 { grid-column: span 8; }
.col-12 { grid-column: span 12; }

/* Responsive Grid */
@media (max-width: 767px) {
    .col-1, .col-2, .col-3, .col-4, .col-6, .col-8 {
        grid-column: span 12;
    }
}
```

### Component Patterns

#### Button Component
```css
.btn {
    display: inline-block;
    padding: var(--spacing-sm) var(--spacing-md);
    border: 2px solid transparent;
    border-radius: 4px;
    font-size: var(--font-size-base);
    font-weight: 600;
    text-decoration: none;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
    line-height: 1.5;
}

.btn-primary {
    background-color: var(--primary);
    color: var(--white);
    border-color: var(--primary);
}

.btn-primary:hover {
    background-color: var(--primary-dark);
    border-color: var(--primary-dark);
}

.btn-outline {
    background-color: transparent;
    color: var(--primary);
    border-color: var(--primary);
}

.btn-outline:hover {
    background-color: var(--primary);
    color: var(--white);
}
```

#### Form Component
```css
.form-group {
    margin-bottom: var(--spacing-md);
}

.form-label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-weight: 600;
    color: var(--dark-gray);
}

.form-input {
    width: 100%;
    padding: var(--spacing-sm);
    border: 2px solid var(--gray);
    border-radius: 4px;
    font-size: var(--font-size-base);
    transition: border-color 0.2s ease;
}

.form-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}
```

### Accessibility Requirements
- **Focus States**: All interactive elements must have visible focus indicators
- **Contrast Ratios**: Minimum 4.5:1 for normal text, 3:1 for large text
- **ARIA Labels**: Use appropriate ARIA attributes for complex components
- **Semantic HTML**: Use proper HTML5 semantic tags
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible

### Testing Checklist (After Each Phase)
1. **Browser Testing**: Open in Chrome, Firefox, Safari, Edge
2. **Responsive Testing**: Resize browser window, test mobile/tablet/desktop
3. **Accessibility Testing**: Check focus states, contrast ratios
4. **Console Testing**: Check for JavaScript errors
5. **Cross-Platform**: Test on Windows, macOS if possible

### Common Patterns to Avoid
- ❌ Inline styles
- ❌ !important declarations
- ❌ Deep CSS selectors (more than 3 levels)
- ❌ Fixed pixel values (use rem/em)
- ❌ Vendor prefixes (use modern CSS)
- ❌ Complex JavaScript (keep it simple)

### Vision Document References
When implementing features, reference the specific vision document:
- `01_Project_Vision.md` - Overall project goals
- `02_Styling_Vision.md` - Design system and styling
- `03_Components_Vision.md` - Component architecture
- `04_Layout_Vision.md` - Layout and grid systems
- `05_Sports_Page_Vision.md` - Sports-specific features
- `06_Deployment_Vision.md` - Deployment and hosting

### Example Comment Format
```css
/* Per 02_Styling_Vision.md: Use --primary for CTAs */
.btn-primary {
    background-color: var(--primary);
}
```

This guide should be referenced by Cursor AI for all code generation, ensuring consistency with the project's vision and development standards.
