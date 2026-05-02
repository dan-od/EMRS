// SQL queries for notifications module

const findByUser = `
  SELECT * FROM notifications
  WHERE user_id = $1
  ORDER BY created_at DESC
  LIMIT $2 OFFSET $3
`;

const countByUser = `
  SELECT COUNT(*) as total FROM notifications
  WHERE user_id = $1
`;

const countUnread = `
  SELECT COUNT(*) as count FROM notifications
  WHERE user_id = $1 AND is_read = false
`;

const findById = `
  SELECT * FROM notifications WHERE id = $1
`;

const create = `
  INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id, priority)
  VALUES ($1, $2::notification_type, $3, $4, $5, $6, $7)
  RETURNING *
`;

const createBulk = `
  INSERT INTO notifications (user_id, type, title, message, reference_type, reference_id, priority)
  SELECT unnest($1::uuid[]), $2::notification_type, $3, $4, $5, $6, $7
  RETURNING *
`;

const markAsRead = `
  UPDATE notifications
  SET is_read = true, read_at = NOW()
  WHERE id = $1 AND user_id = $2
  RETURNING *
`;

const markAllAsRead = `
  UPDATE notifications
  SET is_read = true, read_at = NOW()
  WHERE user_id = $1 AND is_read = false
  RETURNING *
`;

const deleteOld = `
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days' AND is_read = true
`;

// Get users by role for bulk notifications
const getUsersByRole = `
  SELECT id FROM users WHERE role = ANY($1::text[]) AND is_active = true
`;

// Get users by department
const getUsersByDepartment = `
  SELECT id FROM users WHERE department = $1 AND is_active = true
`;

// Get purchasing department users
const getPurchasingUsers = `
  SELECT id FROM users 
  WHERE (role = 'Purchasing_Manager' OR role = 'Purchasing_Staff')
  AND is_active = true
`;

// Get super admins and admins
const getAdminUsers = `
  SELECT id FROM users 
  WHERE role IN ('Super_Admin', 'Admin')
  AND is_active = true
`;

module.exports = {
  findByUser,
  countByUser,
  countUnread,
  findById,
  create,
  createBulk,
  markAsRead,
  markAllAsRead,
  deleteOld,
  getUsersByRole,
  getUsersByDepartment,
  getPurchasingUsers,
  getAdminUsers
};
