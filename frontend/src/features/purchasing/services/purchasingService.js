import { apiGet, apiPost, apiPut } from '@/services/api';
import { PURCHASING } from '@/services/endpoints';

export const purchasingService = {
  // Inventory
  getInventory: async (params) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiGet(`${PURCHASING.INVENTORY}${queryString}`);
  },

  getInventoryItem: async (id) => {
    return apiGet(`${PURCHASING.INVENTORY}/${id}`);
  },

  updateInventory: async (id, data) => {
    return apiPut(`${PURCHASING.INVENTORY}/${id}`, data);
  },

  addStock: async (id, quantity, notes) => {
    return apiPost(`${PURCHASING.INVENTORY}/${id}/add-stock`, { quantity, notes });
  },

  // Disbursements
  getDisbursements: async (params) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return apiGet(`${PURCHASING.DISBURSEMENTS}${queryString}`);
  },

  getPendingDisbursements: async () => {
    return apiGet(`${PURCHASING.DISBURSEMENTS}/pending`);
  },

  processDisbursement: async (id, action, notes) => {
    return apiPut(`${PURCHASING.DISBURSEMENTS}/${id}`, { action, notes });
  },

  // Stats
  getStats: async () => {
    return apiGet(PURCHASING.STATS);
  },

  getLowStock: async () => {
    return apiGet(`${PURCHASING.INVENTORY}/low-stock`);
  }
};
