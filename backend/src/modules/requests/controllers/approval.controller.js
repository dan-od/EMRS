/**
 * Requests Controller - Approval Operations
 * Approve and reject endpoints
 * Delegates to service layer
 */
const requestsService = require('../requests.service');
const { logActivity } = require('../../../utils/activityLogger');

/**
 * Approve a request
 */
const approve = async (req, res, next) => {
  try {
    const { notes, items, managerData, purchasingData } = req.validatedBody || {};
    const approverName = `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim();
    
    // Delegate to service
    const request = await requestsService.approve(
      req.params.id, 
      req.user.id, 
      approverName, 
      notes, 
      items, 
      req.user,
      managerData,
      purchasingData
    );
    
    // Log activity
    await logApproverActivity(req, request, notes, items, managerData, purchasingData, approverName);
    await logRequesterActivity(req, request, notes, items, approverName, purchasingData);
    
    // Determine response message
    const message = getApprovalMessage(purchasingData, managerData, request);
    
    res.json({ success: true, data: request, message });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject a request
 */
const reject = async (req, res, next) => {
  try {
    const { reason } = req.validatedBody;
    const rejecterName = `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim();
    
    const request = await requestsService.reject(req.params.id, req.user.id, rejecterName, reason);
    
    // Log activities
    await logRejecterActivity(req, request, reason);
    await logRequesterRejection(req, request, reason, rejecterName);
    
    res.json({ success: true, data: request, message: 'Request rejected' });
  } catch (error) {
    next(error);
  }
};

// --- Helper Functions ---

const logApproverActivity = async (req, request, notes, items, managerData, purchasingData, approverName) => {
  const approvedItems = items?.filter(i => i.approval_status === 'approved') || [];
  const rejectedItems = items?.filter(i => i.approval_status === 'rejected') || [];
  
  await logActivity({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: 'REQUEST_APPROVED',
    entityType: 'REQUEST',
    entityId: req.params.id,
    entityName: `${request.type} Request`,
    details: { 
      notes, 
      requesterId: request.requester_id, 
      itemsApproved: approvedItems.length || null,
      itemsRejected: rejectedItems.length || null,
      partialApproval: rejectedItems.length > 0,
      costEstimate: managerData?.costEstimate || null,
      finalCost: purchasingData?.finalCost || null,
      isPurchasingApproval: !!purchasingData,
      isManagerApproval: !!managerData,
      workOrderCreated: !!purchasingData
    },
    department: req.user.department,
    req
  });
};

const logRequesterActivity = async (req, request, notes, items, approverName, purchasingData) => {
  if (!request.requester_id || request.requester_id === req.user.id) return;
  
  const approvedItems = items?.filter(i => i.approval_status === 'approved') || [];
  const rejectedItems = items?.filter(i => i.approval_status === 'rejected') || [];
  
  await logActivity({
    userId: request.requester_id,
    userEmail: request.requester_email,
    userRole: null,
    action: 'REQUEST_APPROVED',
    entityType: 'REQUEST',
    entityId: req.params.id,
    entityName: `${request.type} Request`,
    details: { 
      notes, 
      approvedBy: req.user.email,
      approverName,
      itemsApproved: approvedItems.length || null,
      itemsRejected: rejectedItems.length || null,
      isPurchasingApproval: !!purchasingData,
      workOrderCreated: !!purchasingData
    },
    department: request.requester_department,
    req
  });
};

const logRejecterActivity = async (req, request, reason) => {
  await logActivity({
    userId: req.user.id,
    userEmail: req.user.email,
    userRole: req.user.role,
    action: 'REQUEST_REJECTED',
    entityType: 'REQUEST',
    entityId: req.params.id,
    entityName: `${request.type} Request`,
    details: { reason, requesterId: request.requester_id },
    department: req.user.department,
    req
  });
};

const logRequesterRejection = async (req, request, reason, rejecterName) => {
  if (!request.requester_id || request.requester_id === req.user.id) return;
  
  await logActivity({
    userId: request.requester_id,
    userEmail: request.requester_email,
    userRole: null,
    action: 'REQUEST_REJECTED',
    entityType: 'REQUEST',
    entityId: req.params.id,
    entityName: `${request.type} Request`,
    details: { 
      reason, 
      rejectedBy: req.user.email,
      rejectorName: rejecterName
    },
    department: request.requester_department,
    req
  });
};

const getApprovalMessage = (purchasingData, managerData, request) => {
  if (purchasingData) {
    return 'Request approved and Work Order created';
  }
  if (managerData && request.type === 'Maintenance') {
    return 'Request approved - sent to Purchasing for review';
  }
  return 'Request approved successfully';
};

module.exports = { approve, reject };
