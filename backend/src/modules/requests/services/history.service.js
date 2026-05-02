/**
 * Requests Service - History Operations
 * Request history and audit trail
 */
const { query } = require('../../../config/db');
const queries = require('../requests.queries');

const getHistory = async (requestId) => {
  const result = await query(queries.getHistory, [requestId]);
  return result.rows;
};

const getAuditTrail = async (requestId) => {
  const result = await query(queries.getAuditTrail, [requestId]);
  return result.rows;
};

module.exports = { getHistory, getAuditTrail };
