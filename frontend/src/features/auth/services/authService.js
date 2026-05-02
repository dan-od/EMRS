import { apiPost, apiGet } from '@/services/api';
import { AUTH } from '@/services/endpoints';

export const authService = {
  login: async (credentials) => {
    return apiPost(AUTH.LOGIN, credentials);
  },

  logout: async (refreshToken) => {
    return apiPost(AUTH.LOGOUT, refreshToken ? { refreshToken } : {});
  },

  getMe: async () => {
    return apiGet(AUTH.ME);
  },

  forgotPassword: async (email) => {
    return apiPost(AUTH.FORGOT_PASSWORD, { email });
  },

  resetPassword: async (token, password) => {
    return apiPost(AUTH.RESET_PASSWORD, { token, password });
  },

  changePassword: async (data) => {
    return apiPost(AUTH.CHANGE_PASSWORD, data);
  },

  refreshToken: async () => {
    return apiPost(AUTH.REFRESH);
  }
};
