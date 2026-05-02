/**
 * Equipment Validation Schemas
 * Post-Phase 5: Tools vs Equipment Categorization
 */
const { z } = require('zod');

// =====================================================
// ENUM VALUES
// =====================================================

const ASSET_CATEGORIES = ['TOOL', 'EQUIPMENT'];

const EQUIPMENT_TYPES = [
  'PUMPING_UNIT',
  'PRESSURE_CONTROL',
  'WELL_INTERVENTION',
  'POWER_GENERATION',
  'TANK_VESSEL',
  'VEHICLE',
  'COMPRESSOR',
  'OTHER_EQUIPMENT'
];

const TOOL_TYPES = [
  'HAND_TOOL',
  'POWER_TOOL',
  'MEASURING_INSTRUMENT',
  'CUTTING_TOOL',
  'LIFTING_GEAR',
  'WELDING_EQUIPMENT',
  'OTHER_TOOL'
];

const ALL_TYPES = [...EQUIPMENT_TYPES, ...TOOL_TYPES];

const EQUIPMENT_STATUS = ['Available', 'In_Use', 'Maintenance', 'Out_of_Service'];

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

/**
 * Create equipment - Managers+ can add directly
 */
const create = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    assetCategory: z.enum(ASSET_CATEGORIES, { 
      errorMap: () => ({ message: 'Asset category must be TOOL or EQUIPMENT' }) 
    }),
    type: z.string().min(1, 'Type is required'),
    serialNumber: z.string().max(100).optional().nullable(),
    quantity: z.number().int().min(1).default(1),
    status: z.enum(EQUIPMENT_STATUS).optional().default('Available'),
    location: z.string().max(255).optional().nullable(),
    owningDepartment: z.string().min(1, 'Department is required'),
    cost: z.number().min(0).optional().nullable(),
    notes: z.string().optional().nullable(),
    
    // Maintenance fields
    currentHours: z.number().min(0).optional().default(0),
    maintenanceIntervalHours: z.number().min(1).optional(),
    lastMaintenanceDate: z.string().datetime().optional().nullable(),
    nextMaintenanceDue: z.number().optional().nullable(),
    
    // Sharing (Managers+ only)
    sharedWithDepartments: z.array(z.string()).optional().default([])
  })
});

/**
 * Update equipment
 */
const update = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    assetCategory: z.enum(ASSET_CATEGORIES).optional(),
    type: z.string().min(1).optional(),
    serialNumber: z.string().max(100).optional().nullable(),
    quantity: z.number().int().min(1).optional(),
    status: z.enum(EQUIPMENT_STATUS).optional(),
    location: z.string().max(255).optional().nullable(),
    owningDepartment: z.string().optional(),
    cost: z.number().min(0).optional().nullable(),
    notes: z.string().optional().nullable(),
    
    // Maintenance fields
    currentHours: z.number().min(0).optional(),
    maintenanceIntervalHours: z.number().min(1).optional(),
    lastMaintenanceDate: z.string().datetime().optional().nullable(),
    nextMaintenanceDue: z.number().optional().nullable(),
    
    // Sharing
    sharedWithDepartments: z.array(z.string()).optional()
  })
});

/**
 * Log hours
 */
const logHours = z.object({
  body: z.object({
    hours: z.number().min(0.1, 'Hours must be positive'),
    jobId: z.string().uuid().optional().nullable(),
    notes: z.string().optional().nullable()
  })
});

/**
 * Log maintenance
 */
const logMaintenance = z.object({
  body: z.object({
    maintenanceType: z.enum(['Scheduled', 'Unscheduled', 'Repair', 'Inspection']),
    hoursAtMaintenance: z.number().min(0),
    notes: z.string().optional().nullable()
  })
});

/**
 * Hide equipment
 */
const hide = z.object({
  body: z.object({
    reason: z.string().optional().nullable()
  })
});

/**
 * Share equipment with departments
 */
const share = z.object({
  body: z.object({
    departments: z.array(z.string()).min(0)
  })
});

/**
 * Custom type creation
 */
const createCustomType = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100)
      .regex(/^[A-Z][A-Z0-9_]*$/, 'Name must be UPPER_SNAKE_CASE (e.g., SPECIAL_PUMP)'),
    displayName: z.string().min(1, 'Display name is required').max(100),
    assetCategory: z.enum(ASSET_CATEGORIES),
    description: z.string().optional().nullable()
  })
});

module.exports = { 
  create, 
  update, 
  logHours, 
  logMaintenance,
  hide,
  share,
  createCustomType,
  // Export constants for use elsewhere
  ASSET_CATEGORIES,
  EQUIPMENT_TYPES,
  TOOL_TYPES,
  ALL_TYPES,
  EQUIPMENT_STATUS
};
