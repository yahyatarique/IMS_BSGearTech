import { NextResponse } from 'next/server';

/**
 * Standard API response structure
 */
export interface ApiResponse<T = any> {
  data?: T;
  success: boolean;
  status: number;
  message: string;
  error?: string | object;
}

/**
 * Create a standardized success response
 * @param data - The response data
 * @param message - Success message
 * @param statusCode - HTTP status code (default: 200)
 * @returns NextResponse with standardized format
 */
export function sendResponse<T = any>(
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      success: true,
      status: statusCode,
      message,
    },
    { status: statusCode }
  );
}

/**
 * Create a standardized error response (returns plain object for NextResponse.json)
 * @param message - Error message
 * @param errorOrStatusCode - Either error details (string/object) or HTTP status code (number)
 * @param error - Optional error details (when second param is status code)
 * @returns ApiResponse object
 */
export function errorResponse(
  message: string = 'An error occurred',
  errorOrStatusCode?: string | object | number,
  error?: string | object
): NextResponse<ApiResponse<null>> {
  let statusCode = 500;
  let errorDetails: string | object | undefined;

  // Handle overloaded parameters
  if (typeof errorOrStatusCode === 'number') {
    statusCode = errorOrStatusCode;
    errorDetails = error;
  } else {
    errorDetails = errorOrStatusCode;
  }

  const response: ApiResponse = {
    success: false,
    status: statusCode,
    message,
  };

  if (errorDetails) {
    response.error = errorDetails;
  }

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Create a standardized validation error response
 * @param message - Validation error message
 * @param errors - Validation error details
 * @returns NextResponse with standardized format
 */
export function validationErrorResponse(
  message: string = 'Validation failed',
  errors: any
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      status: 400,
      message,
      error: errors,
    },
    { status: 400 }
  );
}

/**
 * Create a standardized success response (returns plain object for NextResponse.json)
 * @param data - The response data
 * @param message - Success message
 * @returns ApiResponse object
 */
export function successResponse<T = any>(
  data: T,
  message: string = 'Success'
): ApiResponse<T> {
  return {
    data,
    success: true,
    status: 200,
    message,
  };
}
