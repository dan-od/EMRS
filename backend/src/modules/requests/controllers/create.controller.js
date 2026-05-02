/**
 * Requests Controller - Create Operation
 * Request creation endpoint with manager auto-approval
 */
const requestsService = require('../requests.service');
const { logActivity } = require('../../../utils/activityLogger');

const create = async (req, res, next) => {
  try {
    // Build requester name from user data
    const requesterName = req.user.first_name && req.user.last_name 
      ? `${req.user.first_name} ${req.user.last_name}`
      : req.user.email.split('@')[0];
    
    const requestData = {
      requesterId: req.user.id,
      requesterRole: req.user.role,
      requesterName: requesterName, // Pass name for better audit trail
      type: req.validatedBody.type,
      priority: req.validatedBody.priority,
      details: req.validatedBody.details,
      dateNeeded: req.validatedBody.dateNeeded,
      jobId: req.validatedBody.jobId,
      // Maintenance-specific fields
      maintenanceCategory: req.validatedBody.maintenanceCategory,
      maintenanceRoutesTo: req.validatedBody.maintenanceRoutesTo,
      maintenanceOtherDescription: req.validatedBody.maintenanceOtherDescription,
      notes: req.validatedBody.notes
    };
    
    const request = await requestsService.create(requestData);
    
    // Determine if auto-approved for activity log
    const wasAutoApproved = request.status === 'Approved';
    
    // Format items summary for activity log
    const itemsSummary = formatItemsForLog(requestData.details, requestData.type);
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: wasAutoApproved ? 'REQUEST_AUTO_APPROVED' : 'REQUEST_CREATED',
      entityType: 'REQUEST',
      entityId: request.id,
      entityName: `${requestData.type} Request`,
      details: {
        type: requestData.type,
        priority: requestData.priority,
        items: itemsSummary,
        requesterName: requesterName,
        autoApproved: wasAutoApproved,
        maintenanceCategory: requestData.maintenanceCategory,
        // Include raw items for detailed view
        rawItems: requestData.details?.items || null
      },
      department: req.user.department,
      req
    });
    
    res.status(201).json({ 
      success: true, 
      data: request,
      message: wasAutoApproved 
        ? 'Request created and auto-approved. Forwarded to Purchasing.' 
        : 'Request created successfully. Pending manager approval.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Format items for activity log display
 */
function formatItemsForLog(details, type) {
  if (!details) return type;
  
  // PPE/Material items
  if (details.items && Array.isArray(details.items) && details.items.length > 0) {
    return details.items.map(item => {
      const name = item.name || item.item || 'Unknown Item';
      const qty = item.quantity || 1;
      const size = item.size ? ` (${item.size})` : '';
      return `${name}${size} ×${qty}`;
    }).join(', ');
  }
  
  // Equipment
  if (details.equipmentName) {
    return details.equipmentName;
  }
  
  // Transport
  if (details.destination) {
    const pickup = details.pickupLocation ? `from ${details.pickupLocation} ` : '';
    return `${pickup}to ${details.destination}`;
  }
  
  // Maintenance
  if (details.issueDescription) {
    const equipName = details.equipmentName ? `${details.equipmentName}: ` : '';
    const desc = details.issueDescription;
    return equipName + (desc.length > 50 ? desc.substring(0, 50) + '...' : desc);
  }
  
  return type;
}

module.exports = { create };
