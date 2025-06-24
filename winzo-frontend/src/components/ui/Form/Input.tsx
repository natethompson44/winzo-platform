import React, { forwardRef } from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  errorText?: string;
  label?: string;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  helperText,
  errorText,
  label,
  required = false,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'form-input';
  const variantClasses = {
    default: '',
    error: 'error',
    success: 'success'
  };
  const sizeClasses = {
    sm: 'form-input-sm',
    md: '',
    lg: 'form-input-lg'
  };

  const inputClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    leftIcon ? 'pl-10' : '',
    rightIcon ? 'pr-10' : '',
    className
  ].filter(Boolean).join(' ');

  const finalVariant = errorText ? 'error' : variant;

  return (
    <div className={`form-field ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className={`form-label ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      
      <div className="form-input-container">
        {leftIcon && (
          <div className="form-input-icon left">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses.replace(variantClasses[variant], variantClasses[finalVariant])}
          {...props}
        />
        
        {rightIcon && (
          <div className="form-input-icon right">
            {rightIcon}
          </div>
        )}
      </div>
      
      {(helperText || errorText) && (
        <div className={errorText ? 'form-error' : 'form-help'}>
          {errorText || helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 