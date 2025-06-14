/**
 * Safe number formatting utilities to prevent .toFixed() errors
 * Enhanced with luxury formatting for premium dashboard display
 */

/**
 * Safely formats a number to 2 decimal places for currency display
 * @param value - The value to format (can be number, string, null, undefined)
 * @param fallback - Default value if the input is invalid (default: 0)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: any, fallback: number = 0): string => {
  const num = Number(value);
  if (isNaN(num)) {
    return `$${fallback.toFixed(2)}`;
  }
  return `$${num.toFixed(2)}`;
};

/**
 * Luxury currency formatting with enhanced visual appeal
 * @param value - The value to format
 * @param fallback - Default value if the input is invalid (default: 0)
 * @returns Formatted currency string with luxury styling
 */
export const formatLuxuryCurrency = (value: any, fallback: number = 0): string => {
  const num = Number(value);
  if (isNaN(num)) {
    return `$${fallback.toFixed(2)}`;
  }
  
  // Add thousand separators and format with luxury precision
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
  
  return formatted;
};

/**
 * Premium balance formatting for wallet display
 * @param value - The balance value to format
 * @param fallback - Default value if the input is invalid (default: 0)
 * @returns Formatted balance string optimized for wallet display
 */
export const formatPremiumBalance = (value: any, fallback: number = 0): string => {
  const num = Number(value);
  if (isNaN(num)) {
    return `$${fallback.toFixed(2)}`;
  }
  
  // For large amounts, show in K/M format
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(1)}K`;
  }
  
  return formatLuxuryCurrency(num);
};

/**
 * Safely formats a number to 1 decimal place for percentage display
 * @param value - The value to format (can be number, string, null, undefined)
 * @param fallback - Default value if the input is invalid (default: 0)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: any, fallback: number = 0): string => {
  const num = Number(value);
  if (isNaN(num)) {
    return `${fallback.toFixed(1)}%`;
  }
  return `${num.toFixed(1)}%`;
};

/**
 * Luxury percentage formatting with enhanced visual appeal
 * @param value - The value to format
 * @param fallback - Default value if the input is invalid (default: 0)
 * @returns Formatted percentage string with luxury styling
 */
export const formatLuxuryPercentage = (value: any, fallback: number = 0): string => {
  const num = Number(value);
  if (isNaN(num)) {
    return `${fallback.toFixed(1)}%`;
  }
  
  // Format with consistent decimal places and luxury styling
  const formatted = `${num.toFixed(1)}%`;
  return formatted;
};

/**
 * Safely formats a number to 2 decimal places
 * @param value - The value to format (can be number, string, null, undefined)
 * @param fallback - Default value if the input is invalid (default: 0)
 * @returns Formatted number string
 */
export const formatNumber = (value: any, fallback: number = 0): string => {
  const num = Number(value);
  if (isNaN(num)) {
    return fallback.toFixed(2);
  }
  return num.toFixed(2);
};

/**
 * Luxury number formatting with thousand separators
 * @param value - The value to format
 * @param fallback - Default value if the input is invalid (default: 0)
 * @returns Formatted number string with luxury styling
 */
export const formatLuxuryNumber = (value: any, fallback: number = 0): string => {
  const num = Number(value);
  if (isNaN(num)) {
    return fallback.toLocaleString();
  }
  
  return num.toLocaleString();
};

/**
 * Safely converts a value to a number
 * @param value - The value to convert
 * @param fallback - Default value if the input is invalid (default: 0)
 * @returns Number value
 */
export const safeNumber = (value: any, fallback: number = 0): number => {
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

/**
 * Validates if a value is a valid number
 * @param value - The value to validate
 * @returns True if the value is a valid number
 */
export const isValidNumber = (value: any): boolean => {
  return !isNaN(Number(value)) && value !== null && value !== undefined;
};

/**
 * Formats odds for betting display
 * @param odds - The odds value to format
 * @returns Formatted odds string
 */
export const formatOdds = (odds: number): string => {
  if (odds > 0) {
    return `+${odds}`;
  }
  return odds.toString();
};

/**
 * Luxury odds formatting with enhanced visual appeal
 * @param odds - The odds value to format
 * @returns Formatted odds string with luxury styling
 */
export const formatLuxuryOdds = (odds: number): string => {
  if (odds > 0) {
    return `+${odds}`;
  }
  return odds.toString();
};

/**
 * Formats a number for display with appropriate precision
 * @param value - The value to format
 * @param precision - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export const formatWithPrecision = (value: any, precision: number = 2): string => {
  const num = Number(value);
  if (isNaN(num)) {
    return `0.${'0'.repeat(precision)}`;
  }
  return num.toFixed(precision);
};

/**
 * Formats a number for compact display (K, M, B)
 * @param value - The value to format
 * @returns Compact formatted string
 */
export const formatCompactNumber = (value: any): string => {
  const num = Number(value);
  if (isNaN(num)) {
    return '0';
  }
  
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  
  return num.toString();
};

/**
 * Formats a number for trend display with color indicators
 * @param value - The value to format
 * @param isPositive - Whether the trend is positive
 * @returns Formatted trend string
 */
export const formatTrend = (value: any, isPositive: boolean = true): string => {
  const num = Number(value);
  if (isNaN(num)) {
    return '0%';
  }
  
  const sign = isPositive ? '+' : '';
  return `${sign}${num.toFixed(1)}%`;
}; 