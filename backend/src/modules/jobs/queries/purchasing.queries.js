/**
 * Purchasing Queue Queries - V2 with Tab Filtering
 * Supports 8 tabs for purchasing workflow
 */

// Base SELECT for equipment items
const BASE_SELECT = `
  SELECT 
    jei.*,
    e.name as equipment_name, e.serial_number, e.asset_category,
    j.id as job_id, j.job_number, j.status as job_status, j.location, j.client,
    j.start_date, j.priority as job_priority,
    adder.first_name || ' ' || adder.last_name as added_by_name,
    disburser.first_name || ' ' || disburser.last_name as disbursed_by_name,
    returner.first_name || ' ' || returner.last_name as returned_by_name
  FROM job_equipment_items jei
  JOIN jobs j ON jei.job_id = j.id
  LEFT JOIN equipment e ON jei.equipment_id = e.id
  LEFT JOIN users adder ON jei.added_by = adder.id
  LEFT JOIN users disburser ON jei.disbursed_by = disburser.id
  LEFT JOIN users returner ON jei.returned_by = returner.id
`;

// Active job statuses filter
const ACTIVE_JOB_STATUSES = `j.status IN ('Draft', 'Team_Assigned', 'Approved', 'In_Progress', 'Post_Job', 'APPROVED', 'IN_PROGRESS', 'POST_JOB')`;

// Tab-specific WHERE clauses
const TAB_FILTERS = {
  pending_disburse: `
    ${ACTIVE_JOB_STATUSES}
    AND jei.source = 'INVENTORY'
    AND jei.status IN ('APPROVED', 'INSPECTION_APPROVED')
  `,
  needs_sourcing: `
    ${ACTIVE_JOB_STATUSES}
    AND jei.source = 'NEW_REQUEST'
    AND jei.status IN ('APPROVED', 'PENDING_QUOTE')
  `,
  in_sourcing: `
    ${ACTIVE_JOB_STATUSES}
    AND jei.source = 'NEW_REQUEST'
    AND jei.status = 'SOURCING'
  `,
  arrived: `
    ${ACTIVE_JOB_STATUSES}
    AND jei.source = 'NEW_REQUEST'
    AND jei.status = 'ARRIVED'
  `,
  pending_inspection: `
    ${ACTIVE_JOB_STATUSES}
    AND jei.status IN ('PENDING_INSPECTION', 'INSPECTION_SUBMITTED')
  `,
  in_repair: `
    ${ACTIVE_JOB_STATUSES}
    AND jei.status = 'UNDER_REPAIR'
  `,
  pending_returns: `
    j.status IN ('Post_Job', 'POST_JOB', 'In_Progress', 'IN_PROGRESS')
    AND jei.status = 'PENDING_RETURN'
    AND jei.source = 'INVENTORY'
  `
};

// Build query for specific tab
const getQueueByTab = (tab) => {
  const filter = TAB_FILTERS[tab] || TAB_FILTERS.pending_disburse;
  return `
    ${BASE_SELECT}
    WHERE ${filter}
    ORDER BY 
      CASE jei.priority 
        WHEN 'Critical' THEN 1 
        WHEN 'High' THEN 2 
        WHEN 'Medium' THEN 3 
        ELSE 4 
      END,
      j.start_date ASC,
      jei.added_at ASC
  `;
};

// Get counts for all tabs (for badges)
const getTabCounts = `
  SELECT
    COUNT(*) FILTER (WHERE jei.source = 'INVENTORY' AND jei.status IN ('APPROVED', 'INSPECTION_APPROVED')) as pending_disburse,
    COUNT(*) FILTER (WHERE jei.source = 'NEW_REQUEST' AND jei.status IN ('APPROVED', 'PENDING_QUOTE')) as needs_sourcing,
    COUNT(*) FILTER (WHERE jei.source = 'NEW_REQUEST' AND jei.status = 'SOURCING') as in_sourcing,
    COUNT(*) FILTER (WHERE jei.source = 'NEW_REQUEST' AND jei.status = 'ARRIVED') as arrived,
    COUNT(*) FILTER (WHERE jei.status IN ('PENDING_INSPECTION', 'INSPECTION_SUBMITTED')) as pending_inspection,
    COUNT(*) FILTER (WHERE jei.status = 'UNDER_REPAIR') as in_repair,
    COUNT(*) FILTER (WHERE jei.status = 'PENDING_RETURN' AND jei.source = 'INVENTORY') as pending_returns
  FROM job_equipment_items jei
  JOIN jobs j ON jei.job_id = j.id
  WHERE j.status IN ('Draft', 'Team_Assigned', 'Approved', 'In_Progress', 'Post_Job', 'APPROVED', 'IN_PROGRESS', 'POST_JOB')
`;

// Get swap requests (separate table)
const getSwapRequests = `
  SELECT 
    sr.*,
    j.job_number, j.client, j.location,
    COALESCE(ce.name, ci.requested_item_name, ci.client_equipment_name) as current_equipment_name,
    ce.serial_number as current_serial_number,
    COALESCE(re.name, ri.requested_item_name, ri.client_equipment_name) as replacement_equipment_name,
    requester.first_name || ' ' || requester.last_name as requested_by_name
  FROM swap_requests sr
  JOIN jobs j ON sr.job_id = j.id
  LEFT JOIN job_equipment_items ci ON sr.current_item_id = ci.id
  LEFT JOIN equipment ce ON ci.equipment_id = ce.id
  LEFT JOIN job_equipment_items ri ON sr.replacement_item_id = ri.id
  LEFT JOIN equipment re ON ri.equipment_id = re.id
  LEFT JOIN users requester ON sr.requested_by = requester.id
  WHERE sr.status NOT IN ('COMPLETED', 'REJECTED')
  ORDER BY sr.created_at DESC
`;

// Get active job requests (additional_requests table)
const getActiveJobRequests = `
  SELECT 
    ar.*,
    j.job_number, j.client, j.location,
    e.name as equipment_name,
    requester.first_name || ' ' || requester.last_name as requested_by_name
  FROM additional_requests ar
  JOIN jobs j ON ar.job_id = j.id
  LEFT JOIN equipment e ON ar.equipment_id = e.id
  LEFT JOIN users requester ON ar.requested_by = requester.id
  WHERE ar.status NOT IN ('APPROVED', 'REJECTED')
  ORDER BY 
    CASE ar.priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 ELSE 3 END,
    ar.created_at ASC
`;

// Stats for dashboard header
const getQueueStats = `
  SELECT
    COUNT(*) FILTER (WHERE jei.source = 'INVENTORY' AND jei.status IN ('APPROVED', 'INSPECTION_APPROVED')) as pending_disburse,
    COUNT(*) FILTER (WHERE jei.status = 'DISBURSED' AND jei.source = 'INVENTORY') as out_in_field,
    COUNT(DISTINCT j.id) FILTER (WHERE j.status IN ('Approved', 'In_Progress', 'Post_Job', 'APPROVED', 'IN_PROGRESS', 'POST_JOB')) as active_jobs,
    COUNT(*) FILTER (WHERE jei.priority = 'Critical' AND jei.status IN ('APPROVED', 'PENDING_QUOTE', 'SOURCING')) as critical_pending,
    COUNT(*) FILTER (WHERE jei.status = 'UNDER_REPAIR') as in_repair,
    COUNT(*) FILTER (WHERE jei.status = 'SOURCING') as sourcing
  FROM job_equipment_items jei
  JOIN jobs j ON jei.job_id = j.id
  WHERE j.status IN ('Draft', 'Team_Assigned', 'Approved', 'In_Progress', 'Post_Job', 'APPROVED', 'IN_PROGRESS', 'POST_JOB')
`;

// Disburse item
const disburseItem = `
  UPDATE job_equipment_items 
  SET status = 'DISBURSED', disbursed_at = NOW(), disbursed_by = $2, disbursement_notes = $3, updated_at = NOW()
  WHERE id = $1 AND source = 'INVENTORY' AND status IN ('APPROVED', 'INSPECTION_APPROVED')
  RETURNING *
`;

// Accept return
const acceptReturn = `
  UPDATE job_equipment_items 
  SET status = 'RETURNED', returned_at = NOW(), returned_by = $2, return_condition = $3, hours_used = $4, return_notes = $5, updated_at = NOW()
  WHERE id = $1 AND source = 'INVENTORY' AND status IN ('DISBURSED', 'PENDING_RETURN')
  RETURNING *
`;

// Get single item
const getItemById = `
  SELECT jei.*, e.name as equipment_name, e.serial_number, e.asset_category, j.job_number, j.status as job_status, j.location
  FROM job_equipment_items jei
  JOIN jobs j ON jei.job_id = j.id
  LEFT JOIN equipment e ON jei.equipment_id = e.id
  WHERE jei.id = $1
`;

module.exports = {
  getQueueByTab,
  getTabCounts,
  getSwapRequests,
  getActiveJobRequests,
  getQueueStats,
  disburseItem,
  acceptReturn,
  getItemById,
  TAB_FILTERS
};