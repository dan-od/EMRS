/**
 * Requests Controller - Return Operations
 * Initiate and confirm return endpoints
 */
const requestsService = require('../requests.service');

// Requester initiates return
const initiateReturn = async (req, res, next) => {
  try {
    const existing = await requestsService.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (existing.requester_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only initiate returns for your own requests' });
    }

    const { notes, returnItems } = req.body;

    if (!returnItems || returnItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Return items with conditions are required'
      });
    }

    const request = await requestsService.initiateReturn(
      req.params.id, 
      req.user.id, 
      { notes, returnItems }
    );
    
    res.json({ 
      success: true, 
      data: request, 
      message: 'Return initiated successfully' 
    });
  } catch (error) {
    next(error);
  }
};

// Purchasing confirms return
const confirmReturn = async (req, res, next) => {
  try {
    const { notes, verifiedItems } = req.body;
    const confirmerName = `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim();
    
    const request = await requestsService.confirmReturn(
      req.params.id, 
      req.user.id,
      confirmerName,
      { notes, verifiedItems }
    );
    
    res.json({ 
      success: true, 
      data: request, 
      message: 'Return verified successfully' 
    });
  } catch (error) {
    next(error);
  }
};

// Send reminder for overdue return
const remindReturn = async (req, res, next) => {
  try {
    const result = await requestsService.remindReturn(req.params.id, req.user.id);
    
    res.json({ 
      success: true, 
      data: result, 
      message: 'Reminder sent successfully' 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { initiateReturn, confirmReturn, remindReturn };
