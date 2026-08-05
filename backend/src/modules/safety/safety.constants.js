/**
 * Roles that may see every safety report.
 *
 * Single source for the module: safety.routes.js gates the list, stats and
 * status endpoints with it, and safety.authorize.js uses it to decide who can
 * open a report they did not file. Kept in step with the frontend's
 * SAFETY_ROLES (routes/routeRoles.js) and SafetyHub's SAFETY_ADMIN_ROLES.
 *
 * IT_Support is deliberately absent — it holds user-management permissions,
 * not business data, and safety reports carry incident and reporter details.
 */
const SAFETY_ROLES = [
  'Super_Admin',
  'Admin',
  'Safety_Manager',
  'Safety_Officer',
  'Operations_Manager',
];

module.exports = { SAFETY_ROLES };
