/**
 * Maintenance Controller
 * Re-exports from modular controller files
 */

const queries = require('./maintenance.queries.controller');
const actions = require('./maintenance.actions.controller');
const additional = require('./additionalRequest.controller');

module.exports = {
  // Queries
  getAll: queries.getAll,
  getById: queries.getById,
  getDue: queries.getDue,
  getSchedule: queries.getSchedule,
  getByEquipment: queries.getByEquipment,
  getStats: queries.getStats,
  getHistory: queries.getHistory,
  
  // Actions
  create: actions.create,
  update: actions.update,
  startWork: actions.startWork,
  complete: actions.complete,
  cancel: actions.cancel,
  assignTechnician: actions.assignTechnician,
  addParts: actions.addParts,
  
  // Additional Requests
  createAdditionalRequest: additional.createAdditionalRequest
};
