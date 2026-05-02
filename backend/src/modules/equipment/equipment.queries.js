/**
 * Equipment SQL Queries
 * Post-Phase 5: Tools vs Equipment with Role-Based Filtering
 */

// =====================================================
// MAIN LIST QUERIES - Role-based filtering
// =====================================================

/**
 * Find all equipment with role-based visibility
 * Parameters: $1=assetCategory, $2=type, $3=status, $4=search, $5=userDepartment, 
 *             $6=canViewAll, $7=includeHidden, $8=limit, $9=offset
 */
const findAll = `
  SELECT 
    e.*,
    u.first_name || ' ' || u.last_name as assigned_to_name
  FROM equipment e
  LEFT JOIN users u ON e.assigned_to = u.id
  WHERE 
    -- Asset category filter (TOOL/EQUIPMENT or null for all)
    ($1::text IS NULL OR $1::text = '' OR e.asset_category::text = $1)
    -- Type filter
    AND ($2::text IS NULL OR $2::text = '' OR e.type::text = $2)
    -- Status filter
    AND ($3::text IS NULL OR $3::text = '' OR e.status::text = $3)
    -- Search filter
    AND ($4::text IS NULL OR $4::text = '' OR
         e.name ILIKE '%' || $4 || '%' OR
         e.serial_number ILIKE '%' || $4 || '%' OR
         e.asset_tag ILIKE '%' || $4 || '%')
    -- Role-based visibility:
    -- If canViewAll ($6) = true: show everything
    -- Otherwise: show own department + shared with user's department
    AND (
      $6::boolean = true 
      OR e.owning_department = $5
      OR e.shared_with_departments ? $5
    )
    -- Hidden filter: only show hidden if user has permission ($7)
    AND (
      e.is_hidden = false
      OR $7::boolean = true
    )
    -- Explicit department filter ($10) — narrows results when set
    AND ($10::text IS NULL OR $10::text = '' OR e.owning_department = $10)
  ORDER BY e.created_at DESC
  LIMIT $8 OFFSET $9
`;

/**
 * Count all with same filters
 */
const countAll = `
  SELECT COUNT(*) as total 
  FROM equipment e
  WHERE 
    ($1::text IS NULL OR $1::text = '' OR e.asset_category::text = $1)
    AND ($2::text IS NULL OR $2::text = '' OR e.type::text = $2)
    AND ($3::text IS NULL OR $3::text = '' OR e.status::text = $3)
    AND ($4::text IS NULL OR $4::text = '' OR
         e.name ILIKE '%' || $4 || '%' OR
         e.serial_number ILIKE '%' || $4 || '%' OR
         e.asset_tag ILIKE '%' || $4 || '%')
    AND (
      $6::boolean = true 
      OR e.owning_department = $5
      OR e.shared_with_departments ? $5
    )
    AND (
      e.is_hidden = false
      OR $7::boolean = true
    )
    AND ($8::text IS NULL OR $8::text = '' OR e.owning_department = $8)
`;

/**
 * Find by ID - no role filtering (permission check in service)
 */
const findById = `
  SELECT 
    e.*,
    u.first_name || ' ' || u.last_name as assigned_to_name,
    hider.first_name || ' ' || hider.last_name as hidden_by_name
  FROM equipment e
  LEFT JOIN users u ON e.assigned_to = u.id
  LEFT JOIN users hider ON e.hidden_by = hider.id
  WHERE e.id = $1
`;

// =====================================================
// CREATE / UPDATE QUERIES
// =====================================================

/**
 * Create new equipment
 */
const create = `
  INSERT INTO equipment (
    name, serial_number, asset_category, type, status, location,
    owning_department, quantity, cost,
    current_hours, maintenance_interval_hours, last_maintenance_date, 
    next_maintenance_due, notes, shared_with_departments
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
  RETURNING *
`;

/**
 * Update equipment
 */
const update = `
  UPDATE equipment SET
    name = COALESCE($2, name),
    serial_number = COALESCE($3, serial_number),
    asset_category = COALESCE($4, asset_category),
    type = COALESCE($5, type),
    status = COALESCE($6, status),
    location = COALESCE($7, location),
    owning_department = COALESCE($8, owning_department),
    quantity = COALESCE($9, quantity),
    cost = COALESCE($10, cost),
    notes = COALESCE($11, notes),
    shared_with_departments = COALESCE($12, shared_with_departments),
    updated_at = NOW()
  WHERE id = $1 
  RETURNING *
`;

/**
 * Update hours
 */
const updateHours = `
  UPDATE equipment SET 
    current_hours = current_hours + $2, 
    updated_at = NOW()
  WHERE id = $1 
  RETURNING *
`;

// =====================================================
// HIDE / UNHIDE QUERIES
// =====================================================

/**
 * Hide equipment
 */
const hide = `
  UPDATE equipment SET
    is_hidden = true,
    hidden_by = $2,
    hidden_at = NOW(),
    hidden_reason = $3,
    updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

/**
 * Unhide equipment
 */
const unhide = `
  UPDATE equipment SET
    is_hidden = false,
    hidden_by = NULL,
    hidden_at = NULL,
    hidden_reason = NULL,
    updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

// =====================================================
// SHARE QUERIES
// =====================================================

/**
 * Update sharing
 */
const updateSharing = `
  UPDATE equipment SET
    shared_with_departments = $2,
    updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

// =====================================================
// MAINTENANCE QUERIES
// =====================================================

const findMaintenanceDue = `
  SELECT * FROM equipment
  WHERE current_hours >= (next_maintenance_due - 50)
    OR last_maintenance_date < NOW() - INTERVAL '90 days'
  ORDER BY current_hours DESC
`;

const logHours = `
  INSERT INTO equipment_hours_log (equipment_id, hours_added, logged_by, job_id, notes)
  VALUES ($1, $2, $3, $4, $5) 
  RETURNING *
`;

const getHoursLog = `
  SELECT h.*, u.first_name || ' ' || u.last_name as logged_by_name
  FROM equipment_hours_log h
  LEFT JOIN users u ON h.logged_by = u.id
  WHERE h.equipment_id = $1
  ORDER BY h.created_at DESC
  LIMIT 50
`;

const logMaintenance = `
  INSERT INTO maintenance_log (equipment_id, maintenance_type, performed_by, hours_at_maintenance, notes)
  VALUES ($1, $2, $3, $4, $5) 
  RETURNING *
`;

const getMaintenanceLog = `
  SELECT m.*, u.first_name || ' ' || u.last_name as performed_by_name
  FROM maintenance_log m
  LEFT JOIN users u ON m.performed_by = u.id
  WHERE m.equipment_id = $1
  ORDER BY m.created_at DESC
`;

// =====================================================
// CUSTOM TYPES QUERIES
// =====================================================

const findAllCustomTypes = `
  SELECT ct.*, u.first_name || ' ' || u.last_name as created_by_name
  FROM equipment_custom_types ct
  LEFT JOIN users u ON ct.created_by = u.id
  WHERE ct.is_active = true
  ORDER BY ct.asset_category, ct.display_name
`;

const findCustomTypesByCategory = `
  SELECT ct.*, u.first_name || ' ' || u.last_name as created_by_name
  FROM equipment_custom_types ct
  LEFT JOIN users u ON ct.created_by = u.id
  WHERE ct.is_active = true AND ct.asset_category = $1
  ORDER BY ct.display_name
`;

const findCustomTypeById = `
  SELECT * FROM equipment_custom_types WHERE id = $1
`;

const findCustomTypeByName = `
  SELECT * FROM equipment_custom_types 
  WHERE name = $1 AND asset_category = $2
`;

const createCustomType = `
  INSERT INTO equipment_custom_types (name, display_name, asset_category, description, created_by)
  VALUES ($1, $2, $3, $4, $5)
  RETURNING *
`;

const deactivateCustomType = `
  UPDATE equipment_custom_types SET is_active = false WHERE id = $1 RETURNING *
`;

// =====================================================
// STATS QUERIES
// =====================================================

const getStats = `
  SELECT 
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE asset_category = 'EQUIPMENT') as equipment_count,
    COUNT(*) FILTER (WHERE asset_category = 'TOOL') as tool_count,
    COUNT(*) FILTER (WHERE status = 'Available') as available_count,
    COUNT(*) FILTER (WHERE status = 'In_Use') as in_use_count,
    COUNT(*) FILTER (WHERE status = 'Maintenance') as maintenance_count,
    COUNT(*) FILTER (WHERE is_hidden = true) as hidden_count,
    COALESCE(SUM(cost), 0) as total_value
  FROM equipment
`;

const getStatsByDepartment = `
  SELECT 
    owning_department,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE asset_category = 'EQUIPMENT') as equipment_count,
    COUNT(*) FILTER (WHERE asset_category = 'TOOL') as tool_count,
    COALESCE(SUM(cost), 0) as total_value
  FROM equipment
  WHERE owning_department IS NOT NULL
  GROUP BY owning_department
  ORDER BY total DESC
`;

module.exports = {
  // Main queries
  findAll,
  countAll,
  findById,
  create,
  update,
  updateHours,
  
  // Hide/Unhide
  hide,
  unhide,
  
  // Sharing
  updateSharing,
  
  // Maintenance
  findMaintenanceDue,
  logHours,
  getHoursLog,
  logMaintenance,
  getMaintenanceLog,
  
  // Custom types
  findAllCustomTypes,
  findCustomTypesByCategory,
  findCustomTypeById,
  findCustomTypeByName,
  createCustomType,
  deactivateCustomType,
  
  // Stats
  getStats,
  getStatsByDepartment
};
