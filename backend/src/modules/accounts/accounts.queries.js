/**
 * Accounts SQL Queries
 * Shows work orders with cost estimates (manager approved) and final costs (purchasing approved)
 */

// Get work orders with costs (manager estimated or purchasing confirmed)
const getCompletedWorkOrders = `
  SELECT 
    m.id,
    m.equipment_id,
    m.maintenance_type,
    m.description,
    m.status,
    m.priority,
    m.estimated_cost,
    m.actual_cost,
    m.accounts_final_payment,
    m.accounts_payment_date,
    m.accounts_payment_notes,
    m.created_at,
    m.completed_at,
    m.request_id,
    e.name as equipment_name,
    e.serial_number as equipment_serial,
    e.type as equipment_type,
    e.asset_category as equipment_category,
    r.manager_cost_estimate,
    r.purchasing_final_cost,
    r.details as request_details,
    r.status as request_status,
    u.first_name || ' ' || u.last_name as requester_name,
    u.department as requester_department,
    comp.first_name || ' ' || comp.last_name as completed_by_name,
    rec.first_name || ' ' || rec.last_name as recorded_by_name
  FROM maintenance_schedule m
  LEFT JOIN equipment e ON m.equipment_id = e.id
  LEFT JOIN requests r ON m.request_id = r.id
  LEFT JOIN users u ON r.requester_id = u.id
  LEFT JOIN users comp ON m.completed_by = comp.id
  LEFT JOIN users rec ON m.accounts_recorded_by = rec.id
  WHERE (
    r.manager_cost_estimate IS NOT NULL 
    OR r.purchasing_final_cost IS NOT NULL
    OR m.actual_cost IS NOT NULL
    OR m.status = 'Completed'
  )
`;

// Get single work order by ID
const getWorkOrderById = `
  SELECT 
    m.*,
    e.name as equipment_name,
    e.serial_number as equipment_serial,
    e.type as equipment_type,
    e.asset_category as equipment_category,
    r.manager_cost_estimate,
    r.purchasing_final_cost,
    r.details as request_details,
    r.status as request_status,
    u.first_name || ' ' || u.last_name as requester_name,
    u.department as requester_department,
    u.email as requester_email,
    comp.first_name || ' ' || comp.last_name as completed_by_name,
    rec.first_name || ' ' || rec.last_name as recorded_by_name
  FROM maintenance_schedule m
  LEFT JOIN equipment e ON m.equipment_id = e.id
  LEFT JOIN requests r ON m.request_id = r.id
  LEFT JOIN users u ON r.requester_id = u.id
  LEFT JOIN users comp ON m.completed_by = comp.id
  LEFT JOIN users rec ON m.accounts_recorded_by = rec.id
  WHERE m.id = $1
`;

// Record payment
const recordPayment = `
  UPDATE maintenance_schedule SET
    accounts_final_payment = $2,
    accounts_payment_date = NOW(),
    accounts_payment_notes = $3,
    accounts_recorded_by = $4,
    updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

// Cost summary stats - includes estimates and actuals
const getCostStats = `
  SELECT
    -- Total counts
    COUNT(*) as total_work_orders,
    COUNT(*) FILTER (WHERE m.accounts_final_payment IS NOT NULL) as paid_count,
    COUNT(*) FILTER (WHERE m.accounts_final_payment IS NULL) as unpaid_count,
    COUNT(*) FILTER (WHERE m.status = 'Completed') as completed_count,
    COUNT(*) FILTER (WHERE m.status IN ('In_Progress', 'Scheduled')) as in_progress_count,
    
    -- Estimated costs (from manager)
    COALESCE(SUM(r.manager_cost_estimate), 0) as total_estimated,
    
    -- Confirmed costs (from purchasing)
    COALESCE(SUM(r.purchasing_final_cost), 0) as total_confirmed,
    
    -- Actual costs (completed work)
    COALESCE(SUM(m.actual_cost), 0) as total_actual_cost,
    COALESCE(SUM(m.accounts_final_payment), 0) as total_paid,
    
    -- This month (using best available cost)
    COALESCE(SUM(
      COALESCE(m.actual_cost, r.purchasing_final_cost, r.manager_cost_estimate)
    ) FILTER (
      WHERE m.created_at >= DATE_TRUNC('month', CURRENT_DATE)
    ), 0) as this_month_cost,
    
    -- This quarter
    COALESCE(SUM(
      COALESCE(m.actual_cost, r.purchasing_final_cost, r.manager_cost_estimate)
    ) FILTER (
      WHERE m.created_at >= DATE_TRUNC('quarter', CURRENT_DATE)
    ), 0) as this_quarter_cost,
    
    -- This year
    COALESCE(SUM(
      COALESCE(m.actual_cost, r.purchasing_final_cost, r.manager_cost_estimate)
    ) FILTER (
      WHERE m.created_at >= DATE_TRUNC('year', CURRENT_DATE)
    ), 0) as this_year_cost
    
  FROM maintenance_schedule m
  LEFT JOIN requests r ON m.request_id = r.id
  WHERE (
    r.manager_cost_estimate IS NOT NULL 
    OR r.purchasing_final_cost IS NOT NULL
    OR m.actual_cost IS NOT NULL
    OR m.status = 'Completed'
  )
`;

// Costs by department
const getCostsByDepartment = `
  SELECT 
    COALESCE(u.department::text, 'Unassigned') as department,
    COUNT(*) as work_order_count,
    COALESCE(SUM(COALESCE(m.actual_cost, r.purchasing_final_cost, r.manager_cost_estimate)), 0) as total_cost,
    COALESCE(SUM(m.accounts_final_payment), 0) as total_paid,
    COALESCE(AVG(COALESCE(m.actual_cost, r.purchasing_final_cost, r.manager_cost_estimate)), 0) as avg_cost
  FROM maintenance_schedule m
  LEFT JOIN requests r ON m.request_id = r.id
  LEFT JOIN users u ON r.requester_id = u.id
  WHERE (
    r.manager_cost_estimate IS NOT NULL 
    OR r.purchasing_final_cost IS NOT NULL
    OR m.actual_cost IS NOT NULL
  )
  GROUP BY u.department
  ORDER BY total_cost DESC
`;

// Costs by vendor
const getCostsByVendor = `
  SELECT 
    COALESCE(v.name, 'In-House') as vendor_name,
    COUNT(*) as work_order_count,
    COALESCE(SUM(COALESCE(m.actual_cost, r.purchasing_final_cost, r.manager_cost_estimate)), 0) as total_cost,
    COALESCE(SUM(m.accounts_final_payment), 0) as total_paid
  FROM maintenance_schedule m
  LEFT JOIN requests r ON m.request_id = r.id
  LEFT JOIN vendors v ON (r.details->>'vendorRecommendation')::uuid = v.id
  WHERE (
    r.manager_cost_estimate IS NOT NULL 
    OR r.purchasing_final_cost IS NOT NULL
    OR m.actual_cost IS NOT NULL
  )
  GROUP BY v.name
  ORDER BY total_cost DESC
`;

// Service type breakdown
const getServiceTypeBreakdown = `
  SELECT 
    COALESCE(r.details->>'serviceType', 'In-House') as service_type,
    COUNT(*) as work_order_count,
    COALESCE(SUM(COALESCE(m.actual_cost, r.purchasing_final_cost, r.manager_cost_estimate)), 0) as total_cost
  FROM maintenance_schedule m
  LEFT JOIN requests r ON m.request_id = r.id
  WHERE (
    r.manager_cost_estimate IS NOT NULL 
    OR r.purchasing_final_cost IS NOT NULL
    OR m.actual_cost IS NOT NULL
  )
  GROUP BY r.details->>'serviceType'
`;

// Get accounts users for notifications
const getAccountsUsers = `
  SELECT id, email, first_name, last_name, phone
  FROM users
  WHERE role IN ('Accounts_Manager', 'Accounts_Staff')
  AND is_active = true
`;

module.exports = {
  getCompletedWorkOrders,
  getWorkOrderById,
  recordPayment,
  getCostStats,
  getCostsByDepartment,
  getCostsByVendor,
  getServiceTypeBreakdown,
  getAccountsUsers
};