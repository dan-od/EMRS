// Vehicles routes
const express = require('express');
const router = express.Router();
const controller = require('./vehicles.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRoles } = require('../../middleware/roleCheck');

// All routes require authentication
router.use(authenticate);

// Get available vehicles (for transport assignment)
router.get('/available', controller.getAvailable);

// Get all drivers
router.get('/drivers', controller.getDrivers);

// Get all vehicles
router.get('/', controller.getAll);

// Get vehicle by ID
router.get('/:id', controller.getById);

// Create vehicle (Purchasing Manager, Admin only)
router.post('/', 
  requireRoles(['Super_Admin', 'Admin', 'Purchasing_Manager']), 
  controller.create
);

// Update vehicle (Purchasing Manager, Admin only)
router.patch('/:id', 
  requireRoles(['Super_Admin', 'Admin', 'Purchasing_Manager']), 
  controller.update
);

// Update vehicle status (Purchasing Staff can update status)
router.patch('/:id/status', 
  requireRoles(['Super_Admin', 'Admin', 'Purchasing_Manager', 'Purchasing_Staff']), 
  controller.updateStatus
);

// Delete vehicle (Purchasing Manager, Admin only)
router.delete('/:id', 
  requireRoles(['Super_Admin', 'Admin', 'Purchasing_Manager']), 
  controller.remove
);

module.exports = router;