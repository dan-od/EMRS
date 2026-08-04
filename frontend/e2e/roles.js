/**
 * Credentials for the seeded E2E users.
 *
 * Must match backend/seeds/users.seed.js. These accounts only exist after
 * `node seeds/index.js` has been run against a local database.
 */
export const SEED_PASSWORD = 'SeedTest123!';
export const SEED_EMAIL_DOMAIN = 'seed.emrs.test';

export const ROLES = {
  super_admin: 'super.admin',
  admin: 'admin',
  safety_manager: 'safety.manager',
  maintenance_manager: 'maintenance.manager',
  purchasing_manager: 'purchasing.manager',
  field_engineer: 'field.engineer',
};

export const emailFor = (role) => `${ROLES[role]}@${SEED_EMAIL_DOMAIN}`;
export const storageStateFor = (role) => `e2e/.auth/${role}.json`;

// Anything these tests create is prefixed so the seed's cleanup removes it.
export const E2E_TAG = '[SEED] E2E';
