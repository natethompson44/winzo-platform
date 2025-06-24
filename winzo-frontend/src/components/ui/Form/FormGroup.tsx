import React from 'react';

export interface FormGroupProps {
  children: React.ReactNode;
  legend?: string;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
  spacing?: 'tight' | 'normal' | 'loose';
  error?: boolean;
}

const FormGroup: React.FC<FormGroupProps> = ({
  children,
  legend,
  className = '',
  orientation = 'vertical',
  spacing = 'normal',
  error = false
}) => {
  const baseClasses = 'form-group';
  const orientationClass = `form-group-${orientation}`;
  const spacingClass = `form-group-spacing-${spacing}`;
  const errorClass = error ? 'form-group-error' : '';

  const groupClasses = [
    baseClasses,
    orientationClass,
    spacingClass,
    errorClass,
    className
  ].filter(Boolean).join(' ');

  if (legend) {
    return (
      <fieldset className={groupClasses}>
        <legend className="form-legend">{legend}</legend>
        <div className="form-group-content">
          {children}
        </div>
      </fieldset>
    );
  }

  return (
    <div className={groupClasses}>
      {children}
    </div>
  );
};

export default FormGroup; 