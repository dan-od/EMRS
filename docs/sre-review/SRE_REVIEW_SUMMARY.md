# EMRS SRE Review — Final Summary
**Date:** 2026-04-24
**Reviewer:** Claude Code (SRE Skill)
**Phases Completed:** 7 of 7

---

## Total Findings Across All Phases

| Phase | Critical | Major | Minor |
|-------|----------|-------|-------|
| 1: Security & Auth | 5 | 7 | 7 |
| 2: Database & Queries | 6 | 7 | 7 |
| 3: API Resilience | 3 | 7 | 7 |
| 4: Availability, Scalability & Concurrency | 5 | 7 | 8 |
| 5: Frontend State & Performance | 2 | 7 | 7 |
| 6: PWA & Offline | 2 | 5 | 5 |
| 7: Observability & Ops | 2 | 5 | 7 |
| **Total** | **25** | **45** | **48** |

---

## Top 10 Most Impactful Issues

Ranked by blast radius: security breach risk, data loss risk, and number of users affected.

### #1 — Rate Limiting Disabled Globally *(Phase 1 C1 + Phase 4)*
**File:** `backend/src/app.js:28`, `backend/src/modules/auth/auth.routes.js:15`
The `apiLimiter` is commented out globally and `authLimiter` is disabled on the login route. Any attacker can brute-force passwords at thousands of requests/second and launch DoS attacks with no throttle. **Two-line fix** that the implementations already support — just uncomment both lines.

---

### #2 — JWT in localStorage + No Server-Side Invalidation *(Phase 1 C2, C4)*
**Files:** `frontend/src/store/authStore.js:44`, `backend/src/modules/auth/auth.controller.js:133`
Tokens are stored in XSS-vulnerable localStorage and remain valid for 7 days after logout. A stolen token gives an attacker a full week of access as the victim with no way to revoke it. Combines with C3 below. Fix: move to httpOnly cookie + implement token denylist.

---

### #3 — IDOR: Any User Can Read Any Request *(Phase 1 C3)*
**File:** `backend/src/modules/requests/requests.routes.js:65-67`
`GET /:id`, `GET /:id/history`, and `GET /:id/audit-trail` have no ownership or role check. Any authenticated user can read any request's details including sensitive fields (vendor quotes, cost estimates, approval notes, medical data in PPE requests). One authorization check fixes all three.

---

### #4 — Workbox Caches Auth Endpoint: Deactivated Users Stay Authenticated *(Phase 6 C1)*
**File:** `frontend/vite.config.js:27-37`
`GET /auth/me` is cached for 24 hours. A deactivated field engineer — terminated, suspended, or security-compromised — continues to have full app access offline for up to 24 hours. In a safety-critical oilfield context, this is an operational risk. Fix: exclude `/api/auth/*` from runtimeCaching.

---

### #5 — No React Error Boundary: Render Errors Kill Entire App *(Phase 5 C1)*
**File:** `frontend/src/App.jsx:24`
No `ErrorBoundary` wraps the lazy-loaded route tree. A single null-dereference in any component crashes the entire PWA with a blank white screen. Field engineers lose access to all features with no recovery path. A 10-line class component wrapping the route tree prevents this.

---

### #6 — maintenance_schedule Table Missing from All Migrations *(Phase 2 C1)*
**File:** `backend/src/migrations/` (all migration files)
The maintenance module is a core MVP feature, but `maintenance_schedule` has no migration. A fresh deploy against an empty database silently fails all maintenance operations. The feature works on existing databases where the table was created manually, masking the bug.

---

### #7 — Notification Enum Drift: Work-Order and Extension Notifications Fail Silently *(Phase 2 C2)*
**File:** `backend/src/config/db.js` (migrations)
8+ `notification_type` enum values used in code (`WORK_ORDER_CREATED`, `WORK_ORDER_COST`, `EXTENSION_*`) have no `ADD VALUE` migration. Every work-order and extension notification throws a PostgreSQL enum constraint error that is silently caught, resulting in zero notifications delivered for these workflow steps.

---

### #8 — No Process-Level Error Handlers: Node 15+ Silently Exits on Async Errors *(Phase 3 C1)*
**File:** `backend/server.js`
No `process.on('unhandledRejection')` or `process.on('uncaughtException')` handler. In Node.js 15+, unhandled rejections terminate the process. Any unguarded async error anywhere in the request pipeline can kill the server with a cryptic exit code and no log entry describing what happened.

---

### #9 — 4 High-Severity Dependency Vulnerabilities *(Phase 7 M2)*
**Files:** `backend/package.json`, `frontend/package.json`
- `nodemailer ≤8.0.4` — SMTP command injection (backend)
- `path-to-regexp <0.1.13` — ReDoS (backend)
- `react-router-dom 6.4.0–6.30.2` — XSS via open redirects (frontend)
- `axios 1.0.0–1.14.0` — SSRF, DoS, proto injection (frontend)
Most fixes require only `npm audit fix` with no code changes.

---

### #10 — 7 DB Roles Not in Frontend Route Guards: Users Locked Out *(Phase 5 C2)*
**Files:** `frontend/src/utils/roleConfig.js`, `frontend/src/routes/index.jsx`
`Purchasing_Officer`, `IT_Admin`, `Department_Manager`, `Operator`, `Technician`, `Logistics_Coordinator`, and `Maintenance_Technician` are valid DB roles assignable to users but absent from frontend `ROLES` constant and route guard arrays. Affected users see the wrong dashboard and are blocked from accessing their functional routes.

---

## Proposed Fix Order

Dependencies are noted where one fix enables or simplifies another.

### Sprint 0: Security & Data Integrity (Pre-Launch Blockers)
These must be resolved before any production traffic.

| ID | Fix | Effort | Phase |
|----|-----|--------|-------|
| S0-1 | Enable rate limiting — uncomment 2 lines | **S** | 1 |
| S0-2 | Add process-level error handlers to server.js | **S** | 3 |
| S0-3 | Fix IDOR: add ownership check to GET /:id, /:id/history, /:id/audit-trail | **S** | 1 |
| S0-4 | Add maintenance_schedule migration | **S** | 2 |
| S0-5 | Add notification_type ADD VALUE migrations for 8 missing enum values | **S** | 2 |
| S0-6 | Add 9 missing user_role values to migrations | **S** | 2 |
| S0-7 | Fix notifyDepartment('Accounts') → notifyDepartment('Finance') | **S** | 2 |
| S0-8 | Add POST /purchasing/disbursements role guard | **S** | 3 |
| S0-9 | Exclude /api/auth/* from Workbox runtimeCaching | **S** | 6 |
| S0-10 | Run `npm audit fix` on backend and frontend | **S** | 7 |
| S0-11 | Remove `disburse` withoutApproval flag from raw req.body (add Zod schema) | **M** | 3 |
| S0-12 | Fix DB_PASSWORD fail-fast in env.js (already done for JWT_SECRET — copy pattern) | **S** | 1 |

---

### Sprint 1: Core Reliability (Week 1 Post-Launch)

| ID | Fix | Effort | Phase | Depends On |
|----|-----|--------|-------|------------|
| S1-1 | Add React ErrorBoundary around route tree | **S** | 5 | — |
| S1-2 | Fix `/api/health` to check DB connectivity | **S** | 7 | — |
| S1-3 | Add frontend role coverage for 7 missing DB roles in ROLES constant + route guards | **M** | 5, 1 | — |
| S1-4 | Start scheduler in server.js: `startScheduler()` | **S** | 3, 4 | — |
| S1-5 | Replace console.log with logger calls in controllers/services | **M** | 7 | — |
| S1-6 | Add offline guard to mutation form handlers | **M** | 6 | — |
| S1-7 | Fix 401 interceptor to call Zustand logout() before redirect | **S** | 5 | — |
| S1-8 | Add pagination validation (reject limit > 100) | **S** | 3 | — |
| S1-9 | Fix inventory race conditions with transactions in disburse.service.js | **M** | 4 | — |

---

### Sprint 2: Observability & Performance (Week 2–3)

| ID | Fix | Effort | Phase | Depends On |
|----|-----|--------|-------|------------|
| S2-1 | Add Sentry to backend + frontend | **M** | 7, 5 | S1-1 (ErrorBoundary can wrap Sentry.ErrorBoundary) |
| S2-2 | Implement token denylist for server-side logout | **M** | 1 | — |
| S2-3 | Reduce JWT lifetime to 1h, implement refresh token flow | **L** | 1 | S2-2 |
| S2-4 | Migrate logger.js to JSON format (or replace with pino) | **S** | 7 | S1-5 |
| S2-5 | Fix Zustand selector patterns in 30+ components | **M** | 5 | — |
| S2-6 | Consolidate PurchasingDashboard 11 fetches into summary endpoint | **M** | 5 | — |
| S2-7 | Remove src.zip from repository | **S** | 7 | — |
| S2-8 | Remove .env.example from .gitignore | **S** | 1 | — |
| S2-9 | Self-host Inter font (remove Google Fonts dependency for PWA) | **S** | 6 | — |
| S2-10 | Fix dual toast system: standardize on react-hot-toast | **M** | 5 | — |

---

### Sprint 3: PWA & Long-Term Hardening (Month 1+)

| ID | Fix | Effort | Phase |
|----|-----|--------|-------|
| S3-1 | Add Workbox background-sync for POST mutations | **L** | 6 |
| S3-2 | Differentiated caching strategies (NetworkFirst/StaleWhileRevalidate per data type) | **M** | 6 |
| S3-3 | Move JWT to httpOnly cookie + implement CSRF protection | **L** | 1 |
| S3-4 | Add statement_timeout to DB pool config | **S** | 7 |
| S3-5 | Implement useRegisterSW update prompt | **S** | 6 |
| S3-6 | Fix maskable PWA icon (add safe-zone padding) | **S** | 6 |
| S3-7 | Remove xlsx dead dependency | **S** | 7 |
| S3-8 | Add DB indexes for heavy query columns (phase 2 findings) | **M** | 2 |

---

## Effort Sizing

| Size | Definition |
|------|-----------|
| **S** (Small) | ≤ 2 hours. Single file change. No new dependencies. |
| **M** (Medium) | 0.5–2 days. Multiple files, possibly a new endpoint or hook. |
| **L** (Large) | 3–5 days. New system (refresh token flow, background sync). Requires testing. |

---

## Existing Backlog Mapping (CLAUDE.md)

| CLAUDE.md Item | Review Finding | Sprint |
|----------------|----------------|--------|
| N1: JWT secret externalized ✅ | Completed — no action | — |
| N4: Rate limiting | Phase 1 C1 | S0-1 |
| N5: Transaction wrapping | Phase 4 C3, C4 | S1-9 |
| N7: LoginPage API interceptor ✅ | Completed — no action | — |
| N9: React error boundaries | Phase 5 C1 | S1-1 |
| N10: Remove console.log from authStore ✅ | Completed — no action | — |
| 4.2: Remove duplicate toast system | Phase 5 M7 | S2-10 |
| 4.4: PWA icons | Phase 6 minor | S3-6 |

---

## Overall Production Readiness Assessment

**The system is NOT ready for production deployment** in its current state. The following conditions must be met before going live:

**Absolute blockers (Sprint 0):**
- Rate limiting must be enabled (login brute-force currently unprotected)
- Notification enum migrations must be applied (core workflow notifications broken)
- maintenance_schedule migration must be applied (core MVP feature broken on fresh deploy)
- Process-level error handlers must be added (server can silently die on any async error)
- Workbox auth cache exclusion (deactivated users remain authenticated offline)
- npm audit fixes applied (high-severity vulnerabilities in Express routing and email)

**High-confidence launch criteria (complete Sprint 0 + Sprint 1 S1-1 through S1-4):**
- Rate limiting enabled
- All missing migrations applied
- Scheduler started
- Error boundary added
- Health check checks DB
- Role gaps closed in frontend

With Sprint 0 complete, the system can launch for a limited pilot. With Sprint 1 complete, it is suitable for full production deployment to all users.
