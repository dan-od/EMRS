const { authenticate, optionalAuth } = require('./auth');
const { 
  ROLES, 
  requireRole,
  requireRoles,
  requireMinRole, 
  requireManager, 
  requireAdmin, 
  requireSafety,
  requireDepartment 
} = require('./roleCheck');
const { validate, validateQuery, validateParams } = require('./validate');
const { AppError, errorHandler, notFound } = require('./errorHandler');
const { apiLimiter, authLimiter, passwordResetLimiter } = require('./rateLimiter');

module.exports = {
  // Auth
  authenticate,
  optionalAuth,
  
  // Role checks
  ROLES,
  requireRole,
  requireRoles,
  requireMinRole,
  requireManager,
  requireAdmin,
  requireSafety,
  requireDepartment,
  
  // Validation
  validate,
  validateQuery,
  validateParams,
  
  // Error handling
  AppError,
  errorHandler,
  notFound,
  
  // Rate limiting
  apiLimiter,
  authLimiter,
  passwordResetLimiter
};
