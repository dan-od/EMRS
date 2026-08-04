/**
 * Removes previously seeded rows so the seed is re-runnable.
 *
 * Scoped entirely by the markers in seedConfig — nothing here can reach a
 * row this seed did not create. Order matters: children whose FK is
 * NO ACTION / SET NULL must go before their parent, or the delete either
 * fails or silently orphans the child.
 */
const { SEED_TAG, SEED_KEY, JOB_PREFIX } = require('./seedConfig');

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

  await client.query(`DELETE FROM safety_reports WHERE title LIKE $1`, [`${SEED_TAG}%`]);
};

module.exports = { clean };
