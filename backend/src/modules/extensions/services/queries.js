/**
 * Extensions Service - SQL Queries
 */
module.exports = {
  // DO NOTHING, not DO UPDATE: a replay must not overwrite the extension
  // already awaiting a decision. On conflict this returns no rows and the
  // caller falls back to findPendingForLine below.
  // The WHERE clause matches uniq_return_extensions_pending so Postgres can
  // infer the partial index.
  create: `
    INSERT INTO return_extensions
    (request_id, item_index, item_name, current_return_date, requested_return_date, reason, requested_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (request_id, COALESCE(item_index, -1)) WHERE status = 'Pending'
    DO NOTHING
    RETURNING *
  `,

  // Used when create hits the pending-extension constraint, so a retried
  // request gets back the extension the first call created.
  findPendingForLine: `
    SELECT * FROM return_extensions
    WHERE request_id = $1 AND COALESCE(item_index, -1) = COALESCE($2, -1)
      AND status = 'Pending'
    LIMIT 1
  `,
  
  findById: `
    SELECT re.*, 
           r.type as request_type,
           u.first_name || ' ' || u.last_name as requester_name,
           u.department as requester_department
    FROM return_extensions re
    JOIN requests r ON re.request_id = r.id
    JOIN users u ON re.requested_by = u.id
    WHERE re.id = $1
  `,
  
  findByRequestId: `
    SELECT re.*, 
           u.first_name || ' ' || u.last_name as requester_name
    FROM return_extensions re
    JOIN users u ON re.requested_by = u.id
    WHERE re.request_id = $1
    ORDER BY re.created_at DESC
  `,
  
  findPendingForManager: `
    SELECT re.*, 
           r.type as request_type,
           r.id as request_id,
           u.first_name || ' ' || u.last_name as requester_name,
           u.department as requester_department
    FROM return_extensions re
    JOIN requests r ON re.request_id = r.id
    JOIN users u ON re.requested_by = u.id
    WHERE re.status = 'Pending'
      AND u.department = $1
    ORDER BY re.created_at ASC
  `,
  
  findPendingForPurchasing: `
    SELECT re.*, 
           r.type as request_type,
           r.id as request_id,
           u.first_name || ' ' || u.last_name as requester_name,
           u.department as requester_department,
           mu.first_name || ' ' || mu.last_name as manager_approved_by_name
    FROM return_extensions re
    JOIN requests r ON re.request_id = r.id
    JOIN users u ON re.requested_by = u.id
    LEFT JOIN users mu ON re.manager_approved_by = mu.id
    WHERE re.status = 'Manager_Approved'
    ORDER BY re.created_at ASC
  `,
  
  managerApprove: `
    UPDATE return_extensions SET
      status = 'Manager_Approved',
      manager_approved_by = $2,
      manager_approved_at = NOW(),
      manager_decision = 'approved',
      manager_notes = $3,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `,
  
  managerReject: `
    UPDATE return_extensions SET
      status = 'Rejected',
      manager_approved_by = $2,
      manager_approved_at = NOW(),
      manager_decision = 'rejected',
      manager_notes = $3,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `,
  
  purchasingApprove: `
    UPDATE return_extensions SET
      status = 'Approved',
      purchasing_approved_by = $2,
      purchasing_approved_at = NOW(),
      purchasing_decision = 'approved',
      purchasing_notes = $3,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `,
  
  purchasingReject: `
    UPDATE return_extensions SET
      status = 'Rejected',
      purchasing_approved_by = $2,
      purchasing_approved_at = NOW(),
      purchasing_decision = 'rejected',
      purchasing_notes = $3,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `,
  
  updateRequestReturnDate: `
    UPDATE requests SET
      expected_return_date = $2,
      extension_count = COALESCE(extension_count, 0) + 1,
      has_pending_extension = FALSE,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `,
  
  setPendingExtension: `
    UPDATE requests SET has_pending_extension = $2, updated_at = NOW()
    WHERE id = $1
  `
};
