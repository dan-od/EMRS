/**
 * Material/Tool Service
 * Handles: batch requests, inventory linking, partial fulfillment, transaction logging
 */
const { query, transaction } = require('../../../config/db');
const materialQueries = require('../queries/material.queries');
const equipmentQueries = require('../queries/equipment.queries');
const logger = require('../../../utils/logger');

// Activity logging
let logActivity = async () => {};
try {
  const { logActivity: log } = require('../../../utils/activityLogger');
  logActivity = log;
} catch (e) {
  logger.warn('Activity logging not available');
}

// ============================================
// BATCH ADD MATERIAL REQUESTS
// ============================================
const addMaterialRequests = async (jobId, items, user) => {
  const results = [];
  
  for (const item of items) {
    const initialStatus = ['CHIEF_OPERATOR', 'DAQ'].includes(user.jobRole) 
      ? 'PENDING_SUPERVISOR' 
      : 'REQUESTED';
    
    const result = await query(materialQueries.addMaterialRequest, [
      jobId,
      item.name,
      item.description || null,
      item.specs || null,
      item.quantity || 1,
      item.unit || 'pieces',
      item.priority || 'Medium',
      item.notes || null,
      user.id,
      user.role,
      item.reason || null,
      initialStatus
    ]);
    
    const newItem = result.rows[0];
    results.push(newItem);
    
    // Log activity
    await logActivity({
      userId: user.id,
      action: 'MATERIAL_REQUESTED',
      resourceType: 'job_equipment_item',
      resourceId: newItem.id,
      details: {
        jobId,
        itemName: item.name,
        quantity: item.quantity,
        unit: item.unit,
        priority: item.priority,
        status: initialStatus
      }
    });
  }
  
  return results;
};

// ============================================
// SEARCH INVENTORY FOR LINKING
// ============================================
const searchInventory = async (searchTerm) => {
  const result = await query(materialQueries.searchInventoryForLinking, [searchTerm || '']);
  return result.rows;
};

// ============================================
// LINK TO INVENTORY & DISBURSE
// ============================================
const linkAndDisburse = async (itemId, data, user) => {
  const { inventoryId, quantity, isConsumable, expectedReturnDate, notes } = data;
  
  return await transaction(async (client) => {
    // 1. Get the job item
    const itemResult = await client.query(
      `SELECT jei.*, j.job_number, j.id as job_id, j.end_date
       FROM job_equipment_items jei
       JOIN jobs j ON jei.job_id = j.id
       WHERE jei.id = $1`,
      [itemId]
    );
    const item = itemResult.rows[0];
    if (!item) throw new Error('Item not found');
    
    // 2. Get and validate inventory
    const invResult = await client.query(materialQueries.getInventoryForDeduction, [inventoryId]);
    const inventory = invResult.rows[0];
    if (!inventory) throw new Error('Inventory item not found');
    if (inventory.quantity < quantity) {
      throw new Error(`Insufficient stock. Available: ${inventory.quantity}, Requested: ${quantity}`);
    }
    
    // 3. Link item to inventory
    await client.query(materialQueries.linkToInventory, [itemId, inventoryId, user.id]);
    
    // 4. Deduct from inventory
    const previousQty = inventory.quantity;
    const deductResult = await client.query(materialQueries.deductInventory, [inventoryId, quantity]);
    if (!deductResult.rows[0]) {
      throw new Error('Failed to deduct inventory - insufficient stock');
    }
    const newQty = deductResult.rows[0].quantity;
    
    // 5. Calculate return date (use job end date if not consumable and no date specified)
    const returnDate = isConsumable ? null : (expectedReturnDate || item.end_date);
    
    // 6. Disburse the item
    const disburseResult = await client.query(materialQueries.disburseMaterial, [
      itemId, user.id, isConsumable, returnDate, quantity, notes
    ]);
    
    // 7. Log inventory transaction
    await client.query(materialQueries.logInventoryTransaction, [
      inventoryId,
      item.job_id,
      itemId,
      'DISBURSED',
      -quantity,
      previousQty,
      newQty,
      user.id,
      `${user.firstName} ${user.lastName}`,
      `Disbursed to ${item.job_number}${isConsumable ? ' (consumable)' : ''}`,
      item.job_number
    ]);
    
    // 8. Add equipment history
    await client.query(equipmentQueries.addHistory, [
      itemId, item.job_id, 'LINKED_AND_DISBURSED', item.status, 'DISBURSED',
      user.id, `${user.firstName} ${user.lastName}`, user.role, notes,
      JSON.stringify({
        inventoryId,
        inventoryName: inventory.name,
        quantity,
        previousStock: previousQty,
        newStock: newQty,
        isConsumable,
        expectedReturnDate: returnDate
      })
    ]);
    
    // 9. Log activity
    await logActivity({
      userId: user.id,
      action: 'INVENTORY_DISBURSED',
      resourceType: 'job_equipment_item',
      resourceId: itemId,
      details: {
        jobId: item.job_id,
        jobNumber: item.job_number,
        inventoryId,
        inventoryName: inventory.name,
        quantity,
        previousStock: previousQty,
        newStock: newQty,
        isConsumable
      }
    });
    
    return {
      ...disburseResult.rows[0],
      inventory_name: inventory.name,
      job_number: item.job_number
    };
  });
};

// ============================================
// PARTIAL FULFILLMENT (SPLIT ITEM)
// ============================================
const partialFulfillment = async (itemId, data, user) => {
  const { inventoryId, disburseQuantity, sourceRemaining, notes } = data;
  
  return await transaction(async (client) => {
    // 1. Get original item
    const itemResult = await client.query(
      `SELECT jei.*, j.job_number, j.id as job_id, j.end_date
       FROM job_equipment_items jei
       JOIN jobs j ON jei.job_id = j.id
       WHERE jei.id = $1`,
      [itemId]
    );
    const item = itemResult.rows[0];
    if (!item) throw new Error('Item not found');
    
    const originalQty = item.quantity;
    const remainingQty = originalQty - disburseQuantity;
    
    if (remainingQty < 0) throw new Error('Disburse quantity exceeds requested quantity');
    
    // 2. Get inventory
    const invResult = await client.query(materialQueries.getInventoryForDeduction, [inventoryId]);
    const inventory = invResult.rows[0];
    if (!inventory) throw new Error('Inventory item not found');
    if (inventory.quantity < disburseQuantity) {
      throw new Error(`Insufficient stock. Available: ${inventory.quantity}`);
    }
    
    // 3. Update original item quantity to disbursed amount
    await client.query(materialQueries.updateItemAfterSplit, [
      itemId, disburseQuantity, `Partially fulfilled: ${disburseQuantity} of ${originalQty}`
    ]);
    
    // 4. Link and disburse the original item
    await client.query(materialQueries.linkToInventory, [itemId, inventoryId, user.id]);
    
    const previousQty = inventory.quantity;
    await client.query(materialQueries.deductInventory, [inventoryId, disburseQuantity]);
    const newQty = previousQty - disburseQuantity;
    
    const returnDate = data.isConsumable ? null : (data.expectedReturnDate || item.end_date);
    
    const disburseResult = await client.query(materialQueries.disburseMaterial, [
      itemId, user.id, data.isConsumable || false, returnDate, disburseQuantity, notes
    ]);
    
    // 5. Log inventory transaction for disbursement
    await client.query(materialQueries.logInventoryTransaction, [
      inventoryId, item.job_id, itemId, 'DISBURSED', -disburseQuantity,
      previousQty, newQty, user.id, `${user.firstName} ${user.lastName}`,
      `Partial disbursement: ${disburseQuantity} of ${originalQty} to ${item.job_number}`,
      item.job_number
    ]);
    
    // 6. Create new item for remaining quantity if sourcing
    let newItem = null;
    if (sourceRemaining && remainingQty > 0) {
      const splitResult = await client.query(materialQueries.splitItemForPartial, [
        itemId, remainingQty, `Split from original request. Remaining ${remainingQty} to be sourced.`
      ]);
      newItem = splitResult.rows[0];
      
      // Log activity for split
      await logActivity({
        userId: user.id,
        action: 'INVENTORY_PARTIALLY_FULFILLED',
        resourceType: 'job_equipment_item',
        resourceId: itemId,
        details: {
          jobId: item.job_id,
          jobNumber: item.job_number,
          originalQuantity: originalQty,
          disbursedQuantity: disburseQuantity,
          remainingQuantity: remainingQty,
          newItemId: newItem?.id,
          sourceRemaining
        }
      });
    }
    
    // 7. Add equipment history
    await client.query(equipmentQueries.addHistory, [
      itemId, item.job_id, 'PARTIAL_FULFILLMENT', item.status, 'DISBURSED',
      user.id, `${user.firstName} ${user.lastName}`, user.role, notes,
      JSON.stringify({
        originalQuantity: originalQty,
        disbursedQuantity: disburseQuantity,
        remainingQuantity: remainingQty,
        newItemId: newItem?.id,
        sourceRemaining,
        inventoryName: inventory.name
      })
    ]);
    
    return {
      disbursedItem: disburseResult.rows[0],
      newItem,
      job_number: item.job_number,
      originalQuantity: originalQty,
      disbursedQuantity: disburseQuantity,
      remainingQuantity: remainingQty
    };
  });
};

// ============================================
// RETURN MATERIAL TO INVENTORY
// ============================================
const returnMaterial = async (itemId, data, user) => {
  const { condition, returnQuantity, notes } = data;
  
  return await transaction(async (client) => {
    // 1. Get the item
    const itemResult = await client.query(
      `SELECT jei.*, j.job_number, j.id as job_id, inv.name as inventory_name
       FROM job_equipment_items jei
       JOIN jobs j ON jei.job_id = j.id
       LEFT JOIN inventory inv ON jei.linked_inventory_id = inv.id
       WHERE jei.id = $1`,
      [itemId]
    );
    const item = itemResult.rows[0];
    if (!item) throw new Error('Item not found');
    if (item.is_consumable) throw new Error('Consumable items cannot be returned');
    if (!item.linked_inventory_id) throw new Error('Item not linked to inventory');
    
    const qty = returnQuantity || item.fulfilled_quantity || item.quantity;
    
    // 2. Restore inventory
    const invResult = await client.query(
      `SELECT quantity FROM inventory WHERE id = $1`,
      [item.linked_inventory_id]
    );
    const previousQty = invResult.rows[0]?.quantity || 0;
    
    await client.query(materialQueries.restoreInventory, [item.linked_inventory_id, qty]);
    const newQty = previousQty + qty;
    
    // 3. Update item status
    const returnResult = await client.query(materialQueries.returnMaterial, [
      itemId, user.id, condition, notes
    ]);
    
    // 4. Log inventory transaction
    await client.query(materialQueries.logInventoryTransaction, [
      item.linked_inventory_id, item.job_id, itemId, 'RETURNED', qty,
      previousQty, newQty, user.id, `${user.firstName} ${user.lastName}`,
      `Returned from ${item.job_number}. Condition: ${condition}`,
      item.job_number
    ]);
    
    // 5. Add equipment history
    await client.query(equipmentQueries.addHistory, [
      itemId, item.job_id, 'MATERIAL_RETURNED', 'DISBURSED', 'RETURNED',
      user.id, `${user.firstName} ${user.lastName}`, user.role, notes,
      JSON.stringify({
        inventoryId: item.linked_inventory_id,
        inventoryName: item.inventory_name,
        quantity: qty,
        condition,
        previousStock: previousQty,
        newStock: newQty
      })
    ]);
    
    // 6. Log activity
    await logActivity({
      userId: user.id,
      action: 'MATERIAL_RETURNED',
      resourceType: 'job_equipment_item',
      resourceId: itemId,
      details: {
        jobId: item.job_id,
        jobNumber: item.job_number,
        inventoryId: item.linked_inventory_id,
        inventoryName: item.inventory_name,
        quantity: qty,
        condition
      }
    });
    
    return {
      ...returnResult.rows[0],
      inventory_name: item.inventory_name,
      job_number: item.job_number,
      quantity_restored: qty
    };
  });
};

// ============================================
// MARK AS CONSUMED (NO RETURN)
// ============================================
const markAsConsumed = async (itemId, user, notes) => {
  return await transaction(async (client) => {
    const itemResult = await client.query(
      `SELECT jei.*, j.job_number, j.id as job_id, inv.name as inventory_name
       FROM job_equipment_items jei
       JOIN jobs j ON jei.job_id = j.id
       LEFT JOIN inventory inv ON jei.linked_inventory_id = inv.id
       WHERE jei.id = $1`,
      [itemId]
    );
    const item = itemResult.rows[0];
    if (!item) throw new Error('Item not found');
    
    // Update item status to consumed
    const result = await client.query(
      `UPDATE job_equipment_items SET
        status = 'CONSUMED', is_consumable = TRUE,
        return_notes = $2, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [itemId, notes]
    );
    
    // Log inventory transaction if linked
    if (item.linked_inventory_id) {
      await client.query(materialQueries.logInventoryTransaction, [
        item.linked_inventory_id, item.job_id, itemId, 'CONSUMED', 
        -(item.fulfilled_quantity || item.quantity), null, null,
        user.id, `${user.firstName} ${user.lastName}`,
        `Marked as consumed for ${item.job_number}`,
        item.job_number
      ]);
    }
    
    // Log activity
    await logActivity({
      userId: user.id,
      action: 'MATERIAL_CONSUMED',
      resourceType: 'job_equipment_item',
      resourceId: itemId,
      details: {
        jobId: item.job_id,
        jobNumber: item.job_number,
        itemName: item.requested_item_name,
        quantity: item.quantity
      }
    });
    
    return result.rows[0];
  });
};

// ============================================
// GET TRANSACTIONS
// ============================================
const getJobTransactions = async (jobId) => {
  const result = await query(materialQueries.getJobInventoryTransactions, [jobId]);
  return result.rows;
};

const getInventoryHistory = async (inventoryId) => {
  const result = await query(materialQueries.getInventoryTransactionHistory, [inventoryId]);
  return result.rows;
};

const getMaterialsInQueue = async () => {
  const result = await query(materialQueries.getMaterialsInQueue);
  return result.rows;
};

const getItemsNeedingReturn = async () => {
  const result = await query(materialQueries.getItemsNeedingReturn);
  return result.rows;
};

module.exports = {
  addMaterialRequests,
  searchInventory,
  linkAndDisburse,
  partialFulfillment,
  returnMaterial,
  markAsConsumed,
  getJobTransactions,
  getInventoryHistory,
  getMaterialsInQueue,
  getItemsNeedingReturn
};
