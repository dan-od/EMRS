import { apiGet, apiPost, apiPut } from '@/services/api';
import { REQUESTS } from '@/services/endpoints';

export const requestsService = {
  getAll: async (params) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiGet(`${REQUESTS.BASE}${queryString}`);
  },

  getById: async (id) => {
    return apiGet(REQUESTS.BY_ID(id));
  },

  getMy: async () => {
    return apiGet(REQUESTS.MY);
  },

  getPending: async () => {
    return apiGet(REQUESTS.PENDING);
  },

  create: async (data) => {
    return apiPost(REQUESTS.BASE, data);
  },

  approve: async (id, comments) => {
    return apiPut(REQUESTS.APPROVE(id), { comments });
  },

  reject: async (id, reason) => {
    return apiPut(REQUESTS.REJECT(id), { reason });
  },

  cancel: async (id) => {
    return apiPut(`${REQUESTS.BY_ID(id)}/cancel`);
  }
};
