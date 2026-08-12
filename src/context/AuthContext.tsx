'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { CONFIG, UserRole } from '@/lib/config';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  isVerified: boolean;
  isActive: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (formData: FormData) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; message: string }>;
  sendOtp: (email: string, name?: string) => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();

  // Load auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(CONFIG.AUTH_STORAGE_KEY);
      const storedUser = localStorage.getItem(CONFIG.USER_STORAGE_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // Ignore
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // Fetch current user details from API
  const refreshUser = async () => {
    try {
      const res = await api.get('/user/profile/me');
      if (res.data && res.data.success && res.data.data) {
        const u = res.data.data;
        setUser(u);
        localStorage.setItem(CONFIG.USER_STORAGE_KEY, JSON.stringify(u));
      }
    } catch (err) {
      console.error('Failed to sync user profile:', err);
    }
  };

  // Perform login
  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.success && res.data.data) {
        const payload = res.data.data;
        setToken(payload.accessToken);
        setUser(payload.user);
        
        localStorage.setItem(CONFIG.AUTH_STORAGE_KEY, payload.accessToken);
        localStorage.setItem(CONFIG.USER_STORAGE_KEY, JSON.stringify(payload.user));
        
        return { success: true, message: 'Logged in successfully' };
      }
      return { success: false, message: 'Authentication failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Validate email & password.',
      };
    }
  };

  // Register account (accepts FormData for avatar upload)
  const register = async (formData: FormData) => {
    try {
      const res = await api.post('/user/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data && res.data.success) {
        return { success: true, message: 'Registration successful! Verification OTP sent.' };
      }
      return { success: false, message: 'Registration failed.' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to create user account.',
      };
    }
  };

  // Send verification OTP
  const sendOtp = async (email: string, name = '') => {
    try {
      const res = await api.post('/otp/send', { email, name });
      if (res.data && res.data.success) {
        return { success: true, message: 'OTP verification code sent!' };
      }
      return { success: false, message: 'Failed to dispatch verification code.' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Unable to send OTP.' };
    }
  };

  // Verify OTP
  const verifyOtp = async (email: string, otp: string) => {
    try {
      const res = await api.post('/otp/verify', { email, otp });
      if (res.data && res.data.success) {
        return { success: true, message: 'OTP verified successfully!' };
      }
      return { success: false, message: 'OTP verification failed.' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'OTP verification failed.' };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem(CONFIG.AUTH_STORAGE_KEY);
      localStorage.removeItem(CONFIG.USER_STORAGE_KEY);
      router.push('/');
    }
  };

  // Role-based route guard checks
  useEffect(() => {
    if (isLoading) return;

    const isDashboardPath = pathname.startsWith('/dashboard');
    if (isDashboardPath && !user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, user, isLoading, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isLoggedIn: !!user,
        login,
        register,
        logout,
        verifyOtp,
        sendOtp,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
