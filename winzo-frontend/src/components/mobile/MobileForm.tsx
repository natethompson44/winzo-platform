import React, { useState, forwardRef } from 'react';

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
}

const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(({
  label,
  error,
  icon,
  rightIcon,
  helperText,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`mobile-input-wrapper ${className}`}>
      {label && (
        <label className="mobile-input-label">
          {label}
          {props.required && <span className="required-indicator">*</span>}
        </label>
      )}
      
      <div className={`mobile-input-container ${variant} ${isFocused ? 'focused' : ''} ${error ? 'error' : ''}`}>
        {icon && (
          <div className="input-icon left-icon">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          className={`mobile-input ${icon ? 'with-left-icon' : ''} ${rightIcon ? 'with-right-icon' : ''}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {rightIcon && (
          <div className="input-icon right-icon">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <div className="mobile-input-error">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {helperText && !error && (
        <div className="mobile-input-helper">
          {helperText}
        </div>
      )}
    </div>
  );
});

MobileInput.displayName = 'MobileInput';

interface MobileSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

const MobileSelect = forwardRef<HTMLSelectElement, MobileSelectProps>(({
  label,
  error,
  options,
  placeholder,
  className = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`mobile-select-wrapper ${className}`}>
      {label && (
        <label className="mobile-input-label">
          {label}
          {props.required && <span className="required-indicator">*</span>}
        </label>
      )}
      
      <div className={`mobile-select-container ${isFocused ? 'focused' : ''} ${error ? 'error' : ''}`}>
        <select
          ref={ref}
          className="mobile-select"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
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
        
        <div className="select-icon">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {error && (
        <div className="mobile-input-error">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

MobileSelect.displayName = 'MobileSelect';

interface MobileTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: boolean;
}

const MobileTextArea = forwardRef<HTMLTextAreaElement, MobileTextAreaProps>(({
  label,
  error,
  helperText,
  resize = false,
  className = '',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`mobile-textarea-wrapper ${className}`}>
      {label && (
        <label className="mobile-input-label">
          {label}
          {props.required && <span className="required-indicator">*</span>}
        </label>
      )}
      
      <div className={`mobile-textarea-container ${isFocused ? 'focused' : ''} ${error ? 'error' : ''}`}>
        <textarea
          ref={ref}
          className={`mobile-textarea ${resize ? 'resizable' : 'no-resize'}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </div>
      
      {error && (
        <div className="mobile-input-error">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
      {helperText && !error && (
        <div className="mobile-input-helper">
          {helperText}
        </div>
      )}
    </div>
  );
});

MobileTextArea.displayName = 'MobileTextArea';

interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const MobileButton: React.FC<MobileButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`mobile-button ${variant} ${size} ${fullWidth ? 'full-width' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="button-loading">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m12 6l2 2 2-2"></path>
          </svg>
        </div>
      )}
      
      {!loading && leftIcon && (
        <span className="button-icon left-icon">
          {leftIcon}
        </span>
      )}
      
      <span className="button-text">
        {children}
      </span>
      
      {!loading && rightIcon && (
        <span className="button-icon right-icon">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

interface MobileFormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  className?: string;
}

const MobileForm: React.FC<MobileFormProps> = ({
  onSubmit,
  children,
  className = ''
}) => {
  return (
    <form className={`mobile-form ${className}`} onSubmit={onSubmit}>
      {children}
    </form>
  );
};

export {
  MobileInput,
  MobileSelect,
  MobileTextArea,
  MobileButton,
  MobileForm
}; 