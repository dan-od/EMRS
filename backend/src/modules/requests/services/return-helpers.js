/**
 * Requests Service - Return Helpers
 * Helper functions for processing return items
 */

/**
 * Process a single verified item - restock or log as damaged
 */
const processVerifiedItem = async (client, item, disbursedItems, request, id, confirmedBy, confirmerName) => {
  const qty = item.quantity || 1;
  const verifiedCondition = item.verifiedCondition || 'Good';
  const reportedCondition = item.reportedCondition || verifiedCondition;
  const itemName = item.name || 'Unknown item';
  
  const disbursedItem = disbursedItems.find(d => 
    (d.inventoryName === itemName || d.name === itemName) ||
    (item.inventoryId && d.inventoryId === item.inventoryId)
  );
  const inventoryId = item.inventoryId || disbursedItem?.inventoryId;
  const isConsumable = disbursedItem?.isConsumable || false;
  
  if (verifiedCondition === 'Good' || verifiedCondition === 'Fair') {
    return await processGoodItem(client, { itemName, qty, inventoryId, isConsumable, verifiedCondition, reportedCondition, confirmedBy, confirmerName, id, item });
  } else {
    return await processDamagedItem(client, { itemName, qty, inventoryId, isConsumable, verifiedCondition, reportedCondition, confirmedBy, confirmerName, id, item, request });
  }
};

/**
 * Process item verified as Good/Fair - restock inventory
 */
const processGoodItem = async (client, params) => {
  const { itemName, qty, inventoryId, isConsumable, verifiedCondition, reportedCondition, confirmedBy, confirmerName, id, item } = params;
  let result = null;
  
  if (inventoryId && !isConsumable) {
    const updateResult = await client.query(
      'UPDATE inventory SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [qty, inventoryId]
    );
    result = updateResult.rows[0];
    
    await client.query(
      `INSERT INTO stock_movements (inventory_id, movement_type, quantity, performed_by, reference_id, notes)
       VALUES ($1, 'RETURN', $2, $3, $4, $5)`,
      [inventoryId, qty, confirmedBy, id, `Returned - Verified as ${verifiedCondition}`]
    );
  }
  
  // If engineer reported damaged but verified as good, resolve the damaged_inventory record
  if (reportedCondition === 'Damaged' || reportedCondition === 'Lost') {
    await client.query(
      `UPDATE damaged_inventory 
       SET status = 'Resolved', 
           resolution_notes = $1,
           resolved_by = $2,
           resolved_at = NOW(),
           updated_at = NOW()
       WHERE request_id = $3 AND item_name = $4 AND status = 'Pending_Verification'`,
      [`Verified as ${verifiedCondition} by ${confirmerName}. ${item.verificationNotes || ''}`, confirmedBy, id, itemName]
    );
  }
  
  return {
    name: itemName,
    quantity: qty,
    verifiedCondition,
    reportedCondition,
    restocked: !!result,
    newStock: result?.quantity
  };
};

/**
 * Process item verified as Damaged/Lost - log to damaged inventory
 */
const processDamagedItem = async (client, params) => {
  const { itemName, qty, inventoryId, isConsumable, verifiedCondition, confirmedBy, confirmerName, id, item, request, reportedCondition } = params;
  
  const updateResult = await client.query(
    `UPDATE damaged_inventory 
     SET status = 'Verified',
         condition = $1,
         resolution_notes = $2,
         resolved_by = $3,
         updated_at = NOW()
     WHERE request_id = $4 AND item_name = $5 AND status = 'Pending_Verification'
     RETURNING id`,
    [verifiedCondition, item.verificationNotes || `Verified by ${confirmerName}`, confirmedBy, id, itemName]
  );
  
  if (updateResult.rowCount === 0) {
    await client.query(
      `INSERT INTO damaged_inventory 
       (inventory_id, request_id, item_name, quantity, unit, category, condition, reason, reported_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Verified')`,
      [
        inventoryId || null, id, itemName, qty, item.unit || 'units',
        request.type, verifiedCondition,
        `Verified as ${verifiedCondition} by Purchasing. ${item.verificationNotes || ''}`,
        confirmedBy
      ]
    );
  }
  
  if (inventoryId && !isConsumable) {
    await client.query(
      `INSERT INTO stock_movements (inventory_id, movement_type, quantity, performed_by, reference_id, notes)
       VALUES ($1, 'WRITE_OFF', $2, $3, $4, $5)`,
      [inventoryId, qty, confirmedBy, id, `${verifiedCondition}: Verified by ${confirmerName}`]
    );
  }
  
  return {
    name: itemName,
    quantity: qty,
    verifiedCondition,
    reportedCondition,
    restocked: false,
    reason: 'Logged to damaged inventory'
  };
};

module.exports = { processVerifiedItem, processGoodItem, processDamagedItem };
