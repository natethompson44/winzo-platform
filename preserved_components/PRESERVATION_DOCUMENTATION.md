# WINZO Platform - Preserved Components Documentation

## Overview
This directory contains the key working components that were preserved during the design system overhaul to ensure continuity of essential functionality.

## Preserved Components

### Authentication Components
**Location:** `components/`
- **HomePage.tsx** - Landing page with WINZO branding and authentication links
- **Login.tsx** - User login functionality with form validation and error handling
- **Register.tsx** - User registration with invite code requirement and validation

**Associated Styles:** `styles/HomePage.css`

### Betting Functionality
**Location:** `components/`
- **BetItem.tsx** - Individual bet item display in betslip
- **BetslipPanel.tsx** - Main betting slip interface
- **BetslipTrigger.tsx** - Trigger button for betslip panel
- **PayoutDisplay.tsx** - Bet payout calculation display
- **StakeInput.tsx** - Stake amount input component
- **ValidationDisplay.tsx** - Bet validation feedback

### Context Providers
**Location:** `contexts/`
- **AuthContext.tsx** - Authentication state management and login/logout logic
- **BetSlipContext.tsx** - Betting slip state management and bet operations

## Integration Notes

### Authentication Flow
- Login redirects to `/dashboard` (needs updating to new route structure)
- HomePage provides entry points to login and register
- AuthContext maintains authentication state across the app

### Betting Integration
- BetSlipContext provides:
  - `addBet()` - Add bet to slip
  - `removeBet()` - Remove bet from slip
  - `clearBets()` - Clear all bets
  - `placeBets()` - Submit bets to backend
- BetslipTrigger shows current bet count
- BetslipPanel provides full betting interface

### Routes to Preserve
- `/` - HomePage
- `/login` - Login page
- `/register` - Register page

## Migration Strategy

### Phase 1: Route Updates
Update login redirect from `/dashboard` to new primary route (likely `/sports`)

### Phase 2: Styling Integration
- Integrate preserved components with new CSS variables system
- Update HomePage.css to use design system tokens
- Ensure betslip components match new design language

### Phase 3: Context Integration
- Verify BetSlipContext methods match new component expectations
- Update AuthContext to work with new routing structure
- Test authentication flow with new layout

### Phase 4: Component Enhancement
- Update preserved components to use new design system
- Enhance betslip UI to match new professional design
- Add accessibility improvements

## API Dependencies

### Authentication
- Login: `POST /api/auth/login`
- Register: `POST /api/auth/register`
- Logout: `POST /api/auth/logout`

### Betting
- Place Bets: `POST /api/betting/place`
- Get Odds: `GET /api/sports/odds`

## Design System Integration

### CSS Variables to Use
```css
--winzo-navy: #1a365d
--winzo-gold: #d69e2e
--winzo-background: #f7fafc
--white: #ffffff
--danger-red: #e53e3e
--win-green: #38a169
```

### Component Libraries
- Bootstrap 5 (already integrated)
- Bootstrap Icons (already integrated)
- Nice Admin template foundation (available in _OverhaulTempRef/)

## Testing Requirements
1. Authentication flow (login/register/logout)
2. Betslip functionality (add/remove/place bets)
3. Route navigation between preserved pages
4. Mobile responsiveness of preserved components
5. Integration with new layout components

## Backup Information
- **Backup Location:** `../backups/winzo_backup_2025-06-20/`
- **Backup Type:** Selective (excludes node_modules, .git)
- **Branch:** `feature/design-system-overhaul`
- **Date:** June 20, 2025

---

**Note:** These components are the foundation of WINZO's core functionality and should be maintained throughout the overhaul process. 