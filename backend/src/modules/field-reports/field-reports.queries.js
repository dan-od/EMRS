/**
 * Field Reports SQL Queries
 */

module.exports = {
  getAll: `
    SELECT 
      fr.*,
      u.first_name || ' ' || u.last_name as submitted_by_name,
      u.email as submitted_by_email,
      rv.first_name || ' ' || rv.last_name as reviewed_by_name
    FROM field_reports fr
    LEFT JOIN users u ON fr.submitted_by = u.id
    LEFT JOIN users rv ON fr.reviewed_by = rv.id
  `,
  
  getById: `
    SELECT 
      fr.*,
      u.first_name || ' ' || u.last_name as submitted_by_name,
      u.email as submitted_by_email,
      u.department as submitted_by_department,
      rv.first_name || ' ' || rv.last_name as reviewed_by_name,
      rv.email as reviewed_by_email
    FROM field_reports fr
    LEFT JOIN users u ON fr.submitted_by = u.id
    LEFT JOIN users rv ON fr.reviewed_by = rv.id
    WHERE fr.id = $1
  `,
  
  getByJob: `
    SELECT 
      fr.*,
      u.first_name || ' ' || u.last_name as submitted_by_name
    FROM field_reports fr
    LEFT JOIN users u ON fr.submitted_by = u.id
    WHERE fr.job_id = $1
    ORDER BY fr.report_date DESC
  `,
  
  getByUser: `
    SELECT 
      fr.*,
      rv.first_name || ' ' || rv.last_name as reviewed_by_name
    FROM field_reports fr
    LEFT JOIN users rv ON fr.reviewed_by = rv.id
    WHERE fr.submitted_by = $1
    ORDER BY fr.report_date DESC
    LIMIT $2 OFFSET $3
  `,
  
  getPendingReview: `
    SELECT 
      fr.*,
      u.first_name || ' ' || u.last_name as submitted_by_name,
      u.email as submitted_by_email
    FROM field_reports fr
    LEFT JOIN users u ON fr.submitted_by = u.id
    WHERE fr.status = 'Submitted'
      AND (fr.department = $1 OR $1 IS NULL)
    ORDER BY fr.report_date DESC
  `,
  
  create: `
    INSERT INTO field_reports (
      job_id, job_title, job_location, client_name, report_date,
      report_type, content, weather_conditions, crew_count,
      equipment_used, issues_encountered, next_day_plan,
      attachments, submitted_by, department
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING id
  `,
  
  update: `
    UPDATE field_reports SET
      job_title = $1,
      job_location = $2,
      client_name = $3,
      report_date = $4,
      report_type = $5,
      content = $6,
      weather_conditions = $7,
      crew_count = $8,
      equipment_used = $9,
      issues_encountered = $10,
      next_day_plan = $11,
      updated_at = NOW()
    WHERE id = $12
  `,
  
  review: `
    UPDATE field_reports SET
      status = $1,
      review_comments = $2,
      reviewed_by = $3,
      reviewed_at = NOW(),
      updated_at = NOW()
    WHERE id = $4
  `,
  
  getStats: `
    SELECT
      COUNT(*) as total_reports,
      COUNT(*) FILTER (WHERE status = 'Submitted') as pending_review,
      COUNT(*) FILTER (WHERE status = 'Approved') as approved,
      COUNT(*) FILTER (WHERE status = 'Rejected') as rejected,
      COUNT(*) FILTER (WHERE report_date >= DATE_TRUNC('week', NOW())) as this_week,
      COUNT(*) FILTER (WHERE report_date >= DATE_TRUNC('month', NOW())) as this_month
    FROM field_reports
  `
};
