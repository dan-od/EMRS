/**
 * Maintenance Routes
 */

const express = require('express');
const router = express.Router();
const maintenanceController = require('./maintenance.controller');
const { authenticate, requireRoles, validate } = require('../../middleware');
const { 
  createSchema, 
  updateSchema, 
  completeSchema 
} = require('./maintenance.validation');

// All routes require authentication
router.use(authenticate);

// Get all maintenance records
router.get('/', maintenanceController.getAll);

// Get maintenance stats
router.get('/stats', maintenanceController.getStats);

// Get due/overdue maintenance
router.get('/due', maintenanceController.getDue);

// Get maintenance schedule (calendar)
router.get('/schedule', maintenanceController.getSchedule);

// Get single maintenance record
router.get('/:id', maintenanceController.getById);

// Get maintenance history
router.get('/:id/history', maintenanceController.getHistory);

// Get maintenance by equipment
router.get('/equipment/:equipmentId', maintenanceController.getByEquipment);

// Create maintenance (Managers, Admins, Maintenance dept)
router.post(
  '/',
  requireRoles(['Super_Admin', 'Admin', 'Operations_Manager', 'Maintenance_Manager', 'Purchasing_Manager']),
  validate(createSchema),
  maintenanceController.create
);

// Update maintenance
router.put(
  '/:id',
  requireRoles(['Super_Admin', 'Admin', 'Operations_Manager', 'Maintenance_Manager']),
  validate(updateSchema),
  maintenanceController.update
);

// Start maintenance work
router.post(
  '/:id/start',
  requireRoles(['Super_Admin', 'Admin', 'Operations_Manager', 'Maintenance_Manager', 'Field_Engineer']),
  maintenanceController.startWork
);

// Complete maintenance
router.post(
  '/:id/complete',
  requireRoles(['Super_Admin', 'Admin', 'Operations_Manager', 'Maintenance_Manager', 'Field_Engineer']),
  validate(completeSchema),
  maintenanceController.complete
);

// Cancel maintenance
router.post(
  '/:id/cancel',
  requireRoles(['Super_Admin', 'Admin', 'Operations_Manager', 'Maintenance_Manager']),
  maintenanceController.cancel
);

// Assign technician (managers and admins can assign)
router.post(
  '/:id/assign',
  requireRoles(['Super_Admin', 'Admin', 'Operations_Manager', 'Maintenance_Manager', 'Purchasing_Manager']),
  maintenanceController.assignTechnician
);

// Add parts used
router.post(
  '/:id/parts',
  requireRoles(['Super_Admin', 'Admin', 'Operations_Manager', 'Maintenance_Manager', 'Field_Engineer']),
  maintenanceController.addParts
);

// Create additional request from work order (for assigned engineers)
router.post(
  '/:id/additional-request',
  requireRoles(['Field_Engineer', 'Staff']),
  maintenanceController.createAdditionalRequest
);

module.exports = router;
