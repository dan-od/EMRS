/**
 * Maintenance Service
 * API calls for maintenance module
 */

import { apiGet, apiPost, apiPut } from '@/services/api';

const BASE = '/maintenance';

export const maintenanceService = {
  // List all maintenance with filters
  getAll: (params) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiGet(`${BASE}${query}`);
  },

  // Get single maintenance record
  getById: (id) => apiGet(`${BASE}/${id}`),

  // Get maintenance stats
  getStats: () => apiGet(`${BASE}/stats`),

  // Get due/overdue maintenance
  getDue: (days = 7) => apiGet(`${BASE}/due?days=${days}`),

  // Get maintenance schedule (calendar view)
  getSchedule: (startDate, endDate) => 
    apiGet(`${BASE}/schedule?startDate=${startDate}&endDate=${endDate}`),

  // Get maintenance by equipment
  getByEquipment: (equipmentId) => apiGet(`${BASE}/equipment/${equipmentId}`),

  // Create new maintenance
  create: (data) => apiPost(BASE, data),

  // Update maintenance
  update: (id, data) => apiPut(`${BASE}/${id}`, data),

  // Start work on maintenance
  startWork: (id) => apiPost(`${BASE}/${id}/start`),

  // Complete maintenance
  complete: (id, data) => apiPost(`${BASE}/${id}/complete`, data),

  // Cancel maintenance
  cancel: (id, reason) => apiPost(`${BASE}/${id}/cancel`, { reason }),

  // Assign technician
  assignTechnician: (id, technicianId) => 
    apiPost(`${BASE}/${id}/assign`, { technicianId })
};
