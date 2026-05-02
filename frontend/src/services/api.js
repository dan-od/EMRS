/**
 * API Service Configuration
 * Axios instance with interceptors for auth token and auto-refresh
 */

import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

// Create axios instance - Backend runs on port 5000
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  withCredentials: true, // send httpOnly auth cookie on every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach token + offline guard for mutations
api.interceptors.request.use(
  (config) => {
    const isMutation = ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase());
    if (isMutation && !navigator.onLine) {
      toast('Request queued — will sync when connection returns.', { icon: '📶' });
      return Promise.reject(new Error('offline'));
    }

    const authStorage = localStorage.getItem('emrs-auth');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const token = parsed?.state?.token;
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch (e) { /* ignore parse errors */ }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Token refresh state — prevent concurrent refresh attempts
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token));
  refreshQueue = [];
};

// Response interceptor — auto-refresh on 401, handle 5xx
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.message === 'offline') return Promise.reject(error);

    const status = error.response?.status;
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url?.includes('/auth/');

    if (status === 401 && !isAuthRoute && !originalRequest?._retry) {
      const { refreshToken, setToken, logout } = useAuthStore.getState();

      if (refreshToken) {
        if (isRefreshing) {
          // Queue this request while refresh is in progress
          return new Promise((resolve, reject) => {
            refreshQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken }
          );
          const { token: newToken, refreshToken: newRefreshToken } = res.data.data;
          setToken(newToken, newRefreshToken);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          logout();
          window.location.href = '/login';
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      // No refresh token — clear auth and redirect
      if (!window.location.pathname.includes('/login')) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    if (status === 502 || status === 503) {
      toast.error('Service temporarily unavailable. Please try again in a moment.');
    } else if (status >= 500) {
      toast.error('A server error occurred. Please try again shortly.');
    }

    return Promise.reject(error);
  }
);

// Helper functions - IMPORTANT: Return response.data for SWR compatibility
export const apiGet = (url, config = {}) => api.get(url, config).then(res => res.data);
export const apiPost = (url, data, config = {}) => api.post(url, data, config).then(res => res.data);
export const apiPut = (url, data, config = {}) => api.put(url, data, config).then(res => res.data);
export const apiPatch = (url, data, config = {}) => api.patch(url, data, config).then(res => res.data);
export const apiDelete = (url, config = {}) => api.delete(url, config).then(res => res.data);

// Export axios instance
export { api };
export default api;
