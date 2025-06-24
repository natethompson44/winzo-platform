import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  label?: string;
  required?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  variant = 'default',
  size = 'md',
  fullWidth = false,
  options,
  placeholder,
  helperText,
  errorText,
  label,
  required = false,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'form-select';
  const variantClasses = {
    default: '',
    error: 'error',
    success: 'success'
  };
  const sizeClasses = {
    sm: 'form-select-sm',
    md: '',
    lg: 'form-select-lg'
  };

  const selectClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
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
      
      <div className="form-select-container">
        <select
          ref={ref}
          className={selectClasses.replace(variantClasses[variant], variantClasses[finalVariant])}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {(helperText || errorText) && (
        <div className={errorText ? 'form-error' : 'form-help'}>
          {errorText || helperText}
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select; 