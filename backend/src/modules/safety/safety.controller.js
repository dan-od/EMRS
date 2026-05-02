const safetyService = require('./safety.service');
const { logActivity, ACTIONS, ENTITY_TYPES } = require('../../utils/activityLogger');

const getAll = async (req, res, next) => {
  try {
    const result = await safetyService.getAll(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const report = await safetyService.getById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    next(error);
  }
};

const getMyReports = async (req, res, next) => {
  try {
    const result = await safetyService.getMyReports(req.user.id, req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const report = await safetyService.create({
      ...req.body,
      reporterId: req.user.id
    });
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.SAFETY_REPORT_CREATED,
      entityType: ENTITY_TYPES.SAFETY_REPORT,
      entityId: report.id,
      entityName: report.title,
      department: req.user.department,
      details: { 
        type: req.body.type,
        severity: req.body.severity,
        location: req.body.location
      },
      req
    });
    
    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const oldReport = await safetyService.getById(req.params.id);
    const report = await safetyService.update(req.params.id, req.body, req.user.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.SAFETY_REPORT_UPDATED,
      entityType: ENTITY_TYPES.SAFETY_REPORT,
      entityId: req.params.id,
      entityName: report.title,
      department: req.user.department,
      details: { 
        before: oldReport ? { status: oldReport.status } : null,
        after: { status: report.status }
      },
      req
    });
    
    res.json(report);
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const oldReport = await safetyService.getById(req.params.id);
    const report = await safetyService.updateStatus(req.params.id, req.body, req.user.id);
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.SAFETY_REPORT_UPDATED,
      entityType: ENTITY_TYPES.SAFETY_REPORT,
      entityId: req.params.id,
      entityName: report.title,
      department: req.user.department,
      details: { 
        previousStatus: oldReport?.status,
        newStatus: req.body.status,
        notes: req.body.notes
      },
      req
    });
    
    res.json(report);
  } catch (error) {
    next(error);
  }
};

const assignInvestigator = async (req, res, next) => {
  try {
    const report = await safetyService.assignInvestigator(
      req.params.id, 
      req.body.investigatorId, 
      req.user.id
    );
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.SAFETY_REPORT_ASSIGNED,
      entityType: ENTITY_TYPES.SAFETY_REPORT,
      entityId: req.params.id,
      entityName: report.title,
      department: req.user.department,
      details: { investigatorId: req.body.investigatorId },
      req
    });
    
    res.json(report);
  } catch (error) {
    next(error);
  }
};

const resolve = async (req, res, next) => {
  try {
    const report = await safetyService.resolve(req.params.id, req.body, req.user.id);
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.SAFETY_REPORT_RESOLVED,
      entityType: ENTITY_TYPES.SAFETY_REPORT,
      entityId: req.params.id,
      entityName: report.title,
      department: req.user.department,
      details: { 
        resolution: req.body.resolution,
        correctiveActions: req.body.correctiveActions
      },
      req
    });
    
    res.json(report);
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await safetyService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const history = await safetyService.getHistory(req.params.id);
    res.json(history);
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getAll, getById, getMyReports, create, update, updateStatus, 
  assignInvestigator, resolve, getStats, getHistory 
};
