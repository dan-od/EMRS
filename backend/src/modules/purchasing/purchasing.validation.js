const { z } = require('zod');

const createItem = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    category: z.enum(['PPE', 'Tools', 'Consumables', 'Spare_Parts', 'Office_Supplies', 'Other']),
    quantity: z.number().min(0).optional(),
    unit: z.string().optional(),
    reorderLevel: z.number().min(0).optional(),
    location: z.string().optional()
  })
});

const updateItem = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    category: z.enum(['PPE', 'Tools', 'Consumables', 'Spare_Parts', 'Office_Supplies', 'Other']).optional(),
    unit: z.string().optional(),
    reorderLevel: z.number().min(0).optional(),
    location: z.string().optional()
  })
});

const addStock = z.object({
  body: z.object({
    quantity: z.number().min(1, 'Quantity must be positive'),
    notes: z.string().optional()
  })
});

const createDisbursement = z.object({
  body: z.object({
    inventoryId: z.string().uuid(),
    quantity: z.number().min(1),
    purpose: z.string().min(1),
    requestId: z.string().uuid().optional()
  })
});

const rejectDisbursement = z.object({
  body: z.object({
    reason: z.string().min(1, 'Rejection reason is required')
  })
});

module.exports = { createItem, updateItem, addStock, createDisbursement, rejectDisbursement };
