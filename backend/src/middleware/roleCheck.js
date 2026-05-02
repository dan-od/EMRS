const { AppError } = require('./errorHandler');

const ROLES = {
  SUPER_ADMIN: 'Super_Admin',
  ADMIN: 'Admin',
  IT_MANAGER: 'IT_Manager',
  IT_SUPPORT: 'IT_Support',
  OPERATIONS_MANAGER: 'Operations_Manager',
  MAINTENANCE_MANAGER: 'Maintenance_Manager',
  MAINTENANCE_TECHNICIAN: 'Maintenance_Technician',
  SAFETY_MANAGER: 'Safety_Manager',
  HR_MANAGER: 'HR_Manager',
  LOGISTICS_MANAGER: 'Logistics_Manager',
  LOGISTICS_COORDINATOR: 'Logistics_Coordinator',
  WORKSHOP_MANAGER: 'Workshop_Manager',
  PURCHASING_MANAGER: 'Purchasing_Manager',
  ACCOUNTS_MANAGER: 'Accounts_Manager',
  SAFETY_OFFICER: 'Safety_Officer',
  PURCHASING_STAFF: 'Purchasing_Staff',
  ACCOUNTS_STAFF: 'Accounts_Staff',
  FIELD_ENGINEER: 'Field_Engineer',
  OPERATOR: 'Operator',
  TECHNICIAN: 'Technician',
  STAFF: 'Staff'
};

const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 10,
  [ROLES.ADMIN]: 9,
  [ROLES.IT_MANAGER]: 8,
  [ROLES.IT_SUPPORT]: 8,
  [ROLES.OPERATIONS_MANAGER]: 7,
  [ROLES.MAINTENANCE_MANAGER]: 7,
  [ROLES.SAFETY_MANAGER]: 7,
  [ROLES.HR_MANAGER]: 7,
  [ROLES.LOGISTICS_MANAGER]: 7,
  [ROLES.WORKSHOP_MANAGER]: 7,
  [ROLES.PURCHASING_MANAGER]: 7,
  [ROLES.ACCOUNTS_MANAGER]: 7,
  [ROLES.SAFETY_OFFICER]: 6,
  [ROLES.LOGISTICS_COORDINATOR]: 5,
  [ROLES.MAINTENANCE_TECHNICIAN]: 5,
  [ROLES.PURCHASING_STAFF]: 5,
  [ROLES.ACCOUNTS_STAFF]: 5,
  [ROLES.FIELD_ENGINEER]: 4,
  [ROLES.OPERATOR]: 4,
  [ROLES.TECHNICIAN]: 4,
  [ROLES.STAFF]: 4
};

const ALL_ROLES = Object.values(ROLES);

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return next(new AppError('Authentication required.', 401));
  if (!allowedRoles.includes(req.user.role)) return next(new AppError('You do not have permission.', 403));
  next();
};

const requireRoles = (allowedRoles) => (req, res, next) => {
  if (!req.user) return next(new AppError('Authentication required.', 401));
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(req.user.role)) return next(new AppError('You do not have permission.', 403));
  next();
};

const requireMinRole = (minRole) => (req, res, next) => {
  if (!req.user) return next(new AppError('Authentication required.', 401));
  const userLevel = ROLE_HIERARCHY[req.user.role] || 0;
  const requiredLevel = ROLE_HIERARCHY[minRole] || 0;
  if (userLevel < requiredLevel) return next(new AppError('Insufficient permissions.', 403));
  next();
};

const requireManager = requireMinRole(ROLES.SAFETY_OFFICER);
const requireAdmin = requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.IT_SUPPORT);

const requireSafety = requireRole(
  ROLES.SAFETY_MANAGER, ROLES.SAFETY_OFFICER, ROLES.SUPER_ADMIN, ROLES.ADMIN
);

const requirePurchasing = requireRole(
  ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.PURCHASING_MANAGER, ROLES.PURCHASING_STAFF
);

const requireAccounts = requireRole(
  ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTS_MANAGER, ROLES.ACCOUNTS_STAFF
);

const requireDepartment = (...departments) => (req, res, next) => {
  if (!req.user) return next(new AppError('Authentication required.', 401));
  if ([ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.IT_SUPPORT].includes(req.user.role)) return next();
  if (!departments.includes(req.user.department)) return next(new AppError('Department access denied.', 403));
  next();
};

module.exports = {
  ROLES, ROLE_HIERARCHY, ALL_ROLES,
  requireRole, requireRoles, requireMinRole,
  requireManager, requireAdmin, requireSafety,
  requirePurchasing, requireAccounts, requireDepartment
};
