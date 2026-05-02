import { apiGet, apiPost, apiPut } from '@/services/api';
import { SAFETY } from '@/services/endpoints';

export const safetyService = {
  getAll: async (params) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiGet(`${SAFETY.BASE}${queryString}`);
  },

  getById: async (id) => {
    return apiGet(SAFETY.BY_ID(id));
  },

  getMy: async () => {
    return apiGet(SAFETY.MY);
  },

  create: async (data) => {
    return apiPost(SAFETY.BASE, data);
  },

  update: async (id, data) => {
    return apiPut(SAFETY.BY_ID(id), data);
  },

  updateStatus: async (id, status, notes) => {
    return apiPut(`${SAFETY.BY_ID(id)}/status`, { status, notes });
  },

  getStats: async () => {
    return apiGet(SAFETY.STATS);
  }
};
