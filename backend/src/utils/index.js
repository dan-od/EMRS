const logger = require('./logger');
const { sendEmail, sendPasswordReset, sendWelcome } = require('./email');
const { logActivity, ACTIONS, ENTITY_TYPES } = require('./activityLogger');
const {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  hashResetToken,
  generateTempPassword,
  generateId
} = require('./tokenGenerator');

module.exports = {
  logger,
  sendEmail,
  sendPasswordReset,
  sendWelcome,
  logActivity,
  ACTIONS,
  ENTITY_TYPES,
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  hashResetToken,
  generateTempPassword,
  generateId
};
