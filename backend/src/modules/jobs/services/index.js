/**
 * Jobs Services - Index
 */
module.exports = {
  ...require('./jobs.service'),
  ...require('./workflow.service'),
  ...require('./team.service'),
  ...require('./equipment.service'),
  ...require('./purchasing.service'),
  ...require('./material.service')
};
