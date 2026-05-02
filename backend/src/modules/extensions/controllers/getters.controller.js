/**
 * Extensions Controller - Getter Operations
 */
const extensionsService = require('../extensions.service');

// Get by ID
const getById = async (req, res, next) => {
  try {
    const extension = await extensionsService.getById(req.params.id);
    if (!extension) {
      return res.status(404).json({
        success: false,
        message: 'Extension not found'
      });
    }
    res.json({ success: true, data: extension });
  } catch (error) {
    next(error);
  }
};

// Get extensions for a request
const getByRequestId = async (req, res, next) => {
  try {
    const extensions = await extensionsService.getByRequestId(req.params.requestId);
    res.json({ success: true, data: extensions });
  } catch (error) {
    next(error);
  }
};

// Get pending for manager
const getPendingForManager = async (req, res, next) => {
  try {
    const extensions = await extensionsService.getPendingForManager(req.user.department);
    res.json({ success: true, data: extensions });
  } catch (error) {
    next(error);
  }
};

// Get pending for purchasing
const getPendingForPurchasing = async (req, res, next) => {
  try {
    const extensions = await extensionsService.getPendingForPurchasing();
    res.json({ success: true, data: extensions });
  } catch (error) {
    next(error);
  }
};

module.exports = { getById, getByRequestId, getPendingForManager, getPendingForPurchasing };
