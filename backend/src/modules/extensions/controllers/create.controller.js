/**
 * Extensions Controller - Create Operation
 */
const extensionsService = require('../extensions.service');

const create = async (req, res, next) => {
  try {
    const { requestId, itemIndex, itemName, currentReturnDate, requestedReturnDate, reason } = req.body;
    
    if (!requestId || !requestedReturnDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Request ID, requested return date, and reason are required'
      });
    }
    
    const extension = await extensionsService.create(req.user.id, {
      requestId,
      itemIndex,
      itemName,
      currentReturnDate,
      requestedReturnDate,
      reason
    });
    
    res.status(201).json({
      success: true,
      data: extension,
      message: 'Extension request submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { create };
