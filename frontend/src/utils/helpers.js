import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ROLE_LEVELS, ROLES, PRIORITY, SEVERITY } from './constants';

// Class name utility
export const cn = (...inputs) => twMerge(clsx(inputs));

// Role helpers
export const hasRole = (userRole, requiredRoles) => {
  if (!userRole || !requiredRoles) return false;
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  return roles.includes(userRole);
};

export const hasMinRole = (userRole, minRole) => {
  if (!userRole || !minRole) return false;
  return ROLE_LEVELS[userRole] <= ROLE_LEVELS[minRole];
};

// Check if user is Super Admin
export const isSuperAdmin = (role) => role === ROLES.SUPER_ADMIN;

// Check if user is Admin or Super Admin
export const isAdmin = (role) => hasRole(role, [ROLES.SUPER_ADMIN, ROLES.ADMIN]);

// Check if user is any type of Manager
// Matches: Operations_Manager, Maintenance_Manager, Purchasing_Manager, Safety_Manager, Accounts_Manager
export const isManager = (role) => {
  if (!role) return false;
  return role.includes('Manager');
};

// Check if user is IT Support
export const isITSupport = (role) => role === ROLES.IT_SUPPORT;

// Check if user is regular Staff (not Engineer, not Manager, not Admin)
export const isStaff = (role) => role === ROLES.STAFF;

// Check if user is Purchasing Staff (not Manager)
export const isPurchasingStaff = (role) => role === ROLES.PURCHASING_STAFF;

// Check if user is any Purchasing role
export const isPurchasing = (role) => hasRole(role, [ROLES.PURCHASING_MANAGER, ROLES.PURCHASING_STAFF]);

// Check if user is any Accounts role
export const isAccounts = (role) => hasRole(role, [ROLES.ACCOUNTS_MANAGER, ROLES.ACCOUNTS_STAFF]);

// Check if user is Safety Officer
export const isSafetyOfficer = (role) => hasRole(role, [ROLES.SAFETY_OFFICER, ROLES.SAFETY_MANAGER]);

// Check if user is Field Engineer
export const isEngineer = (role) => {
  if (!role) return false;
  return role === ROLES.FIELD_ENGINEER || role.includes('Engineer');
};

// Check if user can view cost/financial information (managers, admins, purchasing - NOT engineers)
export const canViewCosts = (role) => {
  if (!role) return false;
  return isAdmin(role) || isManager(role) || isPurchasing(role);
};

// Check if user can manage users
export const canManageUsers = (role) => hasRole(role, [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.IT_SUPPORT]);

// Check if user can view business data (Equipment, Requests, Jobs)
export const canViewBusinessData = (role) => {
  if (!role) return false;
  // IT Support cannot see business data per PRD
  if (isITSupport(role)) return false;
  return true;
};

// Check if user can view Equipment
export const canViewEquipment = (role) => {
  if (!role) return false;
  // IT Support and regular Staff cannot view equipment
  if (isITSupport(role) || isStaff(role)) return false;
  // Purchasing roles CAN view (for disbursement prep)
  if (isPurchasing(role)) return true;
  return true;
};

// Check if user can view Jobs
export const canViewJobs = (role) => {
  if (!role) return false;
  // Only Admins, Managers, and Engineers can see Jobs
  if (isAdmin(role) || isManager(role) || isEngineer(role)) return true;
  return false;
};

// Check if user can view Maintenance
export const canViewMaintenance = (role) => {
  if (!role) return false;
  // Admins, Managers, Engineers can see Maintenance
  if (isAdmin(role) || isManager(role) || isEngineer(role)) return true;
  // Purchasing can see (for spare parts ordering)
  if (isPurchasing(role)) return true;
  return false;
};

// Check if user can view Purchasing module
export const canViewPurchasing = (role) => {
  if (!role) return false;
  // Admins and Purchasing roles
  if (isAdmin(role) || isPurchasing(role)) return true;
  // Managers can view (read-only)
  if (isManager(role)) return true;
  return false;
};

// Check if user can MANAGE Purchasing (disburse, adjust stock, etc.)
// Regular managers can only VIEW, not manage
export const canManagePurchasing = (role) => {
  if (!role) return false;
  // Only Admins and Purchasing roles can manage
  if (isAdmin(role) || isPurchasing(role)) return true;
  return false;
};

// Priority/Severity colors
export const getPriorityColor = (priority) => {
  const colors = {
    [PRIORITY.LOW]: 'bg-gray-100 text-gray-800',
    [PRIORITY.MEDIUM]: 'bg-blue-100 text-blue-800',
    [PRIORITY.HIGH]: 'bg-orange-100 text-orange-800',
    [PRIORITY.CRITICAL]: 'bg-red-100 text-red-800'
  };
  return colors[priority] || colors[PRIORITY.MEDIUM];
};

export const getSeverityColor = (severity) => {
  const colors = {
    [SEVERITY.LOW]: 'bg-green-100 text-green-800',
    [SEVERITY.MEDIUM]: 'bg-yellow-100 text-yellow-800',
    [SEVERITY.HIGH]: 'bg-orange-100 text-orange-800',
    [SEVERITY.CRITICAL]: 'bg-red-100 text-red-800'
  };
  return colors[severity] || colors[SEVERITY.MEDIUM];
};

// Status colors
export const getStatusColor = (status) => {
  const statusLower = status?.toLowerCase() || '';
  if (['approved', 'completed', 'resolved', 'operational'].includes(statusLower)) {
    return 'bg-green-100 text-green-800';
  }
  if (['pending', 'draft', 'submitted', 'planning'].includes(statusLower)) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (['rejected', 'cancelled', 'closed', 'retired'].includes(statusLower)) {
    return 'bg-red-100 text-red-800';
  }
  if (['in_progress', 'in_transit', 'under_review'].includes(statusLower)) {
    return 'bg-blue-100 text-blue-800';
  }
  return 'bg-gray-100 text-gray-800';
};

// Equipment maintenance status
export const getMaintenanceStatus = (equipment) => {
  if (!equipment) return { status: 'unknown', color: 'gray' };
  
  const { hours_run, last_service_hours, service_interval_hours } = equipment;
  const hoursSinceService = hours_run - last_service_hours;
  const hoursUntilDue = service_interval_hours - hoursSinceService;

  if (hoursUntilDue <= 0) return { status: 'overdue', color: 'red', hoursOverdue: Math.abs(hoursUntilDue) };
  if (hoursUntilDue <= 50) return { status: 'warning', color: 'yellow', hoursUntilDue };
  return { status: 'ok', color: 'green', hoursUntilDue };
};

// Generate initials from name
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Generate unique ID
export const generateId = () => Math.random().toString(36).slice(2, 11);

// Storage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage error:', e);
    }
  },
  remove: (key) => localStorage.removeItem(key)
};

// Request approval permissions
export const canApproveRequest = (userRole, request) => {
  if (!userRole || !request) return false;
  
  // Admins can approve all requests
  if (isAdmin(userRole)) return true;
  
  // Any Manager can approve requests in pending status
  if (isManager(userRole) && request.status === 'Pending') return true;
  
  return false;
};

// Check if user can edit a request
export const canEditRequest = (userRole, request, userId) => {
  if (!request) return false;
  
  // Can only edit pending requests
  if (request.status !== 'Pending') return false;
  
  // Owner can edit
  if (request.requester_id === userId) return true;
  
  // Admins can edit
  return isAdmin(userRole);
};

// Check if user can cancel a request
export const canCancelRequest = (userRole, request, userId) => {
  if (!request) return false;
  
  // Can only cancel pending requests
  if (request.status !== 'Pending') return false;
  
  // Owner can cancel
  if (request.requester_id === userId) return true;
  
  // Admins can cancel
  return isAdmin(userRole);
};
