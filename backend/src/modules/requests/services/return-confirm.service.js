/**
 * Requests Service - Confirm Return
 * Purchasing verifies and confirms returned items
 */
const { transaction } = require('../../../config/db');
const queries = require('../requests.queries');
const { logActivity } = require('../../../utils/activityLogger');
const notificationsService = require('../../notifications/notifications.service');
const { processVerifiedItem } = require('./return-helpers');
const logger = require('../../../utils/logger');

const confirmReturn = async (id, confirmedBy, confirmerName, { notes, verifiedItems = [] } = {}) => {
  
  return await transaction(async (client) => {
    const current = await client.query(queries.findById, [id]);
    if (!current.rows[0]) throw new Error('Request not found');
    
    const request = current.rows[0];
    
    if (request.status !== 'Pending_Return' && request.status !== 'Disbursed') {
      throw new Error('Request is not pending return');
    }
    
    let disbursedItems = [];
    try {
      disbursedItems = request.disbursed_items || [];
      if (typeof disbursedItems === 'string') {
        disbursedItems = JSON.parse(disbursedItems);
      }
    } catch (e) {
      logger.debug('Could not parse disbursed_items', { message: e.message });
    }
    
    // Process each verified item
    const inventoryUpdates = [];
    for (const item of verifiedItems) {
      const result = await processVerifiedItem(client, item, disbursedItems, request, id, confirmedBy, confirmerName);
      inventoryUpdates.push(result);
    }
    
    const hasLost = verifiedItems.some(i => i.verifiedCondition === 'Lost');
    const hasDamaged = verifiedItems.some(i => i.verifiedCondition === 'Damaged');
    const overallCondition = hasLost ? 'Lost' : hasDamaged ? 'Damaged' : 'Good';
    
    await client.query(queries.confirmReturn, [id, confirmedBy, overallCondition, notes]);
    await client.query(queries.addHistory, [
      id, confirmedBy, request.status, 'Completed', `Return verified by ${confirmerName}`
    ]);
    
    await client.query(queries.addAuditTrail, [
      id, confirmedBy, 'RETURN_CONFIRMED', null, null, 
      `Verified: ${verifiedItems.map(i => `${i.name}: ${i.verifiedCondition}`).join(', ')}`
    ]);
    
    const updated = await client.query(queries.findById, [id]);
    const updatedRequest = updated.rows[0];
    
    try {
      await notificationsService.create({
        userId: request.requester_id,
        type: 'RETURN_CONFIRMED',
        title: 'Return Confirmed',
        message: `Your ${request.type} return has been verified by ${confirmerName}`,
        referenceType: 'request',
        referenceId: id
      });
    } catch (notifError) {
      logger.error('Failed to send return confirmation notification', { message: notifError.message });
    }
    
    const returnSummary = inventoryUpdates.length > 0
      ? inventoryUpdates.map(u => `${u.name}: ${u.verifiedCondition}${u.restocked ? ' (restocked)' : ' (damaged/lost)'}`).join('; ')
      : 'No inventory items to process';
    
    await logActivity({
      userId: confirmedBy,
      action: 'RETURN_CONFIRMED',
      entityType: 'request',
      entityId: id,
      details: { 
        overallCondition, notes, confirmedBy: confirmerName,
        requesterName: request.requester_name,
        requesterDepartment: request.requester_department,
        requestType: request.type,
        verifiedItems, inventoryUpdates, returnSummary
      }
    });
    
    return updatedRequest;
  });
};

module.exports = { confirmReturn };
