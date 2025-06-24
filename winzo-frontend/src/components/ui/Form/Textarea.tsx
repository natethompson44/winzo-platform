import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  helperText?: string;
  errorText?: string;
  label?: string;
  required?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  variant = 'default',
  size = 'md',
  fullWidth = false,
  helperText,
  errorText,
  label,
  required = false,
  resize = 'vertical',
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'form-textarea';
  const variantClasses = {
    default: '',
    error: 'error',
    success: 'success'
  };
  const sizeClasses = {
    sm: 'form-textarea-sm',
    md: '',
    lg: 'form-textarea-lg'
  };

  const textareaClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    `resize-${resize}`,
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
      
      <div className="form-textarea-container">
        <textarea
          ref={ref}
          className={textareaClasses.replace(variantClasses[variant], variantClasses[finalVariant])}
          {...props}
        />
      </div>
      
      {(helperText || errorText) && (
        <div className={errorText ? 'form-error' : 'form-help'}>
          {errorText || helperText}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea; 