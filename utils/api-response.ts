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
 * Create a standardized error response
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 500)
 * @param error - Optional error details
 * @returns NextResponse with standardized format
 */
export function errorResponse(
  message: string = 'An error occurred',
  statusCode: number = 500,
  error?: string | object
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false  ,
    status: statusCode,
    message,
  };

  if (error) {
    response.error = error;
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
