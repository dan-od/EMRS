/**
 * Requests Service - Purchasing Operations
 * Queries specific to Purchasing department workflow
 */
const { query } = require('../../../config/db');
const queries = require('../requests.queries');

const getAllForPurchasing = async (filters = {}) => {
  const { type, status, page = 1, limit = 50 } = filters;
  const offset = (page - 1) * limit;

  const [requestsResult, countResult] = await Promise.all([
    query(queries.findAllForPurchasing, [type, status, limit, offset]),
    query(queries.countAllForPurchasing, [type, status])
  ]);

  return {
    requests: requestsResult.rows,
    total: parseInt(countResult.rows[0].total),
    page,
    totalPages: Math.ceil(countResult.rows[0].total / limit)
  };
};

const getReadyToDisburse = async () => {
  const result = await query(queries.findReadyToDisburse);
  return result.rows;
};

const getOnHold = async () => {
  const result = await query(queries.findOnHold);
  return result.rows;
};

const getDisbursedActive = async () => {
  const result = await query(queries.findDisbursedActive);
  return result.rows;
};

const getPendingReturn = async () => {
  const result = await query(queries.findPendingReturn);
  return result.rows;
};

const getOverdueReturns = async () => {
  const result = await query(queries.findOverdueReturns);
  return result.rows;
};

const getCompleted = async () => {
  const result = await query(queries.findCompleted);
  return result.rows;
};

const getMaintenanceRequests = async () => {
  const result = await query(queries.findMaintenanceRequests);
  return result.rows;
};

const getPurchasingStats = async () => {
  const result = await query(queries.getPurchasingStats);
  return result.rows[0];
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
  getPurchasingStats
};
