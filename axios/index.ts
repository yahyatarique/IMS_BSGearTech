import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { INVALID_CREDS, INVALID_PASSWORD } from "../utils/constants";
import { refreshToken } from "../services/auth";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in requests
});

// Token management
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (error: any) => void;
  request: AxiosRequestConfig;
}[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach(({ resolve, reject, request }) => {
    if (error) {
      reject(error);
    } else {
      resolve(axiosInstance(request as InternalAxiosRequestConfig));
    }
  });
  failedQueue = [];
};

// Request interceptor to add access token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Tokens are automatically sent via httpOnly cookies with withCredentials: true
    // No need to manually add Authorization header
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const requestUrl = originalRequest?.url || '';

    //if the refresh token endpoint itself fails, clear tokens and redirect to login
    if (requestUrl.includes('auth/refresh-token')) {
      tokenUtils.clearTokens();

      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && (error.response?.data as any)?.message !== INVALID_CREDS && (error.response?.data as any)?.message !== INVALID_PASSWORD && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
            request: originalRequest
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {

        await refreshToken();

        // Cookies are set by the server in the response
        // Process the queue with success
        processQueue(null);

        return axiosInstance(originalRequest);
      } catch (refreshError) {

        // Refresh failed, process queue with error
        processQueue(refreshError);

        // Clear tokens and redirect to login
        tokenUtils.clearTokens();

        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Utility functions for token management
export const tokenUtils = {
  clearTokens: () => {
    // Clear httpOnly cookies by setting them to expire
    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    }
  },
};

export default axiosInstance;
