import React from 'react';
import '../styles/design-system-v2.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button variant - simplified to 3 core types */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** Button size - mobile-optimized */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state with accessible spinner */
  loading?: boolean;
  /** Icon element */
  icon?: React.ReactNode;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Full width button */
  fullWidth?: boolean;
  /** Children content */
  children: React.ReactNode;
}

/**
 * WINZO Button Component v2.0 - Mobile-First Design
 * 
 * Simplified button system focused on:
 * - 3 core variants for clear hierarchy
 * - Mobile-optimized touch targets (44px+)
 * - Accessible focus states and loading indicators
 * - Performance-focused animations
 * 
 * Inspired by modern betting platforms like FanDuel/DraftKings
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled = false,
  children,
  className = '',
  ...props
}) => {
  // Build className using new design system classes
  const classes = [
    'btn',
    `btn-${variant}`,
    size !== 'md' && `btn-${size}`,
    fullWidth && 'btn-full',
    loading && 'loading',
    className
  ].filter(Boolean).join(' ');

  const isDisabled = disabled || loading;

  return (
    <button
      className={classes}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {/* Loading Spinner - Simplified */}
      {loading && (
        <span className="sr-only">Loading...</span>
      )}
      
      {/* Left Icon */}
      {!loading && icon && iconPosition === 'left' && (
        <span aria-hidden="true">
          {icon}
        </span>
      )}
      
      {/* Button Content */}
      <span className={loading ? 'text-muted' : ''}>
        {loading ? 'Loading...' : children}
      </span>
      
      {/* Right Icon */}
      {!loading && icon && iconPosition === 'right' && (
        <span aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
};

/* Button Group - Simplified */
export interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  className = ''
}) => {
  const classes = [
    'flex',
    orientation === 'vertical' ? 'flex-col' : 'flex-row',
    'gap-2',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} role="group">
      {children}
    </div>
  );
};

/* Quick Stake Button - Betting-specific component */
export interface QuickStakeButtonProps extends Omit<ButtonProps, 'children'> {
  amount: number;
  currency?: string;
}

export const QuickStakeButton: React.FC<QuickStakeButtonProps> = ({
  amount,
  currency = '$',
  ...props
}) => {
  return (
    <Button
      variant="tertiary"
      size="sm"
      {...props}
    >
      +{currency}{amount}
    </Button>
  );
};

/* Odds Button - Betting-specific component */
export interface OddsButtonProps extends Omit<ButtonProps, 'children' | 'variant'> {
  odds: number;
  selected?: boolean;
  team: string;
}

export const OddsButton: React.FC<OddsButtonProps> = ({
  odds,
  selected = false,
  team,
  className = '',
  ...props
}) => {
  const oddsDisplay = odds > 0 ? `+${odds}` : odds.toString();
  const classes = [
    'odds',
    selected && 'bg-primary text-white',
    odds > 0 ? 'odds-positive' : 'odds-negative',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      aria-label={`Bet on ${team} at ${oddsDisplay} odds`}
      {...props}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium text-muted">{team}</span>
        <span className="text-lg font-semibold">{oddsDisplay}</span>
      </div>
    </button>
  );
};

export default Button;