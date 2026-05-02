/**
 * Equipment Controller - Main CRUD Operations
 * Max 80 lines - Single responsibility
 */
const equipmentService = require('./equipment.service');
const { logActivity } = require('../../utils/activityLogger');

const formatCurrency = (amount) => {
  if (amount == null) return null;
  return `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
};

/** GET /api/equipment */
const getAll = async (req, res, next) => {
  try {
    const result = await equipmentService.getAll(req.query, req.user);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
};

/** GET /api/equipment/:id */
const getById = async (req, res, next) => {
  try {
    const equipment = await equipmentService.getById(req.params.id, req.user);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }
    res.json({ success: true, data: equipment });
  } catch (error) { next(error); }
};

/** POST /api/equipment */
const create = async (req, res, next) => {
  try {
    if (!equipmentService.canAddDirectly(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Use the request endpoint to submit equipment for approval' 
      });
    }
    
    const equipment = await equipmentService.create(req.validatedBody, req.user);
    
    await logActivity({
      userId: req.user.id, userEmail: req.user.email, userRole: req.user.role,
      action: 'EQUIPMENT_CREATED', entityType: 'EQUIPMENT',
      entityId: equipment.id, entityName: equipment.name,
      department: req.user.department,
      details: { 
        assetCategory: equipment.asset_category, type: equipment.type,
        quantity: equipment.quantity, cost: equipment.cost ? formatCurrency(equipment.cost) : null
      },
      req
    });
    
    res.status(201).json({ success: true, data: equipment });
  } catch (error) { next(error); }
};

/** PUT /api/equipment/:id */
const update = async (req, res, next) => {
  try {
    const oldEquipment = await equipmentService.getById(req.params.id);
    const equipment = await equipmentService.update(req.params.id, req.validatedBody, req.user);
    
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }
    
    const changes = buildChanges(oldEquipment, equipment);
    
    await logActivity({
      userId: req.user.id, userEmail: req.user.email, userRole: req.user.role,
      action: 'EQUIPMENT_UPDATED', entityType: 'EQUIPMENT',
      entityId: req.params.id, entityName: equipment.name,
      department: req.user.department, details: { changes }, req
    });
    
    res.json({ success: true, data: equipment });
  } catch (error) {
    if (error.message === 'Not authorized to edit this equipment') {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const buildChanges = (old, updated) => {
  const changes = {};
  if (old.name !== updated.name) changes.name = { from: old.name, to: updated.name };
  if (old.status !== updated.status) changes.status = { from: old.status, to: updated.status };
  if (Number(old.quantity) !== Number(updated.quantity)) changes.quantity = { from: old.quantity, to: updated.quantity };
  return changes;
};

module.exports = { getAll, getById, create, update, formatCurrency };
