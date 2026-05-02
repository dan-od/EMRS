const express = require('express');
const router = express.Router();
const controller = require('./requests.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRoles } = require('../../middleware/roleCheck');
const { validate } = require('../../middleware/validate');
const validation = require('./requests.validation');

const ADMIN_ROLES = ['Super_Admin', 'Admin'];
const MANAGER_ROLES = [
  'Super_Admin', 'Admin', 'IT_Manager',
  'Operations_Manager', 'Purchasing_Manager', 'Accounts_Manager',
  'Safety_Manager', 'Maintenance_Manager',
  'HR_Manager', 'Logistics_Manager', 'Workshop_Manager'
];
const PURCHASING_ROLES = ['Super_Admin', 'Admin', 'Purchasing_Manager', 'Purchasing_Staff'];

router.use(authenticate);

// =====================================================
// USER ROUTES
// =====================================================
router.get('/my', controller.getMyRequests);
router.get('/active', controller.getActiveRequests);
router.post('/', validate(validation.create), controller.create);
router.post('/:id/cancel', controller.cancel);

// Return initiation (by requester)
router.post('/:id/return', controller.initiateReturn);

// =====================================================
// PURCHASING ROUTES
// =====================================================
router.get('/purchasing/all', requireRoles(PURCHASING_ROLES), controller.getAllForPurchasing);
router.get('/purchasing/ready', requireRoles(PURCHASING_ROLES), controller.getReadyToDisburse);
router.get('/purchasing/on-hold', requireRoles(PURCHASING_ROLES), controller.getOnHold);
router.get('/purchasing/disbursed', requireRoles(PURCHASING_ROLES), controller.getDisbursedActive);
router.get('/purchasing/pending-return', requireRoles(PURCHASING_ROLES), controller.getPendingReturn);
router.get('/purchasing/overdue', requireRoles(PURCHASING_ROLES), controller.getOverdueReturns);
router.get('/purchasing/completed', requireRoles(PURCHASING_ROLES), controller.getCompleted);
router.get('/purchasing/maintenance', requireRoles(PURCHASING_ROLES), controller.getMaintenanceRequests);
router.get('/purchasing/maintenance-approved', requireRoles(PURCHASING_ROLES), controller.getMaintenanceApproved);
router.get('/purchasing/stats', requireRoles(PURCHASING_ROLES), controller.getPurchasingStats);
router.get('/purchasing/overdue-summary', requireRoles(PURCHASING_ROLES), controller.getOverdueSummary);
router.post('/purchasing/trigger-reminders', requireRoles(['Super_Admin', 'Admin', 'Purchasing_Manager']), controller.triggerOverdueReminders);

// Disbursement actions
router.post('/:id/disburse', requireRoles(PURCHASING_ROLES), validate(validation.disburse), controller.disburse);
router.post('/:id/hold', requireRoles(PURCHASING_ROLES), controller.putOnHold);
router.post('/:id/release-hold', requireRoles(PURCHASING_ROLES), controller.releaseFromHold);
router.post('/:id/confirm-return', requireRoles(PURCHASING_ROLES), controller.confirmReturn);
router.post('/:id/complete', requireRoles(PURCHASING_ROLES), controller.complete);
router.post('/:id/remind-return', requireRoles(PURCHASING_ROLES), controller.remindReturn);

// =====================================================
// ADMIN ROUTES
// =====================================================
router.get('/all', requireRoles(ADMIN_ROLES), controller.getAllRequests);

// =====================================================
// MANAGER ROUTES
// =====================================================
router.get('/', requireRoles(MANAGER_ROLES), controller.getAll);
router.get('/pending', requireRoles(MANAGER_ROLES), controller.getPending);
router.get('/department', requireRoles(MANAGER_ROLES), controller.getDeptRequests);

// =====================================================
// SHARED ROUTES
// =====================================================
router.get('/:id', controller.getById);
router.get('/:id/history', controller.getHistory);
router.get('/:id/audit-trail', controller.getAuditTrail);

// =====================================================
// APPROVAL ROUTES
// =====================================================
router.post('/:id/approve', requireRoles(MANAGER_ROLES), validate(validation.approve), controller.approve);
router.post('/:id/reject', requireRoles(MANAGER_ROLES), validate(validation.reject), controller.reject);
router.post('/:id/transfer', requireRoles(MANAGER_ROLES), controller.transfer);

module.exports = router;
