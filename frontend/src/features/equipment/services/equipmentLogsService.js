/**
 * Equipment Logs Service
 * API calls for equipment general and maintenance logs
 */

import { apiGet, apiPost } from '@/services/api';

export const equipmentLogsService = {
  // General Log
  getGeneralLogs: (equipmentId, params = {}) => {
    const query = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
    return apiGet(`/equipment/${equipmentId}/logs/general${query}`);
  },

  createGeneralLog: (equipmentId, data) => {
    return apiPost(`/equipment/${equipmentId}/logs/general`, data);
  },

  // Maintenance Log
  getMaintenanceLogs: (equipmentId, params = {}) => {
    const query = Object.keys(params).length ? `?${new URLSearchParams(params)}` : '';
    return apiGet(`/equipment/${equipmentId}/logs/maintenance${query}`);
  },

  createMaintenanceLog: (equipmentId, data) => {
    return apiPost(`/equipment/${equipmentId}/logs/maintenance`, data);
  }
};
