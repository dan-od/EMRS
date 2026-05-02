/**
 * Vendors Validation Schemas
 */

const { z } = require('zod');

const createSchema = z.object({
  name: z.string().min(2, 'Vendor name is required'),
  category: z.enum([
    'Equipment', 'Parts', 'Chemicals', 'Safety', 'Office', 
    'IT', 'Services', 'Transportation', 'General',
    'PPE', 'Materials', 'Tools', 'Office Supplies', 'Other'
  ]),
  contact_person: z.string().optional(),
  contact_email: z.string().email('Invalid email').optional(),
  email: z.string().email('Invalid email').optional(),
  contact_phone: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  tax_id: z.string().optional(),
  payment_terms: z.enum(['Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD', 'Prepaid']).optional(),
  notes: z.string().optional()
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.enum([
    'Equipment', 'Parts', 'Chemicals', 'Safety', 'Office', 
    'IT', 'Services', 'Transportation', 'General',
    'PPE', 'Materials', 'Tools', 'Office Supplies', 'Other'
  ]).optional(),
  contact_person: z.string().optional(),
  contact_email: z.string().email().optional(),
  email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  tax_id: z.string().optional(),
  payment_terms: z.enum(['Net 15', 'Net 30', 'Net 45', 'Net 60', 'COD', 'Prepaid']).optional(),
  notes: z.string().optional()
});

const ratingSchema = z.object({
  rating: z.number().min(1).max(5),
  review: z.string().optional()
});

module.exports = {
  createSchema,
  updateSchema,
  ratingSchema
};
