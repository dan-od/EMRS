/**
 * Equipment Stats Controller
 * Statistics and reporting endpoints
 */
const equipmentService = require('./equipment.service');

/** GET /api/equipment/stats */
const getStats = async (req, res, next) => {
  try {
    const stats = await equipmentService.getStats();
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
};

/** GET /api/equipment/stats/by-department */
const getStatsByDepartment = async (req, res, next) => {
  try {
    const stats = await equipmentService.getStatsByDepartment();
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
};

module.exports = { getStats, getStatsByDepartment };
