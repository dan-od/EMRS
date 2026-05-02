const { z } = require('zod');

// PPE Details - FIXED: Added passthrough to prevent stripping fields
const ppeDetails = z.object({
  items: z.array(z.object({
    item: z.string(),
    size: z.string().optional(),
    quantity: z.number().min(1)
  }).passthrough()).min(1),
  reason: z.string().optional()
}).passthrough();

// Transport Details
const transportDetails = z.object({
  vehicleType: z.enum(['Pickup', 'SUV', 'Bus', 'Truck', 'Crane', 'Forklift']),
  pickup: z.string().min(1),
  destination: z.string().min(1),
  passengers: z.number().min(1).optional(),
  purpose: z.string().min(1)
}).passthrough();

// Equipment Details - with full item schema
const equipmentDetails = z.object({
  equipmentId: z.string().uuid().optional().nullable(),
  equipmentType: z.string().min(1),
  duration: z.string().min(1),
  purpose: z.string().min(1),
  needsProcurement: z.boolean().optional().nullable(),
  items: z.array(z.object({
    item: z.string().optional(),
    name: z.string().optional(),
    equipmentId: z.string().uuid().optional().nullable(),
    assetCategory: z.string().optional().nullable(),
    category: z.string().optional().nullable(),
    type: z.string().optional().nullable(),
    quantity: z.number().optional(),
    serialNumber: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    isFromDatabase: z.boolean().optional().nullable(),
    isNewRequest: z.boolean().optional().nullable(),
    notes: z.string().optional().nullable()
  }).passthrough()).optional()
}).passthrough();

// Material Details - FIXED: Added passthrough
const materialDetails = z.object({
  items: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().min(1),
    unit: z.string().optional(),
    specifications: z.string().optional()
  }).passthrough()).min(1),
  purpose: z.string().min(1)
}).passthrough();

// Material schema for maintenance requests
const maintenanceMaterialSchema = z.object({
  name: z.string(),
  specs: z.string().optional().nullable(),
  quantity: z.number().optional().nullable(),
  unit: z.string().optional().nullable(),
  id: z.number().optional().nullable(),
  linkedInventoryId: z.string().uuid().optional().nullable()
}).passthrough();

// Tool schema for maintenance requests
const maintenanceToolSchema = z.object({
  id: z.number().optional().nullable(),
  equipmentId: z.string().uuid().optional().nullable(),
  name: z.string(),
  serialNumber: z.string().optional().nullable(),
  specs: z.string().optional().nullable(),
  isFromEquipmentList: z.boolean().optional().nullable(),
  linkedEquipmentId: z.string().uuid().optional().nullable()
}).passthrough();

// Vendor recommendation schema
const vendorRecommendationSchema = z.object({
  vendorId: z.string().uuid().optional().nullable(),
  vendorName: z.string().optional().nullable(),
  contact: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
}).passthrough().optional().nullable();

// Maintenance details
const maintenanceDetails = z.object({
  category: z.enum(['Equipment', 'Vehicle', 'Other']).optional().nullable(),
  routesTo: z.enum(['Purchasing', 'Safety']).optional().nullable(),
  equipmentId: z.string().uuid().optional().nullable(),
  vehicleId: z.string().uuid().optional().nullable(),
  otherCategory: z.string().optional().nullable(),
  otherDescription: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  issueDescription: z.string().min(1),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']).optional().nullable(),
  urgency: z.enum(['Routine', 'Urgent', 'Emergency']).optional().nullable(),
  serviceType: z.enum(['In-House', 'External', 'Mixed']).optional().nullable(),
  materials: z.array(maintenanceMaterialSchema).optional().nullable(),
  tools: z.array(maintenanceToolSchema).optional().nullable(),
  vendorRecommendation: vendorRecommendationSchema,
  additionalNotes: z.string().optional().nullable()
}).passthrough();

// Create request validation
// IMPORTANT: Using passthrough on all detail schemas to prevent field stripping
const create = z.object({
  body: z.object({
    type: z.enum(['PPE', 'Transport', 'Equipment', 'Material', 'Maintenance']),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    details: z.union([ppeDetails, transportDetails, equipmentDetails, materialDetails, maintenanceDetails]),
    dateNeeded: z.string().datetime().optional(),
    jobId: z.string().uuid().optional().nullable(),
    notes: z.string().optional().nullable(),
    maintenanceCategory: z.enum(['Equipment', 'Vehicle', 'Other']).optional().nullable(),
    maintenanceRoutesTo: z.enum(['Purchasing', 'Safety']).optional().nullable(),
    maintenanceOtherDescription: z.string().optional().nullable()
  })
});

// Approve request validation
const approve = z.object({
  body: z.object({
    notes: z.string().optional().nullable(),
    comments: z.string().optional().nullable(),
    items: z.array(z.object({
      item: z.string().optional(),
      name: z.string().optional(),
      size: z.string().optional(),
      quantity: z.number().optional(),
      approval_status: z.enum(['pending', 'approved', 'rejected']).optional(),
      approved_quantity: z.number().optional()
    }).passthrough()).optional(),
    managerData: z.object({
      costEstimate: z.number().optional().nullable(),
      vendorRecommendation: vendorRecommendationSchema,
      additionalMaterials: z.array(maintenanceMaterialSchema).optional().nullable(),
      additionalTools: z.array(maintenanceToolSchema).optional().nullable(),
      managerNotes: z.string().optional().nullable()
    }).passthrough().optional().nullable(),
    purchasingData: z.object({
      finalCost: z.number().optional().nullable(),
      confirmedVendor: vendorRecommendationSchema,
      materialLinks: z.record(z.string()).optional().nullable(),
      toolLinks: z.record(z.string()).optional().nullable(),
      linkedMaterials: z.array(maintenanceMaterialSchema).optional().nullable(),
      linkedTools: z.array(maintenanceToolSchema).optional().nullable(),
      purchasingNotes: z.string().optional().nullable()
    }).passthrough().optional().nullable()
  }).passthrough()
});

// Reject request validation
const reject = z.object({
  body: z.object({
    reason: z.string().min(1, 'Rejection reason is required')
  })
});

// Disburse request validation
const disburse = z.object({
  body: z.object({
    notes: z.string().optional().nullable(),
    expectedReturnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]+)?$/, 'Invalid date format').optional().nullable(),
    withoutApproval: z.boolean().optional().default(false),
    inventoryLinks: z.array(z.object({
      inventoryId: z.string().uuid(),
      quantity: z.number().min(1),
      itemIndex: z.number().optional()
    })).optional()
  }).refine(
    data => !data.withoutApproval || (data.notes && data.notes.trim().length > 0),
    { message: 'A justification note is required when disbursing without approval', path: ['notes'] }
  )
});

module.exports = { create, approve, reject, disburse };