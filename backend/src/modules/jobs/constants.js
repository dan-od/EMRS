/**
 * Jobs Module - Backend Constants (V2 - Request Cycle Complete)
 * Updated: January 20, 2026
 * Keep in sync with frontend/src/features/jobs/constants.js
 */

// ========================================
// JOB STATUS
// ========================================
const JOB_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  IN_PROGRESS: 'IN_PROGRESS',
  POST_JOB: 'POST_JOB',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

const STATUS_FLOW = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'POST_JOB', 'COMPLETED'];

// ========================================
// EQUIPMENT SOURCE
// ========================================
const EQUIPMENT_SOURCE = {
  INVENTORY: 'INVENTORY',
  CLIENT: 'CLIENT',
  NEW_REQUEST: 'NEW_REQUEST'
};

// ========================================
// ITEM TYPE
// ========================================
const ITEM_TYPE = {
  EQUIPMENT: 'EQUIPMENT',
  MATERIAL_TOOL: 'MATERIAL_TOOL'
};

// ========================================
// ITEM STATUS (V2 - EXPANDED)
// ========================================
const ITEM_STATUS = {
  // Draft Phase
  DRAFT: 'DRAFT',
  
  // Request/Approval Phase
  REQUESTED: 'REQUESTED',
  PENDING_SUPERVISOR: 'PENDING_SUPERVISOR',
  SUPERVISOR_REJECTED: 'SUPERVISOR_REJECTED',
  MANAGER_REVIEW: 'MANAGER_REVIEW',
  PARTIALLY_APPROVED: 'PARTIALLY_APPROVED',
  REJECTED: 'REJECTED',
  RESUBMITTED: 'RESUBMITTED',
  APPROVED: 'APPROVED',
  
  // Sourcing Phase
  PENDING_QUOTE: 'PENDING_QUOTE',
  SOURCING: 'SOURCING',
  ARRIVED: 'ARRIVED',
  
  // Inspection Phase
  PENDING_INSPECTION: 'PENDING_INSPECTION',
  INSPECTION_SUBMITTED: 'INSPECTION_SUBMITTED',
  INSPECTION_APPROVED: 'INSPECTION_APPROVED',
  
  // Disbursement Phase
  DISBURSED: 'DISBURSED',
  PARTIALLY_DISBURSED: 'PARTIALLY_DISBURSED',
  
  // Active Job Phase
  IN_USE: 'IN_USE',
  UNDER_REPAIR: 'UNDER_REPAIR',
  
  // Return Phase
  PENDING_RETURN: 'PENDING_RETURN',
  RETURNED: 'RETURNED',
  RETURNED_DAMAGED: 'RETURNED_DAMAGED',
  CONSUMED: 'CONSUMED',
  MARKED_LOST: 'MARKED_LOST',
  DISPOSED: 'DISPOSED',
  
  // Other
  CANCELLED: 'CANCELLED'
};

// Statuses grouped by phase (for queries)
const ITEM_STATUS_BY_PHASE = {
  draft: ['DRAFT'],
  approval: ['REQUESTED', 'PENDING_SUPERVISOR', 'SUPERVISOR_REJECTED', 'MANAGER_REVIEW', 'PARTIALLY_APPROVED', 'REJECTED', 'RESUBMITTED', 'APPROVED'],
  sourcing: ['PENDING_QUOTE', 'SOURCING', 'ARRIVED'],
  inspection: ['PENDING_INSPECTION', 'INSPECTION_SUBMITTED', 'INSPECTION_APPROVED'],
  disbursed: ['DISBURSED', 'PARTIALLY_DISBURSED'],
  active: ['IN_USE', 'UNDER_REPAIR'],
  return: ['PENDING_RETURN', 'RETURNED', 'RETURNED_DAMAGED', 'CONSUMED', 'MARKED_LOST', 'DISPOSED'],
  cancelled: ['CANCELLED']
};

// ========================================
// REQUEST TYPE (NEW)
// ========================================
const REQUEST_TYPE = {
  ORIGINAL: 'ORIGINAL',
  ADDITIONAL: 'ADDITIONAL',
  SWAP_REPLACEMENT: 'SWAP_REPLACEMENT',
  SWAP_RETURN: 'SWAP_RETURN',
  EMERGENCY: 'EMERGENCY'
};

// ========================================
// DISPOSITION TYPE (NEW - for returns)
// ========================================
const DISPOSITION_TYPE = {
  RETURNING: 'RETURNING',
  LEFT_TEMPORARY: 'LEFT_TEMPORARY',
  LEFT_PERMANENT: 'LEFT_PERMANENT',
  CONSUMED: 'CONSUMED',
  LOST: 'LOST'
};

// ========================================
// SWAP REQUEST STATUS (NEW)
// ========================================
const SWAP_STATUS = {
  PENDING: 'PENDING',
  SUPERVISOR_REVIEW: 'SUPERVISOR_REVIEW',
  MANAGER_REVIEW: 'MANAGER_REVIEW',
  APPROVED: 'APPROVED',
  PICKUP_ARRANGED: 'PICKUP_ARRANGED',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED'
};

// ========================================
// CONDITION OPTIONS (for inspections)
// ========================================
const PHYSICAL_CONDITION = {
  GOOD: 'Good',
  FAIR: 'Fair',
  DAMAGED: 'Damaged',
  DESTROYED: 'Destroyed'
};

const FUNCTIONAL_STATUS = {
  WORKING: 'Working',
  PARTIALLY_WORKING: 'Partially_Working',
  NOT_WORKING: 'Not_Working'
};

const CLEANING_STATUS = {
  CLEANED: 'Cleaned',
  NEEDS_CLEANING: 'Needs_Cleaning',
  NA: 'N/A'
};

// ========================================
// JOB TEAM ROLES
// ========================================
const JOB_TEAM_ROLE = { 
  SUPERVISOR: 'SUPERVISOR', 
  CHIEF_OPERATOR: 'CHIEF_OPERATOR',
  DAQ: 'DAQ',
  ENGINEER: 'ENGINEER'
};

const JOB_TEAM_ROLE_PERMISSIONS = {
  SUPERVISOR: { canRequest: true, canApprove: true, canInspect: true },
  CHIEF_OPERATOR: { canRequest: true, canApprove: false, canInspect: true },
  DAQ: { canRequest: true, canApprove: false, canInspect: true },
  ENGINEER: { canRequest: false, canApprove: false, canInspect: true }
};

// ========================================
// PRIORITY
// ========================================
const PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical'
};

// ========================================
// ROLE PERMISSIONS
// ========================================
const MANAGER_ROLES = [
  'Super Admin', 'Super_Admin', 'Admin', 
  'Operations Manager', 'Operations_Manager'
];

const PURCHASING_ROLES = [
  'Super Admin', 'Super_Admin', 'Admin', 
  'Purchasing Manager', 'Purchasing_Manager', 
  'Purchasing Staff', 'Purchasing_Staff'
];

const SUPERVISOR_ROLES = [
  'Supervisor', 'Field Supervisor', 'Field_Supervisor'
];

// ========================================
// PURCHASING QUEUE FILTERS
// ========================================
const PURCHASING_QUEUE_FILTERS = {
  pending_disburse: {
    statuses: ['APPROVED', 'INSPECTION_APPROVED'],
    sources: ['INVENTORY']
  },
  needs_sourcing: {
    statuses: ['APPROVED', 'PENDING_QUOTE'],
    sources: ['NEW_REQUEST']
  },
  in_sourcing: {
    statuses: ['SOURCING'],
    sources: ['NEW_REQUEST']
  },
  arrived: {
    statuses: ['ARRIVED'],
    sources: ['NEW_REQUEST']
  },
  pending_inspection: {
    statuses: ['PENDING_INSPECTION', 'INSPECTION_SUBMITTED'],
    sources: null // All
  },
  in_repair: {
    statuses: ['UNDER_REPAIR'],
    sources: null
  },
  pending_returns: {
    statuses: ['PENDING_RETURN'],
    sources: null
  }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Check if status allows editing
 */
const isEditableStatus = (status) => {
  return ['DRAFT', 'REJECTED', 'SUPERVISOR_REJECTED'].includes(status);
};

/**
 * Check if item can be inspected
 */
const canInspect = (status) => {
  return ['APPROVED', 'ARRIVED', 'PENDING_INSPECTION'].includes(status);
};

/**
 * Check if item is in active/disbursed state
 */
const isActiveItem = (status) => {
  return ['DISBURSED', 'IN_USE', 'UNDER_REPAIR'].includes(status);
};

/**
 * Check if item has completed its lifecycle
 */
const isCompletedItem = (status) => {
  return ['RETURNED', 'RETURNED_DAMAGED', 'CONSUMED', 'MARKED_LOST', 'DISPOSED', 'CANCELLED'].includes(status);
};

/**
 * Check if user can request based on job team role
 */
const canUserRequest = (jobRole) => {
  return JOB_TEAM_ROLE_PERMISSIONS[jobRole]?.canRequest || false;
};

/**
 * Check if user can approve based on job team role
 */
const canUserApprove = (jobRole) => {
  return JOB_TEAM_ROLE_PERMISSIONS[jobRole]?.canApprove || false;
};

/**
 * Check if user is a manager
 */
const isManager = (role) => {
  return MANAGER_ROLES.some(r => 
    r.toLowerCase() === role?.toLowerCase() || 
    r.replace('_', ' ').toLowerCase() === role?.toLowerCase()
  );
};

/**
 * Check if user is purchasing
 */
const isPurchasing = (role) => {
  return PURCHASING_ROLES.some(r => 
    r.toLowerCase() === role?.toLowerCase() || 
    r.replace('_', ' ').toLowerCase() === role?.toLowerCase()
  );
};

module.exports = {
  // Job status
  JOB_STATUS,
  STATUS_FLOW,
  
  // Equipment
  EQUIPMENT_SOURCE,
  ITEM_TYPE,
  ITEM_STATUS,
  ITEM_STATUS_BY_PHASE,
  
  // Request types
  REQUEST_TYPE,
  DISPOSITION_TYPE,
  SWAP_STATUS,
  
  // Inspection
  PHYSICAL_CONDITION,
  FUNCTIONAL_STATUS,
  CLEANING_STATUS,
  
  // Team
  JOB_TEAM_ROLE,
  JOB_TEAM_ROLE_PERMISSIONS,
  
  // Priority
  PRIORITY,
  
  // Roles
  MANAGER_ROLES,
  PURCHASING_ROLES,
  SUPERVISOR_ROLES,
  
  // Purchasing queue
  PURCHASING_QUEUE_FILTERS,
  
  // Helpers
  isEditableStatus,
  canInspect,
  isActiveItem,
  isCompletedItem,
  canUserRequest,
  canUserApprove,
  isManager,
  isPurchasing
};
