/**
 * Jobs Service
 * API calls for jobs management
 */
import { api } from '@/services/api';
import { JOBS } from '@/services/endpoints';

export const jobsService = {
  // Core CRUD
  getAll: (params) => api.get(JOBS.BASE, { params }),
  getById: (id) => api.get(JOBS.BY_ID(id)),
  create: (data) => api.post(JOBS.BASE, data),
  update: (id, data) => api.put(JOBS.BY_ID(id), data),
  delete: (id) => api.delete(JOBS.BY_ID(id)),

  // Status
  updateStatus: (id, status, notes) => api.patch(JOBS.STATUS(id), { status, notes }),
  getStats: () => api.get(`${JOBS.BASE}/stats`),
  getStatusHistory: (id) => api.get(`${JOBS.BY_ID(id)}/status-history`),

  // Team
  getTeam: (id) => api.get(JOBS.TEAM(id)),
  addTeamMember: (jobId, userId, roleInJob) => 
    api.post(JOBS.TEAM(jobId), { userId, roleInJob }),
  removeTeamMember: (jobId, userId) => 
    api.delete(JOBS.REMOVE_TEAM_MEMBER(jobId, userId)),
  setSupervisor: (jobId, userId) => 
    api.patch(`${JOBS.BY_ID(jobId)}/supervisor`, { userId }),

  // Equipment
  getEquipment: (id) => api.get(JOBS.EQUIPMENT(id)),
  addEquipment: (jobId, equipmentId) => 
    api.post(JOBS.EQUIPMENT(jobId), { equipmentId }),
  removeEquipment: (jobId, equipmentId) => 
    api.delete(`${JOBS.EQUIPMENT(jobId)}/${equipmentId}`),

  // Inspections
  getInspections: (id) => api.get(JOBS.INSPECTIONS(id)),
  addInspection: (jobId, data) => 
    api.post(JOBS.INSPECTIONS(jobId), data)
};

export default jobsService;
