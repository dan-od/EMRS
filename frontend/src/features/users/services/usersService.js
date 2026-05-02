import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/services/api';
import { USERS } from '@/services/endpoints';

export const usersService = {
  getAll: async (params) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiGet(`${USERS.BASE}${queryString}`);
  },

  getById: async (id) => {
    return apiGet(USERS.BY_ID(id));
  },

  create: async (data) => {
    return apiPost(USERS.BASE, data);
  },

  update: async (id, data) => {
    return apiPut(USERS.BY_ID(id), data);
  },

  delete: async (id) => {
    return apiDelete(USERS.BY_ID(id));
  },

  resetPassword: async (id, password) => {
    return apiPost(USERS.RESET_PASSWORD(id), { password });
  },

  toggleActive: async (id, isActive) => {
    return apiPatch(USERS.TOGGLE_ACTIVE(id), { isActive });
  }
};
