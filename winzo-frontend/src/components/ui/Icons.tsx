import React from 'react';

interface IconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'danger' | 'warning' | 'info' | 'inverse';
  className?: string;
}

const sizeClasses = {
  xs: 'icon-xs',
  sm: 'icon-sm', 
  md: 'icon-md',
  lg: 'icon-lg',
  xl: 'icon-xl'
};

const colorClasses = {
  primary: 'text-primary',
  secondary: 'text-secondary', 
  tertiary: 'text-tertiary',
  success: 'text-success',
  danger: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
  inverse: 'text-inverse'
};

export const LoadingIcon: React.FC<IconProps> = ({ 
  size = 'md', 
  color = 'primary', 
  className = '' 
}) => (
  <svg
    className={`loading-icon ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const SuccessIcon: React.FC<IconProps> = ({ 
  size = 'md', 
  color = 'success', 
  className = '' 
}) => (
  <svg
    className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

export const WarningIcon: React.FC<IconProps> = ({ 
  size = 'md', 
  color = 'warning', 
  className = '' 
}) => (
  <svg
    className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
);

export const ErrorIcon: React.FC<IconProps> = ({ 
  size = 'md', 
  color = 'danger', 
  className = '' 
}) => (
  <svg
    className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ 
  size = 'md', 
  color = 'info', 
  className = '' 
}) => (
  <svg
    className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
); 