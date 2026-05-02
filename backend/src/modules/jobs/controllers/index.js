/**
 * Jobs Controllers - Index
 */
module.exports = {
  ...require('./jobs.controller'),
  ...require('./workflow.controller'),
  ...require('./team.controller'),
  ...require('./equipment.controller'),
  ...require('./purchasing.controller'),
  ...require('./inspection.controller'),
  ...require('./material.controller')
};
