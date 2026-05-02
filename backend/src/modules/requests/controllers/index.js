/**
 * Requests Controllers - Index
 * Aggregates all controller modules for easy importing
 */
module.exports = {
  ...require('./base.controller'),
  ...require('./purchasing.controller'),
  ...require('./create.controller'),
  ...require('./approval.controller'),
  ...require('./disburse.controller'),
  ...require('./hold.controller'),
  ...require('./return.controller'),
  ...require('./actions.controller'),
  ...require('./history.controller')
};
