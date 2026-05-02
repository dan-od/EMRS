/**
 * Requests Controller - Disburse Operation
 * Purchasing fulfills request
 */
const requestsService = require('../requests.service');

const disburse = async (req, res, next) => {
  try {
    const { notes, expectedReturnDate, inventoryLinks, withoutApproval } = req.validatedBody;
    const disburserName = `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim();

    const request = await requestsService.disburse(
      req.params.id,
      req.user.id,
      disburserName,
      { notes, expectedReturnDate, withoutApproval: withoutApproval ?? false, inventoryLinks }
    );
    
    res.json({ 
      success: true, 
      data: request, 
      message: 'Request disbursed successfully' 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { disburse };
