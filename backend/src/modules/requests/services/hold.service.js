/**
 * Requests Service - Hold Operations
 * Put on hold and release from hold
 */
const { transaction } = require('../../../config/db');
const queries = require('../requests.queries');
const { logActivity } = require('../../../utils/activityLogger');
const notificationsService = require('../../notifications/notifications.service');

const putOnHold = async (id, userId, notes) => {
  return await transaction(async (client) => {
    const current = await client.query(queries.findById, [id]);
    if (!current.rows[0]) throw new Error('Request not found');
    
    const request = current.rows[0];
    
    await client.query(queries.putOnHold, [id, notes]);
    await client.query(queries.addHistory, [
      id, userId, request.status, 'On_Hold', notes
    ]);
    
    await client.query(queries.addAuditTrail, [
      id, userId, 'ON_HOLD', null, null, notes
    ]);
    
    const updated = await client.query(queries.findById, [id]);
    const updatedRequest = updated.rows[0];
    
    const handlerResult = await client.query(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [userId]
    );
    const handlerName = handlerResult.rows[0] 
      ? `${handlerResult.rows[0].first_name} ${handlerResult.rows[0].last_name}`
      : 'Purchasing';
    
    if (request.requester_id) {
      await notificationsService.create({
        userId: request.requester_id,
        type: 'GENERAL',
        title: 'Request On Hold',
        message: `Your ${request.type} request has been put on hold by ${handlerName}. Reason: ${notes || 'No reason provided'}`,
        referenceType: 'request',
        referenceId: id,
        priority: 'warning'
      });
    }
    
    await logActivity({
      userId,
      action: 'REQUEST_ON_HOLD',
      entityType: 'request',
      entityId: id,
      details: { 
        status: 'On_Hold', 
        notes,
        requestType: request.type,
        requesterName: request.requester_name || updatedRequest.requester_name
      }
    });
    
    return updatedRequest;
  });
};

const releaseFromHold = async (id, userId, userName) => {
  return await transaction(async (client) => {
    const current = await client.query(queries.findById, [id]);
    if (!current.rows[0]) throw new Error('Request not found');
    
    const request = current.rows[0];
    
    if (request.status !== 'On_Hold') {
      throw new Error('Request is not on hold');
    }
    
    await client.query(queries.releaseFromHold, [id]);
    
    const newStatus = request.approved_at ? 'Approved' : 'Pending';
    
    await client.query(queries.addHistory, [
      id, userId, 'On_Hold', newStatus, 'Released from hold'
    ]);
    
    await client.query(queries.addAuditTrail, [
      id, userId, 'RELEASED_FROM_HOLD', null, null, 'Request resumed'
    ]);
    
    const updated = await client.query(queries.findById, [id]);
    const updatedRequest = updated.rows[0];
    
    if (request.requester_id) {
      await notificationsService.create({
        userId: request.requester_id,
        type: 'GENERAL',
        title: 'Request Resumed',
        message: `Your ${request.type} request has been released from hold by ${userName} and is now being processed.`,
        referenceType: 'request',
        referenceId: id,
        priority: 'normal'
      });
    }
    
    await logActivity({
      userId,
      action: 'REQUEST_RELEASED_FROM_HOLD',
      entityType: 'request',
      entityId: id,
      details: { 
        status: newStatus,
        requestType: request.type,
        requesterName: request.requester_name || updatedRequest.requester_name
      }
    });
    
    return updatedRequest;
  });
};

module.exports = { putOnHold, releaseFromHold };
