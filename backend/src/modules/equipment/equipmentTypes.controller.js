/**
 * Equipment Types Controller
 * Manage built-in and custom equipment types
 */
const equipmentService = require('./equipment.service');
const { logActivity } = require('../../utils/activityLogger');
const { EQUIPMENT_TYPES, TOOL_TYPES } = require('./equipment.validation');

/** GET /api/equipment/types */
const getTypes = async (req, res, next) => {
  try {
    const customTypes = await equipmentService.getAllCustomTypes(req.query.category);
    
    const builtInEquipment = EQUIPMENT_TYPES.map(t => ({ 
      name: t, 
      displayName: t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      assetCategory: 'EQUIPMENT',
      isBuiltIn: true 
    }));
    
    const builtInTools = TOOL_TYPES.map(t => ({ 
      name: t, 
      displayName: t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      assetCategory: 'TOOL',
      isBuiltIn: true 
    }));
    
    const customFormatted = customTypes.map(t => ({ ...t, isBuiltIn: false }));
    
    let result;
    if (req.query.category === 'EQUIPMENT') {
      result = [...builtInEquipment, ...customFormatted.filter(t => t.asset_category === 'EQUIPMENT')];
    } else if (req.query.category === 'TOOL') {
      result = [...builtInTools, ...customFormatted.filter(t => t.asset_category === 'TOOL')];
    } else {
      result = {
        equipment: [...builtInEquipment, ...customFormatted.filter(t => t.asset_category === 'EQUIPMENT')],
        tools: [...builtInTools, ...customFormatted.filter(t => t.asset_category === 'TOOL')]
      };
    }
    
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

/** POST /api/equipment/types */
const createType = async (req, res, next) => {
  try {
    const customType = await equipmentService.createCustomType(req.body, req.user.id);
    
    await logActivity({
      userId: req.user.id, userEmail: req.user.email, userRole: req.user.role,
      action: 'CUSTOM_TYPE_CREATED', entityType: 'EQUIPMENT',
      entityId: customType.id, entityName: customType.display_name,
      department: req.user.department,
      details: { name: customType.name, assetCategory: customType.asset_category },
      req
    });
    
    res.status(201).json({ success: true, data: customType });
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

module.exports = { getTypes, createType };
