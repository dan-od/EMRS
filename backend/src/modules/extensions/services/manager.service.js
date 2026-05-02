/**
 * Extensions Service - Manager Operations
 */
const { transaction } = require('../../../config/db');
const { logActivity } = require('../../../utils/activityLogger');
const notificationsService = require('../../notifications/notifications.service');
const queries = require('./queries');
const logger = require('../../../utils/logger');

// Manager approves extension
const managerApprove = async (extensionId, managerId, notes) => {
  return await transaction(async (client) => {
    const extResult = await client.query(queries.findById, [extensionId]);
    if (!extResult.rows[0]) throw new Error('Extension request not found');
    
    const extension = extResult.rows[0];
    if (extension.status !== 'Pending') {
      throw new Error('Extension is not pending manager approval');
    }
    
    const result = await client.query(queries.managerApprove, [extensionId, managerId, notes]);
    const updated = result.rows[0];
    
    // Get manager name
    const managerResult = await client.query(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [managerId]
    );
    const manager = managerResult.rows[0];
    const managerName = `${manager.first_name} ${manager.last_name}`;
    
    // Notify purchasing
    try {
      await notificationsService.notifyPurchasing({
        type: 'EXTENSION_MANAGER_APPROVED',
        title: 'Extension Approved by Manager',
        message: `Return extension for ${extension.request_type} approved by ${managerName}. Awaiting your approval.`,
        referenceType: 'extension',
        referenceId: extensionId
      });
    } catch (e) {
      logger.error('Failed to notify purchasing', { message: e.message });
    }
    
    // Notify requester that their extension is progressing
    try {
      await notificationsService.create({
        userId: extension.requested_by,
        type: 'EXTENSION_PROGRESS',
        title: 'Extension Approved by Manager',
        message: `Your return date extension request was approved by your manager. Awaiting Purchasing approval.`,
        referenceType: 'request',
        referenceId: extension.request_id
      });
    } catch (e) {
      logger.error('Failed to notify requester', { message: e.message });
    }
    
    await logActivity({
      userId: managerId,
      action: 'EXTENSION_MANAGER_APPROVED',
      entityType: 'request',
      entityId: extension.request_id,
      details: {
        extensionId,
        notes,
        approvedBy: managerName,
        requestedReturnDate: extension.requested_return_date
      }
    });
    
    return updated;
  });
};

// Manager rejects extension
const managerReject = async (extensionId, managerId, notes) => {
  return await transaction(async (client) => {
    const extResult = await client.query(queries.findById, [extensionId]);
    if (!extResult.rows[0]) throw new Error('Extension request not found');
    
    const extension = extResult.rows[0];
    if (extension.status !== 'Pending') {
      throw new Error('Extension is not pending manager approval');
    }
    
    const result = await client.query(queries.managerReject, [extensionId, managerId, notes]);
    
    // Clear pending extension flag
    await client.query(queries.setPendingExtension, [extension.request_id, false]);
    
    // Notify requester
    try {
      await notificationsService.create({
        userId: extension.requested_by,
        type: 'EXTENSION_REJECTED',
        title: 'Extension Rejected',
        message: `Your return date extension request was rejected by your manager. ${notes ? `Reason: ${notes}` : ''}`,
        referenceType: 'request',
        referenceId: extension.request_id
      });
    } catch (e) {
      logger.error('Failed to notify requester', { message: e.message });
    }
    
    await logActivity({
      userId: managerId,
      action: 'EXTENSION_MANAGER_REJECTED',
      entityType: 'request',
      entityId: extension.request_id,
      details: { extensionId, notes }
    });
    
    return result.rows[0];
  });
};

module.exports = { managerApprove, managerReject };
