/**
 * Accounts Module Index
 * Exports for accounts department functionality
 */

const accountsRoutes = require('./accounts.routes');
const accountsService = require('./accounts.service');
const accountsController = require('./accounts.controller');
const accountsQueries = require('./accounts.queries');

module.exports = {
  routes: accountsRoutes,
  service: accountsService,
  controller: accountsController,
  queries: accountsQueries
};
