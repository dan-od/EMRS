/**
 * Equipment Logs Service
 * Handles General Log and Maintenance Log operations
 */

const { query } = require('../../config/db');
const logQueries = require('./equipmentLogs.queries');

// =====================================================
// GENERAL LOG
// =====================================================

const getGeneralLogs = async (equipmentId, filters = {}) => {
  const { type, startDate, endDate, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;
  
  const result = await query(logQueries.getGeneralLogsFiltered, [
    equipmentId,
    type || null,
    startDate || null,
    endDate || null,
    limit,
    offset
  ]);
  
  const countResult = await query(logQueries.countGeneralLogs, [equipmentId]);
  
  return {
    logs: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].total),
      totalPages: Math.ceil(countResult.rows[0].total / limit)
    }
  };
};

const createGeneralLog = async (data, user) => {
  const {
    equipment_id,
    entry_type,
    description,
    source = 'manual',
    reference_id = null,
    reference_type = null,
    entry_date = new Date(),
    location_from = null,
    location_to = null,
    notes = null
  } = data;
  
  const result = await query(logQueries.createGeneralLog, [
    equipment_id,
    entry_type,
    description,
    source,
    reference_id,
    reference_type,
    user.id,
    `${user.first_name} ${user.last_name}`,
    user.email,
    user.role,
    user.department,
    entry_date,
    location_from,
    location_to,
    notes
  ]);
  
  return result.rows[0];
};

// Auto-log from system actions (requests, jobs, etc.)
const autoLogGeneral = async (equipmentId, entryType, description, source, referenceId, referenceType, user) => {
  return createGeneralLog({
    equipment_id: equipmentId,
    entry_type: entryType,
    description,
    source,
    reference_id: referenceId,
    reference_type: referenceType
  }, user);
};

// =====================================================
// MAINTENANCE LOG
// =====================================================

const getMaintenanceLogs = async (equipmentId, filters = {}) => {
  const { type, startDate, endDate, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;
  
  const result = await query(logQueries.getMaintenanceLogsFiltered, [
    equipmentId,
    type || null,
    startDate || null,
    endDate || null,
    limit,
    offset
  ]);
  
  const countResult = await query(logQueries.countMaintenanceLogs, [equipmentId]);
  
  return {
    logs: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].total),
      totalPages: Math.ceil(countResult.rows[0].total / limit)
    }
  };
};

const createMaintenanceLog = async (data, user) => {
  const {
    equipment_id,
    entry_type,
    description,
    source = 'manual',
    maintenance_id = null,
    equipment_hours = null,
    labor_hours = null,
    cost = null,
    parts_used = null,
    entry_date = new Date(),
    notes = null
  } = data;
  
  const result = await query(logQueries.createMaintenanceLog, [
    equipment_id,
    entry_type,
    description,
    source,
    maintenance_id,
    user.id,
    `${user.first_name} ${user.last_name}`,
    user.email,
    user.role,
    user.department,
    equipment_hours,
    labor_hours,
    cost,
    parts_used,
    entry_date,
    notes
  ]);
  
  return result.rows[0];
};

// Auto-log from maintenance module when completed
const autoLogMaintenance = async (equipmentId, maintenanceRecord, user) => {
  return createMaintenanceLog({
    equipment_id: equipmentId,
    entry_type: maintenanceRecord.maintenance_type || 'Routine_Service',
    description: maintenanceRecord.completion_notes || maintenanceRecord.description,
    source: 'maintenance_module',
    maintenance_id: maintenanceRecord.id,
    equipment_hours: maintenanceRecord.equipment_hours,
    labor_hours: maintenanceRecord.actual_hours,
    cost: maintenanceRecord.actual_cost,
    parts_used: maintenanceRecord.parts_used
  }, user);
};

module.exports = {
  // General Log
  getGeneralLogs,
  createGeneralLog,
  autoLogGeneral,
  // Maintenance Log
  getMaintenanceLogs,
  createMaintenanceLog,
  autoLogMaintenance
};
