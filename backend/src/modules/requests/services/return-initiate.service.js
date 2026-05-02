/**
 * Requests Service - Initiate Return
 * Engineer initiates return of disbursed items
 */
const { transaction } = require('../../../config/db');
const queries = require('../requests.queries');
const { logActivity } = require('../../../utils/activityLogger');
const notificationsService = require('../../notifications/notifications.service');
const logger = require('../../../utils/logger');

const initiateReturn = async (id, userId, { notes, returnItems = [] } = {}) => {
  
  return await transaction(async (client) => {
    const current = await client.query(queries.findById, [id]);
    if (!current.rows[0]) throw new Error('Request not found');
    
    const request = current.rows[0];
    
    if (request.requester_id !== userId) {
      throw new Error('Only the requester can initiate a return');
    }
    
    if (request.status !== 'Disbursed') {
      throw new Error('Only disbursed requests can be returned');
    }
    
    const hasDamaged = returnItems.some(item => item.condition === 'Damaged');
    const hasLost = returnItems.some(item => item.condition === 'Lost');
    const overallCondition = hasLost ? 'Lost' : hasDamaged ? 'Damaged' : 'Good';
    
    const userResult = await client.query(
      'SELECT first_name, last_name, department FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0] || {};
    const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    
    // Log damaged/lost items to damaged_inventory
    for (const item of returnItems) {
      if (item.condition === 'Damaged' || item.condition === 'Lost') {
        await client.query(
          `INSERT INTO damaged_inventory 
           (inventory_id, request_id, item_name, quantity, unit, category, condition, reason, reported_by, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Pending_Verification')`,
          [
            item.inventoryId || null,
            id,
            item.name,
            item.quantity || 1,
            item.unit || 'units',
            request.type,
            item.condition,
            item.notes || `Reported as ${item.condition} by ${userName}`,
            userId
          ]
        );
      }
    }
    
    const itemsSummary = returnItems.length > 0
      ? returnItems.map(i => `${i.name}: ${i.condition}`).join(', ')
      : 'No tracked items';
    
    await client.query(queries.initiateReturn, [
      id, overallCondition, notes, JSON.stringify(returnItems)
    ]);
    
    await client.query(queries.addHistory, [
      id, userId, 'Disbursed', 'Pending_Return', `Return initiated: ${overallCondition}`
    ]);
    
    await client.query(queries.addAuditTrail, [
      id, userId, 'RETURN_INITIATED', null, null, 
      `Condition: ${overallCondition}. Items: ${itemsSummary}`
    ]);
    
    const updated = await client.query(queries.findById, [id]);
    const updatedRequest = updated.rows[0];
    
    try {
      const damagedCount = returnItems.filter(i => i.condition === 'Damaged').length;
      const lostCount = returnItems.filter(i => i.condition === 'Lost').length;
      let message = `${updatedRequest.requester_name} initiated return for ${updatedRequest.type} request`;
      if (damagedCount > 0 || lostCount > 0) {
        message += ` (${damagedCount > 0 ? `${damagedCount} damaged` : ''}${damagedCount > 0 && lostCount > 0 ? ', ' : ''}${lostCount > 0 ? `${lostCount} lost` : ''})`;
      }
      
      await notificationsService.notifyPurchasing({
        type: 'RETURN_INITIATED',
        title: hasLost || hasDamaged ? '⚠️ Return with Issues' : 'Return Initiated',
        message,
        referenceType: 'request',
        referenceId: id
      });
    } catch (notifError) {
      logger.error('Failed to send return notification', { message: notifError.message });
    }
    
    await logActivity({
      userId,
      action: 'RETURN_INITIATED',
      entityType: 'request',
      entityId: id,
      details: { 
        overallCondition,
        notes,
        returnItems,
        requesterName: request.requester_name,
        requesterDepartment: request.requester_department,
        requestType: request.type,
        itemsSummary,
        damagedCount: returnItems.filter(i => i.condition === 'Damaged').length,
        lostCount: returnItems.filter(i => i.condition === 'Lost').length
      }
    });
    
    return updatedRequest;
  });
};

module.exports = { initiateReturn };
