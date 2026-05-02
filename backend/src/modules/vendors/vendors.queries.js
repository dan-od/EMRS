/**
 * Vendors SQL Queries
 */

module.exports = {
  getAll: `
    SELECT 
      v.*,
      u.first_name || ' ' || u.last_name as created_by_name,
      (SELECT COUNT(*) FROM purchase_orders WHERE vendor_id = v.id) as order_count,
      (SELECT COALESCE(SUM(total_amount), 0) FROM purchase_orders WHERE vendor_id = v.id) as total_spend
    FROM vendors v
    LEFT JOIN users u ON v.created_by = u.id
  `,
  
  getById: `
    SELECT 
      v.*,
      u.first_name || ' ' || u.last_name as created_by_name,
      (SELECT COUNT(*) FROM purchase_orders WHERE vendor_id = v.id) as order_count,
      (SELECT COALESCE(SUM(total_amount), 0) FROM purchase_orders WHERE vendor_id = v.id) as total_spend,
      (SELECT COUNT(*) FROM vendor_reviews WHERE vendor_id = v.id) as review_count
    FROM vendors v
    LEFT JOIN users u ON v.created_by = u.id
    WHERE v.id = $1
  `,
  
  getActive: `
    SELECT id, name, category, contact_email, rating
    FROM vendors
    WHERE status = 'Active'
    ORDER BY name ASC
  `,
  
  getActiveByCategory: `
    SELECT id, name, category, contact_email, rating
    FROM vendors
    WHERE status = 'Active' AND category = $1
    ORDER BY rating DESC NULLS LAST, name ASC
  `,
  
  getByCategory: `
    SELECT *
    FROM vendors
    WHERE category = $1
    ORDER BY name ASC
  `,
  
  search: `
    SELECT id, name, category, contact_email, contact_phone, status, rating
    FROM vendors
    WHERE name ILIKE $1 OR contact_email ILIKE $1 OR contact_person ILIKE $1
    ORDER BY name ASC
    LIMIT 20
  `,
  
  create: `
    INSERT INTO vendors (
      name, category, contact_person, contact_email, contact_phone,
      address, city, state, country, postal_code,
      tax_id, payment_terms, notes, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING id
  `,
  
  update: `
    UPDATE vendors SET
      name = $1,
      category = $2,
      contact_person = $3,
      contact_email = $4,
      contact_phone = $5,
      address = $6,
      city = $7,
      state = $8,
      country = $9,
      postal_code = $10,
      tax_id = $11,
      payment_terms = $12,
      notes = $13,
      updated_at = NOW()
    WHERE id = $14
  `,
  
  toggleActive: `
    UPDATE vendors SET
      status = $1,
      updated_at = NOW()
    WHERE id = $2
  `,
  
  addReview: `
    INSERT INTO vendor_reviews (vendor_id, rating, review, reviewed_by)
    VALUES ($1, $2, $3, $4)
  `,
  
  getPurchaseHistory: `
    SELECT 
      po.*,
      u.first_name || ' ' || u.last_name as created_by_name
    FROM purchase_orders po
    LEFT JOIN users u ON po.created_by = u.id
    WHERE po.vendor_id = $1
    ORDER BY po.created_at DESC
    LIMIT $2 OFFSET $3
  `,
  
  getStats: `
    SELECT
      COUNT(*) as total_vendors,
      COUNT(*) FILTER (WHERE status = 'Active') as active_vendors,
      COUNT(*) FILTER (WHERE status = 'Inactive') as inactive_vendors,
      COUNT(DISTINCT category) as categories,
      AVG(rating)::numeric(3,2) as average_rating
    FROM vendors
  `,
  
  getCategories: `
    SELECT DISTINCT category
    FROM vendors
    WHERE category IS NOT NULL
    ORDER BY category ASC
  `,
  
  remove: `
    UPDATE vendors SET
      status = 'Deleted',
      deleted_at = NOW()
    WHERE id = $1
  `
};
