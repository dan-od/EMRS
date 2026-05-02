/**
 * Vendors Service
 * Business logic for vendor operations
 */

const { query } = require('../../config/db');
const vendorsQueries = require('./vendors.queries');

const getAll = async (filters = {}) => {
  const { status, category, search, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;
  
  let sql = vendorsQueries.getAll;
  const params = [];
  let idx = 1;
  const conditions = [];
  
  if (status) {
    conditions.push(`v.status = $${idx}`);
    params.push(status);
    idx++;
  }
  
  if (category) {
    conditions.push(`v.category = $${idx}`);
    params.push(category);
    idx++;
  }
  
  if (search) {
    conditions.push(`(v.name ILIKE $${idx} OR v.contact_email ILIKE $${idx})`);
    params.push(`%${search}%`);
    idx++;
  }
  
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  
  sql += ` ORDER BY v.name ASC LIMIT $${idx} OFFSET $${idx + 1}`;
  params.push(limit, offset);
  
  const result = await query(sql, params);
  
  // Get total count
  let countSql = 'SELECT COUNT(*) FROM vendors v';
  if (conditions.length > 0) {
    countSql += ' WHERE ' + conditions.join(' AND ');
  }
  const countResult = await query(countSql, params.slice(0, -2));
  
  return {
    data: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].count),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    }
  };
};

const getById = async (id) => {
  const result = await query(vendorsQueries.getById, [id]);
  return result.rows[0];
};

const getActive = async (category = null) => {
  if (category) {
    const result = await query(vendorsQueries.getActiveByCategory, [category]);
    return result.rows;
  }
  const result = await query(vendorsQueries.getActive);
  return result.rows;
};

const getByCategory = async (category) => {
  const result = await query(vendorsQueries.getByCategory, [category]);
  return result.rows;
};

const search = async (searchTerm) => {
  const result = await query(vendorsQueries.search, [`%${searchTerm}%`]);
  return result.rows;
};

const create = async (data) => {
  const {
    name, category, contact_person, 
    contact_email, email,  // Accept both
    contact_phone, phone,  // Accept both
    address, city, state, country, postal_code,
    tax_id, payment_terms, notes, created_by
  } = data;
  
  const result = await query(vendorsQueries.create, [
    name, 
    category, 
    contact_person, 
    contact_email || email || null,  // Use whichever is provided
    contact_phone || phone || null,  // Use whichever is provided
    address, city, state, country, postal_code,
    tax_id, payment_terms || 'Net 30', notes, created_by
  ]);
  
  return getById(result.rows[0].id);
};

const update = async (id, data) => {
  const existing = await getById(id);
  if (!existing) return null;
  
  const {
    name, category, contact_person, 
    contact_email, email,  // Accept both
    contact_phone, phone,  // Accept both
    address, city, state, country, postal_code,
    tax_id, payment_terms, notes
  } = data;
  
  await query(vendorsQueries.update, [
    name || existing.name,
    category || existing.category,
    contact_person || existing.contact_person,
    contact_email || email || existing.contact_email,
    contact_phone || phone || existing.contact_phone,
    address || existing.address,
    city || existing.city,
    state || existing.state,
    country || existing.country,
    postal_code || existing.postal_code,
    tax_id || existing.tax_id,
    payment_terms || existing.payment_terms,
    notes ?? existing.notes,
    id
  ]);
  
  return getById(id);
};

const toggleActive = async (id, isActive) => {
  const status = isActive ? 'Active' : 'Inactive';
  await query(vendorsQueries.toggleActive, [status, id]);
  return getById(id);
};

const updateRating = async (id, rating, review, userId) => {
  // Add to vendor reviews
  await query(vendorsQueries.addReview, [id, rating, review, userId]);
  
  // Update average rating
  const avgResult = await query(
    'SELECT AVG(rating)::numeric(3,2) as avg_rating FROM vendor_reviews WHERE vendor_id = $1',
    [id]
  );
  
  await query(
    'UPDATE vendors SET rating = $1, updated_at = NOW() WHERE id = $2',
    [avgResult.rows[0].avg_rating, id]
  );
  
  return getById(id);
};

const getPurchaseHistory = async (vendorId, filters = {}) => {
  const { page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;
  
  const result = await query(vendorsQueries.getPurchaseHistory, [vendorId, limit, offset]);
  return result.rows;
};

const getStats = async () => {
  const result = await query(vendorsQueries.getStats);
  return result.rows[0];
};

const getCategories = async () => {
  const result = await query(vendorsQueries.getCategories);
  return result.rows.map(r => r.category);
};

const remove = async (id) => {
  await query(vendorsQueries.remove, [id]);
};

module.exports = {
  getAll, getById, getActive, getByCategory, search,
  create, update, toggleActive, updateRating,
  getPurchaseHistory, getStats, getCategories, remove
};
