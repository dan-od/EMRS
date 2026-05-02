/**
 * Equipment Maintenance Controller
 * Hours logging and maintenance tracking
 */
const equipmentService = require('./equipment.service');
const { logActivity } = require('../../utils/activityLogger');

/** POST /api/equipment/:id/log-hours */
const logHours = async (req, res, next) => {
  try {
    const equipment = await equipmentService.getById(req.params.id);
    const result = await equipmentService.logHours(req.params.id, {
      ...req.validatedBody,
      loggedBy: req.user.id
    });

    await logActivity({
      userId: req.user.id, userEmail: req.user.email, userRole: req.user.role,
      action: 'EQUIPMENT_HOURS_LOGGED', entityType: 'EQUIPMENT',
      entityId: req.params.id, entityName: equipment?.name,
      department: req.user.department,
      details: { hoursAdded: req.validatedBody.hours, newTotalHours: result.equipment?.current_hours },
      req
    });
    
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

/** GET /api/equipment/maintenance-due */
const getMaintenanceDue = async (req, res, next) => {
  try {
    const equipment = await equipmentService.getMaintenanceDue();
    res.json({ success: true, data: equipment });
  } catch (error) { next(error); }
};

/** GET /api/equipment/:id/hours-log */
const getHoursLog = async (req, res, next) => {
  try {
    const logs = await equipmentService.getHoursLog(req.params.id);
    res.json({ success: true, data: logs });
  } catch (error) { next(error); }
};

/** POST /api/equipment/:id/maintenance */
const logMaintenance = async (req, res, next) => {
  try {
    const equipment = await equipmentService.getById(req.params.id);
    const log = await equipmentService.logMaintenance(req.params.id, {
      ...req.validatedBody,
      performedBy: req.user.id
    });

    await logActivity({
      userId: req.user.id, userEmail: req.user.email, userRole: req.user.role,
      action: 'MAINTENANCE_LOGGED', entityType: 'EQUIPMENT',
      entityId: req.params.id, entityName: equipment?.name,
      department: req.user.department,
      details: { maintenanceType: req.validatedBody.maintenanceType, hoursAtMaintenance: req.validatedBody.hoursAtMaintenance },
      req
    });
    
    res.status(201).json({ success: true, data: log });
  } catch (error) { next(error); }
};

/** GET /api/equipment/:id/maintenance-log */
const getMaintenanceLog = async (req, res, next) => {
  try {
    const logs = await equipmentService.getMaintenanceLog(req.params.id);
    res.json({ success: true, data: logs });
  } catch (error) { next(error); }
};

module.exports = { logHours, getMaintenanceDue, getHoursLog, logMaintenance, getMaintenanceLog };
