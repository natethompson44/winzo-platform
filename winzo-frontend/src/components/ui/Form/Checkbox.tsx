import React, { forwardRef } from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  helperText?: string;
  errorText?: string;
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  size = 'md',
  label,
  helperText,
  errorText,
  indeterminate = false,
  className = '',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'form-checkbox-sm',
    md: 'form-checkbox',
    lg: 'form-checkbox-lg'
  };

  const checkboxClasses = [
    sizeClasses[size],
    errorText ? 'error' : '',
    className
  ].filter(Boolean).join(' ');

  React.useEffect(() => {
    if (ref && typeof ref === 'object' && ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate, ref]);

  return (
    <div className="form-field">
      <div className="form-checkbox-wrapper">
        <input
          ref={ref}
          type="checkbox"
          className={checkboxClasses}
          {...props}
        />
        {label && (
          <label className="form-checkbox-label">
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

Checkbox.displayName = 'Checkbox';

export default Checkbox; 