import React, { useState, useEffect } from 'react';
import { 
  validateBetAmount, 
  validateWalletOperation,
  validateOdds,
  validatePercentage,
  getInputValidationState,
  sanitizeNumericInput,
  ValidationRules,
  ValidationResult
} from '../utils/validationUtils';
import './ValidatedInput.css';

interface ValidatedInputProps {
  type: 'bet-amount' | 'wallet-operation' | 'odds' | 'percentage' | 'number';
  value: string;
  onChange: (value: string, isValid: boolean, numericValue?: number) => void;
  onBlur?: () => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  walletBalance?: number;
  operation?: 'deposit' | 'withdraw' | 'bet';
  rules?: ValidationRules;
  showValidation?: boolean;
  autoFocus?: boolean;
}

const ValidatedInput: React.FC<ValidatedInputProps> = ({
  type,
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  disabled = false,
  className = '',
  walletBalance = 0,
  operation = 'bet',
  rules = {},
  showValidation = true,
  autoFocus = false
}) => {
  const [touched, setTouched] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true });

  // Validate input based on type
  const validateInput = (inputValue: string): ValidationResult => {
    switch (type) {
      case 'bet-amount':
        return validateBetAmount(inputValue, rules);
      case 'wallet-operation':
        return validateWalletOperation(inputValue, walletBalance, operation);
      case 'odds':
        return validateOdds(inputValue);
      case 'percentage':
        return validatePercentage(inputValue, rules);
      case 'number':
        return validateBetAmount(inputValue, { ...rules, allowZero: true });
      default:
        return { isValid: true };
    }
  };

  // Update validation when value or dependencies change
  useEffect(() => {
    const result = validateInput(value);
    setValidationResult(result);
  }, [value, walletBalance, operation, rules, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Sanitize input for numeric fields
    const sanitizedValue = sanitizeNumericInput(inputValue);
    
    // Validate the sanitized value
    const result = validateInput(sanitizedValue);
    
    // Update parent component
    onChange(sanitizedValue, result.isValid, result.value);
  };

  const handleBlur = () => {
    setTouched(true);
    onBlur?.();
  };

  const handleFocus = () => {
    if (!touched) {
      setTouched(true);
    }
  };

  const validationState = getInputValidationState(value, validationResult, touched && showValidation);

  const getInputType = (): string => {
    switch (type) {
      case 'percentage':
        return 'text'; // Allow % symbol
      default:
        return 'number';
    }
  };

  const getPlaceholder = (): string => {
    if (placeholder) return placeholder;
    
    switch (type) {
      case 'bet-amount':
        return 'Enter bet amount';
      case 'wallet-operation':
        return operation === 'deposit' ? 'Enter deposit amount' : 'Enter withdrawal amount';
      case 'odds':
        return 'Enter odds';
      case 'percentage':
        return 'Enter percentage';
      case 'number':
        return 'Enter number';
      default:
        return '';
    }
  };

  const getMinMax = () => {
    switch (type) {
      case 'bet-amount':
        return { min: rules.min || 1, max: rules.max || 1000 };
      case 'wallet-operation':
        return { 
          min: rules.min || 1, 
          max: operation === 'deposit' ? (rules.max || 10000) : walletBalance 
        };
      case 'odds':
        return { min: 1.01, max: 1000 };
      case 'percentage':
        return { min: rules.min || 0, max: rules.max || 100 };
      default:
        return { min: rules.min, max: rules.max };
    }
  };

  const { min, max } = getMinMax();

  return (
    <div className={`validated-input-container ${className}`}>
      {label && (
        <label className="validated-input-label">
          {label}
        </label>
      )}
      
      <div className="validated-input-wrapper">
        <input
          type={getInputType()}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={getPlaceholder()}
          disabled={disabled}
          className={`validated-input ${validationState.className}`}
          min={min}
          max={max}
          step={type === 'percentage' ? '0.1' : '0.01'}
          autoFocus={autoFocus}
        />
        
        {validationState.showError && validationState.errorMessage && (
          <div className="validation-error">
            <span className="error-icon">⚠️</span>
            <span className="error-message">{validationState.errorMessage}</span>
          </div>
        )}
        
        {validationState.isValid && value && (
          <div className="validation-success">
            <span className="success-icon">✅</span>
          </div>
        )}
      </div>
      
      {type === 'wallet-operation' && walletBalance > 0 && (
        <div className="balance-info">
          Available: ${walletBalance.toFixed(2)}
        </div>
      )}
    </div>
  );
};

export default ValidatedInput; 