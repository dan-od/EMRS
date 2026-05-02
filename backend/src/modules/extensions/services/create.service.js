/**
 * Extensions Service - Create Extension Request
 */
const { transaction } = require('../../../config/db');
const { logActivity } = require('../../../utils/activityLogger');
const notificationsService = require('../../notifications/notifications.service');
const queries = require('./queries');
const logger = require('../../../utils/logger');

const create = async (userId, { requestId, itemIndex, itemName, currentReturnDate, requestedReturnDate, reason }) => {
  return await transaction(async (client) => {
    // Verify request exists and is disbursed
    const requestResult = await client.query(
      'SELECT * FROM requests WHERE id = $1',
      [requestId]
    );
    if (!requestResult.rows[0]) throw new Error('Request not found');
    
    const request = requestResult.rows[0];
    if (request.status !== 'Disbursed') {
      throw new Error('Can only request extension for disbursed items');
    }
    if (request.requester_id !== userId) {
      throw new Error('Only the requester can request an extension');
    }
    
    // Create extension request
    const result = await client.query(queries.create, [
      requestId, itemIndex, itemName, currentReturnDate, requestedReturnDate, reason, userId
    ]);
    const extension = result.rows[0];
    
    // Mark request as having pending extension
    await client.query(queries.setPendingExtension, [requestId, true]);
    
    // Get user info
    const userResult = await client.query(
      'SELECT first_name, last_name, department FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];
    const userName = `${user.first_name} ${user.last_name}`;
    
    // Notify department manager
    try {
      await notificationsService.notifyDepartmentManagers(user.department, {
        type: 'EXTENSION_REQUESTED',
        title: 'Return Extension Requested',
        message: `${userName} requested to extend return date for ${request.type} request`,
        referenceType: 'extension',
        referenceId: extension.id
      });
    } catch (e) {
      logger.error('Failed to notify managers', { message: e.message });
    }
    
    // Send confirmation to requester
    try {
      await notificationsService.create({
        userId,
        type: 'EXTENSION_SUBMITTED',
        title: 'Extension Request Submitted',
        message: `Your request to extend return date to ${new Date(requestedReturnDate).toLocaleDateString()} has been submitted for approval.`,
        referenceType: 'request',
        referenceId: requestId
      });
    } catch (e) {
      logger.error('Failed to send confirmation', { message: e.message });
    }
    
    // Log activity
    await logActivity({
      userId,
      action: 'EXTENSION_REQUESTED',
      entityType: 'request',
      entityId: requestId,
      details: {
        extensionId: extension.id,
        currentReturnDate,
        requestedReturnDate,
        reason,
        requesterName: userName,
        requestType: request.type
      }
    });
    
    return extension;
  });
};

module.exports = { create };
