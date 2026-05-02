/**
 * Vendors Routes
 */

const express = require('express');
const router = express.Router();
const vendorsController = require('./vendors.controller');
const { authenticate, requireRoles, validate } = require('../../middleware');
const { createSchema, updateSchema, ratingSchema } = require('./vendors.validation');

// All routes require authentication
router.use(authenticate);

// Get all vendors
router.get('/', vendorsController.getAll);

// Get stats
router.get('/stats', vendorsController.getStats);

// Get categories
router.get('/categories', vendorsController.getCategories);

// Get active vendors
router.get('/active', vendorsController.getActive);

// Search vendors
router.get('/search', vendorsController.search);

// Get vendors by category
router.get('/category/:category', vendorsController.getByCategory);

// Get single vendor
router.get('/:id', vendorsController.getById);

// Get vendor purchase history
router.get('/:id/history', vendorsController.getPurchaseHistory);

// Create vendor (Purchasing dept, Admins)
router.post(
  '/',
  requireRoles(['Super_Admin', 'Admin', 'IT_Support', 'Purchasing_Manager', 'Purchasing_Staff', 'Operations_Manager']),
  validate(createSchema),
  vendorsController.create
);

// Update vendor
router.put(
  '/:id',
  requireRoles(['Super_Admin', 'Admin', 'IT_Support', 'Purchasing_Manager', 'Purchasing_Staff', 'Operations_Manager']),
  validate(updateSchema),
  vendorsController.update
);

// Toggle vendor active status
router.patch(
  '/:id/status',
  requireRoles(['Super_Admin', 'Admin', 'IT_Support', 'Purchasing_Manager', 'Operations_Manager']),
  vendorsController.toggleActive
);

// Update vendor rating
router.post(
  '/:id/rating',
  requireRoles(['Super_Admin', 'Admin', 'IT_Support', 'Purchasing_Manager', 'Purchasing_Staff', 'Operations_Manager']),
  validate(ratingSchema),
  vendorsController.updateRating
);

// Delete vendor (soft delete)
router.delete(
  '/:id',
  requireRoles(['Super_Admin', 'Admin', 'IT_Support', 'Purchasing_Manager']),
  vendorsController.remove
);

module.exports = router;
