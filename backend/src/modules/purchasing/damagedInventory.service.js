/**
 * Damaged Inventory Service
 * Tracks items returned as Damaged, Lost, or Incomplete
 */

const { query, transaction } = require('../../config/db');

const queries = {
  create: `
    INSERT INTO damaged_inventory 
    (request_id, inventory_id, item_name, quantity, unit, category, condition, reason, 
     reported_by, reported_by_name, confirmed_by, confirmed_by_name)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *
  `,
  
  findAll: `
    SELECT 
      di.*,
      r.type as request_type,
      inv.name as inventory_name,
      inv.location as inventory_location
    FROM damaged_inventory di
    LEFT JOIN requests r ON di.request_id = r.id
    LEFT JOIN inventory inv ON di.inventory_id = inv.id
    WHERE ($1::text IS NULL OR di.status = $1)
      AND ($2::text IS NULL OR di.condition = $2)
    ORDER BY di.created_at DESC
    LIMIT $3 OFFSET $4
  `,
  
  countAll: `
    SELECT COUNT(*) as total FROM damaged_inventory
    WHERE ($1::text IS NULL OR status = $1)
      AND ($2::text IS NULL OR condition = $2)
  `,
  
  findById: `
    SELECT 
      di.*,
      r.type as request_type,
      r.requester_name,
      inv.name as inventory_name,
      inv.location as inventory_location
    FROM damaged_inventory di
    LEFT JOIN requests r ON di.request_id = r.id
    LEFT JOIN inventory inv ON di.inventory_id = inv.id
    WHERE di.id = $1
  `,
  
  findByRequest: `
    SELECT * FROM damaged_inventory WHERE request_id = $1 ORDER BY created_at DESC
  `,
  
  updateStatus: `
    UPDATE damaged_inventory 
    SET status = $2, resolution_notes = $3, resolved_by = $4, resolved_at = NOW(), updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `,
  
  getStats: `
    SELECT 
      COUNT(*) FILTER (WHERE status = 'Pending_Verification') as pending_verification,
      COUNT(*) FILTER (WHERE status = 'Pending') as pending,
      COUNT(*) FILTER (WHERE status = 'Under_Review') as under_review,
      COUNT(*) FILTER (WHERE status = 'Verified') as verified,
      COUNT(*) FILTER (WHERE condition = 'Damaged') as damaged_count,
      COUNT(*) FILTER (WHERE condition = 'Lost') as lost_count,
      COUNT(*) FILTER (WHERE condition = 'Incomplete') as incomplete_count,
      COUNT(*) as total
    FROM damaged_inventory
  `
};

/**
 * Add item to damaged inventory
 */
const addDamagedItem = async ({
  requestId,
  inventoryId,
  itemName,
  quantity,
  unit,
  category,
  condition,  // 'Damaged', 'Lost', 'Incomplete'
  reason,
  reportedBy,
  reportedByName,
  confirmedBy,
  confirmedByName
}) => {
  const result = await query(queries.create, [
    requestId,
    inventoryId,
    itemName,
    quantity,
    unit || 'units',
    category,
    condition,
    reason,
    reportedBy,
    reportedByName,
    confirmedBy,
    confirmedByName
  ]);
  return result.rows[0];
};

/**
 * Get all damaged inventory items with filters
 */
const getAll = async ({ status, condition, page = 1, limit = 50 } = {}) => {
  const offset = (page - 1) * limit;
  
  const [itemsResult, countResult] = await Promise.all([
    query(queries.findAll, [status || null, condition || null, limit, offset]),
    query(queries.countAll, [status || null, condition || null])
  ]);
  
  return {
    items: itemsResult.rows,
    total: parseInt(countResult.rows[0].total),
    page,
    totalPages: Math.ceil(countResult.rows[0].total / limit)
  };
};

/**
 * Get single damaged item by ID
 */
const getById = async (id) => {
  const result = await query(queries.findById, [id]);
  return result.rows[0] || null;
};

/**
 * Get damaged items for a specific request
 */
const getByRequest = async (requestId) => {
  const result = await query(queries.findByRequest, [requestId]);
  return result.rows;
};

/**
 * Update status (resolve, write-off, etc.)
 */
const updateStatus = async (id, { status, notes, resolvedBy }) => {
  const result = await query(queries.updateStatus, [id, status, notes, resolvedBy]);
  return result.rows[0];
};

/**
 * Get statistics
 */
const getStats = async () => {
  const result = await query(queries.getStats);
  return result.rows[0];
};

module.exports = {
  addDamagedItem,
  getAll,
  getById,
  getByRequest,
  updateStatus,
  getStats
};
