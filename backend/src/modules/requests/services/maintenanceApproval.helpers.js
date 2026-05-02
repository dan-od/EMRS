/**
 * Maintenance Approval Helpers
 * Handles maintenance-specific approval logic
 * Keeps approval.service.js clean and focused
 * FIXED: Now saves managerNotes to details
 * FIXED: Non-Purchasing users always set Manager_Approved status
 */

/**
 * Process manager approval data for maintenance requests
 * @param {Object} details - Current request details
 * @param {Object} managerData - Manager's additions
 * @param {string} approvedBy - Approver user ID
 * @param {string} approverName - Approver name
 * @returns {Object} Updated details
 */
const processManagerApproval = (details, managerData, approvedBy, approverName) => {
  return {
    ...details,
    managerVendorRecommendation: managerData.vendorRecommendation || null,
    managerMaterialAdditions: managerData.additionalMaterials || null,
    managerToolAdditions: managerData.additionalTools || null,
    costEstimate: managerData.costEstimate || null,
    // FIXED: Now saving manager notes
    managerNotes: managerData.managerNotes || null,
    managerApprovedAt: new Date().toISOString(),
    managerApprovedBy: approvedBy,
    managerApproverName: approverName
  };
};

/**
 * Process purchasing approval data for maintenance requests
 * @param {Object} details - Current request details
 * @param {Object} purchasingData - Purchasing's data
 * @param {string} approvedBy - Approver user ID
 * @param {string} approverName - Approver name
 * @returns {Object} Updated details
 */
const processPurchasingApproval = (details, purchasingData, approvedBy, approverName) => {
  return {
    ...details,
    confirmedVendor: purchasingData.confirmedVendor || null,
    linkedMaterials: purchasingData.linkedMaterials || null,
    linkedTools: purchasingData.linkedTools || null,
    purchasingNotes: purchasingData.purchasingNotes || null,
    finalCost: purchasingData.finalCost || null,
    purchasingApprovedAt: new Date().toISOString(),
    purchasingApprovedBy: approvedBy,
    purchasingApproverName: approverName
  };
};

/**
 * Determine the correct status for maintenance request approval
 * 
 * FLOW:
 * 1. Engineer creates Maintenance request -> Pending
 * 2. Manager approves -> Manager_Approved (waits for Purchasing)
 * 3. Purchasing approves -> Approved + Work Order created
 * 
 * @param {Object} request - The request being approved
 * @param {Object} managerData - Manager data if present
 * @param {Object} purchasingData - Purchasing data if present
 * @param {Object} user - The approving user
 * @returns {string} The new status
 */
const getMaintenanceApprovalStatus = (request, managerData, purchasingData, user) => {
  const userRole = user?.role?.toLowerCase() || '';
  const isPurchasingRole = userRole.includes('purchasing');
  
  // If Purchasing is approving OR purchasingData provided -> fully Approved
  if (isPurchasingRole || purchasingData) {
    return 'Approved';
  }
  
  // ANY non-Purchasing user approving a Maintenance request -> Manager_Approved
  // This ensures Maintenance ALWAYS goes through Purchasing review
  // (regardless of whether managerData was sent)
  return 'Manager_Approved';
};

/**
 * Check if this approval should create a work order
 * Work orders are only created when Purchasing approves
 * 
 * @param {Object} request - The request
 * @param {Object} purchasingData - Purchasing data
 * @param {Object} user - Approving user
 * @returns {boolean}
 */
const shouldCreateWorkOrder = (request, purchasingData, user) => {
  if (request.type !== 'Maintenance') return false;
  
  const userRole = user?.role?.toLowerCase() || '';
  const isPurchasingRole = userRole.includes('purchasing');
  
  // Only create work order when Purchasing approves
  return isPurchasingRole || !!purchasingData;
};

module.exports = {
  processManagerApproval,
  processPurchasingApproval,
  getMaintenanceApprovalStatus,
  shouldCreateWorkOrder
};
