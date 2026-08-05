const express = require('express');
const router = express.Router();
const controller = require('./safety.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRoles } = require('../../middleware/roleCheck');
const { validate } = require('../../middleware/validate');
const validation = require('./safety.validation');
const { canAccessReport } = require('./safety.authorize');
const { SAFETY_ROLES } = require('./safety.constants');

router.use(authenticate);

// All users can create reports and see their own
router.get('/my', controller.getMyReports);
router.post('/', validate(validation.create), controller.create);

// Safety department and managers can view all and manage.
const safetyRoles = SAFETY_ROLES;

router.get('/', requireRoles(safetyRoles), controller.getAll);
router.get('/stats', requireRoles(safetyRoles), controller.getStats);

// Per-report reads are gated by ownership OR safety role, not by role alone —
// a reporter has to be able to open the report they filed.
router.get('/:id', canAccessReport, controller.getById);
router.get('/:id/history', canAccessReport, controller.getHistory);

router.patch('/:id/status', requireRoles(safetyRoles),
  validate(validation.updateStatus), controller.updateStatus);

module.exports = router;
