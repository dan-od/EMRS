/**
 * Purchasing Queue Controller - V2 with Tab Support
 * Handles disbursement, returns, and tab-filtered queue
 */
const purchasingService = require('../services/purchasing.service');
const { logActivity, ACTIONS, ENTITY_TYPES } = require('../../../utils/activityLogger');
const logger = require('../../../utils/logger');

// Helper to log purchasing actions
const logPurchasingAction = async (req, action, item, extraDetails = {}) => {
  try {
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      department: req.user.department,
      action,
      entityType: ENTITY_TYPES.JOB || 'JOB',
      entityId: item.job_id,
      entityName: item.job_number,
      details: {
        itemId: item.id,
        equipmentName: item.equipment_name || item.client_equipment_name || item.requested_item_name,
        serialNumber: item.serial_number,
        quantity: item.quantity,
        source: item.source,
        ...extraDetails
      },
      req
    });
  } catch (err) {
    logger.error('Activity log error', { message: err.message });
  }
};

/**
 * Get queue with tab filtering + counts for all tabs
 */
const getQueue = async (req, res, next) => {
  try {
    const tab = req.query.tab || 'pending_disburse';
    const [items, counts] = await Promise.all([
      purchasingService.getQueueByTab(tab),
      purchasingService.getTabCounts()
    ]);
    res.json({ items, counts });
  } catch (error) { next(error); }
};

/**
 * Get queue statistics for dashboard header
 */
const getQueueStats = async (req, res, next) => {
  try {
    const stats = await purchasingService.getQueueStats();
    res.json({ stats });
  } catch (error) { next(error); }
};

/**
 * Disburse an inventory item
 */
const disburseItem = async (req, res, next) => {
  try {
    const item = await purchasingService.getItemById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const updated = await purchasingService.disburseItem(
      req.params.itemId, 
      req.user.id, 
      req.body.notes
    );

    await logPurchasingAction(req, ACTIONS.DISBURSEMENT_COMPLETED || 'DISBURSEMENT_COMPLETED', {
      ...item,
      ...updated
    }, { disbursementNotes: req.body.notes });

    res.json({ item: updated, message: 'Item disbursed successfully' });
  } catch (error) { next(error); }
};

/**
 * Accept item return
 */
const acceptReturn = async (req, res, next) => {
  try {
    const item = await purchasingService.getItemById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const { condition, hours_used, notes } = req.body;
    const updated = await purchasingService.acceptReturn(
      req.params.itemId, req.user.id, condition, hours_used, notes
    );

    await logPurchasingAction(req, ACTIONS.RETURN_CONFIRMED || 'RETURN_CONFIRMED', {
      ...item,
      ...updated
    }, { returnCondition: condition, hoursUsed: hours_used });

    res.json({ item: updated, message: 'Return accepted successfully' });
  } catch (error) { next(error); }
};

/**
 * Mark repair complete from queue
 */
const markRepairComplete = async (req, res, next) => {
  try {
    const inspectionService = require('../services/inspection.service');
    const item = await purchasingService.getItemById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const updated = await inspectionService.markRepairComplete(
      req.params.itemId, req.user.id, req.body.notes
    );

    await logPurchasingAction(req, 'REPAIR_COMPLETED', item, { repairNotes: req.body.notes });

    res.json({ item: updated, message: 'Repair complete. Ready for re-inspection.' });
  } catch (error) { next(error); }
};

/**
 * Get items under repair (for /repairs route)
 */
const getItemsUnderRepair = async (req, res, next) => {
  try {
    const items = await purchasingService.getQueueByTab('in_repair');
    res.json({ items });
  } catch (error) { next(error); }
};

module.exports = {
  getQueue,
  getQueueStats,
  disburseItem,
  acceptReturn,
  markRepairComplete,
  markRepairCompleteFromQueue: markRepairComplete,  // Alias for routes
  getItemsUnderRepair,
  // Keep old name for backwards compatibility
  getFullQueue: getQueue
};
