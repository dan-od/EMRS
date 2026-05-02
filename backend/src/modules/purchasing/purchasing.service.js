const { query, transaction } = require('../../config/db');
const queries = require('./purchasing.queries');
const logger = require('../../utils/logger');

// Import notifications service for low stock alerts
let notificationsService;
try {
  notificationsService = require('../notifications/notifications.service');
} catch (e) {
  logger.warn('Notifications service not available');
}

const getInventory = async (filters = {}) => {
  const { category, search, page = 1, limit = 50 } = filters;
  const offset = (page - 1) * limit;

  const [itemsResult, countResult] = await Promise.all([
    query(queries.findAllInventory, [category, search, limit, offset]),
    query(queries.countInventory, [category, search])
  ]);

  return {
    items: itemsResult.rows,
    total: parseInt(countResult.rows[0].total),
    page,
    totalPages: Math.ceil(countResult.rows[0].total / limit)
  };
};

const getInventoryById = async (id) => {
  const result = await query(queries.findInventoryById, [id]);
  return result.rows[0] || null;
};

const getLowStock = async () => {
  const result = await query(queries.findLowStock);
  return result.rows;
};

const createInventoryItem = async (data) => {
  const { name, category, quantity, unit, reorderLevel, location } = data;
  const result = await query(queries.createInventoryItem, [
    name, category, quantity || 0, unit, reorderLevel || 10, location
  ]);
  return result.rows[0];
};

const updateInventoryItem = async (id, data) => {
  const { name, category, unit, reorderLevel, location } = data;
  const result = await query(queries.updateInventoryItem, [
    id, name, category, unit, reorderLevel, location
  ]);
  return result.rows[0];
};

const addStock = async (id, quantity, performedBy, notes) => {
  return await transaction(async (client) => {
    const result = await client.query(queries.updateInventoryQuantity, [id, quantity]);
    await client.query(queries.logStockMovement, [
      id, 'IN', quantity, performedBy, null, notes
    ]);
    return result.rows[0];
  });
};

const getDisbursements = async (filters = {}) => {
  const { status, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;
  const result = await query(queries.findAllDisbursements, [status, limit, offset]);
  return result.rows;
};

const getPendingDisbursements = async () => {
  const result = await query(queries.findPendingDisbursements);
  return result.rows;
};

const createDisbursement = async (data) => {
  const { requesterId, inventoryId, quantity, purpose, requestId } = data;
  const result = await query(queries.createDisbursement, [
    requesterId, inventoryId, quantity, purpose, requestId
  ]);
  return result.rows[0];
};

const approveDisbursement = async (id, approvedBy) => {
  return await transaction(async (client) => {
    const disbursement = await client.query(
      'SELECT * FROM disbursements WHERE id = $1', [id]
    );
    if (!disbursement.rows[0]) throw new Error('Disbursement not found');
    
    const { inventory_id, quantity } = disbursement.rows[0];
    
    // Deduct from inventory
    await client.query(queries.updateInventoryQuantity, [inventory_id, -quantity]);
    
    // Update disbursement status
    const result = await client.query(queries.updateDisbursementStatus, [
      id, 'Approved', approvedBy, null
    ]);
    
    // Log stock movement
    await client.query(queries.logStockMovement, [
      inventory_id, 'OUT', quantity, approvedBy, id, 'Disbursement approved'
    ]);
    
    return result.rows[0];
  });
};

const rejectDisbursement = async (id, rejectedBy, reason) => {
  const result = await query(queries.updateDisbursementStatus, [
    id, 'Rejected', rejectedBy, reason
  ]);
  return result.rows[0];
};

const getStockMovements = async (inventoryId) => {
  const result = await query(queries.getStockMovements, [inventoryId]);
  return result.rows;
};

const getStats = async () => {
  const result = await query(queries.getStats);
  return result.rows[0];
};

// =====================================================
// INVENTORY INTEGRATION FOR REQUESTS
// =====================================================

/**
 * Check if item is low stock and send notification
 */
const checkAndNotifyLowStock = async (inventoryItem) => {
  if (!notificationsService) return;
  
  try {
    if (inventoryItem.quantity <= inventoryItem.reorder_level) {
      // Notify all purchasing users about low stock
      await notificationsService.notifyPurchasing({
        type: 'LOW_STOCK_ALERT',
        title: '⚠️ Low Stock Alert',
        message: `${inventoryItem.name} is low on stock: ${inventoryItem.quantity} ${inventoryItem.unit || 'units'} remaining (reorder level: ${inventoryItem.reorder_level})`,
        referenceType: 'inventory',
        referenceId: inventoryItem.id,
        priority: inventoryItem.quantity === 0 ? 'high' : 'normal'
      });
    }
  } catch (err) {
    logger.error('Failed to send low stock notification', { message: err.message });
  }
};

/**
 * Decrease stock when disbursing items
 * Called from requests.service.js when disburse() is executed
 * Returns the updated item with details for logging
 */
const decreaseStock = async (inventoryId, quantity, { performedBy, referenceId, notes }) => {
  return await transaction(async (client) => {
    // Get current item with all details
    const current = await client.query(
      'SELECT id, name, quantity, unit, reorder_level, category FROM inventory WHERE id = $1', 
      [inventoryId]
    );
    
    if (!current.rows[0]) throw new Error('Inventory item not found');
    const item = current.rows[0];
    
    if (item.quantity < quantity) {
      throw new Error(`Insufficient stock for ${item.name}. Available: ${item.quantity}`);
    }
    
    // Update inventory quantity (negative to decrease)
    const result = await client.query(queries.updateInventoryQuantity, [inventoryId, -quantity]);
    const updatedItem = result.rows[0];
    
    // Log movement
    await client.query(queries.logStockMovement, [
      inventoryId, 'OUT', quantity, performedBy, referenceId, notes
    ]);
    
    // Check for low stock and notify
    await checkAndNotifyLowStock({
      ...updatedItem,
      reorder_level: item.reorder_level,
      unit: item.unit,
      name: item.name
    });
    
    // Return enriched item for better logging
    return {
      ...updatedItem,
      name: item.name,
      unit: item.unit,
      category: item.category,
      quantityBefore: item.quantity,
      quantityAfter: updatedItem.quantity,
      quantityDeducted: quantity
    };
  });
};

/**
 * Return stock when items are returned in good condition
 * Called from requests.service.js when confirmReturn() is executed
 */
const returnStock = async (inventoryId, quantity, { performedBy, referenceId, notes, condition }) => {
  return await transaction(async (client) => {
    // Get item details
    const current = await client.query(
      'SELECT id, name, quantity, unit, category FROM inventory WHERE id = $1', 
      [inventoryId]
    );
    const item = current.rows[0];
    
    // Only return to stock if condition is Good
    if (condition === 'Good') {
      const result = await client.query(queries.updateInventoryQuantity, [inventoryId, quantity]);
      
      await client.query(queries.logStockMovement, [
        inventoryId, 'RETURN', quantity, performedBy, referenceId, notes
      ]);
      
      return {
        ...result.rows[0],
        name: item?.name,
        unit: item?.unit,
        quantityReturned: quantity
      };
    }
    
    // For Damaged/Lost, just log the movement without adding back to stock
    await client.query(queries.logStockMovement, [
      inventoryId, 'WRITE_OFF', quantity, performedBy, referenceId, 
      `${condition}: ${notes || 'No notes'}`
    ]);
    
    return {
      name: item?.name,
      unit: item?.unit,
      quantityWrittenOff: quantity,
      condition
    };
  });
};

/**
 * Find inventory item by name (for linking requests to inventory)
 */
const findInventoryByName = async (name) => {
  const result = await query(
    'SELECT * FROM inventory WHERE LOWER(name) = LOWER($1) LIMIT 1',
    [name]
  );
  return result.rows[0] || null;
};

/**
 * Find inventory item by name OR alias (for auto-matching)
 */
const findInventoryByNameOrAlias = async (name) => {
  const result = await query(queries.findByAlias, [name]);
  return result.rows[0] || null;
};

/**
 * Add an alias mapping for an inventory item
 */
const addAlias = async (inventoryId, alias) => {
  const result = await query(queries.addAlias, [inventoryId, alias.trim()]);
  return result.rows[0] || null;
};

/**
 * Get all aliases for an inventory item
 */
const getAliases = async (inventoryId) => {
  const result = await query(queries.getAliases, [inventoryId]);
  return result.rows.map(r => r.alias);
};

module.exports = {
  getInventory, getInventoryById, getLowStock, createInventoryItem, updateInventoryItem, addStock,
  getDisbursements, getPendingDisbursements, createDisbursement, approveDisbursement, rejectDisbursement,
  getStockMovements, getStats,
  // Inventory integration functions
  decreaseStock, returnStock, findInventoryByName, findInventoryByNameOrAlias,
  // Alias functions
  addAlias, getAliases
};
