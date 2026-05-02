/**
 * Return Extensions Routes
 */

const express = require('express');
const router = express.Router();
const controller = require('./extensions.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRoles } = require('../../middleware/roleCheck');

const MANAGER_ROLES = [
  'Super_Admin', 'Admin', 'IT_Manager',
  'Operations_Manager', 'Purchasing_Manager', 'Accounts_Manager',
  'Safety_Manager', 'Maintenance_Manager',
  'HR_Manager', 'Logistics_Manager', 'Workshop_Manager'
];
const PURCHASING_ROLES = ['Super_Admin', 'Admin', 'Purchasing_Manager', 'Purchasing_Staff'];

router.use(authenticate);

// Manager routes - MUST come before /:id
router.get('/pending/manager', requireRoles(MANAGER_ROLES), controller.getPendingForManager);

// Purchasing routes - MUST come before /:id
router.get('/pending/purchasing', requireRoles(PURCHASING_ROLES), controller.getPendingForPurchasing);

// User routes
router.post('/', controller.create);
router.get('/request/:requestId', controller.getByRequestId);

// Parameterized routes LAST
router.get('/:id', controller.getById);
router.post('/:id/manager-approve', requireRoles(MANAGER_ROLES), controller.managerApprove);
router.post('/:id/manager-reject', requireRoles(MANAGER_ROLES), controller.managerReject);
router.post('/:id/purchasing-approve', requireRoles(PURCHASING_ROLES), controller.purchasingApprove);
router.post('/:id/purchasing-reject', requireRoles(PURCHASING_ROLES), controller.purchasingReject);

module.exports = router;
