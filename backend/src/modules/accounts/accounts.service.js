/**
 * Accounts Service
 * Business logic for work order cost tracking and payment recording
 */

const { query } = require('../../config/db');
const accountsQueries = require('./accounts.queries');
const notificationsService = require('../notifications/notifications.service');
const { logActivity, ACTIONS, ENTITY_TYPES } = require('../../utils/activityLogger');

// High cost threshold for priority notifications (₦100,000)
const HIGH_COST_THRESHOLD = 100000;

/**
 * Get completed work orders with filters
 */
const getWorkOrders = async (filters = {}) => {
  const { 
    dateFrom, 
    dateTo, 
    department, 
    vendorId,
    minCost,
    maxCost,
    paymentStatus, // 'paid', 'unpaid', 'all'
    page = 1, 
    limit = 20,
    sortBy = 'completed_at',
    sortOrder = 'DESC'
  } = filters;

  let sql = accountsQueries.getCompletedWorkOrders;
  const params = [];
  let paramIndex = 1;

  // Date range filter
  if (dateFrom) {
    sql += ` AND m.completed_at >= $${paramIndex}`;
    params.push(dateFrom);
    paramIndex++;
  }
  if (dateTo) {
    sql += ` AND m.completed_at <= $${paramIndex}`;
    params.push(dateTo);
    paramIndex++;
  }

  // Department filter
  if (department) {
    sql += ` AND u.department = $${paramIndex}`;
    params.push(department);
    paramIndex++;
  }

  // Vendor filter (from request details JSONB)
  if (vendorId) {
    sql += ` AND (r.details->>'vendorRecommendation')::uuid = $${paramIndex}`;
    params.push(vendorId);
    paramIndex++;
  }

  // Cost range filter
  if (minCost) {
    sql += ` AND m.actual_cost >= $${paramIndex}`;
    params.push(minCost);
    paramIndex++;
  }
  if (maxCost) {
    sql += ` AND m.actual_cost <= $${paramIndex}`;
    params.push(maxCost);
    paramIndex++;
  }

  // Payment status filter
  if (paymentStatus === 'paid') {
    sql += ` AND m.accounts_final_payment IS NOT NULL`;
  } else if (paymentStatus === 'unpaid') {
    sql += ` AND m.accounts_final_payment IS NULL`;
  }

  // Validate sort column to prevent SQL injection
  const allowedSortColumns = ['completed_at', 'actual_cost', 'accounts_final_payment', 'created_at'];
  const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'completed_at';
  const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  sql += ` ORDER BY m.${safeSortBy} ${safeSortOrder}`;
  sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, (page - 1) * limit);

  const result = await query(sql, params);

  // Get total count for pagination
  let countSql = `
    SELECT COUNT(*) 
    FROM maintenance_schedule m
    LEFT JOIN requests r ON m.request_id = r.id
    LEFT JOIN users u ON r.requester_id = u.id
    WHERE m.status = 'Completed'
  `;
  const countParams = params.slice(0, -2); // Remove limit/offset

  // Re-add filters for count (this is a simplified approach)
  const countResult = await query(
    `SELECT COUNT(*) FROM maintenance_schedule WHERE status = 'Completed'`
  );

  return {
    workOrders: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].count),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    }
  };
};

/**
 * Get single work order by ID
 */
const getWorkOrderById = async (id) => {
  const result = await query(accountsQueries.getWorkOrderById, [id]);
  return result.rows[0];
};

/**
 * Record payment for a work order
 */
const recordPayment = async (workOrderId, paymentData, recordedBy) => {
  const { amount, notes } = paymentData;

  // Get work order before update for logging
  const existing = await getWorkOrderById(workOrderId);
  if (!existing) {
    throw new Error('Work order not found');
  }

  // Record payment
  const result = await query(accountsQueries.recordPayment, [
    workOrderId,
    amount,
    notes || null,
    recordedBy.id
  ]);

  // Log activity
  await logActivity({
    userId: recordedBy.id,
    userEmail: recordedBy.email,
    userRole: recordedBy.role,
    action: 'PAYMENT_RECORDED',
    entityType: 'MAINTENANCE',
    entityId: workOrderId,
    entityName: `WO-${workOrderId.slice(0, 8)}`,
    department: recordedBy.department,
    details: {
      workOrderId,
      equipmentName: existing.equipment_name,
      actualCost: existing.actual_cost,
      paymentAmount: amount,
      notes
    }
  });

  return result.rows[0];
};

/**
 * Get cost summary statistics
 */
const getCostStats = async () => {
  const result = await query(accountsQueries.getCostStats);
  return result.rows[0];
};

/**
 * Get costs grouped by department
 */
const getCostsByDepartment = async () => {
  const result = await query(accountsQueries.getCostsByDepartment);
  return result.rows;
};

/**
 * Get costs grouped by vendor
 */
const getCostsByVendor = async () => {
  const result = await query(accountsQueries.getCostsByVendor);
  return result.rows;
};

/**
 * Get service type breakdown (In-House vs External)
 */
const getServiceTypeBreakdown = async () => {
  const result = await query(accountsQueries.getServiceTypeBreakdown);
  return result.rows;
};

/**
 * Notify accounts department when work order is completed
 * Called from maintenance module when work order completes
 */
const notifyWorkOrderCompleted = async (workOrder, completedByName) => {
  const isHighCost = workOrder.actual_cost >= HIGH_COST_THRESHOLD;
  
  // Get accounts users
  const accountsResult = await query(accountsQueries.getAccountsUsers);
  const accountsUsers = accountsResult.rows;

  if (accountsUsers.length === 0) return [];

  const userIds = accountsUsers.map(u => u.id);
  
  // Create in-app notification
  const notifications = await notificationsService.createBulk(userIds, {
    type: isHighCost ? 'High_Cost_Work_Order' : 'Work_Order_Completed',
    title: isHighCost 
      ? `⚠️ High-Cost Work Order Completed (₦${workOrder.actual_cost?.toLocaleString()})`
      : 'Work Order Completed',
    message: `Work Order for ${workOrder.equipment_name || 'Equipment'} completed by ${completedByName}. Cost: ₦${workOrder.actual_cost?.toLocaleString() || '0'}`,
    referenceType: 'maintenance',
    referenceId: workOrder.id,
    priority: isHighCost ? 'high' : 'normal'
  });

  return { notifications, accountsUsers };
};

/**
 * Get accounts users (for external notification dispatch)
 */
const getAccountsUsers = async () => {
  const result = await query(accountsQueries.getAccountsUsers);
  return result.rows;
};

module.exports = {
  getWorkOrders,
  getWorkOrderById,
  recordPayment,
  getCostStats,
  getCostsByDepartment,
  getCostsByVendor,
  getServiceTypeBreakdown,
  notifyWorkOrderCompleted,
  getAccountsUsers,
  HIGH_COST_THRESHOLD
};
