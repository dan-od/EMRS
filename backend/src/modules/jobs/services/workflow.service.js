/**
 * Jobs Service - Workflow Operations
 * Status transitions and business rules
 */
const { query } = require('../../../config/db');
const queries = require('../queries');
const { isSupervisorOnJob, isManager } = require('./jobs.service');

const submitJob = async (jobId, userId) => {
  const isSupervisor = await isSupervisorOnJob(jobId, userId);
  if (!isSupervisor) throw new Error('Only supervisors can submit jobs');
  
  // Check equipment list exists
  const items = await query(queries.equipment.getByJobId, [jobId]);
  if (items.rows.length === 0) throw new Error('Cannot submit without equipment list');
  
  const result = await query(queries.workflow.submit, [jobId, userId]);
  await query(queries.workflow.addHistory, [jobId, 'DRAFT', 'PENDING_APPROVAL', userId, 'Submitted for approval']);
  return result.rows[0];
};

const approveJob = async (jobId, userId, userRole) => {
  if (!isManager(userRole)) throw new Error('Only managers can approve jobs');
  
  const result = await query(queries.workflow.approve, [jobId, userId]);
  await query(queries.equipment.approveAll, [jobId]);
  await query(queries.workflow.addHistory, [jobId, 'PENDING_APPROVAL', 'APPROVED', userId, 'Approved']);
  return result.rows[0];
};

const rejectJob = async (jobId, userId, userRole, reason) => {
  if (!isManager(userRole)) throw new Error('Only managers can reject jobs');
  
  const result = await query(queries.workflow.reject, [jobId]);
  await query(queries.workflow.addHistory, [jobId, 'PENDING_APPROVAL', 'DRAFT', userId, `Rejected: ${reason}`]);
  return result.rows[0];
};

const signoffJob = async (jobId, userId, notes) => {
  const isSupervisor = await isSupervisorOnJob(jobId, userId);
  if (!isSupervisor) throw new Error('Only supervisors can sign off');
  
  const result = await query(queries.workflow.signoff, [jobId, userId, notes]);
  return result.rows[0];
};

const startJob = async (jobId, userId) => {
  const isSupervisor = await isSupervisorOnJob(jobId, userId);
  if (!isSupervisor) throw new Error('Only supervisors can start jobs');
  
  const result = await query(queries.workflow.start, [jobId, userId]);
  if (!result.rows[0]) throw new Error('Cannot start: sign-off not completed');
  
  await query(queries.workflow.addHistory, [jobId, 'APPROVED', 'IN_PROGRESS', userId, 'Job started']);
  return result.rows[0];
};

const moveToPostJob = async (jobId, userId) => {
  const result = await query(queries.workflow.moveToPostJob, [jobId]);
  await query(queries.workflow.addHistory, [jobId, 'IN_PROGRESS', 'POST_JOB', userId, 'Team returned']);
  return result.rows[0];
};

const completeJob = async (jobId, userId) => {
  const result = await query(queries.workflow.complete, [jobId]);
  await query(queries.workflow.addHistory, [jobId, 'POST_JOB', 'COMPLETED', userId, 'Completed']);
  return result.rows[0];
};

const cancelJob = async (jobId, userId, reason) => {
  const result = await query(queries.workflow.cancel, [jobId]);
  if (!result.rows[0]) throw new Error('Cannot cancel job in current status');
  await query(queries.workflow.addHistory, [jobId, result.rows[0].status, 'CANCELLED', userId, reason]);
  return result.rows[0];
};

module.exports = {
  submitJob, approveJob, rejectJob, signoffJob,
  startJob, moveToPostJob, completeJob, cancelJob
};
