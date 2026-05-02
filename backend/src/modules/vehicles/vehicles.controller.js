// Vehicles controller
const vehiclesService = require('./vehicles.service');

/**
 * Get all vehicles
 * GET /vehicles
 */
const getAll = async (req, res, next) => {
  try {
    const { status, type, limit = 50, offset = 0 } = req.query;
    
    const result = await vehiclesService.getAll({
      status: status || null,
      type: type || null,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      success: true,
      data: result.vehicles,
      pagination: {
        total: result.total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available vehicles
 * GET /vehicles/available
 */
const getAvailable = async (req, res, next) => {
  try {
    const vehicles = await vehiclesService.getAvailable();
    
    res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all drivers
 * GET /vehicles/drivers
 */
const getDrivers = async (req, res, next) => {
  try {
    const drivers = await vehiclesService.getDrivers();
    
    res.json({
      success: true,
      data: drivers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vehicle by ID
 * GET /vehicles/:id
 */
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicle = await vehiclesService.getById(id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a vehicle
 * POST /vehicles
 */
const create = async (req, res, next) => {
  try {
    const vehicle = await vehiclesService.create(req.body, req.user.id);
    
    res.status(201).json({
      success: true,
      data: vehicle,
      message: 'Vehicle created successfully'
    });
  } catch (error) {
    // Handle unique constraint error for plate_number
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'A vehicle with this plate number already exists'
      });
    }
    next(error);
  }
};

/**
 * Update a vehicle
 * PATCH /vehicles/:id
 */
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicle = await vehiclesService.update(id, req.body, req.user.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    res.json({
      success: true,
      data: vehicle,
      message: 'Vehicle updated successfully'
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'A vehicle with this plate number already exists'
      });
    }
    next(error);
  }
};

/**
 * Update vehicle status
 * PATCH /vehicles/:id/status
 */
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const vehicle = await vehiclesService.updateStatus(id, status, notes, req.user.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    res.json({
      success: true,
      data: vehicle,
      message: 'Vehicle status updated'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a vehicle (soft delete)
 * DELETE /vehicles/:id
 */
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicle = await vehiclesService.remove(id, req.user.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Export all functions (avoiding common mistake #14)
module.exports = {
  getAll,
  getAvailable,
  getDrivers,
  getById,
  create,
  update,
  updateStatus,
  remove
};
