/**
 * Extensions Service - Purchasing Operations
 */
const { transaction } = require('../../../config/db');
const { logActivity } = require('../../../utils/activityLogger');
const notificationsService = require('../../notifications/notifications.service');
const queries = require('./queries');
const logger = require('../../../utils/logger');

// Purchasing approves extension (final approval)
const purchasingApprove = async (extensionId, purchasingId, notes) => {
  return await transaction(async (client) => {
    const extResult = await client.query(queries.findById, [extensionId]);
    if (!extResult.rows[0]) throw new Error('Extension request not found');
    
    const extension = extResult.rows[0];
    if (extension.status !== 'Manager_Approved') {
      throw new Error('Extension is not pending purchasing approval');
    }
    
    // Update extension status
    const result = await client.query(queries.purchasingApprove, [extensionId, purchasingId, notes]);
    
    // Update request return date
    await client.query(queries.updateRequestReturnDate, [
      extension.request_id, 
      extension.requested_return_date
    ]);
    
    // Notify requester
    try {
      await notificationsService.create({
        userId: extension.requested_by,
        type: 'EXTENSION_APPROVED',
        title: '✅ Extension Approved',
        message: `Your return date has been extended to ${new Date(extension.requested_return_date).toLocaleDateString()}`,
        referenceType: 'request',
        referenceId: extension.request_id
      });
    } catch (e) {
      logger.error('Failed to notify requester', { message: e.message });
    }
    
    await logActivity({
      userId: purchasingId,
      action: 'EXTENSION_APPROVED',
      entityType: 'request',
      entityId: extension.request_id,
      details: {
        extensionId,
        notes,
        newReturnDate: extension.requested_return_date,
        previousReturnDate: extension.current_return_date
      }
    });
    
    return result.rows[0];
  });
};

// Purchasing rejects extension
const purchasingReject = async (extensionId, purchasingId, notes) => {
  return await transaction(async (client) => {
    const extResult = await client.query(queries.findById, [extensionId]);
    if (!extResult.rows[0]) throw new Error('Extension request not found');
    
    const extension = extResult.rows[0];
    if (extension.status !== 'Manager_Approved') {
      throw new Error('Extension is not pending purchasing approval');
    }
    
    const result = await client.query(queries.purchasingReject, [extensionId, purchasingId, notes]);
    
    // Clear pending extension flag
    await client.query(queries.setPendingExtension, [extension.request_id, false]);
    
    // Notify requester
    try {
      await notificationsService.create({
        userId: extension.requested_by,
        type: 'EXTENSION_REJECTED',
        title: 'Extension Rejected',
        message: `Your return date extension was rejected by Purchasing. ${notes ? `Reason: ${notes}` : ''}`,
        referenceType: 'request',
        referenceId: extension.request_id
      });
    } catch (e) {
      logger.error('Failed to notify requester', { message: e.message });
    }
    
    await logActivity({
      userId: purchasingId,
      action: 'EXTENSION_PURCHASING_REJECTED',
      entityType: 'request',
      entityId: extension.request_id,
      details: { extensionId, notes }
    });
    
    return result.rows[0];
  });
};

module.exports = { purchasingApprove, purchasingReject };
