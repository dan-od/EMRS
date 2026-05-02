const { z } = require('zod');

// Must match DB user_role enum exactly
const ROLES = [
  'Super_Admin', 'Admin', 'IT_Manager', 'IT_Support',
  'Operations_Manager', 'Field_Engineer',
  'Maintenance_Manager', 'Maintenance_Technician',
  'Safety_Manager', 'Safety_Officer',
  'Purchasing_Manager', 'Purchasing_Staff',
  'Accounts_Manager', 'Accounts_Staff',
  'HR_Manager', 'Logistics_Manager', 'Logistics_Coordinator',
  'Workshop_Manager', 'Operator', 'Technician', 'Staff'
];

// Departments — aligned with frontend
const DEPARTMENTS = [
  'Operations', 'Maintenance', 'Purchasing', 'Safety',
  'Finance', 'IT', 'HR', 'Logistics', 'Workshop',
  'Engineering', 'Field_Services', 'Management'
];

// Department → allowed roles (Staff available everywhere)
const DEPARTMENT_ROLES = {
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

const create = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    role: z.enum(ROLES, { message: 'Invalid role' }),
    department: z.enum(DEPARTMENTS, { message: 'Invalid department' }),
    phone: z.string().optional().nullable()
  }).refine(
    (data) => {
      const allowed = DEPARTMENT_ROLES[data.department];
      return allowed && allowed.includes(data.role);
    },
    { message: 'Selected role is not valid for this department', path: ['role'] }
  )
});

const update = z.object({
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    phone: z.string().optional().nullable(),
    role: z.enum(ROLES).optional(),
    department: z.enum(DEPARTMENTS).optional()
  })
});

const resetPassword = z.object({
  body: z.object({
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
});

module.exports = { create, update, resetPassword, ROLES, DEPARTMENTS, DEPARTMENT_ROLES };
