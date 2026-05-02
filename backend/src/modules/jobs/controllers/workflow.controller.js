/**
 * Jobs Controller - Workflow Actions
 * Handles job status transitions with activity logging
 */
const service = require('../services');
const { logActivity, ENTITY_TYPES, ACTIONS } = require('../../../utils/activityLogger');
const logger = require('../../../utils/logger');

const logWorkflowAction = async (req, action, job, extraDetails = {}) => {
  try {
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      department: req.user.department,
      action,
      entityType: ENTITY_TYPES.JOB || 'JOB',
      entityId: job.id,
      entityName: job.job_number,
      details: { 
        client: job.client,
        status: job.status,
        jobNumber: job.job_number,
        ...extraDetails 
      },
      req
    });
  } catch (logErr) {
    logger.error('Activity log error', { message: logErr.message });
  }
};

const submitJob = async (req, res, next) => {
  try {
    const job = await service.submitJob(req.params.id, req.user.id);
    await logWorkflowAction(req, ACTIONS.JOB_SUBMITTED || 'JOB_SUBMITTED', job);
    res.json({ job, message: 'Job submitted for approval' });
  } catch (error) { next(error); }
};

const approveJob = async (req, res, next) => {
  try {
    const job = await service.approveJob(req.params.id, req.user.id, req.user.role);
    await logWorkflowAction(req, ACTIONS.JOB_APPROVED || 'JOB_APPROVED', job);
    res.json({ job, message: 'Job approved' });
  } catch (error) { next(error); }
};

const rejectJob = async (req, res, next) => {
  try {
    const job = await service.rejectJob(req.params.id, req.user.id, req.user.role, req.body.reason);
    await logWorkflowAction(req, ACTIONS.JOB_REJECTED || 'JOB_REJECTED', job, { reason: req.body.reason });
    res.json({ job, message: 'Job rejected' });
  } catch (error) { next(error); }
};

const signoffJob = async (req, res, next) => {
  try {
    const job = await service.signoffJob(req.params.id, req.user.id, req.body.notes);
    await logWorkflowAction(req, ACTIONS.JOB_SIGNOFF || 'JOB_SIGNOFF', job, { notes: req.body.notes });
    res.json({ job, message: 'Sign-off completed' });
  } catch (error) { next(error); }
};

const startJob = async (req, res, next) => {
  try {
    const job = await service.startJob(req.params.id, req.user.id);
    await logWorkflowAction(req, ACTIONS.JOB_STARTED || 'JOB_STARTED', job);
    res.json({ job, message: 'Job started' });
  } catch (error) { next(error); }
};

const moveToPostJob = async (req, res, next) => {
  try {
    const job = await service.moveToPostJob(req.params.id, req.user.id);
    await logWorkflowAction(req, ACTIONS.JOB_STATUS_CHANGED || 'JOB_POST_JOB', job, { newStatus: 'POST_JOB' });
    res.json({ job, message: 'Moved to post-job' });
  } catch (error) { next(error); }
};

const completeJob = async (req, res, next) => {
  try {
    const job = await service.completeJob(req.params.id, req.user.id);
    await logWorkflowAction(req, ACTIONS.JOB_COMPLETED || 'JOB_COMPLETED', job);
    res.json({ job, message: 'Job completed' });
  } catch (error) { next(error); }
};

const cancelJob = async (req, res, next) => {
  try {
    const job = await service.cancelJob(req.params.id, req.user.id, req.body.reason);
    await logWorkflowAction(req, ACTIONS.JOB_CANCELLED || 'JOB_CANCELLED', job, { reason: req.body.reason });
    res.json({ job, message: 'Job cancelled' });
  } catch (error) { next(error); }
};

module.exports = { submitJob, approveJob, rejectJob, signoffJob, startJob, moveToPostJob, completeJob, cancelJob };
