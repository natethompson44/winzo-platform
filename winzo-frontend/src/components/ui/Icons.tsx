import React from 'react';

interface IconProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'inverse';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6'
};

const colorClasses = {
  primary: 'text-yellow-500',
  secondary: 'text-gray-600',
  success: 'text-green-500',
  danger: 'text-red-500',
  warning: 'text-yellow-500',
  inverse: 'text-white'
};

export const LoadingIcon: React.FC<IconProps> = ({ 
  size = 'md', 
  color = 'primary', 
  className = '' 
}) => (
  <svg
    className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
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