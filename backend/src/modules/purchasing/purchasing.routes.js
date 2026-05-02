const express = require('express');
const router = express.Router();
const controller = require('./purchasing.controller');
const damagedController = require('./damagedInventory.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRoles } = require('../../middleware/roleCheck');
const { validate } = require('../../middleware/validate');
const validation = require('./purchasing.validation');

router.use(authenticate);

const purchasingRoles = ['Super_Admin', 'Admin', 'Purchasing_Manager', 'Purchasing_Staff'];

// Inventory routes
router.get('/inventory', requireRoles(purchasingRoles), controller.getInventory);
router.get('/inventory/low-stock', requireRoles(purchasingRoles), controller.getLowStock);
router.get('/inventory/:id', requireRoles(purchasingRoles), controller.getInventoryById);
router.get('/inventory/:id/movements', requireRoles(purchasingRoles), controller.getStockMovements);
router.post('/inventory', requireRoles(purchasingRoles), 
  validate(validation.createItem), controller.createInventoryItem);
router.put('/inventory/:id', requireRoles(purchasingRoles), 
  validate(validation.updateItem), controller.updateInventoryItem);
router.post('/inventory/:id/add-stock', requireRoles(purchasingRoles), 
  validate(validation.addStock), controller.addStock);

// Damaged/Missing Inventory routes
router.get('/damaged-inventory', requireRoles(purchasingRoles), damagedController.getAll);
router.get('/damaged-inventory/stats', requireRoles(purchasingRoles), damagedController.getStats);
router.get('/damaged-inventory/request/:requestId', requireRoles(purchasingRoles), damagedController.getByRequest);
router.get('/damaged-inventory/:id', requireRoles(purchasingRoles), damagedController.getById);
router.patch('/damaged-inventory/:id/status', requireRoles(purchasingRoles), damagedController.updateStatus);

// Disbursement routes
router.get('/disbursements', requireRoles(purchasingRoles), controller.getDisbursements);
router.get('/disbursements/pending', requireRoles(purchasingRoles), controller.getPendingDisbursements);
router.post('/disbursements', requireRoles(purchasingRoles), validate(validation.createDisbursement), controller.createDisbursement);
router.post('/disbursements/:id/approve', requireRoles(purchasingRoles), controller.approveDisbursement);
router.post('/disbursements/:id/reject', requireRoles(purchasingRoles), 
  validate(validation.rejectDisbursement), controller.rejectDisbursement);

// Stats
router.get('/stats', requireRoles(purchasingRoles), controller.getStats);

// Dashboard — single endpoint replacing 11 concurrent SWR calls
router.get('/dashboard-stats', requireRoles(purchasingRoles), controller.getDashboardStats);

module.exports = router;
