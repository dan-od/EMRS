/**
 * Requests Service - Base Operations
 * Basic CRUD and fetch functions
 */
const { query } = require('../../../config/db');
const queries = require('../requests.queries');

const getAll = async (filters = {}) => {
  const { type, status, priority, requesterId, department, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const [requestsResult, countResult] = await Promise.all([
    query(queries.findAll, [type, status, priority, requesterId, department, limit, offset]),
    query(queries.countAll, [type, status, priority, requesterId, department])
  ]);

  return {
    requests: requestsResult.rows,
    total: parseInt(countResult.rows[0].total),
    page,
    totalPages: Math.ceil(countResult.rows[0].total / limit)
  };
};

const getById = async (id) => {
  const [requestResult, auditResult, historyResult] = await Promise.all([
    query(queries.findById, [id]),
    query(queries.getAuditTrail, [id]),
    query(queries.getHistory, [id])
  ]);

  const request = requestResult.rows[0] || null;
  if (request) {
    request.approval_history = auditResult.rows;
    request.status_history = historyResult.rows;
  }
  return request;
};

const getPending = async (department = null) => {
  const result = await query(queries.findPending, [department]);
  return result.rows;
};

const getMyRequests = async (userId, filters = {}) => {
  return getAll({ ...filters, requesterId: userId });
};

const getActiveByUser = async (userId) => {
  const result = await query(queries.findActiveByUser, [userId]);
  return result.rows;
};

module.exports = {
  getAll,
  getById,
  getPending,
  getMyRequests,
  getActiveByUser
};
