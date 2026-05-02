/**
 * Field Reports Validation Schemas
 */

const { z } = require('zod');

const createSchema = z.object({
  body: z.object({
    job_id: z.string().uuid('Invalid job ID').optional(),
    job_title: z.string().min(2, 'Job title is required'),
    job_location: z.string().min(2, 'Location is required'),
    client_name: z.string().min(2, 'Client name is required'),
    report_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    report_type: z.enum(['Daily', 'Weekly', 'Incident', 'Completion', 'Progress', 'Safety']).optional(),
    content: z.string().min(10, 'Report content must be at least 10 characters'),
    weather_conditions: z.string().optional(),
    crew_count: z.number().int().min(0).optional(),
    equipment_used: z.string().optional(),
    issues_encountered: z.string().optional(),
    next_day_plan: z.string().optional(),
    attachments: z.array(z.object({
      name: z.string(),
      url: z.string(),
      type: z.string().optional()
    })).optional()
  })
});

const updateSchema = z.object({
  body: z.object({
    job_title: z.string().min(2).optional(),
    job_location: z.string().min(2).optional(),
    client_name: z.string().min(2).optional(),
    report_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    report_type: z.enum(['Daily', 'Weekly', 'Incident', 'Completion', 'Progress', 'Safety']).optional(),
    content: z.string().min(10).optional(),
    weather_conditions: z.string().optional(),
    crew_count: z.number().int().min(0).optional(),
    equipment_used: z.string().optional(),
    issues_encountered: z.string().optional(),
    next_day_plan: z.string().optional()
  })
});

const reviewSchema = z.object({
  body: z.object({
    status: z.enum(['Reviewed', 'Approved', 'Rejected']),
    review_comments: z.string().optional()
  })
});

module.exports = {
  createSchema,
  updateSchema,
  reviewSchema
};
