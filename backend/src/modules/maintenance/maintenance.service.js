/**
 * Maintenance Service
 * Business logic for maintenance operations
 */

const { query, transaction } = require('../../config/db');
const maintenanceQueries = require('./maintenance.queries');
const logger = require('../../utils/logger');

const getAll = async (filters = {}) => {
  const { status, type, equipment_id, priority, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  let sql = maintenanceQueries.getAll;
  const params = [];
  let idx = 1;

  const conditions = [];

  if (status) {
    conditions.push(`m.status = $${idx}`);
    params.push(status);
    idx++;
  }

  if (type) {
    conditions.push(`m.maintenance_type = $${idx}`);
    params.push(type);
    idx++;
  }

  if (equipment_id) {
    conditions.push(`m.equipment_id = $${idx}`);
    params.push(equipment_id);
    idx++;
  }

  if (priority) {
    conditions.push(`m.priority = $${idx}`);
    params.push(priority);
    idx++;
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ` ORDER BY m.scheduled_date ASC LIMIT $${idx} OFFSET $${idx + 1}`;
  params.push(limit, offset);

  const result = await query(sql, params);

  // Get total count
  let countSql = 'SELECT COUNT(*) FROM maintenance_schedule m';
  if (conditions.length > 0) {
    countSql += ' WHERE ' + conditions.join(' AND ');
  }
  const countResult = await query(countSql, params.slice(0, -2));

  return {
    data: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].count),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    }
  };
};

const getById = async (id) => {
  const result = await query(maintenanceQueries.getById, [id]);
  const workOrder = result.rows[0];
  
  if (!workOrder) return null;

  // Fetch additional requests linked to this work order
  try {
    const additionalRequestsResult = await query(`
      SELECT 
        r.id,
        r.type,
        r.status,
        r.priority,
        r.details,
        r.created_at,
        r.updated_at,
        u.first_name || ' ' || u.last_name as requester_name
      FROM requests r
      LEFT JOIN users u ON r.requester_id = u.id
      WHERE r.details->>'workOrderId' = $1
        AND r.details->>'isAdditionalRequest' = 'true'
      ORDER BY r.created_at ASC
    `, [id]);

    workOrder.additional_requests = additionalRequestsResult.rows;
  } catch (err) {
    logger.error('Failed to fetch additional requests', { message: err.message });
    workOrder.additional_requests = [];
  }

  return workOrder;
};

const getDue = async (filters = {}) => {
  const { days = 7 } = filters;
  const result = await query(maintenanceQueries.getDue, [days]);
  return result.rows;
};

const getSchedule = async (startDate, endDate) => {
  const result = await query(maintenanceQueries.getSchedule, [startDate, endDate]);
  return result.rows;
};

const getByEquipment = async (equipmentId) => {
  const result = await query(maintenanceQueries.getByEquipment, [equipmentId]);
  return result.rows;
};

const create = async (data) => {
  const {
    equipment_id, maintenance_type, description, scheduled_date,
    priority, estimated_hours, estimated_cost, assigned_to, notes, createdBy
  } = data;

  const result = await query(maintenanceQueries.create, [
    equipment_id, maintenance_type, description, scheduled_date,
    priority || 'Medium', estimated_hours, estimated_cost,
    assigned_to, notes, createdBy
  ]);

  return getById(result.rows[0].id);
};

const update = async (id, data) => {
  const existing = await getById(id);
  if (!existing) return null;

  const {
    maintenance_type, description, scheduled_date,
    priority, estimated_hours, estimated_cost, notes
  } = data;

  await query(maintenanceQueries.update, [
    maintenance_type || existing.maintenance_type,
    description || existing.description,
    scheduled_date || existing.scheduled_date,
    priority || existing.priority,
    estimated_hours || existing.estimated_hours,
    estimated_cost || existing.estimated_cost,
    notes || existing.notes,
    id
  ]);

  return getById(id);
};

const startWork = async (id, userId) => {
  await query(maintenanceQueries.startWork, [userId, id]);
  return getById(id);
};

const complete = async (id, data, user) => {
  const { notes, parts_used, labor_hours, cost, completedBy } = data;

  await query(maintenanceQueries.complete, [
    notes, parts_used, labor_hours, cost, completedBy, id
  ]);

  // Update equipment's last maintenance date
  const record = await getById(id);
  if (record?.equipment_id) {
    await query(
      'UPDATE equipment SET last_maintenance_date = NOW(), last_maintenance_hours = current_hours WHERE id = $1',
      [record.equipment_id]
    );

    // Auto-log to equipment maintenance log
    try {
      const equipmentLogsService = require('../equipment/equipmentLogs.service');
      await equipmentLogsService.autoLogMaintenance(record.equipment_id, {
        ...record,
        completion_notes: notes,
        actual_hours: labor_hours,
        actual_cost: cost,
        parts_used
      }, user);
    } catch (e) {
      logger.error('Auto-log to equipment maintenance log failed', { message: e.message });
    }

    // Log activity for work order completion
    try {
      const { logActivity } = require('../../utils/activityLogger');
      await logActivity({
        userId: completedBy,
        userEmail: user?.email,
        userRole: user?.role,
        action: 'WORK_ORDER_COMPLETED',
        entityType: 'MAINTENANCE',
        entityId: id,
        entityName: `Work Order for ${record.equipment_name || 'Equipment'}`,
        details: {
          equipmentId: record.equipment_id,
          equipmentName: record.equipment_name,
          maintenanceType: record.maintenance_type,
          laborHours: labor_hours,
          cost: cost,
          partsUsed: parts_used,
          linkedRequestId: record.request_id || null
        },
        department: user?.department
      });
    } catch (e) {
      logger.error('Activity log for work order completion failed', { message: e.message });
    }
  }

  return getById(id);
};

const cancel = async (id, reason, userId) => {
  await query(maintenanceQueries.cancel, [reason, userId, id]);
  return getById(id);
};

const assignTechnician = async (id, technicianId, assignedBy) => {
  await query(maintenanceQueries.assignTechnician, [technicianId, assignedBy, id]);
  return getById(id);
};

const addParts = async (id, parts, userId) => {
  // parts = [{ inventory_id, quantity }]
  await transaction(async (client) => {
    for (const part of parts) {
      await client.query(maintenanceQueries.addPart, [id, part.inventory_id, part.quantity, userId]);

      const result = await client.query(
        'UPDATE inventory SET quantity = quantity - $1 WHERE id = $2 AND quantity >= $1',
        [part.quantity, part.inventory_id]
      );

      if (result.rowCount === 0) {
        throw new Error(`Insufficient stock for inventory item ${part.inventory_id}`);
      }
    }
  });
  return getById(id);
};

const getStats = async (filters = {}) => {
  const result = await query(maintenanceQueries.getStats);
  return result.rows[0];
};

const getHistory = async (maintenanceId) => {
  const result = await query(maintenanceQueries.getHistory, [maintenanceId]);
  return result.rows;
};

module.exports = {
  getAll, getById, getDue, getSchedule, getByEquipment,
  create, update, startWork, complete, cancel,
  assignTechnician, addParts, getStats, getHistory
};
