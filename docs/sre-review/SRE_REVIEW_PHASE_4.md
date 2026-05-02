# SRE Review — Phase 4: Availability, Scalability & Concurrency

**Date:** 2026-03-27
**Reviewer:** Claude Code (SRE Skill)
**Scope:** Database pool, concurrency patterns, API performance, memory health, graceful degradation, frontend polling, auth at scale, horizontal scaling readiness

---

## Critical Issues (Must Fix Before Launch)

### C1. Inventory Disbursement Race Condition — No Atomic Quantity Guard

- **Issue:** Inventory quantity can go negative under concurrent disbursements — no `WHERE quantity >= $1` guard on UPDATE
- **Location:** `backend/src/modules/requests/services/disburse.service.js:35-37`
- **Impact:** Two concurrent disbursements for the same inventory item can both succeed even when stock is insufficient. Stock count goes negative, phantom inventory issued to field.
- **Current code:**
  ```javascript
  await client.query(
    'UPDATE inventory SET quantity = quantity - $1, updated_at = NOW() WHERE id = $2',
    [qty, link.inventoryId]
  );
  ```
- **Fix:** Add atomic guard:
  ```sql
  UPDATE inventory SET quantity = quantity - $1, updated_at = NOW()
  WHERE id = $2 AND quantity >= $1
  RETURNING quantity
  ```
  Check `rowCount === 0` and throw insufficient stock error.

### C2. Maintenance Parts — No Transaction, No Quantity Guard

- **Issue:** `addParts()` decrements inventory in a loop without a transaction wrapper and without quantity guards
- **Location:** `backend/src/modules/maintenance/maintenance.service.js:232-243`
- **Impact:** Worst of both worlds: no atomicity (partial failures leave inconsistent state) AND no negative-stock prevention. If adding 3 parts and the 2nd fails, the 1st decrement is committed but no parts record exists.
- **Fix:** Wrap in `transaction()` and add `WHERE quantity >= $1` guard on each UPDATE.

### C3. Rate Limiting Disabled

- **Issue:** The general API rate limiter is commented out
- **Location:** `backend/src/app.js:27` — `// app.use('/api', apiLimiter);`
- **Impact:** No protection against brute-force login, request flooding, or SMS cost abuse via notification-triggering endpoints. A single client can make unlimited requests.
- **Fix:** Uncomment the line. For horizontal scaling, switch `express-rate-limit` to a Redis-backed store.

### C4. Graceful Shutdown Doesn't Drain HTTP Connections

- **Issue:** `app.listen()` return value (the HTTP server) is never stored, so SIGTERM/SIGINT handlers close the DB pool but can't stop accepting new HTTP connections or drain in-flight requests
- **Location:** `backend/server.js:12-16, 24-34`
- **Impact:** During deployments or restarts, active requests are killed mid-transaction. In-flight approval or disbursement operations may leave data in inconsistent state.
- **Fix:**
  ```javascript
  const server = app.listen(config.port, () => { ... });

  process.on('SIGTERM', async () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 30000); // force exit after 30s
  });
  ```

### C5. Unbounded In-Memory Cache — Memory Leak

- **Issue:** `viewLogCache` is a module-scope `Map` that grows indefinitely — entries are never evicted
- **Location:** `backend/src/modules/accounts/accounts.controller.js:12`
- **Impact:** Every unique `userId:pageKey` pair adds a permanent entry. Over weeks of operation, this Map grows without bound, increasing GC pressure and eventually causing OOM. At 200 users viewing 10 pages each = 2000 entries/day that never clear.
- **Fix:** Add a periodic cleanup via `setInterval` that evicts entries older than 15 minutes, or replace with a simple LRU cache (e.g., `lru-cache` package with `maxSize`).

---

## Major Improvements (Strongly Recommended)

### M1. Auth Middleware Does DB Lookup on Every Request

- **Issue:** Every authenticated API call executes `SELECT ... FROM users WHERE id = $1` to load the full user object
- **Location:** `backend/src/middleware/auth.js:18-22`
- **Impact:** At 200 users with SWR polling, this adds ~20-30 extra DB queries/second purely for auth verification. With a 20-connection pool, auth queries alone consume ~30% of pool capacity.
- **Fix (short-term):** Embed role, department, is_active in the JWT payload itself. Only hit DB if the token is >5 minutes old (check `iat` claim). This eliminates ~90% of auth DB lookups.
- **Fix (long-term):** Redis cache for user status with 5-minute TTL.

### M2. Notifications Block API Response

- **Issue:** `sendApprovalNotifications()` is awaited inside the approval transaction — 3 sequential notification creates (admins + requester + purchasing) block the HTTP response
- **Location:** `backend/src/modules/requests/services/approval.service.js:70`
- **Impact:** Each notification batch insert takes ~50-100ms. Approval endpoint response is delayed 200-400ms by notification I/O that the user doesn't need to wait for.
- **Fix:** Move notification sending outside the transaction. Use fire-and-forget pattern:
  ```javascript
  // After transaction commits:
  sendApprovalNotifications(request, approverName).catch(err =>
    console.error('Notification send failed:', err.message)
  );
  ```

### M3. Bulk Notification Insert Is Sequential

- **Issue:** `createBulk()` inserts notifications one-by-one in a loop
- **Location:** `backend/src/modules/notifications/notifications.service.js:53-76`
- **Impact:** Notifying 20 purchasing staff = 20 sequential INSERT statements. At ~5ms each = 100ms blocking. Compounds with M2.
- **Fix:** Use a single batch INSERT with `unnest()` or generate a multi-row VALUES clause.

### M4. No Error Handler for DB Connection Failures

- **Issue:** `errorHandler.js` handles PostgreSQL constraint errors (23505, 23503) but not connection-level errors (ECONNREFUSED, ETIMEDOUT, pool exhaustion)
- **Location:** `backend/src/middleware/errorHandler.js:12-55`
- **Impact:** When the DB is unreachable or pool is exhausted, clients get a generic 500 instead of a 503 (Service Unavailable) that signals "retry later." Load balancers can't distinguish overload from bugs.
- **Fix:** Add handling for `ECONNREFUSED`, `ENOTFOUND`, `ETIMEDOUT`, and `Error: timeout exceeded` from pg Pool.

### M5. Scheduler Never Started

- **Issue:** `backend/src/scheduler.js` defines overdue reminder jobs but is never imported or started
- **Location:** `backend/src/scheduler.js` — not imported in `server.js` or `app.js`
- **Impact:** Overdue equipment return reminders never fire. The `RETURN_OVERDUE`, `RETURN_OVERDUE_ESCALATION`, and `RETURN_OVERDUE_URGENT` notification types are never triggered automatically.
- **Fix:** Import and call `startScheduler()` in `server.js` after `app.listen()`. Add `stopScheduler()` to SIGTERM handler.

### M6. No Frontend Handling of 5xx Errors

- **Issue:** The Axios response interceptor only handles 401 — all other errors pass through as raw Axios errors
- **Location:** `frontend/src/services/api.js:43-62`
- **Impact:** When the server returns 503 (overloaded) or 502 (gateway error), the user sees a cryptic error message. No retry with backoff. SWR's built-in retry uses fixed 1-second intervals (no exponential backoff).
- **Fix:** Add 5xx detection in the interceptor. Show user-friendly toast for 503. Configure SWR `onErrorRetry` with exponential backoff.

### M7. express.json() Limit Set to 10MB

- **Issue:** Request body limit is 10MB — excessive for a JSON API with no file upload endpoints in the body
- **Location:** `backend/src/app.js:20` — `express.json({ limit: '10mb' })`
- **Impact:** A single malicious POST with a 10MB JSON payload consumes significant memory. Under concurrent attack, 20 such requests = 200MB of heap consumed just parsing bodies.
- **Fix:** Reduce to `1mb` (sufficient for any EMRS form submission). Use `multer` with separate limits for file upload routes if needed.

---

## Minor Suggestions (Nice to Have)

- **Pool max not configurable via env:** `backend/src/config/db.js:10` hardcodes `max: 20`. Should read from `process.env.DB_POOL_MAX || 20` for tuning without code changes.
- **Disbursement loop could be batched:** `disburse.service.js:25-68` runs 4 queries per inventory item in a loop. For 10 items = 40 sequential queries. Could batch INSERTs.
- **Dashboard stats not cached:** Purchasing stats, equipment stats, and accounts stats are computed fresh on every dashboard load. A 30-60 second in-memory TTL cache would reduce DB load significantly.
- **Sequential DB writes in approval:** `approval.service.js:61-63` — `updateStatus`, `addHistory`, `addAuditTrail` are sequential within the transaction. Since they're independent, `Promise.all()` would save ~10-20ms.
- **Overdue reminders process sequentially:** `overdueReminders.service.js:123-131` loops through all overdue requests one by one. At 100 overdue items, this takes 10+ seconds.
- **Token refresh endpoint missing:** `authService.js` exports a `refreshToken()` function but the backend has no `/auth/refresh` route. Users get hard-logged-out when the 7-day JWT expires.
- **Auth rate limiter disabled on login route:** `backend/src/modules/auth/auth.routes.js` has `authLimiter` commented out. Re-enable for production.
- **Console.log in production:** 138 `console.log` statements across backend. Replace with structured logger (pino/winston) before production.

---

## Phase Score

| Sub-Area | Rating | Notes |
|----------|--------|-------|
| 4.1 Database Connection Pool | ⚠️ Needs Work | Pool exists with reasonable defaults (max=20, timeout=2s, error handler). But max not configurable via env, and no pool exhaustion error handling. |
| 4.2 Race Conditions | ❌ Critical Gap | Two inventory decrement paths lack atomic guards. Maintenance addParts has no transaction. |
| 4.3 API Response Times | ⚠️ Needs Work | Notifications block approval responses. Sequential queries in loops. No dashboard caching. |
| 4.4 Memory & Event Loop | ❌ Critical Gap | Unbounded viewLogCache Map. 10MB JSON body limit. |
| 4.5 Graceful Degradation | ❌ Critical Gap | No HTTP drain on shutdown. No 503 for DB failures. Rate limiting disabled. |
| 4.6 Frontend Concurrency | ✅ Solid | SWR config is well-tuned: 60s refresh, focus revalidation disabled, 5s dedup, retry count 3. Notification polling at 30s is acceptable. |
| 4.7 Session & Auth at Scale | ⚠️ Needs Work | HS256 is fine for MVP. But DB lookup per request is a scaling bottleneck. No token refresh mechanism. |
| 4.8 Horizontal Scaling | ⚠️ Needs Work | Stateless JWT is good. But in-memory rate limiter, in-memory viewLogCache, and scheduler without leader election all block multi-instance deployment. |

---

## Files Audited

| File | Lines | Focus |
|------|-------|-------|
| `backend/src/config/db.js` | 61 | Pool config, transaction helper |
| `backend/src/config/env.js` | 51 | JWT, DB, SMS config |
| `backend/src/app.js` | 41 | Middleware stack, JSON limit, rate limiter |
| `backend/server.js` | 37 | Startup, graceful shutdown |
| `backend/src/middleware/auth.js` | 65 | Per-request auth overhead |
| `backend/src/middleware/errorHandler.js` | 63 | Error classification |
| `backend/src/middleware/rateLimiter.js` | ~30 | Rate limit definitions |
| `backend/src/modules/requests/services/approval.service.js` | ~200 | Approval concurrency, notification blocking |
| `backend/src/modules/requests/services/disburse.service.js` | ~100 | Inventory race condition |
| `backend/src/modules/requests/services/base.service.js` | ~40 | Promise.all pattern (good) |
| `backend/src/modules/requests/services/return-confirm.service.js` | ~90 | Return transaction safety |
| `backend/src/modules/requests/services/return-helpers.js` | ~50 | Inventory restock |
| `backend/src/modules/requests/requests.queries.js` | ~340 | Status update queries, stats |
| `backend/src/modules/maintenance/maintenance.service.js` | ~250 | addParts race condition |
| `backend/src/modules/purchasing/purchasing.service.js` | ~240 | decreaseStock (safe pattern) |
| `backend/src/modules/jobs/services/equipment.service.js` | ~380 | Disbursement transactions (safe) |
| `backend/src/modules/jobs/services/material.service.js` | ~220 | Inventory check in transaction (safe) |
| `backend/src/modules/notifications/notifications.service.js` | ~300 | Bulk insert bottleneck |
| `backend/src/modules/accounts/accounts.controller.js` | ~100 | viewLogCache memory leak |
| `backend/src/modules/requests/overdueReminders.service.js` | ~140 | Sequential processing |
| `backend/src/utils/sms.js` | ~130 | SMS send pattern |
| `backend/src/utils/tokenGenerator.js` | ~15 | JWT algorithm |
| `backend/src/scheduler.js` | ~60 | Cron jobs (never started) |
| `frontend/src/main.jsx` | 30 | SWR global config |
| `frontend/src/services/api.js` | 73 | Interceptors, error handling |
| `frontend/src/hooks/useApi.js` | ~20 | Generic SWR wrapper |
| `frontend/src/features/notifications/hooks/useNotifications.js` | ~90 | 30s custom polling |
| `frontend/src/features/equipment/hooks/useEquipment.js` | ~80 | Dedup intervals |
| `frontend/src/features/auth/services/authService.js` | 28 | Unused refreshToken |
| `frontend/src/store/authStore.js` | ~50 | Token persistence |
