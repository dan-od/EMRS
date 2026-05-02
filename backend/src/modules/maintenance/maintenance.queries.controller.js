/**
 * Maintenance Queries Controller
 * Read-only operations: getAll, getById, getDue, getSchedule, getByEquipment, getStats, getHistory
 */

const maintenanceService = require('./maintenance.service');

const getAll = async (req, res, next) => {
  try {
    const result = await maintenanceService.getAll(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const record = await maintenanceService.getById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Maintenance record not found' });
    res.json(record);
  } catch (error) {
    next(error);
  }
};

const getDue = async (req, res, next) => {
  try {
    const records = await maintenanceService.getDue(req.query);
    res.json(records);
  } catch (error) {
    next(error);
  }
};

const getSchedule = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const schedule = await maintenanceService.getSchedule(startDate, endDate);
    res.json(schedule);
  } catch (error) {
    next(error);
  }
};

const getByEquipment = async (req, res, next) => {
  try {
    const records = await maintenanceService.getByEquipment(req.params.equipmentId);
    res.json(records);
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await maintenanceService.getStats(req.query);
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const history = await maintenanceService.getHistory(req.params.id);
    res.json(history);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, getDue, getSchedule, getByEquipment, getStats, getHistory };
