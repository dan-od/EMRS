/**
 * Resolves existing users and equipment for the seed to reference.
 *
 * The seed deliberately reuses rows already in the database rather than
 * creating its own users/equipment: those tables hold real data and every
 * extra row would be one more thing to clean up.
 */

// Deterministic pick so re-runs reference the same rows.
const userByRole = async (client, role) => {
  const { rows } = await client.query(
    `SELECT id, first_name, last_name, department FROM users
     WHERE role = $1 AND is_active = true ORDER BY email LIMIT 1`,
    [role]
  );
  return rows[0] || null;
};

// One reporter per department, to exercise the Safety visibility question.
const usersAcrossDepartments = async (client, limit) => {
  const { rows } = await client.query(
    `SELECT DISTINCT ON (department) id, department FROM users
     WHERE is_active = true ORDER BY department, email LIMIT $1`,
    [limit]
  );
  return rows;
};

// Tops a team up with distinct users. job_team is UNIQUE (job_id, user_id),
// and this database has no Operator/Technician accounts, so role-based picks
// alone would collide on the same person.
const fillDistinctUsers = async (client, chosen, total) => {
  const ids = chosen.filter(Boolean).map((u) => u.id);
  if (ids.length >= total) return chosen.slice(0, total);

  const { rows } = await client.query(
    `SELECT id FROM users
     WHERE is_active = true AND NOT (id = ANY($1::uuid[]))
     ORDER BY email LIMIT $2`,
    [ids, total - ids.length]
  );
  return [...chosen.filter(Boolean), ...rows].slice(0, total);
};

const equipmentIds = async (client, limit) => {
  const { rows } = await client.query(
    `SELECT id, name FROM equipment ORDER BY created_at, id LIMIT $1`,
    [limit]
  );
  return rows;
};

// Throws rather than silently seeding half a fixture set.
const requireUser = (user, role) => {
  if (!user) throw new Error(`No active user with role ${role} — seed cannot continue`);
  return user;
};

module.exports = {
  userByRole, usersAcrossDepartments, fillDistinctUsers, equipmentIds, requireUser,
};
