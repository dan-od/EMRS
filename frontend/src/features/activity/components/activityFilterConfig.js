const requestGroup = {
  label: 'Requests',
  actions: ['REQUEST_CREATED', 'REQUEST_UPDATED', 'REQUEST_APPROVED', 'REQUEST_REJECTED', 'REQUEST_TRANSFERRED', 'REQUEST_CANCELLED', 'REQUEST_COMPLETED']
};

const equipmentGroup = {
  label: 'Equipment',
  actions: ['EQUIPMENT_CREATED', 'EQUIPMENT_UPDATED', 'EQUIPMENT_ASSIGNED', 'EQUIPMENT_UNASSIGNED', 'EQUIPMENT_STATUS_CHANGED', 'EQUIPMENT_HOURS_LOGGED']
};

const jobGroup = {
  label: 'Jobs',
  actions: ['JOB_CREATED', 'JOB_UPDATED', 'JOB_APPROVED', 'JOB_STATUS_CHANGED', 'JOB_TEAM_ADDED', 'JOB_TEAM_REMOVED', 'JOB_SUPERVISOR_ASSIGNED', 'JOB_SUPERVISOR_REMOVED', 'JOB_EQUIPMENT_ASSIGNED', 'JOB_EQUIPMENT_REMOVED']
};

const safetyGroup = {
  label: 'Safety',
  actions: ['SAFETY_REPORT_CREATED', 'SAFETY_REPORT_UPDATED', 'SAFETY_REPORT_ASSIGNED', 'SAFETY_REPORT_RESOLVED']
};

const maintenanceGroup = {
  label: 'Maintenance',
  actions: ['MAINTENANCE_LOGGED', 'MAINTENANCE_COMPLETED', 'MAINTENANCE_ASSIGNED']
};

const inspectionGroup = {
  label: 'Inspections',
  actions: ['PREJOB_INSPECTION_CREATED', 'POSTJOB_INSPECTION_CREATED']
};

const fieldReportGroup = {
  label: 'Field Reports',
  actions: ['FIELD_REPORT_SUBMITTED', 'FIELD_REPORT_REVIEWED']
};

const userGroup = {
  label: 'Users',
  actions: ['USER_CREATED', 'USER_UPDATED', 'USER_DEACTIVATED', 'USER_REACTIVATED', 'USER_DELETED', 'ROLE_CHANGED']
};

const inventoryGroup = {
  label: 'Inventory',
  actions: ['INVENTORY_ADDED', 'INVENTORY_UPDATED', 'INVENTORY_ADJUSTED', 'DISBURSEMENT_CREATED', 'DISBURSEMENT_COMPLETED']
};

const purchasingGroup = {
  label: 'Purchasing',
  actions: ['PURCHASE_REQUEST_CREATED', 'PURCHASE_REQUEST_APPROVED', 'PURCHASE_REQUEST_REJECTED']
};

const vendorGroup = {
  label: 'Vendors',
  actions: ['VENDOR_CREATED', 'VENDOR_UPDATED', 'VENDOR_DEACTIVATED', 'VENDOR_REACTIVATED', 'VENDOR_RATING_UPDATED']
};

const baseGroups = {
  authentication: {
    label: 'Authentication',
    actions: ['LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_CHANGED', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_COMPLETED']
  }
};

export const getActionGroupsForRole = (role) => {
  if (role === 'Admin' || role === 'IT Support') {
    return { ...baseGroups, users: userGroup, requests: requestGroup, equipment: equipmentGroup, jobs: jobGroup, safety: safetyGroup, maintenance: maintenanceGroup, inspections: inspectionGroup, fieldReports: fieldReportGroup, inventory: inventoryGroup, purchasing: purchasingGroup, vendors: vendorGroup };
  }
  if (role === 'Operations Manager') {
    return { ...baseGroups, requests: requestGroup, equipment: equipmentGroup, jobs: jobGroup, safety: safetyGroup, maintenance: maintenanceGroup, inspections: inspectionGroup, fieldReports: fieldReportGroup, inventory: inventoryGroup };
  }
  if (role === 'Workshop Manager') {
    return { ...baseGroups, requests: requestGroup, equipment: equipmentGroup, maintenance: maintenanceGroup, inspections: inspectionGroup };
  }
  if (role === 'Safety Officer') {
    return { ...baseGroups, safety: safetyGroup, jobs: jobGroup, inspections: inspectionGroup, fieldReports: fieldReportGroup };
  }
  if (role === 'Logistics Coordinator') {
    return { ...baseGroups, requests: requestGroup, inventory: inventoryGroup, purchasing: purchasingGroup, vendors: vendorGroup };
  }
  if (role === 'Field Engineer') {
    return { ...baseGroups, requests: requestGroup, jobs: { label: 'Jobs', actions: ['JOB_CREATED', 'JOB_STATUS_CHANGED', 'JOB_TEAM_ADDED', 'JOB_TEAM_REMOVED'] }, equipment: { label: 'Equipment', actions: ['EQUIPMENT_ASSIGNED', 'EQUIPMENT_HOURS_LOGGED'] }, maintenance: maintenanceGroup, inspections: inspectionGroup, fieldReports: fieldReportGroup };
  }
  if (role === 'Technician') {
    return { ...baseGroups, requests: requestGroup, equipment: { label: 'Equipment', actions: ['EQUIPMENT_ASSIGNED', 'EQUIPMENT_STATUS_CHANGED', 'EQUIPMENT_HOURS_LOGGED'] }, maintenance: maintenanceGroup, inspections: inspectionGroup };
  }
  if (role === 'Operator') {
    return { ...baseGroups, requests: requestGroup, jobs: { label: 'Jobs', actions: ['JOB_STATUS_CHANGED', 'JOB_TEAM_ADDED'] }, equipment: { label: 'Equipment', actions: ['EQUIPMENT_ASSIGNED', 'EQUIPMENT_HOURS_LOGGED'] } };
  }
  return { ...baseGroups, requests: requestGroup };
};

const operationsEntities = ['USER', 'REQUEST', 'EQUIPMENT', 'JOB', 'SAFETY_REPORT', 'INVENTORY', 'MAINTENANCE_LOG', 'INSPECTION', 'FIELD_REPORT'];
const workshopEntities = ['REQUEST', 'EQUIPMENT', 'MAINTENANCE_LOG', 'INSPECTION'];
const safetyEntities = ['SAFETY_REPORT', 'JOB', 'INSPECTION', 'FIELD_REPORT'];
const logisticsEntities = ['REQUEST', 'INVENTORY', 'DISBURSEMENT', 'PURCHASE_REQUEST', 'VENDOR'];
const fieldEntities = ['REQUEST', 'JOB', 'EQUIPMENT', 'MAINTENANCE_LOG', 'INSPECTION', 'FIELD_REPORT'];
const technicianEntities = ['REQUEST', 'EQUIPMENT', 'MAINTENANCE_LOG', 'INSPECTION'];
const basicEntities = ['REQUEST', 'JOB', 'EQUIPMENT'];

export const getEntitiesForRole = (role, allEntities) => {
  if (role === 'Admin' || role === 'IT Support') return allEntities;
  if (role === 'Operations Manager') return allEntities.filter(e => operationsEntities.includes(e));
  if (role === 'Workshop Manager') return allEntities.filter(e => workshopEntities.includes(e));
  if (role === 'Safety Officer') return allEntities.filter(e => safetyEntities.includes(e));
  if (role === 'Logistics Coordinator') return allEntities.filter(e => logisticsEntities.includes(e));
  if (role === 'Field Engineer') return allEntities.filter(e => fieldEntities.includes(e));
  if (role === 'Technician') return allEntities.filter(e => technicianEntities.includes(e));
  return allEntities.filter(e => basicEntities.includes(e));
};
