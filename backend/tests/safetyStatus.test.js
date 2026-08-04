import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import db from '../src/config/db.js';
import safetyQueries from '../src/modules/safety/safety.queries.js';

const { pool, query } = db;
const TEST_TAG = '[TEST-safety-status]';

/**
 * Covers the "Mark Resolved" bug: the button wrote 'Closed', but resolved_at
 * and the stats query's resolved_count both key off 'Resolved', so the
 * Resolved stat card was structurally unreachable through the UI.
 *
 * These assert the query semantics the fix depends on. That the button sends
 * 'Resolved' is covered by the Playwright suite, which actually clicks it.
 */

const createReport = async (status = 'Open') => {
  const { rows } = await query(
    `INSERT INTO safety_reports (type, severity, status, title, description, location)
     VALUES ('Hazard','Medium',$1,$2,'fixture','Test Site') RETURNING id`,
    [status, `${TEST_TAG} fixture`]
  );
  return rows[0].id;
};

describe('safety status transitions', () => {
  const created = [];

  afterAll(async () => {
    if (created.length) {
      await query('DELETE FROM safety_report_history WHERE report_id = ANY($1::uuid[])', [created]);
      await query('DELETE FROM safety_reports WHERE id = ANY($1::uuid[])', [created]);
    }
    await pool.end();
  });

  const track = async (status) => { const id = await createReport(status); created.push(id); return id; };

  it("stamps resolved_at when status becomes 'Resolved'", async () => {
    const id = await track('In_Progress');
    const { rows } = await query(safetyQueries.updateStatus, [id, 'Resolved', null, 'done']);
    expect(rows[0].status).toBe('Resolved');
    expect(rows[0].resolved_at).not.toBeNull();
  });

  it("does NOT stamp resolved_at for 'Closed' — the bug the fix avoids", async () => {
    const id = await track('In_Progress');
    const { rows } = await query(safetyQueries.updateStatus, [id, 'Closed', null, null]);
    expect(rows[0].status).toBe('Closed');
    expect(rows[0].resolved_at).toBeNull();
  });

  it("counts only 'Resolved' toward resolved_count, never 'Closed'", async () => {
    const before = Number((await query(safetyQueries.getStats)).rows[0].resolved_count);

    const closed = await track('In_Progress');
    await query(safetyQueries.updateStatus, [closed, 'Closed', null, null]);
    const afterClosed = Number((await query(safetyQueries.getStats)).rows[0].resolved_count);
    expect(afterClosed).toBe(before);

    const resolved = await track('In_Progress');
    await query(safetyQueries.updateStatus, [resolved, 'Resolved', null, null]);
    const afterResolved = Number((await query(safetyQueries.getStats)).rows[0].resolved_count);
    expect(afterResolved).toBe(before + 1);
  });

  it('accepts every value of the safety_status enum', async () => {
    // Guards against a status being written that the column will reject.
    for (const status of ['Open', 'In_Progress', 'Resolved', 'Closed']) {
      const id = await track('Open');
      const { rows } = await query(safetyQueries.updateStatus, [id, status, null, null]);
      expect(rows[0].status).toBe(status);
    }
  });
});
