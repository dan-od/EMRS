/**
 * Extensions Controllers - Index
 */
module.exports = {
  ...require('./create.controller'),
  ...require('./approval.controller'),
  ...require('./getters.controller')
};
