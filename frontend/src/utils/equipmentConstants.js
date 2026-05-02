/**
 * Equipment Constants - Asset Categorization System
 * Two-tier: asset_category (TOOL/EQUIPMENT) → type (specific per category)
 */

// ── Asset Categories ──────────────────────────────────
export const ASSET_CATEGORIES = ['TOOL', 'EQUIPMENT'];

export const ASSET_CATEGORY_LABELS = {
  TOOL: 'Tool',
  EQUIPMENT: 'Equipment'
};

// ── Equipment Types ───────────────────────────────────
export const EQUIPMENT_TYPES = [
  { value: 'PUMPING_UNIT', label: 'Pumping Unit' },
  { value: 'PRESSURE_CONTROL', label: 'Pressure Control' },
  { value: 'WELL_INTERVENTION', label: 'Well Intervention' },
  { value: 'POWER_GENERATION', label: 'Power Generation' },
  { value: 'TANK_VESSEL', label: 'Tank / Vessel' },
  { value: 'VEHICLE', label: 'Vehicle' },
  { value: 'COMPRESSOR', label: 'Compressor' },
  { value: 'OTHER_EQUIPMENT', label: 'Other Equipment' }
];

// ── Tool Types ────────────────────────────────────────
export const TOOL_TYPES = [
  { value: 'HAND_TOOL', label: 'Hand Tool' },
  { value: 'POWER_TOOL', label: 'Power Tool' },
  { value: 'MEASURING_INSTRUMENT', label: 'Measuring Instrument' },
  { value: 'CUTTING_TOOL', label: 'Cutting Tool' },
  { value: 'LIFTING_GEAR', label: 'Lifting Gear' },
  { value: 'WELDING_EQUIPMENT', label: 'Welding Equipment' },
  { value: 'OTHER_TOOL', label: 'Other Tool' }
];

// ── Combined lookup ───────────────────────────────────
export const ALL_TYPES = [...EQUIPMENT_TYPES, ...TOOL_TYPES];

/** Get types array filtered by asset category */
export const getTypesForCategory = (category) => {
  if (category === 'EQUIPMENT') return EQUIPMENT_TYPES;
  if (category === 'TOOL') return TOOL_TYPES;
  return ALL_TYPES;
};

/** Format a type value for display, e.g. PUMPING_UNIT → "Pumping Unit" */
export const formatTypeLabel = (type) => {
  if (!type) return 'N/A';
  const found = ALL_TYPES.find(t => t.value === type);
  if (found) return found.label;
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

/** Format asset category for display */
export const formatCategoryLabel = (category) => {
  return ASSET_CATEGORY_LABELS[category] || category || 'N/A';
};

// ── Equipment Status Options ─────────────────────────
export const EQUIPMENT_STATUS_LIST = [
  'Available', 'In_Use', 'Maintenance', 'Out_of_Service'
];

// ── Departments (actual DB enum values) ──────────────
export const DEPARTMENTS_LIST = [
  'Operations', 'Engineering', 'Maintenance', 'Logistics',
  'Safety', 'Purchasing', 'HR', 'Finance',
  'IT', 'Management', 'Workshop', 'Field_Services'
];

// ── Role Permission Helpers ──────────────────────────

/** Roles that can add equipment directly (managers) */
export const CAN_ADD_DIRECTLY = [
  'Super_Admin', 'Admin', 'IT_Support',
  'Operations_Manager', 'Purchasing_Manager', 'Accounts_Manager',
  'Safety_Manager', 'Maintenance_Manager', 'Purchasing_Staff'
];

/** Roles that can edit any equipment (not just their dept) */
export const CAN_EDIT_ALL = [
  'Super_Admin', 'Admin', 'IT_Support',
  'Purchasing_Manager', 'Purchasing_Staff'
];

/** Roles that can see cost data */
export const CAN_VIEW_COSTS = [
  'Super_Admin', 'Admin', 'IT_Support',
  'Operations_Manager', 'Purchasing_Manager', 'Accounts_Manager',
  'Maintenance_Manager', 'Safety_Manager',
  'Purchasing_Staff', 'Accounts_Staff'
];

export const canAddEquipment = (role) => CAN_ADD_DIRECTLY.includes(role);
export const canEditAllEquipment = (role) => CAN_EDIT_ALL.includes(role);
export const canViewCosts = (role) => CAN_VIEW_COSTS.includes(role);

/** Check if user can manage a specific equipment item (edit, log hours, etc.) */
export const canManageThisEquipment = (role, userDept, equipmentDept) => {
  if (CAN_EDIT_ALL.includes(role)) return true;
  if (CAN_ADD_DIRECTLY.includes(role) && userDept === equipmentDept) return true;
  return false;
};

/** Check if user can approve equipment requests */
export const canApproveEquipmentRequests = (role) => CAN_ADD_DIRECTLY.includes(role);
