# WINZO Platform CSS Variables & Component Library

## CSS Variables Implementation

### Master Variables File (`variables.css`)

```css
/* ===================================
   WINZO PLATFORM CSS VARIABLES
   ================================= */

:root {
  /* ===== COLOR SYSTEM ===== */
  
  /* Primary Brand Colors */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  
  /* Accent Gold Colors */
  --color-accent-50: #fffbeb;
  --color-accent-100: #fef3c7;
  --color-accent-200: #fde68a;
  --color-accent-300: #fcd34d;
  --color-accent-400: #fbbf24;
  --color-accent-500: #f59e0b;
  --color-accent-600: #d97706;
  --color-accent-700: #b45309;
  --color-accent-800: #92400e;
  --color-accent-900: #78350f;
  
  /* Neutral Gray Scale */
  --color-neutral-0: #ffffff;
  --color-neutral-50: #f9fafb;
  --color-neutral-100: #f3f4f6;
  --color-neutral-200: #e5e7eb;
  --color-neutral-300: #d1d5db;
  --color-neutral-400: #9ca3af;
  --color-neutral-500: #6b7280;
  --color-neutral-600: #4b5563;
  --color-neutral-700: #374151;
  --color-neutral-800: #1f2937;
  --color-neutral-900: #111827;
  
  /* Status Colors */
  --color-success-50: #ecfdf5;
  --color-success-100: #d1fae5;
  --color-success-500: #10b981;
  --color-success-600: #059669;
  --color-success-700: #047857;
  
  --color-error-50: #fef2f2;
  --color-error-100: #fee2e2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  --color-error-700: #b91c1c;
  
  --color-warning-50: #fffbeb;
  --color-warning-100: #fef3c7;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  
  --color-info-50: #eff6ff;
  --color-info-100: #dbeafe;
  --color-info-500: #3b82f6;
  --color-info-600: #2563eb;
  
  /* ===== TYPOGRAPHY ===== */
  
  /* Font Families */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', Consolas, 'Liberation Mono', monospace;
  
  /* Font Sizes */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
  
  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
  
  /* Font Weights */
  --font-thin: 100;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  --font-black: 900;
  
  /* ===== SPACING SYSTEM ===== */
  
  /* Base spacing unit: 4px */
  --space-0: 0;
  --space-px: 1px;
  --space-0-5: 0.125rem;   /* 2px */
  --space-1: 0.25rem;      /* 4px */
  --space-1-5: 0.375rem;   /* 6px */
  --space-2: 0.5rem;       /* 8px */
  --space-2-5: 0.625rem;   /* 10px */
  --space-3: 0.75rem;      /* 12px */
  --space-3-5: 0.875rem;   /* 14px */
  --space-4: 1rem;         /* 16px */
  --space-5: 1.25rem;      /* 20px */
  --space-6: 1.5rem;       /* 24px */
  --space-7: 1.75rem;      /* 28px */
  --space-8: 2rem;         /* 32px */
  --space-9: 2.25rem;      /* 36px */
  --space-10: 2.5rem;      /* 40px */
  --space-11: 2.75rem;     /* 44px */
  --space-12: 3rem;        /* 48px */
  --space-14: 3.5rem;      /* 56px */
  --space-16: 4rem;        /* 64px */
  --space-20: 5rem;        /* 80px */
  --space-24: 6rem;        /* 96px */
  --space-28: 7rem;        /* 112px */
  --space-32: 8rem;        /* 128px */
  
  /* ===== BORDER RADIUS ===== */
  
  --radius-none: 0;
  --radius-sm: 0.125rem;   /* 2px */
  --radius-base: 0.25rem;  /* 4px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-3xl: 1.5rem;    /* 24px */
  --radius-full: 9999px;
  
  /* ===== SHADOWS ===== */
  
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  
  /* Colored Shadows */
  --shadow-primary: 0 4px 12px rgba(30, 58, 138, 0.15);
  --shadow-accent: 0 4px 12px rgba(245, 158, 11, 0.15);
  --shadow-success: 0 4px 12px rgba(16, 185, 129, 0.15);
  --shadow-error: 0 4px 12px rgba(239, 68, 68, 0.15);
  
  /* ===== TRANSITIONS ===== */
  
  --transition-none: none;
  --transition-all: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-fast: all 100ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Easing Functions */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* ===== Z-INDEX SCALE ===== */
  
  --z-0: 0;
  --z-10: 10;
  --z-20: 20;
  --z-30: 30;
  --z-40: 40;
  --z-50: 50;
  --z-auto: auto;
  
  /* Component Z-Index */
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
  --z-toast: 1080;
  
  /* ===== BREAKPOINTS ===== */
  
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
  
  /* ===== COMPONENT SPECIFIC ===== */
  
  /* Sidebar */
  --sidebar-width: 280px;
  --sidebar-width-collapsed: 64px;
  
  /* Header */
  --header-height: 64px;
  
  /* Bottom Navigation */
  --bottom-nav-height: 64px;
  
  /* Bet Slip */
  --bet-slip-width: 320px;
  
  /* Touch Targets */
  --touch-target-min: 44px;
  
  /* Content Max Width */
  --content-max-width: 1200px;
}

/* ===== DARK MODE OVERRIDES ===== */

@media (prefers-color-scheme: dark) {
  :root {
    --color-neutral-0: #111827;
    --color-neutral-50: #1f2937;
    --color-neutral-100: #374151;
    --color-neutral-200: #4b5563;
    --color-neutral-300: #6b7280;
    --color-neutral-400: #9ca3af;
    --color-neutral-500: #d1d5db;
    --color-neutral-600: #e5e7eb;
    --color-neutral-700: #f3f4f6;
    --color-neutral-800: #f9fafb;
    --color-neutral-900: #ffffff;
  }
}

/* ===== SEMANTIC COLOR ALIASES ===== */

:root {
  /* Background Colors */
  --bg-primary: var(--color-neutral-0);
  --bg-secondary: var(--color-neutral-50);
  --bg-tertiary: var(--color-neutral-100);
  
  /* Text Colors */
  --text-primary: var(--color-neutral-900);
  --text-secondary: var(--color-neutral-600);
  --text-tertiary: var(--color-neutral-500);
  --text-quaternary: var(--color-neutral-400);
  
  /* Border Colors */
  --border-primary: var(--color-neutral-200);
  --border-secondary: var(--color-neutral-300);
  --border-focus: var(--color-primary-500);
  
  /* Interactive Colors */
  --interactive-primary: var(--color-primary-600);
  --interactive-primary-hover: var(--color-primary-700);
  --interactive-secondary: var(--color-neutral-600);
  --interactive-secondary-hover: var(--color-neutral-700);
  --interactive-accent: var(--color-accent-500);
  --interactive-accent-hover: var(--color-accent-600);
}
```

## Component Library Specifications

### Base Component Classes

#### Reset and Base Styles
```css
/* ===== BASE RESET ===== */

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-primary);
  line-height: var(--leading-normal);
  -webkit-text-size-adjust: 100%;
  -moz-tab-size: 4;
  tab-size: 4;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ===== TYPOGRAPHY BASE ===== */

h1, h2, h3, h4, h5, h6 {
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  color: var(--text-primary);
}

h1 { font-size: var(--text-3xl); }
h2 { font-size: var(--text-2xl); }
h3 { font-size: var(--text-xl); }
h4 { font-size: var(--text-lg); }
h5 { font-size: var(--text-base); }
h6 { font-size: var(--text-sm); }

p {
  margin-bottom: var(--space-4);
  color: var(--text-secondary);
}

a {
  color: var(--interactive-primary);
  text-decoration: none;
  transition: var(--transition-fast);
}

a:hover {
  color: var(--interactive-primary-hover);
  text-decoration: underline;
}
```

### Button Components

#### Primary Button
```css
.btn {
  /* Base button styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-primary);
  font-weight: var(--font-medium);
  text-align: center;
  text-decoration: none;
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-normal);
  user-select: none;
  white-space: nowrap;
  
  /* Prevent button text selection */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  
  /* Focus styles */
  &:focus {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }
  
  /* Disabled styles */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
}

/* Button Sizes */
.btn-xs {
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  min-height: var(--space-6);
}

.btn-sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  min-height: var(--space-8);
}

.btn-md {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  min-height: var(--space-10);
}

.btn-lg {
  padding: var(--space-4) var(--space-6);
  font-size: var(--text-base);
  min-height: var(--space-12);
}

.btn-xl {
  padding: var(--space-5) var(--space-8);
  font-size: var(--text-lg);
  min-height: var(--space-14);
}

/* Button Variants */
.btn-primary {
  background-color: var(--interactive-primary);
  color: var(--color-neutral-0);
  border-color: var(--interactive-primary);
  
  &:hover:not(:disabled) {
    background-color: var(--interactive-primary-hover);
    border-color: var(--interactive-primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-primary);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.btn-secondary {
  background-color: transparent;
  color: var(--interactive-primary);
  border-color: var(--interactive-primary);
  
  &:hover:not(:disabled) {
    background-color: var(--interactive-primary);
    color: var(--color-neutral-0);
    transform: translateY(-1px);
  }
}

.btn-accent {
  background-color: var(--interactive-accent);
  color: var(--color-neutral-0);
  border-color: var(--interactive-accent);
  
  &:hover:not(:disabled) {
    background-color: var(--interactive-accent-hover);
    border-color: var(--interactive-accent-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-accent);
  }
}

.btn-ghost {
  background-color: transparent;
  color: var(--text-secondary);
  border-color: transparent;
  
  &:hover:not(:disabled) {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
  }
}

.btn-danger {
  background-color: var(--color-error-500);
  color: var(--color-neutral-0);
  border-color: var(--color-error-500);
  
  &:hover:not(:disabled) {
    background-color: var(--color-error-600);
    border-color: var(--color-error-600);
    transform: translateY(-1px);
    box-shadow: var(--shadow-error);
  }
}

/* Button with Icon */
.btn-icon {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-icon-only {
  padding: var(--space-3);
  aspect-ratio: 1;
}

/* Full Width Button */
.btn-full {
  width: 100%;
}

/* Button Group */
.btn-group {
  display: inline-flex;
  
  .btn {
    border-radius: 0;
    
    &:first-child {
      border-top-left-radius: var(--radius-lg);
      border-bottom-left-radius: var(--radius-lg);
    }
    
    &:last-child {
      border-top-right-radius: var(--radius-lg);
      border-bottom-right-radius: var(--radius-lg);
    }
    
    &:not(:first-child) {
      border-left-width: 0;
    }
  }
}
```

### Card Components

```css
.card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-normal);
  overflow: hidden;
}

.card-hover {
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }
}

.card-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-primary);
  background-color: var(--bg-secondary);
}

.card-body {
  padding: var(--space-6);
}

.card-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--border-primary);
  background-color: var(--bg-secondary);
}

/* Card Variants */
.card-elevated {
  box-shadow: var(--shadow-lg);
  border: none;
}

.card-bordered {
  border: 2px solid var(--border-primary);
}

.card-compact {
  .card-header,
  .card-body,
  .card-footer {
    padding: var(--space-4);
  }
}

/* Metric Card */
.metric-card {
  text-align: center;
  padding: var(--space-6);
  
  .metric-value {
    font-size: var(--text-3xl);
    font-weight: var(--font-bold);
    font-family: var(--font-mono);
    color: var(--interactive-primary);
    line-height: var(--leading-none);
  }
  
  .metric-label {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    margin-top: var(--space-2);
    font-weight: var(--font-medium);
  }
  
  .metric-change {
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    margin-top: var(--space-1);
    
    &.positive {
      color: var(--color-success-600);
    }
    
    &.negative {
      color: var(--color-error-600);
    }
  }
}
```

### Form Components

```css
/* Form Group */
.form-group {
  margin-bottom: var(--space-6);
}

/* Labels */
.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  
  &.required::after {
    content: ' *';
    color: var(--color-error-500);
  }
}

/* Input Fields */
.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  font-family: var(--font-primary);
  background-color: var(--bg-primary);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-lg);
  transition: var(--transition-fast);
  
  &::placeholder {
    color: var(--text-quaternary);
  }
  
  &:focus {
    outline: none;
    border-color: var(--border-focus);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    background-color: var(--bg-tertiary);
    color: var(--text-quaternary);
    cursor: not-allowed;
  }
  
  &.error {
    border-color: var(--color-error-500);
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  }
  
  &.success {
    border-color: var(--color-success-500);
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
  }
}

/* Input Sizes */
.form-input-sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
}

.form-input-lg {
  padding: var(--space-4) var(--space-5);
  font-size: var(--text-lg);
}

/* Select */
.form-select {
  @extend .form-input;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right var(--space-3) center;
  background-repeat: no-repeat;
  background-size: 16px 12px;
  padding-right: var(--space-10);
  appearance: none;
}

/* Textarea */
.form-textarea {
  @extend .form-input;
  resize: vertical;
  min-height: var(--space-24);
}

/* Checkbox and Radio */
.form-checkbox,
.form-radio {
  width: var(--space-4);
  height: var(--space-4);
  border: 2px solid var(--border-primary);
  background-color: var(--bg-primary);
  transition: var(--transition-fast);
  
  &:checked {
    background-color: var(--interactive-primary);
    border-color: var(--interactive-primary);
  }
  
  &:focus {
    outline: 2px solid var(--border-focus);
    outline-offset: 2px;
  }
}

.form-checkbox {
  border-radius: var(--radius-base);
}

.form-radio {
  border-radius: var(--radius-full);
}

/* Form Help Text */
.form-help {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-top: var(--space-1);
}

.form-error {
  font-size: var(--text-xs);
  color: var(--color-error-600);
  margin-top: var(--space-1);
  font-weight: var(--font-medium);
}

/* Input Group */
.input-group {
  display: flex;
  
  .form-input {
    border-radius: 0;
    
    &:first-child {
      border-top-left-radius: var(--radius-lg);
      border-bottom-left-radius: var(--radius-lg);
    }
    
    &:last-child {
      border-top-right-radius: var(--radius-lg);
      border-bottom-right-radius: var(--radius-lg);
    }
    
    &:not(:first-child) {
      border-left-width: 0;
    }
  }
}

.input-addon {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  background-color: var(--bg-secondary);
  border: 2px solid var(--border-primary);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  white-space: nowrap;
  
  &:first-child {
    border-top-left-radius: var(--radius-lg);
    border-bottom-left-radius: var(--radius-lg);
    border-right: none;
  }
  
  &:last-child {
    border-top-right-radius: var(--radius-lg);
    border-bottom-right-radius: var(--radius-lg);
    border-left: none;
  }
}
```


### Navigation Components

```css
/* ===== DESKTOP SIDEBAR ===== */

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background-color: var(--color-neutral-900);
  border-right: 1px solid var(--color-neutral-800);
  z-index: var(--z-fixed);
  overflow-y: auto;
  transition: var(--transition-normal);
}

.sidebar-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-neutral-800);
  
  .logo {
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    color: var(--color-neutral-0);
  }
}

.sidebar-nav {
  padding: var(--space-4) 0;
}

.sidebar-section {
  margin-bottom: var(--space-6);
  
  .section-title {
    padding: 0 var(--space-6) var(--space-2);
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    color: var(--color-neutral-400);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-6);
  color: var(--color-neutral-300);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: var(--transition-fast);
  border-left: 3px solid transparent;
  
  .icon {
    width: var(--space-5);
    height: var(--space-5);
    margin-right: var(--space-3);
    flex-shrink: 0;
  }
  
  &:hover {
    background-color: var(--color-neutral-800);
    color: var(--color-neutral-0);
  }
  
  &.active {
    background-color: var(--color-primary-900);
    color: var(--color-neutral-0);
    border-left-color: var(--color-primary-500);
  }
  
  .badge {
    margin-left: auto;
    background-color: var(--color-primary-500);
    color: var(--color-neutral-0);
    font-size: var(--text-xs);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
    min-width: var(--space-5);
    text-align: center;
  }
}

/* Collapsed Sidebar */
.sidebar-collapsed {
  width: var(--sidebar-width-collapsed);
  
  .sidebar-header .logo {
    text-align: center;
  }
  
  .sidebar-item {
    justify-content: center;
    padding-left: var(--space-4);
    padding-right: var(--space-4);
    
    .icon {
      margin-right: 0;
    }
    
    span:not(.icon) {
      display: none;
    }
  }
  
  .section-title {
    display: none;
  }
}

/* ===== MOBILE BOTTOM NAVIGATION ===== */

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--bottom-nav-height);
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-primary);
  display: flex;
  z-index: var(--z-fixed);
  
  @media (min-width: 768px) {
    display: none;
  }
}

.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2);
  color: var(--text-tertiary);
  text-decoration: none;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  transition: var(--transition-fast);
  min-height: var(--touch-target-min);
  
  .icon {
    width: var(--space-6);
    height: var(--space-6);
    margin-bottom: var(--space-1);
  }
  
  &.active {
    color: var(--interactive-primary);
  }
  
  .badge {
    position: absolute;
    top: var(--space-1);
    right: 50%;
    transform: translateX(50%);
    background-color: var(--color-error-500);
    color: var(--color-neutral-0);
    font-size: var(--text-xs);
    padding: var(--space-0-5) var(--space-1-5);
    border-radius: var(--radius-full);
    min-width: var(--space-4);
    text-align: center;
  }
}

/* ===== TOP HEADER ===== */

.header {
  position: fixed;
  top: 0;
  left: var(--sidebar-width);
  right: 0;
  height: var(--header-height);
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  align-items: center;
  padding: 0 var(--space-6);
  z-index: var(--z-sticky);
  
  @media (max-width: 767px) {
    left: 0;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.header-search {
  position: relative;
  width: 100%;
  max-width: 400px;
  
  .search-input {
    width: 100%;
    padding: var(--space-2) var(--space-4) var(--space-2) var(--space-10);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-full);
    background-color: var(--bg-secondary);
    font-size: var(--text-sm);
    
    &:focus {
      outline: none;
      border-color: var(--border-focus);
      background-color: var(--bg-primary);
    }
  }
  
  .search-icon {
    position: absolute;
    left: var(--space-3);
    top: 50%;
    transform: translateY(-50%);
    width: var(--space-4);
    height: var(--space-4);
    color: var(--text-tertiary);
  }
}

.user-menu {
  position: relative;
  
  .user-trigger {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: var(--transition-fast);
    
    &:hover {
      background-color: var(--bg-secondary);
    }
  }
  
  .user-avatar {
    width: var(--space-8);
    height: var(--space-8);
    border-radius: var(--radius-full);
    background-color: var(--color-primary-500);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-neutral-0);
    font-weight: var(--font-semibold);
  }
  
  .user-info {
    .user-name {
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-primary);
    }
    
    .user-balance {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      font-family: var(--font-mono);
    }
  }
}
```

### Sports Betting Specific Components

```css
/* ===== BET SLIP ===== */

.bet-slip {
  position: fixed;
  top: 0;
  right: 0;
  width: var(--bet-slip-width);
  height: 100vh;
  background-color: var(--bg-primary);
  border-left: 1px solid var(--border-primary);
  z-index: var(--z-fixed);
  display: flex;
  flex-direction: column;
  
  @media (max-width: 1023px) {
    transform: translateX(100%);
    transition: transform var(--transition-normal);
    
    &.open {
      transform: translateX(0);
    }
  }
}

.bet-slip-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-primary);
  background-color: var(--bg-secondary);
  
  .title {
    font-size: var(--text-lg);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
  }
  
  .count {
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }
}

.bet-slip-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
}

.bet-slip-item {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  
  .bet-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-3);
    
    .remove-btn {
      background: none;
      border: none;
      color: var(--text-tertiary);
      cursor: pointer;
      padding: var(--space-1);
      border-radius: var(--radius-base);
      
      &:hover {
        background-color: var(--color-error-100);
        color: var(--color-error-600);
      }
    }
  }
  
  .bet-details {
    .game {
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-primary);
      margin-bottom: var(--space-1);
    }
    
    .selection {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      margin-bottom: var(--space-2);
    }
    
    .odds {
      font-family: var(--font-mono);
      font-weight: var(--font-semibold);
      color: var(--interactive-primary);
    }
  }
  
  .bet-input {
    margin-top: var(--space-3);
    
    .stake-input {
      width: 100%;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-md);
      font-family: var(--font-mono);
      text-align: right;
      
      &:focus {
        outline: none;
        border-color: var(--border-focus);
      }
    }
    
    .potential-win {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      margin-top: var(--space-1);
      text-align: right;
      
      .amount {
        font-family: var(--font-mono);
        font-weight: var(--font-semibold);
        color: var(--color-success-600);
      }
    }
  }
}

.bet-slip-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--border-primary);
  background-color: var(--bg-secondary);
  
  .total-stake {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--space-2);
    font-size: var(--text-sm);
    
    .amount {
      font-family: var(--font-mono);
      font-weight: var(--font-semibold);
    }
  }
  
  .potential-payout {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--space-4);
    font-weight: var(--font-semibold);
    
    .amount {
      font-family: var(--font-mono);
      color: var(--color-success-600);
    }
  }
  
  .place-bet-btn {
    width: 100%;
    background-color: var(--color-success-500);
    color: var(--color-neutral-0);
    border: none;
    padding: var(--space-3);
    border-radius: var(--radius-lg);
    font-weight: var(--font-semibold);
    cursor: pointer;
    transition: var(--transition-fast);
    
    &:hover:not(:disabled) {
      background-color: var(--color-success-600);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

/* ===== ODDS DISPLAY ===== */

.odds-button {
  background-color: var(--bg-primary);
  border: 2px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition-fast);
  min-width: var(--space-16);
  text-align: center;
  
  &:hover {
    border-color: var(--interactive-primary);
    background-color: var(--color-primary-50);
    color: var(--interactive-primary);
  }
  
  &.selected {
    background-color: var(--interactive-accent);
    border-color: var(--interactive-accent);
    color: var(--color-neutral-0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      border-color: var(--border-primary);
      background-color: var(--bg-primary);
      color: var(--text-primary);
    }
  }
}

/* Odds Movement Indicators */
.odds-up {
  background-color: var(--color-success-50);
  border-color: var(--color-success-500);
  color: var(--color-success-700);
}

.odds-down {
  background-color: var(--color-error-50);
  border-color: var(--color-error-500);
  color: var(--color-error-700);
}

/* ===== GAME CARDS ===== */

.game-card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  margin-bottom: var(--space-4);
  transition: var(--transition-normal);
  
  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--border-secondary);
  }
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border-primary);
  
  .game-time {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    font-weight: var(--font-medium);
  }
  
  .game-status {
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-full);
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    
    &.live {
      background-color: var(--color-error-100);
      color: var(--color-error-700);
    }
    
    &.upcoming {
      background-color: var(--color-info-100);
      color: var(--color-info-700);
    }
  }
}

.game-teams {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--space-4);
  align-items: center;
  margin-bottom: var(--space-4);
  
  .team {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    
    &.away {
      justify-content: flex-end;
      flex-direction: row-reverse;
    }
    
    .team-logo {
      width: var(--space-10);
      height: var(--space-10);
      border-radius: var(--radius-md);
      background-color: var(--bg-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .team-info {
      .team-name {
        font-size: var(--text-lg);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
      }
      
      .team-record {
        font-size: var(--text-xs);
        color: var(--text-tertiary);
      }
    }
  }
  
  .vs {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    font-weight: var(--font-medium);
    text-align: center;
  }
}

.game-markets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-3);
  
  .market {
    .market-label {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      margin-bottom: var(--space-2);
      text-align: center;
      font-weight: var(--font-medium);
    }
    
    .market-options {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }
  }
}

/* ===== LIVE BETTING INDICATORS ===== */

.live-indicator {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background-color: var(--color-error-500);
  color: var(--color-neutral-0);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  
  .pulse {
    width: var(--space-2);
    height: var(--space-2);
    background-color: var(--color-neutral-0);
    border-radius: var(--radius-full);
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* ===== RESPONSIVE ADJUSTMENTS ===== */

@media (max-width: 767px) {
  .game-teams {
    grid-template-columns: 1fr;
    gap: var(--space-2);
    text-align: center;
    
    .team {
      justify-content: center;
      flex-direction: row;
    }
    
    .vs {
      display: none;
    }
  }
  
  .game-markets {
    grid-template-columns: 1fr;
    gap: var(--space-4);
    
    .market-options {
      flex-direction: row;
      justify-content: space-between;
    }
  }
}
```

### Utility Classes

```css
/* ===== LAYOUT UTILITIES ===== */

.container {
  width: 100%;
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: 0 var(--space-4);
  
  @media (min-width: 640px) {
    padding: 0 var(--space-6);
  }
  
  @media (min-width: 1024px) {
    padding: 0 var(--space-8);
  }
}

.main-content {
  margin-left: var(--sidebar-width);
  padding: var(--space-6);
  min-height: 100vh;
  
  @media (max-width: 767px) {
    margin-left: 0;
    padding: var(--space-4);
    padding-bottom: calc(var(--bottom-nav-height) + var(--space-4));
  }
}

/* Grid System */
.grid {
  display: grid;
  gap: var(--space-4);
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 767px) {
  .grid-cols-2,
  .grid-cols-3,
  .grid-cols-4 {
    grid-template-columns: 1fr;
  }
}

/* Flexbox Utilities */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-end { justify-content: flex-end; }

/* ===== SPACING UTILITIES ===== */

/* Margin */
.m-0 { margin: var(--space-0); }
.m-1 { margin: var(--space-1); }
.m-2 { margin: var(--space-2); }
.m-3 { margin: var(--space-3); }
.m-4 { margin: var(--space-4); }
.m-6 { margin: var(--space-6); }
.m-8 { margin: var(--space-8); }

.mt-0 { margin-top: var(--space-0); }
.mt-1 { margin-top: var(--space-1); }
.mt-2 { margin-top: var(--space-2); }
.mt-3 { margin-top: var(--space-3); }
.mt-4 { margin-top: var(--space-4); }
.mt-6 { margin-top: var(--space-6); }
.mt-8 { margin-top: var(--space-8); }

.mb-0 { margin-bottom: var(--space-0); }
.mb-1 { margin-bottom: var(--space-1); }
.mb-2 { margin-bottom: var(--space-2); }
.mb-3 { margin-bottom: var(--space-3); }
.mb-4 { margin-bottom: var(--space-4); }
.mb-6 { margin-bottom: var(--space-6); }
.mb-8 { margin-bottom: var(--space-8); }

/* Padding */
.p-0 { padding: var(--space-0); }
.p-1 { padding: var(--space-1); }
.p-2 { padding: var(--space-2); }
.p-3 { padding: var(--space-3); }
.p-4 { padding: var(--space-4); }
.p-6 { padding: var(--space-6); }
.p-8 { padding: var(--space-8); }

/* ===== TEXT UTILITIES ===== */

.text-xs { font-size: var(--text-xs); }
.text-sm { font-size: var(--text-sm); }
.text-base { font-size: var(--text-base); }
.text-lg { font-size: var(--text-lg); }
.text-xl { font-size: var(--text-xl); }
.text-2xl { font-size: var(--text-2xl); }
.text-3xl { font-size: var(--text-3xl); }

.font-light { font-weight: var(--font-light); }
.font-normal { font-weight: var(--font-normal); }
.font-medium { font-weight: var(--font-medium); }
.font-semibold { font-weight: var(--font-semibold); }
.font-bold { font-weight: var(--font-bold); }

.text-left { text-align: left; }
.text-center { text-align: center; }
.text-right { text-align: right; }

.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.text-tertiary { color: var(--text-tertiary); }

/* ===== VISIBILITY UTILITIES ===== */

.hidden { display: none; }
.block { display: block; }
.inline { display: inline; }
.inline-block { display: inline-block; }

@media (max-width: 767px) {
  .hidden-mobile { display: none; }
}

@media (min-width: 768px) {
  .hidden-desktop { display: none; }
}

/* ===== ANIMATION UTILITIES ===== */

.transition { transition: var(--transition-normal); }
.transition-fast { transition: var(--transition-fast); }
.transition-slow { transition: var(--transition-slow); }

.hover-lift {
  transition: transform var(--transition-normal);
}

.hover-lift:hover {
  transform: translateY(-2px);
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

This comprehensive CSS variables and component library provides:

1. **Complete Variable System**: All colors, typography, spacing, and design tokens
2. **Consistent Components**: Buttons, cards, forms, navigation with systematic styling
3. **Sports Betting Specific**: Bet slip, odds display, game cards optimized for betting
4. **Responsive Design**: Mobile-first approach with desktop enhancements
5. **Utility Classes**: Common layout, spacing, and styling utilities
6. **Accessibility**: Focus states, proper contrast, keyboard navigation
7. **Performance**: Optimized CSS with minimal specificity conflicts

This system ensures complete consistency across your platform while providing the flexibility to customize and extend as needed.

