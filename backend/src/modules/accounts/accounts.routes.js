/**
 * Accounts Routes
 * API endpoints for accounts department - work order cost tracking
 */

const express = require('express');
const router = express.Router();
const controller = require('./accounts.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRoles } = require('../../middleware/roleCheck');

// Accounts roles that can access these endpoints
const ACCOUNTS_ROLES = ['Super_Admin', 'Admin', 'Accounts_Manager', 'Accounts_Staff'];

// All routes require authentication
router.use(authenticate);

// All routes require accounts role
router.use(requireRoles(ACCOUNTS_ROLES));

// =====================================================
// WORK ORDERS
// =====================================================

// GET /api/accounts/work-orders - List completed work orders with costs
router.get('/work-orders', controller.getWorkOrders);

// GET /api/accounts/work-orders/:id - Single work order detail
router.get('/work-orders/:id', controller.getWorkOrderById);

// POST /api/accounts/work-orders/:id/payment - Record final payment
router.post('/work-orders/:id/payment', controller.recordPayment);

// =====================================================
// STATISTICS & REPORTS
// =====================================================

// GET /api/accounts/stats - Cost summary statistics
router.get('/stats', controller.getStats);

// GET /api/accounts/costs-by-department - Costs grouped by department
router.get('/costs-by-department', controller.getCostsByDepartment);

// GET /api/accounts/costs-by-vendor - Costs grouped by vendor
router.get('/costs-by-vendor', controller.getCostsByVendor);

// GET /api/accounts/service-breakdown - In-House vs External breakdown
router.get('/service-breakdown', controller.getServiceBreakdown);

// =====================================================
// EXPORT
// =====================================================

// GET /api/accounts/export - Export work orders for Excel
router.get('/export', controller.exportWorkOrders);

module.exports = router;
