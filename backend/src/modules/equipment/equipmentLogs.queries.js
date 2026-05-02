/**
 * Equipment Logs SQL Queries
 */

module.exports = {
  // =====================================================
  // GENERAL LOG QUERIES
  // =====================================================
  
  getGeneralLogs: `
    SELECT 
      gl.*,
      e.name as equipment_name,
      e.serial_number as equipment_serial
    FROM equipment_general_log gl
    LEFT JOIN equipment e ON gl.equipment_id = e.id
    WHERE gl.equipment_id = $1
    ORDER BY gl.entry_date DESC
    LIMIT $2 OFFSET $3
  `,
  
  countGeneralLogs: `
    SELECT COUNT(*) as total
    FROM equipment_general_log
    WHERE equipment_id = $1
  `,
  
  getGeneralLogById: `
    SELECT 
      gl.*,
      e.name as equipment_name
    FROM equipment_general_log gl
    LEFT JOIN equipment e ON gl.equipment_id = e.id
    WHERE gl.id = $1
  `,
  
  createGeneralLog: `
    INSERT INTO equipment_general_log (
      equipment_id, entry_type, description, source, reference_id, reference_type,
      created_by, user_name, user_email, user_role, user_department,
      entry_date, location_from, location_to, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *
  `,
  
  // =====================================================
  // MAINTENANCE LOG QUERIES
  // =====================================================
  
  getMaintenanceLogs: `
    SELECT 
      ml.*,
      e.name as equipment_name,
      e.serial_number as equipment_serial,
      ms.maintenance_type as linked_maintenance_type,
      ms.status as linked_maintenance_status
    FROM equipment_maintenance_log ml
    LEFT JOIN equipment e ON ml.equipment_id = e.id
    LEFT JOIN maintenance_schedule ms ON ml.maintenance_id = ms.id
    WHERE ml.equipment_id = $1
    ORDER BY ml.entry_date DESC
    LIMIT $2 OFFSET $3
  `,
  
  countMaintenanceLogs: `
    SELECT COUNT(*) as total
    FROM equipment_maintenance_log
    WHERE equipment_id = $1
  `,
  
  getMaintenanceLogById: `
    SELECT 
      ml.*,
      e.name as equipment_name,
      ms.maintenance_type as linked_maintenance_type
    FROM equipment_maintenance_log ml
    LEFT JOIN equipment e ON ml.equipment_id = e.id
    LEFT JOIN maintenance_schedule ms ON ml.maintenance_id = ms.id
    WHERE ml.id = $1
  `,
  
  createMaintenanceLog: `
    INSERT INTO equipment_maintenance_log (
      equipment_id, entry_type, description, source, maintenance_id,
      created_by, user_name, user_email, user_role, user_department,
      equipment_hours, labor_hours, cost, parts_used, entry_date, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *
  `,
  
  // =====================================================
  // FILTERED QUERIES (for filters)
  // =====================================================
  
  getGeneralLogsFiltered: `
    SELECT 
      gl.*,
      e.name as equipment_name
    FROM equipment_general_log gl
    LEFT JOIN equipment e ON gl.equipment_id = e.id
    WHERE gl.equipment_id = $1
      AND ($2::text IS NULL OR gl.entry_type = $2)
      AND ($3::timestamp IS NULL OR gl.entry_date >= $3)
      AND ($4::timestamp IS NULL OR gl.entry_date <= $4)
    ORDER BY gl.entry_date DESC
    LIMIT $5 OFFSET $6
  `,
  
  getMaintenanceLogsFiltered: `
    SELECT 
      ml.*,
      e.name as equipment_name,
      ms.maintenance_type as linked_maintenance_type
    FROM equipment_maintenance_log ml
    LEFT JOIN equipment e ON ml.equipment_id = e.id
    LEFT JOIN maintenance_schedule ms ON ml.maintenance_id = ms.id
    WHERE ml.equipment_id = $1
      AND ($2::text IS NULL OR ml.entry_type = $2)
      AND ($3::timestamp IS NULL OR ml.entry_date >= $3)
      AND ($4::timestamp IS NULL OR ml.entry_date <= $4)
    ORDER BY ml.entry_date DESC
    LIMIT $5 OFFSET $6
  `
};
