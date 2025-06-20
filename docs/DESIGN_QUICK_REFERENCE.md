# WINZO Design Quick Reference

## 🎨 Color Palette

### Primary Colors
```css
/* Trust & Stability */
--color-primary: #1a365d;        /* Navy Blue */
--color-primary-light: #2d5a87;
--color-primary-dark: #0f172a;

/* Premium & Success */
--color-secondary: #d69e2e;      /* Gold */
--color-secondary-light: #f6e05e;
--color-secondary-dark: #b7791f;

/* Success & Growth */
--color-success: #38a169;        /* Emerald Green */
--color-success-light: #68d391;
--color-success-dark: #2f855a;

/* Warning & Attention */
--color-warning: #ed8936;        /* Orange */
--color-warning-light: #f6ad55;
--color-warning-dark: #dd6b20;

/* Danger & Urgency */
--color-danger: #e53e3e;         /* Red */
--color-danger-light: #fc8181;
--color-danger-dark: #c53030;
```

### Neutral Colors
```css
--color-neutral-50: #f8fafc;     /* Light Background */
--color-neutral-100: #f1f5f9;
--color-neutral-200: #e2e8f0;    /* Borders */
--color-neutral-300: #cbd5e0;
--color-neutral-400: #94a3b8;    /* Muted Text */
--color-neutral-500: #64748b;    /* Secondary Text */
--color-neutral-600: #475569;
--color-neutral-700: #334155;
--color-neutral-800: #1e293b;    /* Primary Text */
--color-neutral-900: #0f172a;
```

## 📝 Typography

### Font Family
```css
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Typography Scale
```css
--text-xs: 0.75rem;      /* 12px - Legal disclaimers */
--text-sm: 0.875rem;     /* 14px - Captions */
--text-base: 1rem;       /* 16px - Body text */
--text-lg: 1.125rem;     /* 18px - Large body */
--text-xl: 1.25rem;      /* 20px - Section headers */
--text-2xl: 1.5rem;      /* 24px - Major headings */
--text-3xl: 1.875rem;    /* 30px - Hero headings */
--text-4xl: 2.25rem;     /* 36px - Display text */
```

### Font Weights
```css
--font-weight-normal: 400;   /* Body text */
--font-weight-medium: 600;   /* Emphasis & subheadings */
--font-weight-bold: 700;     /* Headings */
```

## 📏 Spacing System

### Base Unit: 4px (0.25rem)
```css
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
--space-32: 8rem;        /* 128px */
```

## 🔲 Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem;    /* 4px */
--radius-md: 0.375rem;   /* 6px */
--radius-lg: 0.5rem;     /* 8px */
--radius-xl: 0.75rem;    /* 12px */
--radius-2xl: 1rem;      /* 16px */
--radius-3xl: 1.5rem;    /* 24px */
--radius-full: 9999px;
```

## 🌟 Shadows

```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

### Brand Shadows
```css
--shadow-gold: 0 4px 15px rgba(214, 158, 46, 0.3);
--shadow-success: 0 4px 15px rgba(56, 161, 105, 0.3);
--shadow-warning: 0 4px 15px rgba(237, 137, 54, 0.3);
--shadow-danger: 0 4px 15px rgba(229, 62, 62, 0.3);
```

## 🎯 Component Examples

### Primary Button
```css
.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-medium);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--color-primary-light);
  transform: scale(1.02);
  box-shadow: var(--shadow-md);
}
```

### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-medium);
  border: 2px solid var(--color-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--color-primary);
  color: white;
}
```

### Card Component
```css
.card {
  background: white;
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

### Form Input
```css
.form-input {
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(26, 54, 93, 0.1);
}
```

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 767px) {
  /* Mobile-specific styles */
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  /* Tablet-specific styles */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Desktop-specific styles */
}
```

## 🎨 Brand Color Usage

### Trust & Professional
- **Primary Actions**: Navy Blue (#1a365d)
- **Navigation**: Navy Blue
- **Headers**: Navy Blue
- **Critical Information**: Navy Blue

### Success & Achievement
- **Winning Bets**: Emerald Green (#38a169)
- **Successful Transactions**: Emerald Green
- **Positive Actions**: Emerald Green
- **Confirmation Messages**: Emerald Green

### Premium & Highlight
- **Call-to-Action**: Gold (#d69e2e)
- **Accents**: Gold
- **Success States**: Gold
- **Important Highlights**: Gold

### Warning & Attention
- **Important Alerts**: Orange (#ed8936)
- **Pending Actions**: Orange
- **Cautions**: Orange
- **Attention Required**: Orange

### Danger & Errors
- **Error Messages**: Red (#e53e3e)
- **Failed Transactions**: Red
- **Critical Alerts**: Red
- **Delete Actions**: Red

## 🔤 Typography Usage

### Display Text (36px)
- Hero headings
- Major page titles
- Brand statements

### Title Text (30px)
- Section headers
- Major content titles
- Page headings

### Subtitle Text (20px)
- Subsection headers
- Card titles
- Feature headings

### Body Text (16px)
- Main content
- Descriptions
- General text

### Caption Text (14px)
- Supplementary information
- Labels
- Secondary content

### Small Text (12px)
- Legal disclaimers
- Fine print
- Metadata

## 🎯 Accessibility Guidelines

### Color Contrast
- **Normal Text**: Minimum 4.5:1 ratio
- **Large Text**: Minimum 3:1 ratio
- **UI Components**: Minimum 3:1 ratio

### Focus States
```css
:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Touch Targets
- **Minimum Size**: 44px × 44px
- **Spacing**: At least 8px between targets

## 🚀 Performance Tips

### CSS Optimization
- Use CSS custom properties for consistency
- Minimize specificity conflicts
- Use efficient selectors
- Optimize for critical rendering path

### Animation Guidelines
```css
/* Smooth transitions */
transition: all 0.2s ease;

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  transition: none;
}
```

## 📋 Design Checklist

### Before Implementation
- [ ] Colors follow brand guidelines
- [ ] Typography hierarchy is clear
- [ ] Spacing is consistent
- [ ] Components are accessible
- [ ] Responsive design is implemented
- [ ] Performance is optimized

### After Implementation
- [ ] Cross-browser compatibility tested
- [ ] Mobile devices tested
- [ ] Accessibility standards met
- [ ] Performance benchmarks achieved
- [ ] User experience validated

---

**Quick Reference Version:** 1.0  
**Last Updated:** December 2024  
**For full documentation:** [Design Philosophy & Brand Guidelines](./DESIGN_PHILOSOPHY.md) 