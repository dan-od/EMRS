/**
 * Equipment Routes
 * Post-Phase 5: Tools vs Equipment - Modular Controllers
 * 
 * NOTE: Equipment REQUESTS are handled by the main Request Hub (/api/requests)
 * This module only handles equipment inventory CRUD, not request workflows.
 * 
 * ACTUAL DB ROLES (13):
 * Super_Admin, Admin, Field_Engineer, IT_Support,
 * Operations_Manager, Purchasing_Manager, Accounts_Manager,
 * Safety_Manager, Maintenance_Manager,
 * Purchasing_Staff, Accounts_Staff, Safety_Officer, Staff
 */
const express = require('express');
const router = express.Router();

// Split controllers
const mainController = require('./equipment.controller');
const hideController = require('./equipmentHide.controller');
const shareController = require('./equipmentShare.controller');
const typesController = require('./equipmentTypes.controller');
const statsController = require('./equipmentStats.controller');
const maintenanceController = require('./equipmentMaintenance.controller');
const logsController = require('./equipmentLogs.controller');

// Middleware
const { authenticate } = require('../../middleware/auth');
const { requireRoles } = require('../../middleware/roleCheck');
const { validate } = require('../../middleware/validate');
const validation = require('./equipment.validation');
const logsValidation = require('./equipmentLogs.validation');

// Role groups - MUST match actual DB enum values
const MANAGERS_PLUS = [
  'Super_Admin', 'Admin', 'IT_Manager', 'IT_Support',
  'Operations_Manager', 'Purchasing_Manager', 'Accounts_Manager',
  'Safety_Manager', 'Maintenance_Manager',
  'HR_Manager', 'Logistics_Manager', 'Workshop_Manager',
  'Purchasing_Staff'
];

const MAINTENANCE_ROLES = [
  'Super_Admin', 'Admin', 'IT_Support',
  'Operations_Manager', 'Maintenance_Manager',
  'Field_Engineer', 'Safety_Officer'
];

router.use(authenticate);

// ==================== TYPES (before /:id) ====================
router.get('/types', typesController.getTypes);
router.post('/types', requireRoles(MANAGERS_PLUS), validate(validation.createCustomType), typesController.createType);

// ==================== STATS (before /:id) ====================
router.get('/stats', statsController.getStats);
router.get('/stats/by-department', statsController.getStatsByDepartment);

// ==================== MAIN CRUD ====================
router.get('/', mainController.getAll);
router.get('/maintenance-due', maintenanceController.getMaintenanceDue);
router.get('/:id', mainController.getById);
router.post('/', requireRoles(MANAGERS_PLUS), validate(validation.create), mainController.create);
router.put('/:id', requireRoles(MANAGERS_PLUS), validate(validation.update), mainController.update);

// ==================== HIDE/UNHIDE ====================
router.post('/:id/hide', requireRoles(MANAGERS_PLUS), validate(validation.hide), hideController.hide);
router.post('/:id/unhide', requireRoles(MANAGERS_PLUS), hideController.unhide);

// ==================== SHARING ====================
router.post('/:id/share', requireRoles(MANAGERS_PLUS), validate(validation.share), shareController.share);

// ==================== HOURS & MAINTENANCE ====================
router.get('/:id/hours-log', maintenanceController.getHoursLog);
router.get('/:id/maintenance-log', maintenanceController.getMaintenanceLog);
router.post('/:id/log-hours', validate(validation.logHours), maintenanceController.logHours);
router.post('/:id/maintenance', requireRoles(MAINTENANCE_ROLES), validate(validation.logMaintenance), maintenanceController.logMaintenance);

// ==================== EQUIPMENT LOGS ====================
router.get('/:equipmentId/logs/general', logsController.getGeneralLogs);
router.post('/:equipmentId/logs/general', requireRoles(MANAGERS_PLUS), validate(logsValidation.createGeneralLogSchema), logsController.createGeneralLog);
router.get('/:equipmentId/logs/maintenance', logsController.getMaintenanceLogs);
router.post('/:equipmentId/logs/maintenance', requireRoles(MAINTENANCE_ROLES), validate(logsValidation.createMaintenanceLogSchema), logsController.createMaintenanceLog);

module.exports = router;
