# WINZO Phase 1 Implementation Guide

## Quick Start Guide

### 1. Import the Design System

Add the design system to your component:

```tsx
import '../styles/design-system.css';
```

### 2. Use Standardized Components

#### Buttons
```tsx
// Primary action button
<button className="btn btn-primary">Place Bet</button>

// Secondary action button
<button className="btn btn-secondary">Cancel</button>

// Success state
<button className="btn btn-success">Deposit</button>

// Warning state
<button className="btn btn-warning">Withdraw</button>

// Danger state
<button className="btn btn-danger">Delete</button>

// Outline style
<button className="btn btn-outline">Learn More</button>

// Ghost style
<button className="btn btn-ghost">Settings</button>
```

#### Forms
```tsx
<div className="form-group">
  <label className="form-label">Bet Amount</label>
  <input
    type="number"
    className="form-input"
    placeholder="Enter amount"
    min="1"
  />
  <div className="form-help">Minimum bet: $1.00</div>
  <div className="form-error">Please enter a valid amount</div>
</div>
```

#### Cards
```tsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Betting History</h3>
    <p className="card-subtitle">Your recent bets</p>
  </div>
  <div className="card-content">
    <p className="text-body">Content goes here...</p>
  </div>
  <div className="card-footer">
    <button className="btn btn-primary btn-sm">View All</button>
  </div>
</div>
```

#### Badges
```tsx
<span className="badge badge-success">Won</span>
<span className="badge badge-warning">Pending</span>
<span className="badge badge-danger">Lost</span>
<span className="badge badge-primary">Live</span>
```

#### Alerts
```tsx
<div className="alert alert-success">
  <strong>Success:</strong> Your bet has been placed!
</div>

<div className="alert alert-error">
  <strong>Error:</strong> Please check your payment details.
</div>
```

### 3. Use Typography Classes

```tsx
<h1 className="text-display">Main Heading</h1>
<h2 className="text-title">Section Title</h2>
<p className="text-body">Body text content</p>
<p className="text-caption">Supplementary information</p>
<p className="text-small">Legal disclaimers</p>
```

### 4. Use Layout Utilities

```tsx
// Container
<div className="container">
  <div className="grid grid-2">
    <div className="card">Content 1</div>
    <div className="card">Content 2</div>
  </div>
</div>

// Flexbox
<div className="flex items-center justify-between">
  <span>Left content</span>
  <span>Right content</span>
</div>

// Spacing
<div className="p-4 m-2">
  <p className="mb-4">Content with margin bottom</p>
</div>
```

### 5. Use Color Utilities

```tsx
<p className="text-primary">Primary text</p>
<p className="text-success">Success text</p>
<p className="text-warning">Warning text</p>
<p className="text-danger">Danger text</p>
<p className="text-muted">Muted text</p>
```

## Error Handling

### Using the Error Handler

```tsx
import ErrorHandler from './ErrorHandler';

// In your component
const [error, setError] = useState(null);

const handleSubmit = async () => {
  try {
    await submitBet();
  } catch (err) {
    setError(err);
  }
};

// In your JSX
<ErrorHandler 
  error={error} 
  onRetry={handleSubmit}
  onDismiss={() => setError(null)}
/>
```

### Using Error Boundaries

```tsx
import { ErrorBoundary } from './ErrorHandler';

// Wrap your app or component
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

## Navigation

### Using Simplified Navigation

```tsx
import SimplifiedNavigation from './SimplifiedNavigation';

// In your app
<SimplifiedNavigation 
  user={user}
  onLogout={handleLogout}
/>
```

## Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 768px
- **Desktop**: 768px - 1024px
- **Large Desktop**: > 1024px

### Responsive Classes
```tsx
// Hide on mobile
<div className="desktop-only">Desktop only content</div>

// Show on mobile
<div className="mobile-only">Mobile only content</div>

// Responsive grid
<div className="grid grid-1 grid-tablet-2 grid-desktop-3">
  {/* Content */}
</div>
```

## Accessibility

### Focus States
All interactive elements have proper focus states. Use keyboard navigation to test.

### Screen Readers
Use semantic HTML and proper ARIA labels:

```tsx
<button 
  className="btn btn-primary"
  aria-label="Place bet for $10"
>
  Place Bet
</button>
```

### Reduced Motion
The design system respects `prefers-reduced-motion` user preference.

## Touch Optimization

### Touch Targets
All interactive elements meet 44px minimum touch target requirements.

### Touch Feedback
Buttons and interactive elements provide visual feedback on touch devices.

## Migration Strategy

### 1. Gradual Adoption
- Start with new components
- Gradually replace existing components
- Use the component library as reference

### 2. Testing
- Test on multiple devices and browsers
- Verify touch target compliance
- Check accessibility with screen readers

### 3. Documentation
- Document component usage patterns
- Create style guide for team reference
- Maintain component library examples

## Common Patterns

### Form Validation
```tsx
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});

const handleSubmit = (e) => {
  e.preventDefault();
  const validationErrors = validateForm(formData);
  
  if (Object.keys(validationErrors).length === 0) {
    submitForm(formData);
  } else {
    setErrors(validationErrors);
  }
};

return (
  <form onSubmit={handleSubmit}>
    <div className="form-group">
      <label className="form-label">Amount</label>
      <input
        type="number"
        className={`form-input ${errors.amount ? 'error' : ''}`}
        value={formData.amount}
        onChange={(e) => setFormData({...formData, amount: e.target.value})}
      />
      {errors.amount && <div className="form-error">{errors.amount}</div>}
    </div>
    <button type="submit" className="btn btn-primary">Submit</button>
  </form>
);
```

### Loading States
```tsx
const [isLoading, setIsLoading] = useState(false);

return (
  <button 
    className="btn btn-primary" 
    disabled={isLoading}
    onClick={handleAction}
  >
    {isLoading ? (
      <>
        <span className="spinner"></span>
        Loading...
      </>
    ) : (
      'Action'
    )}
  </button>
);
```

### Conditional Rendering
```tsx
{error && (
  <div className="alert alert-error">
    <strong>Error:</strong> {error.message}
  </div>
)}

{success && (
  <div className="alert alert-success">
    <strong>Success:</strong> {success.message}
  </div>
)}
```

## Best Practices

### 1. Consistency
- Use design system components consistently
- Follow established patterns
- Maintain visual hierarchy

### 2. Accessibility
- Always provide alternative text
- Use semantic HTML
- Test with keyboard navigation

### 3. Performance
- Use CSS custom properties for theming
- Minimize CSS bundle size
- Optimize for mobile performance

### 4. User Experience
- Provide clear feedback for user actions
- Handle errors gracefully
- Optimize for touch interactions

## Support

For questions or issues with the design system:
1. Check the component library examples
2. Review the design system documentation
3. Test with the provided examples
4. Consult the implementation summary

## Next Steps

1. **Start using the design system** in new components
2. **Test thoroughly** on different devices and browsers
3. **Provide feedback** on component usage and improvements
4. **Prepare for Phase 2** implementation

---

**Remember**: The design system is designed to be flexible and maintainable. Use it consistently, and it will help create a better user experience across the entire WINZO platform. 