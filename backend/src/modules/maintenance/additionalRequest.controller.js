/**
 * Additional Request Controller
 * Handle additional material/tool requests from work orders
 */

const maintenanceService = require('./maintenance.service');
const { logActivity } = require('../../utils/activityLogger');

const createAdditionalRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { items, reason, priority } = req.body;
    
    const workOrder = await maintenanceService.getById(id);
    if (!workOrder) return res.status(404).json({ message: 'Work order not found' });
    if (workOrder.assigned_to !== req.user.id) return res.status(403).json({ message: 'Only assigned engineer can request' });
    if (workOrder.status !== 'In_Progress') return res.status(400).json({ message: 'Work order must be in progress' });
    
    const requestService = require('../requests/requests.service');
    
    // Format data to match create service expectations
    const requestData = {
      requesterId: req.user.id,
      type: 'Material',
      priority: priority || 'Medium',
      details: {
        subject: `Additional materials for Work Order #${id.slice(0, 8)}`,
        notes: reason,
        workOrderId: id,
        equipmentId: workOrder.equipment_id,
        equipmentName: workOrder.equipment_name,
        isAdditionalRequest: true,
        materials: items.filter(i => i.type === 'material').map(item => ({
          name: item.name, quantity: item.quantity, specifications: item.specifications || ''
        })),
        tools: items.filter(i => i.type === 'tool').map(item => ({
          name: item.name, quantity: item.quantity, specifications: item.specifications || ''
        }))
      }
    };
    
    const newRequest = await requestService.create(requestData);
    
    await logActivity({
      userId: req.user.id, userEmail: req.user.email, userRole: req.user.role,
      action: 'ADDITIONAL_REQUEST_CREATED', entityType: 'REQUEST', entityId: newRequest.id,
      entityName: requestData.details.subject, department: req.user.department,
      details: { workOrderId: id, itemCount: items.length, reason }, req
    });
    
    res.status(201).json({ message: 'Request submitted', request: newRequest });
  } catch (error) { next(error); }
};

module.exports = { createAdditionalRequest };
