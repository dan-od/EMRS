/**
 * Requests Controller - Miscellaneous Actions
 * Complete, cancel, transfer endpoints
 */
const requestsService = require('../requests.service');
const { logActivity } = require('../../../utils/activityLogger');

// Complete request (for consumables)
const complete = async (req, res, next) => {
  try {
    const request = await requestsService.complete(req.params.id, req.user.id);
    
    res.json({ 
      success: true, 
      data: request, 
      message: 'Request completed' 
    });
  } catch (error) {
    next(error);
  }
};

const cancel = async (req, res, next) => {
  try {
    const existing = await requestsService.getById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (existing.requester_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only cancel your own requests' });
    }
    const request = await requestsService.cancel(req.params.id, req.user.id);
    if (!request) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot cancel this request' 
      });
    }
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'REQUEST_CANCELLED',
      entityType: 'REQUEST',
      entityId: req.params.id,
      entityName: `${request.type} Request`,
      details: {},
      department: req.user.department,
      req
    });
    
    res.json({ success: true, data: request, message: 'Request cancelled' });
  } catch (error) {
    next(error);
  }
};

const transfer = async (req, res, next) => {
  try {
    const { toDepartment, notes } = req.body;
    if (!toDepartment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Target department is required' 
      });
    }
    
    const request = await requestsService.transfer(req.params.id, toDepartment, req.user.id, notes);
    
    // Log for the person transferring
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: 'REQUEST_TRANSFERRED',
      entityType: 'REQUEST',
      entityId: req.params.id,
      entityName: `${request.type} Request`,
      details: { toDepartment, notes, requesterId: request.requester_id },
      department: req.user.department,
      req
    });
    
    // Also log for the requester so they can see it
    if (request.requester_id && request.requester_id !== req.user.id) {
      await logActivity({
        userId: request.requester_id,
        userEmail: request.requester_email,
        userRole: null,
        action: 'REQUEST_TRANSFERRED',
        entityType: 'REQUEST',
        entityId: req.params.id,
        entityName: `${request.type} Request`,
        details: { 
          toDepartment, 
          notes,
          transferredBy: req.user.email
        },
        department: request.requester_department,
        req
      });
    }
    
    res.json({ success: true, data: request, message: `Request transferred to ${toDepartment}` });
  } catch (error) {
    next(error);
  }
};

module.exports = { complete, cancel, transfer };
