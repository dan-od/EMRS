/**
 * Requests Service - Disburse Operations
 * Purchasing fulfills and disburses requests
 */
const { transaction } = require('../../../config/db');
const queries = require('../requests.queries');
const { logActivity } = require('../../../utils/activityLogger');
const notificationsService = require('../../notifications/notifications.service');
const logger = require('../../../utils/logger');

const disburse = async (id, disbursedBy, disburserName, { notes, expectedReturnDate, withoutApproval = false, inventoryLinks = [] } = {}) => {
  
  return await transaction(async (client) => {
    const current = await client.query(queries.findById, [id]);
    if (!current.rows[0]) throw new Error('Request not found');
    
    const request = current.rows[0];
    
    if (!withoutApproval && request.status !== 'Approved' && request.status !== 'On_Hold') {
      throw new Error('Request must be approved before disbursement');
    }
    
    const disbursedItems = [];
    const inventoryUpdates = [];
    
    for (const link of inventoryLinks) {
      if (link.inventoryId && link.inventoryId !== 'skip') {
        const invResult = await client.query(
          'SELECT id, name, quantity, unit FROM inventory WHERE id = $1',
          [link.inventoryId]
        );
        const invItem = invResult.rows[0];
        
        if (invItem) {
          const qty = link.quantity || 1;

          const updateResult = await client.query(
            'UPDATE inventory SET quantity = quantity - $1, updated_at = NOW() WHERE id = $2 AND quantity >= $1',
            [qty, link.inventoryId]
          );

          if (updateResult.rowCount === 0) {
            throw new Error(`Insufficient stock for "${invItem.name}". Available: ${invItem.quantity}, requested: ${qty}`);
          }
          
          await client.query(
            `INSERT INTO stock_movements (inventory_id, movement_type, quantity, performed_by, reference_id, notes)
             VALUES ($1, 'DISBURSE', $2, $3, $4, $5)`,
            [link.inventoryId, -qty, disbursedBy, id, `Disbursed for request ${id.slice(0,8)}`]
          );
          
          disbursedItems.push({
            inventoryId: link.inventoryId,
            inventoryName: invItem.name,
            quantity: qty,
            unit: invItem.unit,
            isConsumable: link.isConsumable || false,
            returnDate: link.returnDate || null,
            stockBefore: invItem.quantity,
            stockAfter: invItem.quantity - qty
          });
          
          inventoryUpdates.push(
            `${invItem.name}: ${qty} ${invItem.unit || 'units'} (stock: ${invItem.quantity} → ${invItem.quantity - qty})`
          );
          
          if (link.saveAlias && link.saveAlias.alias) {
            try {
              await client.query(
                'INSERT INTO inventory_aliases (inventory_id, alias) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                [link.inventoryId, link.saveAlias.alias]
              );
            } catch (e) {
              logger.debug('Alias already exists or failed to save', { message: e.message });
            }
          }
        }
      }
    }
    
    await client.query(
      `UPDATE requests SET
        status = 'Disbursed'::request_status,
        disbursed_by = $2,
        disbursed_at = NOW(),
        disbursement_notes = $3,
        disbursed_without_approval = $4,
        expected_return_date = NULLIF($5, '')::timestamp,
        is_active = CASE WHEN NULLIF($5, '') IS NOT NULL THEN true ELSE false END,
        disbursed_items = $6::jsonb,
        updated_at = NOW()
      WHERE id = $1`,
      [id, disbursedBy, notes || null, withoutApproval, expectedReturnDate || null, JSON.stringify(disbursedItems)]
    );
    
    await client.query(queries.addHistory, [
      id, disbursedBy, request.status, 'Disbursed', 
      withoutApproval ? `Disbursed without manager approval: ${notes}` : notes
    ]);
    
    await client.query(queries.addAuditTrail, [
      id, disbursedBy, 'DISBURSED', null, null, 
      withoutApproval ? `Without approval: ${notes}` : notes
    ]);
    
    const updated = await client.query(queries.findById, [id]);
    const updatedRequest = updated.rows[0];
    
    try {
      await notificationsService.notifyRequestDisbursed({
        request: updatedRequest,
        disburserName,
        withoutApproval
      });
    } catch (notifError) {
      logger.error('Failed to send disbursement notification', { message: notifError.message });
    }
    
    // Build descriptive items summary for log
    const requestItemsSummary = formatRequestItems(request.details, request.type);
    
    await logActivity({
      userId: disbursedBy,
      action: 'REQUEST_DISBURSED',
      entityType: 'REQUEST',
      entityId: id,
      entityName: `${updatedRequest.type} Request - ${requestItemsSummary}`,
      details: { 
        type: updatedRequest.type,
        requestedItems: requestItemsSummary,
        disbursedFromInventory: inventoryUpdates.length > 0 ? inventoryUpdates : 'No inventory linked',
        inventoryItemsCount: disbursedItems.length,
        requesterName: updatedRequest.requester_name,
        requesterDepartment: updatedRequest.requester_department,
        disburserName: disburserName,
        withoutApproval: withoutApproval,
        expectedReturnDate: expectedReturnDate || null,
        notes: notes || null
      }
    });
    
    return updatedRequest;
  });
};

/**
 * Format request items for activity log
 */
function formatRequestItems(details, type) {
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

module.exports = { disburse };
