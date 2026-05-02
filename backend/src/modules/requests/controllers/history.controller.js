/**
 * Requests Controller - History Operations
 * History and audit trail endpoints
 */
const requestsService = require('../requests.service');

const ELEVATED_ROLES = [
  'Super_Admin', 'Admin', 'IT_Manager', 'IT_Support',
  'Operations_Manager', 'Purchasing_Manager', 'Purchasing_Staff',
  'Accounts_Manager', 'Accounts_Staff',
  'Safety_Manager', 'Safety_Officer',
  'Maintenance_Manager', 'Maintenance_Technician',
  'Logistics_Manager', 'Logistics_Coordinator',
  'Workshop_Manager', 'HR_Manager',
];

const getHistory = async (req, res, next) => {
  try {
    const isElevated = ELEVATED_ROLES.includes(req.user.role);
    if (!isElevated) {
      const request = await requestsService.getById(req.params.id);
      if (!request || request.requester_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }
    const history = await requestsService.getHistory(req.params.id);
    res.json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

const getAuditTrail = async (req, res, next) => {
  try {
    const isElevated = ELEVATED_ROLES.includes(req.user.role);
    if (!isElevated) {
      const request = await requestsService.getById(req.params.id);
      if (!request || request.requester_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }
    const auditTrail = await requestsService.getAuditTrail(req.params.id);
    res.json({ success: true, data: auditTrail });
  } catch (error) {
    next(error);
  }
};

// Get overdue summary
const getOverdueSummary = async (req, res, next) => {
  try {
    const overdueService = require('../overdueReminders.service');
    const summary = await overdueService.getOverdueSummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

// Manually trigger overdue reminders (admin only)
const triggerOverdueReminders = async (req, res, next) => {
  try {
    const overdueService = require('../overdueReminders.service');
    const result = await overdueService.processOverdueReminders();
    res.json({ 
      success: true, 
      data: result,
      message: `Processed ${result.totalOverdue} overdue requests`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getHistory, getAuditTrail, getOverdueSummary, triggerOverdueReminders };
