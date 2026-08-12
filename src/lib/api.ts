import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { CONFIG } from './config';

// Create central Axios instance
export const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  withCredentials: true, // Crucial for refresh cookies
});

// Flag to track token refresh queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Auth token if present
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(CONFIG.AUTH_STORAGE_KEY);
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 and auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (!error.response) {
      return Promise.reject(error);
    }

    const isAuthRequest = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh-token');

    if (error.response.status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Send refresh token request (cookies based refresh)
        const res = await axios.post(
          `${CONFIG.API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (res.data && res.data.success && res.data.data?.accessToken) {
          const newToken = res.data.data.accessToken;
          localStorage.setItem(CONFIG.AUTH_STORAGE_KEY, newToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          
          processQueue(null, newToken);
          
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Refresh failed, clean session state
        localStorage.removeItem(CONFIG.AUTH_STORAGE_KEY);
        localStorage.removeItem(CONFIG.USER_STORAGE_KEY);
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
