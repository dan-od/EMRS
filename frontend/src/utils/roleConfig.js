// ==============================================
// Roles — Must match DB user_role enum exactly (23 roles)
// ==============================================
export const ROLES = {
  SUPER_ADMIN: 'Super_Admin',
  ADMIN: 'Admin',
  IT_MANAGER: 'IT_Manager',
  IT_SUPPORT: 'IT_Support',
  OPERATIONS_MANAGER: 'Operations_Manager',
  FIELD_ENGINEER: 'Field_Engineer',
  OPERATOR: 'Operator',
  TECHNICIAN: 'Technician',
  MAINTENANCE_MANAGER: 'Maintenance_Manager',
  MAINTENANCE_TECHNICIAN: 'Maintenance_Technician',
  SAFETY_MANAGER: 'Safety_Manager',
  SAFETY_OFFICER: 'Safety_Officer',
  PURCHASING_MANAGER: 'Purchasing_Manager',
  PURCHASING_STAFF: 'Purchasing_Staff',
  ACCOUNTS_MANAGER: 'Accounts_Manager',
  ACCOUNTS_STAFF: 'Accounts_Staff',
  HR_MANAGER: 'HR_Manager',
  LOGISTICS_MANAGER: 'Logistics_Manager',
  LOGISTICS_COORDINATOR: 'Logistics_Coordinator',
  WORKSHOP_MANAGER: 'Workshop_Manager',
  STAFF: 'Staff'
};

// Role Hierarchy (lower number = higher privilege)
export const ROLE_LEVELS = {
  [ROLES.SUPER_ADMIN]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.IT_MANAGER]: 3,
  [ROLES.IT_SUPPORT]: 3,
  [ROLES.OPERATIONS_MANAGER]: 3,
  [ROLES.MAINTENANCE_MANAGER]: 4,
  [ROLES.HR_MANAGER]: 4,
  [ROLES.LOGISTICS_MANAGER]: 4,
  [ROLES.WORKSHOP_MANAGER]: 4,
  [ROLES.SAFETY_MANAGER]: 4,
  [ROLES.PURCHASING_MANAGER]: 4,
  [ROLES.ACCOUNTS_MANAGER]: 4,
  [ROLES.SAFETY_OFFICER]: 5,
  [ROLES.LOGISTICS_COORDINATOR]: 5,
  [ROLES.MAINTENANCE_TECHNICIAN]: 5,
  [ROLES.FIELD_ENGINEER]: 5,
  [ROLES.PURCHASING_STAFF]: 5,
  [ROLES.ACCOUNTS_STAFF]: 5,
  [ROLES.OPERATOR]: 6,
  [ROLES.TECHNICIAN]: 6,
  [ROLES.STAFF]: 6
};

// Departments — 11 aligned with backend
export const DEPARTMENTS = {
  OPERATIONS:     { id: 1,  name: 'Operations' },
  MAINTENANCE:    { id: 2,  name: 'Maintenance' },
  PURCHASING:     { id: 3,  name: 'Purchasing' },
  SAFETY:         { id: 4,  name: 'Safety' },
  FINANCE:        { id: 5,  name: 'Finance' },
  IT:             { id: 6,  name: 'IT' },
  HR:             { id: 7,  name: 'HR' },
  LOGISTICS:      { id: 8,  name: 'Logistics' },
  WORKSHOP:       { id: 9,  name: 'Workshop' },
  ENGINEERING:    { id: 10, name: 'Engineering' },
  FIELD_SERVICES: { id: 11, name: 'Field_Services' },
  MANAGEMENT:     { id: 12, name: 'Management' }
};

// Department → allowed roles (Staff available everywhere)
// Admin/Super_Admin roles are filtered at the UI level based on logged-in user
export const DEPARTMENT_ROLES = {
  Operations:     ['Operations_Manager', 'Field_Engineer', 'Operator', 'Staff'],
  Maintenance:    ['Maintenance_Manager', 'Maintenance_Technician', 'Field_Engineer', 'Technician', 'Staff'],
  Purchasing:     ['Purchasing_Manager', 'Purchasing_Staff', 'Staff'],
  Safety:         ['Safety_Manager', 'Safety_Officer', 'Staff'],
  Finance:        ['Accounts_Manager', 'Accounts_Staff', 'Staff'],
  IT:             ['IT_Manager', 'IT_Support', 'Staff'],
  HR:             ['HR_Manager', 'Staff'],
  Logistics:      ['Logistics_Manager', 'Logistics_Coordinator', 'Staff'],
  Workshop:       ['Workshop_Manager', 'Technician', 'Staff'],
  Engineering:    ['Operations_Manager', 'Field_Engineer', 'Technician', 'Staff'],
  Field_Services: ['Operations_Manager', 'Field_Engineer', 'Operator', 'Staff'],
  Management:     ['Super_Admin', 'Admin', 'Staff']
};

// Display overrides (DB value → friendly label)
const ROLE_DISPLAY = {
  Field_Engineer: 'Engineer',
  HR_Manager: 'HR Manager',
  IT_Support: 'IT Support',
};

export const getRoleLabel = (role) => {
  if (!role) return '';
  return ROLE_DISPLAY[role] || role.replace(/_/g, ' ');
};

export const getRolesForDepartment = (department) => {
  return DEPARTMENT_ROLES[department] || ['Staff'];
};
