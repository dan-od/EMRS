/**
 * Equipment Logs Validation Schemas
 */

const { z } = require('zod');

const GENERAL_LOG_TYPES = [
  'Transport',
  'Disbursed',
  'Returned',
  'Assignment',
  'Location_Change',
  'Request_Approved',
  'Note',
  'Other'
];

const MAINTENANCE_LOG_TYPES = [
  'Routine_Service',
  'Repair',
  'Inspection',
  'Calibration',
  'Parts_Replaced',
  'Note',
  'Other'
];

const createGeneralLogSchema = z.object({
  body: z.object({
    entry_type: z.enum(GENERAL_LOG_TYPES, { message: 'Invalid entry type' }),
    description: z.string().min(3, 'Description must be at least 3 characters'),
    entry_date: z.string().optional(),
    location_from: z.string().optional().nullable(),
    location_to: z.string().optional().nullable(),
    notes: z.string().optional().nullable()
  })
});

const createMaintenanceLogSchema = z.object({
  body: z.object({
    entry_type: z.enum(MAINTENANCE_LOG_TYPES, { message: 'Invalid entry type' }),
    description: z.string().min(3, 'Description must be at least 3 characters'),
    entry_date: z.string().optional(),
    equipment_hours: z.number().optional().nullable(),
    labor_hours: z.number().optional().nullable(),
    cost: z.number().optional().nullable(),
    parts_used: z.string().optional().nullable(),
    notes: z.string().optional().nullable()
  })
});

module.exports = {
  createGeneralLogSchema,
  createMaintenanceLogSchema,
  GENERAL_LOG_TYPES,
  MAINTENANCE_LOG_TYPES
};
