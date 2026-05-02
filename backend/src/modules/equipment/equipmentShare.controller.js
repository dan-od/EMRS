/**
 * Equipment Share Controller
 * Share equipment with other departments
 */
const equipmentService = require('./equipment.service');
const { logActivity } = require('../../utils/activityLogger');

/** POST /api/equipment/:id/share */
const share = async (req, res, next) => {
  try {
    const equipment = await equipmentService.getById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }
    
    const isOwnDept = equipment.owning_department === req.user.department;
    const canEditAll = equipmentService.canEditAll(req.user.role);
    
    if (!canEditAll && (!equipmentService.isManager(req.user.role) || !isOwnDept)) {
      return res.status(403).json({ success: false, message: 'Not authorized to share this equipment' });
    }
    
    const oldSharing = equipment.shared_with_departments || [];
    const updated = await equipmentService.updateSharing(req.params.id, req.validatedBody.departments);

    await logActivity({
      userId: req.user.id, userEmail: req.user.email, userRole: req.user.role,
      action: 'EQUIPMENT_SHARED', entityType: 'EQUIPMENT',
      entityId: req.params.id, entityName: equipment.name,
      department: req.user.department,
      details: { previousDepartments: oldSharing, newDepartments: req.validatedBody.departments },
      req
    });
    
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

module.exports = { share };
