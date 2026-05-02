// Vehicles service
const { pool } = require('../../config/db');
const queries = require('./vehicles.queries');
const { logActivity } = require('../../utils/activityLogger');

/**
 * Get all vehicles with filters
 */
const getAll = async ({ status = null, type = null, limit = 50, offset = 0 } = {}) => {
  const client = await pool.connect();
  try {
    const [vehiclesResult, countResult] = await Promise.all([
      client.query(queries.findAll, [status, type, limit, offset]),
      client.query(queries.countAll, [status, type])
    ]);
    
    return {
      vehicles: vehiclesResult.rows,
      total: parseInt(countResult.rows[0].total)
    };
  } finally {
    client.release();
  }
};

/**
 * Get vehicle by ID
 */
const getById = async (id) => {
  const result = await pool.query(queries.findById, [id]);
  return result.rows[0] || null;
};

/**
 * Get available vehicles for assignment
 */
const getAvailable = async () => {
  const result = await pool.query(queries.findAvailable);
  return result.rows;
};

/**
 * Get all drivers (users with is_driver = true)
 */
const getDrivers = async () => {
  const result = await pool.query(queries.getDrivers);
  return result.rows;
};

/**
 * Create a new vehicle
 */
const create = async (data, userId) => {
  const { 
    plate_number, 
    make, 
    model, 
    year, 
    type, 
    fuel_type = 'Diesel',
    mileage = 0,
    assigned_driver_id = null,
    notes 
  } = data;
  
  const result = await pool.query(queries.create, [
    plate_number,
    make,
    model,
    year,
    type,
    fuel_type,
    mileage || 0,
    assigned_driver_id || null,
    notes || null
  ]);
  
  const vehicle = result.rows[0];
  
  // Re-fetch with joins to get driver name etc.
  const fullVehicle = await getById(vehicle.id);
  
  // Log activity
  await logActivity({
    userId,
    action: 'CREATE',
    entityType: 'vehicle',
    entityId: vehicle.id,
    details: { plate_number, make, model, type }
  });
  
  return fullVehicle;
};

/**
 * Update a vehicle
 */
const update = async (id, data, userId) => {
  const { 
    plate_number, 
    make, 
    model, 
    year, 
    type, 
    fuel_type,
    mileage,
    assigned_driver_id,
    status,
    notes 
  } = data;
  
  await pool.query(queries.update, [
    id,
    plate_number || null,
    make || null,
    model || null,
    year || null,
    type || null,
    fuel_type || null,
    mileage,
    assigned_driver_id,
    status || null,
    notes
  ]);
  
  // Re-fetch with joins
  const vehicle = await getById(id);
  
  if (vehicle) {
    await logActivity({
      userId,
      action: 'UPDATE',
      entityType: 'vehicle',
      entityId: id,
      details: { plate_number: vehicle.plate_number, changes: data }
    });
  }
  
  return vehicle;
};

/**
 * Update vehicle status
 */
const updateStatus = async (id, status, notes, userId) => {
  await pool.query(queries.updateStatus, [id, status]);
  
  // Re-fetch with joins
  const vehicle = await getById(id);
  
  if (vehicle) {
    await logActivity({
      userId,
      action: 'UPDATE',
      entityType: 'vehicle',
      entityId: id,
      details: { status, plate_number: vehicle.plate_number, notes }
    });
  }
  
  return vehicle;
};

/**
 * Soft delete a vehicle
 */
const remove = async (id, userId) => {
  const vehicle = await getById(id);
  
  if (!vehicle) return null;
  
  await pool.query(queries.softDelete, [id]);
  
  await logActivity({
    userId,
    action: 'DELETE',
    entityType: 'vehicle',
    entityId: id,
    details: { plate_number: vehicle.plate_number, make: vehicle.make, model: vehicle.model }
  });
  
  return vehicle;
};

// Export all functions (avoiding common mistake #14)
module.exports = {
  getAll,
  getById,
  getAvailable,
  getDrivers,
  create,
  update,
  updateStatus,
  remove
};
