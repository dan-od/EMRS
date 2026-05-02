/**
 * Accounts Controller
 * HTTP handlers for accounts department endpoints
 * With throttled activity logging (logs first view, then once per 15 mins per user)
 */

const accountsService = require('./accounts.service');
const { logFromRequest, ACTIONS, ENTITY_TYPES } = require('../../utils/activityLogger');

// In-memory cache for throttling view logs (userId -> lastLoggedTime)
// In production, you might use Redis for multi-instance support
const viewLogCache = new Map();
const VIEW_LOG_THROTTLE_MS = 15 * 60 * 1000; // 15 minutes

// Evict stale entries every 30 minutes to prevent unbounded growth
setInterval(() => {
  const cutoff = Date.now() - VIEW_LOG_THROTTLE_MS;
  for (const [key, ts] of viewLogCache) {
    if (ts < cutoff) viewLogCache.delete(key);
  }
}, 30 * 60 * 1000).unref();

/**
 * Check if we should log this view (throttle check)
 */
const shouldLogView = (userId, pageKey) => {
  const cacheKey = `${userId}:${pageKey}`;
  const lastLogged = viewLogCache.get(cacheKey);
  const now = Date.now();
  
  if (!lastLogged || (now - lastLogged) > VIEW_LOG_THROTTLE_MS) {
    viewLogCache.set(cacheKey, now);
    return true;
  }
  return false;
};

/**
 * GET /api/accounts/work-orders
 * List completed work orders with filters
 */
const getWorkOrders = async (req, res, next) => {
  try {
    const result = await accountsService.getWorkOrders(req.query);
    
    // Throttled logging - first view or after 15 mins
    if (shouldLogView(req.user.id, 'asset-ledger')) {
      const hasFilters = req.query.dateFrom || req.query.dateTo || 
                         req.query.department || req.query.paymentStatus ||
                         req.query.minCost || req.query.maxCost;
      
      await logFromRequest(req, {
        action: hasFilters ? 'SEARCH_ASSET_LEDGER' : 'VIEW_ASSET_LEDGER',
        entityType: 'MAINTENANCE',
        entityName: 'Asset Ledger',
        details: hasFilters ? { 
          filters: req.query,
          resultsCount: result.workOrders?.length || 0
        } : {
          resultsCount: result.workOrders?.length || 0,
          note: 'Viewed work orders list'
        }
      });
    }

    res.json({ 
      success: true, 
      data: result.workOrders,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/accounts/work-orders/:id
 * Get single work order detail - ALWAYS logged (specific record view)
 */
const getWorkOrderById = async (req, res, next) => {
  try {
    const workOrder = await accountsService.getWorkOrderById(req.params.id);
    
    if (!workOrder) {
      return res.status(404).json({ 
        success: false, 
        message: 'Work order not found' 
      });
    }

    // Always log individual work order views - this is important audit info
    await logFromRequest(req, {
      action: 'VIEW_WORK_ORDER',
      entityType: 'MAINTENANCE',
      entityId: req.params.id,
      entityName: `WO-${req.params.id.slice(0, 8)} - ${workOrder.equipment_name || 'Unknown Equipment'}`,
      details: {
        equipmentName: workOrder.equipment_name,
        equipmentSerial: workOrder.equipment_serial,
        status: workOrder.status,
        totalCost: workOrder.purchasing_final_cost || workOrder.manager_cost_estimate || 0,
        costFormatted: `₦${(workOrder.purchasing_final_cost || workOrder.manager_cost_estimate || 0).toLocaleString()}`,
        isPaid: !!workOrder.accounts_final_payment,
        requesterName: workOrder.requester_name
      }
    });

    res.json({ success: true, data: workOrder });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/accounts/work-orders/:id/payment
 * Record final payment for a work order - ALWAYS logged
 */
const recordPayment = async (req, res, next) => {
  try {
    const { amount, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment amount is required'
      });
    }

    // Get work order details first for logging
    const existingWO = await accountsService.getWorkOrderById(req.params.id);
    
    const workOrder = await accountsService.recordPayment(
      req.params.id,
      { amount, notes },
      req.user
    );

    // Log payment with full details - critical financial action
    await logFromRequest(req, {
      action: 'PAYMENT_RECORDED',
      entityType: 'MAINTENANCE',
      entityId: req.params.id,
      entityName: `WO-${req.params.id.slice(0, 8)} - ${existingWO?.equipment_name || 'Equipment'}`,
      details: {
        workOrderId: req.params.id,
        equipmentName: existingWO?.equipment_name,
        paymentAmount: amount,
        paymentAmountFormatted: `₦${Number(amount).toLocaleString()}`,
        managerEstimate: existingWO?.manager_cost_estimate ? `₦${Number(existingWO.manager_cost_estimate).toLocaleString()}` : null,
        purchasingCost: existingWO?.purchasing_final_cost ? `₦${Number(existingWO.purchasing_final_cost).toLocaleString()}` : null,
        notes: notes || null,
        recordedBy: `${req.user.first_name} ${req.user.last_name}`
      }
    });

    res.json({ 
      success: true, 
      message: 'Payment recorded successfully',
      data: workOrder 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/accounts/stats
 * Get cost summary statistics - no logging needed (just dashboard data)
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await accountsService.getCostStats();
    
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/accounts/costs-by-department
 * Get costs grouped by department
 */
const getCostsByDepartment = async (req, res, next) => {
  try {
    const data = await accountsService.getCostsByDepartment();
    
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/accounts/costs-by-vendor
 * Get costs grouped by vendor
 */
const getCostsByVendor = async (req, res, next) => {
  try {
    const data = await accountsService.getCostsByVendor();
    
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/accounts/service-breakdown
 * Get In-House vs External cost breakdown
 */
const getServiceBreakdown = async (req, res, next) => {
  try {
    const data = await accountsService.getServiceTypeBreakdown();
    
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/accounts/export
 * Export work orders to Excel format - ALWAYS logged (data export)
 */
const exportWorkOrders = async (req, res, next) => {
  try {
    // Get all work orders (no pagination for export)
    const result = await accountsService.getWorkOrders({
      ...req.query,
      limit: 10000,
      page: 1
    });

    // Calculate total cost for logging
    const totalCost = result.workOrders.reduce((sum, wo) => {
      return sum + (parseFloat(wo.purchasing_final_cost) || parseFloat(wo.manager_cost_estimate) || 0);
    }, 0);

    // Log export activity - important audit info
    await logFromRequest(req, {
      action: 'DATA_EXPORTED',
      entityType: 'MAINTENANCE',
      entityName: 'Asset Ledger Export',
      details: { 
        exportType: 'Work Orders Cost Report',
        filters: req.query,
        recordCount: result.workOrders.length,
        totalCostExported: `₦${totalCost.toLocaleString()}`,
        exportedBy: `${req.user.first_name} ${req.user.last_name}`
      }
    });

    // Return data in a format suitable for frontend Excel generation
    res.json({ 
      success: true, 
      data: result.workOrders,
      exportInfo: {
        generatedAt: new Date().toISOString(),
        generatedBy: `${req.user.first_name} ${req.user.last_name}`,
        filters: req.query,
        totalRecords: result.workOrders.length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkOrders,
  getWorkOrderById,
  recordPayment,
  getStats,
  getCostsByDepartment,
  getCostsByVendor,
  getServiceBreakdown,
  exportWorkOrders
};
