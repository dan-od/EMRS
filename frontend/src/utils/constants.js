// Re-export role/department config (source of truth in roleConfig.js)
export { 
  ROLES, ROLE_LEVELS, DEPARTMENTS, DEPARTMENT_ROLES,
  getRoleLabel, getRolesForDepartment 
} from './roleConfig';

// ==============================================
// Request & Equipment Constants
// ==============================================
export const REQUEST_TYPES = {
  PPE: 'PPE',
  TRANSPORT: 'Transport',
  EQUIPMENT: 'Equipment',
  MATERIAL: 'Material',
  MAINTENANCE: 'Maintenance'
};

export const REQUEST_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  MANAGER_APPROVED: 'Manager_Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  ON_HOLD: 'On_Hold',
  DISBURSED: 'Disbursed',
  PENDING_RETURN: 'Pending_Return',
  TRANSFERRED: 'Transferred',
  COMPLETED: 'Completed'
};

export const PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical'
};

export const EQUIPMENT_STATUS = {
  Available: 'Available',
  In_Use: 'In Use',
  Maintenance: 'Maintenance',
  Out_of_Service: 'Out of Service'
};

export const EQUIPMENT_STATUS_LIST = ['Available', 'In_Use', 'Maintenance', 'Out_of_Service'];

export const EQUIPMENT_CATEGORIES = {
  Pump: 'Pump',
  Coiled_Tubing: 'Coiled Tubing',
  Nitrogen: 'Nitrogen',
  Wireline: 'Wireline',
  Support: 'Support',
  Vehicle: 'Vehicle',
  Other: 'Other'
};

export const EQUIPMENT_CATEGORIES_LIST = [
  'Pump', 'Coiled_Tubing', 'Nitrogen', 'Wireline', 'Support', 'Vehicle', 'Other'
];

// ==============================================
// Job & Safety Constants
// ==============================================
export const JOB_STATUS = {
  DRAFT: 'Draft',
  TEAM_ASSIGNED: 'Team_Assigned',
  PLANNING: 'Planning',
  INSPECTION: 'Inspection',
  APPROVED: 'Approved',
  EQUIPPED: 'Equipped',
  IN_TRANSIT: 'In_Transit',
  IN_PROGRESS: 'In_Progress',
  COMPLETING: 'Completing',
  POST_JOB: 'Post_Job',
  COMPLETED: 'Completed'
};

export const SAFETY_REPORT_TYPES = {
  HAZARD: 'Hazard',
  INCIDENT: 'Incident',
  NEAR_MISS: 'Near_Miss'
};

export const SAFETY_REPORT_STATUS = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under_Review',
  ACTION_REQUIRED: 'Action_Required',
  IN_PROGRESS: 'In_Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed'
};

export const SEVERITY = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

export const SAFETY_STATUS = {
  OPEN: 'Open',
  IN_PROGRESS: 'In_Progress',
  CLOSED: 'Closed'
};

// ==============================================
// Inventory
// ==============================================
export const INVENTORY_CATEGORIES = {
  PPE: 'PPE',
  OFFICE_SUPPLIES: 'Office_Supplies',
  MATERIALS: 'Materials',
  SPARE_PARTS: 'Spare_Parts',
  TOOLS: 'Tools',
  CONSUMABLES: 'Consumables',
  OTHER: 'Other'
};

// ==============================================
// Dropdown Lists
// ==============================================
export const PPE_ITEMS = [
  'Safety Helmet', 'Safety Glasses', 'Safety Boots', 'Coverall',
  'High-Vis Vest', 'Gloves (Leather)', 'Gloves (Nitrile)',
  'Ear Protection', 'Respirator', 'Face Shield', 'Fall Harness',
  'Safety Goggles', 'Hard Hat', 'Rain Gear', 'Fire Resistant Clothing'
];

export const VEHICLE_TYPES = [
  'Pickup Truck', 'SUV', 'Bus', 'Van', 'Crane Truck',
  'Tanker', 'Flatbed', 'Ambulance', 'Heavy Equipment Transporter'
];

export const ACTIVITY_TYPES = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  CREATE: 'Create',
  UPDATE: 'Update',
  DELETE: 'Delete',
  APPROVE: 'Approve',
  REJECT: 'Reject',
  TRANSFER: 'Transfer'
};
