/**
 * Material/Tool Controller
 * Handles: batch requests, inventory linking, disbursement, returns
 */
const materialService = require('../services/material.service');

// Add batch material requests
const addMaterialRequests = async (req, res, next) => {
  try {
    const jobId = req.params.id || req.params.jobId;
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required' });
    }
    
    // Validate each item
    for (const item of items) {
      if (!item.name || item.name.trim() === '') {
        return res.status(400).json({ message: 'Each item must have a name' });
      }
      if (!item.quantity || item.quantity < 1) {
        return res.status(400).json({ message: 'Each item must have a quantity >= 1' });
      }
    }
    
    const user = {
      id: req.user.id,
      role: req.user.role,
      jobRole: req.body.jobRole, // Team role on this job
      firstName: req.user.first_name,
      lastName: req.user.last_name
    };
    
    const results = await materialService.addMaterialRequests(jobId, items, user);
    res.status(201).json({ 
      message: `${results.length} material request(s) created`,
      items: results 
    });
  } catch (err) {
    next(err);
  }
};

// Search inventory for linking
const searchInventory = async (req, res, next) => {
  try {
    const { q } = req.query;
    const results = await materialService.searchInventory(q);
    res.json(results);
  } catch (err) {
    next(err);
  }
};

// Link material request to inventory and disburse
const linkAndDisburse = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { inventoryId, quantity, isConsumable, expectedReturnDate, notes } = req.body;
    
    if (!inventoryId) {
      return res.status(400).json({ message: 'Inventory ID is required' });
    }
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be >= 1' });
    }
    
    const user = {
      id: req.user.id,
      role: req.user.role,
      firstName: req.user.first_name,
      lastName: req.user.last_name
    };
    
    const result = await materialService.linkAndDisburse(itemId, {
      inventoryId, quantity, isConsumable, expectedReturnDate, notes
    }, user);
    
    res.json({
      message: 'Material linked and disbursed successfully',
      item: result
    });
  } catch (err) {
    if (err.message.includes('Insufficient stock')) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

// Partial fulfillment - disburse some, source the rest
const partialFulfillment = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { 
      inventoryId, disburseQuantity, sourceRemaining, 
      isConsumable, expectedReturnDate, notes 
    } = req.body;
    
    if (!inventoryId) {
      return res.status(400).json({ message: 'Inventory ID is required' });
    }
    if (!disburseQuantity || disburseQuantity < 1) {
      return res.status(400).json({ message: 'Disburse quantity must be >= 1' });
    }
    
    const user = {
      id: req.user.id,
      role: req.user.role,
      firstName: req.user.first_name,
      lastName: req.user.last_name
    };
    
    const result = await materialService.partialFulfillment(itemId, {
      inventoryId, disburseQuantity, sourceRemaining,
      isConsumable, expectedReturnDate, notes
    }, user);
    
    res.json({
      message: `Partially fulfilled: ${result.disbursedQuantity} disbursed${result.newItem ? `, ${result.remainingQuantity} to be sourced` : ''}`,
      ...result
    });
  } catch (err) {
    if (err.message.includes('Insufficient stock') || err.message.includes('exceeds')) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

// Return material to inventory
const returnMaterial = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { condition, returnQuantity, notes } = req.body;
    
    if (!condition) {
      return res.status(400).json({ message: 'Return condition is required' });
    }
    
    const user = {
      id: req.user.id,
      role: req.user.role,
      firstName: req.user.first_name,
      lastName: req.user.last_name
    };
    
    const result = await materialService.returnMaterial(itemId, {
      condition, returnQuantity, notes
    }, user);
    
    res.json({
      message: 'Material returned to inventory',
      item: result
    });
  } catch (err) {
    if (err.message.includes('Consumable') || err.message.includes('not linked')) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

// Mark as consumed
const markAsConsumed = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { notes } = req.body;
    
    const user = {
      id: req.user.id,
      role: req.user.role,
      firstName: req.user.first_name,
      lastName: req.user.last_name
    };
    
    const result = await materialService.markAsConsumed(itemId, user, notes);
    
    res.json({
      message: 'Item marked as consumed',
      item: result
    });
  } catch (err) {
    next(err);
  }
};

// Get job inventory transactions
const getJobTransactions = async (req, res, next) => {
  try {
    const jobId = req.params.id || req.params.jobId;
    const transactions = await materialService.getJobTransactions(jobId);
    res.json(transactions);
  } catch (err) {
    next(err);
  }
};

// Get inventory transaction history
const getInventoryHistory = async (req, res, next) => {
  try {
    const { inventoryId } = req.params;
    const history = await materialService.getInventoryHistory(inventoryId);
    res.json(history);
  } catch (err) {
    next(err);
  }
};

// Get materials in purchasing queue
const getMaterialsInQueue = async (req, res, next) => {
  try {
    const items = await materialService.getMaterialsInQueue();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// Get items needing return
const getItemsNeedingReturn = async (req, res, next) => {
  try {
    const items = await materialService.getItemsNeedingReturn();
    res.json(items);
  } catch (err) {
    next(err);
  }
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
