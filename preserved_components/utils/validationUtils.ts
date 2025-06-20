/**
 * Comprehensive input validation utilities for WINZO platform
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  value?: number;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  required?: boolean;
  allowZero?: boolean;
  allowNegative?: boolean;
  precision?: number; // Number of decimal places allowed
}

/**
 * Validates and parses numeric input for betting amounts
 */
export const validateBetAmount = (
  input: string | number,
  rules: ValidationRules = {}
): ValidationResult => {
  const {
    min = 1,
    max = 1000,
    required = true,
    allowZero = false,
    allowNegative = false,
    precision = 2
  } = rules;

  // Handle empty input
  if (!input && input !== 0) {
    if (required) {
      return { isValid: false, error: 'Amount is required' };
    }
    return { isValid: true, value: 0 };
  }

  // Convert to number
  const num = Number(input);
  
  // Check if it's a valid number
  if (isNaN(num)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }

  // Check for negative values
  if (!allowNegative && num < 0) {
    return { isValid: false, error: 'Amount cannot be negative' };
  }

  // Check for zero
  if (!allowZero && num === 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }

  // Check minimum value
  if (num < min) {
    return { 
      isValid: false, 
      error: `Minimum amount is $${min.toFixed(2)}` 
    };
  }

  // Check maximum value
  if (num > max) {
    return { 
      isValid: false, 
      error: `Maximum amount is $${max.toFixed(2)}` 
    };
  }

  // Check precision
  const decimalPlaces = (num.toString().split('.')[1] || '').length;
  if (decimalPlaces > precision) {
    return { 
      isValid: false, 
      error: `Maximum ${precision} decimal places allowed` 
    };
  }

  return { isValid: true, value: num };
};

/**
 * Validates wallet balance operations
 */
export const validateWalletOperation = (
  amount: string | number,
  currentBalance: number,
  operation: 'deposit' | 'withdraw' | 'bet'
): ValidationResult => {
  const baseValidation = validateBetAmount(amount, {
    min: 1,
    max: operation === 'deposit' ? 10000 : currentBalance,
    required: true,
    allowZero: false,
    allowNegative: false,
    precision: 2
  });

  if (!baseValidation.isValid) {
    return baseValidation;
  }

  const numAmount = baseValidation.value!;

  // Check withdrawal/betting against available balance
  if ((operation === 'withdraw' || operation === 'bet') && numAmount > currentBalance) {
    return {
      isValid: false,
      error: `Insufficient funds. Available balance: $${currentBalance.toFixed(2)}`
    };
  }

  return baseValidation;
};

/**
 * Validates odds input
 */
export const validateOdds = (odds: string | number): ValidationResult => {
  const num = Number(odds);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Please enter valid odds' };
  }

  if (num <= 1) {
    return { isValid: false, error: 'Odds must be greater than 1.0' };
  }

  if (num > 1000) {
    return { isValid: false, error: 'Odds cannot exceed 1000' };
  }

  return { isValid: true, value: num };
};

/**
 * Validates percentage input
 */
export const validatePercentage = (
  percentage: string | number,
  rules: ValidationRules = {}
): ValidationResult => {
  const {
    min = 0,
    max = 100,
    required = true,
    allowZero = true,
    allowNegative = false,
    precision = 1
  } = rules;

  if (!percentage && percentage !== 0) {
    if (required) {
      return { isValid: false, error: 'Percentage is required' };
    }
    return { isValid: true, value: 0 };
  }

  const num = Number(percentage);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Please enter a valid percentage' };
  }

  if (!allowNegative && num < 0) {
    return { isValid: false, error: 'Percentage cannot be negative' };
  }

  if (!allowZero && num === 0) {
    return { isValid: false, error: 'Percentage must be greater than 0' };
  }

  if (num < min) {
    return { isValid: false, error: `Minimum percentage is ${min}%` };
  }

  if (num > max) {
    return { isValid: false, error: `Maximum percentage is ${max}%` };
  }

  const decimalPlaces = (num.toString().split('.')[1] || '').length;
  if (decimalPlaces > precision) {
    return { 
      isValid: false, 
      error: `Maximum ${precision} decimal places allowed` 
    };
  }

  return { isValid: true, value: num };
};

/**
 * Real-time validation feedback for input fields
 */
export const getInputValidationState = (
  value: string,
  validationResult: ValidationResult,
  touched: boolean = false
): {
  isValid: boolean;
  showError: boolean;
  errorMessage?: string;
  className: string;
} => {
  const showError = touched && !validationResult.isValid;
  
  return {
    isValid: validationResult.isValid,
    showError,
    errorMessage: showError ? validationResult.error : undefined,
    className: showError ? 'input-error' : validationResult.isValid ? 'input-valid' : ''
  };
};

/**
 * Formats input value for display
 */
export const formatInputValue = (
  value: string | number,
  type: 'currency' | 'percentage' | 'number' = 'number',
  precision: number = 2
): string => {
  if (!value && value !== 0) return '';
  
  const num = Number(value);
  if (isNaN(num)) return String(value);
  
  switch (type) {
    case 'currency':
      return `$${num.toFixed(precision)}`;
    case 'percentage':
      return `${num.toFixed(precision)}%`;
    default:
      return num.toFixed(precision);
  }
};

/**
 * Sanitizes input to prevent invalid characters
 */
export const sanitizeNumericInput = (input: string): string => {
  // Remove all characters except digits, decimal point, and minus sign
  let sanitized = input.replace(/[^\d.-]/g, '');
  
  // Ensure only one decimal point
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Ensure minus sign is only at the beginning
  if (sanitized.includes('-') && !sanitized.startsWith('-')) {
    sanitized = sanitized.replace(/-/g, '');
  }
  
  return sanitized;
};

/**
 * Validates form data for betting
 */
export const validateBetForm = (formData: {
  stake: string | number;
  walletBalance: number;
  odds?: string | number;
}): ValidationResult => {
  // Validate stake
  const stakeValidation = validateWalletOperation(
    formData.stake,
    formData.walletBalance,
    'bet'
  );
  
  if (!stakeValidation.isValid) {
    return stakeValidation;
  }

  // Validate odds if provided
  if (formData.odds !== undefined) {
    const oddsValidation = validateOdds(formData.odds);
    if (!oddsValidation.isValid) {
      return oddsValidation;
    }
  }

  return { isValid: true, value: stakeValidation.value };
}; 