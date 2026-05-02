/**
 * Jobs Validation - Equipment Schemas (Enhanced)
 */
const { z } = require('zod');

const ITEM_TYPES = ['EQUIPMENT', 'MATERIAL_TOOL'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const addInventoryItemSchema = z.object({
  body: z.object({
    equipment_id: z.string().uuid(),
    quantity: z.number().int().min(1).default(1),
    priority: z.enum(PRIORITIES).default('Medium'),
    notes: z.string().optional(),
    item_type: z.enum(ITEM_TYPES).default('EQUIPMENT'),
    reason: z.string().optional()
  })
});

const addClientItemSchema = z.object({
  body: z.object({
    client_equipment_name: z.string().min(1).max(255),
    client_equipment_description: z.string().optional(),
    quantity: z.number().int().min(1).default(1),
    priority: z.enum(PRIORITIES).default('Medium'),
    notes: z.string().optional(),
    item_type: z.enum(ITEM_TYPES).default('EQUIPMENT')
  })
});

const addNewRequestSchema = z.object({
  body: z.object({
    requested_item_name: z.string().min(1).max(255),
    requested_item_description: z.string().optional(),
    requested_item_specs: z.string().optional(),
    quantity: z.number().int().min(1).default(1),
    priority: z.enum(PRIORITIES).default('Medium'),
    notes: z.string().optional(),
    item_type: z.enum(ITEM_TYPES).default('EQUIPMENT'),
    reason: z.string().optional()
  })
});

const updateItemSchema = z.object({
  body: z.object({
    quantity: z.number().int().min(1).optional(),
    priority: z.enum(PRIORITIES).optional(),
    notes: z.string().optional(),
    item_type: z.enum(ITEM_TYPES).optional()
  })
});

const disburseItemSchema = z.object({ 
  body: z.object({ notes: z.string().optional() }) 
});

const startSourcingSchema = z.object({
  body: z.object({
    notes: z.string().optional(),
    estimated_arrival: z.string().optional()
  })
});

const itemArrivedSchema = z.object({
  body: z.object({
    linked_inventory_id: z.string().uuid().optional(),
    vendor_name: z.string().optional(),
    purchase_order_number: z.string().optional(),
    procurement_cost: z.number().min(0).optional()
  })
});

const returnItemSchema = z.object({ 
  body: z.object({ 
    status: z.enum(['RETURNED', 'DAMAGED', 'LOST']), 
    condition: z.string().optional(), 
    hours_used: z.number().min(0).optional() 
  }) 
});

const supervisorApproveSchema = z.object({
  body: z.object({ notes: z.string().optional() })
});

const supervisorRejectSchema = z.object({
  body: z.object({ reason: z.string().min(1, 'Rejection reason is required') })
});

module.exports = { 
  addInventoryItemSchema, addClientItemSchema, addNewRequestSchema, updateItemSchema, 
  disburseItemSchema, startSourcingSchema, itemArrivedSchema, returnItemSchema,
  supervisorApproveSchema, supervisorRejectSchema
};
