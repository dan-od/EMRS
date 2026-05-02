// Auth endpoints
export const AUTH = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  REFRESH: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/change-password'
};

// Users endpoints
export const USERS = {
  BASE: '/users',
  BY_ID: (id) => `/users/${id}`,
  RESET_PASSWORD: (id) => `/users/${id}/reset-password`,
  TOGGLE_ACTIVE: (id) => `/users/${id}/toggle-active`
};

// Equipment endpoints
export const EQUIPMENT = {
  BASE: '/equipment',
  BY_ID: (id) => `/equipment/${id}`,
  LOG_HOURS: (id) => `/equipment/${id}/log-hours`,
  MAINTENANCE: (id) => `/equipment/${id}/maintenance`,
  HOURS_LOG: (id) => `/equipment/${id}/hours-log`,
  MAINTENANCE_LOG: (id) => `/equipment/${id}/maintenance-log`,
  MAINTENANCE_DUE: '/equipment/maintenance-due'
};

// Requests endpoints
export const REQUESTS = {
  BASE: '/requests',
  BY_ID: (id) => `/requests/${id}`,
  APPROVE: (id) => `/requests/${id}/approve`,
  REJECT: (id) => `/requests/${id}/reject`,
  CANCEL: (id) => `/requests/${id}/cancel`,
  TRANSFER: (id) => `/requests/${id}/transfer`,
  MY_REQUESTS: '/requests/my',
  ACTIVE: '/requests/active',
  PENDING: '/requests/pending',
  DEPARTMENT: '/requests/department',
  ALL: '/requests/all',
  HISTORY: (id) => `/requests/${id}/history`,
  AUDIT_TRAIL: (id) => `/requests/${id}/audit-trail`,
  // Purchasing-specific
  PURCHASING_ALL: '/requests/purchasing/all',
  PURCHASING_READY: '/requests/purchasing/ready',
  PURCHASING_ON_HOLD: '/requests/purchasing/on-hold',
  PURCHASING_DISBURSED: '/requests/purchasing/disbursed',
  PURCHASING_PENDING_RETURN: '/requests/purchasing/pending-return',
  PURCHASING_OVERDUE: '/requests/purchasing/overdue',
  PURCHASING_COMPLETED: '/requests/purchasing/completed',
  PURCHASING_MAINTENANCE: '/requests/purchasing/maintenance',
  PURCHASING_STATS: '/requests/purchasing/stats',
  // Actions
  DISBURSE: (id) => `/requests/${id}/disburse`,
  PUT_ON_HOLD: (id) => `/requests/${id}/hold`,
  RELEASE_FROM_HOLD: (id) => `/requests/${id}/release-hold`,
  INITIATE_RETURN: (id) => `/requests/${id}/return`,
  CONFIRM_RETURN: (id) => `/requests/${id}/confirm-return`,
  COMPLETE: (id) => `/requests/${id}/complete`,
  REMIND_RETURN: (id) => `/requests/${id}/remind-return`
};

// Jobs endpoints
export const JOBS = {
  BASE: '/jobs',
  BY_ID: (id) => `/jobs/${id}`,
  STATUS: (id) => `/jobs/${id}/status`,
  TEAM: (id) => `/jobs/${id}/team`,
  REMOVE_TEAM_MEMBER: (jobId, userId) => `/jobs/${jobId}/team/${userId}`,
  EQUIPMENT: (id) => `/jobs/${id}/equipment`,
  INSPECTIONS: (id) => `/jobs/${id}/inspections`
};

// Safety reports endpoints
export const SAFETY = {
  BASE: '/safety',
  BY_ID: (id) => `/safety/${id}`,
  MY_REPORTS: '/safety/my',
  STATS: '/safety/stats',
  UPDATE_STATUS: (id) => `/safety/${id}/status`,
  HISTORY: (id) => `/safety/${id}/history`
};

// Purchasing endpoints
export const PURCHASING = {
  INVENTORY: '/purchasing/inventory',
  INVENTORY_BY_ID: (id) => `/purchasing/inventory/${id}`,
  INVENTORY_MOVEMENTS: (id) => `/purchasing/inventory/${id}/movements`,
  LOW_STOCK: '/purchasing/inventory/low-stock',
  ADD_STOCK: (id) => `/purchasing/inventory/${id}/add-stock`,
  DISBURSEMENTS: '/purchasing/disbursements',
  DISBURSEMENTS_PENDING: '/purchasing/disbursements/pending',
  DISBURSEMENT_BY_ID: (id) => `/purchasing/disbursements/${id}`,
  DISBURSEMENT_APPROVE: (id) => `/purchasing/disbursements/${id}/approve`,
  DISBURSEMENT_REJECT: (id) => `/purchasing/disbursements/${id}/reject`,
  STATS: '/purchasing/stats',
  DASHBOARD_STATS: '/purchasing/dashboard-stats'
};

// Field reports endpoints
export const FIELD_REPORTS = {
  BASE: '/field-reports',
  BY_ID: (id) => `/field-reports/${id}`,
  REVIEW: (id) => `/field-reports/${id}/review`
};

// Notifications endpoints
export const NOTIFICATIONS = {
  BASE: '/notifications',
  UNREAD_COUNT: '/notifications/unread-count',
  MARK_READ: (id) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/read-all'
};

// Vehicles endpoints
export const VEHICLES = {
  BASE: '/vehicles',
  BY_ID: (id) => `/vehicles/${id}`,
  AVAILABLE: '/vehicles/available',
  DRIVERS: '/vehicles/drivers',
  STATUS: (id) => `/vehicles/${id}/status`
};

// Vendors endpoints
export const VENDORS = {
  BASE: '/vendors',
  BY_ID: (id) => `/vendors/${id}`,
  STATS: '/vendors/stats',
  ACTIVE: '/vendors/active',
  CATEGORIES: '/vendors/categories'
};

// Return Extensions endpoints
export const EXTENSIONS = {
  BASE: '/extensions',
  BY_ID: (id) => `/extensions/${id}`,
  BY_REQUEST: (requestId) => `/extensions/request/${requestId}`,
  PENDING_MANAGER: '/extensions/pending/manager',
  PENDING_PURCHASING: '/extensions/pending/purchasing',
  MANAGER_APPROVE: (id) => `/extensions/${id}/manager-approve`,
  MANAGER_REJECT: (id) => `/extensions/${id}/manager-reject`,
  PURCHASING_APPROVE: (id) => `/extensions/${id}/purchasing-approve`,
  PURCHASING_REJECT: (id) => `/extensions/${id}/purchasing-reject`
};
