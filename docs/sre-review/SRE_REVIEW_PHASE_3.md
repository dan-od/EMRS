# SRE Review — Phase 3: API Resilience
**Date:** 2026-04-24
**Reviewer:** Claude Code (SRE Skill)
**Scope:** Global error handling, controller error patterns, Zod validation coverage, response consistency, timeout/retry configuration, rate limiting, file upload safety.

---

## Critical Issues (Must Fix Before Launch)

### C1 — No Process-Level Error Handlers: Unhandled Rejections Crash the Server
- **Issue:** `server.js` registers `SIGTERM` and `SIGINT` handlers for graceful shutdown but has no `process.on('unhandledRejection')` or `process.on('uncaughtException')` handlers.
- **Location:** `backend/server.js:24-33`
- **Impact:** In Node.js 15+, an unhandled promise rejection terminates the process immediately with exit code 1 — no log, no graceful DB pool drain. An error that escapes any `try/catch` (e.g., in a rarely-exercised code path) silently takes down the server. The scheduler (when it is eventually started) runs outside the request lifecycle, so its errors are especially exposed.
- **Fix:**
  ```js
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    // Attempt graceful shutdown; don't exit silently
    pool.end().finally(() => process.exit(1));
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    pool.end().finally(() => process.exit(1));
  });
  ```

---

### C2 — `POST /purchasing/disbursements` Has No Role Restriction
- **Issue:** `purchasing.routes.js:36` applies `validate(validation.createDisbursement)` but has no `requireRoles` guard. Any authenticated user — including `Field_Engineer`, `Staff`, or `Operator` — can create a disbursement record.
- **Location:** `backend/src/modules/purchasing/purchasing.routes.js:36`
  ```js
  // Line 36 — missing requireRoles(purchasingRoles)
  router.post('/disbursements', validate(validation.createDisbursement), controller.createDisbursement);
  ```
- **Impact:** An engineer can create fabricated disbursement records against arbitrary requests. Since disbursements track financial outflows, this is an integrity issue. Every other write endpoint in this router correctly applies `requireRoles(purchasingRoles)`.
- **Fix:** Add the role guard:
  ```js
  router.post('/disbursements', requireRoles(purchasingRoles), validate(validation.createDisbursement), controller.createDisbursement);
  ```

---

### C3 — Disburse Endpoint Reads Unvalidated `req.body`; `withoutApproval` Bypass Flag Unguarded
- **Issue:** `POST /:id/disburse` has no `validate()` middleware on the route. The controller reads `req.body` directly, including the `withoutApproval` field that bypasses manager approval.
- **Location:** `backend/src/modules/requests/requests.routes.js:43` and `backend/src/modules/requests/controllers/disburse.controller.js:9-12`
  ```js
  // routes.js:43 — no validate() middleware
  router.post('/:id/disburse', requireRoles(PURCHASING_ROLES), controller.disburse);

  // disburse.controller.js:9 — reads raw body
  const { notes, expectedReturnDate, withoutApproval, inventoryLinks } = req.body;
  ```
- **Impact:** A Purchasing staff member can pass `"withoutApproval": true` in any disbursement. The service layer accepts this flag at face value and bypasses manager approval. Additionally, `expectedReturnDate` is not validated as a valid date, and `inventoryLinks` (an object mapping items to inventory IDs) is not validated for UUID format — malformed values could cause DB-level errors or mismatch inventory deductions.
- **Fix:** Add a Zod schema and apply `validate()` on the route:
  ```js
  const disburseSchema = z.object({
    body: z.object({
      notes: z.string().optional().nullable(),
      expectedReturnDate: z.string().datetime().optional().nullable(),
      withoutApproval: z.boolean().default(false),
      inventoryLinks: z.record(z.string().uuid()).optional().nullable()
    })
  });
  router.post('/:id/disburse', requireRoles(PURCHASING_ROLES), validate(disburseSchema), controller.disburse);
  ```
  Then update the controller to read `req.validatedBody`.

---

## Major Improvements (Strongly Recommended)

### M1 — Scheduler Never Started: Overdue Reminders Never Fire
- **Issue:** `scheduler.js` exports `startScheduler()` but `server.js` never imports or calls it. The overdue return reminder service is completely dormant.
- **Location:** `backend/server.js` (missing import); `backend/src/scheduler.js:20`
- **Impact:** Return overdue notifications — including escalation reminders — never fire. Purchasing has no automated visibility into overdue items. This was flagged as a cross-cutting concern in Phase 4; confirmed here as a Phase 3 API Resilience gap.
- **Fix:** Add to `server.js`:
  ```js
  const { startScheduler, stopScheduler } = require('./src/scheduler');
  // Inside startServer(), after pool verification:
  startScheduler();
  // In SIGTERM/SIGINT handlers:
  stopScheduler();
  await pool.end();
  ```

---

### M2 — Controllers Read `req.body` Instead of `req.validatedBody`
- **Issue:** Multiple controllers apply `validate()` on the route (running Zod validation and coercion), but then read from `req.body` instead of `req.validatedBody`. This means Zod defaults and transformations are discarded.
- **Locations:**
  - `backend/src/modules/equipment/equipment.controller.js:42,64` — `equipmentService.create(req.body)`, `equipmentService.update(req.params.id, req.body)`
  - `backend/src/modules/equipment/equipmentLogs.controller.js:28,79` — `{ ...req.body }` passed to service
  - `backend/src/modules/equipment/equipmentMaintenance.controller.js:13,51` — `{ ...req.body }` passed to service
  - `backend/src/modules/equipment/equipmentTypes.controller.js:49` — `equipmentService.createCustomType(req.body)`
- **Impact:** Zod-defined defaults (e.g., `status: z.enum(EQUIPMENT_STATUS).optional().default('Available')`, `quantity: z.number().int().min(1).default(1)`) are never applied to the service call. The DB column defaults may cover some cases, but `sharedWithDepartments: z.array(z.string()).optional().default([])` returning `[]` would not reach the service if `req.body.sharedWithDepartments` is undefined — the service receives `undefined` rather than an empty array.
- **Fix:** Replace `req.body` with `req.validatedBody` in all controllers where a `validate()` middleware is present on the route.

---

### M3 — Pagination Parameters Unvalidated: Unbounded `limit` Queries
- **Issue:** Across all paginated endpoints, `limit` and `page` are read from `req.query` via `parseInt()` with no upper bound check or Zod validation.
- **Locations:** `notifications.controller.js:11`, `activity.controller.js:25`, `damagedInventory.controller.js:20`, `maintenance.service.js:62`, `requests.service.js` (multiple), and others throughout the codebase.
- **Impact:** Any authenticated user can pass `?limit=1000000` on any list endpoint and force the DB to return millions of rows (if they exist). For the activity log endpoint (accessible to all roles), this is especially low-barrier — engineers can read their own logs with arbitrary page size, loading the DB without restriction.
- **Fix:** Apply a validated cap on all pagination params. The simplest approach is a shared query schema:
  ```js
  const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20)
  });
  ```
  Apply via `validateQuery(paginationSchema)` on paginated routes. Where merge-query schemas already exist, add these bounds to them.

---

### M4 — No Server or Query Timeout
- **Issue:** No HTTP request timeout is configured on the Express server. No `statement_timeout` is set at the DB pool or query level.
- **Locations:** `backend/server.js:12` (no `server.setTimeout`); `backend/src/config/db.js` (no `statement_timeout` option)
- **Impact:** A slow or stuck DB query holds a pool connection until pg-pool's idle timeout (30s) expires. With `max: 20` connections, 20 simultaneous slow queries exhaust the pool and make the server unresponsive to new requests. Without an HTTP timeout, the client connection also hangs indefinitely.
- **Fix:**
  ```js
  // server.js — set a 30s request timeout
  const server = app.listen(config.port, () => { ... });
  server.setTimeout(30000);

  // db.js — add statement_timeout for production
  const pool = new Pool({
    ...poolConfig,
    statement_timeout: config.nodeEnv === 'production' ? 10000 : 0, // 10s in production
  });
  ```

---

### M5 — Mixed Response Envelopes Across Modules
- **Issue:** There is no consistent response shape. Modules use different structures.
- **Locations (raw objects without envelope):**
  - `users.controller.js` — `res.json(result)`, `res.json(user)`, `res.json(user)` (no `{ success, data }`)
  - `safety.controller.js` — `res.json(result)`, `res.json(report)` (no envelope)
  - `purchasing.controller.js` — `res.json(item)`, `res.json(disbursements)` (no envelope)
  - `maintenance.actions.controller.js` — `res.json(record)` (no envelope)
  - Vs. `requests`, `equipment`, `accounts` which use `{ success: true, data: ... }`
- **Impact:** The frontend must have module-specific response parsing logic. When a users fetch fails, `response.data` is undefined (expecting `.data` from an envelope that doesn't exist). This creates subtle bugs when API clients assume a consistent shape.
- **Fix:** Standardize on `{ success: true, data: result }` across all modules. For paginated responses: `{ success: true, data: [], pagination: { total, page, limit, totalPages } }`.

---

### M6 — `activity.controller.js` and `damagedInventory.controller.js` Bypass Global Error Handler
- **Issue:** These two controllers catch errors and return 500 responses directly using `res.status(500).json(...)` and `console.error()` instead of calling `next(error)`.
- **Locations:**
  - `backend/src/modules/activity/activity.controller.js:57-63` and `:102-108`
  - `backend/src/modules/purchasing/damagedInventory.controller.js:35-37`, `:49-51`, `:69-71`, `:84-86`, `:126-128`
- **Impact:** (1) These errors bypass the central `errorHandler` and are logged inconsistently. (2) PostgreSQL error codes (like `22P02` for invalid UUID) are not translated into user-friendly messages — instead, the raw DB error message is suppressed and a generic 500 is returned, potentially hiding bugs. (3) Monitoring tooling that hooks into the error handler never sees these errors.
- **Fix:** Remove the manual try/catch + console.error pattern. Add `(req, res, next)` signature and call `next(error)`:
  ```js
  const getActivityLogs = async (req, res, next) => {
    try {
      // ...
    } catch (error) {
      next(error); // Let global errorHandler manage it
    }
  };
  ```

---

### M7 — 10MB JSON Body Limit Is Excessive
- **Issue:** `express.json({ limit: '10mb' })` accepts up to 10MB of JSON on every route.
- **Location:** `backend/src/app.js:20`
- **Impact:** An attacker (or runaway client) can send repeated 10MB payloads, consuming memory on each request before any application code runs. JSON parsing is CPU-intensive for large payloads. Without rate limiting enabled (Phase 1 C1), there is no throttle on how many such requests can hit the server.
- **Fix:** Reduce to `1mb` for general API use. The only endpoint that might need more is bulk operations — apply a higher limit selectively on those routes rather than globally:
  ```js
  app.use(express.json({ limit: '1mb' }));
  // If specific routes need more:
  router.post('/bulk', express.json({ limit: '5mb' }), controller.bulk);
  ```

---

## Minor Suggestions (Nice to Have)

- **`backend/src/app.js:33-35`** — Inline 404 handler returns `{ message: 'Route not found' }` without the `success: false` envelope. The `notFound` helper in `errorHandler.js:57-60` creates a proper `AppError` and passes to `next`, but it's never used. Replace the inline handler with `app.use(notFound); app.use(errorHandler);` for consistency.

- **`backend/src/modules/extensions/controllers/create.controller.js:10-14`** — Manual validation (`if (!requestId || !requestedReturnDate || !reason)`) instead of a Zod schema. Error messages are less precise. No length limits on `reason`. Add a `validate()` schema matching the extensions create route.

- **`backend/src/modules/accounts/accounts.controller.js:114-118`** — Manual `if (!amount || amount <= 0)` check on payment amount. No Zod schema. The `notes` field has no length limit. Add a Zod schema for the payment endpoint.

- **`backend/src/modules/requests/requests.validation.js:110`** — `z.union([ppeDetails, transportDetails, equipmentDetails, materialDetails, maintenanceDetails])` — Zod tests schemas in order and uses the first match. A Maintenance request that also happens to have an `items` array could silently validate as PPE. The `.passthrough()` prevents stripping but doesn't prevent misclassification. Consider switching to `z.discriminatedUnion` keyed on a `type` field embedded in `details`, or validate `details` after matching on the outer `type` field.

- **`backend/src/modules/requests/controllers/actions.controller.js:53-61`** — The `transfer` action manually checks `if (!toDepartment)` but does not validate that `toDepartment` is a valid department enum value. An invalid string causes a PostgreSQL error at the service layer, which propagates up correctly but represents an avoidable DB roundtrip.

- **All `/:id` routes** — `req.params.id` is passed to parameterized queries without UUID format validation. An invalid UUID triggers PG error `22P02` → mapped to 400 in errorHandler (correct), but still hits the DB unnecessarily. The `validateParams` utility in `validate.js:79-94` exists but is unused in any route. Apply `validateParams(z.object({ id: z.string().uuid() }))` on `:id` routes.

- **`backend/src/modules/notifications/notifications.routes.js:24`** — `POST /` (admin notification creation) has no Zod validation schema. The controller reads `req.body` directly with no type, length, or UUID validation on `referenceId`.

---

## Phase Score

| Area | Score | Notes |
|------|-------|-------|
| 3.1 Global Error Handling | ⚠️ Needs Work | errorHandler is solid; missing process-level handlers; 404 bypasses errorHandler |
| 3.2 Controller Error Handling | ⚠️ Needs Work | Most controllers use next(error) correctly; activity & damagedInventory bypass errorHandler; req.body vs req.validatedBody mismatch |
| 3.3 Validation Coverage | ⚠️ Needs Work | Core create/update routes covered; action routes (disburse, cancel, return, hold) largely unvalidated; pagination unguarded |
| 3.4 Response Consistency | ⚠️ Needs Work | Mixed envelopes: some modules return { success, data }; users/safety/purchasing/maintenance return raw objects |
| 3.5 Timeout & Retry | ❌ Critical Gap | No server timeout, no query timeout, no process handlers, no SMS/email retry |
| 3.6 Rate Limiting | ❌ Critical Gap | Carried from Phase 1 C1 — global limiter disabled, auth limiter commented out |
| 3.7 File Upload Safety | ✅ N/A | No file upload endpoints exist; multer installed but unused |

---

## Files Audited

| File | Lines |
|------|-------|
| `backend/server.js` | 36 |
| `backend/src/app.js` | 41 |
| `backend/src/routes/index.js` | 53 |
| `backend/src/middleware/errorHandler.js` | 63 |
| `backend/src/middleware/validate.js` | 96 |
| `backend/src/middleware/rateLimiter.js` | 33 |
| `backend/src/scheduler.js` | 63 |
| `backend/src/utils/email.js` | 105 |
| `backend/src/utils/logger.js` | 45 |
| `backend/src/modules/auth/auth.routes.js` | 53 |
| `backend/src/modules/auth/auth.controller.js` | 157 |
| `backend/src/modules/requests/requests.routes.js` | 77 |
| `backend/src/modules/requests/requests.validation.js` | 159 |
| `backend/src/modules/requests/controllers/base.controller.js` | 105 |
| `backend/src/modules/requests/controllers/create.controller.js` | 110 |
| `backend/src/modules/requests/controllers/approval.controller.js` | 168 |
| `backend/src/modules/requests/controllers/disburse.controller.js` | 29 |
| `backend/src/modules/requests/controllers/actions.controller.js` | 104 |
| `backend/src/modules/equipment/equipment.routes.js` | 84 |
| `backend/src/modules/equipment/equipment.validation.js` | 166 |
| `backend/src/modules/equipment/equipment.controller.js` | 97 |
| `backend/src/modules/maintenance/maintenance.routes.js` | 99 |
| `backend/src/modules/maintenance/maintenance.controller.js` | 32 |
| `backend/src/modules/maintenance/maintenance.actions.controller.js` | 92 |
| `backend/src/modules/purchasing/purchasing.routes.js` | 45 |
| `backend/src/modules/purchasing/purchasing.controller.js` | 389 |
| `backend/src/modules/purchasing/damagedInventory.controller.js` | 138 |
| `backend/src/modules/notifications/notifications.routes.js` | 27 |
| `backend/src/modules/notifications/notifications.controller.js` | 126 |
| `backend/src/modules/notifications/notifications.service.js` | 325 |
| `backend/src/modules/extensions/extensions.routes.js` | 34 |
| `backend/src/modules/extensions/controllers/create.controller.js` | 37 |
| `backend/src/modules/accounts/accounts.routes.js` | 57 |
| `backend/src/modules/accounts/accounts.controller.js` | 272 |
| `backend/src/modules/activity/activity.routes.js` | 34 |
| `backend/src/modules/activity/activity.controller.js` | 139 |
| `backend/src/modules/users/users.routes.js` | 32 |
| `backend/src/modules/users/users.controller.js` | 165 |
| `backend/src/modules/safety/safety.routes.js` | 26 |
| `backend/src/modules/safety/safety.controller.js` | 198 |
| `backend/src/modules/vendors/vendors.routes.js` | 77 |
