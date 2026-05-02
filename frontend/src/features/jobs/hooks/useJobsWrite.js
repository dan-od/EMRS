/**
 * Jobs Hooks - Mutations (Write) Enhanced
 */
import { api } from '@/services/api';

export const useJobActions = () => ({
  createJob: async (data) => (await api.post('/jobs', data)).data.job,
  updateJob: async (id, data) => (await api.put(`/jobs/${id}`, data)).data.job
});

export const useJobWorkflow = () => ({
  submitJob: async (id) => (await api.post(`/jobs/${id}/submit`)).data,
  approveJob: async (id) => (await api.post(`/jobs/${id}/approve`)).data,
  rejectJob: async (id, reason) => (await api.post(`/jobs/${id}/reject`, { reason })).data,
  signoffJob: async (id, notes, confirmations) => (await api.post(`/jobs/${id}/signoff`, { notes, confirmations })).data,
  startJob: async (id) => (await api.post(`/jobs/${id}/start`)).data,
  moveToPostJob: async (id) => (await api.post(`/jobs/${id}/post-job`)).data,
  completeJob: async (id) => (await api.post(`/jobs/${id}/complete`)).data,
  cancelJob: async (id, reason) => (await api.post(`/jobs/${id}/cancel`, { reason })).data
});

export const useTeamActions = () => ({
  addMember: async (jobId, userId, role) => (await api.post(`/jobs/${jobId}/team`, { user_id: userId, role })).data,
  addMembers: async (jobId, members) => (await api.post(`/jobs/${jobId}/team/batch`, { members })).data,
  removeMember: async (jobId, userId) => api.delete(`/jobs/${jobId}/team/${userId}`),
  updateRole: async (jobId, userId, role) => (await api.put(`/jobs/${jobId}/team/${userId}/role`, { role })).data
});

export const useEquipmentItemActions = () => ({
  addInventoryItem: async (jobId, data) => (await api.post(`/jobs/${jobId}/items/inventory`, data)).data.item,
  addClientItem: async (jobId, data) => (await api.post(`/jobs/${jobId}/items/client`, data)).data.item,
  addNewRequest: async (jobId, data) => (await api.post(`/jobs/${jobId}/items/new-request`, data)).data.item,
  updateItem: async (jobId, itemId, data) => (await api.put(`/jobs/${jobId}/items/${itemId}`, data)).data.item,
  removeItem: async (jobId, itemId) => api.delete(`/jobs/${jobId}/items/${itemId}`),
  getHistory: async (jobId, itemId) => (await api.get(`/jobs/${jobId}/items/${itemId}/history`)).data.history,
  supervisorApprove: async (jobId, itemId, notes) => (await api.post(`/jobs/${jobId}/items/${itemId}/supervisor-approve`, { notes })).data,
  supervisorReject: async (jobId, itemId, reason) => (await api.post(`/jobs/${jobId}/items/${itemId}/supervisor-reject`, { reason })).data
});

export const usePurchasingActions = () => ({
  disburseItem: async (itemId, notes) => (await api.post(`/jobs/purchasing/disburse/${itemId}`, { notes })).data,
  startSourcing: async (itemId, notes, estimatedArrival) => (await api.post(`/jobs/purchasing/sourcing/${itemId}`, { notes, estimated_arrival: estimatedArrival })).data,
  itemArrived: async (itemId, data) => (await api.post(`/jobs/purchasing/arrived/${itemId}`, data)).data,
  disburseArrived: async (itemId, notes) => (await api.post(`/jobs/purchasing/disburse-arrived/${itemId}`, { notes })).data,
  acceptReturn: async (itemId, condition, hoursUsed, notes) => (await api.post(`/jobs/purchasing/return/${itemId}`, { condition, hours_used: hoursUsed, notes })).data,
  markRepairComplete: async (jobId, itemId, notes) => (await api.post(`/jobs/purchasing/repair-complete/${itemId}`, { notes })).data
});

export const useInspectionActions = () => ({
  getDraft: async (jobId, itemId) => (await api.get(`/jobs/${jobId}/items/${itemId}/inspection/draft`)).data.draft,
  autosave: async (jobId, inspectionId, data) => (await api.post(`/jobs/${jobId}/inspections/${inspectionId}/autosave`, data)).data,
  submitInspection: async (jobId, itemId, data) => (await api.post(`/jobs/${jobId}/items/${itemId}/inspect`, data)).data,
  getItemInspections: async (jobId, itemId) => (await api.get(`/jobs/${jobId}/items/${itemId}/inspections`)).data.inspections,
  getFailedItems: async (jobId, inspectionId) => (await api.get(`/jobs/${jobId}/inspections/${inspectionId}/failed-items`)).data.failed_items,
  decisionOnItem: async (jobId, inspectionId, failedItemId, decision, notes) => (await api.post(`/jobs/${jobId}/inspections/${inspectionId}/items/${failedItemId}/decision`, { decision, notes })).data,
  signOffInspection: async (jobId, inspectionId) => (await api.post(`/jobs/${jobId}/inspections/${inspectionId}/signoff`)).data,
  markRepairComplete: async (jobId, itemId) => (await api.post(`/jobs/${jobId}/items/${itemId}/repair-complete`)).data
});

export const useMaterialActions = () => ({
  addMaterialRequests: async (jobId, items, jobRole) => (await api.post(`/jobs/${jobId}/materials`, { items, jobRole })).data,
  searchInventory: async (query) => (await api.get('/jobs/materials/search-inventory', { params: { q: query } })).data,
  linkAndDisburse: async (itemId, data) => (await api.post(`/jobs/materials/${itemId}/link-disburse`, data)).data,
  partialFulfill: async (itemId, data) => (await api.post(`/jobs/materials/${itemId}/partial-fulfill`, data)).data,
  returnMaterial: async (itemId, data) => (await api.post(`/jobs/materials/${itemId}/return`, data)).data,
  markAsConsumed: async (itemId, notes) => (await api.post(`/jobs/materials/${itemId}/consumed`, { notes })).data,
  getMaterialsInQueue: async () => (await api.get('/jobs/materials/queue')).data,
  getItemsNeedingReturn: async () => (await api.get('/jobs/materials/pending-return')).data,
  getJobTransactions: async (jobId) => (await api.get(`/jobs/${jobId}/inventory-transactions`)).data,
  getInventoryHistory: async (inventoryId) => (await api.get(`/jobs/inventory/${inventoryId}/history`)).data
});