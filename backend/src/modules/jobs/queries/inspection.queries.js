/**
 * Inspection Queries - Enhanced Pre-inspection checklist operations
 * Supports: Draft/autosave, individual item sign-off, repair workflow
 */

// Create new inspection (as draft or submitted)
const create = `
  INSERT INTO job_equipment_inspections 
    (job_equipment_item_id, inspected_by, checklist_data, failed_items, notes, overall_status, is_draft, submitted_at)
  VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::text, $6::varchar, $7, $8)
  RETURNING *
`;

// Update existing inspection (for autosave)
const update = `
  UPDATE job_equipment_inspections 
  SET checklist_data = $2::jsonb,
      failed_items = $3::jsonb,
      notes = $4::text,
      overall_status = $5::varchar,
      is_draft = $6,
      submitted_at = CASE WHEN $6 = false AND submitted_at IS NULL THEN NOW() ELSE submitted_at END,
      updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

// Find draft inspection for an item
const findDraftByItemId = `
  SELECT i.*, 
    inspector.first_name || ' ' || inspector.last_name as inspector_name
  FROM job_equipment_inspections i
  JOIN users inspector ON i.inspected_by = inspector.id
  WHERE i.job_equipment_item_id = $1 
    AND i.is_draft = true
    AND i.inspected_by = $2
  ORDER BY i.updated_at DESC
  LIMIT 1
`;

const findByItemId = `
  SELECT i.*, 
    inspector.first_name || ' ' || inspector.last_name as inspector_name,
    signoff.first_name || ' ' || signoff.last_name as signoff_name,
    manager.first_name || ' ' || manager.last_name as manager_name
  FROM job_equipment_inspections i
  JOIN users inspector ON i.inspected_by = inspector.id
  LEFT JOIN users signoff ON i.signed_off_by = signoff.id
  LEFT JOIN users manager ON i.manager_decision_by = manager.id
  WHERE i.job_equipment_item_id = $1
  ORDER BY i.created_at DESC
`;

const findById = `
  SELECT i.*, 
    inspector.first_name || ' ' || inspector.last_name as inspector_name,
    signoff.first_name || ' ' || signoff.last_name as signoff_name,
    manager.first_name || ' ' || manager.last_name as manager_name,
    jei.job_id,
    jei.equipment_id,
    j.job_number,
    e.name as equipment_name,
    e.serial_number
  FROM job_equipment_inspections i
  JOIN users inspector ON i.inspected_by = inspector.id
  LEFT JOIN users signoff ON i.signed_off_by = signoff.id
  LEFT JOIN users manager ON i.manager_decision_by = manager.id
  JOIN job_equipment_items jei ON i.job_equipment_item_id = jei.id
  JOIN jobs j ON jei.job_id = j.id
  LEFT JOIN equipment e ON jei.equipment_id = e.id
  WHERE i.id = $1
`;

// Manager sign-off (single item or all)
const signOff = `
  UPDATE job_equipment_inspections 
  SET signed_off_by = $2, 
      signed_off_at = NOW(), 
      signed_all = $3,
      manager_decision = 'APPROVED',
      manager_decision_at = NOW(),
      manager_decision_by = $2,
      updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

// Manager decision on inspection
const managerDecision = `
  UPDATE job_equipment_inspections 
  SET manager_decision = $2::varchar,
      manager_notes = $3::text,
      manager_decision_at = NOW(),
      manager_decision_by = $4,
      signed_off_by = CASE WHEN $2 = 'APPROVED' THEN $4 ELSE signed_off_by END,
      signed_off_at = CASE WHEN $2 = 'APPROVED' THEN NOW() ELSE signed_off_at END,
      updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

const updateStatus = `
  UPDATE job_equipment_inspections 
  SET overall_status = $2::varchar, updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

// Update item status after manager decision
const updateItemInspectionStatus = `
  UPDATE job_equipment_items 
  SET current_inspection_id = $2, 
      inspection_status = $3::varchar,
      status = CASE 
        WHEN $3::varchar = 'PASSED' THEN 'IN_USE'::job_item_status
        WHEN $3::varchar = 'ACKNOWLEDGED_PROCEED' THEN 'IN_USE'::job_item_status
        WHEN $3::varchar = 'FLAGGED_REPAIR' THEN 'UNDER_REPAIR'::job_item_status
        ELSE status 
      END,
      last_inspection_id = $2,
      updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

// Set item to under repair with request reference
const setItemUnderRepair = `
  UPDATE job_equipment_items 
  SET status = 'UNDER_REPAIR'::job_item_status,
      repair_request_id = $2,
      repair_notes = $3,
      updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

// Mark repair complete - ready for re-inspection
const markRepairComplete = `
  UPDATE job_equipment_items 
  SET status = 'PENDING_REINSPECTION'::job_item_status,
      inspection_status = NULL,
      updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

const getByJobId = `
  SELECT i.*, 
    jei.equipment_id,
    jei.status as item_status,
    e.name as equipment_name,
    e.serial_number,
    inspector.first_name || ' ' || inspector.last_name as inspector_name,
    signoff.first_name || ' ' || signoff.last_name as signoff_name,
    manager.first_name || ' ' || manager.last_name as manager_name
  FROM job_equipment_inspections i
  JOIN job_equipment_items jei ON i.job_equipment_item_id = jei.id
  LEFT JOIN equipment e ON jei.equipment_id = e.id
  JOIN users inspector ON i.inspected_by = inspector.id
  LEFT JOIN users signoff ON i.signed_off_by = signoff.id
  LEFT JOIN users manager ON i.manager_decision_by = manager.id
  WHERE jei.job_id = $1 AND i.is_draft = false
  ORDER BY i.created_at DESC
`;

// Get items pending manager review
const getPendingManagerReview = `
  SELECT i.*, 
    jei.id as item_id,
    jei.equipment_id,
    jei.source,
    jei.client_equipment_name,
    jei.requested_item_name,
    e.name as equipment_name,
    e.serial_number,
    j.job_number,
    j.client,
    inspector.first_name || ' ' || inspector.last_name as inspector_name
  FROM job_equipment_inspections i
  JOIN job_equipment_items jei ON i.job_equipment_item_id = jei.id
  LEFT JOIN equipment e ON jei.equipment_id = e.id
  JOIN jobs j ON jei.job_id = j.id
  JOIN users inspector ON i.inspected_by = inspector.id
  WHERE i.is_draft = false 
    AND i.signed_off_by IS NULL
    AND i.manager_decision IS NULL
  ORDER BY i.submitted_at ASC
`;

// Get items needing inspection (includes re-inspection after repair)
const getItemsNeedingInspection = `
  SELECT jei.*, 
    e.name as equipment_name,
    e.serial_number,
    e.asset_category,
    j.job_number,
    j.status as job_status,
    CASE WHEN jei.status = 'PENDING_REINSPECTION' THEN true ELSE false END as is_reinspection
  FROM job_equipment_items jei
  LEFT JOIN equipment e ON jei.equipment_id = e.id
  JOIN jobs j ON jei.job_id = j.id
  WHERE jei.job_id = $1 
    AND (
      (jei.status = 'DISBURSED' AND jei.inspection_status IS NULL)
      OR jei.status = 'PENDING_REINSPECTION'
    )
`;

const getAcknowledgedItems = `
  SELECT i.*, jei.*, 
    e.name as equipment_name,
    j.job_number
  FROM job_equipment_inspections i
  JOIN job_equipment_items jei ON i.job_equipment_item_id = jei.id
  LEFT JOIN equipment e ON jei.equipment_id = e.id
  JOIN jobs j ON jei.job_id = j.id
  WHERE j.id = $1 AND i.overall_status = 'ACKNOWLEDGED_PROCEED'
`;

// Failed items queries
const addFailedItem = `
  INSERT INTO inspection_failed_items 
    (inspection_id, checklist_item_id, checklist_item_label, resolution, engineer_notes)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *
`;

const updateFailedItem = `
  UPDATE inspection_failed_items 
  SET resolution = $2,
      engineer_notes = $3,
      updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

const getFailedItemsByInspection = `
  SELECT fi.*,
    manager.first_name || ' ' || manager.last_name as manager_name
  FROM inspection_failed_items fi
  LEFT JOIN users manager ON fi.manager_decision_by = manager.id
  WHERE fi.inspection_id = $1
  ORDER BY fi.created_at ASC
`;

const managerDecisionOnFailedItem = `
  UPDATE inspection_failed_items 
  SET manager_decision = $2::varchar,
      manager_notes = $3::text,
      manager_decision_by = $4,
      manager_decision_at = NOW(),
      maintenance_request_id = $5,
      updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

const markFailedItemRepaired = `
  UPDATE inspection_failed_items 
  SET repair_completed = true,
      repair_completed_at = NOW(),
      repair_verified_by = $2,
      updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

const deleteFailedItemsByInspection = `
  DELETE FROM inspection_failed_items WHERE inspection_id = $1
`;

module.exports = {
  create, update, findDraftByItemId, findByItemId, findById, 
  signOff, managerDecision, updateStatus, updateItemInspectionStatus,
  setItemUnderRepair, markRepairComplete,
  getByJobId, getPendingManagerReview, getItemsNeedingInspection, getAcknowledgedItems,
  addFailedItem, updateFailedItem, getFailedItemsByInspection, 
  managerDecisionOnFailedItem, markFailedItemRepaired, deleteFailedItemsByInspection
};
