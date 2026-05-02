import { z } from 'zod';
import { REQUEST_TYPES, PRIORITY, SEVERITY, SAFETY_REPORT_TYPES } from './constants';

// Common field schemas
const email = z.string().email('Invalid email address');
const password = z.string().min(8, 'Password must be at least 8 characters');
const requiredString = (field) => z.string().min(1, `${field} is required`);
const optionalString = z.string().optional();

// Auth schemas
export const loginSchema = z.object({
  email: email,
  password: requiredString('Password')
});

export const forgotPasswordSchema = z.object({
  email: email
});

export const resetPasswordSchema = z.object({
  password: password,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// User schemas
export const userSchema = z.object({
  name: requiredString('Name').max(255),
  email: email,
  role: requiredString('Role'),
  department_id: z.number().positive('Department is required')
});

// Request schemas
export const baseRequestSchema = z.object({
  type: z.enum(Object.values(REQUEST_TYPES)),
  subject: requiredString('Subject').max(255),
  description: requiredString('Description').min(10, 'Description must be at least 10 characters'),
  priority: z.enum(Object.values(PRIORITY))
});

export const transportRequestSchema = baseRequestSchema.extend({
  type: z.literal(REQUEST_TYPES.TRANSPORT),
  pickup_location: requiredString('Pickup location'),
  dropoff_location: requiredString('Dropoff location'),
  travel_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  travel_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
  passenger_count: z.number().int().positive('At least 1 passenger required'),
  cargo_description: optionalString,
  special_requirements: optionalString
});

export const ppeRequestSchema = baseRequestSchema.extend({
  type: z.literal(REQUEST_TYPES.PPE),
  items: z.array(z.object({
    name: requiredString('Item name'),
    size: optionalString,
    quantity: z.number().int().positive('Quantity must be at least 1')
  })).min(1, 'At least one item is required')
});

export const equipmentRequestSchema = baseRequestSchema.extend({
  type: z.literal(REQUEST_TYPES.EQUIPMENT),
  equipment_type: requiredString('Equipment type'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  duration: requiredString('Duration'),
  date_needed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  purpose: requiredString('Purpose'),
  location: requiredString('Location'),
  special_requirements: optionalString
});

export const materialRequestSchema = baseRequestSchema.extend({
  type: z.literal(REQUEST_TYPES.MATERIAL),
  items: z.array(z.object({
    name: requiredString('Item name'),
    quantity: z.number().int().positive('Quantity must be at least 1'),
    unit: optionalString,
    specifications: optionalString
  })).min(1, 'At least one item is required'),
  date_needed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  delivery_location: requiredString('Delivery location'),
  purpose: requiredString('Purpose')
});

export const maintenanceRequestSchema = baseRequestSchema.extend({
  type: z.literal(REQUEST_TYPES.MAINTENANCE),
  equipment_id: z.string().or(z.number()),
  maintenance_type: requiredString('Maintenance type'),
  issue_description: requiredString('Issue description'),
  urgency: z.enum(['Low', 'Medium', 'High', 'Critical']),
  preferred_date: optionalString
});

// Safety report schemas
export const safetyReportSchema = z.object({
  report_type: z.enum(Object.values(SAFETY_REPORT_TYPES)),
  title: requiredString('Title').min(10).max(255),
  description: requiredString('Description').min(50, 'Please provide at least 50 characters'),
  location: requiredString('Location'),
  date_occurred: z.string(),
  time_occurred: optionalString,
  severity: z.enum(Object.values(SEVERITY)),
  immediate_actions_taken: optionalString,
  injuries_reported: z.boolean().default(false),
  injury_details: optionalString
});

// Equipment schemas
export const equipmentSchema = z.object({
  name: requiredString('Name').max(255),
  description: optionalString,
  status: z.enum(['Operational', 'Maintenance', 'Retired']),
  hours_run: z.number().min(0),
  last_service_hours: z.number().min(0),
  service_interval_hours: z.number().positive('Service interval must be positive'),
  location: optionalString
});

// Job schemas
export const jobSchema = z.object({
  job_name: requiredString('Job name').max(255),
  client_name: requiredString('Client name').max(255),
  well_name: requiredString('Well name').max(255),
  location: requiredString('Location'),
  job_type: requiredString('Job type'),
  description: requiredString('Description'),
  planned_start_date: z.string(),
  planned_end_date: z.string(),
  special_requirements: optionalString,
  safety_considerations: optionalString
});

