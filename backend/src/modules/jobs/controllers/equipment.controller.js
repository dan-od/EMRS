/**
 * Jobs Controller - Equipment Items (Enhanced)
 * Full logging for all actions
 */
const service = require('../services');
const { query } = require('../../../config/db');
const { logActivity, ENTITY_TYPES, ACTIONS } = require('../../../utils/activityLogger');
const logger = require('../../../utils/logger');

const getEquipmentName = async (equipmentId) => {
  if (!equipmentId) return null;
  const result = await query('SELECT name, serial_number FROM equipment WHERE id = $1', [equipmentId]);
  return result.rows[0] ? `${result.rows[0].name} (${result.rows[0].serial_number})` : equipmentId;
};

const getJobInfo = async (jobId) => {
  const result = await query('SELECT job_number, client, location FROM jobs WHERE id = $1', [jobId]);
  return result.rows[0] || { job_number: jobId, client: '', location: '' };
};

const getUserJobRole = async (jobId, userId) => {
  const result = await query('SELECT role FROM job_team WHERE job_id = $1 AND user_id = $2', [jobId, userId]);
  return result.rows[0]?.role || null;
};

const logAction = async (req, action, entityId, entityName, details) => {
  try {
    await logActivity({
      userId: req.user.id, userEmail: req.user.email, userRole: req.user.role,
      department: req.user.department, action,
      entityType: ENTITY_TYPES.JOB, entityId, entityName, details, req
    });
  } catch (e) { logger.error('Log error', { message: e.message }); }
};

const getEquipmentItems = async (req, res, next) => {
  try {
    const items = await service.getEquipmentItems(req.params.id);
    res.json({ items });
  } catch (error) { next(error); }
};

const addInventoryItem = async (req, res, next) => {
  try {
    const jobRole = await getUserJobRole(req.params.id, req.user.id);
    const item = await service.addInventoryItem(req.params.id, req.body, { ...req.user, jobRole });
    const name = await getEquipmentName(req.body.equipment_id);
    const jobInfo = await getJobInfo(req.params.id);
    
    const action = req.body.item_type === 'MATERIAL_TOOL' ? ACTIONS.MATERIAL_ADDED_TO_JOB : ACTIONS.EQUIPMENT_ADDED_TO_JOB;
    await logAction(req, action, req.params.id, jobInfo.job_number, {
      jobNumber: jobInfo.job_number, client: jobInfo.client, location: jobInfo.location,
      itemName: name, itemType: req.body.item_type || 'EQUIPMENT', source: 'INVENTORY',
      quantity: req.body.quantity || 1, priority: req.body.priority,
      addedBy: { name: `${req.user.first_name} ${req.user.last_name}`, role: jobRole || req.user.role }
    });
    
    res.status(201).json({ item });
  } catch (error) { next(error); }
};

const addClientItem = async (req, res, next) => {
  try {
    const item = await service.addClientItem(req.params.id, req.body, req.user);
    const jobInfo = await getJobInfo(req.params.id);
    
    await logAction(req, ACTIONS.CLIENT_EQUIPMENT_ADDED, req.params.id, jobInfo.job_number, {
      jobNumber: jobInfo.job_number, client: jobInfo.client,
      itemName: req.body.client_equipment_name, itemType: req.body.item_type || 'EQUIPMENT',
      source: 'CLIENT', quantity: req.body.quantity || 1
    });
    
    res.status(201).json({ item });
  } catch (error) { next(error); }
};

const addNewRequest = async (req, res, next) => {
  try {
    const jobRole = await getUserJobRole(req.params.id, req.user.id);
    const item = await service.addNewRequest(req.params.id, req.body, { ...req.user, jobRole });
    const jobInfo = await getJobInfo(req.params.id);
    const needsSupervisor = ['CHIEF_OPERATOR', 'DAQ'].includes(jobRole);
    
    await logAction(req, needsSupervisor ? ACTIONS.EQUIPMENT_REQUEST_CREATED : ACTIONS.NEW_EQUIPMENT_REQUESTED, 
      req.params.id, jobInfo.job_number, {
        jobNumber: jobInfo.job_number, client: jobInfo.client,
        itemName: req.body.requested_item_name, itemType: req.body.item_type || 'EQUIPMENT',
        source: 'NEW_REQUEST', quantity: req.body.quantity || 1, priority: req.body.priority,
        specifications: req.body.requested_item_specs, reason: req.body.reason,
        requestedBy: { name: `${req.user.first_name} ${req.user.last_name}`, role: jobRole },
        requiresApproval: needsSupervisor ? ['SUPERVISOR', 'MANAGER'] : ['MANAGER']
      });
    
    res.status(201).json({ item });
  } catch (error) { next(error); }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await service.updateItem(req.params.itemId, req.body);
    res.json({ item });
  } catch (error) { next(error); }
};

const removeItem = async (req, res, next) => {
  try {
    const jobInfo = await getJobInfo(req.params.id);
    await service.removeItem(req.params.itemId);
    await logAction(req, ACTIONS.EQUIPMENT_REMOVED_FROM_JOB, req.params.id, jobInfo.job_number, {
      jobNumber: jobInfo.job_number, itemId: req.params.itemId, reason: req.body.reason
    });
    res.status(204).send();
  } catch (error) { next(error); }
};

const disburseItem = async (req, res, next) => {
  try {
    const item = await service.disburseItem(req.params.itemId, req.user.id, req.body.notes);
    await logAction(req, ACTIONS.ITEM_DISBURSED, item.job_id, item.job_number, {
      jobNumber: item.job_number, itemId: item.id,
      itemName: item.equipment_name || item.requested_item_name,
      itemType: item.item_type, serialNumber: item.serial_number,
      quantity: item.quantity, notes: req.body.notes,
      disbursedBy: { name: `${req.user.first_name} ${req.user.last_name}`, role: req.user.role }
    });
    res.json({ item, message: 'Disbursed successfully' });
  } catch (error) { next(error); }
};

const startSourcing = async (req, res, next) => {
  try {
    const item = await service.startSourcing(req.params.itemId, req.user.id, req.body.notes, req.body.estimated_arrival);
    await logAction(req, ACTIONS.ITEM_SOURCING_STARTED, item.job_id, item.job_number, {
      jobNumber: item.job_number, itemId: item.id, itemName: item.requested_item_name,
      quantity: item.quantity, estimatedArrival: req.body.estimated_arrival, notes: req.body.notes,
      sourcingBy: { name: `${req.user.first_name} ${req.user.last_name}`, role: req.user.role }
    });
    res.json({ item, message: 'Sourcing started' });
  } catch (error) { next(error); }
};

const itemArrived = async (req, res, next) => {
  try {
    const item = await service.itemArrived(req.params.itemId, req.user.id, req.body);
    await logAction(req, ACTIONS.ITEM_ARRIVED, item.job_id, item.job_number, {
      jobNumber: item.job_number, itemId: item.id, itemName: item.requested_item_name,
      quantity: item.quantity, linkedInventoryId: req.body.linked_inventory_id,
      vendor: req.body.vendor_name, poNumber: req.body.purchase_order_number,
      cost: req.body.procurement_cost,
      receivedBy: { name: `${req.user.first_name} ${req.user.last_name}`, role: req.user.role }
    });
    res.json({ item, message: 'Item arrived and linked' });
  } catch (error) { next(error); }
};

const disburseArrived = async (req, res, next) => {
  try {
    const item = await service.disburseArrived(req.params.itemId, req.user.id, req.body.notes);
    await logAction(req, ACTIONS.ITEM_DISBURSED, item.job_id, item.job_number, {
      jobNumber: item.job_number, itemId: item.id, itemName: item.requested_item_name,
      source: 'ARRIVED', quantity: item.quantity, notes: req.body.notes
    });
    res.json({ item, message: 'Disbursed successfully' });
  } catch (error) { next(error); }
};

const supervisorApprove = async (req, res, next) => {
  try {
    const item = await service.supervisorApprove(req.params.itemId, req.user.id, req.body.notes);
    const jobInfo = await getJobInfo(item.job_id);
    await logAction(req, ACTIONS.EQUIPMENT_REQUEST_SUPERVISOR_APPROVED, item.job_id, jobInfo.job_number, {
      jobNumber: jobInfo.job_number, itemId: item.id,
      itemName: item.requested_item_name || item.client_equipment_name,
      originalRequester: item.requested_by, notes: req.body.notes,
      approvedBy: { name: `${req.user.first_name} ${req.user.last_name}`, role: 'SUPERVISOR' }
    });
    res.json({ item, message: 'Approved by supervisor' });
  } catch (error) { next(error); }
};

const supervisorReject = async (req, res, next) => {
  try {
    const item = await service.supervisorReject(req.params.itemId, req.body.reason);
    const jobInfo = await getJobInfo(item.job_id);
    await logAction(req, ACTIONS.EQUIPMENT_REQUEST_SUPERVISOR_REJECTED, item.job_id, jobInfo.job_number, {
      jobNumber: jobInfo.job_number, itemId: item.id,
      itemName: item.requested_item_name, originalRequester: item.requested_by,
      reason: req.body.reason,
      rejectedBy: { name: `${req.user.first_name} ${req.user.last_name}`, role: 'SUPERVISOR' }
    });
    res.json({ item, message: 'Rejected by supervisor' });
  } catch (error) { next(error); }
};

const returnItem = async (req, res, next) => {
  try {
    const item = await service.returnItem(req.params.itemId, req.body.status, req.user.id, req.body.condition, req.body.hours_used);
    const jobInfo = await getJobInfo(item.job_id);
    await logAction(req, ACTIONS.ITEM_RETURN_INITIATED, item.job_id, jobInfo.job_number, {
      jobNumber: jobInfo.job_number, itemId: item.id,
      itemName: item.equipment_name || item.requested_item_name,
      serialNumber: item.serial_number, condition: req.body.condition, hoursUsed: req.body.hours_used,
      initiatedBy: { name: `${req.user.first_name} ${req.user.last_name}`, role: req.user.role }
    });
    res.json({ item, message: 'Return recorded' });
  } catch (error) { next(error); }
};

const getPurchasingQueue = async (req, res, next) => {
  try {
    const items = await service.getPurchasingQueue();
    res.json({ items });
  } catch (error) { next(error); }
};

const getPurchasingStats = async (req, res, next) => {
  try {
    const stats = await service.getPurchasingStats();
    res.json({ stats });
  } catch (error) { next(error); }
};

const getItemHistory = async (req, res, next) => {
  try {
    const history = await service.getItemHistory(req.params.itemId);
    res.json({ history });
  } catch (error) { next(error); }
};

// ============================================
// MANAGER APPROVAL FOR ADDITIONAL REQUESTS
// ============================================
const getPendingManagerApproval = async (req, res, next) => {
  try {
    const items = await service.getPendingManagerApproval();
    res.json({ items });
  } catch (error) { next(error); }
};

const managerApproveRequest = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { notes } = req.body;
    const item = await service.managerApproveRequest(itemId, req.user.id, notes);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found or already processed' });
    }
    
    const jobInfo = await getJobInfo(item.job_id);
    await logAction(req, 'EQUIPMENT_REQUEST_APPROVED', item.job_id, jobInfo.job_number, {
      itemId,
      itemName: item.requested_item_name || item.equipment_name,
      source: item.source,
      notes
    });
    
    res.json({ message: 'Request approved', item });
  } catch (error) { next(error); }
};

const managerRejectRequest = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { reason } = req.body;
    const item = await service.managerRejectRequest(itemId, req.user.id, reason);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found or already processed' });
    }
    
    const jobInfo = await getJobInfo(item.job_id);
    await logAction(req, 'EQUIPMENT_REQUEST_REJECTED', item.job_id, jobInfo.job_number, {
      itemId,
      itemName: item.requested_item_name || item.equipment_name,
      source: item.source,
      reason
    });
    
    res.json({ message: 'Request rejected', item });
  } catch (error) { next(error); }
};

module.exports = {
  getEquipmentItems, addInventoryItem, addClientItem, addNewRequest,
  updateItem, removeItem, disburseItem, startSourcing, itemArrived,
  disburseArrived, supervisorApprove, supervisorReject, returnItem,
  getPurchasingQueue, getPurchasingStats, getItemHistory,
  getPendingManagerApproval, managerApproveRequest, managerRejectRequest
};
