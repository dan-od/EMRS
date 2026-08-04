import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import db from '../src/config/db.js';
import equipmentCtrl from '../src/modules/jobs/controllers/equipment.controller.js';

const { pool, query } = db;
const PROBE = '[TEST] activity log probe';

/**
 * Covers the duplicate-logging fix on the Jobs equipment actions.
 *
 * Two things must hold, and both were broken before:
 *   1. exactly one activity_log row per action (controller AND service both
 *      logged, so every event wrote two rows with different shapes)
 *   2. that row carries entity_type / entity_id / entity_name — the service
 *      passed resourceType/resourceId, which logActivity ignores, so the
 *      surviving row would otherwise have null linkage. E3-008's export
 *      reads these columns.
 */

const noopRes = () => ({ json: () => {}, status() { return this; }, send: () => {} });
const rethrow = (e) => { throw e; };
const countLogs = async () => Number((await query('SELECT count(*) c FROM activity_logs')).rows[0].c);

let job, user, itemId;

const makeItem = async (status) => {
  const { rows } = await query(
    `INSERT INTO job_equipment_items (job_id, source, status, requested_item_name, quantity)
     VALUES ($1,'NEW_REQUEST',$2,$3,1) RETURNING id`,
    [job.id, status, PROBE]
  );
  return rows[0].id;
};

beforeAll(async () => {
  job = (await query(
    `SELECT id, job_number FROM jobs WHERE job_number LIKE 'SEED-JOB-%' ORDER BY job_number LIMIT 1`
  )).rows[0];
  user = (await query(
    `SELECT id, email, role, department, first_name, last_name FROM users WHERE is_active LIMIT 1`
  )).rows[0];
  // Seed fixtures come from `node seeds/index.js`.
  expect(job, 'no SEED-JOB-* rows found — run the seed first').toBeTruthy();
});

afterAll(async () => {
  await query(`DELETE FROM activity_logs WHERE details->>'itemId' IN
    (SELECT id::text FROM job_equipment_items WHERE requested_item_name = $1)`, [PROBE]);
  await query(`DELETE FROM job_equipment_history WHERE job_equipment_item_id IN
    (SELECT id FROM job_equipment_items WHERE requested_item_name = $1)`, [PROBE]);
  await query('DELETE FROM job_equipment_items WHERE requested_item_name = $1', [PROBE]);
  await pool.end();
});

const rowsFor = async (id) => (await query(
  `SELECT action, entity_type, entity_id, entity_name, details->>'itemId' item_id
   FROM activity_logs WHERE details->>'itemId' = $1`, [id]
)).rows;

describe('jobs equipment activity logging', () => {
  it('writes exactly one row for startSourcing, with full entity linkage', async () => {
    itemId = await makeItem('REQUESTED');
    const before = await countLogs();

    await equipmentCtrl.startSourcing(
      { params: { itemId }, body: { notes: 'probe', estimated_arrival: null }, user },
      noopRes(), rethrow
    );

    expect(await countLogs() - before).toBe(1);
    const [row] = await rowsFor(itemId);
    expect(row).toMatchObject({ action: 'EQUIPMENT_SOURCING_STARTED', entity_type: 'JOB' });
    expect(row.entity_id).toBe(job.id);
    expect(row.entity_name).toBe(job.job_number);
  });

  it('writes exactly one row for itemArrived, with full entity linkage', async () => {
    const before = await countLogs();

    await equipmentCtrl.itemArrived(
      { params: { itemId }, body: { linked_inventory_id: null, vendor_name: 'V',
        purchase_order_number: 'PO-1', procurement_cost: 10 }, user },
      noopRes(), rethrow
    );

    expect(await countLogs() - before).toBe(1);
    const arrived = (await rowsFor(itemId)).find((r) => r.action === 'EQUIPMENT_ARRIVED');
    expect(arrived).toBeTruthy();
    expect(arrived.entity_type).toBe('JOB');
    expect(arrived.entity_id).toBe(job.id);
  });

  it('writes exactly one row for disburseArrived, with full entity linkage', async () => {
    const before = await countLogs();

    await equipmentCtrl.disburseArrived(
      { params: { itemId }, body: { notes: 'probe' }, user }, noopRes(), rethrow
    );

    expect(await countLogs() - before).toBe(1);
    const disbursed = (await rowsFor(itemId)).find((r) => r.action === 'ARRIVED_EQUIPMENT_DISBURSED');
    expect(disbursed).toBeTruthy();
    expect(disbursed.entity_type).toBe('JOB');
    expect(disbursed.entity_name).toBe(job.job_number);
  });

  it('leaves no row with null entity linkage', async () => {
    // The regression that mattered: one row, but anonymous, so the audit
    // trail could no longer be filtered or grouped by entity.
    for (const row of await rowsFor(itemId)) {
      expect(row.entity_type, `${row.action} has null entity_type`).not.toBeNull();
      expect(row.entity_id, `${row.action} has null entity_id`).not.toBeNull();
      expect(row.entity_name, `${row.action} has null entity_name`).not.toBeNull();
    }
  });
});
