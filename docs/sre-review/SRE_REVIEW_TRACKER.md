# EMRS SRE Review Tracker

## Progress
- [x] Phase 1: Security & Auth — 2026-04-23 — 5 critical / 7 major / 7 minor
- [x] Phase 2: Database & Queries — 2026-04-24 — 6 critical / 7 major / 7 minor
- [x] Phase 3: API Resilience — 2026-04-24 — 3 critical / 7 major / 7 minor
- [x] Phase 4: Availability, Scalability & Concurrency — 2026-03-27 — 5 critical / 7 major / 8 minor
- [x] Phase 5: Frontend State & Performance — 2026-04-24 — 2 critical / 7 major / 7 minor
- [x] Phase 6: PWA & Offline — 2026-04-24 — 2 critical / 5 major / 5 minor
- [x] Phase 7: Observability & Ops — 2026-04-24 — 2 critical / 5 major / 7 minor

## Applied Fixes

### Sprint 0 — Security & Stability (S0-1 through S0-18) ✅ All Applied
All 18 items verified and applied 2026-04-24.

### Sprint 1 — Reliability & UX (S1-1 through S1-19) ✅ All Applied
All 19 items verified and applied 2026-04-25.

### Sprint 2 — Observability & Performance (S2-1 through S2-18) ✅ All Applied
All 18 items verified and applied 2026-04-28.

### Additional Fixes (Outside Original Sprint Plan)
| Fix | Date | Description |
|-----|------|-------------|
| Overdue reminders SQL | 2026-04-25 | `overdueReminders.service.js` crashed with `relation "departments" does not exist`; replaced broken `LEFT JOIN departments` with `LEFT JOIN LATERAL` subquery matching manager-role user by `users.department` text |
| Rate limiter tuned | 2026-04-25 | `apiLimiter.max` raised 100 → 300; SWR polls ~10 endpoints per tab every 60s — 100 was too tight for normal multi-tab usage |
| Force password reset | 2026-04-25 | Migration `012_must_change_password.sql`; `ForcePasswordResetPage.jsx`; `ProtectedRoute` blocks all routes if `user.mustChangePassword === true`; `authService.changePassword` returns new token |
| Suspense loading flash | 2026-04-25 | `<Suspense>` moved inside `MainLayout` wrapping only `<Outlet />`; `ContentLoader` component added; duplicate `OfflineBanner` removed from `App.jsx` |
| Dark mode flash fix | 2026-04-28 | Inline pre-paint script in `index.html` reads `localStorage` theme before first paint; eliminates white flash on dark mode load |
| iOS zoom fix | 2026-04-28 | All inputs set to `font-size: 16px` minimum; prevents iOS Safari auto-zoom on focus |
| Request Hub responsive grid | 2026-04-28 | Stat cards and request list grid fixed for mobile breakpoints |
| Disburse validation fixes | 2026-04-28 | `expected_return_date` date format normalised; `disbursed_without_approval` flow validated via Zod schema |
| Modal scroll lock + timeline mobile | 2026-04-28 | `overflow-hidden` on `<body>` when modal open; timeline component fixed for narrow viewports |
| Admin dashboard routing fix | 2026-05-01 | "View Now" button navigated to non-existent `/requests/dept-requests` (matched `/:id`, 400 error); fixed to `/requests/dept` |
| Dept requests Admin filter | 2026-05-01 | `getDeptRequests` now passes `department = null` for Admin/Super_Admin so they see all departments |
| Equipment department filter | 2026-05-01 | Equipment list respects `user.department` for non-admin roles |
| Transfer visibility in dept queues | 2026-05-01 | `findAll` + `countAll` SQL: added `OR r.transferred_to::text = $5`; `DeptRequests.jsx` shows "Transferred to X" / "Transferred from Y" badge |
| Transfer test seed script | 2026-05-01 | `backend/scripts/seed-transfer-requests.js` — inserts 2 PPE requests per dept (IT/HR/Logistics/Workshop) with `transferred_to` set; used to verify dept queue visibility fix |

## Cross-Cutting Concerns
- **Inventory race conditions** — requests module (disburse.service.js) and maintenance module (maintenance.service.js) need atomic quantity guards
- ✅ **Rate limiting** — enabled across all routes; `apiLimiter` max raised to 300 (2026-04-25)
- **Console.log in production** — 138 instances across backend; N10 (authStore.js) cleared; remainder unaddressed
- ✅ **Scheduler never started** — `startScheduler()` wired in server.js (S1)
- ✅ **No token refresh endpoint** — `POST /auth/refresh` added; `authService.refreshToken()` on frontend (S1)
- **JWT stored in localStorage** — XSS-vulnerable token storage; Zustand persist uses localStorage backend (Phase 1 / Phase 5)
- **No server-side token invalidation** — logout clears client state only; stolen tokens stay valid 7 days (Phase 1)
- **IDOR on requests** — GET /:id, /:id/history, /:id/audit-trail have no ownership/role check (Phase 1 / Phase 3)
- ✅ **Role system overhaul** — 2026-05-01: IT_Admin→IT_Manager (migration `014_rename_it_admin.sql`); Purchasing_Officer + Department_Manager removed from all code (kept in DB enum); IT_Manager/HR_Manager/Logistics_Manager/Workshop_Manager added to MANAGER_ROLES, ELEVATED_ROLES, AUTO_APPROVE_ROLES, MANAGERS_PLUS, CAN_ADD_DIRECTLY_ROLES, extensions.routes.js, users.routes.js, frontend route guards, sidebarConfig.js; Safety_Manager and IT_Support sidebars fixed
- **Remaining ROLE_HIERARCHY gap** — Operator, Technician, Logistics_Coordinator, Maintenance_Technician still default to level 0 (low risk — staff roles, no elevated access needed)
- **maintenance_schedule table missing from all migrations** — core MVP module has no migration; fresh deploy will fail (Phase 2)
- ✅ **Notification enum drift** — 8+ notification_type values fixed; ADD VALUE migrations applied (Phase 1 task 1.1)
- **9 user_role values missing from migrations** — Super_Admin, IT_Support, Accounts_Manager, Accounts_Staff, Safety_Manager, Logistics_Manager, HR_Manager, Purchasing_Staff, Staff not in any migration (Phase 2)
- **notifyDepartment('Accounts') wrong department** — approval.service.js uses 'Accounts'; DB enum is 'Finance'; zero users notified on work-order events (Phase 2)
- ✅ **Frontend enum constants out of sync** — REQUEST_STATUS, priority levels, maintenance_type aligned (Phase 1 tasks 1.2, 1.7)
- **No process-level error handlers** — no unhandledRejection/uncaughtException; Node 15+ exits silently on async errors (Phase 3)
- **Disburse endpoint unvalidated** — withoutApproval bypass flag accepted from raw req.body, no Zod schema on route (Phase 3)
- **POST /purchasing/disbursements no role guard** — any authenticated user can create disbursement records (Phase 3)
- **Pagination parameters unvalidated** — limit=999999 forces full-table queries across all list endpoints (Phase 3)
- ✅ **No React Error Boundary** — `ErrorBoundary` wraps all routes in `App.jsx` (S1)
- ✅ **7 DB roles unhandled in frontend route guards** — Resolved 2026-05-01 via role system overhaul: IT_Manager/HR_Manager/Logistics_Manager/Workshop_Manager fully wired; Purchasing_Officer/Department_Manager/IT_Admin removed; Operator/Technician/Maintenance_Technician/Logistics_Coordinator handled by staff sidebar fallback
- **Dual toast systems** — react-hot-toast and uiStore.addNotification both active; inconsistent UX (Phase 5)
- **PurchasingDashboard fires 11 concurrent SWR requests per mount** — 11 × 60s polling per Purchasing user stresses single-server DB pool (Phase 5)
- ✅ **Duplicate OfflineBanner** — removed from `App.jsx`; single instance remains in `MainLayout` (2026-04-25)
- ✅ **Suspense wraps MainLayout** — fixed; Suspense now inside MainLayout, wrapping only Outlet; sidebar stays mounted during route transitions (2026-04-25)
- **Workbox caches auth endpoints** — GET /auth/me cached for 24h; deactivated users appear authenticated offline (Phase 6)
- **No offline mutation guard or queue** — form submissions fail silently offline; no background sync; data loss risk for field engineers (Phase 6)
- **No error tracking service** — backend/frontend errors invisible in production; no Sentry or equivalent (Phase 7)
- **138 console.* calls bypass structured logger** — unstructured text output, level filtering ineffective, potential PII in logs (Phase 7)
- **4 high-severity + 3 moderate dependency vulnerabilities** — nodemailer SMTP injection, path-to-regexp ReDoS, react-router-dom XSS, axios SSRF (Phase 7)

## Summary Statistics
Total findings (Phase 1): 5 critical, 7 major, 7 minor
Total findings (Phase 2): 6 critical, 7 major, 7 minor
Total findings (Phase 3): 3 critical, 7 major, 7 minor
Total findings (Phase 4): 5 critical, 7 major, 8 minor
Total findings (Phase 5): 2 critical, 7 major, 7 minor
Total findings (Phase 6): 2 critical, 5 major, 5 minor
Total findings (Phase 7): 2 critical, 5 major, 7 minor
**Combined running total: 25 critical, 45 major, 48 minor**

### Applied (Sprint 0 + Sprint 1 + Sprint 2 + Additional)
- Sprint 0: 18 items ✅
- Sprint 1: 19 items ✅
- Sprint 2: 18 items ✅
- Additional fixes: 14 items ✅
- Cross-cutting resolved: 10+ of 29 concerns ✅

### Remaining (Sprint 3 — Low Priority / Hardening)
1. Workbox background-sync for POST mutations (S3-1)
2. Differentiated caching strategies (S3-2)
3. Move JWT to httpOnly cookie + CSRF (S3-3)
4. DB statement_timeout (S3-4)
5. SW update prompt (S3-5)
6. Maskable PWA icon (S3-6)
7. Remove xlsx dead dep (S3-7)
8. DB indexes for heavy query columns (S3-8)

### Known Outstanding Issues (Non-Sprint)
- Activity log "null action" error on equipment events — investigate `activityLogger.js`
- React Router v7 future flag warnings (2 harmless console warnings — v7 prep)
- `backend/migrations/014_rename_it_admin.sql` needs to be run against live DB
- `backend/migrations/013_token_denylist.sql` needs to be run against live DB
- `npm install` needed in `frontend/` for `@fontsource/inter` (S2-9)
- Stitch frontend redesign — separate track, new UI designs pending
