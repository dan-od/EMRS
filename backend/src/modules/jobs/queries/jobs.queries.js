/**
 * Jobs Queries - Equipment Items (Enhanced)
 * Supports: item_type, sourcing workflow, approval flow
 */

const getByJobId = `
  SELECT 
    jei.*,
    e.name as equipment_name, e.serial_number, e.asset_category, e.type as equipment_type, e.asset_tag,
    adder.first_name || ' ' || adder.last_name as added_by_name,
    requester.first_name || ' ' || requester.last_name as requested_by_name,
    sourcing_user.first_name || ' ' || sourcing_user.last_name as sourcing_by_name,
    disburser.first_name || ' ' || disburser.last_name as disbursed_by_name,
    sup_approver.first_name || ' ' || sup_approver.last_name as supervisor_approved_by_name
  FROM job_equipment_items jei
  LEFT JOIN equipment e ON jei.equipment_id = e.id
  LEFT JOIN users adder ON jei.added_by = adder.id
  LEFT JOIN users requester ON jei.requested_by = requester.id
  LEFT JOIN users sourcing_user ON jei.sourcing_started_by = sourcing_user.id
  LEFT JOIN users disburser ON jei.disbursed_by = disburser.id
  LEFT JOIN users sup_approver ON jei.supervisor_approved_by = sup_approver.id
  WHERE jei.job_id = $1 
  ORDER BY jei.item_type ASC, jei.added_at DESC
`;

const addInventory = `
  INSERT INTO job_equipment_items (
    job_id, source, equipment_id, quantity, priority, notes, added_by,
    item_type, requested_by, requested_by_role, request_reason
  )
  VALUES ($1, 'INVENTORY', $2, $3, $4, $5, $6, $7, $8, $9, $10) 
  RETURNING *
`;

const addClient = `
  INSERT INTO job_equipment_items (
    job_id, source, client_equipment_name, client_equipment_description,
    quantity, priority, notes, added_by, item_type
  )
  VALUES ($1, 'CLIENT', $2, $3, $4, $5, $6, $7, $8) 
  RETURNING *
`;

const addNewRequest = `
  INSERT INTO job_equipment_items (
    job_id, source, requested_item_name, requested_item_description,
    requested_item_specs, quantity, priority, notes, added_by,
    item_type, requested_by, requested_by_role, request_reason, status
  )
  VALUES ($1, 'NEW_REQUEST', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
  RETURNING *
`;

const update = `
  UPDATE job_equipment_items SET 
    quantity = COALESCE($2, quantity),
    priority = COALESCE($3, priority), 
    notes = COALESCE($4, notes), 
    item_type = COALESCE($5, item_type),
    updated_at = NOW()
  WHERE id = $1 RETURNING *
`;

const remove = `DELETE FROM job_equipment_items WHERE id = $1 RETURNING *`;

const approveAll = `
  UPDATE job_equipment_items SET status = 'APPROVED', updated_at = NOW()
  WHERE job_id = $1 AND status IN ('REQUESTED', 'PENDING_SUPERVISOR')
`;

const disburse = `
  UPDATE job_equipment_items SET 
    status = 'DISBURSED', disbursed_at = NOW(),
    disbursed_by = $2, disbursement_notes = $3, updated_at = NOW()
  WHERE id = $1 AND source = 'INVENTORY' RETURNING *
`;

const startSourcing = `
  UPDATE job_equipment_items SET 
    status = 'SOURCING', sourcing_started_at = NOW(),
    sourcing_started_by = $2, sourcing_notes = $3,
    estimated_arrival = $4, updated_at = NOW()
  WHERE id = $1 AND source = 'NEW_REQUEST' RETURNING *
`;

const itemArrived = `
  UPDATE job_equipment_items SET 
    status = 'ARRIVED', arrived_at = NOW(), arrived_received_by = $2,
    linked_inventory_id = $3, vendor_name = COALESCE($4, vendor_name),
    purchase_order_number = $5, procurement_cost = $6, updated_at = NOW()
  WHERE id = $1 AND status = 'SOURCING' RETURNING *
`;

const disburseArrived = `
  UPDATE job_equipment_items SET 
    status = 'DISBURSED', disbursed_at = NOW(), disbursed_by = $2,
    disbursement_notes = $3, equipment_id = linked_inventory_id, updated_at = NOW()
  WHERE id = $1 AND status = 'ARRIVED' RETURNING *
`;

const supervisorApprove = `
  UPDATE job_equipment_items SET 
    status = 'APPROVED', supervisor_approved_at = NOW(),
    supervisor_approved_by = $2, supervisor_approval_notes = $3, updated_at = NOW()
  WHERE id = $1 AND status = 'PENDING_SUPERVISOR' RETURNING *
`;

const supervisorReject = `
  UPDATE job_equipment_items SET 
    status = 'SUPERVISOR_REJECTED', supervisor_rejected_at = NOW(),
    supervisor_rejection_reason = $2, updated_at = NOW()
  WHERE id = $1 AND status = 'PENDING_SUPERVISOR' RETURNING *
`;

const returnItem = `
  UPDATE job_equipment_items SET status = $2, returned_at = NOW(),
    returned_by = $3, return_condition = $4, hours_used = $5, updated_at = NOW()
  WHERE id = $1 RETURNING *
`;

const getProgress = `
  SELECT
    COUNT(*) FILTER (WHERE source = 'INVENTORY') as total_inventory,
    COUNT(*) FILTER (WHERE source = 'INVENTORY' AND status IN ('DISBURSED', 'IN_USE', 'RETURNED')) as disbursed_count,
    COUNT(*) FILTER (WHERE source = 'NEW_REQUEST') as total_requests,
    COUNT(*) FILTER (WHERE source = 'NEW_REQUEST' AND status = 'SOURCING') as sourcing_count,
    COUNT(*) FILTER (WHERE source = 'NEW_REQUEST' AND status IN ('ARRIVED', 'DISBURSED')) as procured_count
  FROM job_equipment_items WHERE job_id = $1
`;

const getPurchasingQueue = `
  SELECT 
    jei.*, e.name as equipment_name, e.serial_number, e.asset_category, e.type as equipment_type, e.asset_tag,
    j.job_number, j.client, j.location, j.start_date, j.priority as job_priority, j.status as job_status,
    adder.first_name || ' ' || adder.last_name as added_by_name,
    requester.first_name || ' ' || requester.last_name as requested_by_name,
    sourcing_user.first_name || ' ' || sourcing_user.last_name as sourcing_by_name
  FROM job_equipment_items jei
  JOIN jobs j ON jei.job_id = j.id
  LEFT JOIN equipment e ON jei.equipment_id = e.id
  LEFT JOIN users adder ON jei.added_by = adder.id
  LEFT JOIN users requester ON jei.requested_by = requester.id
  LEFT JOIN users sourcing_user ON jei.sourcing_started_by = sourcing_user.id
  WHERE j.status::text IN ('Approved', 'Team_Assigned', 'In_Progress')
    AND jei.status IN ('APPROVED', 'SOURCING', 'ARRIVED')
  ORDER BY CASE jei.status WHEN 'ARRIVED' THEN 1 WHEN 'SOURCING' THEN 2 WHEN 'APPROVED' THEN 3 ELSE 4 END,
    j.priority DESC, j.start_date ASC, jei.priority DESC
`;

const getPurchasingStats = `
  SELECT
    COUNT(*) FILTER (WHERE jei.status = 'APPROVED' AND jei.source = 'INVENTORY') as pending_disburse,
    COUNT(*) FILTER (WHERE jei.status = 'SOURCING') as sourcing,
    COUNT(*) FILTER (WHERE jei.status = 'ARRIVED') as arrived,
    COUNT(*) FILTER (WHERE jei.status = 'DISBURSED') as out_in_field,
    COUNT(*) FILTER (WHERE jei.status IN ('RETURNED', 'PENDING_RETURN')) as pending_return,
    COUNT(*) FILTER (WHERE jei.priority = 'Critical') as critical,
    COUNT(DISTINCT jei.job_id) as active_jobs
  FROM job_equipment_items jei
  JOIN jobs j ON jei.job_id = j.id
  WHERE j.status::text IN ('Approved', 'Team_Assigned', 'In_Progress', 'Post_Job')
`;

// Get items pending manager approval (REQUESTED status on active jobs)
const getPendingManagerApproval = `
  SELECT 
    jei.*, e.name as equipment_name, e.serial_number, e.asset_category, e.type as equipment_type, e.asset_tag,
    j.job_number, j.client, j.location, j.start_date, j.priority as job_priority, j.status as job_status,
    requester.first_name || ' ' || requester.last_name as requested_by_name,
    requester.role as requester_role
  FROM job_equipment_items jei
  JOIN jobs j ON jei.job_id = j.id
  LEFT JOIN equipment e ON jei.equipment_id = e.id
  LEFT JOIN users requester ON jei.requested_by = requester.id
  WHERE j.status::text IN ('Approved', 'Team_Assigned', 'In_Progress')
    AND jei.status = 'REQUESTED'
  ORDER BY j.priority DESC, j.start_date ASC, jei.added_at ASC
`;

// Manager approve equipment request
const managerApproveRequest = `
  UPDATE job_equipment_items 
  SET status = 'APPROVED', 
      manager_approved_at = NOW(),
      manager_approved_by = $2,
      manager_approval_notes = $3,
      updated_at = NOW()
  WHERE id = $1 AND status = 'REQUESTED' 
  RETURNING *
`;

// Manager reject equipment request
const managerRejectRequest = `
  UPDATE job_equipment_items 
  SET status = 'MANAGER_REJECTED', 
      manager_rejected_at = NOW(),
      manager_rejected_by = $2,
      manager_rejection_reason = $3,
      updated_at = NOW()
  WHERE id = $1 AND status = 'REQUESTED' 
  RETURNING *
`;

const addHistory = `
  INSERT INTO job_equipment_history (
    job_equipment_item_id, job_id, action, previous_status, new_status,
    performed_by, performed_by_name, performed_by_role, notes, details
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
`;

const getHistory = `SELECT * FROM job_equipment_history WHERE job_equipment_item_id = $1 ORDER BY created_at DESC`;

module.exports = {
  getByJobId, addInventory, addClient, addNewRequest, update, remove, approveAll,
  disburse, startSourcing, itemArrived, disburseArrived, supervisorApprove, supervisorReject,
  returnItem, getProgress, getPurchasingQueue, getPurchasingStats, 
  getPendingManagerApproval, managerApproveRequest, managerRejectRequest,
  addHistory, getHistory
};