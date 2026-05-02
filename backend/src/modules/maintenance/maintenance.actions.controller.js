/**
 * Maintenance Actions Controller
 * Mutations: create, update, startWork, complete, cancel, assignTechnician, addParts, createAdditionalRequest
 */

const maintenanceService = require('./maintenance.service');
const { logActivity, ACTIONS, ENTITY_TYPES } = require('../../utils/activityLogger');

const create = async (req, res, next) => {
  try {
    const data = { ...req.body, createdBy: req.user.id };
    const record = await maintenanceService.create(data);
    await logActivity({
      userId: req.user.id, userEmail: req.user.email, userRole: req.user.role,
      action: ACTIONS.MAINTENANCE_LOGGED, entityType: ENTITY_TYPES.MAINTENANCE_LOG,
      entityId: record.id, entityName: `${record.maintenance_type} - ${record.equipment_name}`,
      department: req.user.department, details: { maintenanceType: record.maintenance_type, equipmentId: record.equipment_id }, req
    });
    res.status(201).json(record);
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const record = await maintenanceService.update(req.params.id, req.body);
    if (!record) return res.status(404).json({ message: 'Not found' });
    res.json(record);
  } catch (error) { next(error); }
};

const startWork = async (req, res, next) => {
  try {
    const record = await maintenanceService.startWork(req.params.id, req.user.id);
    await logActivity({
      userId: req.user.id, userEmail: req.user.email, userRole: req.user.role,
      action: ACTIONS.MAINTENANCE_LOGGED, entityType: ENTITY_TYPES.MAINTENANCE_LOG,
      entityId: req.params.id, entityName: `${record.maintenance_type} - ${record.equipment_name}`,
      department: req.user.department, details: { status: 'In_Progress' }, req
    });
    res.json(record);
  } catch (error) { next(error); }
};

const complete = async (req, res, next) => {
  try {
    const data = { ...req.body, completedBy: req.user.id };
    const record = await maintenanceService.complete(req.params.id, data, req.user);
    await logActivity({
      userId: req.user.id, userEmail: req.user.email, userRole: req.user.role,
      action: ACTIONS.MAINTENANCE_LOGGED, entityType: ENTITY_TYPES.MAINTENANCE_LOG,
      entityId: req.params.id, entityName: `${record.maintenance_type} - ${record.equipment_name}`,
      department: req.user.department, details: { status: 'Completed', actualCost: data.cost, actualHours: data.labor_hours }, req
    });
    res.json(record);
  } catch (error) { next(error); }
};

const cancel = async (req, res, next) => {
  try {
    const record = await maintenanceService.cancel(req.params.id, req.body.reason, req.user.id);
    await logActivity({
      userId: req.user.id, userEmail: req.user.email, userRole: req.user.role,
      action: ACTIONS.MAINTENANCE_LOGGED, entityType: ENTITY_TYPES.MAINTENANCE_LOG,
      entityId: req.params.id, entityName: `${record.maintenance_type} - ${record.equipment_name}`,
      department: req.user.department, details: { status: 'Cancelled', reason: req.body.reason }, req
    });
    res.json(record);
  } catch (error) { next(error); }
};

const assignTechnician = async (req, res, next) => {
  try {
    const record = await maintenanceService.assignTechnician(req.params.id, req.body.technicianId, req.user.id);
    await logActivity({
      userId: req.user.id, userEmail: req.user.email, userRole: req.user.role,
      action: ACTIONS.MAINTENANCE_LOGGED, entityType: ENTITY_TYPES.MAINTENANCE_LOG,
      entityId: req.params.id, entityName: `${record.maintenance_type} - ${record.equipment_name}`,
      department: req.user.department, details: { assignedTo: req.body.technicianId }, req
    });
    res.json(record);
  } catch (error) { next(error); }
};

const addParts = async (req, res, next) => {
  try {
    const result = await maintenanceService.addParts(req.params.id, req.body.parts, req.user.id);
    res.json(result);
  } catch (error) { next(error); }
};

module.exports = { create, update, startWork, complete, cancel, assignTechnician, addParts };
