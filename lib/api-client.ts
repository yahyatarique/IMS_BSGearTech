'use client'

import { INVALID_CREDS, INVALID_PASSWORD, StorageKeys } from '../utils/constants';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
// Ensure BASE_URL doesn't have trailing slash, then add /api
const cleanBaseUrl = BASE_URL.replace(/\/+$/, '');
const API_BASE_URL = `/api`;

// Types
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  _retry?: boolean;
}

// Token management
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (error: any) => void;
  url: string;
  config: RequestConfig;
}[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach(({ resolve, reject, url, config }) => {
    if (error) {
      reject(error);
    } else {
      resolve(request(url, config));
    }
  });
  failedQueue = [];
};

// Utility functions for token management
export const tokenUtils = {
  clearTokens: () => {
    // Clear httpOnly cookies by setting them to expire
    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    }
  }
};

// Refresh token function (internal to avoid circular dependency)
const refreshToken = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    credentials: 'include', // Include cookies
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }
};

// Core request function
async function request<T = any>(
  url: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { params, ...fetchConfig } = config;

  // Build full URL
  // Ensure url starts with / and API_BASE_URL doesn't end with /
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  let fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${cleanUrl}`;
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[API Client] Request URL:', { url, cleanUrl, API_BASE_URL, fullUrl });
  }

  // Add query parameters
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += `${fullUrl.includes('?') ? '&' : '?'}${queryString}`;
    }
  }

  // Default headers
  const headers = new Headers(fetchConfig.headers);
  if (!headers.has('Content-Type') && fetchConfig.body) {
    headers.set('Content-Type', 'application/json');
  }

  // Make request with credentials (cookies)
  const response = await fetch(fullUrl, {
    ...fetchConfig,
    headers,
    credentials: 'include', // Equivalent to axios withCredentials: true
  });

  // Parse response
  let data: T;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = (await response.text()) as any;
  }

  // Create axios-like response object
  const apiResponse: ApiResponse<T> = {
    data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  };

  // Handle errors
  if (!response.ok) {
    const error: any = new Error(response.statusText);
    error.response = apiResponse;
    error.status = response.status;
    throw error;
  }

  return apiResponse;
}

// API client with interceptors
class ApiClient {
  async get<T = any>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }

  private async request<T = any>(
    url: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Tokens are automatically sent via httpOnly cookies with credentials: 'include'
      return await request<T>(url, config);
    } catch (error: any) {
      // Handle token refresh logic
      const originalRequest = config;
      const requestUrl = url;

      // If the refresh token endpoint itself fails, don't retry - clear tokens and redirect
      if (requestUrl.includes('auth/refresh-token') || requestUrl.includes('refresh-token')) {
        tokenUtils.clearTokens();

        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
          localStorage.removeItem(StorageKeys.USER_STORAGE_KEY);
        }

        throw error;
      }

      // If error is 401 and we haven't already tried to refresh
      const errorData = error.response?.data;
      if (
        error.status === 401 &&
        errorData?.message !== INVALID_CREDS &&
        errorData?.message !== INVALID_PASSWORD &&
        !originalRequest._retry
      ) {
        if (isRefreshing) {
          // If refresh is already in progress, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve,
              reject,
              url,
              config: originalRequest,
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await refreshToken();

          // Process the queue with success
          processQueue(null);

          // Retry the original request
          return await request<T>(url, originalRequest);
        } catch (refreshError) {
          // Refresh failed, process queue with error
          processQueue(refreshError);

          // Clear tokens and redirect to login
          tokenUtils.clearTokens();

          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }

          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }

      // Return error response data if available (axios-like behavior)
      // Preserve status and message for error handling
      if (error.response?.data) {
        const errorData = error.response.data as any;
        const apiError: any = errorData;
        apiError.status = error.status;
        // Ensure message/error fields are accessible
        if (!apiError.message && !apiError.error && errorData.message) {
          apiError.message = errorData.message;
        }
        throw apiError;
      }

      // If no response data, create a structured error
      const apiError: any = {
        status: error.status,
        message: error.message || 'Request failed',
      };
      throw apiError;
    }
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;

