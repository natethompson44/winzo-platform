import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

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
  const baseClass = 'winzo-button';
  const variantClass = `winzo-button--${variant}`;
  const sizeClass = `winzo-button--${size}`;
  const widthClass = fullWidth ? 'winzo-button--full-width' : '';
  const loadingClass = loading ? 'winzo-button--loading' : '';
  const disabledClass = disabled || loading ? 'winzo-button--disabled' : '';
  const iconClass = icon ? `winzo-button--icon-${iconPosition}` : '';

  const combinedClassName = [
    baseClass,
    variantClass,
    sizeClass,
    widthClass,
    loadingClass,
    disabledClass,
    iconClass,
    className
  ].filter(Boolean).join(' ');

  const isDisabled = disabled || loading;

  return (
    <button
      className={combinedClassName}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className="winzo-button__loading-spinner" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="31.416" strokeDashoffset="31.416">
              <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
              <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
            </circle>
          </svg>
        </span>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className="winzo-button__icon winzo-button__icon--left" aria-hidden="true">
          {icon}
        </span>
      )}
      
      <span className="winzo-button__content">
        {children}
      </span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className="winzo-button__icon winzo-button__icon--right" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
};

// Button Group Component
export interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  size = 'md',
  className = ''
}) => {
  const baseClass = 'winzo-button-group';
  const orientationClass = `winzo-button-group--${orientation}`;
  const sizeClass = `winzo-button-group--${size}`;
  
  const combinedClassName = [
    baseClass,
    orientationClass,
    sizeClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={combinedClassName} role="group">
      {children}
    </div>
  );
};

// Icon Button Component
export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  variant = 'ghost',
  className = '',
  ...props
}) => {
  const baseClass = 'winzo-icon-button';
  const variantClass = `winzo-icon-button--${variant}`;
  const sizeClass = `winzo-icon-button--${size}`;
  
  const combinedClassName = [
    baseClass,
    variantClass,
    sizeClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={combinedClassName}
      {...props}
    >
      <span className="winzo-icon-button__icon" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
};

export default Button; 