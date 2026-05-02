# SRE Review — Phase 7: Observability & Ops
**Date:** 2026-04-24
**Reviewer:** Claude Code (SRE Skill)
**Scope:** Structured logging, health checks, configuration management, error tracking, database ops, deployment readiness, dependency audit, activity & audit logging.

---

## Critical Issues (Must Fix Before Launch)

### C1 — `/api/health` Does Not Check Database: Shallow Health Check
- **Issue:** The health endpoint at `backend/src/routes/index.js:27` returns `{ status: 'ok', timestamp, version }` without performing any database connectivity check. It always returns HTTP 200 as long as the Express process is alive, even if the PostgreSQL connection pool is fully exhausted or the DB is unreachable.
- **Location:** `backend/src/routes/index.js:27-32`
- **Impact:** Any monitoring system, load balancer, or uptime checker that relies on `/api/health` will report the service as healthy even when it is non-functional (DB down → all requests fail with 500). On-call engineers will receive no alert; users will see generic error pages with no indication the system is under incident. Production incident response time increases significantly.
- **Fix:** Add a DB ping to the health check:
  ```js
  router.get('/health', async (req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString(), version: '2.1.0' });
    } catch (err) {
      res.status(503).json({ status: 'error', db: 'unreachable', timestamp: new Date().toISOString() });
    }
  });
  ```

---

### C2 — No Error Tracking Service: Production Errors Are Invisible
- **Issue:** There is no error tracking service (Sentry, LogRocket, Rollbar, or equivalent) on either the backend or frontend. Backend errors are written to stdout via `console.error` or `logger.error`, both of which only persist if stdout is captured by the process supervisor. Frontend errors have no capture mechanism at all.
- **Location:** `backend/src/utils/logger.js`, `frontend/src/main.jsx` (no error tracking import anywhere in either codebase)
- **Impact:** When a production error occurs — an unhandled exception, a failed migration, a 500 on a critical endpoint — the only record is a console message on the server. If the process dies and restarts, these logs may be lost entirely. There is no alert, no stack trace aggregation, and no way to discover intermittent errors that don't cause outages. For a system deployed in a remote oilfield operations context, silent failures are operationally dangerous.
- **Fix (free tier available):** Add Sentry to both backend and frontend. Backend: `@sentry/node` with `Sentry.init()` before the Express app and `Sentry.Handlers.errorHandler()` as middleware. Frontend: `@sentry/react` with a `Sentry.ErrorBoundary` component (which also fixes Phase 5 C1). This requires a Sentry DSN (free tier available at sentry.io).

---

## Major Improvements (Strongly Recommended)

### M1 — 138 `console.*` Calls Bypass Structured Logger: Logs Not Machine-Parseable
- **Issue:** `backend/src/utils/logger.js` exists with 4 log levels and environment-aware level filtering. However, it is imported in only 4 utility files (`email.js`, `sms.js`, `utils/index.js`, `activityLogger.js`). All 90 `console.*` calls in controllers and services bypass the logger entirely. Additionally, the logger itself formats output as a human-readable string, not JSON — making logs non-parseable by any log aggregation tool.
- **Location:** 138 `console.*` calls across `backend/src/` (confirmed by grep); `backend/src/utils/logger.js:12-15` (text format, not JSON)
- **Impact (1) — Visibility:** Log levels are not applied to direct `console.log` calls. In production, every `console.log` from development debug prints will appear in the log stream regardless of log level setting. The `currentLevel` guard in `logger.js` is bypassed entirely.
- **Impact (2) — Parseability:** Log aggregators (Datadog, Loki, Papertrail, CloudWatch) expect newline-delimited JSON. Text-format logs cannot be queried, filtered by level, or correlated across services.
- **Impact (3) — Security:** Some `console.log` calls in controllers may include request body data that contains PII (user names, email addresses, details JSONB payload).
- **Fix (short term):** Replace `console.log/error/warn` with `logger.info/error/warn` in all controllers and services.
- **Fix (medium term):** Replace the custom logger with `pino` (fast, JSON output by default) or `winston` (flexible, widely supported). Single change to `logger.js` propagates automatically once all callers use the logger module.

---

### M2 — 4 High-Severity + 3 Moderate Dependency Vulnerabilities
- **Issue:** `npm audit` reveals:
  - **Backend (2 high, 2 moderate):**
    - `nodemailer ≤8.0.4` — SMTP command injection via CRLF in transport name option (`GHSA-c7w3-x93f-qmm8`), `envelope.size` injection, email to unintended domain. Severity: **HIGH**. Fix: `npm audit fix --force` (installs nodemailer@8.0.5, breaking change).
    - `path-to-regexp <0.1.13` — ReDoS via multiple route parameters (`GHSA-37ch-88jc-xwx2`). Severity: **HIGH**. Fix: `npm audit fix`.
    - `qs ≤6.14.1` — DoS via arrayLimit bypass (comma and bracket notation). Severity: moderate. Fix: `npm audit fix`.
    - `uuid <14.0.0` — Missing buffer bounds check. Severity: moderate. Fix: `npm audit fix --force` (breaking change).
  - **Frontend (5 high, 1 moderate):**
    - `react-router-dom 6.4.0–6.30.2` — XSS via open redirects (`GHSA-2w69-qvjg-hvjx`). Severity: **HIGH**. Fix: `npm audit fix`.
    - `axios 1.0.0–1.14.0` — `__proto__` DoS, SSRF via NO_PROXY bypass, cloud metadata exfiltration via header injection. Severity: **HIGH** (3 CVEs). Fix: `npm audit fix`.
    - `xlsx ≤0.18.5` — Prototype pollution and ReDoS. Severity: moderate. **No fix available**. Mitigation: remove the dependency (it is not imported anywhere in `frontend/src/`).
- **Location:** `backend/package.json`, `frontend/package.json`
- **Impact:** The `nodemailer` SMTP injection vulnerability is directly exploitable if any field in the password reset email (name, from address) is influenced by user input. The `react-router-dom` XSS vulnerability could allow open-redirect attacks against users.
- **Fix:** Run `npm audit fix` on both packages immediately. For the `nodemailer` force-upgrade, test password reset flow after updating.

---

### M3 — Custom Logger Outputs Text, Not JSON: Incompatible with Log Aggregators
- **Issue:** `logger.js` formats log messages as `[ISO_TIMESTAMP] [LEVEL] message {meta}` — a human-readable string. While readable in a terminal, this format cannot be parsed by any standard log aggregation or monitoring tool without a custom grok pattern.
- **Location:** `backend/src/utils/logger.js:12-15`
- **Impact:** If a log aggregator is added later (a reasonable next step), all historical logs are unparseable without ETL work. Filtering by level, correlating by request ID, or alerting on error rate is impossible.
- **Fix:** Minimum change — modify `formatMessage` to return `JSON.stringify({ timestamp, level, message, ...meta })`. Better: migrate to `pino` which is JSON by default, has no runtime overhead, and is a drop-in replacement.

---

### M4 — `src.zip` Binary Artifact Committed in Backend Directory
- **Issue:** A 413KB file `backend/src.zip` exists in the repository. Based on the modification date (2026-02-25) and file size, this appears to be a snapshot of the source tree. It is not referenced by any script or deployment config.
- **Location:** `backend/src.zip` (413KB, dated 2026-02-25)
- **Impact:** (1) Binary blobs in repositories bypass all secret-scanning tools — if the zip was taken when any credential was in the source, those credentials are now in git history permanently. (2) It bloats repository size and confuses contributors. (3) If the app is deployed by copying the repository directory, this file may be served or included unintentionally.
- **Fix:** Delete `src.zip` from the repository and add `*.zip` to `.gitignore`. If the commit history has already been pushed, consider removing it from git history with `git filter-repo`.

---

### M5 — `.env.example` Excluded from Git: No Documented Required Configuration
- **Issue:** `backend/.gitignore:4` includes `.env.example` in its exclude list. The file physically exists at `backend/.env.example` but is not tracked by git. Any fresh clone of the repository has no record of which environment variables are required to run the application.
- **Location:** `backend/.gitignore:4`
- **Impact:** New developers, CI environments, and redeployment after server replacement all have no documented list of required variables. Combined with the silent DB password default (`'password'` if `DB_PASSWORD` unset — Phase 1 C5), a missing `.env` is dangerous. This was identified in Phase 1 (M4) and remains unresolved.
- **Fix:** Remove `.env.example` from `.gitignore`. It should be committed. Keep only actual secret files (`.env`, `.env.local`, `.env.production`) in the ignore list.

---

## Minor Suggestions (Nice to Have)

- **`backend/src/config/db.js:14`** — `pool.on('connect')` uses `console.log` not `logger.info`. `pool.on('error')` uses `console.error`. Both should be routed through the logger for consistent log-level control.

- **`backend/src/config/db.js:22-27`** — The query helper logs query duration in development with `console.log`. This is useful for profiling but should use `logger.debug` so it can be suppressed by log level in production without code changes.

- **`backend/src/routes/index.js:29`** — Health endpoint hardcodes `version: '2.1.0'`. This will drift out of sync with `package.json`. Read dynamically: `const { version } = require('../../package.json');`.

- **No `/api/ready` endpoint** — Distinguished from `/api/health`, a readiness endpoint would indicate whether the app has finished initialization (migrations run, connections pooled). Kubernetes and some load balancers use `/ready` to gate traffic. For the initial single-server deploy this is low priority, but worth stubbing.

- **`backend/src/config/db.js`** — No `statement_timeout` is set on the connection pool. Long-running queries (e.g., the unbounded activity log query in `activityLogger.js:298` which can scan the full `activity_logs` table) will hold DB connections indefinitely. Add `statement_timeout: 30000` to the pool config.

- **`frontend/package.json`** — `xlsx@0.18.5` is listed as a production dependency but produces a high-severity vulnerability notice with no upstream fix available. Since no `import from 'xlsx'` was found in any source file, remove it: `npm uninstall xlsx`. This also reduces the production bundle by ~750KB.

- **`backend/src/app.js` (no change needed for minor note)** — The `start` script in `package.json` runs `node server.js` with no PM2, forever, or process supervisor. A single uncaught exception (or the ones noted in Phase 3 C1 — missing `unhandledRejection` handler) will kill the process with no restart. The ops plan should include a process supervisor (PM2 recommended for single-server Node.js deployments) before launch.

---

## Phase Score

| Area | Score | Notes |
|------|-------|-------|
| 7.1 Logging | ❌ Critical Gap | Logger exists ✅; 138 console.* bypass it ❌; text format (not JSON) ❌; no request ID tracing ❌ |
| 7.2 Health Checks | ⚠️ Needs Work | `/api/health` exists ✅; no DB connectivity check ❌; no readiness endpoint ⚠️ |
| 7.3 Configuration Management | ⚠️ Needs Work | Env vars used ✅; fail-fast for JWT_SECRET ✅; DB_PASSWORD defaults to 'password' ❌ (Phase 1); `.env.example` not committed ❌ |
| 7.4 Error Tracking | ❌ Critical Gap | No Sentry or equivalent ❌; backend errors logged to stdout only ❌; frontend errors uncaptured ❌ |
| 7.5 Database Operations | ⚠️ Needs Work | Pool sizing adequate (max 20) ✅; no statement_timeout ⚠️; maintenance_schedule migration missing (Phase 2) ❌ |
| 7.6 Deployment Readiness | ⚠️ Needs Work | Build scripts present ✅; package-lock.json committed ✅; src.zip binary in repo ⚠️; no process supervisor documented ⚠️ |
| 7.7 Dependency Audit | ❌ Critical Gap | 4 high-severity backend vulns ❌; 5 high-severity frontend vulns ❌; xlsx unused + no fix ❌ |
| 7.8 Activity & Audit Logging | ✅ Solid | activityLogger.js comprehensive ✅; role-based visibility ✅; approval workflow logged ✅; logActivity fails silently on error ⚠️ |

---

## Files Audited

| File | Lines |
|------|-------|
| `backend/src/utils/logger.js` | 44 |
| `backend/src/utils/activityLogger.js` | 430 |
| `backend/src/config/db.js` | 55 |
| `backend/src/config/env.js` | 50 |
| `backend/src/app.js` | 41 |
| `backend/server.js` | ~60 |
| `backend/src/routes/index.js` | 55 |
| `backend/package.json` | ~40 |
| `backend/.gitignore` | 14 |
| `backend/.env.example` | (exists, not tracked in git) |
| `frontend/package.json` | 43 |
| `frontend/src/main.jsx` | 44 |
| `npm audit (backend)` | (runtime output) |
| `npm audit (frontend)` | (runtime output) |
