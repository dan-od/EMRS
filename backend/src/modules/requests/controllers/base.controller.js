/**
 * Requests Controller - Base Operations
 * Basic fetch endpoints
 */
const requestsService = require('../requests.service');

const ADMIN_ROLES = ['Super_Admin', 'Admin'];
const ELEVATED_ROLES = [
  'Super_Admin', 'Admin', 'IT_Manager', 'IT_Support',
  'Operations_Manager', 'Purchasing_Manager', 'Purchasing_Staff',
  'Accounts_Manager', 'Accounts_Staff',
  'Safety_Manager', 'Safety_Officer',
  'Maintenance_Manager', 'Maintenance_Technician',
  'Logistics_Manager', 'Logistics_Coordinator',
  'Workshop_Manager', 'HR_Manager',
];

const getAll = async (req, res, next) => {
  try {
    const result = await requestsService.getAll(req.query);
    res.json({ success: true, data: result.requests, pagination: {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    }});
  } catch (error) {
    next(error);
  }
};

const getDeptRequests = async (req, res, next) => {
  try {
    const department = ['Admin', 'Super_Admin'].includes(req.user.role) ? null : req.user.department;
    const result = await requestsService.getAll({ ...req.query, department });
    res.json({ success: true, data: result.requests, pagination: {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    }});
  } catch (error) {
    next(error);
  }
};

const getAllRequests = async (req, res, next) => {
  try {
    const result = await requestsService.getAll(req.query);
    res.json({ success: true, data: result.requests, pagination: {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    }});
  } catch (error) {
    next(error);
  }
};

const getMyRequests = async (req, res, next) => {
  try {
    const result = await requestsService.getMyRequests(req.user.id, req.query);
    res.json({ success: true, data: result.requests, pagination: {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    }});
  } catch (error) {
    next(error);
  }
};

// Get active requests for current user (items not yet returned)
const getActiveRequests = async (req, res, next) => {
  try {
    const requests = await requestsService.getActiveByUser(req.user.id);
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

const getPending = async (req, res, next) => {
  try {
    // Admin/Super_Admin see ALL pending; managers see only their department
    const isAdmin = ADMIN_ROLES.includes(req.user.role);
    const department = isAdmin ? null : (req.query.department || req.user.department || null);
    const requests = await requestsService.getPending(department);
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const request = await requestsService.getById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    const isElevated = ELEVATED_ROLES.includes(req.user.role);
    if (!isElevated && request.requester_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getAllRequests,
  getDeptRequests,
  getMyRequests,
  getActiveRequests,
  getPending,
  getById
};
