import { apiGet, apiPost, apiPut, apiPatch } from '@/services/api';
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

  // PATCH, not PUT: safety.routes.js registers this as router.patch, so a PUT
  // matched no route and 404'd before reaching the handler.
  updateStatus: async (id, status, resolution) => {
    return apiPatch(SAFETY.UPDATE_STATUS(id), { status, resolution });
  },

  getStats: async () => {
    return apiGet(SAFETY.STATS);
  }
};
