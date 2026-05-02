/**
 * Field Reports Service
 * Business logic for field report operations
 */

const { query } = require('../../config/db');
const fieldReportsQueries = require('./field-reports.queries');

const getAll = async (filters = {}) => {
  const { status, report_type, job_id, department, start_date, end_date, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;
  
  let sql = fieldReportsQueries.getAll;
  const params = [];
  let idx = 1;
  const conditions = [];
  
  if (status) {
    conditions.push(`fr.status = $${idx}`);
    params.push(status);
    idx++;
  }
  
  if (report_type) {
    conditions.push(`fr.report_type = $${idx}`);
    params.push(report_type);
    idx++;
  }
  
  if (job_id) {
    conditions.push(`fr.job_id = $${idx}`);
    params.push(job_id);
    idx++;
  }
  
  if (department) {
    conditions.push(`fr.department = $${idx}`);
    params.push(department);
    idx++;
  }
  
  if (start_date) {
    conditions.push(`fr.report_date >= $${idx}`);
    params.push(start_date);
    idx++;
  }
  
  if (end_date) {
    conditions.push(`fr.report_date <= $${idx}`);
    params.push(end_date);
    idx++;
  }
  
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  
  sql += ` ORDER BY fr.report_date DESC, fr.created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`;
  params.push(limit, offset);
  
  const result = await query(sql, params);
  
  // Get total count
  let countSql = 'SELECT COUNT(*) FROM field_reports fr';
  if (conditions.length > 0) {
    countSql += ' WHERE ' + conditions.join(' AND ');
  }
  const countResult = await query(countSql, params.slice(0, -2));
  
  return {
    data: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].count),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    }
  };
};

const getById = async (id) => {
  const result = await query(fieldReportsQueries.getById, [id]);
  return result.rows[0];
};

const getByJob = async (jobId) => {
  const result = await query(fieldReportsQueries.getByJob, [jobId]);
  return result.rows;
};

const getByUser = async (userId, filters = {}) => {
  const { page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;
  
  const result = await query(fieldReportsQueries.getByUser, [userId, limit, offset]);
  const countResult = await query(
    'SELECT COUNT(*) FROM field_reports WHERE submitted_by = $1',
    [userId]
  );
  
  return {
    data: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].count),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    }
  };
};

const getPendingReview = async (department) => {
  const result = await query(fieldReportsQueries.getPendingReview, [department]);
  return result.rows;
};

const create = async (data) => {
  const {
    job_id, job_title, job_location, client_name, report_date,
    report_type, content, weather_conditions, crew_count,
    equipment_used, issues_encountered, next_day_plan,
    attachments, submitted_by, department
  } = data;
  
  const result = await query(fieldReportsQueries.create, [
    job_id, job_title, job_location, client_name, report_date,
    report_type || 'Daily', content, weather_conditions, crew_count,
    equipment_used, issues_encountered, next_day_plan,
    JSON.stringify(attachments || []), submitted_by, department
  ]);
  
  return getById(result.rows[0].id);
};

const update = async (id, data) => {
  const existing = await getById(id);
  if (!existing) return null;
  
  const {
    job_title, job_location, client_name, report_date,
    report_type, content, weather_conditions, crew_count,
    equipment_used, issues_encountered, next_day_plan
  } = data;
  
  await query(fieldReportsQueries.update, [
    job_title || existing.job_title,
    job_location || existing.job_location,
    client_name || existing.client_name,
    report_date || existing.report_date,
    report_type || existing.report_type,
    content || existing.content,
    weather_conditions ?? existing.weather_conditions,
    crew_count ?? existing.crew_count,
    equipment_used ?? existing.equipment_used,
    issues_encountered ?? existing.issues_encountered,
    next_day_plan ?? existing.next_day_plan,
    id
  ]);
  
  return getById(id);
};

const review = async (id, data) => {
  const { status, review_comments, reviewed_by } = data;
  await query(fieldReportsQueries.review, [status, review_comments, reviewed_by, id]);
  return getById(id);
};

const approve = async (id, reviewedBy, comments) => {
  await query(fieldReportsQueries.review, ['Approved', comments, reviewedBy, id]);
  return getById(id);
};

const reject = async (id, reviewedBy, reason) => {
  await query(fieldReportsQueries.review, ['Rejected', reason, reviewedBy, id]);
  return getById(id);
};

const addAttachment = async (id, attachment) => {
  const report = await getById(id);
  const attachments = report.attachments || [];
  attachments.push(attachment);
  
  await query(
    'UPDATE field_reports SET attachments = $1, updated_at = NOW() WHERE id = $2',
    [JSON.stringify(attachments), id]
  );
  
  return getById(id);
};

const getStats = async (filters = {}) => {
  const result = await query(fieldReportsQueries.getStats);
  return result.rows[0];
};

module.exports = {
  getAll, getById, getByJob, getByUser, getPendingReview,
  create, update, review, approve, reject, addAttachment, getStats
};
