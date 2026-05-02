// SQL queries for users module

const findAll = `
  SELECT id, email, first_name, last_name, role, department, 
         phone, is_active, created_at, updated_at
  FROM users
  WHERE ($1::text IS NULL OR $1::text = '' OR role::text = ANY(string_to_array($1, ',')))
    AND ($2::text IS NULL OR $2::text = '' OR department::text = $2)
    AND ($3::boolean IS NULL OR is_active = $3)
    AND ($4::text IS NULL OR $4::text = '' OR
         first_name ILIKE '%' || $4 || '%' OR 
         last_name ILIKE '%' || $4 || '%' OR
         email ILIKE '%' || $4 || '%')
  ORDER BY created_at DESC
  LIMIT $5 OFFSET $6
`;

const countAll = `
  SELECT COUNT(*) as total
  FROM users
  WHERE ($1::text IS NULL OR $1::text = '' OR role::text = ANY(string_to_array($1, ',')))
    AND ($2::text IS NULL OR $2::text = '' OR department::text = $2)
    AND ($3::boolean IS NULL OR is_active = $3)
    AND ($4::text IS NULL OR $4::text = '' OR
         first_name ILIKE '%' || $4 || '%' OR 
         last_name ILIKE '%' || $4 || '%' OR
         email ILIKE '%' || $4 || '%')
`;

const findById = `
  SELECT id, email, first_name, last_name, role, department,
         phone, is_active, created_at, updated_at
  FROM users WHERE id = $1
`;

const findByEmail = `
  SELECT * FROM users WHERE email = $1
`;

const create = `
  INSERT INTO users (email, password_hash, first_name, last_name, role, department, phone)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING id, email, first_name, last_name, role, department, phone, is_active, created_at
`;

const update = `
  UPDATE users 
  SET first_name = COALESCE($2, first_name),
      last_name = COALESCE($3, last_name),
      phone = COALESCE($4, phone),
      role = COALESCE($5, role),
      department = COALESCE($6, department),
      email = COALESCE($7, email),
      updated_at = NOW()
  WHERE id = $1
  RETURNING id, email, first_name, last_name, role, department, phone, is_active, updated_at
`;

const updatePassword = `
  UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1
`;

const toggleActive = `
  UPDATE users SET is_active = $2, updated_at = NOW() WHERE id = $1
  RETURNING id, email, first_name, last_name, is_active
`;

const deleteUser = `
  DELETE FROM users WHERE id = $1
`;

module.exports = {
  findAll,
  countAll,
  findById,
  findByEmail,
  create,
  update,
  updatePassword,
  toggleActive,
  deleteUser
};
