/**
 * Jobs Routes - API Endpoints (Enhanced)
 * FIXED: Static routes moved BEFORE dynamic :id routes
 * 
 * ACTUAL DB ROLES: Super_Admin, Admin, Field_Engineer, IT_Support,
 * Operations_Manager, Purchasing_Manager, Accounts_Manager,
 * Safety_Manager, Maintenance_Manager,
 * Purchasing_Staff, Accounts_Staff, Safety_Officer, Staff
 */
const express = require('express');
const router = express.Router();
const ctrl = require('./controllers');
const { authenticate } = require('../../middleware/auth');
const { requireRoles } = require('../../middleware/roleCheck');
const { validate } = require('../../middleware/validate');
const v = require('./validation');

router.use(authenticate);

const MANAGERS = ['Super_Admin', 'Admin', 'Operations_Manager', 'Maintenance_Manager'];
const PURCHASING = ['Super_Admin', 'Admin', 'Purchasing_Manager', 'Purchasing_Staff'];

// ============================================
// STATIC ROUTES (must be before :id routes)
// ============================================

// Purchasing Queue
router.get('/purchasing/queue', requireRoles(PURCHASING), ctrl.getQueue);
router.get('/purchasing/stats', requireRoles(PURCHASING), ctrl.getQueueStats);
router.get('/purchasing/repairs', requireRoles(PURCHASING), ctrl.getItemsUnderRepair);
router.post('/purchasing/disburse/:itemId', requireRoles(PURCHASING), ctrl.disburseItem);
router.post('/purchasing/sourcing/:itemId', requireRoles(PURCHASING), ctrl.startSourcing);
router.post('/purchasing/arrived/:itemId', requireRoles(PURCHASING), ctrl.itemArrived);
router.post('/purchasing/disburse-arrived/:itemId', requireRoles(PURCHASING), ctrl.disburseArrived);
router.post('/purchasing/return/:itemId', requireRoles(PURCHASING), ctrl.acceptReturn);
router.post('/purchasing/repair-complete/:itemId', requireRoles(PURCHASING), ctrl.markRepairCompleteFromQueue);

// Manager Approval (for additional equipment requests on active jobs)
router.get('/equipment/pending-approval', requireRoles(MANAGERS), ctrl.getPendingManagerApproval);
router.post('/equipment/:itemId/manager-approve', requireRoles(MANAGERS), ctrl.managerApproveRequest);
router.post('/equipment/:itemId/manager-reject', requireRoles(MANAGERS), ctrl.managerRejectRequest);

// Stats & My Jobs
router.get('/stats', ctrl.getStats);
router.get('/my', ctrl.getMyJobs);

// ============================================
// MATERIAL/TOOL ROUTES (STATIC - before :id)
// ============================================
// Search inventory for linking (purchasing only)
router.get('/materials/search-inventory', requireRoles(PURCHASING), ctrl.searchInventory);

// Get materials in purchasing queue
router.get('/materials/queue', requireRoles(PURCHASING), ctrl.getMaterialsInQueue);

// Get items needing return
router.get('/materials/pending-return', requireRoles(PURCHASING), ctrl.getItemsNeedingReturn);

// Link material to inventory and disburse (purchasing only)
router.post('/materials/:itemId/link-disburse', requireRoles(PURCHASING), ctrl.linkAndDisburse);

// Partial fulfillment - disburse some, source rest (purchasing only)
router.post('/materials/:itemId/partial-fulfill', requireRoles(PURCHASING), ctrl.partialFulfillment);

// Return material to inventory (purchasing only)
router.post('/materials/:itemId/return', requireRoles(PURCHASING), ctrl.returnMaterial);

// Mark as consumed (no return) (purchasing only)
router.post('/materials/:itemId/consumed', requireRoles(PURCHASING), ctrl.markAsConsumed);

// Get inventory item transaction history (purchasing only)
router.get('/inventory/:inventoryId/history', requireRoles(PURCHASING), ctrl.getInventoryHistory);

// ============================================
// JOBS CRUD
// ============================================
router.get('/', ctrl.getAllJobs);
router.post('/', requireRoles(MANAGERS), validate(v.createJobSchema), ctrl.createJob);
router.get('/:id', ctrl.getJobById);
router.put('/:id', validate(v.updateJobSchema), ctrl.updateJob);

// ============================================
// WORKFLOW
// ============================================
router.post('/:id/submit', ctrl.submitJob);
router.post('/:id/approve', requireRoles(MANAGERS), ctrl.approveJob);
router.post('/:id/reject', requireRoles(MANAGERS), validate(v.rejectJobSchema), ctrl.rejectJob);
router.post('/:id/signoff', validate(v.signoffJobSchema), ctrl.signoffJob);
router.post('/:id/start', ctrl.startJob);
router.post('/:id/post-job', ctrl.moveToPostJob);
router.post('/:id/complete', ctrl.completeJob);
router.post('/:id/cancel', requireRoles(MANAGERS), ctrl.cancelJob);

// ============================================
// TEAM
// ============================================
router.get('/:id/team', ctrl.getTeam);
router.post('/:id/team', validate(v.addTeamMemberSchema), ctrl.addTeamMember);
router.post('/:id/team/batch', validate(v.addTeamMembersSchema), ctrl.addTeamMembers);
router.put('/:id/team/:userId/role', ctrl.updateTeamRole);
router.delete('/:id/team/:userId', ctrl.removeTeamMember);

// ============================================
// EQUIPMENT & MATERIALS (Dynamic :id routes)
// ============================================
router.get('/:id/items', ctrl.getEquipmentItems);
router.post('/:id/items/inventory', validate(v.addInventoryItemSchema), ctrl.addInventoryItem);
router.post('/:id/items/client', validate(v.addClientItemSchema), ctrl.addClientItem);
router.post('/:id/items/new-request', validate(v.addNewRequestSchema), ctrl.addNewRequest);
router.put('/:id/items/:itemId', validate(v.updateItemSchema), ctrl.updateItem);
router.delete('/:id/items/:itemId', ctrl.removeItem);
router.get('/:id/items/:itemId/history', ctrl.getItemHistory);

// Batch add material requests (free-text)
router.post('/:id/materials', ctrl.addMaterialRequests);

// Get job inventory transactions
router.get('/:id/inventory-transactions', ctrl.getJobTransactions);

// ============================================
// SUPERVISOR APPROVAL (for Chief Operator/DAQ requests)
// ============================================
router.post('/:id/items/:itemId/supervisor-approve', ctrl.supervisorApprove);
router.post('/:id/items/:itemId/supervisor-reject', ctrl.supervisorReject);

// ============================================
// PRE-INSPECTION CHECKLIST (Enhanced)
// ============================================
router.get('/:id/inspections/template', ctrl.getInspectionTemplate);
router.get('/:id/inspections/pending', ctrl.getPendingInspections);
router.get('/:id/inspections/acknowledged', ctrl.getAcknowledgedItems);
router.get('/:id/inspections', ctrl.getJobInspections);
router.get('/:id/items/:itemId/inspections', ctrl.getItemInspections);
router.get('/:id/items/:itemId/inspection/draft', ctrl.getOrCreateDraft);
router.post('/:id/inspections/:inspectionId/autosave', ctrl.autosaveInspection);
router.post('/:id/items/:itemId/inspect', ctrl.submitInspection);
router.post('/:id/inspections/:inspectionId/signoff', ctrl.signOffInspection);
router.get('/:id/inspections/:inspectionId/failed-items', ctrl.getFailedItems);
router.post('/:id/inspections/:inspectionId/items/:failedItemId/decision', ctrl.managerDecisionOnItem);
router.post('/:id/items/:itemId/repair-complete', ctrl.markRepairComplete);

module.exports = router;
