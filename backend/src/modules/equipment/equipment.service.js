/**
 * Equipment Service
 * Post-Phase 5: Tools vs Equipment with Role-Based Access
 * 
 * ACTUAL DB ROLES: Super_Admin, Admin, Field_Engineer, IT_Support,
 * Operations_Manager, Purchasing_Manager, Accounts_Manager,
 * Safety_Manager, Maintenance_Manager,
 * Purchasing_Staff, Accounts_Staff, Safety_Officer, Staff
 */
const { query, transaction } = require('../../config/db');
const queries = require('./equipment.queries');

// =====================================================
// ROLE-BASED ACCESS HELPERS
// =====================================================

/**
 * Roles that can view ALL equipment (not just their department)
 */
const CAN_VIEW_ALL_ROLES = [
  'Super_Admin', 'Admin', 'IT_Support',
  'Purchasing_Manager', 'Purchasing_Staff',
  'Accounts_Manager', 'Accounts_Staff'
];

/**
 * Roles that can see hidden equipment
 */
const CAN_VIEW_HIDDEN_ROLES = [
  'Super_Admin', 'Admin', 'IT_Support',
  'Purchasing_Manager', 'Purchasing_Staff',
  'Operations_Manager', 'Accounts_Manager'
];

/**
 * Roles that can edit ANY equipment (not just their department)
 */
const CAN_EDIT_ALL_ROLES = [
  'Super_Admin', 'Admin', 'IT_Support',
  'Purchasing_Manager', 'Purchasing_Staff'
];

/**
 * Roles that can add equipment directly (without request)
 */
const CAN_ADD_DIRECTLY_ROLES = [
  'Super_Admin', 'Admin', 'IT_Manager', 'IT_Support',
  'Purchasing_Manager', 'Purchasing_Staff',
  'Operations_Manager', 'Accounts_Manager', 'Safety_Manager',
  'Maintenance_Manager', 'HR_Manager', 'Logistics_Manager', 'Workshop_Manager'
];

/**
 * Check if user can view all equipment
 */
const canViewAll = (role) => CAN_VIEW_ALL_ROLES.includes(role);

/**
 * Check if user can view hidden equipment
 */
const canViewHidden = (role) => CAN_VIEW_HIDDEN_ROLES.includes(role);

/**
 * Check if user can edit any equipment
 */
const canEditAll = (role) => CAN_EDIT_ALL_ROLES.includes(role);

/**
 * Check if user can add directly
 */
const canAddDirectly = (role) => CAN_ADD_DIRECTLY_ROLES.includes(role);

/**
 * Check if user is a manager
 */
const isManager = (role) => role && role.includes('Manager');

// =====================================================
// MAIN SERVICE FUNCTIONS
// =====================================================

/**
 * Get all equipment with role-based filtering
 */
const getAll = async (filters = {}, user) => {
  const {
    assetCategory, type, status, search, department,
    page = 1, limit = 20
  } = filters;
  const offset = (page - 1) * limit;

  const userCanViewAll = canViewAll(user.role);
  const userCanViewHidden = canViewHidden(user.role);

  const [equipmentResult, countResult] = await Promise.all([
    query(queries.findAll, [
      assetCategory || null,
      type || null,
      status || null,
      search || null,
      user.department,
      userCanViewAll,
      userCanViewHidden,
      limit,
      offset,
      department || null
    ]),
    query(queries.countAll, [
      assetCategory || null,
      type || null,
      status || null,
      search || null,
      user.department,
      userCanViewAll,
      userCanViewHidden,
      department || null
    ])
  ]);

  return {
    equipment: equipmentResult.rows,
    total: parseInt(countResult.rows[0].total),
    page,
    totalPages: Math.ceil(countResult.rows[0].total / limit)
  };
};

/**
 * Get equipment by ID
 */
const getById = async (id, user = null) => {
  const result = await query(queries.findById, [id]);
  const equipment = result.rows[0] || null;
  
  if (!equipment) return null;
  
  // If user provided, check visibility
  if (user) {
    const userCanViewAll = canViewAll(user.role);
    const userCanViewHidden = canViewHidden(user.role);
    
    // Check if user can see this equipment
    const isOwnDept = equipment.owning_department === user.department;
    const isShared = equipment.shared_with_departments?.includes(user.department);
    
    if (!userCanViewAll && !isOwnDept && !isShared) {
      return null; // No access
    }
    
    // Check hidden visibility
    if (equipment.is_hidden && !userCanViewHidden) {
      return null;
    }
  }
  
  return equipment;
};

/**
 * Create new equipment (Managers+ only)
 */
const create = async (data, user) => {
  // Determine department
  const department = canEditAll(user.role) 
    ? (data.owningDepartment || user.department)
    : user.department; // Non-purchasing users can only add to their own dept

  const result = await query(queries.create, [
    data.name,
    data.serialNumber || null,
    data.assetCategory,
    data.type,
    data.status || 'Available',
    data.location || null,
    department,
    data.quantity || 1,
    data.cost || null,
    data.currentHours || 0,
    data.maintenanceIntervalHours || null,
    data.lastMaintenanceDate || null,
    data.nextMaintenanceDue || null,
    data.notes || null,
    JSON.stringify(data.sharedWithDepartments || [])
  ]);
  
  return result.rows[0];
};

/**
 * Update equipment
 */
const update = async (id, data, user) => {
  // Get current equipment to check permissions
  const current = await getById(id);
  if (!current) throw new Error('Equipment not found');
  
  // Check edit permission
  const userCanEditAll = canEditAll(user.role);
  const isOwnDept = current.owning_department === user.department;
  
  if (!userCanEditAll && !isOwnDept && !isManager(user.role)) {
    throw new Error('Not authorized to edit this equipment');
  }
  
  // Non-purchasing managers can't change department
  const newDepartment = userCanEditAll 
    ? (data.owningDepartment || current.owning_department)
    : current.owning_department;

  const result = await query(queries.update, [
    id,
    data.name,
    data.serialNumber,
    data.assetCategory,
    data.type,
    data.status,
    data.location,
    newDepartment,
    data.quantity,
    data.cost,
    data.notes,
    data.sharedWithDepartments ? JSON.stringify(data.sharedWithDepartments) : null
  ]);
  
  return result.rows[0];
};

/**
 * Hide equipment
 */
const hide = async (id, userId, reason = null) => {
  const result = await query(queries.hide, [id, userId, reason]);
  return result.rows[0];
};

/**
 * Unhide equipment
 */
const unhide = async (id) => {
  const result = await query(queries.unhide, [id]);
  return result.rows[0];
};

/**
 * Update sharing
 */
const updateSharing = async (id, departments) => {
  const result = await query(queries.updateSharing, [
    id, 
    JSON.stringify(departments)
  ]);
  return result.rows[0];
};

/**
 * Log hours
 */
const logHours = async (id, hoursData) => {
  const { hours, loggedBy, jobId, notes } = hoursData;
  
  return await transaction(async (client) => {
    await client.query(queries.updateHours, [id, hours]);
    const logResult = await client.query(queries.logHours, [id, hours, loggedBy, jobId, notes]);
    const equipmentResult = await client.query(queries.findById, [id]);
    return { equipment: equipmentResult.rows[0], log: logResult.rows[0] };
  });
};

/**
 * Get maintenance due
 */
const getMaintenanceDue = async () => {
  const result = await query(queries.findMaintenanceDue);
  return result.rows;
};

/**
 * Get hours log
 */
const getHoursLog = async (equipmentId) => {
  const result = await query(queries.getHoursLog, [equipmentId]);
  return result.rows;
};

/**
 * Log maintenance
 */
const logMaintenance = async (equipmentId, data) => {
  const { maintenanceType, performedBy, hoursAtMaintenance, notes } = data;
  const result = await query(queries.logMaintenance, [
    equipmentId, maintenanceType, performedBy, hoursAtMaintenance, notes
  ]);
  return result.rows[0];
};

/**
 * Get maintenance log
 */
const getMaintenanceLog = async (equipmentId) => {
  const result = await query(queries.getMaintenanceLog, [equipmentId]);
  return result.rows;
};

/**
 * Get stats
 */
const getStats = async () => {
  const result = await query(queries.getStats);
  return result.rows[0];
};

/**
 * Get stats by department
 */
const getStatsByDepartment = async () => {
  const result = await query(queries.getStatsByDepartment);
  return result.rows;
};

// =====================================================
// CUSTOM TYPES
// =====================================================

/**
 * Get all custom types
 */
const getAllCustomTypes = async (assetCategory = null) => {
  if (assetCategory) {
    const result = await query(queries.findCustomTypesByCategory, [assetCategory]);
    return result.rows;
  }
  const result = await query(queries.findAllCustomTypes);
  return result.rows;
};

/**
 * Create custom type
 */
const createCustomType = async (data, userId) => {
  // Check if already exists
  const existing = await query(queries.findCustomTypeByName, [data.name, data.assetCategory]);
  if (existing.rows[0]) {
    throw new Error('A type with this name already exists');
  }
  
  const result = await query(queries.createCustomType, [
    data.name,
    data.displayName,
    data.assetCategory,
    data.description || null,
    userId
  ]);
  return result.rows[0];
};

/**
 * Deactivate custom type
 */
const deactivateCustomType = async (id) => {
  const result = await query(queries.deactivateCustomType, [id]);
  return result.rows[0];
};

module.exports = {
  // Main functions
  getAll,
  getById,
  create,
  update,
  hide,
  unhide,
  updateSharing,
  
  // Hours & Maintenance
  logHours,
  getMaintenanceDue,
  getHoursLog,
  logMaintenance,
  getMaintenanceLog,
  
  // Stats
  getStats,
  getStatsByDepartment,
  
  // Custom types
  getAllCustomTypes,
  createCustomType,
  deactivateCustomType,
  
  // Permission helpers (exported for controller use)
  canViewAll,
  canViewHidden,
  canEditAll,
  canAddDirectly,
  isManager
};
