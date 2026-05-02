/**
 * Activity Logs Controller
 * Handles API endpoints for viewing audit logs
 */

const { getLogs, getLogCount, ACTIONS, ENTITY_TYPES } = require('../../utils/activityLogger');

/**
 * GET /api/activity
 * Get activity logs with role-based visibility
 */
const getActivityLogs = async (req, res, next) => {
  try {
    const { 
      user_id, 
      action, 
      entity_type, 
      start_date, 
      end_date,
      search,
      page = 1, 
      limit = 50 
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const logs = await getLogs({
      userId: user_id,
      viewerRole: req.user.role,
      viewerDepartment: req.user.department,
      viewerId: req.user.id,
      action,
      entityType: entity_type,
      startDate: start_date,
      endDate: end_date,
      search,
      limit: parseInt(limit),
      offset
    });
    
    const total = await getLogCount({
      viewerRole: req.user.role,
      viewerDepartment: req.user.department,
      viewerId: req.user.id,
      action,
      entityType: entity_type,
      startDate: start_date,
      endDate: end_date,
      search
    });
    
    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/activity/user/:userId
 * Get activity for specific user (with access check)
 */
const getUserActivity = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Access check: users can see own logs, managers see dept, admins see all
    const isOwnLogs = userId === req.user.id;
    const isAdmin = ['Super_Admin', 'Admin'].includes(req.user.role);
    const isManager = req.user.role?.includes('Manager');
    
    if (!isOwnLogs && !isAdmin && !isManager) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this user\'s activity' 
      });
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const logs = await getLogs({
      userId,
      viewerRole: req.user.role,
      viewerDepartment: req.user.department,
      viewerId: req.user.id,
      limit: parseInt(limit),
      offset
    });
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/activity/actions
 * Get list of action types for filtering
 */
const getActionTypes = (req, res) => {
  res.json({
    success: true,
    data: Object.keys(ACTIONS)
  });
};

/**
 * GET /api/activity/entities
 * Get list of entity types for filtering
 */
const getEntityTypes = (req, res) => {
  res.json({
    success: true,
    data: Object.keys(ENTITY_TYPES)
  });
};

module.exports = {
  getActivityLogs,
  getUserActivity,
  getActionTypes,
  getEntityTypes
};
