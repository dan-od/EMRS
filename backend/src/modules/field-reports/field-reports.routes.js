/**
 * Field Reports Routes
 */

const express = require('express');
const router = express.Router();
const fieldReportsController = require('./field-reports.controller');
const { authenticate, requireRoles, validate } = require('../../middleware');
const { createSchema, updateSchema, reviewSchema } = require('./field-reports.validation');

// All routes require authentication
router.use(authenticate);

// Get all field reports
router.get('/', fieldReportsController.getAll);

// Get stats
router.get('/stats', fieldReportsController.getStats);

// Get my submitted reports
router.get('/my', fieldReportsController.getMyReports);

// Get pending review (managers)
router.get(
  '/pending',
  requireRoles(['Admin', 'IT_Support', 'Operations_Manager', 'Maintenance_Manager', 'Safety_Officer']),
  fieldReportsController.getPendingReview
);

// Get reports by job
router.get('/job/:jobId', fieldReportsController.getByJob);

// Get single report
router.get('/:id', fieldReportsController.getById);

// Create field report (Field Engineers and above)
router.post(
  '/',
  requireRoles(['Admin', 'IT_Support', 'Operations_Manager', 'Maintenance_Manager', 'Field_Engineer', 'Safety_Officer']),
  validate(createSchema),
  fieldReportsController.create
);

// Update field report
router.put(
  '/:id',
  validate(updateSchema),
  fieldReportsController.update
);

// Review report (managers only)
router.post(
  '/:id/review',
  requireRoles(['Admin', 'IT_Support', 'Operations_Manager', 'Maintenance_Manager', 'Safety_Officer']),
  validate(reviewSchema),
  fieldReportsController.review
);

// Approve report
router.post(
  '/:id/approve',
  requireRoles(['Admin', 'IT_Support', 'Operations_Manager', 'Maintenance_Manager']),
  fieldReportsController.approve
);

// Reject report
router.post(
  '/:id/reject',
  requireRoles(['Admin', 'IT_Support', 'Operations_Manager', 'Maintenance_Manager']),
  fieldReportsController.reject
);

// Add attachment
router.post(
  '/:id/attachments',
  fieldReportsController.addAttachment
);

module.exports = router;
