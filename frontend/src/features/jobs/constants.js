/**
 * Jobs Module - Constants (V2 - Request Cycle Complete)
 * Updated: January 20, 2026
 */

// ========================================
// JOB STATUS (Unchanged)
// ========================================
export const JOB_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  IN_PROGRESS: 'IN_PROGRESS',
  POST_JOB: 'POST_JOB',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const JOB_STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'gray' },
  PENDING_APPROVAL: { label: 'Pending Approval', color: 'yellow' },
  APPROVED: { label: 'Approved', color: 'blue' },
  IN_PROGRESS: { label: 'In Progress', color: 'primary' },
  POST_JOB: { label: 'Post Job', color: 'purple' },
  COMPLETED: { label: 'Completed', color: 'green' },
  CANCELLED: { label: 'Cancelled', color: 'red' }
};

export const STATUS_FLOW = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'POST_JOB', 'COMPLETED'];

// ========================================
// EQUIPMENT SOURCE (Unchanged)
// ========================================
export const EQUIPMENT_SOURCE = {
  INVENTORY: 'INVENTORY',
  CLIENT: 'CLIENT',
  NEW_REQUEST: 'NEW_REQUEST'
};

export const EQUIPMENT_SOURCE_CONFIG = {
  INVENTORY: { label: 'From Inventory', color: 'blue', icon: 'package' },
  CLIENT: { label: 'Client Provided', color: 'purple', icon: 'users' },
  NEW_REQUEST: { label: 'New Request', color: 'orange', icon: 'plus-circle' }
};

// ========================================
// ITEM TYPE (Unchanged)
// ========================================
export const ITEM_TYPE = {
  EQUIPMENT: 'EQUIPMENT',
  MATERIAL_TOOL: 'MATERIAL_TOOL'
};

export const ITEM_TYPE_OPTIONS = [
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'MATERIAL_TOOL', label: 'Material / Tool' }
];

// ========================================
// ITEM STATUS (V2 - EXPANDED)
// ========================================
export const ITEM_STATUS = {
  // === Draft Phase ===
  DRAFT: 'DRAFT',
  
  // === Request/Approval Phase ===
  REQUESTED: 'REQUESTED',
  PENDING_SUPERVISOR: 'PENDING_SUPERVISOR',
  SUPERVISOR_REJECTED: 'SUPERVISOR_REJECTED',
  MANAGER_REVIEW: 'MANAGER_REVIEW',
  PARTIALLY_APPROVED: 'PARTIALLY_APPROVED',
  REJECTED: 'REJECTED',
  RESUBMITTED: 'RESUBMITTED',
  APPROVED: 'APPROVED',
  
  // === Sourcing Phase (NEW_REQUEST only) ===
  PENDING_QUOTE: 'PENDING_QUOTE',
  SOURCING: 'SOURCING',
  ARRIVED: 'ARRIVED',
  
  // === Inspection Phase ===
  PENDING_INSPECTION: 'PENDING_INSPECTION',
  INSPECTION_SUBMITTED: 'INSPECTION_SUBMITTED',
  INSPECTION_APPROVED: 'INSPECTION_APPROVED',
  
  // === Disbursement Phase ===
  DISBURSED: 'DISBURSED',
  PARTIALLY_DISBURSED: 'PARTIALLY_DISBURSED',
  
  // === Active Job Phase ===
  IN_USE: 'IN_USE',
  UNDER_REPAIR: 'UNDER_REPAIR',
  
  // === Return Phase ===
  PENDING_RETURN: 'PENDING_RETURN',
  RETURNED: 'RETURNED',
  RETURNED_DAMAGED: 'RETURNED_DAMAGED',
  CONSUMED: 'CONSUMED',
  MARKED_LOST: 'MARKED_LOST',
  DISPOSED: 'DISPOSED',
  
  // === Other ===
  CANCELLED: 'CANCELLED'
};

export const ITEM_STATUS_CONFIG = {
  // Draft
  DRAFT: { label: 'Draft', color: 'gray', icon: 'edit', phase: 'draft' },
  
  // Request/Approval
  REQUESTED: { label: 'Requested', color: 'gray', icon: 'clock', phase: 'approval' },
  PENDING_SUPERVISOR: { label: 'Pending Supervisor', color: 'yellow', icon: 'clock', phase: 'approval' },
  SUPERVISOR_REJECTED: { label: 'Supervisor Rejected', color: 'red', icon: 'x', phase: 'approval' },
  MANAGER_REVIEW: { label: 'Manager Review', color: 'yellow', icon: 'eye', phase: 'approval' },
  PARTIALLY_APPROVED: { label: 'Partially Approved', color: 'orange', icon: 'check', phase: 'approval' },
  REJECTED: { label: 'Rejected', color: 'red', icon: 'x', phase: 'approval' },
  RESUBMITTED: { label: 'Resubmitted', color: 'blue', icon: 'refresh-cw', phase: 'approval' },
  APPROVED: { label: 'Approved', color: 'blue', icon: 'check', phase: 'approval' },
  
  // Sourcing
  PENDING_QUOTE: { label: 'Pending Quote', color: 'purple', icon: 'file-text', phase: 'sourcing' },
  SOURCING: { label: 'Sourcing', color: 'purple', icon: 'search', phase: 'sourcing' },
  ARRIVED: { label: 'Arrived', color: 'teal', icon: 'package', phase: 'sourcing' },
  
  // Inspection
  PENDING_INSPECTION: { label: 'Pending Inspection', color: 'yellow', icon: 'clipboard', phase: 'inspection' },
  INSPECTION_SUBMITTED: { label: 'Inspection Submitted', color: 'blue', icon: 'clipboard-check', phase: 'inspection' },
  INSPECTION_APPROVED: { label: 'Inspection Approved', color: 'green', icon: 'check-circle', phase: 'inspection' },
  
  // Disbursement
  DISBURSED: { label: 'Disbursed', color: 'green', icon: 'check-circle', phase: 'disbursed' },
  PARTIALLY_DISBURSED: { label: 'Partially Disbursed', color: 'orange', icon: 'check', phase: 'disbursed' },
  
  // Active
  IN_USE: { label: 'In Use', color: 'primary', icon: 'tool', phase: 'active' },
  UNDER_REPAIR: { label: 'Under Repair', color: 'orange', icon: 'wrench', phase: 'active' },
  
  // Return
  PENDING_RETURN: { label: 'Pending Return', color: 'orange', icon: 'clock', phase: 'return' },
  RETURNED: { label: 'Returned', color: 'green', icon: 'check', phase: 'return' },
  RETURNED_DAMAGED: { label: 'Returned Damaged', color: 'red', icon: 'alert-triangle', phase: 'return' },
  CONSUMED: { label: 'Consumed', color: 'gray', icon: 'check', phase: 'return' },
  MARKED_LOST: { label: 'Lost', color: 'red', icon: 'x', phase: 'return' },
  DISPOSED: { label: 'Disposed', color: 'gray', icon: 'trash-2', phase: 'return' },
  
  // Other
  CANCELLED: { label: 'Cancelled', color: 'gray', icon: 'x', phase: 'cancelled' }
};

// ========================================
// REQUEST TYPE (NEW)
// ========================================
export const REQUEST_TYPE = {
  ORIGINAL: 'ORIGINAL',
  ADDITIONAL: 'ADDITIONAL',
  SWAP_REPLACEMENT: 'SWAP_REPLACEMENT',
  SWAP_RETURN: 'SWAP_RETURN',
  EMERGENCY: 'EMERGENCY'
};

export const REQUEST_TYPE_CONFIG = {
  ORIGINAL: { label: 'Original Request', color: 'gray' },
  ADDITIONAL: { label: 'Additional Request', color: 'blue' },
  SWAP_REPLACEMENT: { label: 'Swap Replacement', color: 'purple' },
  SWAP_RETURN: { label: 'Swap Return', color: 'orange' },
  EMERGENCY: { label: 'Emergency', color: 'red' }
};

// ========================================
// DISPOSITION TYPE (NEW - for returns)
// ========================================
export const DISPOSITION_TYPE = {
  RETURNING: 'RETURNING',
  LEFT_TEMPORARY: 'LEFT_TEMPORARY',
  LEFT_PERMANENT: 'LEFT_PERMANENT',
  CONSUMED: 'CONSUMED',
  LOST: 'LOST'
};

export const DISPOSITION_TYPE_CONFIG = {
  RETURNING: { 
    label: 'Returning to Warehouse', 
    color: 'green', 
    icon: 'truck',
    description: 'Equipment will be returned to inventory'
  },
  LEFT_TEMPORARY: { 
    label: 'Left On-Site (Temporary)', 
    color: 'orange', 
    icon: 'map-pin',
    description: 'Equipment left at site, pickup scheduled'
  },
  LEFT_PERMANENT: { 
    label: 'Left On-Site (Permanent)', 
    color: 'purple', 
    icon: 'home',
    description: 'Equipment transferred to client'
  },
  CONSUMED: { 
    label: 'Consumed/Used Up', 
    color: 'gray', 
    icon: 'check',
    description: 'Consumable material fully used'
  },
  LOST: { 
    label: 'Lost/Missing', 
    color: 'red', 
    icon: 'alert-triangle',
    description: 'Equipment cannot be located'
  }
};

export const DISPOSITION_OPTIONS = [
  { value: 'RETURNING', label: 'Returning to Warehouse' },
  { value: 'LEFT_TEMPORARY', label: 'Left On-Site (Temporary)' },
  { value: 'LEFT_PERMANENT', label: 'Left On-Site (Permanent)' },
  { value: 'CONSUMED', label: 'Consumed/Used Up' },
  { value: 'LOST', label: 'Lost/Missing' }
];

// ========================================
// SWAP REQUEST STATUS (NEW)
// ========================================
export const SWAP_STATUS = {
  PENDING: 'PENDING',
  SUPERVISOR_REVIEW: 'SUPERVISOR_REVIEW',
  MANAGER_REVIEW: 'MANAGER_REVIEW',
  APPROVED: 'APPROVED',
  PICKUP_ARRANGED: 'PICKUP_ARRANGED',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED'
};

export const SWAP_STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'gray', icon: 'clock' },
  SUPERVISOR_REVIEW: { label: 'Supervisor Review', color: 'yellow', icon: 'eye' },
  MANAGER_REVIEW: { label: 'Manager Review', color: 'yellow', icon: 'eye' },
  APPROVED: { label: 'Approved', color: 'blue', icon: 'check' },
  PICKUP_ARRANGED: { label: 'Pickup Arranged', color: 'purple', icon: 'truck' },
  COMPLETED: { label: 'Completed', color: 'green', icon: 'check-circle' },
  REJECTED: { label: 'Rejected', color: 'red', icon: 'x' }
};

// ========================================
// CONDITION OPTIONS (for inspections)
// ========================================
export const PHYSICAL_CONDITION = {
  GOOD: 'Good',
  FAIR: 'Fair',
  DAMAGED: 'Damaged',
  DESTROYED: 'Destroyed'
};

export const PHYSICAL_CONDITION_OPTIONS = [
  { value: 'Good', label: 'Good - No visible damage' },
  { value: 'Fair', label: 'Fair - Minor wear' },
  { value: 'Damaged', label: 'Damaged - Needs repair' },
  { value: 'Destroyed', label: 'Destroyed - Beyond repair' }
];

export const FUNCTIONAL_STATUS = {
  WORKING: 'Working',
  PARTIALLY_WORKING: 'Partially_Working',
  NOT_WORKING: 'Not_Working'
};

export const FUNCTIONAL_STATUS_OPTIONS = [
  { value: 'Working', label: 'Working - Fully operational' },
  { value: 'Partially_Working', label: 'Partially Working - Some issues' },
  { value: 'Not_Working', label: 'Not Working - Non-functional' }
];

export const CLEANING_STATUS_OPTIONS = [
  { value: 'Cleaned', label: 'Cleaned' },
  { value: 'Needs_Cleaning', label: 'Needs Cleaning' },
  { value: 'N/A', label: 'Not Applicable' }
];

// ========================================
// JOB TEAM ROLES (Unchanged)
// ========================================
export const JOB_TEAM_ROLE = { 
  SUPERVISOR: 'SUPERVISOR', 
  CHIEF_OPERATOR: 'CHIEF_OPERATOR',
  DAQ: 'DAQ',
  ENGINEER: 'ENGINEER'
};

export const JOB_TEAM_ROLE_CONFIG = {
  SUPERVISOR: { 
    label: 'Supervisor', 
    icon: 'crown', 
    color: 'primary', 
    canRequest: true, 
    canApprove: true,
    canInspect: true
  },
  CHIEF_OPERATOR: { 
    label: 'Chief Operator', 
    icon: 'settings', 
    color: 'blue', 
    canRequest: true, 
    canApprove: false,
    canInspect: true
  },
  DAQ: { 
    label: 'DAQ', 
    icon: 'activity', 
    color: 'purple', 
    canRequest: true, 
    canApprove: false,
    canInspect: true
  },
  ENGINEER: { 
    label: 'Engineer', 
    icon: 'wrench', 
    color: 'gray', 
    canRequest: false, 
    canApprove: false,
    canInspect: true
  }
};

// ========================================
// PRIORITY OPTIONS (Unchanged)
// ========================================
export const PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical'
};

export const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' }
];

export const PRIORITY_CONFIG = {
  Low: { label: 'Low', color: 'gray', icon: 'arrow-down' },
  Medium: { label: 'Medium', color: 'blue', icon: 'minus' },
  High: { label: 'High', color: 'orange', icon: 'arrow-up' },
  Critical: { label: 'Critical', color: 'red', icon: 'alert-circle' }
};

// ========================================
// UNIT OPTIONS (NEW)
// ========================================
export const UNIT_OPTIONS = [
  { value: 'Units', label: 'Units' },
  { value: 'Pieces', label: 'Pieces' },
  { value: 'Sets', label: 'Sets' },
  { value: 'Boxes', label: 'Boxes' },
  { value: 'Rolls', label: 'Rolls' },
  { value: 'Meters', label: 'Meters' },
  { value: 'Feet', label: 'Feet' },
  { value: 'Liters', label: 'Liters' },
  { value: 'Gallons', label: 'Gallons' },
  { value: 'Kg', label: 'Kilograms' },
  { value: 'Lbs', label: 'Pounds' }
];

// ========================================
// PURCHASING QUEUE TABS (NEW)
// ========================================
export const PURCHASING_QUEUE_TABS = {
  PENDING_DISBURSE: 'pending_disburse',
  NEEDS_SOURCING: 'needs_sourcing',
  IN_SOURCING: 'in_sourcing',
  ARRIVED: 'arrived',
  PENDING_INSPECTION: 'pending_inspection',
  ACTIVE_JOB_REQUESTS: 'active_requests',
  SWAP_REQUESTS: 'swap_requests',
  IN_REPAIR: 'in_repair',
  PENDING_RETURNS: 'pending_returns'
};

export const PURCHASING_QUEUE_TAB_CONFIG = {
  pending_disburse: { 
    label: 'Pending Disburse', 
    icon: 'package', 
    statuses: ['APPROVED', 'INSPECTION_APPROVED'],
    sources: ['INVENTORY']
  },
  needs_sourcing: { 
    label: 'Needs Sourcing', 
    icon: 'search', 
    statuses: ['APPROVED', 'PENDING_QUOTE'],
    sources: ['NEW_REQUEST']
  },
  in_sourcing: { 
    label: 'In Sourcing', 
    icon: 'truck', 
    statuses: ['SOURCING'],
    sources: ['NEW_REQUEST']
  },
  arrived: { 
    label: 'Arrived', 
    icon: 'check-circle', 
    statuses: ['ARRIVED'],
    sources: ['NEW_REQUEST']
  },
  pending_inspection: { 
    label: 'Pending Inspection', 
    icon: 'clipboard', 
    statuses: ['PENDING_INSPECTION', 'INSPECTION_SUBMITTED'],
    sources: null // All sources
  },
  active_requests: { 
    label: 'Active Job Requests', 
    icon: 'plus-circle', 
    requestTypes: ['ADDITIONAL', 'EMERGENCY'],
    sources: null
  },
  swap_requests: { 
    label: 'Swap Requests', 
    icon: 'refresh-cw', 
    requestTypes: ['SWAP_REPLACEMENT', 'SWAP_RETURN'],
    sources: null
  },
  in_repair: { 
    label: 'In Repair', 
    icon: 'wrench', 
    statuses: ['UNDER_REPAIR'],
    sources: null
  },
  pending_returns: { 
    label: 'Pending Returns', 
    icon: 'corner-down-left', 
    statuses: ['PENDING_RETURN'],
    sources: null
  }
};

// ========================================
// ROLE PERMISSIONS (Unchanged + additions)
// ========================================
export const MANAGER_ROLES = [
  'Super Admin', 'Super_Admin', 'Admin', 
  'Operations Manager', 'Operations_Manager'
];

export const PURCHASING_ROLES = [
  'Super Admin', 'Super_Admin', 'Admin', 
  'Purchasing Manager', 'Purchasing_Manager', 
  'Purchasing Staff', 'Purchasing_Staff'
];

export const SUPERVISOR_ROLES = [
  'Supervisor', 'Field Supervisor', 'Field_Supervisor'
];

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Get status config with fallback
 */
export const getItemStatusConfig = (status) => {
  return ITEM_STATUS_CONFIG[status] || { 
    label: status, 
    color: 'gray', 
    icon: 'help-circle',
    phase: 'unknown'
  };
};

/**
 * Check if status allows editing
 */
export const isEditableStatus = (status) => {
  return ['DRAFT', 'REJECTED', 'SUPERVISOR_REJECTED'].includes(status);
};

/**
 * Check if item can be inspected
 */
export const canInspect = (status) => {
  return ['APPROVED', 'ARRIVED', 'PENDING_INSPECTION'].includes(status);
};

/**
 * Check if item is in active/disbursed state
 */
export const isActiveItem = (status) => {
  return ['DISBURSED', 'IN_USE', 'UNDER_REPAIR'].includes(status);
};

/**
 * Check if item has completed its lifecycle
 */
export const isCompletedItem = (status) => {
  return ['RETURNED', 'RETURNED_DAMAGED', 'CONSUMED', 'MARKED_LOST', 'DISPOSED', 'CANCELLED'].includes(status);
};

/**
 * Get items by phase
 */
export const getItemsByPhase = (items, phase) => {
  return items.filter(item => {
    const config = ITEM_STATUS_CONFIG[item.status];
    return config?.phase === phase;
  });
};

/**
 * Check if user can request based on job team role
 */
export const canUserRequest = (jobRole) => {
  return JOB_TEAM_ROLE_CONFIG[jobRole]?.canRequest || false;
};

/**
 * Check if user can approve based on job team role
 */
export const canUserApprove = (jobRole) => {
  return JOB_TEAM_ROLE_CONFIG[jobRole]?.canApprove || false;
};
