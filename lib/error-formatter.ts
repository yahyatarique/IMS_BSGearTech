/**
 * Formats validation error messages to be more user-friendly
 * Removes technical jargon and makes errors understandable for non-technical users
 */
export function formatErrorMessage(errorMessage: string | undefined): string {
  if (!errorMessage) return '';

  // Common Zod error patterns to replace
  const patterns: [RegExp, string][] = [
    // Type errors
    [/Invalid input: expected string, received undefined/i, 'This field is required'],
    [/Invalid input: expected number, received undefined/i, 'This field is required'],
    [/Invalid input: expected boolean, received undefined/i, 'This field is required'],
    [/Expected string, received undefined/i, 'This field is required'],
    [/Expected number, received undefined/i, 'This field is required'],
    [/Expected boolean, received undefined/i, 'This field is required'],
    [/Required/i, 'This field is required'],
    
    // NaN errors
    [/Expected number, received nan/i, 'Please enter a valid number'],
    [/Invalid input: expected number, received nan/i, 'Please enter a valid number'],
    
    // Array errors
    [/Expected array, received/i, 'Please select at least one option'],
    
    // UUID errors
    [/Invalid uuid/i, 'Please select a valid option'],
    
    // General validation
    [/String must contain at least \d+ character\(s\)/i, 'This field cannot be empty'],
    [/Number must be greater than or equal to \d+/i, 'Value must be positive'],
    [/Number must be less than or equal to \d+/i, 'Value is too large'],
    
    // Database errors
    [/unique constraint/i, 'This value already exists'],
    [/foreign key constraint/i, 'Invalid reference - please select a valid option'],
    [/violates not-null constraint/i, 'Required field is missing'],
    
    // Network errors
    [/network error/i, 'Connection error - please check your internet'],
    [/timeout/i, 'Request timed out - please try again'],
    [/failed to fetch/i, 'Unable to connect - please try again'],
  ];

  let formattedMessage = errorMessage;

  // Apply pattern replacements
  for (const [pattern, replacement] of patterns) {
    if (pattern.test(formattedMessage)) {
      formattedMessage = replacement;
      break;
    }
  }

  return formattedMessage;
}

/**
 * Formats API error responses to be user-friendly
 */
export function formatApiError(error: any): string {
  // Handle Axios error responses
  if (error?.response?.data?.message) {
    return formatErrorMessage(error.response.data.message);
  }
  
  if (error?.response?.data?.error) {
    const errorDetail = error.response.data.error;
    if (typeof errorDetail === 'string') {
      return formatErrorMessage(errorDetail);
    }
    // Handle Zod validation errors
    if (Array.isArray(errorDetail)) {
      return formatErrorMessage(errorDetail[0]?.message || 'Validation error');
    }
  }
  
  // Handle error message directly
  if (error?.message) {
    return formatErrorMessage(error.message);
  }
  
  return 'An unexpected error occurred. Please try again.';
}
