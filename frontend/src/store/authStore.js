/**
 * Auth Store - Zustand with persist
 * Stores user, access token, and refresh token in localStorage
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      // Login - store user and tokens
      login: (user, token, refreshToken = null) => {
        set({ user, token, refreshToken, isAuthenticated: true });
      },

      // Logout - clear everything
      logout: () => {
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },

      // Update stored access token (used by refresh interceptor)
      setToken: (token, refreshToken) => {
        set((state) => ({ ...state, token, refreshToken: refreshToken ?? state.refreshToken }));
      },

      // Update user info
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null
        }));
      },

      // Get current token
      getToken: () => get().token,

      // Check if authenticated
      checkAuth: () => {
        const state = get();
        return state.isAuthenticated && !!state.token;
      },
    }),
    {
      name: 'emrs-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
