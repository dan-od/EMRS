const { query, transaction } = require('../../config/db');
const queries = require('./safety.queries');

const getAll = async (filters = {}) => {
  const { type, status, severity, reporterId, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  const [reportsResult, countResult] = await Promise.all([
    query(queries.findAll, [type, status, severity, reporterId, limit, offset]),
    query(queries.countAll, [type, status, severity, reporterId])
  ]);

  return {
    reports: reportsResult.rows,
    total: parseInt(countResult.rows[0].total),
    page,
    totalPages: Math.ceil(countResult.rows[0].total / limit)
  };
};

const getById = async (id) => {
  const result = await query(queries.findById, [id]);
  return result.rows[0] || null;
};

const getMyReports = async (userId, filters = {}) => {
  return getAll({ ...filters, reporterId: userId });
};

const create = async (data) => {
  const { reporterId, type, severity, title, description, location, incidentDate, isAnonymous } = data;
  
  return await transaction(async (client) => {
    const result = await client.query(queries.create, [
      isAnonymous ? null : reporterId, type, severity, title, description, location, incidentDate, isAnonymous
    ]);
    
    const report = result.rows[0];
    await client.query(queries.addHistory, [
      report.id, reporterId, null, 'Open', 'Report submitted'
    ]);
    
    return report;
  });
};

const updateStatus = async (id, data, changedBy) => {
  const { status, assignedTo, resolution } = data;
  
  return await transaction(async (client) => {
    const current = await client.query(queries.findById, [id]);
    if (!current.rows[0]) throw new Error('Report not found');
    
    const result = await client.query(queries.updateStatus, [id, status, assignedTo, resolution]);
    await client.query(queries.addHistory, [
      id, changedBy, current.rows[0].status, status, resolution
    ]);
    
    return result.rows[0];
  });
};

const getStats = async () => {
  const result = await query(queries.getStats);
  return result.rows[0];
};

const getHistory = async (reportId) => {
  const result = await query(queries.getHistory, [reportId]);
  return result.rows;
};

module.exports = { getAll, getById, getMyReports, create, updateStatus, getStats, getHistory };
