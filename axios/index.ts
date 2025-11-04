import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in requests
});

// Token management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });

  failedQueue = [];
};

// Request interceptor to add access token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get access token from localStorage or cookie
    let accessToken: string | null = null;
    
    // Try to get from localStorage (client-side)
    if (typeof window !== 'undefined') {
      accessToken = localStorage.getItem('accessToken');
    }
    
    // Try to get from cookie (server-side or if localStorage is not available)
    if (!accessToken && typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'accessToken') {
          accessToken = decodeURIComponent(value);
          break;
        }
      }
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

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

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get refresh token
        let refreshToken: string | null = null;
        
        if (typeof window !== 'undefined') {
          refreshToken = localStorage.getItem('refreshToken');
        }
        
        if (!refreshToken && typeof document !== 'undefined') {
          const cookies = document.cookie.split(';');
          for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'refreshToken') {
              refreshToken = decodeURIComponent(value);
              break;
            }
          }
        }

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Attempt to refresh the token
        const response = await axios.post(`${BASE_URL}/api/refresh-token`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // Store new tokens
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
        }

        // Set new token in the original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Process the queue with the new token
        processQueue(null, newAccessToken);

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, process queue with error
        processQueue(refreshError, null);

        // Clear tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
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
  setTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {2
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    // Also set as cookies for SSR
    if (typeof document !== 'undefined') {
      document.cookie = `accessToken=${encodeURIComponent(accessToken)}; path=/; max-age=${15 * 60}; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
      document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`;
    }
  },

  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    
    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
    }
  },

  getAccessToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  },

  getRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },
};

export default axiosInstance;
