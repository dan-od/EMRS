// Notifications service
const { pool } = require('../../config/db');
const queries = require('./notifications.queries');

/**
 * Get notifications for a user
 */
const getByUser = async (userId, { limit = 20, offset = 0 } = {}) => {
  const client = await pool.connect();
  try {
    const [notificationsResult, countResult] = await Promise.all([
      client.query(queries.findByUser, [userId, limit, offset]),
      client.query(queries.countByUser, [userId])
    ]);
    
    return {
      notifications: notificationsResult.rows,
      total: parseInt(countResult.rows[0].total)
    };
  } finally {
    client.release();
  }
};

/**
 * Get unread count for a user
 */
const getUnreadCount = async (userId) => {
  const result = await pool.query(queries.countUnread, [userId]);
  return parseInt(result.rows[0].count);
};

/**
 * Create a notification for a single user
 */
const create = async ({ userId, type, title, message, referenceType, referenceId, priority = 'normal' }) => {
  const result = await pool.query(queries.create, [
    userId,
    type,
    title,
    message,
    referenceType,
    referenceId,
    priority
  ]);
  return result.rows[0];
};

/**
 * Create notifications for multiple users (single batch INSERT)
 */
const createBulk = async (userIds, { type, title, message, referenceType, referenceId, priority = 'normal' }) => {
  if (!userIds || userIds.length === 0) return [];
  const result = await pool.query(queries.createBulk, [
    userIds, type, title, message, referenceType, referenceId, priority
  ]);
  return result.rows;
};

/**
 * Mark a notification as read
 */
const markAsRead = async (id, userId) => {
  const result = await pool.query(queries.markAsRead, [id, userId]);
  return result.rows[0];
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  const result = await pool.query(queries.markAllAsRead, [userId]);
  return result.rows;
};

/**
 * Notify Super Admins and Admins (for critical events)
 */
const notifyAdmins = async ({ type, title, message, referenceType, referenceId, priority = 'high' }) => {
  const adminResult = await pool.query(queries.getAdminUsers);
  const adminIds = adminResult.rows.map(row => row.id);
  
  if (adminIds.length > 0) {
    return createBulk(adminIds, { type, title, message, referenceType, referenceId, priority });
  }
  return [];
};

/**
 * Notify Purchasing Department
 */
const notifyPurchasing = async ({ type, title, message, referenceType, referenceId, priority = 'normal' }) => {
  const purchasingResult = await pool.query(queries.getPurchasingUsers);
  const userIds = purchasingResult.rows.map(row => row.id);
  
  if (userIds.length > 0) {
    return createBulk(userIds, { type, title, message, referenceType, referenceId, priority });
  }
  return [];
};

/**
 * Notify users by department
 */
const notifyDepartment = async (department, { type, title, message, referenceType, referenceId, priority = 'normal' }) => {
  const deptResult = await pool.query(queries.getUsersByDepartment, [department]);
  const userIds = deptResult.rows.map(row => row.id);
  
  if (userIds.length > 0) {
    return createBulk(userIds, { type, title, message, referenceType, referenceId, priority });
  }
  return [];
};

/**
 * Notify users by roles
 */
const notifyByRoles = async (roles, { type, title, message, referenceType, referenceId, priority = 'normal' }) => {
  const rolesResult = await pool.query(queries.getUsersByRole, [roles]);
  const userIds = rolesResult.rows.map(row => row.id);
  
  if (userIds.length > 0) {
    return createBulk(userIds, { type, title, message, referenceType, referenceId, priority });
  }
  return [];
};

/**
 * Clean up old read notifications
 */
const cleanupOld = async () => {
  await pool.query(queries.deleteOld);
};

// =====================================================
// NOTIFICATION HELPER FUNCTIONS (for specific events)
// =====================================================

/**
 * Notify when a request is approved by manager
 * - Super Admin & Admin: Immediate notification
 * - Requester: Notification
 */
const notifyRequestApproved = async ({ request, approverName }) => {
  const notifications = [];
  
  // Notify Super Admins and Admins
  const adminNotifs = await notifyAdmins({
    type: 'REQUEST_APPROVED',
    title: 'Request Approved',
    message: `Request #${request.id.slice(0, 8)} was approved by ${approverName}. Can intervene before disbursement.`,
    referenceType: 'request',
    referenceId: request.id,
    priority: 'high'
  });
  notifications.push(...adminNotifs);
  
  // Notify requester
  const requesterNotif = await create({
    userId: request.requester_id,
    type: 'REQUEST_APPROVED',
    title: 'Your Request Was Approved',
    message: `Your ${request.type} request has been approved by ${approverName}.`,
    referenceType: 'request',
    referenceId: request.id
  });
  notifications.push(requesterNotif);

  // Notify Purchasing staff — they need to disburse
  const purchasingNotifs = await notifyByRoles(
    ['Purchasing_Manager', 'Purchasing_Staff'],
    {
      type: 'REQUEST_APPROVED',
      title: 'New Request Ready for Disbursement',
      message: `${request.type} request #${request.id.slice(0, 8)} approved by ${approverName}. Ready to disburse.`,
      referenceType: 'request',
      referenceId: request.id,
      priority: 'high'
    }
  );
  notifications.push(...purchasingNotifs);

  return notifications;
};

/**
 * Notify when a request is rejected
 */
const notifyRequestRejected = async ({ request, rejecterName, reason }) => {
  return create({
    userId: request.requester_id,
    type: 'REQUEST_REJECTED',
    title: 'Request Rejected',
    message: `Your ${request.type} request was rejected by ${rejecterName}. Reason: ${reason || 'Not specified'}`,
    referenceType: 'request',
    referenceId: request.id
  });
};

/**
 * Notify when request is disbursed (with or without approval)
 */
const notifyRequestDisbursed = async ({ request, disburserName, withoutApproval = false }) => {
  const notifications = [];
  
  if (withoutApproval) {
    // Notify Super Admins, Admins, and Purchasing Manager
    const adminNotifs = await notifyAdmins({
      type: 'REQUEST_DISBURSED',
      title: '⚠️ Request Disbursed Without Approval',
      message: `Request #${request.id.slice(0, 8)} was disbursed by ${disburserName} WITHOUT manager approval.`,
      referenceType: 'request',
      referenceId: request.id,
      priority: 'high'
    });
    notifications.push(...adminNotifs);
  }
  
  // Notify requester
  const requesterNotif = await create({
    userId: request.requester_id,
    type: 'REQUEST_DISBURSED',
    title: 'Request Disbursed',
    message: `Your ${request.type} request has been fulfilled and is ready for pickup.`,
    referenceType: 'request',
    referenceId: request.id
  });
  notifications.push(requesterNotif);
  
  return notifications;
};

/**
 * Notify driver when assigned to transport
 */
const notifyTransportAssigned = async ({ assignment, driverId, requestDetails }) => {
  return create({
    userId: driverId,
    type: 'TRANSPORT_ASSIGNED',
    title: 'New Transport Assignment',
    message: `You have been assigned a transport job: ${requestDetails.pickup} to ${requestDetails.destination}`,
    referenceType: 'transport_assignment',
    referenceId: assignment.id
  });
};

/**
 * Notify about overdue return
 */
const notifyReturnOverdue = async ({ request, daysOverdue }) => {
  return create({
    userId: request.requester_id,
    type: 'RETURN_OVERDUE',
    title: 'Return Overdue',
    message: `Your equipment is ${daysOverdue} day(s) overdue for return. Please return items ASAP.`,
    referenceType: 'request',
    referenceId: request.id,
    priority: 'high'
  });
};

/**
 * Notify when vendor is added
 */
const notifyVendorAdded = async ({ vendor, addedByName }) => {
  // Get Purchasing Managers only
  const result = await pool.query(
    `SELECT id FROM users WHERE role = 'Purchasing_Manager' AND is_active = true`
  );
  const managerIds = result.rows.map(row => row.id);
  
  if (managerIds.length > 0) {
    return createBulk(managerIds, {
      type: 'VENDOR_ADDED',
      title: 'New Vendor Added',
      message: `${addedByName} added a new vendor: ${vendor.name}`,
      referenceType: 'vendor',
      referenceId: vendor.id
    });
  }
  return [];
};

module.exports = {
  getByUser,
  getUnreadCount,
  create,
  createBulk,
  markAsRead,
  markAllAsRead,
  notifyAdmins,
  notifyPurchasing,
  notifyDepartment,
  notifyByRoles,
  cleanupOld,
  // Helper functions
  notifyRequestApproved,
  notifyRequestRejected,
  notifyRequestDisbursed,
  notifyTransportAssigned,
  notifyReturnOverdue,
  notifyVendorAdded
};
