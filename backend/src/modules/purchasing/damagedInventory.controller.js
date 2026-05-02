/**
 * Damaged Inventory Controller
 * API endpoints for managing damaged/lost/incomplete items
 */

const damagedInventoryService = require('./damagedInventory.service');
const { logActivity } = require('../../utils/activityLogger');

/**
 * GET /api/purchasing/damaged-inventory
 * Get all damaged inventory items
 */
const getAll = async (req, res, next) => {
  try {
    const { status, condition, page = 1, limit = 50 } = req.query;
    
    const result = await damagedInventoryService.getAll({
      status,
      condition,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: result.items,
      pagination: {
        page: result.page,
        limit: parseInt(limit),
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/purchasing/damaged-inventory/stats
 * Get statistics
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await damagedInventoryService.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/purchasing/damaged-inventory/:id
 * Get single damaged item
 */
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await damagedInventoryService.getById(id);
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/purchasing/damaged-inventory/request/:requestId
 * Get damaged items for a specific request
 */
const getByRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const items = await damagedInventoryService.getByRequest(requestId);
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/purchasing/damaged-inventory/:id/status
 * Update status (resolve, write-off, etc.)
 */
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const validStatuses = ['Pending', 'Under_Review', 'Written_Off', 'Repaired', 'Replaced', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    const updated = await damagedInventoryService.updateStatus(id, {
      status,
      notes,
      resolvedBy: req.user.id
    });
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    
    await logActivity({
      userId: req.user.id,
      action: 'UPDATE',
      entityType: 'damaged_inventory',
      entityId: id,
      details: { status, notes, itemName: updated.item_name }
    });
    
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getStats,
  getById,
  getByRequest,
  updateStatus
};
