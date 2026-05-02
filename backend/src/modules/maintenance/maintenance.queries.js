/**
 * Maintenance SQL Queries
 */

module.exports = {
  getAll: `
    SELECT 
      m.*,
      e.name as equipment_name,
      e.serial_number as equipment_serial,
      e.asset_category as equipment_category,
      u.first_name || ' ' || u.last_name as assigned_to_name,
      cb.first_name || ' ' || cb.last_name as created_by_name,
      r.id as linked_request_id,
      r.type as linked_request_type
    FROM maintenance_schedule m
    LEFT JOIN equipment e ON m.equipment_id = e.id
    LEFT JOIN users u ON m.assigned_to = u.id
    LEFT JOIN users cb ON m.created_by = cb.id
    LEFT JOIN requests r ON m.request_id = r.id
  `,
  
  getById: `
    SELECT 
      m.*,
      e.name as equipment_name,
      e.serial_number as equipment_serial,
      e.asset_category as equipment_category,
      e.current_hours as equipment_hours,
      u.first_name || ' ' || u.last_name as assigned_to_name,
      u.email as assigned_to_email,
      cb.first_name || ' ' || cb.last_name as created_by_name,
      comp.first_name || ' ' || comp.last_name as completed_by_name,
      r.id as linked_request_id,
      r.type as linked_request_type,
      r.status as linked_request_status,
      r.details as request_details,
      reqby.first_name || ' ' || reqby.last_name as request_created_by_name
    FROM maintenance_schedule m
    LEFT JOIN equipment e ON m.equipment_id = e.id
    LEFT JOIN users u ON m.assigned_to = u.id
    LEFT JOIN users cb ON m.created_by = cb.id
    LEFT JOIN users comp ON m.completed_by = comp.id
    LEFT JOIN requests r ON m.request_id = r.id
    LEFT JOIN users reqby ON r.requester_id = reqby.id
    WHERE m.id = $1
  `,
  
  getDue: `
    SELECT 
      m.*,
      e.name as equipment_name,
      e.serial_number as equipment_serial,
      e.current_hours as equipment_hours,
      u.first_name || ' ' || u.last_name as assigned_to_name
    FROM maintenance_schedule m
    LEFT JOIN equipment e ON m.equipment_id = e.id
    LEFT JOIN users u ON m.assigned_to = u.id
    WHERE m.status NOT IN ('Completed', 'Cancelled')
      AND m.scheduled_date <= CURRENT_DATE + INTERVAL '1 day' * $1
    ORDER BY m.scheduled_date ASC
  `,
  
  getSchedule: `
    SELECT 
      m.*,
      e.name as equipment_name
    FROM maintenance_schedule m
    LEFT JOIN equipment e ON m.equipment_id = e.id
    WHERE m.scheduled_date BETWEEN $1 AND $2
    ORDER BY m.scheduled_date ASC
  `,
  
  getByEquipment: `
    SELECT 
      m.*,
      u.first_name || ' ' || u.last_name as assigned_to_name,
      comp.first_name || ' ' || comp.last_name as completed_by_name
    FROM maintenance_schedule m
    LEFT JOIN users u ON m.assigned_to = u.id
    LEFT JOIN users comp ON m.completed_by = comp.id
    WHERE m.equipment_id = $1
    ORDER BY m.scheduled_date DESC
  `,
  
  create: `
    INSERT INTO maintenance_schedule (
      equipment_id, maintenance_type, description, scheduled_date,
      priority, estimated_hours, estimated_cost, assigned_to, notes, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id
  `,
  
  update: `
    UPDATE maintenance_schedule SET
      maintenance_type = $1,
      description = $2,
      scheduled_date = $3,
      priority = $4,
      estimated_hours = $5,
      estimated_cost = $6,
      notes = $7,
      updated_at = NOW()
    WHERE id = $8
  `,
  
  startWork: `
    UPDATE maintenance_schedule SET
      status = 'In_Progress',
      started_at = NOW(),
      started_by = $1,
      updated_at = NOW()
    WHERE id = $2
  `,
  
  complete: `
    UPDATE maintenance_schedule SET
      status = 'Completed',
      completion_notes = $1,
      parts_used = $2,
      actual_hours = $3,
      actual_cost = $4,
      completed_by = $5,
      completed_at = NOW(),
      updated_at = NOW()
    WHERE id = $6
  `,
  
  cancel: `
    UPDATE maintenance_schedule SET
      status = 'Cancelled',
      cancellation_reason = $1,
      cancelled_by = $2,
      cancelled_at = NOW(),
      updated_at = NOW()
    WHERE id = $3
  `,
  
  assignTechnician: `
    UPDATE maintenance_schedule SET
      assigned_to = $1,
      assigned_by = $2,
      assigned_at = NOW(),
      updated_at = NOW()
    WHERE id = $3
  `,
  
  addPart: `
    INSERT INTO maintenance_parts (
      maintenance_id, inventory_id, quantity, added_by
    ) VALUES ($1, $2, $3, $4)
  `,
  
  getStats: `
    SELECT
      COUNT(*) FILTER (WHERE status = 'Scheduled') as scheduled_count,
      COUNT(*) FILTER (WHERE status = 'In_Progress') as in_progress_count,
      COUNT(*) FILTER (WHERE status = 'Completed') as completed_count,
      COUNT(*) FILTER (WHERE scheduled_date < CURRENT_DATE AND status NOT IN ('Completed', 'Cancelled')) as overdue_count,
      COUNT(*) FILTER (WHERE status = 'Cancelled') as cancelled_count,
      COUNT(*) FILTER (WHERE scheduled_date <= CURRENT_DATE AND status = 'Scheduled') as due_today,
      COALESCE(SUM(actual_cost) FILTER (WHERE status = 'Completed' AND completed_at >= DATE_TRUNC('month', NOW())), 0) as month_cost
    FROM maintenance_schedule
  `,
  
  getHistory: `
    SELECT 
      action, old_values, new_values, 
      u.first_name || ' ' || u.last_name as performed_by_name,
      created_at
    FROM maintenance_history
    LEFT JOIN users u ON maintenance_history.performed_by = u.id
    WHERE maintenance_id = $1
    ORDER BY created_at DESC
  `
};
