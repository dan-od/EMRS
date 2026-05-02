/**
 * Requests Service - Approval Operations
 * Approve and reject request handling with detailed activity logging
 * Uses helpers for maintenance-specific logic
 */
const { transaction } = require('../../../config/db');
const queries = require('../requests.queries');
const { logActivity } = require('../../../utils/activityLogger');
const notificationsService = require('../../notifications/notifications.service');
const logger = require('../../../utils/logger');
const {
  processManagerApproval,
  processPurchasingApproval,
  getMaintenanceApprovalStatus,
  shouldCreateWorkOrder
} = require('./maintenanceApproval.helpers');

/**
 * Approve a request
 */
const approve = async (id, approvedBy, approverName, notes = null, approvedItems = null, user = null, managerData = null, purchasingData = null) => {
  const result = await transaction(async (client) => {
    // Fetch current request
    const current = await client.query(queries.findById, [id]);
    if (!current.rows[0]) throw new Error('Request not found');
    
    const request = current.rows[0];
    let updatedDetails = request.details || {};
    const isMaintenance = request.type === 'Maintenance';
    
    // Process per-item approval (for PPE, Material requests)
    if (approvedItems && Array.isArray(approvedItems)) {
      updatedDetails = processItemApproval(updatedDetails, approvedItems, request);
    }
    
    // Process maintenance-specific approvals
    if (isMaintenance && managerData) {
      updatedDetails = processManagerApproval(updatedDetails, managerData, approvedBy, approverName);
    }
    
    if (isMaintenance && purchasingData) {
      updatedDetails = processPurchasingApproval(updatedDetails, purchasingData, approvedBy, approverName);
    }
    
    // Update details if changed
    if (approvedItems || managerData || purchasingData) {
      await client.query(
        `UPDATE requests SET details = $2, updated_at = NOW() WHERE id = $1`,
        [id, JSON.stringify(updatedDetails)]
      );
    }
    
    // Update cost fields
    await updateCostFields(client, id, managerData, purchasingData);
    
    // Determine status
    const newStatus = isMaintenance 
      ? getMaintenanceApprovalStatus(request, managerData, purchasingData, user)
      : 'Approved';
    
    // Update status
    await client.query(queries.updateStatus, [id, newStatus, approvedBy, null]);
    await client.query(queries.addHistory, [id, approvedBy, request.status, newStatus, notes]);
    await client.query(queries.addAuditTrail, [id, approvedBy, 'APPROVED', request.requester_department, null, notes]);
    
    // Get updated request
    const updated = await client.query(queries.findById, [id]);
    const updatedRequest = updated.rows[0];

    // Create work order if applicable (inside transaction so it's atomic)
    if (shouldCreateWorkOrder(updatedRequest, purchasingData, user)) {
      await createWorkOrderFromRequest(client, updatedRequest, approvedBy, user, purchasingData, id);
    }

    // Log activity inside transaction
    await logApprovalActivity(approvedBy, approverName, id, request, updatedRequest, notes, approvedItems, managerData, purchasingData);

    return updatedRequest;
  });

  // Fire notifications after transaction commits — don't hold the DB connection open
  sendApprovalNotifications(result, approverName);

  return result;
};

/**
 * Process item-level approval
 */
const processItemApproval = (details, approvedItems, request) => {
  const approved = approvedItems.filter(i => i.approval_status === 'approved');
  const rejected = approvedItems.filter(i => i.approval_status === 'rejected');
  
  return {
    ...details,
    items: approvedItems,
    originalItems: request.details?.items || [],
    approvalType: 'per_item',
    approvedCount: approved.length,
    rejectedCount: rejected.length
  };
};

/**
 * Update cost fields in database
 */
const updateCostFields = async (client, id, managerData, purchasingData) => {
  if (managerData?.costEstimate) {
    await client.query(
      `UPDATE requests SET manager_cost_estimate = $2, updated_at = NOW() WHERE id = $1`,
      [id, managerData.costEstimate]
    );
  }
  
  if (purchasingData?.finalCost) {
    await client.query(
      `UPDATE requests SET purchasing_final_cost = $2, updated_at = NOW() WHERE id = $1`,
      [id, purchasingData.finalCost]
    );
  }
};

/**
 * Send approval notifications
 */
const sendApprovalNotifications = async (request, approverName) => {
  try {
    await notificationsService.notifyRequestApproved({ request, approverName });
  } catch (err) {
    logger.error('Failed to send approval notification', { message: err.message });
  }
};

/**
 * Create work order from maintenance request
 */
const createWorkOrderFromRequest = async (client, request, approvedBy, user, purchasingData, requestId) => {
  try {
    const workOrderService = require('../../maintenance/workOrder.service');

    // Pass the client so work order is created in same transaction
    const workOrder = await workOrderService.createFromRequest(request, approvedBy, user, purchasingData, client);

    if (workOrder) {
      // Link work order to request (use same client)
      await client.query(
        `UPDATE requests SET work_order_id = $2, updated_at = NOW() WHERE id = $1`,
        [requestId, workOrder.id]
      );

      // Notifications (non-fatal)
      try {
        await notifyWorkOrderCreated(request, workOrder, requestId);
        await notifyAccountsDepartment(workOrder, request, purchasingData);
      } catch (notifyErr) {
        logger.error('Work order notification failed', { message: notifyErr.message });
      }
    }
  } catch (err) {
    logger.error('createWorkOrderFromRequest failed', { message: err.message });
    // Don't re-throw - let approval continue
  }
};

/**
 * Notify requester about work order creation
 */
const notifyWorkOrderCreated = async (request, workOrder, requestId) => {
  try {
    await notificationsService.create({
      userId: request.requester_id,
      type: 'WORK_ORDER_CREATED',
      title: '🔧 Work Order Created',
      message: `A work order has been created for your Maintenance Request #${requestId.slice(0, 8)}`,
      referenceType: 'maintenance',
      referenceId: workOrder.id,
      priority: 'normal'
    });
  } catch (err) {
    logger.error('Failed to send work order notification', { message: err.message });
  }
};

/**
 * Notify Accounts department about new work order
 */
const notifyAccountsDepartment = async (workOrder, request, purchasingData) => {
  try {
    const finalCost = purchasingData?.finalCost || request.manager_cost_estimate || 0;
    
    // Notify all Finance/Accounts users
    await notificationsService.notifyDepartment('Finance', {
      type: 'WORK_ORDER_COST',
      title: '💰 New Work Order for Budgeting',
      message: `Work Order #${workOrder.id.slice(0, 8)} created. Cost: ₦${finalCost.toLocaleString()}`,
      referenceType: 'work_order',
      referenceId: workOrder.id,
      priority: 'normal'
    });
  } catch (err) {
    logger.error('Failed to notify Accounts', { message: err.message });
  }
};

/**
 * Log approval activity with detailed info
 */
const logApprovalActivity = async (approvedBy, approverName, id, originalRequest, updatedRequest, notes, approvedItems, managerData, purchasingData) => {
  const approvedCount = approvedItems?.filter(i => i.approval_status === 'approved').length || 0;
  const rejectedCount = approvedItems?.filter(i => i.approval_status === 'rejected').length || 0;
  
  // Build descriptive items summary
  const itemsSummary = formatItemsForLog(originalRequest.details, originalRequest.type);
  
  await logActivity({
    userId: approvedBy,
    action: 'REQUEST_APPROVED',
    entityType: 'REQUEST',
    entityId: id,
    entityName: `${originalRequest.type} Request - ${itemsSummary}`,
    details: { 
      type: originalRequest.type, 
      requesterName: originalRequest.requester_name,
      requesterDepartment: originalRequest.requester_department,
      approverName: approverName,
      items: itemsSummary,
      notes: notes,
      perItemApproval: !!approvedItems,
      itemsApproved: approvedCount || null,
      itemsRejected: rejectedCount || null,
      costEstimate: managerData?.costEstimate ? `₦${Number(managerData.costEstimate).toLocaleString()}` : null,
      finalCost: purchasingData?.finalCost ? `₦${Number(purchasingData.finalCost).toLocaleString()}` : null,
      isManagerApproval: !!managerData,
      isPurchasingApproval: !!purchasingData,
      newStatus: updatedRequest.status
    }
  });
};

/**
 * Format items for activity log
 */
function formatItemsForLog(details, type) {
  if (!details) return type;
  
  // PPE/Material items
  if (details.items && Array.isArray(details.items) && details.items.length > 0) {
    return details.items.map(item => {
      const name = item.name || item.item || 'Item';
      const qty = item.quantity || 1;
      const size = item.size ? ` (${item.size})` : '';
      return `${name}${size} ×${qty}`;
    }).join(', ');
  }
  
  // Equipment
  if (details.equipmentName) {
    return details.equipmentName;
  }
  
  // Transport
  if (details.destination) {
    return `Transport to ${details.destination}`;
  }
  
  // Maintenance
  if (details.issueDescription) {
    const equipName = details.equipmentName ? `${details.equipmentName}: ` : '';
    const desc = details.issueDescription;
    return equipName + (desc.length > 40 ? desc.substring(0, 40) + '...' : desc);
  }
  
  return type;
}

/**
 * Reject a request
 */
const reject = async (id, rejectedBy, rejecterName, reason) => {
  return await transaction(async (client) => {
    const current = await client.query(queries.findById, [id]);
    if (!current.rows[0]) throw new Error('Request not found');
    
    const request = current.rows[0];
    const wasDisbursted = request.status === 'Disbursed';
    
    // Build items summary for activity log
    const itemsSummary = formatItemsForLog(request.details, request.type);
    
    await client.query(queries.updateStatus, [id, 'Rejected', rejectedBy, reason]);
    await client.query(queries.addHistory, [id, rejectedBy, request.status, 'Rejected', reason]);
    await client.query(queries.addAuditTrail, [id, rejectedBy, 'REJECTED', null, null, reason]);
    
    const updated = await client.query(queries.findById, [id]);
    const updatedRequest = updated.rows[0];
    
    // Send notifications
    await sendRejectionNotifications(updatedRequest, rejecterName, reason, wasDisbursted, id);
    
    // Log activity with detailed info
    await logActivity({
      userId: rejectedBy,
      action: 'REQUEST_REJECTED',
      entityType: 'REQUEST',
      entityId: id,
      entityName: `${request.type} Request - ${itemsSummary}`,
      details: { 
        type: request.type, 
        requesterName: request.requester_name,
        requesterDepartment: request.requester_department,
        rejecterName: rejecterName,
        items: itemsSummary,
        reason: reason,
        wasDisbursted: wasDisbursted
      }
    });
    
    return updatedRequest;
  });
};

/**
 * Send rejection notifications
 */
const sendRejectionNotifications = async (request, rejecterName, reason, wasDisbursted, id) => {
  try {
    await notificationsService.notifyRequestRejected({ request, rejecterName, reason });
    
    if (wasDisbursted && request.disbursed_by) {
      await notificationsService.create({
        userId: request.disbursed_by,
        type: 'REQUEST_REJECTED',
        title: '⚠️ Disbursed Request Was Declined',
        message: `Request #${id.slice(0,8)} you disbursed was declined by ${rejecterName}`,
        referenceType: 'request',
        referenceId: id,
        priority: 'high'
      });
    }
  } catch (err) {
    logger.error('Failed to send rejection notification', { message: err.message });
  }
};

module.exports = { approve, reject };
