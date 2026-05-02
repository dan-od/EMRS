const purchasingService = require('./purchasing.service');
const requestsPurchasingService = require('../requests/services/purchasing.service');
const extensionsGetterService = require('../extensions/services/getters.service');
const { query } = require('../../config/db');
const { logActivity, ACTIONS, ENTITY_TYPES } = require('../../utils/activityLogger');

const getInventory = async (req, res, next) => {
  try {
    const result = await purchasingService.getInventory(req.query);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getInventoryById = async (req, res, next) => {
  try {
    const item = await purchasingService.getInventoryById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

const getLowStock = async (req, res, next) => {
  try {
    const items = await purchasingService.getLowStock();
    res.json(items);
  } catch (error) {
    next(error);
  }
};

const createInventoryItem = async (req, res, next) => {
  try {
    const item = await purchasingService.createInventoryItem(req.body);
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.INVENTORY_ADDED,
      entityType: ENTITY_TYPES.INVENTORY,
      entityId: item.id,
      entityName: item.name,
      department: req.user.department,
      details: { 
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        location: item.location
      },
      req
    });
    
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

const updateInventoryItem = async (req, res, next) => {
  try {
    const oldItem = await purchasingService.getInventoryById(req.params.id);
    const item = await purchasingService.updateInventoryItem(req.params.id, req.body);
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.INVENTORY_UPDATED,
      entityType: ENTITY_TYPES.INVENTORY,
      entityId: req.params.id,
      entityName: item.name,
      department: req.user.department,
      details: { 
        before: oldItem ? { quantity: oldItem.quantity, reorder_level: oldItem.reorder_level } : null,
        after: { quantity: item.quantity, reorder_level: item.reorder_level }
      },
      req
    });
    
    res.json(item);
  } catch (error) {
    next(error);
  }
};

const adjustStock = async (req, res, next) => {
  try {
    const oldItem = await purchasingService.getInventoryById(req.params.id);
    const item = await purchasingService.adjustStock(
      req.params.id, 
      req.body.quantity, 
      req.body.reason,
      req.user.id
    );
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.INVENTORY_ADJUSTED,
      entityType: ENTITY_TYPES.INVENTORY,
      entityId: req.params.id,
      entityName: item.name,
      department: req.user.department,
      details: { 
        previousQuantity: oldItem?.quantity,
        newQuantity: item.quantity,
        adjustment: req.body.quantity,
        reason: req.body.reason
      },
      req
    });
    
    res.json(item);
  } catch (error) {
    next(error);
  }
};

const addStock = async (req, res, next) => {
  try {
    const oldItem = await purchasingService.getInventoryById(req.params.id);
    const item = await purchasingService.addStock(
      req.params.id, req.body.quantity, req.user.id, req.body.notes
    );
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.INVENTORY_ADJUSTED,
      entityType: ENTITY_TYPES.INVENTORY,
      entityId: req.params.id,
      entityName: item.name,
      department: req.user.department,
      details: { 
        type: 'stock_received',
        previousQuantity: oldItem?.quantity,
        quantityAdded: req.body.quantity,
        newQuantity: item.quantity,
        notes: req.body.notes
      },
      req
    });
    
    res.json(item);
  } catch (error) {
    next(error);
  }
};

const getDisbursements = async (req, res, next) => {
  try {
    const disbursements = await purchasingService.getDisbursements(req.query);
    res.json(disbursements);
  } catch (error) {
    next(error);
  }
};

const getPendingDisbursements = async (req, res, next) => {
  try {
    const disbursements = await purchasingService.getPendingDisbursements();
    res.json(disbursements);
  } catch (error) {
    next(error);
  }
};

const createDisbursement = async (req, res, next) => {
  try {
    const disbursement = await purchasingService.createDisbursement({
      ...req.body,
      createdBy: req.user.id
    });
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.DISBURSEMENT_CREATED,
      entityType: ENTITY_TYPES.DISBURSEMENT,
      entityId: disbursement.id,
      entityName: `Disbursement for request ${req.body.requestId}`,
      department: req.user.department,
      details: { 
        requestId: req.body.requestId,
        items: req.body.items
      },
      req
    });
    
    res.status(201).json(disbursement);
  } catch (error) {
    next(error);
  }
};

const completeDisbursement = async (req, res, next) => {
  try {
    const disbursement = await purchasingService.completeDisbursement(req.params.id, req.user.id);
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.DISBURSEMENT_COMPLETED,
      entityType: ENTITY_TYPES.DISBURSEMENT,
      entityId: req.params.id,
      department: req.user.department,
      details: { completedBy: req.user.id },
      req
    });
    
    res.json(disbursement);
  } catch (error) {
    next(error);
  }
};

const approveDisbursement = async (req, res, next) => {
  try {
    const disbursement = await purchasingService.approveDisbursement(req.params.id, req.user.id);
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.DISBURSEMENT_COMPLETED,
      entityType: ENTITY_TYPES.DISBURSEMENT,
      entityId: req.params.id,
      department: req.user.department,
      details: { approvedBy: req.user.id },
      req
    });
    
    res.json(disbursement);
  } catch (error) {
    next(error);
  }
};

const rejectDisbursement = async (req, res, next) => {
  try {
    const disbursement = await purchasingService.rejectDisbursement(
      req.params.id, req.user.id, req.body.reason
    );
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.DISBURSEMENT_COMPLETED,
      entityType: ENTITY_TYPES.DISBURSEMENT,
      entityId: req.params.id,
      department: req.user.department,
      details: { 
        rejectedBy: req.user.id,
        reason: req.body.reason
      },
      req
    });
    
    res.json(disbursement);
  } catch (error) {
    next(error);
  }
};

// Purchase Requests
const getPurchaseRequests = async (req, res, next) => {
  try {
    const requests = await purchasingService.getPurchaseRequests(req.query);
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

const createPurchaseRequest = async (req, res, next) => {
  try {
    const request = await purchasingService.createPurchaseRequest({
      ...req.body,
      requesterId: req.user.id
    });
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.PURCHASE_REQUEST_CREATED,
      entityType: ENTITY_TYPES.PURCHASE_REQUEST,
      entityId: request.id,
      entityName: request.description,
      department: req.user.department,
      details: { 
        items: req.body.items,
        estimatedCost: req.body.estimatedCost
      },
      req
    });
    
    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
};

const approvePurchaseRequest = async (req, res, next) => {
  try {
    const request = await purchasingService.approvePurchaseRequest(req.params.id, req.user.id);
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.PURCHASE_REQUEST_APPROVED,
      entityType: ENTITY_TYPES.PURCHASE_REQUEST,
      entityId: req.params.id,
      entityName: request.description,
      department: req.user.department,
      details: { approvedBy: req.user.id },
      req
    });
    
    res.json(request);
  } catch (error) {
    next(error);
  }
};

const rejectPurchaseRequest = async (req, res, next) => {
  try {
    const request = await purchasingService.rejectPurchaseRequest(
      req.params.id, req.user.id, req.body.reason
    );
    
    await logActivity({
      userId: req.user.id,
      userEmail: req.user.email,
      userRole: req.user.role,
      action: ACTIONS.PURCHASE_REQUEST_REJECTED,
      entityType: ENTITY_TYPES.PURCHASE_REQUEST,
      entityId: req.params.id,
      entityName: request.description,
      department: req.user.department,
      details: { 
        rejectedBy: req.user.id,
        reason: req.body.reason
      },
      req
    });
    
    res.json(request);
  } catch (error) {
    next(error);
  }
};

const getStockMovements = async (req, res, next) => {
  try {
    const movements = await purchasingService.getStockMovements(req.params.id);
    res.json(movements);
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await purchasingService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

// Single endpoint replacing 11 concurrent SWR calls from PurchasingDashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      stats,
      allRequests,
      ready,
      onHold,
      disbursedActive,
      pendingReturn,
      overdue,
      completed,
      maintenanceApprovals,
      lowStock,
      extensions,
      maintenanceApproved
    ] = await Promise.all([
      requestsPurchasingService.getPurchasingStats(),
      requestsPurchasingService.getAllForPurchasing({}),
      requestsPurchasingService.getReadyToDisburse(),
      requestsPurchasingService.getOnHold(),
      requestsPurchasingService.getDisbursedActive(),
      requestsPurchasingService.getPendingReturn(),
      requestsPurchasingService.getOverdueReturns(),
      requestsPurchasingService.getCompleted(),
      requestsPurchasingService.getMaintenanceRequests(),
      purchasingService.getLowStock(),
      extensionsGetterService.getPendingForPurchasing(),
      query(`
        SELECT r.*, u.first_name || ' ' || u.last_name as requester_name,
               u.department as requester_department, e.name as equipment_name
        FROM requests r
        LEFT JOIN users u ON r.requester_id = u.id
        LEFT JOIN equipment e ON (r.details->>'equipmentId')::uuid = e.id
        WHERE r.type = 'Maintenance' AND r.status = 'Approved'
          AND r.details->>'workOrderId' IS NOT NULL
        ORDER BY r.updated_at DESC
      `).then(r => r.rows)
    ]);

    res.json({
      success: true,
      data: {
        stats,
        requests: {
          all: allRequests.requests,
          ready,
          onHold,
          disbursedActive,
          pendingReturn,
          overdue,
          completed,
          maintenanceApprovals,
          maintenanceApproved
        },
        lowStock,
        extensions
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory, getInventoryById, getLowStock, createInventoryItem, updateInventoryItem,
  adjustStock, addStock,
  getDisbursements, getPendingDisbursements, createDisbursement, completeDisbursement,
  approveDisbursement, rejectDisbursement,
  getPurchaseRequests, createPurchaseRequest, approvePurchaseRequest, rejectPurchaseRequest,
  getStockMovements, getStats, getDashboardStats
};
