// SQL queries for requests module

const findAll = `
  SELECT r.*, 
    u.first_name || ' ' || u.last_name as requester_name,
    u.department as requester_department,
    u.email as requester_email,
    d.first_name || ' ' || d.last_name as disbursed_by_name,
    a.first_name || ' ' || a.last_name as approved_by_name
  FROM requests r
  LEFT JOIN users u ON r.requester_id = u.id
  LEFT JOIN users d ON r.disbursed_by = d.id
  LEFT JOIN users a ON r.approved_by = a.id
  WHERE ($1::text IS NULL OR $1::text = '' OR r.type::text = $1)
    AND ($2::text IS NULL OR $2::text = '' OR r.status::text = $2)
    AND ($3::text IS NULL OR $3::text = '' OR r.priority::text = $3)
    AND ($4::uuid IS NULL OR r.requester_id = $4)
    AND ($5::text IS NULL OR $5::text = '' OR u.department::text = $5 OR r.transferred_to::text = $5)
  ORDER BY
    r.created_at DESC,
    CASE r.priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END
  LIMIT $6 OFFSET $7
`;

const countAll = `
  SELECT COUNT(*) as total FROM requests r
  LEFT JOIN users u ON r.requester_id = u.id
  WHERE ($1::text IS NULL OR $1::text = '' OR r.type::text = $1)
    AND ($2::text IS NULL OR $2::text = '' OR r.status::text = $2)
    AND ($3::text IS NULL OR $3::text = '' OR r.priority::text = $3)
    AND ($4::uuid IS NULL OR r.requester_id = $4)
    AND ($5::text IS NULL OR $5::text = '' OR u.department::text = $5 OR r.transferred_to::text = $5)
`;

const findById = `
  SELECT r.*, 
    u.first_name || ' ' || u.last_name as requester_name,
    u.department as requester_department,
    u.email as requester_email,
    d.first_name || ' ' || d.last_name as disbursed_by_name,
    a.first_name || ' ' || a.last_name as approved_by_name,
    rc.first_name || ' ' || rc.last_name as return_confirmed_by_name
  FROM requests r
  LEFT JOIN users u ON r.requester_id = u.id
  LEFT JOIN users d ON r.disbursed_by = d.id
  LEFT JOIN users a ON r.approved_by = a.id
  LEFT JOIN users rc ON r.return_confirmed_by = rc.id
  WHERE r.id = $1
`;

const findPending = `
  SELECT r.*, 
    u.first_name || ' ' || u.last_name as requester_name,
    u.department as requester_department
  FROM requests r
  LEFT JOIN users u ON r.requester_id = u.id
  WHERE r.status = 'Pending'
    AND ($1::text IS NULL OR $1::text = '' OR u.department::text = $1)
  ORDER BY 
    CASE r.priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END,
    r.created_at ASC
`;

// For Purchasing: Get ALL requests (not just pending) with audit trail info
const findAllForPurchasing = `
  SELECT r.*, 
    u.first_name || ' ' || u.last_name as requester_name,
    u.department as requester_department,
    u.email as requester_email,
    d.first_name || ' ' || d.last_name as disbursed_by_name,
    a.first_name || ' ' || a.last_name as approved_by_name
  FROM requests r
  LEFT JOIN users u ON r.requester_id = u.id
  LEFT JOIN users d ON r.disbursed_by = d.id
  LEFT JOIN users a ON r.approved_by = a.id
  WHERE r.status != 'Rejected' AND r.status != 'Cancelled'
    AND ($1::text IS NULL OR $1::text = '' OR r.type::text = $1)
    AND ($2::text IS NULL OR $2::text = '' OR r.status::text = $2)
  ORDER BY 
    CASE r.status WHEN 'Pending' THEN 1 WHEN 'Approved' THEN 2 WHEN 'On_Hold' THEN 3 ELSE 4 END,
    CASE r.priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END,
    r.created_at DESC
  LIMIT $3 OFFSET $4
`;

const countAllForPurchasing = `
  SELECT COUNT(*) as total FROM requests r
  WHERE r.status != 'Rejected' AND r.status != 'Cancelled'
    AND ($1::text IS NULL OR $1::text = '' OR r.type::text = $1)
    AND ($2::text IS NULL OR $2::text = '' OR r.status::text = $2)
`;

// Get ready to disburse (Approved status)
const findReadyToDisburse = `
  SELECT r.*, 
    u.first_name || ' ' || u.last_name as requester_name,
    u.department as requester_department,
    a.first_name || ' ' || a.last_name as approved_by_name
  FROM requests r
  LEFT JOIN users u ON r.requester_id = u.id
  LEFT JOIN users a ON r.approved_by = a.id
  WHERE r.status = 'Approved'
  ORDER BY r.created_at DESC
`;

// Get on hold requests
const findOnHold = `
  SELECT r.*, 
    u.first_name || ' ' || u.last_name as requester_name,
    u.department as requester_department
  FROM requests r
  LEFT JOIN users u ON r.requester_id = u.id
  WHERE r.status = 'On_Hold'
  ORDER BY r.created_at ASC
`;

// Get disbursed/active items (out in field, not yet returned)
const findDisbursedActive = `
  SELECT r.*, 
    u.first_name || ' ' || u.last_name as requester_name,
    u.department as requester_department,
    d.first_name || ' ' || d.last_name as disbursed_by_name,
    CASE 
      WHEN r.expected_return_date IS NOT NULL AND r.expected_return_date < CURRENT_DATE THEN true 
      ELSE false 
    END as is_overdue,
    CASE 
      WHEN r.expected_return_date IS NOT NULL THEN true 
      ELSE false 
    END as needs_return
  FROM requests r
  LEFT JOIN users u ON r.requester_id = u.id
  LEFT JOIN users d ON r.disbursed_by = d.id
  WHERE r.status = 'Disbursed'
  ORDER BY r.expected_return_date ASC NULLS LAST, r.disbursed_at DESC
`;

// Get pending returns
const findPendingReturn = `
  SELECT r.*, 
    u.first_name || ' ' || u.last_name as requester_name,
    u.department as requester_department,
    d.first_name || ' ' || d.last_name as disbursed_by_name
  FROM requests r
  LEFT JOIN users u ON r.requester_id = u.id
  LEFT JOIN users d ON r.disbursed_by = d.id
  WHERE r.status = 'Pending_Return'
  ORDER BY r.return_initiated_at ASC
`;

// Get overdue returns
const findOverdueReturns = `
  SELECT r.*, 
    u.first_name || ' ' || u.last_name as requester_name,
    u.department as requester_department,
    u.email as requester_email,
    r.expected_return_date,
    CURRENT_DATE - r.expected_return_date::date as days_overdue
  FROM requests r
  LEFT JOIN users u ON r.requester_id = u.id
  WHERE r.status IN ('Disbursed', 'Pending_Return')
    AND r.expected_return_date IS NOT NULL
    AND r.expected_return_date < CURRENT_DATE
  ORDER BY r.expected_return_date ASC
`;

// NEW: Get completed/returned requests
const findCompleted = `
  SELECT r.*, 
    u.first_name || ' ' || u.last_name as requester_name,
    u.department as requester_department,
    d.first_name || ' ' || d.last_name as disbursed_by_name,
    rc.first_name || ' ' || rc.last_name as return_confirmed_by_name
  FROM requests r
  LEFT JOIN users u ON r.requester_id = u.id
  LEFT JOIN users d ON r.disbursed_by = d.id
  LEFT JOIN users rc ON r.return_confirmed_by = rc.id
  WHERE r.status = 'Completed'
  ORDER BY r.return_confirmed_at DESC NULLS LAST, r.updated_at DESC
`;

// Get active requests for a user (disbursed, not yet returned)
const findActiveByUser = `
  SELECT r.*, 
    d.first_name || ' ' || d.last_name as disbursed_by_name
  FROM requests r
  LEFT JOIN users d ON r.disbursed_by = d.id
  WHERE r.requester_id = $1 
    AND r.is_active = true
    AND r.status IN ('Disbursed', 'Pending_Return')
  ORDER BY r.disbursed_at DESC
`;

const create = `
  INSERT INTO requests (requester_id, type, priority, details, date_needed, job_id, maintenance_category, maintenance_routes_to, maintenance_other_description, notes)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  RETURNING *
`;

const updateStatus = `
  UPDATE requests SET 
    status = $2::request_status, 
    approved_by = $3, 
    approved_at = CASE WHEN $2 IN ('Approved', 'Rejected') THEN NOW() ELSE approved_at END,
    rejection_reason = $4,
    updated_at = NOW()
  WHERE id = $1 RETURNING *
`;

// Disburse a request
const disburse = `
  UPDATE requests SET
    status = 'Disbursed'::request_status,
    disbursed_by = $2,
    disbursed_at = NOW(),
    disbursement_notes = $3,
    disbursed_without_approval = $4,
    expected_return_date = NULLIF($5, '')::timestamp,
    is_active = CASE WHEN NULLIF($5, '') IS NOT NULL THEN true ELSE false END,
    updated_at = NOW()
  WHERE id = $1 RETURNING *
`;

// Put request on hold
const putOnHold = `
  UPDATE requests SET
    status = 'On_Hold'::request_status,
    disbursement_notes = $2,
    updated_at = NOW()
  WHERE id = $1 RETURNING *
`;

// Release from hold (resume)
const releaseFromHold = `
  UPDATE requests SET
    status = CASE 
      WHEN approved_at IS NOT NULL THEN 'Approved'::request_status
      ELSE 'Pending'::request_status
    END,
    updated_at = NOW()
  WHERE id = $1 AND status = 'On_Hold' RETURNING *
`;

// Initiate return (by requester)
const initiateReturn = `
  UPDATE requests SET
    status = 'Pending_Return'::request_status,
    return_initiated_at = NOW(),
    return_condition = $2,
    return_notes = $3,
    return_items = $4,
    updated_at = NOW()
  WHERE id = $1 RETURNING *
`;

// Confirm return (by purchasing)
const confirmReturn = `
  UPDATE requests SET
    status = 'Completed'::request_status,
    return_confirmed_at = NOW(),
    return_confirmed_by = $2,
    return_condition = COALESCE($3, return_condition),
    return_notes = COALESCE($4, return_notes),
    is_active = false,
    updated_at = NOW()
  WHERE id = $1 RETURNING *
`;

// Complete request (for consumables that don't need return)
const complete = `
  UPDATE requests SET
    status = 'Completed'::request_status,
    is_active = false,
    updated_at = NOW()
  WHERE id = $1 RETURNING *
`;

const cancel = `
  UPDATE requests SET status = 'Cancelled'::request_status, updated_at = NOW()
  WHERE id = $1 AND requester_id = $2 AND status = 'Pending'
  RETURNING *
`;

const transfer = `
  UPDATE requests SET 
    transferred_to = $2,
    transfer_notes = $3,
    transferred_at = NOW(),
    updated_at = NOW()
  WHERE id = $1 AND status = 'Pending'
  RETURNING *
`;

const getHistory = `
  SELECT h.*, u.first_name || ' ' || u.last_name as changed_by_name
  FROM request_history h
  LEFT JOIN users u ON h.changed_by = u.id
  WHERE h.request_id = $1
  ORDER BY h.created_at DESC
`;

const addHistory = `
  INSERT INTO request_history (request_id, changed_by, old_status, new_status, notes)
  VALUES ($1, $2, $3, $4, $5) RETURNING *
`;

// Get audit trail (approvals)
const getAuditTrail = `
  SELECT ra.*, 
    u.first_name || ' ' || u.last_name as user_name,
    u.role as user_role
  FROM request_approvals ra
  LEFT JOIN users u ON ra.user_id = u.id
  WHERE ra.request_id = $1
  ORDER BY ra.created_at ASC
`;

const addAuditTrail = `
  INSERT INTO request_approvals (request_id, user_id, action, from_department, to_department, comments)
  VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
`;

// Stats for purchasing dashboard - UPDATED to include completed count and maintenance
const getPurchasingStats = `
  SELECT
    COUNT(*) FILTER (WHERE status NOT IN ('Rejected', 'Cancelled', 'Completed')) as total_active,
    COUNT(*) FILTER (WHERE status = 'Approved') as ready_to_disburse,
    COUNT(*) FILTER (WHERE status = 'On_Hold') as on_hold,
    COUNT(*) FILTER (WHERE status = 'Disbursed') as disbursed_active,
    COUNT(*) FILTER (WHERE status = 'Pending_Return') as pending_return,
    COUNT(*) FILTER (WHERE status IN ('Disbursed', 'Pending_Return') AND expected_return_date IS NOT NULL AND expected_return_date < CURRENT_DATE) as overdue,
    COUNT(*) FILTER (WHERE status = 'Completed') as completed,
    COUNT(*) FILTER (WHERE type = 'Maintenance' AND status IN ('Pending', 'Approved')) as pending_repairs,
    COUNT(*) FILTER (WHERE type = 'Maintenance' AND status = 'Manager_Approved') as awaiting_review
  FROM requests
`;

// Get maintenance requests for Purchasing review
// Shows: Pending/Approved/Manager_Approved Maintenance + Additional Material requests
const findMaintenanceRequests = `
  SELECT r.*, 
    u.first_name || ' ' || u.last_name as requester_name,
    u.department as requester_department,
    u.email as requester_email,
    j.job_number,
    j.location as job_location,
    e.name as equipment_name,
    e.serial_number,
    approver.first_name || ' ' || approver.last_name as approved_by_name
  FROM requests r
  LEFT JOIN users u ON r.requester_id = u.id
  LEFT JOIN jobs j ON r.job_id = j.id
  LEFT JOIN equipment e ON (r.details->>'equipmentId')::uuid = e.id
  LEFT JOIN users approver ON r.approved_by = approver.id
  WHERE (
    -- Maintenance requests awaiting Purchasing review
    (r.type = 'Maintenance' AND r.status IN ('Pending', 'Approved', 'Manager_Approved'))
    OR 
    -- Approved additional material requests from work orders (not yet disbursed)
    (r.type = 'Material' AND r.status = 'Approved' AND r.details->>'isAdditionalRequest' = 'true')
  )
  AND r.is_active = true
  ORDER BY 
    CASE r.priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END,
    r.created_at ASC
`;

module.exports = {
  findAll, 
  countAll, 
  findById, 
  findPending, 
  findAllForPurchasing,
  countAllForPurchasing,
  findReadyToDisburse,
  findOnHold,
  findDisbursedActive,
  findPendingReturn,
  findOverdueReturns,
  findCompleted,
  findActiveByUser,
  findMaintenanceRequests,
  create, 
  updateStatus, 
  disburse,
  putOnHold,
  initiateReturn,
  confirmReturn,
  complete,
  cancel, 
  transfer, 
  getHistory, 
  addHistory,
  getAuditTrail,
  addAuditTrail,
  getPurchasingStats,
  releaseFromHold
};
