/**
 * Activity Logging Service
 * Comprehensive audit trail for EMRS
 * 
 * Role-based visibility:
 * - Super_Admin: See everything
 * - Admin: See everything except Super_Admin logs
 * - Purchasing Manager: See request-related from all depts + Purchasing dept internal
 * - Dept Manager: See only their department's activity
 * - Regular users: See only their own activity
 */

const { query } = require('../config/db');
const logger = require('./logger');

// NOTE: ACTIONS values intentionally exceed the activity_action enum.
// The activity_logs.action column is VARCHAR(50) (not enum-typed)
// specifically to allow this. The enum exists for reference only.
// See SCHEMA-AUDIT-COMBINED.md for context.
const ACTIONS = {
  // Auth actions
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED: 'PASSWORD_RESET_COMPLETED',
  
  // User management
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DEACTIVATED: 'USER_DEACTIVATED',
  USER_REACTIVATED: 'USER_REACTIVATED',
  USER_DELETED: 'USER_DELETED',
  ROLE_CHANGED: 'ROLE_CHANGED',
  
  // Request actions
  REQUEST_CREATED: 'REQUEST_CREATED',
  REQUEST_UPDATED: 'REQUEST_UPDATED',
  REQUEST_APPROVED: 'REQUEST_APPROVED',
  REQUEST_REJECTED: 'REQUEST_REJECTED',
  REQUEST_TRANSFERRED: 'REQUEST_TRANSFERRED',
  REQUEST_CANCELLED: 'REQUEST_CANCELLED',
  REQUEST_COMPLETED: 'REQUEST_COMPLETED',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  DISBURSE: 'DISBURSE',
  PUT_ON_HOLD: 'PUT_ON_HOLD',
  RELEASE_FROM_HOLD: 'RELEASE_FROM_HOLD',
  INITIATE_RETURN: 'INITIATE_RETURN',
  CONFIRM_RETURN: 'CONFIRM_RETURN',
  COMPLETE: 'COMPLETE',
  RETURN_INITIATED: 'RETURN_INITIATED',
  RETURN_CONFIRMED: 'RETURN_CONFIRMED',
  
  // Equipment actions
  EQUIPMENT_CREATED: 'EQUIPMENT_CREATED',
  EQUIPMENT_UPDATED: 'EQUIPMENT_UPDATED',
  EQUIPMENT_HOURS_LOGGED: 'EQUIPMENT_HOURS_LOGGED',
  EQUIPMENT_STATUS_CHANGED: 'EQUIPMENT_STATUS_CHANGED',
  EQUIPMENT_ASSIGNED: 'EQUIPMENT_ASSIGNED',
  EQUIPMENT_UNASSIGNED: 'EQUIPMENT_UNASSIGNED',
  
  // Maintenance actions
  MAINTENANCE_LOGGED: 'MAINTENANCE_LOGGED',
  MAINTENANCE_COMPLETED: 'MAINTENANCE_COMPLETED',
  MAINTENANCE_CANCELLED: 'MAINTENANCE_CANCELLED',
  MAINTENANCE_ASSIGNED: 'MAINTENANCE_ASSIGNED',
  
  // ============================================
  // JOB LIFECYCLE ACTIONS
  // ============================================
  JOB_CREATED: 'JOB_CREATED',
  JOB_UPDATED: 'JOB_UPDATED',
  JOB_STATUS_CHANGED: 'JOB_STATUS_CHANGED',
  JOB_SUBMITTED: 'JOB_SUBMITTED',
  JOB_APPROVED: 'JOB_APPROVED',
  JOB_REJECTED: 'JOB_REJECTED',
  JOB_STARTED: 'JOB_STARTED',
  JOB_COMPLETED: 'JOB_COMPLETED',
  JOB_CANCELLED: 'JOB_CANCELLED',
  JOB_SIGNOFF: 'JOB_SIGNOFF',
  JOB_REASSIGNED: 'JOB_REASSIGNED',
  JOB_PRIORITY_CHANGED: 'JOB_PRIORITY_CHANGED',
  JOB_DEADLINE_EXTENDED: 'JOB_DEADLINE_EXTENDED',
  
  // ============================================
  // JOB TEAM ACTIONS
  // ============================================
  JOB_TEAM_ADDED: 'JOB_TEAM_ADDED',
  JOB_TEAM_REMOVED: 'JOB_TEAM_REMOVED',
  TEAM_MEMBER_ADDED: 'TEAM_MEMBER_ADDED',
  TEAM_MEMBER_REMOVED: 'TEAM_MEMBER_REMOVED',
  TEAM_ROLE_CHANGED: 'TEAM_ROLE_CHANGED',
  JOB_SUPERVISOR_ASSIGNED: 'JOB_SUPERVISOR_ASSIGNED',
  JOB_SUPERVISOR_REMOVED: 'JOB_SUPERVISOR_REMOVED',
  SUPERVISOR_CHANGED: 'SUPERVISOR_CHANGED',
  
  // ============================================
  // JOB EQUIPMENT/MATERIALS ACTIONS
  // ============================================
  JOB_EQUIPMENT_ASSIGNED: 'JOB_EQUIPMENT_ASSIGNED',
  JOB_EQUIPMENT_REMOVED: 'JOB_EQUIPMENT_REMOVED',
  EQUIPMENT_ADDED_TO_JOB: 'EQUIPMENT_ADDED_TO_JOB',
  EQUIPMENT_REMOVED_FROM_JOB: 'EQUIPMENT_REMOVED_FROM_JOB',
  MATERIAL_ADDED_TO_JOB: 'MATERIAL_ADDED_TO_JOB',
  MATERIAL_REMOVED_FROM_JOB: 'MATERIAL_REMOVED_FROM_JOB',
  CLIENT_EQUIPMENT_ADDED: 'CLIENT_EQUIPMENT_ADDED',
  EQUIPMENT_REQUEST_ADDED: 'EQUIPMENT_REQUEST_ADDED',
  EQUIPMENT_QUANTITY_CHANGED: 'EQUIPMENT_QUANTITY_CHANGED',
  EQUIPMENT_PRIORITY_CHANGED: 'EQUIPMENT_PRIORITY_CHANGED',
  NEW_EQUIPMENT_REQUESTED: 'NEW_EQUIPMENT_REQUESTED',
  
  // ============================================
  // REQUEST APPROVAL FLOW (Chief Operator/DAQ)
  // ============================================
  EQUIPMENT_REQUEST_CREATED: 'EQUIPMENT_REQUEST_CREATED',
  EQUIPMENT_REQUEST_SUPERVISOR_APPROVED: 'EQUIPMENT_REQUEST_SUPERVISOR_APPROVED',
  EQUIPMENT_REQUEST_SUPERVISOR_REJECTED: 'EQUIPMENT_REQUEST_SUPERVISOR_REJECTED',
  EQUIPMENT_REQUEST_MANAGER_APPROVED: 'EQUIPMENT_REQUEST_MANAGER_APPROVED',
  EQUIPMENT_REQUEST_MANAGER_REJECTED: 'EQUIPMENT_REQUEST_MANAGER_REJECTED',
  
  // ============================================
  // PURCHASING QUEUE ACTIONS
  // ============================================
  ITEM_DISBURSED: 'ITEM_DISBURSED',
  ITEM_SOURCING_STARTED: 'ITEM_SOURCING_STARTED',
  ITEM_SOURCING_UPDATED: 'ITEM_SOURCING_UPDATED',
  ITEM_SOURCING_CANCELLED: 'ITEM_SOURCING_CANCELLED',
  ITEM_ARRIVED: 'ITEM_ARRIVED',
  ITEM_LINKED_TO_INVENTORY: 'ITEM_LINKED_TO_INVENTORY',
  
  // ============================================
  // PRE-INSPECTION ACTIONS
  // ============================================
  PRE_INSPECTION_STARTED: 'PRE_INSPECTION_STARTED',
  PRE_INSPECTION_SAVED_DRAFT: 'PRE_INSPECTION_SAVED_DRAFT',
  PRE_INSPECTION_COMPLETED: 'PRE_INSPECTION_COMPLETED',
  PRE_INSPECTION_ISSUE_FOUND: 'PRE_INSPECTION_ISSUE_FOUND',
  PRE_INSPECTION_ISSUE_RESOLVED: 'PRE_INSPECTION_ISSUE_RESOLVED',
  PRE_INSPECTION_APPROVED: 'PRE_INSPECTION_APPROVED',
  PRE_INSPECTION_REJECTED: 'PRE_INSPECTION_REJECTED',
  PREJOB_INSPECTION_CREATED: 'PREJOB_INSPECTION_CREATED',
  PREJOB_INSPECTION_APPROVED: 'PREJOB_INSPECTION_APPROVED',
  POSTJOB_INSPECTION_CREATED: 'POSTJOB_INSPECTION_CREATED',
  POSTJOB_INSPECTION_APPROVED: 'POSTJOB_INSPECTION_APPROVED',
  
  // ============================================
  // FIELD OPERATIONS ACTIONS
  // ============================================
  FIELD_NOTE_ADDED: 'FIELD_NOTE_ADDED',
  EQUIPMENT_ISSUE_REPORTED: 'EQUIPMENT_ISSUE_REPORTED',
  EQUIPMENT_HOURS_UPDATED: 'EQUIPMENT_HOURS_UPDATED',
  ADDITIONAL_EQUIPMENT_REQUESTED: 'ADDITIONAL_EQUIPMENT_REQUESTED',
  FIELD_REPORT_SUBMITTED: 'FIELD_REPORT_SUBMITTED',
  FIELD_REPORT_REVIEWED: 'FIELD_REPORT_REVIEWED',
  
  // ============================================
  // POST-JOB & RETURN ACTIONS
  // ============================================
  POST_JOB_STARTED: 'POST_JOB_STARTED',
  POST_JOB_COMPLETED: 'POST_JOB_COMPLETED',
  ITEM_RETURN_INITIATED: 'ITEM_RETURN_INITIATED',
  ITEM_RETURN_ACCEPTED: 'ITEM_RETURN_ACCEPTED',
  ITEM_RETURN_REJECTED: 'ITEM_RETURN_REJECTED',
  ITEM_MARKED_DAMAGED: 'ITEM_MARKED_DAMAGED',
  ITEM_MARKED_LOST: 'ITEM_MARKED_LOST',
  
  // Safety actions
  SAFETY_REPORT_CREATED: 'SAFETY_REPORT_CREATED',
  SAFETY_REPORT_UPDATED: 'SAFETY_REPORT_UPDATED',
  SAFETY_REPORT_ASSIGNED: 'SAFETY_REPORT_ASSIGNED',
  SAFETY_REPORT_RESOLVED: 'SAFETY_REPORT_RESOLVED',
  SAFETY_INCIDENT_REPORTED: 'SAFETY_INCIDENT_REPORTED',
  
  // Inventory actions
  INVENTORY_ADDED: 'INVENTORY_ADDED',
  INVENTORY_UPDATED: 'INVENTORY_UPDATED',
  INVENTORY_ADJUSTED: 'INVENTORY_ADJUSTED',
  DISBURSEMENT_CREATED: 'DISBURSEMENT_CREATED',
  DISBURSEMENT_COMPLETED: 'DISBURSEMENT_COMPLETED',
  PURCHASE_REQUEST_CREATED: 'PURCHASE_REQUEST_CREATED',
  PURCHASE_REQUEST_APPROVED: 'PURCHASE_REQUEST_APPROVED',
  PURCHASE_REQUEST_REJECTED: 'PURCHASE_REQUEST_REJECTED',
  
  // Vendor actions
  VENDOR_CREATED: 'VENDOR_CREATED',
  VENDOR_UPDATED: 'VENDOR_UPDATED',
  VENDOR_DEACTIVATED: 'VENDOR_DEACTIVATED',
  VENDOR_REACTIVATED: 'VENDOR_REACTIVATED',
  VENDOR_RATING_UPDATED: 'VENDOR_RATING_UPDATED',
  
  // System actions
  SYSTEM_SETTING_CHANGED: 'SYSTEM_SETTING_CHANGED',
  DATA_EXPORTED: 'DATA_EXPORTED'
};

// Actions that Purchasing can see from ANY department
const REQUEST_RELATED_ACTIONS = [
  'REQUEST_CREATED', 'REQUEST_UPDATED', 'REQUEST_APPROVED', 'REQUEST_REJECTED',
  'REQUEST_TRANSFERRED', 'REQUEST_CANCELLED', 'REQUEST_COMPLETED',
  'APPROVE', 'REJECT', 'DISBURSE', 'PUT_ON_HOLD', 'RELEASE_FROM_HOLD',
  'INITIATE_RETURN', 'CONFIRM_RETURN', 'COMPLETE', 'RETURN_INITIATED', 'RETURN_CONFIRMED',
  'INVENTORY_ADDED', 'INVENTORY_UPDATED', 'INVENTORY_ADJUSTED',
  'DISBURSEMENT_CREATED', 'DISBURSEMENT_COMPLETED'
];

const ENTITY_TYPES = {
  USER: 'USER',
  REQUEST: 'REQUEST',
  EQUIPMENT: 'EQUIPMENT',
  JOB: 'JOB',
  JOB_TEAM: 'JOB_TEAM',
  JOB_EQUIPMENT: 'JOB_EQUIPMENT',
  JOB_MATERIAL: 'JOB_MATERIAL',
  PRE_INSPECTION: 'PRE_INSPECTION',
  SAFETY_REPORT: 'SAFETY_REPORT',
  INVENTORY: 'INVENTORY',
  DISBURSEMENT: 'DISBURSEMENT',
  PURCHASE_REQUEST: 'PURCHASE_REQUEST',
  MAINTENANCE_LOG: 'MAINTENANCE_LOG',
  INSPECTION: 'INSPECTION',
  FIELD_REPORT: 'FIELD_REPORT',
  VENDOR: 'VENDOR',
  PURCHASE_ORDER: 'PURCHASE_ORDER',
  SYSTEM: 'SYSTEM'
};

const getIpAddress = (req) => {
  if (!req) return null;
  return req.headers?.['x-forwarded-for']?.split(',')[0] || 
         req.connection?.remoteAddress || 
         req.ip || 
         null;
};

const logActivity = async ({
  userId,
  userEmail = null,
  userRole = null,
  action,
  entityType,
  entityId = null,
  entityName = null,
  details = {},
  department = null,
  ipAddress = null,
  req = null
}) => {
  if (!action) {
    logger.error('logActivity called without action', { entityType, entityId });
    return false;
  }
  try {
    const ip = ipAddress || getIpAddress(req);
    const userAgent = req?.headers?.['user-agent'] || null;
    
    await query(
      `INSERT INTO activity_logs 
       (user_id, user_email, user_role, action, entity_type, entity_id, entity_name, details, ip_address, user_agent, department)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [userId, userEmail, userRole, action, entityType, entityId, entityName, JSON.stringify(details), ip, userAgent, department]
    );
    return true;
  } catch (error) {
    logger.error('Failed to log activity:', { error: error.message, action, entityType });
    return false;
  }
};

const logFromRequest = async (req, {
  action,
  entityType,
  entityId = null,
  entityName = null,
  details = {}
}) => {
  const user = req.user || {};
  return logActivity({
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    department: user.department,
    action,
    entityType,
    entityId,
    entityName,
    details,
    req
  });
};

const applyRoleScope = (sql, params, idx, { viewerRole, viewerDepartment, viewerId }) => {
  const isPurchasing = viewerRole?.includes('Purchasing');
  const isManager = viewerRole?.includes('Manager') || viewerRole === 'Safety_Officer';

  if (viewerRole === 'Super_Admin') {
    // See everything
  } else if (viewerRole === 'Admin') {
    sql += ` AND (al.user_role IS NULL OR al.user_role != 'Super_Admin')`;
  } else if (isPurchasing) {
    const requestActionsStr = REQUEST_RELATED_ACTIONS.map(a => `'${a}'`).join(',');
    sql += ` AND (
      al.action IN (${requestActionsStr})
      OR al.entity_type = 'request'
      OR al.entity_type = 'INVENTORY'
      OR u.department::text = 'Purchasing'
      OR al.department::text = 'Purchasing'
    )`;
  } else if (isManager) {
    sql += ` AND (u.department::text = $${idx} OR al.department::text = $${idx})`;
    params.push(viewerDepartment);
    idx++;
  } else {
    sql += ` AND al.user_id = $${idx}`;
    params.push(viewerId);
    idx++;
  }
  return { sql, idx };
};

const applyActivityFilters = (sql, params, idx, { action, entityType, startDate, endDate, search }) => {
  if (action) {
    sql += ` AND al.action = $${idx}`;
    params.push(action);
    idx++;
  }
  if (entityType) {
    sql += ` AND al.entity_type = $${idx}`;
    params.push(entityType);
    idx++;
  }
  if (startDate) {
    sql += ` AND al.created_at >= $${idx}`;
    params.push(startDate);
    idx++;
  }
  if (endDate) {
    sql += ` AND al.created_at <= $${idx}`;
    params.push(endDate);
    idx++;
  }
  if (search) {
    sql += ` AND (al.user_email ILIKE $${idx} OR al.entity_name ILIKE $${idx} OR al.details::text ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  return { sql, idx };
};

const getLogs = async ({
  userId = null,
  viewerRole,
  viewerDepartment,
  viewerId,
  action = null,
  entityType = null,
  startDate = null,
  endDate = null,
  search = null,
  limit = 50,
  offset = 0
}) => {
  let sql = `
    SELECT
      al.id, al.user_id, al.user_email, al.user_role, al.action, al.entity_type,
      al.entity_id, al.entity_name, al.details, al.ip_address, al.department, al.created_at,
      u.first_name || ' ' || u.last_name as user_name,
      u.department as user_department
    FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1
  `;
  const params = [];
  let idx = 1;

  ({ sql, idx } = applyRoleScope(sql, params, idx, { viewerRole, viewerDepartment, viewerId }));

  if (userId) {
    sql += ` AND al.user_id = $${idx}`;
    params.push(userId);
    idx++;
  }

  ({ sql, idx } = applyActivityFilters(sql, params, idx, { action, entityType, startDate, endDate, search }));

  sql += ` ORDER BY al.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
  params.push(limit, offset);

  const result = await query(sql, params);
  return result.rows;
};

const getLogCount = async ({
  viewerRole,
  viewerDepartment,
  viewerId,
  action = null,
  entityType = null,
  startDate = null,
  endDate = null,
  search = null
}) => {
  let sql = `
    SELECT COUNT(*) FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id
    WHERE 1=1
  `;
  const params = [];
  let idx = 1;

  ({ sql, idx } = applyRoleScope(sql, params, idx, { viewerRole, viewerDepartment, viewerId }));
  ({ sql, idx } = applyActivityFilters(sql, params, idx, { action, entityType, startDate, endDate, search }));

  const result = await query(sql, params);
  return parseInt(result.rows[0].count);
};

module.exports = { 
  logActivity, 
  logFromRequest, 
  getLogs, 
  getLogCount,
  ACTIONS, 
  ENTITY_TYPES,
  REQUEST_RELATED_ACTIONS
};
