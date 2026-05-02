const bcrypt = require('bcryptjs');
const { query } = require('../../config/db');
const queries = require('./users.queries');

const getAll = async (filters = {}) => {
  const { role, department, isActive, status, search, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  let activeFilter = isActive;
  if (status === 'Active') activeFilter = true;
  if (status === 'Inactive') activeFilter = false;

  const [usersResult, countResult] = await Promise.all([
    query(queries.findAll, [role, department, activeFilter, search, limit, offset]),
    query(queries.countAll, [role, department, activeFilter, search])
  ]);

  return {
    users: usersResult.rows,
    total: parseInt(countResult.rows[0].total),
    page,
    totalPages: Math.ceil(countResult.rows[0].total / limit)
  };
};

const getById = async (id) => {
  const result = await query(queries.findById, [id]);
  return result.rows[0] || null;
};

const getByEmail = async (email) => {
  const result = await query(queries.findByEmail, [email.toLowerCase()]);
  return result.rows[0] || null;
};

const create = async (userData) => {
  const { email, password, firstName, lastName, role, department, phone } = userData;
  const passwordHash = await bcrypt.hash(password, 12);
  
  const result = await query(queries.create, [
    email.toLowerCase(), passwordHash, firstName, lastName, role, department, phone
  ]);
  return result.rows[0];
};

const update = async (id, userData) => {
  const { firstName, lastName, phone, role, department, email } = userData;
  const emailLower = email ? email.toLowerCase() : null;
  const result = await query(queries.update, [
    id, firstName, lastName, phone, role, department, emailLower
  ]);
  return result.rows[0];
};

const updatePassword = async (id, newPassword) => {
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await query(queries.updatePassword, [id, passwordHash]);
};

const toggleActive = async (id, isActive) => {
  const result = await query(queries.toggleActive, [id, isActive]);
  return result.rows[0];
};

const remove = async (id) => {
  await query(queries.deleteUser, [id]);
};

module.exports = { getAll, getById, getByEmail, create, update, updatePassword, toggleActive, remove };
