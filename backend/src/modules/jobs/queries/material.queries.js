/**
 * Material/Tool Queries
 * Handles: batch requests, inventory linking, partial fulfillment
 */

// Add material/tool request (free-text)
const addMaterialRequest = `
  INSERT INTO job_equipment_items (
    job_id, source, item_type, 
    requested_item_name, requested_item_description, requested_item_specs,
    quantity, unit, priority, notes, 
    requested_by, requested_by_role, request_reason, status
  )
  VALUES ($1, 'NEW_REQUEST', 'MATERIAL_TOOL', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
  RETURNING *
`;

// Search inventory for linking
const searchInventoryForLinking = `
  SELECT id, name, category, quantity, unit, location, reorder_level
  FROM inventory
  WHERE quantity > 0
    AND ($1::text IS NULL OR name ILIKE '%' || $1 || '%' OR category::text ILIKE '%' || $1 || '%')
  ORDER BY 
    CASE WHEN name ILIKE $1 || '%' THEN 0 ELSE 1 END,
    name ASC
  LIMIT 20
`;

// Link material request to inventory item
const linkToInventory = `
  UPDATE job_equipment_items SET
    linked_inventory_id = $2,
    linked_by = $3,
    linked_at = NOW(),
    updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

// Disburse linked material (with consumable flag)
const disburseMaterial = `
  UPDATE job_equipment_items SET
    status = 'DISBURSED',
    disbursed_at = NOW(),
    disbursed_by = $2,
    is_consumable = $3,
    expected_return_date = $4,
    fulfilled_quantity = $5,
    disbursement_notes = $6,
    updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

// Get inventory item for deduction
const getInventoryForDeduction = `
  SELECT id, name, quantity, unit, category, location
  FROM inventory
  WHERE id = $1
`;

// Deduct from inventory
const deductInventory = `
  UPDATE inventory SET
    quantity = quantity - $2,
    updated_at = NOW()
  WHERE id = $1 AND quantity >= $2
  RETURNING *
`;

// Restore inventory on return
const restoreInventory = `
  UPDATE inventory SET
    quantity = quantity + $2,
    updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

// Log inventory transaction
const logInventoryTransaction = `
  INSERT INTO inventory_transactions (
    inventory_id, job_id, job_item_id,
    transaction_type, quantity, previous_quantity, new_quantity,
    performed_by, performed_by_name, notes, reference_number
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  RETURNING *
`;

// Get inventory transactions for a job
const getJobInventoryTransactions = `
  SELECT it.*, i.name as inventory_name, i.category, i.unit
  FROM inventory_transactions it
  JOIN inventory i ON it.inventory_id = i.id
  WHERE it.job_id = $1
  ORDER BY it.created_at DESC
`;

// Get inventory transactions for an item
const getInventoryTransactionHistory = `
  SELECT it.*, 
    i.name as inventory_name,
    j.job_number
  FROM inventory_transactions it
  JOIN inventory i ON it.inventory_id = i.id
  LEFT JOIN jobs j ON it.job_id = j.id
  WHERE it.inventory_id = $1
  ORDER BY it.created_at DESC
  LIMIT 100
`;

// Split item for partial fulfillment
const splitItemForPartial = `
  INSERT INTO job_equipment_items (
    job_id, source, item_type,
    requested_item_name, requested_item_description, requested_item_specs,
    quantity, unit, priority, notes,
    requested_by, requested_by_role, request_reason,
    status, parent_item_id
  )
  SELECT 
    job_id, source, item_type,
    requested_item_name, requested_item_description, requested_item_specs,
    $2, unit, priority, $3,
    requested_by, requested_by_role, request_reason,
    'APPROVED', $1
  FROM job_equipment_items
  WHERE id = $1
  RETURNING *
`;

// Update original item quantity after split
const updateItemAfterSplit = `
  UPDATE job_equipment_items SET
    quantity = $2,
    notes = COALESCE(notes || '. ', '') || $3,
    updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

// Get material items pending in purchasing queue (including unlinked)
const getMaterialsInQueue = `
  SELECT 
    jei.*, 
    inv.name as linked_inventory_name, inv.quantity as inventory_available,
    j.job_number, j.client, j.location, j.start_date, j.end_date, j.priority as job_priority, j.status as job_status,
    requester.first_name || ' ' || requester.last_name as requested_by_name
  FROM job_equipment_items jei
  JOIN jobs j ON jei.job_id = j.id
  LEFT JOIN inventory inv ON jei.linked_inventory_id = inv.id
  LEFT JOIN users requester ON jei.requested_by = requester.id
  WHERE j.status::text IN ('Approved', 'Team_Assigned', 'In_Progress')
    AND jei.item_type = 'MATERIAL_TOOL'
    AND jei.status IN ('APPROVED', 'SOURCING', 'ARRIVED')
  ORDER BY 
    CASE jei.status WHEN 'ARRIVED' THEN 1 WHEN 'SOURCING' THEN 2 WHEN 'APPROVED' THEN 3 ELSE 4 END,
    j.priority DESC, j.start_date ASC
`;

// Get items needing return (non-consumable, job in Post_Job)
const getItemsNeedingReturn = `
  SELECT 
    jei.*, 
    inv.name as inventory_name, inv.category,
    j.job_number, j.client, j.end_date,
    disburser.first_name || ' ' || disburser.last_name as disbursed_by_name
  FROM job_equipment_items jei
  JOIN jobs j ON jei.job_id = j.id
  LEFT JOIN inventory inv ON jei.linked_inventory_id = inv.id
  LEFT JOIN users disburser ON jei.disbursed_by = disburser.id
  WHERE j.status::text = 'Post_Job'
    AND jei.status = 'DISBURSED'
    AND jei.is_consumable = FALSE
    AND jei.item_type = 'MATERIAL_TOOL'
  ORDER BY j.end_date ASC, jei.disbursed_at ASC
`;

// Return material to inventory
const returnMaterial = `
  UPDATE job_equipment_items SET
    status = 'RETURNED',
    returned_at = NOW(),
    returned_by = $2,
    return_condition = $3,
    return_notes = $4,
    updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

module.exports = {
  addMaterialRequest,
  searchInventoryForLinking,
  linkToInventory,
  disburseMaterial,
  getInventoryForDeduction,
  deductInventory,
  restoreInventory,
  logInventoryTransaction,
  getJobInventoryTransactions,
  getInventoryTransactionHistory,
  splitItemForPartial,
  updateItemAfterSplit,
  getMaterialsInQueue,
  getItemsNeedingReturn,
  returnMaterial
};
