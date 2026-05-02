/**
 * Jobs Service - Equipment Items (Enhanced)
 * Supports: item_type, sourcing workflow, approval flow, comprehensive logging
 */
const { query, transaction } = require('../../../config/db');
const queries = require('../queries');
const logger = require('../../../utils/logger');

// Activity logging
let logActivity = async () => {};
try {
  const { logActivity: log } = require('../../../utils/activityLogger');
  logActivity = log;
} catch (e) {
  logger.warn('Activity logging not available');
}

const getEquipmentItems = async (jobId) => {
  const result = await query(queries.equipment.getByJobId, [jobId]);
  return result.rows;
};

const addInventoryItem = async (jobId, data, user) => {
  const result = await query(queries.equipment.addInventory, [
    jobId, data.equipment_id, data.quantity || 1, data.priority || 'Medium', 
    data.notes || null, user.id,
    data.item_type || 'EQUIPMENT',
    user.id, user.role, data.reason || null
  ]);
  return result.rows[0];
};

const addClientItem = async (jobId, data, user) => {
  const result = await query(queries.equipment.addClient, [
    jobId, data.client_equipment_name, data.client_equipment_description,
    data.quantity || 1, data.priority || 'Medium', data.notes || null, 
    user.id, data.item_type || 'EQUIPMENT'
  ]);
  return result.rows[0];
};

const addNewRequest = async (jobId, data, user) => {
  // Chief Operator and DAQ need supervisor approval first
  const needsSupervisorApproval = ['CHIEF_OPERATOR', 'DAQ'].includes(user.jobRole);
  const initialStatus = needsSupervisorApproval ? 'PENDING_SUPERVISOR' : 'REQUESTED';
  
  const result = await query(queries.equipment.addNewRequest, [
    jobId, data.requested_item_name, data.requested_item_description,
    data.requested_item_specs, data.quantity || 1, data.priority || 'Medium', 
    data.notes || null, user.id,
    data.item_type || 'EQUIPMENT',
    user.id, user.role, data.reason || null, initialStatus
  ]);
  return result.rows[0];
};

const updateItem = async (itemId, data) => {
  const result = await query(queries.equipment.update, [
    itemId, data.quantity, data.priority, data.notes, data.item_type
  ]);
  return result.rows[0];
};

const removeItem = async (itemId) => {
  const result = await query(queries.equipment.remove, [itemId]);
  return result.rows[0];
};

// ============================================
// DISBURSEMENT
// ============================================
const disburseItem = async (itemId, disbursedBy, notes) => {
  return await transaction(async (client) => {
    // Get item details first
    const itemResult = await client.query(
      `SELECT jei.*, j.job_number, e.name as equipment_name, e.serial_number, e.quantity as stock_qty
       FROM job_equipment_items jei
       JOIN jobs j ON jei.job_id = j.id
       LEFT JOIN equipment e ON jei.equipment_id = e.id
       WHERE jei.id = $1`, [itemId]
    );
    const item = itemResult.rows[0];
    if (!item) throw new Error('Item not found');
    
    // Deduct from inventory if INVENTORY source
    if (item.source === 'INVENTORY' && item.equipment_id) {
      await client.query(
        'UPDATE equipment SET quantity = quantity - $1, updated_at = NOW() WHERE id = $2',
        [item.quantity || 1, item.equipment_id]
      );
      
      // Record stock movement
      await client.query(
        `INSERT INTO stock_movements (inventory_id, movement_type, quantity, performed_by, reference_id, notes)
         VALUES ($1, 'DISBURSE', $2, $3, $4, $5)`,
        [item.equipment_id, -(item.quantity || 1), disbursedBy, item.job_id, 
         `Disbursed for job ${item.job_number}`]
      );
    }
    
    // Update item status
    const result = await client.query(queries.equipment.disburse, [itemId, disbursedBy, notes]);
    
    // Add history record
    await client.query(queries.equipment.addHistory, [
      itemId, item.job_id, 'DISBURSED', item.status, 'DISBURSED',
      disbursedBy, null, null, notes, JSON.stringify({
        equipmentName: item.equipment_name,
        serialNumber: item.serial_number,
        quantity: item.quantity,
        stockBefore: item.stock_qty,
        stockAfter: (item.stock_qty || 0) - (item.quantity || 1)
      })
    ]);
    
    // Log activity
    try {
      await logActivity({
        userId: disbursedBy,
        action: 'EQUIPMENT_DISBURSED',
        resourceType: 'job_equipment_item',
        resourceId: itemId,
        details: {
          jobId: item.job_id,
          jobNumber: item.job_number,
          equipmentName: item.equipment_name || item.requested_item_name || item.client_equipment_name,
          serialNumber: item.serial_number,
          quantity: item.quantity,
          source: item.source
        }
      });
    } catch (err) {
      logger.error('Failed to log activity', { message: err.message });
    }
    
    return { ...result.rows[0], job_number: item.job_number };
  });
};

// ============================================
// SOURCING WORKFLOW
// ============================================
const startSourcing = async (itemId, userId, notes, estimatedArrival) => {
  return await transaction(async (client) => {
    const itemResult = await client.query(
      `SELECT jei.*, j.job_number FROM job_equipment_items jei
       JOIN jobs j ON jei.job_id = j.id WHERE jei.id = $1`, [itemId]
    );
    const item = itemResult.rows[0];
    if (!item) throw new Error('Item not found');
    
    const result = await client.query(queries.equipment.startSourcing, [
      itemId, userId, notes, estimatedArrival
    ]);
    
    await client.query(queries.equipment.addHistory, [
      itemId, item.job_id, 'SOURCING_STARTED', item.status, 'SOURCING',
      userId, null, null, notes, JSON.stringify({
        itemName: item.requested_item_name,
        estimatedArrival, quantity: item.quantity
      })
    ]);
    
    // Log activity
    try {
      await logActivity({
        userId,
        action: 'EQUIPMENT_SOURCING_STARTED',
        resourceType: 'job_equipment_item',
        resourceId: itemId,
        details: {
          jobId: item.job_id,
          jobNumber: item.job_number,
          itemName: item.requested_item_name || item.client_equipment_name,
          quantity: item.quantity,
          estimatedArrival
        }
      });
    } catch (err) {
      logger.error('Failed to log activity', { message: err.message });
    }
    
    return { ...result.rows[0], job_number: item.job_number };
  });
};

const itemArrived = async (itemId, userId, data) => {
  return await transaction(async (client) => {
    const itemResult = await client.query(
      `SELECT jei.*, j.job_number FROM job_equipment_items jei
       JOIN jobs j ON jei.job_id = j.id WHERE jei.id = $1`, [itemId]
    );
    const item = itemResult.rows[0];
    if (!item) throw new Error('Item not found');
    
    const result = await client.query(queries.equipment.itemArrived, [
      itemId, userId, data.linked_inventory_id || null,
      data.vendor_name, data.purchase_order_number, data.procurement_cost
    ]);
    
    await client.query(queries.equipment.addHistory, [
      itemId, item.job_id, 'ARRIVED', 'SOURCING', 'ARRIVED',
      userId, null, null, null, JSON.stringify({
        itemName: item.requested_item_name,
        linkedInventoryId: data.linked_inventory_id,
        vendor: data.vendor_name,
        poNumber: data.purchase_order_number,
        cost: data.procurement_cost,
        sourcingDuration: item.sourcing_started_at ? 
          Math.ceil((Date.now() - new Date(item.sourcing_started_at)) / (1000 * 60 * 60 * 24)) + ' days' : null
      })
    ]);
    
    // Log activity
    try {
      await logActivity({
        userId,
        action: 'EQUIPMENT_ARRIVED',
        resourceType: 'job_equipment_item',
        resourceId: itemId,
        details: {
          jobId: item.job_id,
          jobNumber: item.job_number,
          itemName: item.requested_item_name || item.client_equipment_name,
          vendor: data.vendor_name,
          poNumber: data.purchase_order_number,
          cost: data.procurement_cost,
          addedToInventory: !!data.linked_inventory_id
        }
      });
    } catch (err) {
      logger.error('Failed to log activity', { message: err.message });
    }
    
    return { ...result.rows[0], job_number: item.job_number };
  });
};

const disburseArrived = async (itemId, userId, notes) => {
  return await transaction(async (client) => {
    // Get item details for logging
    const itemResult = await client.query(
      `SELECT jei.*, j.job_number FROM job_equipment_items jei
       JOIN jobs j ON jei.job_id = j.id WHERE jei.id = $1`, [itemId]
    );
    const item = itemResult.rows[0];
    
    const result = await query(queries.equipment.disburseArrived, [itemId, userId, notes]);
    
    // Log activity
    if (item) {
      try {
        await logActivity({
          userId,
          action: 'ARRIVED_EQUIPMENT_DISBURSED',
          resourceType: 'job_equipment_item',
          resourceId: itemId,
          details: {
            jobId: item.job_id,
            jobNumber: item.job_number,
            itemName: item.requested_item_name || item.client_equipment_name,
            quantity: item.quantity
          }
        });
      } catch (err) {
        logger.error('Failed to log activity', { message: err.message });
      }
    }
    
    return result.rows[0];
  });
};

// ============================================
// SUPERVISOR APPROVAL
// ============================================
const supervisorApprove = async (itemId, supervisorId, notes) => {
  return await transaction(async (client) => {
    const itemResult = await client.query(
      `SELECT jei.*, j.job_number FROM job_equipment_items jei
       JOIN jobs j ON jei.job_id = j.id WHERE jei.id = $1`, [itemId]
    );
    const item = itemResult.rows[0];
    if (!item) throw new Error('Item not found');
    
    const result = await client.query(queries.equipment.supervisorApprove, [
      itemId, supervisorId, notes
    ]);
    
    await client.query(queries.equipment.addHistory, [
      itemId, item.job_id, 'SUPERVISOR_APPROVED', 'PENDING_SUPERVISOR', 'APPROVED',
      supervisorId, null, 'SUPERVISOR', notes, JSON.stringify({
        itemName: item.requested_item_name || item.client_equipment_name,
        requestedBy: item.requested_by
      })
    ]);
    
    return result.rows[0];
  });
};

const supervisorReject = async (itemId, supervisorId, reason) => {
  return await transaction(async (client) => {
    const itemResult = await client.query(
      `SELECT jei.*, j.job_number FROM job_equipment_items jei
       JOIN jobs j ON jei.job_id = j.id WHERE jei.id = $1`, [itemId]
    );
    const item = itemResult.rows[0];
    
    const result = await client.query(queries.equipment.supervisorReject, [itemId, reason]);
    
    await client.query(queries.equipment.addHistory, [
      itemId, item.job_id, 'SUPERVISOR_REJECTED', 'PENDING_SUPERVISOR', 'SUPERVISOR_REJECTED',
      supervisorId, null, 'SUPERVISOR', reason, JSON.stringify({
        itemName: item.requested_item_name,
        requestedBy: item.requested_by
      })
    ]);
    
    return result.rows[0];
  });
};

// ============================================
// RETURN
// ============================================
const returnItem = async (itemId, status, returnedBy, condition, hoursUsed) => {
  return await transaction(async (client) => {
    // Get item details for logging
    const itemResult = await client.query(
      `SELECT jei.*, j.job_number, e.name as equipment_name, e.quantity as current_stock
       FROM job_equipment_items jei
       JOIN jobs j ON jei.job_id = j.id
       LEFT JOIN equipment e ON jei.equipment_id = e.id
       WHERE jei.id = $1`, [itemId]
    );
    const item = itemResult.rows[0];
    
    const result = await client.query(queries.equipment.returnItem, [
      itemId, status, returnedBy, condition, hoursUsed
    ]);
    
    // Restore to inventory if INVENTORY source
    if (item && item.source === 'INVENTORY' && item.equipment_id && status === 'RETURNED') {
      await client.query(
        'UPDATE equipment SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2',
        [item.quantity || 1, item.equipment_id]
      );
      
      // Record stock movement
      await client.query(
        `INSERT INTO stock_movements (inventory_id, movement_type, quantity, performed_by, reference_id, notes)
         VALUES ($1, 'RETURN', $2, $3, $4, $5)`,
        [item.equipment_id, item.quantity || 1, returnedBy, item.job_id, 
         `Returned from job ${item.job_number}. Condition: ${condition}`]
      );
    }
    
    // Log activity
    if (item) {
      try {
        await logActivity({
          userId: returnedBy,
          action: 'EQUIPMENT_RETURNED',
          resourceType: 'job_equipment_item',
          resourceId: itemId,
          details: {
            jobId: item.job_id,
            jobNumber: item.job_number,
            equipmentName: item.equipment_name || item.requested_item_name,
            quantity: item.quantity,
            condition,
            hoursUsed,
            restoredToInventory: item.source === 'INVENTORY'
          }
        });
      } catch (err) {
        logger.error('Failed to log activity', { message: err.message });
      }
    }
    
    return result.rows[0];
  });
};

// ============================================
// PURCHASING QUEUE
// ============================================
const getPurchasingQueue = async () => {
  const result = await query(queries.equipment.getPurchasingQueue);
  return result.rows;
};

const getPurchasingStats = async () => {
  const result = await query(queries.equipment.getPurchasingStats);
  return result.rows[0];
};

const getItemHistory = async (itemId) => {
  const result = await query(queries.equipment.getHistory, [itemId]);
  return result.rows;
};

// ============================================
// MANAGER APPROVAL FOR ADDITIONAL REQUESTS
// ============================================
const getPendingManagerApproval = async () => {
  const result = await query(queries.equipment.getPendingManagerApproval);
  return result.rows;
};

const managerApproveRequest = async (itemId, managerId, notes) => {
  const result = await query(queries.equipment.managerApproveRequest, [itemId, managerId, notes]);
  return result.rows[0];
};

const managerRejectRequest = async (itemId, managerId, reason) => {
  const result = await query(queries.equipment.managerRejectRequest, [itemId, managerId, reason]);
  return result.rows[0];
};

module.exports = {
  getEquipmentItems, addInventoryItem, addClientItem, addNewRequest,
  updateItem, removeItem, 
  disburseItem, startSourcing, itemArrived, disburseArrived,
  supervisorApprove, supervisorReject, returnItem,
  getPurchasingQueue, getPurchasingStats, getItemHistory,
  getPendingManagerApproval, managerApproveRequest, managerRejectRequest
};
