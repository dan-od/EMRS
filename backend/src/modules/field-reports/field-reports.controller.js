/**
 * Field Reports Controller
 * Handles job site documentation, daily reports, and incident logs
 */

const fieldReportsService = require('./field-reports.service');
const { logActivity, ACTIONS, ENTITY_TYPES } = require('../../utils/activityLogger');

// Get all field reports
const getAll = async (req, res, next) => {
  try {
    const result = await fieldReportsService.getAll(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get single report
const getById = async (req, res, next) => {
  try {
    const report = await fieldReportsService.getById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Field report not found' });
    }
    res.json(report);
  } catch (error) {
    next(error);
  }
};

// Get reports by job
const getByJob = async (req, res, next) => {
  try {
    const reports = await fieldReportsService.getByJob(req.params.jobId);
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

// Get my submitted reports
const getMyReports = async (req, res, next) => {
  try {
    const result = await fieldReportsService.getByUser(req.user.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get pending review (for managers)
const getPendingReview = async (req, res, next) => {
  try {
    const reports = await fieldReportsService.getPendingReview(req.user.department);
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

// Create field report
const create = async (req, res, next) => {
  try {
    const report = await fieldReportsService.create({
      ...req.body,
      submitted_by: req.user.id,
      department: req.user.department
    });
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.FIELD_REPORT_SUBMITTED,
      entityType: ENTITY_TYPES.FIELD_REPORT,
      entityId: report.id,
      entityName: `${report.report_type} - ${report.job_title}`,
      department: req.user.department,
      details: {
        jobId: req.body.job_id,
        reportType: req.body.report_type,
        reportDate: req.body.report_date,
        location: req.body.job_location
      },
      req
    });
    
    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

// Update field report (before review)
const update = async (req, res, next) => {
  try {
    const oldReport = await fieldReportsService.getById(req.params.id);
    
    // Only allow update if not yet reviewed
    if (oldReport?.status !== 'Submitted') {
      return res.status(400).json({ message: 'Cannot update report after review has started' });
    }
    
    // Only submitter can update
    if (oldReport.submitted_by !== req.user.id && !['Super_Admin', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized to update this report' });
    }
    
    const report = await fieldReportsService.update(req.params.id, req.body);
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.FIELD_REPORT_SUBMITTED,
      entityType: ENTITY_TYPES.FIELD_REPORT,
      entityId: req.params.id,
      entityName: `${report.report_type} - ${report.job_title}`,
      department: req.user.department,
      details: { action: 'updated' },
      req
    });
    
    res.json(report);
  } catch (error) {
    next(error);
  }
};

// Review field report
const review = async (req, res, next) => {
  try {
    const report = await fieldReportsService.review(req.params.id, {
      ...req.body,
      reviewed_by: req.user.id
    });
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.FIELD_REPORT_REVIEWED,
      entityType: ENTITY_TYPES.FIELD_REPORT,
      entityId: req.params.id,
      entityName: `${report.report_type} - ${report.job_title}`,
      department: req.user.department,
      details: {
        status: req.body.status,
        comments: req.body.review_comments
      },
      req
    });
    
    res.json(report);
  } catch (error) {
    next(error);
  }
};

// Approve report
const approve = async (req, res, next) => {
  try {
    const report = await fieldReportsService.approve(req.params.id, req.user.id, req.body.comments);
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.FIELD_REPORT_REVIEWED,
      entityType: ENTITY_TYPES.FIELD_REPORT,
      entityId: req.params.id,
      entityName: `${report.report_type} - ${report.job_title}`,
      department: req.user.department,
      details: { status: 'Approved', comments: req.body.comments },
      req
    });
    
    res.json(report);
  } catch (error) {
    next(error);
  }
};

// Reject report (request revision)
const reject = async (req, res, next) => {
  try {
    const report = await fieldReportsService.reject(req.params.id, req.user.id, req.body.reason);
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.FIELD_REPORT_REVIEWED,
      entityType: ENTITY_TYPES.FIELD_REPORT,
      entityId: req.params.id,
      entityName: `${report.report_type} - ${report.job_title}`,
      department: req.user.department,
      details: { status: 'Rejected', reason: req.body.reason },
      req
    });
    
    res.json(report);
  } catch (error) {
    next(error);
  }
};

// Add attachment
const addAttachment = async (req, res, next) => {
  try {
    const result = await fieldReportsService.addAttachment(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get report stats
const getStats = async (req, res, next) => {
  try {
    const stats = await fieldReportsService.getStats(req.query);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll, getById, getByJob, getMyReports, getPendingReview,
  create, update, review, approve, reject, addAttachment, getStats
};
