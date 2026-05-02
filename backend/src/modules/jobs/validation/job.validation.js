/**
 * Jobs Validation - Job Schemas
 */
const { z } = require('zod');

const createJobSchema = z.object({
  body: z.object({
    client: z.string().min(1).max(255),
    well_name: z.string().max(255).optional(),
    location: z.string().min(1).max(255),
    description: z.string().optional(),
    start_date: z.string().optional(),
    expected_end_date: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
    special_requirements: z.string().optional(),
    safety_considerations: z.string().optional()
  })
});

const updateJobSchema = z.object({
  body: z.object({
    client: z.string().min(1).max(255).optional(),
    well_name: z.string().max(255).optional(),
    location: z.string().max(255).optional(),
    description: z.string().optional(),
    start_date: z.string().optional(),
    expected_end_date: z.string().optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional()
  })
});

const rejectJobSchema = z.object({ body: z.object({ reason: z.string().min(1) }) });
const signoffJobSchema = z.object({ body: z.object({ notes: z.string().optional(), confirmations: z.object({ equipment_inspected: z.boolean(), issues_resolved: z.boolean(), team_briefed: z.boolean() }).optional() }) });

module.exports = { createJobSchema, updateJobSchema, rejectJobSchema, signoffJobSchema };
