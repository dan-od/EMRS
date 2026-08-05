import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import db from '../src/config/db.js';
import authorize from '../src/modules/safety/safety.authorize.js';

const { pool, query } = db;
const { canAccessReport } = authorize;
const TAG = '[TEST-safety-access]';

/**
 * GET /safety/:id had no guard at all: any authenticated user holding a report
 * UUID could read full detail, including a named reporter's identity and
 * department. Access is now ownership OR safety role.
 */

const runGuard = async (reportId, user) => {
  let status = null, body = null, passed = false;
  const res = {
    status(code) { status = code; return this; },
    json(payload) { body = payload; return this; },
  };
  await canAccessReport({ params: { id: reportId }, user }, res, () => { passed = true; });
  return { status, body, passed };
};

let owner, stranger, safetyManager, ownedId, anonId;

beforeAll(async () => {
  owner = (await query("SELECT id, role FROM users WHERE role = 'Field_Engineer' LIMIT 1")).rows[0];
  stranger = (await query("SELECT id, role FROM users WHERE role = 'Accounts_Staff' LIMIT 1")).rows[0]
    || (await query("SELECT id, role FROM users WHERE role = 'Staff' LIMIT 1")).rows[0];
  safetyManager = (await query("SELECT id, role FROM users WHERE role = 'Safety_Manager' LIMIT 1")).rows[0];
  expect(owner && stranger && safetyManager, 'need Field_Engineer, a non-safety role and Safety_Manager').toBeTruthy();

  ownedId = (await query(
    `INSERT INTO safety_reports (reporter_id, type, severity, status, title, description, location)
     VALUES ($1,'Hazard','Low','Open',$2,'d','L') RETURNING id`, [owner.id, `${TAG} owned`]
  )).rows[0].id;

  anonId = (await query(
    `INSERT INTO safety_reports (reporter_id, type, severity, status, title, description, location, is_anonymous)
     VALUES (NULL,'Hazard','Low','Open',$1,'d','L',true) RETURNING id`, [`${TAG} anonymous`]
  )).rows[0].id;
});

afterAll(async () => {
  await query('DELETE FROM safety_report_history WHERE report_id = ANY($1::uuid[])', [[ownedId, anonId]]);
  await query('DELETE FROM safety_reports WHERE title LIKE $1', [`${TAG}%`]);
  await pool.end();
});

describe('safety report access', () => {
  it('lets the reporter open their own report', async () => {
    const { passed } = await runGuard(ownedId, owner);
    expect(passed).toBe(true);
  });

  it('lets a safety role open any report', async () => {
    expect((await runGuard(ownedId, safetyManager)).passed).toBe(true);
    expect((await runGuard(anonId, safetyManager)).passed).toBe(true);
  });

  it('refuses an unrelated user — the hole this closes', async () => {
    const { passed, status } = await runGuard(ownedId, stranger);
    expect(passed).toBe(false);
    expect(status).toBe(403);
  });

  it('keeps anonymous reports away from non-safety users', async () => {
    // reporter_id is NULL, so an anonymous report has no owner to match.
    const { passed, status } = await runGuard(anonId, owner);
    expect(passed).toBe(false);
    expect(status).toBe(403);
  });

  it('404s an unknown id rather than leaking existence via 403', async () => {
    const { status } = await runGuard('00000000-0000-0000-0000-000000000000', stranger);
    expect(status).toBe(404);
  });
});
