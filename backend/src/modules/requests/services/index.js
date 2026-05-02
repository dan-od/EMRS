/**
 * Requests Services - Index
 * Aggregates all service modules for easy importing
 */

const base = require('./base.service');
const purchasing = require('./purchasing.service');
const create = require('./create.service');
const approval = require('./approval.service');
const disburse = require('./disburse.service');
const hold = require('./hold.service');
const returnInitiate = require('./return-initiate.service');
const returnConfirm = require('./return-confirm.service');
const actions = require('./actions.service');
const history = require('./history.service');

module.exports = {
  // Base operations
  ...base,
  // Purchasing-specific
  ...purchasing,
  // Create
  ...create,
  // Approval
  ...approval,
  // Disburse
  ...disburse,
  // Hold
  ...hold,
  // Return flow
  initiateReturn: returnInitiate.initiateReturn,
  confirmReturn: returnConfirm.confirmReturn,
  // Other actions
  ...actions,
  // History
  ...history
};
