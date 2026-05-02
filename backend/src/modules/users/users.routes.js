const express = require('express');
const router = express.Router();
const controller = require('./users.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRoles } = require('../../middleware/roleCheck');
const { validate } = require('../../middleware/validate');
const validation = require('./users.validation');

// All routes require authentication
router.use(authenticate);

// GET users - allow managers to see users for team assignment
// Expanded roles to support Jobs module team management
router.get('/', requireRoles([
  'Super_Admin', 'Admin', 'IT_Manager', 'IT_Support',
  'Operations_Manager', 'Maintenance_Manager', 'Purchasing_Manager', 'Safety_Manager', 'Accounts_Manager',
  'HR_Manager', 'Logistics_Manager', 'Workshop_Manager'
]), controller.getAll);

router.get('/:id', requireRoles([
  'Super_Admin', 'Admin', 'IT_Manager', 'IT_Support',
  'Operations_Manager', 'Maintenance_Manager', 'Purchasing_Manager', 'Safety_Manager', 'Accounts_Manager',
  'HR_Manager', 'Logistics_Manager', 'Workshop_Manager'
]), controller.getById);

// Write operations - Admin and IT
router.post('/', requireRoles(['Super_Admin', 'Admin', 'IT_Manager', 'IT_Support']), validate(validation.create), controller.create);
router.put('/:id', requireRoles(['Super_Admin', 'Admin', 'IT_Manager', 'IT_Support']), validate(validation.update), controller.update);
router.post('/:id/reset-password', requireRoles(['Super_Admin', 'Admin', 'IT_Manager', 'IT_Support']), validate(validation.resetPassword), controller.resetPassword);
router.patch('/:id/toggle-active', requireRoles(['Super_Admin', 'Admin', 'IT_Manager', 'IT_Support']), controller.toggleActive);
router.delete('/:id', requireRoles(['Super_Admin', 'Admin']), controller.remove); // Delete still admin-only

module.exports = router;
