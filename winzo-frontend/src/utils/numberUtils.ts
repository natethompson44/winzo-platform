/**
 * Safe number formatting utilities to prevent .toFixed() errors
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