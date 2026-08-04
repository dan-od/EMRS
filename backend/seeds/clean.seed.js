/**
 * Removes previously seeded rows so the seed is re-runnable.
 *
 * Scoped entirely by the markers in seedConfig — nothing here can reach a
 * row this seed did not create. Order matters: children whose FK is
 * NO ACTION / SET NULL must go before their parent, or the delete either
 * fails or silently orphans the child.
 */
const { SEED_TAG, SEED_KEY, JOB_PREFIX } = require('./seedConfig');
const { SEED_EMAIL_DOMAIN } = require('./users.seed');

/**
 * Removes the E2E users, falling back to deactivation.
 *
 * 84 tables reference users with ON DELETE NO ACTION, so any seed user that
 * created a row during a test run cannot be deleted. Each delete gets its own
 * savepoint: on a foreign-key violation the user is deactivated instead, which
 * keeps them out of the app without aborting the whole clean.
 */
const cleanUsers = async (client) => {
  const { rows } = await client.query(
    'SELECT email FROM users WHERE email LIKE $1', [`%@${SEED_EMAIL_DOMAIN}`]
  );
  let deleted = 0, deactivated = 0;

  for (const { email } of rows) {
    await client.query('SAVEPOINT del_seed_user');
    try {
      await client.query('DELETE FROM users WHERE email = $1', [email]);
      await client.query('RELEASE SAVEPOINT del_seed_user');
      deleted++;
    } catch {
      await client.query('ROLLBACK TO SAVEPOINT del_seed_user');
      await client.query('UPDATE users SET is_active = false WHERE email = $1', [email]);
      deactivated++;
    }
  }
  return { deleted, deactivated };
};

const clean = async (client) => {
  const seededJobs = `SELECT id FROM jobs WHERE job_number LIKE '${JOB_PREFIX}%'`;
  const seededRequests = `SELECT id FROM requests WHERE details->>'seedTag' = '${SEED_KEY}'`;

  // jobs children that do NOT cascade
  await client.query(`DELETE FROM job_equipment_history WHERE job_id IN (${seededJobs})`);
  await client.query(`DELETE FROM inventory_transactions WHERE job_id IN (${seededJobs})`);
  await client.query(`DELETE FROM field_reports WHERE job_id IN (${seededJobs})`);
  await client.query(`DELETE FROM jobs WHERE job_number LIKE $1`, [`${JOB_PREFIX}%`]);

  // work orders before requests: maintenance_schedule.request_id is SET NULL,
  // so deleting the request first would leave an orphaned seeded work order.
  const seededWorkOrders = `SELECT id FROM maintenance_schedule WHERE description LIKE '${SEED_TAG}%'`;
  await client.query(`DELETE FROM equipment_maintenance_log WHERE maintenance_id IN (${seededWorkOrders})`);
  await client.query(`DELETE FROM maintenance_schedule WHERE description LIKE $1`, [`${SEED_TAG}%`]);

  // requests children that do NOT cascade
  await client.query(`DELETE FROM disbursements WHERE request_id IN (${seededRequests})`);
  await client.query(`DELETE FROM inspection_failed_items WHERE maintenance_request_id IN (${seededRequests})`);
  await client.query(`DELETE FROM requests WHERE details->>'seedTag' = $1`, [SEED_KEY]);

  // Contains, not prefix: CreateSafetyReport derives the title as
  // "<Type> at <location>", so a report filed by the E2E suite carries the
  // marker mid-string rather than at the front.
  await client.query(`DELETE FROM safety_reports WHERE title LIKE $1`, [`%${SEED_TAG}%`]);

  // Users last — their content has to be gone before they can be removed.
  return cleanUsers(client);
};

module.exports = { clean };
