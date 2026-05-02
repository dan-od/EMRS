/**
 * Equipment Service
 * Post-Phase 5: Tools vs Equipment API calls
 */
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';

const BASE = '/equipment';

// Helper to clean params - removes empty, null, undefined values
const cleanParams = (params) => {
  if (!params) return '';
  const cleaned = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  });
  const query = new URLSearchParams(cleaned).toString();
  return query ? `?${query}` : '';
};

export const equipmentService = {
  // Main CRUD - use high limit to get all equipment
  getAll: (params) => {
    const withLimit = { limit: 100, ...params };
    return apiGet(`${BASE}${cleanParams(withLimit)}`);
  },
  getById: (id) => apiGet(`${BASE}/${id}`),
  create: (data) => apiPost(BASE, data),
  update: (id, data) => apiPut(`${BASE}/${id}`, data),
  delete: (id) => apiDelete(`${BASE}/${id}`),

  // Types
  getTypes: (category) => {
    const query = category ? `?category=${category}` : '';
    return apiGet(`${BASE}/types${query}`);
  },
  createCustomType: (data) => apiPost(`${BASE}/types`, data),

  // Stats
  getStats: () => apiGet(`${BASE}/stats`),
  getStatsByDepartment: () => apiGet(`${BASE}/stats/by-department`),

  // Hide/Unhide
  hide: (id, reason) => apiPost(`${BASE}/${id}/hide`, { reason }),
  unhide: (id) => apiPost(`${BASE}/${id}/unhide`),

  // Sharing
  updateSharing: (id, departments) => apiPost(`${BASE}/${id}/share`, { departments }),

  // Hours & Maintenance
  logHours: (id, data) => apiPost(`${BASE}/${id}/log-hours`, data),
  getMaintenanceDue: () => apiGet(`${BASE}/maintenance-due`),
  getHoursLog: (id) => apiGet(`${BASE}/${id}/hours-log`),
  logMaintenance: (id, data) => apiPost(`${BASE}/${id}/maintenance`, data),
  getMaintenanceLog: (id) => apiGet(`${BASE}/${id}/maintenance-log`)
};

export default equipmentService;
