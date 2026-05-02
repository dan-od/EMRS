/**
 * Purchasing Service - V2 with Tab Filtering
 * Handles queue data fetching with tab support
 */
const { query } = require('../../../config/db');
const queries = require('../queries/purchasing.queries');

/**
 * Get queue items filtered by tab
 * @param {string} tab - Tab ID (pending_disburse, needs_sourcing, etc.)
 */
const getQueueByTab = async (tab = 'pending_disburse') => {
  // Handle special tabs that use different tables
  if (tab === 'swap_requests') {
    const result = await query(queries.getSwapRequests);
    return result.rows;
  }
  
  if (tab === 'active_requests') {
    const result = await query(queries.getActiveJobRequests);
    return result.rows;
  }
  
  // Regular equipment items tabs
  const sql = queries.getQueueByTab(tab);
  const result = await query(sql);
  return result.rows;
};

/**
 * Get counts for all tabs (for badges)
 */
const getTabCounts = async () => {
  const result = await query(queries.getTabCounts);
  const counts = result.rows[0] || {};
  
  // Get swap and active request counts separately
  const swapResult = await query(`SELECT COUNT(*) as count FROM swap_requests WHERE status NOT IN ('COMPLETED', 'REJECTED')`);
  const activeResult = await query(`SELECT COUNT(*) as count FROM additional_requests WHERE status NOT IN ('APPROVED', 'REJECTED')`);
  
  return {
    pending_disburse: parseInt(counts.pending_disburse) || 0,
    needs_sourcing: parseInt(counts.needs_sourcing) || 0,
    in_sourcing: parseInt(counts.in_sourcing) || 0,
    arrived: parseInt(counts.arrived) || 0,
    pending_inspection: parseInt(counts.pending_inspection) || 0,
    swap_requests: parseInt(swapResult.rows[0]?.count) || 0,
    active_requests: parseInt(activeResult.rows[0]?.count) || 0,
    in_repair: parseInt(counts.in_repair) || 0,
    pending_returns: parseInt(counts.pending_returns) || 0
  };
};

/**
 * Get queue statistics for dashboard header
 */
const getQueueStats = async () => {
  const result = await query(queries.getQueueStats);
  return result.rows[0] || {};
};

/**
 * Disburse an inventory item
 */
const disburseItem = async (itemId, userId, notes) => {
  const result = await query(queries.disburseItem, [itemId, userId, notes]);
  return result.rows[0];
};

/**
 * Accept item return
 */
const acceptReturn = async (itemId, userId, condition, hoursUsed, notes) => {
  const result = await query(queries.acceptReturn, [itemId, userId, condition, hoursUsed, notes]);
  return result.rows[0];
};

/**
 * Get single item by ID
 */
const getItemById = async (itemId) => {
  const result = await query(queries.getItemById, [itemId]);
  return result.rows[0];
};

module.exports = {
  getQueueByTab,
  getTabCounts,
  getQueueStats,
  disburseItem,
  acceptReturn,
  getItemById
};
