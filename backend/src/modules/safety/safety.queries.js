// SQL queries for safety module

const findAll = `
  SELECT s.*, 
    u.first_name || ' ' || u.last_name as reporter_name,
    u.department as reporter_department
  FROM safety_reports s
  LEFT JOIN users u ON s.reporter_id = u.id
  WHERE ($1::text IS NULL OR $1::text = '' OR s.type::text = $1)
    AND ($2::text IS NULL OR $2::text = '' OR s.status::text = $2)
    AND ($3::text IS NULL OR $3::text = '' OR s.severity::text = $3)
    AND ($4::uuid IS NULL OR s.reporter_id = $4)
  ORDER BY 
    CASE s.severity WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END,
    s.created_at DESC
  LIMIT $5 OFFSET $6
`;

const countAll = `
  SELECT COUNT(*) as total FROM safety_reports s
  WHERE ($1::text IS NULL OR $1::text = '' OR s.type::text = $1)
    AND ($2::text IS NULL OR $2::text = '' OR s.status::text = $2)
    AND ($3::text IS NULL OR $3::text = '' OR s.severity::text = $3)
    AND ($4::uuid IS NULL OR s.reporter_id = $4)
`;

const findById = `
  SELECT s.*, 
    u.first_name || ' ' || u.last_name as reporter_name,
    u.department as reporter_department,
    u.email as reporter_email
  FROM safety_reports s
  LEFT JOIN users u ON s.reporter_id = u.id
  WHERE s.id = $1
`;

const create = `
  INSERT INTO safety_reports (reporter_id, type, severity, title, description, location, incident_date, is_anonymous)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING *
`;

const updateStatus = `
  UPDATE safety_reports SET 
    status = $2, 
    assigned_to = $3,
    resolution = $4,
    resolved_at = CASE WHEN $2 = 'Resolved' THEN NOW() ELSE resolved_at END,
    updated_at = NOW()
  WHERE id = $1 RETURNING *
`;

const getStats = `
  SELECT 
    COUNT(*) FILTER (WHERE status = 'Open') as open_count,
    COUNT(*) FILTER (WHERE status = 'In_Progress') as in_progress_count,
    COUNT(*) FILTER (WHERE status = 'Resolved') as resolved_count,
    COUNT(*) FILTER (WHERE type = 'Incident') as incident_count,
    COUNT(*) FILTER (WHERE type = 'Hazard') as hazard_count,
    COUNT(*) FILTER (WHERE type = 'Near_Miss') as near_miss_count,
    COUNT(*) FILTER (WHERE severity = 'Critical') as critical_count,
    COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days
  FROM safety_reports
`;

const getHistory = `
  SELECT h.*, u.first_name || ' ' || u.last_name as changed_by_name
  FROM safety_report_history h
  LEFT JOIN users u ON h.changed_by = u.id
  WHERE h.report_id = $1
  ORDER BY h.created_at DESC
`;

const addHistory = `
  INSERT INTO safety_report_history (report_id, changed_by, old_status, new_status, notes)
  VALUES ($1, $2, $3, $4, $5) RETURNING *
`;

module.exports = { findAll, countAll, findById, create, updateStatus, getStats, getHistory, addHistory };
