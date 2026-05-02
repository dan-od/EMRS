const { z } = require('zod');

const create = z.object({
  body: z.object({
    type: z.enum(['Incident', 'Hazard', 'Near_Miss']),
    severity: z.enum(['Low', 'Medium', 'High', 'Critical']),
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    location: z.string().min(1, 'Location is required'),
    incidentDate: z.string().datetime().optional(),
    isAnonymous: z.boolean().optional()
  })
});

const updateStatus = z.object({
  body: z.object({
    status: z.enum(['Open', 'In_Progress', 'Resolved', 'Closed']),
    assignedTo: z.string().uuid().optional(),
    resolution: z.string().optional()
  })
});

module.exports = { create, updateStatus };
