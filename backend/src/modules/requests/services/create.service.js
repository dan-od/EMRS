/**
 * Requests Service - Create Operations
 * Request creation with validation, history, and auto-approval for managers
 */
const { transaction } = require('../../../config/db');
const queries = require('../requests.queries');

// Roles that auto-approve their own requests (skip manager approval step)
// These roles ARE managers, so they don't need to approve their own requests
const AUTO_APPROVE_ROLES = [
  'Super_Admin', 'Admin', 'IT_Manager',
  'Operations_Manager', 'Purchasing_Manager', 'Accounts_Manager',
  'Safety_Manager', 'Maintenance_Manager',
  'HR_Manager', 'Logistics_Manager', 'Workshop_Manager'
];

const create = async (requestData) => {
  const {
    requesterId,
    requesterRole,
    requesterName,
    type,
    priority,
    details,
    dateNeeded,
    jobId,
    maintenanceCategory,
    maintenanceRoutesTo,
    maintenanceOtherDescription,
    notes
  } = requestData;
  
  // Check if requester's role should auto-approve
  const shouldAutoApprove = AUTO_APPROVE_ROLES.includes(requesterRole);
  
  return await transaction(async (client) => {
    // Create the request
    const result = await client.query(queries.create, [
      requesterId,
      type,
      priority || 'Medium',
      JSON.stringify(details),
      dateNeeded,
      jobId,
      maintenanceCategory || null,
      maintenanceRoutesTo || null,
      maintenanceOtherDescription || null,
      notes || null
    ]);
    
    let request = result.rows[0];
    
    if (shouldAutoApprove) {
      // Auto-approve: Update status to 'Approved' and set approval info
      const approveResult = await client.query(
        `UPDATE requests SET 
          status = 'Approved'::request_status, 
          approved_by = $2, 
          approved_at = NOW(),
          updated_at = NOW()
        WHERE id = $1 RETURNING *`,
        [request.id, requesterId]
      );
      request = approveResult.rows[0];
      
      // Add history for creation
      await client.query(queries.addHistory, [
        request.id, requesterId, null, 'Pending', 'Request created'
      ]);
      
      // Add history for auto-approval
      await client.query(queries.addHistory, [
        request.id, requesterId, 'Pending', 'Approved', 
        `Auto-approved by ${requesterName || requesterRole} (manager-initiated request)`
      ]);
      
      // Add audit trail for creation
      await client.query(queries.addAuditTrail, [
        request.id, requesterId, 'CREATED', null, null, 'Request submitted'
      ]);
      
      // Add audit trail for auto-approval
      await client.query(queries.addAuditTrail, [
        request.id, requesterId, 'AUTO_APPROVED', null, null, 
        `Auto-approved: ${requesterName || 'Manager'} created request - skips manager approval`
      ]);
    } else {
      // Normal flow: Add creation history only
      await client.query(queries.addHistory, [
        request.id, requesterId, null, 'Pending', 'Request created'
      ]);
      
      // Add audit trail entry
      await client.query(queries.addAuditTrail, [
        request.id, requesterId, 'CREATED', null, null, 'Request submitted'
      ]);
    }
    
    return request;
  });
};

module.exports = { create };
