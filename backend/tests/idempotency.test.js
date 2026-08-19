import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import db from '../src/config/db.js';
import disburseService from '../src/modules/requests/services/disburse.service.js';
import vendorsService from '../src/modules/vendors/vendors.service.js';
import extensionQueries from '../src/modules/extensions/services/queries.js';
import returnConfirmService from '../src/modules/requests/services/return-confirm.service.js';

const { pool, query } = db;
const TAG = '[TEST-idempotency]';

/**
 * Fires each protected mutation twice and asserts the end state matches
 * firing it once. This is the failure mode from the two-session run: the
 * request reaches the server and commits, the response never arrives, and
 * the user taps again.
 */

let purchaser, requester, inventoryId, createdRequests = [];

const makeInventoryItem = async (qty) => {
  const { rows } = await query(
    `INSERT INTO inventory (name, category, quantity, unit, reorder_level, location)
     VALUES ($1,'Consumables',$2,'pieces',1,'Test Store') RETURNING id`,
    [`${TAG} widget`, qty]
  );
  return rows[0].id;
};

const makeApprovedRequest = async () => {
  const { rows } = await query(
    `INSERT INTO requests (requester_id, type, status, priority, details)
     VALUES ($1,'Material','Approved','Medium',$2::jsonb) RETURNING id`,
    [requester.id, JSON.stringify({ seedTag: 'BUILD-PASS-1', purpose: `${TAG} fixture` })]
  );
  createdRequests.push(rows[0].id);
  return rows[0].id;
};

const stockOf = async (id) =>
  Number((await query('SELECT quantity FROM inventory WHERE id = $1', [id])).rows[0].quantity);

beforeAll(async () => {
  purchaser = (await query("SELECT id, first_name FROM users WHERE role = 'Purchasing_Manager' LIMIT 1")).rows[0];
  requester = (await query("SELECT id FROM users WHERE role = 'Field_Engineer' LIMIT 1")).rows[0];
  expect(purchaser && requester, 'need a Purchasing_Manager and a Field_Engineer').toBeTruthy();
  inventoryId = await makeInventoryItem(100);
});

afterAll(async () => {
  if (createdRequests.length) {
    await query('DELETE FROM request_history WHERE request_id = ANY($1::uuid[])', [createdRequests]);
    await query('DELETE FROM requests WHERE id = ANY($1::uuid[])', [createdRequests]);
  }
  await query('DELETE FROM inventory_transactions WHERE inventory_id = $1', [inventoryId]);
  await query('DELETE FROM stock_movements WHERE inventory_id = $1', [inventoryId]).catch(() => {});
  await query('DELETE FROM inventory WHERE name LIKE $1', [`${TAG}%`]);
  await pool.end();
});

describe('POST /requests/:id/disburse — replayed', () => {
  it('decrements stock once, not twice', async () => {
    const requestId = await makeApprovedRequest();
    const before = await stockOf(inventoryId);
    const links = [{ inventoryId, quantity: 5 }];

    const first = await disburseService.disburse(requestId, purchaser.id, 'Test Purchaser', { notes: 'first', inventoryLinks: links });
    const afterFirst = await stockOf(inventoryId);
    expect(afterFirst).toBe(before - 5);

    // The replay: same call, as a retry would send it.
    const second = await disburseService.disburse(requestId, purchaser.id, 'Test Purchaser', { notes: 'first', inventoryLinks: links });
    const afterSecond = await stockOf(inventoryId);

    expect(afterSecond, 'stock must not move on the replay').toBe(afterFirst);
    expect(second.id, 'replay must return the original request').toBe(first.id);
    expect(second.status).toBe('Disbursed');
  });

  it('returns the original result rather than an error', async () => {
    const requestId = await makeApprovedRequest();
    await disburseService.disburse(requestId, purchaser.id, 'Test Purchaser', { notes: 'x', inventoryLinks: [] });
    // Must not throw — the user retried because they saw nothing.
    await expect(
      disburseService.disburse(requestId, purchaser.id, 'Test Purchaser', { notes: 'x', inventoryLinks: [] })
    ).resolves.toMatchObject({ id: requestId, status: 'Disbursed' });
  });

  it('does not double-decrement even with withoutApproval, which skips the status check', async () => {
    const requestId = await makeApprovedRequest();
    const links = [{ inventoryId, quantity: 3 }];
    await disburseService.disburse(requestId, purchaser.id, 'T', { inventoryLinks: links, withoutApproval: true });
    const afterFirst = await stockOf(inventoryId);
    await disburseService.disburse(requestId, purchaser.id, 'T', { inventoryLinks: links, withoutApproval: true });
    expect(await stockOf(inventoryId)).toBe(afterFirst);
  });
});

describe('POST /requests/:id/confirm-return — replayed', () => {
  it('restores stock once and returns the original result', async () => {
    const requestId = await makeApprovedRequest();
    const links = [{ inventoryId, quantity: 4 }];
    await disburseService.disburse(requestId, purchaser.id, 'T', {
      inventoryLinks: links, expectedReturnDate: '2030-01-01',
    });
    const afterDisburse = await stockOf(inventoryId);

    const first = await returnConfirmService.confirmReturn(requestId, purchaser.id, 'T', { notes: 'ok', verifiedItems: [] });
    const afterFirst = await stockOf(inventoryId);

    const second = await returnConfirmService.confirmReturn(requestId, purchaser.id, 'T', { notes: 'ok', verifiedItems: [] });
    expect(await stockOf(inventoryId), 'stock must not move on the replay').toBe(afterFirst);
    expect(second.id).toBe(first.id);
    expect(afterFirst).toBeGreaterThanOrEqual(afterDisburse);
  });
});

describe('one work order per request', () => {
  it('is enforced by the database, not just the application', async () => {
    const wo = (await query('SELECT request_id FROM maintenance_schedule WHERE request_id IS NOT NULL LIMIT 1')).rows[0];
    expect(wo, 'need a seeded work order linked to a request').toBeTruthy();

    await expect(query(
      `INSERT INTO maintenance_schedule (equipment_id, maintenance_type, description, scheduled_date, request_id, created_from)
       SELECT equipment_id, 'Repair', $1, CURRENT_DATE, request_id, 'request'
       FROM maintenance_schedule WHERE request_id = $2 LIMIT 1`,
      [`${TAG} duplicate work order`, wo.request_id]
    )).rejects.toThrow(/uniq_maintenance_schedule_request|duplicate key/i);
  });
});

describe('POST /vendors/:id/rating - replayed', () => {
  it('records one review, not two, and keeps the average honest', async () => {
    const vendor = (await query('SELECT id FROM vendors LIMIT 1')).rows[0];
    if (!vendor) return; // no vendors seeded on this machine
    const reviewer = purchaser;
    await query('DELETE FROM vendor_reviews WHERE vendor_id = $1 AND reviewed_by = $2', [vendor.id, reviewer.id]);

    await vendorsService.updateRating(vendor.id, 4, `${TAG} review`, reviewer.id);
    await vendorsService.updateRating(vendor.id, 4, `${TAG} review`, reviewer.id);

    const count = Number((await query(
      'SELECT count(*) c FROM vendor_reviews WHERE vendor_id = $1 AND reviewed_by = $2',
      [vendor.id, reviewer.id]
    )).rows[0].c);
    expect(count, 'a replayed rating must not add a second review').toBe(1);

    // A genuine revision still lands, rather than being silently dropped.
    await vendorsService.updateRating(vendor.id, 2, `${TAG} revised`, reviewer.id);
    const row = (await query(
      'SELECT rating FROM vendor_reviews WHERE vendor_id = $1 AND reviewed_by = $2',
      [vendor.id, reviewer.id]
    )).rows[0];
    expect(Number(row.rating)).toBe(2);

    await query('DELETE FROM vendor_reviews WHERE vendor_id = $1 AND reviewed_by = $2', [vendor.id, reviewer.id]);
  });
});

describe('POST /extensions - replayed', () => {
  it('keeps one pending extension per request line and can return the original', async () => {
    const requestId = await makeApprovedRequest();
    const params = [requestId, 0, 'widget', '2030-01-01', '2030-02-01', `${TAG} reason`, requester.id];

    const first = await query(extensionQueries.create, params);
    expect(first.rows[0], 'first insert should create the extension').toBeTruthy();

    // The replay: ON CONFLICT DO NOTHING returns no rows.
    const second = await query(extensionQueries.create, params);
    expect(second.rows[0], 'replay must not insert a second pending extension').toBeUndefined();

    // ...and the caller can hand back what the first call created.
    const existing = await query(extensionQueries.findPendingForLine, [requestId, 0]);
    expect(existing.rows[0].id).toBe(first.rows[0].id);

    const count = Number((await query(
      "SELECT count(*) c FROM return_extensions WHERE request_id = $1 AND status = 'Pending'", [requestId]
    )).rows[0].c);
    expect(count).toBe(1);

    await query('DELETE FROM return_extensions WHERE request_id = $1', [requestId]);
  });
});
