// SQL queries for vehicles module

const findAll = `
  SELECT v.*, 
    vd.name as vendor_name,
    d.first_name || ' ' || d.last_name as assigned_driver_name
  FROM vehicles v
  LEFT JOIN vendors vd ON v.vendor_id = vd.id
  LEFT JOIN users d ON v.assigned_driver_id = d.id
  WHERE v.is_active = true
    AND ($1::text IS NULL OR $1::text = '' OR v.status::text = $1)
    AND ($2::text IS NULL OR $2::text = '' OR v.type ILIKE '%' || $2 || '%')
  ORDER BY v.plate_number ASC
  LIMIT $3 OFFSET $4
`;

const countAll = `
  SELECT COUNT(*) as total FROM vehicles v
  WHERE v.is_active = true
    AND ($1::text IS NULL OR $1::text = '' OR v.status::text = $1)
    AND ($2::text IS NULL OR $2::text = '' OR v.type ILIKE '%' || $2 || '%')
`;

const findById = `
  SELECT v.*, 
    vd.name as vendor_name,
    d.first_name || ' ' || d.last_name as assigned_driver_name
  FROM vehicles v
  LEFT JOIN vendors vd ON v.vendor_id = vd.id
  LEFT JOIN users d ON v.assigned_driver_id = d.id
  WHERE v.id = $1
`;

const findAvailable = `
  SELECT v.*, 
    d.first_name || ' ' || d.last_name as assigned_driver_name
  FROM vehicles v
  LEFT JOIN users d ON v.assigned_driver_id = d.id
  WHERE v.is_active = true AND v.status = 'Available'
  ORDER BY v.plate_number ASC
`;

const create = `
  INSERT INTO vehicles (name, plate_number, make, model, year, type, fuel_type, mileage, assigned_driver_id, notes)
  VALUES ($2 || ' ' || $3, $1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING *
`;

const update = `
  UPDATE vehicles SET
    plate_number = COALESCE($2, plate_number),
    make = COALESCE($3, make),
    model = COALESCE($4, model),
    year = COALESCE($5, year),
    type = COALESCE($6, type),
    fuel_type = COALESCE($7, fuel_type),
    mileage = COALESCE($8, mileage),
    assigned_driver_id = $9,
    status = COALESCE($10::vehicle_status, status),
    notes = COALESCE($11, notes),
    updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

const updateStatus = `
  UPDATE vehicles SET status = $2::vehicle_status, updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

const softDelete = `
  UPDATE vehicles SET is_active = false, updated_at = NOW()
  WHERE id = $1
  RETURNING *
`;

// Get drivers (users with is_driver = true)
const getDrivers = `
  SELECT id, first_name, last_name, email, department
  FROM users
  WHERE is_driver = true AND is_active = true
  ORDER BY first_name, last_name
`;

module.exports = {
  findAll,
  countAll,
  findById,
  findAvailable,
  create,
  update,
  updateStatus,
  softDelete,
  getDrivers
};
