/**
 * API Endpoints - Jobs Module Updates
 * Add these to your existing endpoints.js file
 */

// Enhanced Jobs endpoints
export const JOBS = {
  BASE: '/jobs',
  BY_ID: (id) => `/jobs/${id}`,
  STATUS: (id) => `/jobs/${id}/status`,
  STATUS_HISTORY: (id) => `/jobs/${id}/status-history`,
  STATS: '/jobs/stats',
  
  // Team management
  TEAM: (id) => `/jobs/${id}/team`,
  REMOVE_TEAM_MEMBER: (jobId, userId) => `/jobs/${jobId}/team/${userId}`,
  SUPERVISOR: (id) => `/jobs/${id}/supervisor`,
  
  // Equipment management  
  EQUIPMENT: (id) => `/jobs/${id}/equipment`,
  REMOVE_EQUIPMENT: (jobId, equipmentId) => `/jobs/${jobId}/equipment/${equipmentId}`,
  
  // Inspections
  INSPECTIONS: (id) => `/jobs/${id}/inspections`
};

// Export for merge with existing endpoints
export default JOBS;
