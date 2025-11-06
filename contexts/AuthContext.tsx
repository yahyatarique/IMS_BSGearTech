'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout as logoutService } from '@/services/auth';
import { User } from '@/services/types/auth.api.type';
import { tokenUtils } from '@/axios';
import { StorageKeys } from '../utils/constants';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  updateUser: (user: User) => void;
  logout: () => Promise<void>;
  clearUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem(StorageKeys.USER_STORAGE_KEY);
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (error) {
        console.error('Failed to parse cached user:', error);
        localStorage.removeItem(StorageKeys.USER_STORAGE_KEY);
      }
    }
  }, []);

  // Fetch user from API
  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getCurrentUser();
      
      if (response?.data?.user) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem(StorageKeys.USER_STORAGE_KEY, JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      // If token is invalid, clear cache and redirect to login
      localStorage.removeItem(StorageKeys.USER_STORAGE_KEY);
      tokenUtils.clearTokens();
      router.push('/login');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Update user in state and localStorage
  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem(StorageKeys.USER_STORAGE_KEY, JSON.stringify(updatedUser));
  }, []);

  // Clear user data
  const clearUser = useCallback(() => {
    setUser(null);
    localStorage.removeItem(StorageKeys.USER_STORAGE_KEY);
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearUser();
      tokenUtils.clearTokens();
      router.push('/login');
      router.refresh();
    }
  }, [router, clearUser]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    fetchUser,
    updateUser,
    logout,
    clearUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
