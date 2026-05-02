/**
 * Jobs Service - Core Operations
 * Job CRUD and access control
 */
const { query } = require('../../../config/db');
const queries = require('../queries');

const MANAGER_ROLES = ['Super Admin', 'Super_Admin', 'Admin', 'Operations Manager', 'Operations_Manager'];
const PURCHASING_ROLES = ['Purchasing_Manager', 'Purchasing Manager', 'Purchasing_Staff', 'Purchasing Staff'];

const isManager = (role) => MANAGER_ROLES.includes(role);
const isPurchasing = (role) => PURCHASING_ROLES.includes(role);

const canAccessJob = async (jobId, userId, userRole) => {
  // Managers can access all jobs
  if (isManager(userRole)) return true;
  // Purchasing can access all jobs (for equipment disbursement)
  if (isPurchasing(userRole)) return true;
  // Others must be team members
  const result = await query(queries.jobs.isTeamMember, [jobId, userId]);
  return result.rows[0]?.is_member || false;
};

const isSupervisorOnJob = async (jobId, userId) => {
  const result = await query(queries.jobs.isSupervisor, [jobId, userId]);
  return result.rows[0]?.is_supervisor || false;
};

const getUserRoleOnJob = async (jobId, userId) => {
  const result = await query(queries.jobs.getUserRole, [jobId, userId]);
  return result.rows[0]?.role || null;
};

const getAllJobs = async (filters = {}) => {
  const { status, search, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;
  
  const [jobsResult, countResult] = await Promise.all([
    query(queries.jobs.findAll, [status || null, search || null, limit, offset]),
    query(queries.jobs.countAll, [status || null, search || null])
  ]);
  
  return {
    jobs: jobsResult.rows,
    pagination: {
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit)
    }
  };
};

const getMyJobs = async (userId, filters = {}) => {
  const { status, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;
  
  const [jobsResult, countResult] = await Promise.all([
    query(queries.jobs.findMyJobs, [userId, status || null, limit, offset]),
    query(queries.jobs.countMyJobs, [userId, status || null])
  ]);
  
  return {
    jobs: jobsResult.rows,
    pagination: { total: parseInt(countResult.rows[0].total), page: parseInt(page), limit: parseInt(limit) }
  };
};

const getJobById = async (jobId) => {
  const [jobResult, teamResult, itemsResult, historyResult, progressResult] = await Promise.all([
    query(queries.jobs.findById, [jobId]),
    query(queries.team.getByJobId, [jobId]),
    query(queries.equipment.getByJobId, [jobId]),
    query(queries.workflow.getHistory, [jobId]),
    query(queries.equipment.getProgress, [jobId])
  ]);
  
  if (!jobResult.rows[0]) return null;
  
  return {
    ...jobResult.rows[0],
    team: teamResult.rows,
    equipment_items: itemsResult.rows,
    status_history: historyResult.rows,
    disbursement_progress: progressResult.rows[0]
  };
};

const createJob = async (data, createdBy) => {
  const numberResult = await query(queries.jobs.generateNumber);
  const jobNumber = numberResult.rows[0].job_number;
  
  const result = await query(queries.jobs.create, [
    jobNumber, data.client, data.well_name || null, data.location,
    data.description || null, data.start_date || null, data.expected_end_date || null,
    data.priority || 'Medium', data.special_requirements || null,
    data.safety_considerations || null, createdBy
  ]);
  
  await query(queries.workflow.addHistory, [result.rows[0].id, null, 'DRAFT', createdBy, 'Job created']);
  return result.rows[0];
};

const updateJob = async (jobId, data) => {
  const result = await query(queries.jobs.update, [
    jobId, data.client, data.well_name, data.location, data.description,
    data.start_date, data.expected_end_date, data.priority,
    data.special_requirements, data.safety_considerations
  ]);
  return result.rows[0];
};

const getStats = async () => {
  const result = await query(queries.jobs.getStats);
  return result.rows[0];
};

module.exports = {
  MANAGER_ROLES, isManager, canAccessJob, isSupervisorOnJob, getUserRoleOnJob,
  getAllJobs, getMyJobs, getJobById, createJob, updateJob, getStats
};
