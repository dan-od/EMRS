import { ROLES } from '@/utils/constants';

// Helper arrays for common role groups
const ADMINS = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
const MANAGERS = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.OPERATIONS_MANAGER, ROLES.MAINTENANCE_MANAGER];
const OPS_USERS = [...MANAGERS, ROLES.FIELD_ENGINEER];

export const routeConfig = {
  dashboard: {
    path: '/dashboard',
    roles: 'all'
  },
  equipment: {
    path: '/equipment',
    roles: 'all',
    children: {
      list: { path: '', roles: 'all' },
      detail: { path: ':id', roles: 'all' },
      add: { path: 'add', roles: MANAGERS }
    }
  },
  requests: {
    path: '/requests',
    roles: 'all',
    children: {
      hub: { path: '', roles: 'all' },
      myRequests: { path: 'my-requests', roles: 'all' },
      department: { path: 'department', roles: MANAGERS },
      detail: { path: ':id', roles: 'all' },
      create: { path: 'create/:type', roles: 'all' }
    }
  },
  jobs: {
    path: '/jobs',
    roles: OPS_USERS,
    children: {
      list: { path: '', roles: OPS_USERS },
      detail: { path: ':id', roles: OPS_USERS },
      create: { path: 'create', roles: MANAGERS }
    }
  },
  safety: {
    path: '/safety',
    roles: 'all',
    children: {
      hub: { path: '', roles: 'all' },
      report: { path: 'report/:type', roles: 'all' },
      myReports: { path: 'my-reports', roles: 'all' },
      dashboard: { path: 'dashboard', roles: [...MANAGERS, ROLES.SAFETY_MANAGER, ROLES.SAFETY_OFFICER] },
      detail: { path: ':id', roles: 'all' }
    }
  },
  purchasing: {
    path: '/purchasing',
    roles: [...ADMINS, ROLES.PURCHASING_MANAGER, ROLES.PURCHASING_STAFF],
    children: {
      dashboard: { path: '', roles: [...ADMINS, ROLES.PURCHASING_MANAGER, ROLES.PURCHASING_STAFF] },
      inventory: { path: 'inventory', roles: [...ADMINS, ROLES.PURCHASING_MANAGER, ROLES.PURCHASING_STAFF] },
      disbursements: { path: 'disbursements', roles: [...ADMINS, ROLES.PURCHASING_MANAGER, ROLES.PURCHASING_STAFF] }
    }
  },
  users: {
    path: '/users',
    roles: [...ADMINS, ROLES.IT_SUPPORT],
    children: {
      list: { path: '', roles: [...ADMINS, ROLES.IT_SUPPORT] },
      detail: { path: ':id', roles: [...ADMINS, ROLES.IT_SUPPORT] },
      create: { path: 'create', roles: [...ADMINS, ROLES.IT_SUPPORT] }
    }
  },
  maintenance: {
    path: '/maintenance',
    roles: OPS_USERS
  },
  settings: {
    path: '/settings',
    roles: 'all'
  }
};
