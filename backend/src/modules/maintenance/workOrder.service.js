/**
 * Maintenance Work Order Service
 * Handles creation of Work Orders from approved Maintenance Requests
 */

const { query } = require('../../config/db');
const { logActivity } = require('../../utils/activityLogger');
const logger = require('../../utils/logger');

/**
 * Create a Work Order from an approved Maintenance Request
 * @param {Object} request - The maintenance request
 * @param {string} approvedBy - User ID who approved
 * @param {Object} user - User object
 * @param {Object} purchasingData - Purchasing approval data
 * @param {Object} client - Optional DB client for transaction
 */
const createFromRequest = async (request, approvedBy, user, purchasingData = null, client = null) => {
  // Use provided client or fall back to regular query
  const dbQuery = client
    ? (text, params) => client.query(text, params)
    : query;

  logger.debug('Work order creation started', {
    requestId: request?.id,
    requestType: request?.type,
    approvedBy,
    userEmail: user?.email,
    hasClient: !!client,
  });

  const details = request.details || {};

  // Determine equipment ID from the request
  const equipmentId = details.equipmentId || null;
  const vehicleId = details.vehicleId || null;

  // If no equipment linked, we can't create a proper work order
  if (!equipmentId && !vehicleId) {
    logger.debug('Skipping work order creation: no equipment/vehicle linked', { requestId: request?.id });
    return null;
  }

  // Get cost from purchasingData or request details
  const estimatedCost = purchasingData?.finalCost || details.costEstimate || null;

  // Get vendor info
  const vendorInfo = purchasingData?.confirmedVendor || details.managerVendorRecommendation || details.vendorRecommendation || null;

  // Build the work order data
  const workOrderData = {
    equipment_id: equipmentId,
    maintenance_type: mapMaintenanceType(details.category),
    description: details.issueDescription || request.notes || 'Maintenance from approved request',
    scheduled_date: request.date_needed || new Date(),
    priority: request.priority || 'Medium',
    estimated_hours: null,
    estimated_cost: estimatedCost,
    notes: buildWorkOrderNotes(request, purchasingData, vendorInfo),
    created_by: approvedBy,
    request_id: request.id,
    created_from: 'request',
    status: 'Scheduled'
  };

  try {
    // Insert the work order
    const result = await dbQuery(`
      INSERT INTO maintenance_schedule (
        equipment_id, maintenance_type, description, scheduled_date,
        priority, estimated_hours, estimated_cost, notes,
        created_by, request_id, created_from, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      workOrderData.equipment_id,
      workOrderData.maintenance_type,
      workOrderData.description,
      workOrderData.scheduled_date,
      workOrderData.priority,
      workOrderData.estimated_hours,
      workOrderData.estimated_cost,
      workOrderData.notes,
      workOrderData.created_by,
      workOrderData.request_id,
      workOrderData.created_from,
      workOrderData.status
    ]);

    if (!result.rows || result.rows.length === 0) {
      logger.error('Work order INSERT returned no rows', { requestId: request?.id });
      return null;
    }

    const workOrder = result.rows[0];
    const workOrderId = workOrder.id;
    logger.info('Work order created', { workOrderId, requestId: request.id });

    // Update the request with the work order ID reference
    await dbQuery(`
      UPDATE requests
      SET details = details || $1::jsonb,
          updated_at = NOW()
      WHERE id = $2
    `, [
      JSON.stringify({ workOrderId: workOrderId }),
      request.id
    ]);

    // Log activity (don't let this break anything)
    try {
      await logActivity({
        userId: approvedBy,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'WORK_ORDER_CREATED',
        entityType: 'MAINTENANCE',
        entityId: workOrderId,
        entityName: `Work Order from Request #${request.id.slice(0, 8)}`,
        details: {
          requestId: request.id,
          equipmentId: equipmentId,
          maintenanceType: workOrderData.maintenance_type,
          priority: workOrderData.priority,
          estimatedCost: estimatedCost,
          createdFrom: 'maintenance_request'
        },
        department: user?.department
      });
    } catch (logErr) {
      logger.warn('Activity log failed (non-fatal)', { message: logErr.message });
    }

    // Get the full work order with equipment details
    const fullWorkOrder = await dbQuery(`
      SELECT
        m.*,
        e.name as equipment_name,
        e.serial_number as equipment_serial
      FROM maintenance_schedule m
      LEFT JOIN equipment e ON m.equipment_id = e.id
      WHERE m.id = $1
    `, [workOrderId]);

    return fullWorkOrder.rows[0];
  } catch (err) {
    logger.error('Work order creation failed', { requestId: request?.id, message: err.message, stack: err.stack });
    throw err;
  }
};

/**
 * Build work order notes from request data
 */
const buildWorkOrderNotes = (request, purchasingData, vendorInfo) => {
  const notes = [`Created from Maintenance Request #${request.id.slice(0, 8)}`];

  if (vendorInfo?.vendorName) {
    notes.push(`Vendor: ${vendorInfo.vendorName}`);
  }

  if (purchasingData?.purchasingNotes) {
    notes.push(`Purchasing notes: ${purchasingData.purchasingNotes}`);
  }

  return notes.join(' | ');
};

/**
 * Map maintenance category to maintenance type
 */
const mapMaintenanceType = (category) => {
  const mapping = {
    'Equipment': 'Repair',
    'Vehicle': 'Repair',
    'Facility': 'Repair',
    'Other': 'Repair'
  };
  return mapping[category] || 'Repair';
};

/**
 * Get work order by request ID
 */
const getByRequestId = async (requestId) => {
  const result = await query(`
    SELECT
      m.*,
      e.name as equipment_name,
      e.serial_number as equipment_serial,
      u.first_name || ' ' || u.last_name as assigned_to_name
    FROM maintenance_schedule m
    LEFT JOIN equipment e ON m.equipment_id = e.id
    LEFT JOIN users u ON m.assigned_to = u.id
    WHERE m.request_id = $1
  `, [requestId]);

  return result.rows[0];
};

/**
 * Get request by work order ID
 */
const getRequestByWorkOrderId = async (workOrderId) => {
  const result = await query(`
    SELECT r.*
    FROM requests r
    JOIN maintenance_schedule m ON m.request_id = r.id
    WHERE m.id = $1
  `, [workOrderId]);

  return result.rows[0];
};

module.exports = {
  createFromRequest,
  getByRequestId,
  getRequestByWorkOrderId
};
