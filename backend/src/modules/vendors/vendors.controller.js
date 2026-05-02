/**
 * Vendors Controller
 * Handles vendor/supplier management for purchasing
 */

const vendorsService = require('./vendors.service');
const { logActivity, ACTIONS, ENTITY_TYPES } = require('../../utils/activityLogger');

// Define custom actions for vendors (not in default ACTIONS)
const VENDOR_ACTIONS = {
  VENDOR_CREATED: 'VENDOR_CREATED',
  VENDOR_UPDATED: 'VENDOR_UPDATED',
  VENDOR_DEACTIVATED: 'VENDOR_DEACTIVATED',
  VENDOR_REACTIVATED: 'VENDOR_REACTIVATED',
  VENDOR_RATING_UPDATED: 'VENDOR_RATING_UPDATED'
};

// Get all vendors
const getAll = async (req, res, next) => {
  try {
    const result = await vendorsService.getAll(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get single vendor
const getById = async (req, res, next) => {
  try {
    const vendor = await vendorsService.getById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    res.json(vendor);
  } catch (error) {
    next(error);
  }
};

// Get active vendors
const getActive = async (req, res, next) => {
  try {
    const vendors = await vendorsService.getActive(req.query.category);
    res.json(vendors);
  } catch (error) {
    next(error);
  }
};

// Get vendors by category
const getByCategory = async (req, res, next) => {
  try {
    const vendors = await vendorsService.getByCategory(req.params.category);
    res.json(vendors);
  } catch (error) {
    next(error);
  }
};

// Search vendors
const search = async (req, res, next) => {
  try {
    const vendors = await vendorsService.search(req.query.q);
    res.json(vendors);
  } catch (error) {
    next(error);
  }
};

// Create vendor
const create = async (req, res, next) => {
  try {
    const vendor = await vendorsService.create({
      ...req.body,
      created_by: req.user.id
    });
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: VENDOR_ACTIONS.VENDOR_CREATED,
      entityType: 'VENDOR',
      entityId: vendor.id,
      entityName: vendor.name,
      department: req.user.department,
      details: {
        category: vendor.category,
        contactEmail: vendor.contact_email,
        location: vendor.city
      },
      req
    });
    
    res.status(201).json(vendor);
  } catch (error) {
    next(error);
  }
};

// Update vendor
const update = async (req, res, next) => {
  try {
    const oldVendor = await vendorsService.getById(req.params.id);
    const vendor = await vendorsService.update(req.params.id, req.body);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: VENDOR_ACTIONS.VENDOR_UPDATED,
      entityType: 'VENDOR',
      entityId: req.params.id,
      entityName: vendor.name,
      department: req.user.department,
      details: {
        before: oldVendor ? { status: oldVendor.status, rating: oldVendor.rating } : null,
        after: { status: vendor.status, rating: vendor.rating }
      },
      req
    });
    
    res.json(vendor);
  } catch (error) {
    next(error);
  }
};

// Toggle vendor active status
const toggleActive = async (req, res, next) => {
  try {
    const vendor = await vendorsService.toggleActive(req.params.id, req.body.isActive);
    const action = req.body.isActive ? VENDOR_ACTIONS.VENDOR_REACTIVATED : VENDOR_ACTIONS.VENDOR_DEACTIVATED;
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action,
      entityType: 'VENDOR',
      entityId: req.params.id,
      entityName: vendor.name,
      department: req.user.department,
      details: { isActive: req.body.isActive },
      req
    });
    
    res.json(vendor);
  } catch (error) {
    next(error);
  }
};

// Update vendor rating
const updateRating = async (req, res, next) => {
  try {
    const vendor = await vendorsService.updateRating(
      req.params.id, 
      req.body.rating, 
      req.body.review,
      req.user.id
    );
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: VENDOR_ACTIONS.VENDOR_RATING_UPDATED,
      entityType: 'VENDOR',
      entityId: req.params.id,
      entityName: vendor.name,
      department: req.user.department,
      details: { newRating: req.body.rating, review: req.body.review },
      req
    });
    
    res.json(vendor);
  } catch (error) {
    next(error);
  }
};

// Get vendor purchase history
const getPurchaseHistory = async (req, res, next) => {
  try {
    const history = await vendorsService.getPurchaseHistory(req.params.id, req.query);
    res.json(history);
  } catch (error) {
    next(error);
  }
};

// Get vendor stats
const getStats = async (req, res, next) => {
  try {
    const stats = await vendorsService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

// Get categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await vendorsService.getCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// Delete vendor (soft delete)
const remove = async (req, res, next) => {
  try {
    const vendor = await vendorsService.getById(req.params.id);
    await vendorsService.remove(req.params.id);
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: VENDOR_ACTIONS.VENDOR_DEACTIVATED,
      entityType: 'VENDOR',
      entityId: req.params.id,
      entityName: vendor?.name,
      department: req.user.department,
      details: { deleted: true },
      req
    });
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll, getById, getActive, getByCategory, search,
  create, update, toggleActive, updateRating,
  getPurchaseHistory, getStats, getCategories, remove
};
