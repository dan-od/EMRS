/**
 * Requests Controller - Hold Operations
 * Put on hold and release from hold
 */
const requestsService = require('../requests.service');

const putOnHold = async (req, res, next) => {
  try {
    const { notes } = req.body;
    
    if (!notes) {
      return res.status(400).json({
        success: false,
        message: 'Notes are required when putting a request on hold'
      });
    }
    
    const request = await requestsService.putOnHold(req.params.id, req.user.id, notes);
    
    res.json({ 
      success: true, 
      data: request, 
      message: 'Request put on hold' 
    });
  } catch (error) {
    next(error);
  }
};

// Release from hold (resume)
const releaseFromHold = async (req, res, next) => {
  try {
    const userName = `${req.user.first_name} ${req.user.last_name}`;
    
    const request = await requestsService.releaseFromHold(
      req.params.id, 
      req.user.id,
      userName
    );
    
    res.json({ 
      success: true, 
      data: request, 
      message: 'Request released from hold' 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { putOnHold, releaseFromHold };
