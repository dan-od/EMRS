const express = require('express');
const router = express.Router();
const controller = require('./safety.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRoles } = require('../../middleware/roleCheck');
const { validate } = require('../../middleware/validate');
const validation = require('./safety.validation');

router.use(authenticate);

// All users can create reports and see their own
router.get('/my', controller.getMyReports);
router.post('/', validate(validation.create), controller.create);

// Safety department and managers can view all and manage
const safetyRoles = ['Super_Admin', 'Admin', 'IT_Support', 'Safety_Manager', 'Safety_Officer', 'Operations_Manager'];

router.get('/', requireRoles(safetyRoles), controller.getAll);
router.get('/stats', requireRoles(safetyRoles), controller.getStats);
router.get('/:id', controller.getById);
router.get('/:id/history', controller.getHistory);
router.patch('/:id/status', requireRoles(safetyRoles), 
  validate(validation.updateStatus), controller.updateStatus);

module.exports = router;
