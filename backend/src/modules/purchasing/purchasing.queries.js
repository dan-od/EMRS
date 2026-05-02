// SQL queries for purchasing/inventory module

const findAllInventory = `
  SELECT * FROM inventory
  WHERE ($1::text IS NULL OR $1::text = '' OR category::text = $1)
    AND ($2::text IS NULL OR $2::text = '' OR name ILIKE '%' || $2 || '%')
  ORDER BY name
  LIMIT $3 OFFSET $4
`;

const countInventory = `
  SELECT COUNT(*) as total FROM inventory
  WHERE ($1::text IS NULL OR $1::text = '' OR category::text = $1)
    AND ($2::text IS NULL OR $2::text = '' OR name ILIKE '%' || $2 || '%')
`;

const findInventoryById = `
  SELECT * FROM inventory WHERE id = $1
`;

const findLowStock = `
  SELECT * FROM inventory
  WHERE quantity <= reorder_level
  ORDER BY (quantity::float / NULLIF(reorder_level, 0)) ASC
`;

const updateInventoryQuantity = `
  UPDATE inventory SET quantity = quantity + $2, updated_at = NOW()
  WHERE id = $1 RETURNING *
`;

const createInventoryItem = `
  INSERT INTO inventory (name, category, quantity, unit, reorder_level, location)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *
`;

const updateInventoryItem = `
  UPDATE inventory SET
    name = COALESCE($2, name),
    category = COALESCE($3, category),
    unit = COALESCE($4, unit),
    reorder_level = COALESCE($5, reorder_level),
    location = COALESCE($6, location),
    updated_at = NOW()
  WHERE id = $1 RETURNING *
`;

const findAllDisbursements = `
  SELECT d.*, 
    u.first_name || ' ' || u.last_name as requester_name,
    i.name as item_name,
    a.first_name || ' ' || a.last_name as approved_by_name
  FROM disbursements d
  LEFT JOIN users u ON d.requester_id = u.id
  LEFT JOIN inventory i ON d.inventory_id = i.id
  LEFT JOIN users a ON d.approved_by = a.id
  WHERE ($1::text IS NULL OR $1::text = '' OR d.status::text = $1)
  ORDER BY d.created_at DESC
  LIMIT $2 OFFSET $3
`;

const findPendingDisbursements = `
  SELECT d.*, 
    u.first_name || ' ' || u.last_name as requester_name,
    i.name as item_name, i.quantity as available_quantity
  FROM disbursements d
  LEFT JOIN users u ON d.requester_id = u.id
  LEFT JOIN inventory i ON d.inventory_id = i.id
  WHERE d.status = 'Pending'
  ORDER BY d.created_at ASC
`;

const createDisbursement = `
  INSERT INTO disbursements (requester_id, inventory_id, quantity, purpose, request_id)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *
`;

const updateDisbursementStatus = `
  UPDATE disbursements SET
    status = $2,
    approved_by = $3,
    approved_at = CASE WHEN $2 IN ('Approved', 'Rejected') THEN NOW() ELSE approved_at END,
    rejection_reason = $4,
    updated_at = NOW()
  WHERE id = $1 RETURNING *
`;

const logStockMovement = `
  INSERT INTO stock_movements (inventory_id, movement_type, quantity, performed_by, reference_id, notes)
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *
`;

const getStockMovements = `
  SELECT sm.*, u.first_name || ' ' || u.last_name as performed_by_name
  FROM stock_movements sm
  LEFT JOIN users u ON sm.performed_by = u.id
  WHERE sm.inventory_id = $1
  ORDER BY sm.created_at DESC
  LIMIT 50
`;

const getStats = `
  SELECT 
    COUNT(*) as total_items,
    COUNT(*) FILTER (WHERE quantity <= reorder_level) as low_stock_count,
    COUNT(*) FILTER (WHERE quantity = 0) as out_of_stock_count,
    (SELECT COUNT(*) FROM disbursements WHERE status = 'Pending') as pending_disbursements
  FROM inventory
`;

// Alias queries for many-to-one name mapping
const addAlias = `
  INSERT INTO inventory_aliases (inventory_id, alias)
  VALUES ($1, $2)
  ON CONFLICT (inventory_id, alias) DO NOTHING
  RETURNING *
`;

const findByAlias = `
  SELECT i.* FROM inventory i
  LEFT JOIN inventory_aliases ia ON i.id = ia.inventory_id
  WHERE LOWER(i.name) = LOWER($1) OR LOWER(ia.alias) = LOWER($1)
  LIMIT 1
`;

const getAliases = `
  SELECT alias FROM inventory_aliases WHERE inventory_id = $1
`;

module.exports = {
  findAllInventory, countInventory, findInventoryById, findLowStock,
  updateInventoryQuantity, createInventoryItem, updateInventoryItem,
  findAllDisbursements, findPendingDisbursements, createDisbursement, updateDisbursementStatus,
  logStockMovement, getStockMovements, getStats,
  addAlias, findByAlias, getAliases
};
