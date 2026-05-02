/**
 * Jobs Controller - CRUD Operations
 */
const service = require('../services');
const { logActivity, ACTIONS, ENTITY_TYPES } = require('../../../utils/activityLogger');
const logger = require('../../../utils/logger');

const getAllJobs = async (req, res, next) => {
  try {
    const result = await service.getAllJobs(req.query);
    res.json(result);
  } catch (error) { next(error); }
};

const getMyJobs = async (req, res, next) => {
  try {
    // Purchasing roles see all jobs (they need to track equipment)
    const purchasingRoles = ['Purchasing_Manager', 'Purchasing Manager', 'Purchasing_Staff', 'Purchasing Staff'];
    if (purchasingRoles.includes(req.user.role)) {
      const result = await service.getAllJobs(req.query);
      return res.json(result);
    }
    const result = await service.getMyJobs(req.user.id, req.query);
    res.json(result);
  } catch (error) { next(error); }
};

const getJobById = async (req, res, next) => {
  try {
    const canAccess = await service.canAccessJob(req.params.id, req.user.id, req.user.role);
    if (!canAccess) return res.status(403).json({ message: 'Access denied' });
    
    const job = await service.getJobById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    job.my_role = await service.getUserRoleOnJob(req.params.id, req.user.id);
    res.json({ job });
  } catch (error) { next(error); }
};

const createJob = async (req, res, next) => {
  try {
    const job = await service.createJob(req.body, req.user.id);
    try {
      await logActivity({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        department: req.user.department,
        action: ACTIONS.JOB_CREATED,
        entityType: ENTITY_TYPES.JOB,
        entityId: job.id,
        entityName: job.job_number,
        details: { client: job.client, location: job.location, jobNumber: job.job_number },
        req
      });
    } catch (logErr) {
      logger.error('Activity log error', { message: logErr.message });
    }
    res.status(201).json({ job });
  } catch (error) { next(error); }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await service.updateJob(req.params.id, req.body);
    if (!job) return res.status(400).json({ message: 'Cannot update (not in DRAFT)' });
    try {
      await logActivity({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        department: req.user.department,
        action: ACTIONS.JOB_UPDATED,
        entityType: ENTITY_TYPES.JOB,
        entityId: job.id,
        entityName: job.job_number,
        details: { client: job.client, jobNumber: job.job_number },
        req
      });
    } catch (logErr) {
      logger.error('Activity log error', { message: logErr.message });
    }
    res.json({ job });
  } catch (error) { next(error); }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await service.getStats();
    res.json({ stats });
  } catch (error) { next(error); }
};

module.exports = { getAllJobs, getMyJobs, getJobById, createJob, updateJob, getStats };
