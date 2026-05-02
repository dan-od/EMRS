/**
 * Maintenance Validation Schemas
 */

const { z } = require('zod');

const createSchema = z.object({
  equipment_id: z.string().uuid('Invalid equipment ID'),
  maintenance_type: z.enum([
    'Routine_Service', 'Repair', 'Inspection', 
    'Calibration', 'Overhaul', 'Emergency'
  ]),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  scheduled_date: z.string(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  estimated_hours: z.number().positive().optional(),
  estimated_cost: z.number().min(0).optional(),
  assigned_to: z.string().uuid().optional(),
  notes: z.string().optional()
});

const updateSchema = z.object({
  maintenance_type: z.enum([
    'Routine_Service', 'Repair', 'Inspection', 
    'Calibration', 'Overhaul', 'Emergency'
  ]).optional(),
  description: z.string().min(5).optional(),
  scheduled_date: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  estimated_hours: z.number().positive().optional(),
  estimated_cost: z.number().min(0).optional(),
  notes: z.string().optional()
});

const completeSchema = z.object({
  notes: z.string().optional(),
  parts_used: z.array(z.object({
    name: z.string(),
    quantity: z.number().positive(),
    cost: z.number().min(0).optional()
  })).optional(),
  labor_hours: z.number().min(0).optional(),
  cost: z.number().min(0).optional()
});

module.exports = {
  createSchema,
  updateSchema,
  completeSchema
};
