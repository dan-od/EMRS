/**
 * Known-credential users for the Playwright suite.
 *
 * Deliberately unmistakable for real staff: every address is on the
 * reserved-for-testing `.test` TLD, the display name is literally
 * "Seed <Role>", and employee_id carries a SEED- prefix. Removed by email
 * domain, so cleanup cannot touch a genuine account.
 *
 * must_change_password is false — ProtectedRoute redirects to
 * /change-password otherwise and every test would land on the wrong page.
 */
const bcrypt = require('bcryptjs');

const SEED_EMAIL_DOMAIN = 'seed.emrs.test';
// Local fixtures only; these accounts exist solely on a developer machine.
const SEED_PASSWORD = 'SeedTest123!';

// [key, role, department]
const E2E_USERS = [
  ['super_admin', 'Super_Admin', 'IT'],
  ['admin', 'Admin', 'IT'],
  ['safety_manager', 'Safety_Manager', 'Safety'],
  ['maintenance_manager', 'Maintenance_Manager', 'Maintenance'],
  ['purchasing_manager', 'Purchasing_Manager', 'Purchasing'],
  ['field_engineer', 'Field_Engineer', 'Operations'],
  // The local database has no Operator or Technician accounts at all.
  ['operator', 'Operator', 'Operations'],
  ['technician', 'Technician', 'Maintenance'],
];

const emailFor = (key) => `${key.replace(/_/g, '.')}@${SEED_EMAIL_DOMAIN}`;

const seedUsers = async (client) => {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  for (const [key, role, department] of E2E_USERS) {
    // Upsert: 84 tables reference users with NO ACTION, so a seed user that
    // has created anything cannot be deleted and will still be here on re-run.
    await client.query(
      `INSERT INTO users
         (email, password_hash, first_name, last_name, role, department,
          employee_id, is_active, must_change_password)
       VALUES ($1,$2,'Seed',$3,$4,$5,$6,true,false)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role,
         department = EXCLUDED.department,
         is_active = true,
         must_change_password = false`,
      [
        emailFor(key),
        passwordHash,
        role.replace(/_/g, ' '),
        role,
        department,
        `SEED-${role.toUpperCase()}`,
      ]
    );
  }

  return E2E_USERS.length;
};

module.exports = { seedUsers, E2E_USERS, SEED_PASSWORD, SEED_EMAIL_DOMAIN, emailFor };
