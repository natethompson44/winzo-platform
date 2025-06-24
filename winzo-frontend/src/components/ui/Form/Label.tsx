import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'success';
  children: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({
  required = false,
  size = 'md',
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'form-label';
  const sizeClasses = {
    sm: 'form-label-sm',
    md: '',
    lg: 'form-label-lg'
  };
  const variantClasses = {
    default: '',
    error: 'form-label-error',
    success: 'form-label-success'
  };

  const labelClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    required ? 'required' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <label className={labelClasses} {...props}>
      {children}
    </label>
  );
};

export default Label; 