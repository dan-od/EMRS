/**
 * Inspection Controller - Enhanced Pre-inspection checklist endpoints
 * Supports: Draft/autosave, individual item sign-off, repair workflow
 */
const inspectionService = require('../services/inspection.service');
const jobsService = require('../services/jobs.service');
const { AppError } = require('../../../middleware/errorHandler');
const { logActivity } = require('../../../utils/activityLogger');

// GET /jobs/:id/inspections/template
const getInspectionTemplate = async (req, res) => {
  const template = inspectionService.getChecklistTemplate();
  res.json({ template });
};

// GET /jobs/:id/inspections
const getJobInspections = async (req, res, next) => {
  try {
    const { id: jobId } = req.params;
    const inspections = await inspectionService.getInspectionsByJobId(jobId);
    res.json({ inspections });
  } catch (err) { next(err); }
};

// GET /jobs/:id/inspections/pending
const getPendingInspections = async (req, res, next) => {
  try {
    const { id: jobId } = req.params;
    const items = await inspectionService.getItemsNeedingInspection(jobId);
    res.json({ items });
  } catch (err) { next(err); }
};

// GET /jobs/:id/inspections/acknowledged
const getAcknowledgedItems = async (req, res, next) => {
  try {
    const { id: jobId } = req.params;
    const items = await inspectionService.getAcknowledgedItems(jobId);
    res.json({ items });
  } catch (err) { next(err); }
};

// GET /jobs/:id/items/:itemId/inspections
const getItemInspections = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const inspections = await inspectionService.getInspectionsByItemId(itemId);
    res.json({ inspections });
  } catch (err) { next(err); }
};

// GET /jobs/:id/items/:itemId/inspection/draft
const getOrCreateDraft = async (req, res, next) => {
  try {
    const { id: jobId, itemId } = req.params;
    const userId = req.user.id;
    
    const canAccess = await jobsService.canAccessJob(jobId, userId, req.user.role);
    if (!canAccess) throw new AppError('You do not have access to this job', 403);
    
    const draft = await inspectionService.getOrCreateDraft(itemId, userId);
    res.json({ draft });
  } catch (err) { next(err); }
};

// POST /jobs/:id/inspections/:inspectionId/autosave
const autosaveInspection = async (req, res, next) => {
  try {
    const { id: jobId, inspectionId } = req.params;
    const { checklist_data, failed_items, notes } = req.body;
    const userId = req.user.id;
    
    const canAccess = await jobsService.canAccessJob(jobId, userId, req.user.role);
    if (!canAccess) throw new AppError('You do not have access to this job', 403);
    
    const inspection = await inspectionService.autosaveInspection(
      inspectionId, checklist_data, failed_items, notes
    );
    
    res.json({ message: 'Autosaved', inspection });
  } catch (err) { next(err); }
};

// POST /jobs/:id/items/:itemId/inspect
const submitInspection = async (req, res, next) => {
  try {
    const { id: jobId, itemId } = req.params;
    const { checklist_data, failed_items, notes } = req.body;
    const userId = req.user.id;
    
    const canAccess = await jobsService.canAccessJob(jobId, userId, req.user.role);
    if (!canAccess) throw new AppError('You do not have access to this job', 403);
    
    const inspection = await inspectionService.createInspection(
      itemId, userId, checklist_data, failed_items, notes
    );
    
    await logActivity({
      userId,
      action: 'INSPECTION_SUBMITTED',
      targetType: 'job_equipment_item',
      targetId: itemId,
      details: {
        job_id: jobId,
        overall_status: inspection.overall_status,
        failed_count: failed_items?.length || 0,
        failed_items: failed_items?.map(f => ({ label: f.label, resolution: f.resolution, has_notes: !!f.notes }))
      }
    });
    
    res.status(201).json({ message: 'Inspection submitted successfully', inspection });
  } catch (err) { next(err); }
};

// POST /jobs/:id/inspections/:inspectionId/signoff
const signOffInspection = async (req, res, next) => {
  try {
    const { id: jobId, inspectionId } = req.params;
    const userId = req.user.id;
    
    const isManager = jobsService.isManager(req.user.role);
    const isSupervisor = await jobsService.isSupervisorOnJob(jobId, userId);
    
    if (!isManager && !isSupervisor) {
      throw new AppError('Only managers or supervisors can sign off inspections', 403);
    }
    
    const inspection = await inspectionService.signOffAll(inspectionId, userId);
    if (!inspection) throw new AppError('Inspection not found', 404);
    
    await logActivity({
      userId,
      action: 'INSPECTION_SIGNED_OFF_ALL',
      targetType: 'inspection',
      targetId: inspectionId,
      details: { job_id: jobId, overall_status: inspection.overall_status, signed_all: true }
    });
    
    res.json({ message: 'Inspection signed off successfully', inspection });
  } catch (err) { next(err); }
};

// GET /jobs/:id/inspections/:inspectionId/failed-items
const getFailedItems = async (req, res, next) => {
  try {
    const { inspectionId } = req.params;
    const failedItems = await inspectionService.getFailedItemsByInspection(inspectionId);
    res.json({ failed_items: failedItems });
  } catch (err) { next(err); }
};

// POST /jobs/:id/inspections/:inspectionId/items/:failedItemId/decision
const managerDecisionOnItem = async (req, res, next) => {
  try {
    const { id: jobId, inspectionId, failedItemId } = req.params;
    const { decision, notes } = req.body;
    const userId = req.user.id;
    
    const isManager = jobsService.isManager(req.user.role);
    if (!isManager) throw new AppError('Only managers can make decisions on inspection items', 403);
    
    if (!['APPROVED', 'APPROVED_REPAIR', 'REJECTED'].includes(decision)) {
      throw new AppError('Invalid decision. Must be APPROVED, APPROVED_REPAIR, or REJECTED', 400);
    }
    
    const failedItem = await inspectionService.managerDecisionOnItem(
      failedItemId, decision, notes, userId, inspectionId
    );
    
    await logActivity({
      userId,
      action: `INSPECTION_ITEM_${decision}`,
      targetType: 'inspection_failed_item',
      targetId: failedItemId,
      details: {
        job_id: jobId, inspection_id: inspectionId, decision, has_notes: !!notes,
        maintenance_request_created: decision === 'APPROVED_REPAIR' && !!failedItem.maintenance_request_id
      }
    });
    
    res.json({ message: 'Decision recorded', failed_item: failedItem });
  } catch (err) { next(err); }
};

// GET /inspections/pending-review
const getPendingManagerReview = async (req, res, next) => {
  try {
    const isManager = jobsService.isManager(req.user.role);
    if (!isManager) throw new AppError('Only managers can view pending reviews', 403);
    
    const inspections = await inspectionService.getPendingManagerReview();
    res.json({ inspections });
  } catch (err) { next(err); }
};

// POST /jobs/:id/items/:itemId/repair-complete
const markRepairComplete = async (req, res, next) => {
  try {
    const { id: jobId, itemId } = req.params;
    const { notes } = req.body;
    const userId = req.user.id;
    
    const item = await inspectionService.markRepairComplete(itemId, userId, notes);
    
    await logActivity({
      userId,
      action: 'REPAIR_COMPLETED',
      targetType: 'job_equipment_item',
      targetId: itemId,
      details: { job_id: jobId, ready_for_reinspection: true, notes }
    });
    
    res.json({ message: 'Repair marked complete. Item ready for re-inspection.', item });
  } catch (err) { next(err); }
};

module.exports = {
  getInspectionTemplate, getJobInspections, getPendingInspections, getAcknowledgedItems,
  getItemInspections, getOrCreateDraft, autosaveInspection, submitInspection,
  signOffInspection, getFailedItems, managerDecisionOnItem, getPendingManagerReview, markRepairComplete
};
