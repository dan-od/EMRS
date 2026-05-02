/**
 * Equipment Hide Controller
 * Hide/Unhide equipment from staff view
 */
const equipmentService = require('./equipment.service');
const { logActivity } = require('../../utils/activityLogger');

/** POST /api/equipment/:id/hide */
const hide = async (req, res, next) => {
  try {
    const equipment = await equipmentService.getById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }
    
    const isOwnDept = equipment.owning_department === req.user.department;
    const canEditAll = equipmentService.canEditAll(req.user.role);
    
    if (!canEditAll && (!equipmentService.isManager(req.user.role) || !isOwnDept)) {
      return res.status(403).json({ success: false, message: 'Not authorized to hide this equipment' });
    }
    
    const updated = await equipmentService.hide(req.params.id, req.user.id, req.validatedBody.reason);

    await logActivity({
      userId: req.user.id, userEmail: req.user.email, userRole: req.user.role,
      action: 'EQUIPMENT_HIDDEN', entityType: 'EQUIPMENT',
      entityId: req.params.id, entityName: equipment.name,
      department: req.user.department, details: { reason: req.validatedBody.reason }, req
    });
    
    res.json({ success: true, data: updated, message: 'Equipment hidden from staff view' });
  } catch (error) { next(error); }
};

/** POST /api/equipment/:id/unhide */
const unhide = async (req, res, next) => {
  try {
    const equipment = await equipmentService.getById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }
    
    const updated = await equipmentService.unhide(req.params.id);
    
    await logActivity({
      userId: req.user.id, userEmail: req.user.email, userRole: req.user.role,
      action: 'EQUIPMENT_UNHIDDEN', entityType: 'EQUIPMENT',
      entityId: req.params.id, entityName: equipment.name,
      department: req.user.department, details: {}, req
    });
    
    res.json({ success: true, data: updated, message: 'Equipment is now visible' });
  } catch (error) { next(error); }
};

module.exports = { hide, unhide };
