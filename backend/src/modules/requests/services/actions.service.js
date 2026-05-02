/**
 * Requests Service - Miscellaneous Actions
 * Complete, remind, cancel, transfer operations
 */
const { query, transaction } = require('../../../config/db');
const queries = require('../requests.queries');
const { logActivity } = require('../../../utils/activityLogger');
const notificationsService = require('../../notifications/notifications.service');
const { getById } = require('./base.service');

const complete = async (id, userId) => {
  return await transaction(async (client) => {
    const current = await client.query(queries.findById, [id]);
    if (!current.rows[0]) throw new Error('Request not found');
    
    await client.query(queries.complete, [id]);
    await client.query(queries.addHistory, [
      id, userId, current.rows[0].status, 'Completed', 'Request completed'
    ]);
    
    const updated = await client.query(queries.findById, [id]);
    
    await logActivity({
      userId,
      action: 'UPDATE',
      entityType: 'request',
      entityId: id,
      details: { status: 'Completed' }
    });
    
    return updated.rows[0];
  });
};

const remindReturn = async (requestId, sentBy) => {
  const request = await getById(requestId);
  if (!request) throw new Error('Request not found');
  
  if (!request.expected_return_date) {
    throw new Error('No expected return date set');
  }
  
  const today = new Date();
  const expectedDate = new Date(request.expected_return_date);
  const daysOverdue = Math.floor((today - expectedDate) / (1000 * 60 * 60 * 24));
  
  await notificationsService.notifyReturnOverdue({
    request,
    daysOverdue: daysOverdue > 0 ? daysOverdue : 0
  });
  
  await logActivity({
    userId: sentBy,
    action: 'UPDATE',
    entityType: 'request',
    entityId: requestId,
    details: { action: 'return_reminder_sent', daysOverdue }
  });
  
  return { sent: true, daysOverdue };
};

const cancel = async (id, userId) => {
  const result = await query(queries.cancel, [id, userId]);
  return result.rows[0];
};

const transfer = async (id, toDepartment, transferredBy, notes = null) => {
  return await transaction(async (client) => {
    const current = await client.query(queries.findById, [id]);
    if (!current.rows[0]) throw new Error('Request not found');
    if (current.rows[0].status !== 'Pending') {
      throw new Error('Only pending requests can be transferred');
    }
    
    await client.query(queries.transfer, [id, toDepartment, notes]);
    await client.query(queries.addHistory, [
      id, transferredBy, current.rows[0].status, 'Pending', 
      `Transferred to ${toDepartment}: ${notes || ''}`
    ]);
    
    await client.query(queries.addAuditTrail, [
      id, transferredBy, 'TRANSFERRED', current.rows[0].requester_department, toDepartment, notes
    ]);
    
    const updated = await client.query(queries.findById, [id]);
    return updated.rows[0];
  });
};

module.exports = { complete, remindReturn, cancel, transfer };
