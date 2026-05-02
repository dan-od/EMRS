/**
 * Equipment Logs Controller
 * Handles General Log and Maintenance Log API endpoints
 */

const logsService = require('./equipmentLogs.service');
const { logActivity, ACTIONS, ENTITY_TYPES } = require('../../utils/activityLogger');
const logger = require('../../utils/logger');

// =====================================================
// GENERAL LOG
// =====================================================

const getGeneralLogs = async (req, res, next) => {
  try {
    const { equipmentId } = req.params;
    const result = await logsService.getGeneralLogs(equipmentId, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const createGeneralLog = async (req, res, next) => {
  try {
    const { equipmentId } = req.params;
    
    const log = await logsService.createGeneralLog({
      ...req.validatedBody,
      equipment_id: equipmentId
    }, req.user);

    // Activity log
    try {
      await logActivity({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: ACTIONS.EQUIPMENT_HOURS_LOGGED,
        entityType: ENTITY_TYPES.EQUIPMENT,
        entityId: equipmentId,
        entityName: `General Log - ${req.validatedBody.entry_type}`,
        department: req.user.department,
        details: {
          logType: 'general',
          entryType: req.validatedBody.entry_type,
          description: req.validatedBody.description
        },
        req
      });
    } catch (e) {
      logger.error('Activity log error', { message: e.message });
    }
    
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
};

// =====================================================
// MAINTENANCE LOG
// =====================================================

const getMaintenanceLogs = async (req, res, next) => {
  try {
    const { equipmentId } = req.params;
    const result = await logsService.getMaintenanceLogs(equipmentId, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const createMaintenanceLog = async (req, res, next) => {
  try {
    const { equipmentId } = req.params;
    
    const log = await logsService.createMaintenanceLog({
      ...req.validatedBody,
      equipment_id: equipmentId
    }, req.user);

    // Activity log
    try {
      await logActivity({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: ACTIONS.MAINTENANCE_LOGGED,
        entityType: ENTITY_TYPES.EQUIPMENT,
        entityId: equipmentId,
        entityName: `Maintenance Log - ${req.validatedBody.entry_type}`,
        department: req.user.department,
        details: {
          logType: 'maintenance',
          entryType: req.validatedBody.entry_type,
          description: req.validatedBody.description,
          cost: req.validatedBody.cost
        },
        req
      });
    } catch (e) {
      logger.error('Activity log error', { message: e.message });
    }
    
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGeneralLogs,
  createGeneralLog,
  getMaintenanceLogs,
  createMaintenanceLog
};
