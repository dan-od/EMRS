/**
 * Extensions Service - Getter Operations
 */
const { query } = require('../../../config/db');
const queries = require('./queries');

// Get extension by ID
const getById = async (id) => {
  const result = await query(queries.findById, [id]);
  return result.rows[0];
};

// Get extensions for a request
const getByRequestId = async (requestId) => {
  const result = await query(queries.findByRequestId, [requestId]);
  return result.rows;
};

// Get pending extensions for manager
const getPendingForManager = async (department) => {
  const result = await query(queries.findPendingForManager, [department]);
  return result.rows;
};

// Get pending extensions for purchasing
const getPendingForPurchasing = async () => {
  const result = await query(queries.findPendingForPurchasing);
  return result.rows;
};

module.exports = {
  getById,
  getByRequestId,
  getPendingForManager,
  getPendingForPurchasing
};
