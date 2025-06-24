import React, { forwardRef } from 'react';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  helperText?: string;
  errorText?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  size = 'md',
  label,
  helperText,
  errorText,
  className = '',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'form-radio-sm',
    md: 'form-radio',
    lg: 'form-radio-lg'
  };

  const radioClasses = [
    sizeClasses[size],
    errorText ? 'error' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="form-field">
      <div className="form-radio-wrapper">
        <input
          ref={ref}
          type="radio"
          className={radioClasses}
          {...props}
        />
        {label && (
          <label className="form-radio-label">
            {label}
          </label>
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

Radio.displayName = 'Radio';

export default Radio; 