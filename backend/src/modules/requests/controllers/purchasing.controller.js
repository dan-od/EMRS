/**
 * Requests Controller - Purchasing Operations
 * Endpoints specific to Purchasing department
 */
const requestsService = require('../requests.service');
const { query } = require('../../../config/db');

// Get all requests for purchasing (visible from day one)
const getAllForPurchasing = async (req, res, next) => {
  try {
    const result = await requestsService.getAllForPurchasing(req.query);
    res.json({ success: true, data: result.requests, pagination: {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    }});
  } catch (error) {
    next(error);
  }
};

// Get ready to disburse (Approved status)
const getReadyToDisburse = async (req, res, next) => {
  try {
    const requests = await requestsService.getReadyToDisburse();
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// Get on hold requests
const getOnHold = async (req, res, next) => {
  try {
    const requests = await requestsService.getOnHold();
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// Get disbursed/active requests (items out in field)
const getDisbursedActive = async (req, res, next) => {
  try {
    const requests = await requestsService.getDisbursedActive();
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// Get pending return requests
const getPendingReturn = async (req, res, next) => {
  try {
    const requests = await requestsService.getPendingReturn();
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// Get overdue returns
const getOverdueReturns = async (req, res, next) => {
  try {
    const requests = await requestsService.getOverdueReturns();
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// Get completed/returned requests
const getCompleted = async (req, res, next) => {
  try {
    const requests = await requestsService.getCompleted();
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// Get maintenance requests (pending Manager_Approved - awaiting Purchasing approval)
const getMaintenanceRequests = async (req, res, next) => {
  try {
    const requests = await requestsService.getMaintenanceRequests();
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

// Get Approved Maintenance requests (with Work Orders created) - for Disbursed items view
const getMaintenanceApproved = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        r.*,
        u.first_name || ' ' || u.last_name as requester_name,
        u.department as requester_department,
        e.name as equipment_name
      FROM requests r
      LEFT JOIN users u ON r.requester_id = u.id
      LEFT JOIN equipment e ON (r.details->>'equipmentId')::uuid = e.id
      WHERE r.type = 'Maintenance'
        AND r.status = 'Approved'
        AND r.details->>'workOrderId' IS NOT NULL
      ORDER BY r.updated_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// Get purchasing dashboard stats
const getPurchasingStats = async (req, res, next) => {
  try {
    const stats = await requestsService.getPurchasingStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllForPurchasing,
  getReadyToDisburse,
  getOnHold,
  getDisbursedActive,
  getPendingReturn,
  getOverdueReturns,
  getCompleted,
  getMaintenanceRequests,
  getMaintenanceApproved,
  getPurchasingStats
};
