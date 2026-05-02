/**
 * Extensions Services - Index
 * Aggregates all service modules
 */
module.exports = {
  ...require('./create.service'),
  ...require('./manager.service'),
  ...require('./purchasing.service'),
  ...require('./getters.service')
};
