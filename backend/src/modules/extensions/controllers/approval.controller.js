/**
 * Extensions Controller - Approval Operations
 */
const extensionsService = require('../extensions.service');

// Manager approves
const managerApprove = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const extension = await extensionsService.managerApprove(
      req.params.id,
      req.user.id,
      notes
    );
    
    res.json({
      success: true,
      data: extension,
      message: 'Extension approved. Forwarded to Purchasing.'
    });
  } catch (error) {
    next(error);
  }
};

// Manager rejects
const managerReject = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const extension = await extensionsService.managerReject(
      req.params.id,
      req.user.id,
      notes
    );
    
    res.json({
      success: true,
      data: extension,
      message: 'Extension rejected'
    });
  } catch (error) {
    next(error);
  }
};

// Purchasing approves
const purchasingApprove = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const extension = await extensionsService.purchasingApprove(
      req.params.id,
      req.user.id,
      notes
    );
    
    res.json({
      success: true,
      data: extension,
      message: 'Extension approved. Return date updated.'
    });
  } catch (error) {
    next(error);
  }
};

// Purchasing rejects
const purchasingReject = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const extension = await extensionsService.purchasingReject(
      req.params.id,
      req.user.id,
      notes
    );
    
    res.json({
      success: true,
      data: extension,
      message: 'Extension rejected'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { managerApprove, managerReject, purchasingApprove, purchasingReject };
