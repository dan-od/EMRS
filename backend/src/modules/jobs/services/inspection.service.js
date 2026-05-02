/**
 * Inspection Service - Enhanced Pre-inspection checklist operations
 * Supports: Draft/autosave, individual item sign-off, repair workflow
 */
const { query, transaction } = require('../../../config/db');
const inspectionQueries = require('../queries/inspection.queries');

// Default checklist template
const CHECKLIST_TEMPLATE = {
  general: {
    label: 'General Condition',
    items: [
      { id: 'visual_inspection', label: 'Visual inspection passed (no damage, cracks, corrosion)' },
      { id: 'components_present', label: 'All components present and accounted for' },
      { id: 'serial_verified', label: 'Serial number verified matches documentation' },
      { id: 'calibration_current', label: 'Calibration/certification current (if applicable)' }
    ]
  },
  safety: {
    label: 'Safety',
    items: [
      { id: 'warning_labels', label: 'Warning labels present and legible' },
      { id: 'safety_guards', label: 'Safety guards in place' },
      { id: 'emergency_shutoff', label: 'Emergency shutoff accessible and functional' },
      { id: 'safety_equipment', label: 'Required safety equipment present' }
    ]
  },
  operational: {
    label: 'Operational Readiness',
    items: [
      { id: 'no_leaks', label: 'No leaks detected' },
      { id: 'connections_secure', label: 'Connections secure and properly fitted' },
      { id: 'pressure_ratings', label: 'Pressure ratings appropriate for job' },
      { id: 'functional_test', label: 'Functional test passed' }
    ]
  }
};

const getChecklistTemplate = () => CHECKLIST_TEMPLATE;

/**
 * Get or create draft inspection for autosave
 */
const getOrCreateDraft = async (itemId, userId) => {
  const existingDraft = await query(inspectionQueries.findDraftByItemId, [itemId, userId]);
  if (existingDraft.rows[0]) {
    return existingDraft.rows[0];
  }
  
  const result = await query(inspectionQueries.create, [
    itemId, userId, JSON.stringify({}), JSON.stringify([]),
    null, 'PENDING', true, null
  ]);
  
  return result.rows[0];
};

/**
 * Autosave inspection progress
 */
const autosaveInspection = async (inspectionId, checklistData, failedItems, notes) => {
  const overallStatus = determineOverallStatus(failedItems);
  
  const result = await query(inspectionQueries.update, [
    inspectionId, JSON.stringify(checklistData), JSON.stringify(failedItems || []),
    notes, overallStatus, true
  ]);
  
  return result.rows[0];
};

/**
 * Submit inspection for manager review
 */
const submitInspection = async (inspectionId, checklistData, failedItems, notes) => {
  const overallStatus = determineOverallStatus(failedItems);
  
  return await transaction(async (client) => {
    const result = await client.query(inspectionQueries.update, [
      inspectionId, JSON.stringify(checklistData), JSON.stringify(failedItems || []),
      notes, overallStatus, false
    ]);
    
    const inspection = result.rows[0];
    
    if (failedItems && failedItems.length > 0) {
      await client.query(inspectionQueries.deleteFailedItemsByInspection, [inspectionId]);
      
      for (const item of failedItems) {
        await client.query(inspectionQueries.addFailedItem, [
          inspectionId, item.item_id, item.label, item.resolution, item.notes || item.reason || null
        ]);
      }
    }
    
    await client.query(inspectionQueries.updateItemInspectionStatus, [
      inspection.job_equipment_item_id, inspectionId, 'PENDING_REVIEW'
    ]);
    
    return inspection;
  });
};

/**
 * Create and submit inspection in one go
 */
const createInspection = async (itemId, inspectedBy, checklistData, failedItems, notes) => {
  const overallStatus = determineOverallStatus(failedItems);
  
  return await transaction(async (client) => {
    const result = await client.query(inspectionQueries.create, [
      itemId, inspectedBy, JSON.stringify(checklistData), JSON.stringify(failedItems || []),
      notes, overallStatus, false, new Date()
    ]);
    
    const inspection = result.rows[0];
    
    if (failedItems && failedItems.length > 0) {
      for (const item of failedItems) {
        await client.query(inspectionQueries.addFailedItem, [
          inspection.id, item.item_id, item.label, item.resolution, item.notes || item.reason || null
        ]);
      }
    }
    
    await client.query(inspectionQueries.updateItemInspectionStatus, [
      itemId, inspection.id, overallStatus
    ]);
    
    return inspection;
  });
};

/**
 * Manager sign-off - approve all items
 */
const signOffAll = async (inspectionId, managerId) => {
  return await transaction(async (client) => {
    const result = await client.query(inspectionQueries.signOff, [inspectionId, managerId, true]);
    const inspection = result.rows[0];
    
    const failedItemsResult = await client.query(inspectionQueries.getFailedItemsByInspection, [inspectionId]);
    const failedItems = failedItemsResult.rows;
    
    for (const item of failedItems) {
      await client.query(inspectionQueries.managerDecisionOnFailedItem, [
        item.id, item.resolution === 'REPAIR' ? 'APPROVED_REPAIR' : 'APPROVED', null, managerId, null
      ]);
    }
    
    if (inspection.overall_status === 'FLAGGED_REPAIR') {
      const maintenanceRequest = await createMaintenanceRequest(client, inspection, failedItems, managerId);
      await client.query(inspectionQueries.setItemUnderRepair, [
        inspection.job_equipment_item_id, maintenanceRequest?.id || null, 'Flagged during pre-inspection'
      ]);
    } else {
      await client.query(inspectionQueries.updateItemInspectionStatus, [
        inspection.job_equipment_item_id, inspectionId, inspection.overall_status
      ]);
    }
    
    return inspection;
  });
};

/**
 * Manager decision on individual failed item
 */
const managerDecisionOnItem = async (failedItemId, decision, notes, managerId, inspectionId) => {
  return await transaction(async (client) => {
    let maintenanceRequestId = null;
    
    if (decision === 'APPROVED_REPAIR') {
      const inspResult = await client.query(inspectionQueries.findById, [inspectionId]);
      const inspection = inspResult.rows[0];
      const failedItemResult = await client.query('SELECT * FROM inspection_failed_items WHERE id = $1', [failedItemId]);
      const failedItem = failedItemResult.rows[0];
      
      if (inspection && failedItem) {
        const maintenanceRequest = await createMaintenanceRequestForItem(client, inspection, failedItem, managerId);
        maintenanceRequestId = maintenanceRequest?.id;
      }
    }
    
    const result = await client.query(inspectionQueries.managerDecisionOnFailedItem, [
      failedItemId, decision, notes, managerId, maintenanceRequestId
    ]);
    
    const allDecided = await checkAllItemsDecided(client, inspectionId);
    if (allDecided) {
      await updateInspectionAfterAllDecisions(client, inspectionId, managerId);
    }
    
    return result.rows[0];
  });
};

const checkAllItemsDecided = async (client, inspectionId) => {
  const result = await client.query(
    'SELECT COUNT(*) as pending FROM inspection_failed_items WHERE inspection_id = $1 AND manager_decision IS NULL',
    [inspectionId]
  );
  return parseInt(result.rows[0].pending) === 0;
};

const updateInspectionAfterAllDecisions = async (client, inspectionId, managerId) => {
  const failedItems = await client.query(inspectionQueries.getFailedItemsByInspection, [inspectionId]);
  const inspection = await client.query(inspectionQueries.findById, [inspectionId]);
  
  const hasApprovedRepairs = failedItems.rows.some(i => i.manager_decision === 'APPROVED_REPAIR');
  const allApproved = failedItems.rows.every(i => 
    i.manager_decision === 'APPROVED' || i.manager_decision === 'APPROVED_REPAIR'
  );
  
  if (hasApprovedRepairs) {
    await client.query(inspectionQueries.setItemUnderRepair, [
      inspection.rows[0].job_equipment_item_id, null, 'Approved for repair by manager'
    ]);
  } else if (allApproved) {
    await client.query(inspectionQueries.signOff, [inspectionId, managerId, false]);
    await client.query(inspectionQueries.updateItemInspectionStatus, [
      inspection.rows[0].job_equipment_item_id, inspectionId, inspection.rows[0].overall_status
    ]);
  }
};

const createMaintenanceRequest = async (client, inspection, failedItems, managerId) => {
  const repairItems = failedItems.filter(i => i.resolution === 'REPAIR');
  if (repairItems.length === 0) return null;
  
  const description = repairItems.map(i => 
    `• ${i.checklist_item_label}${i.engineer_notes ? ': ' + i.engineer_notes : ''}`
  ).join('\n');
  
  // Create maintenance request in the main requests system
  const result = await client.query(`
    INSERT INTO requests (
      requester_id, type, priority, details, status, 
      job_id, maintenance_category, maintenance_routes_to
    )
    VALUES ($1, 'Maintenance', 'High', $2, 'Pending',
      (SELECT job_id FROM job_equipment_items WHERE id = $3),
      'Repair', 'Engineering'
    ) RETURNING *
  `, [
    managerId,
    JSON.stringify({
      title: `Pre-inspection repair: ${inspection.equipment_name || 'Equipment'}`,
      description: description,
      equipment_name: inspection.equipment_name,
      serial_number: inspection.serial_number,
      job_number: inspection.job_number,
      job_equipment_item_id: inspection.job_equipment_item_id,
      failed_items: repairItems.map(i => ({
        label: i.checklist_item_label,
        notes: i.engineer_notes
      }))
    }),
    inspection.job_equipment_item_id
  ]);
  
  // Also update the equipment status in the main equipment table if linked
  if (inspection.equipment_id) {
    await client.query(`
      UPDATE equipment SET status = 'Under_Repair', updated_at = NOW()
      WHERE id = $1
    `, [inspection.equipment_id]);
  }
  
  return result.rows[0];
};

const createMaintenanceRequestForItem = async (client, inspection, failedItem, managerId) => {
  // Create maintenance request in the main requests system
  const result = await client.query(`
    INSERT INTO requests (
      requester_id, type, priority, details, status,
      job_id, maintenance_category, maintenance_routes_to
    )
    VALUES ($1, 'Maintenance', 'High', $2, 'Pending',
      (SELECT job_id FROM job_equipment_items WHERE id = $3),
      'Repair', 'Engineering'
    ) RETURNING *
  `, [
    managerId,
    JSON.stringify({
      title: `Pre-inspection repair: ${inspection.equipment_name || 'Equipment'} - ${failedItem.checklist_item_label}`,
      description: failedItem.engineer_notes || failedItem.checklist_item_label,
      equipment_name: inspection.equipment_name,
      serial_number: inspection.serial_number,
      job_number: inspection.job_number,
      job_equipment_item_id: inspection.job_equipment_item_id,
      failed_item: {
        id: failedItem.id,
        label: failedItem.checklist_item_label,
        notes: failedItem.engineer_notes
      }
    }),
    inspection.job_equipment_item_id
  ]);
  
  // Also update the equipment status in the main equipment table if linked
  if (inspection.equipment_id) {
    await client.query(`
      UPDATE equipment SET status = 'Under_Repair', updated_at = NOW()
      WHERE id = $1
    `, [inspection.equipment_id]);
  }
  
  return result.rows[0];
};

const markRepairComplete = async (itemId, verifiedBy, notes) => {
  return await transaction(async (client) => {
    // Update job equipment item
    const result = await client.query(inspectionQueries.markRepairComplete, [itemId]);
    const item = result.rows[0];
    
    // Get the equipment_id and repair_request_id
    const itemData = await client.query(
      'SELECT equipment_id, repair_request_id FROM job_equipment_items WHERE id = $1',
      [itemId]
    );
    
    if (itemData.rows[0]?.equipment_id) {
      // Update main equipment status back to Available (will need re-inspection)
      await client.query(`
        UPDATE equipment SET status = 'Available', updated_at = NOW()
        WHERE id = $1
      `, [itemData.rows[0].equipment_id]);
    }
    
    // If there's a linked maintenance request, mark it as completed
    if (itemData.rows[0]?.repair_request_id) {
      await client.query(`
        UPDATE requests SET 
          status = 'Completed',
          return_confirmed_at = NOW(),
          return_confirmed_by = $2,
          return_notes = $3,
          is_active = false,
          updated_at = NOW()
        WHERE id = $1
      `, [itemData.rows[0].repair_request_id, verifiedBy, notes || 'Repair completed']);
    }
    
    return item;
  });
};

const determineOverallStatus = (failedItems) => {
  if (!failedItems || failedItems.length === 0) return 'PASSED';
  const hasRepair = failedItems.some(f => f.resolution === 'REPAIR');
  const hasAcknowledge = failedItems.some(f => f.resolution === 'ACKNOWLEDGE');
  if (hasRepair) return 'FLAGGED_REPAIR';
  if (hasAcknowledge) return 'ACKNOWLEDGED_PROCEED';
  return 'PASSED';
};

// Getters
const getInspectionsByItemId = async (itemId) => {
  const result = await query(inspectionQueries.findByItemId, [itemId]);
  return result.rows;
};

const getInspectionById = async (inspectionId) => {
  const result = await query(inspectionQueries.findById, [inspectionId]);
  return result.rows[0];
};

const getInspectionsByJobId = async (jobId) => {
  const result = await query(inspectionQueries.getByJobId, [jobId]);
  return result.rows;
};

const getItemsNeedingInspection = async (jobId) => {
  const result = await query(inspectionQueries.getItemsNeedingInspection, [jobId]);
  return result.rows;
};

const getAcknowledgedItems = async (jobId) => {
  const result = await query(inspectionQueries.getAcknowledgedItems, [jobId]);
  return result.rows;
};

const getPendingManagerReview = async () => {
  const result = await query(inspectionQueries.getPendingManagerReview, []);
  return result.rows;
};

const getFailedItemsByInspection = async (inspectionId) => {
  const result = await query(inspectionQueries.getFailedItemsByInspection, [inspectionId]);
  return result.rows;
};

const signOffInspection = async (inspectionId, supervisorId) => signOffAll(inspectionId, supervisorId);

module.exports = {
  CHECKLIST_TEMPLATE, getChecklistTemplate, getOrCreateDraft, autosaveInspection,
  submitInspection, createInspection, signOffAll, signOffInspection, managerDecisionOnItem,
  markRepairComplete, getInspectionsByItemId, getInspectionById, getInspectionsByJobId,
  getItemsNeedingInspection, getAcknowledgedItems, getPendingManagerReview, getFailedItemsByInspection
};
