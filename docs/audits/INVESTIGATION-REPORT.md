# EMRS Investigation Report
Generated: 2026-05-01

---

## Part 1 — Suspected Dead Columns

### a) job_team.is_supervisor

**Created in:** No dedicated migration creates this column. The column is absent from all numbered migrations (`004_create_jobs.sql`, `004b_jobs_schema.sql`, `jobs_enhancement.sql`, `017_job_team_updated_at.sql`). It exists in the live schema dump (`backups/emrs-schema.sql:1342`) and has an associated partial index (`idx_job_team_supervisor`, schema line 3024), implying it was added ad-hoc outside the tracked migration set (likely a direct ALTER TABLE).

**Backend refs:**
- `backend/src/modules/jobs/queries/team.queries.js:62` — `isSupervisor` query uses `role = 'SUPERVISOR'` (not the `is_supervisor` column). The alias `is_supervisor` is a computed boolean from a subquery, **not** the column.
- `backend/src/modules/jobs/services/jobs.service.js:26` — reads `result.rows[0]?.is_supervisor` from the above computed alias.
- `backend/src/modules/jobs/services/team.service.js:49` — same pattern.

**Frontend refs:** none found.

**Verdict: GENUINELY DEAD**

**Evidence:** The `is_supervisor` boolean column on `job_team` is never written to and never queried directly. The backend rewrote the supervisor check to use `role = 'SUPERVISOR'` (the `job_team_role` enum), making the old boolean redundant. The partial index `idx_job_team_supervisor WHERE (is_supervisor = true)` maintains overhead with zero benefit. The column was scaffolded in an early schema draft but superseded by the role enum approach.

---

### b) job_team.approval_limit

**Created in:** No migration creates this column. Present in live schema (`backups/emrs-schema.sql:1343`): `approval_limit numeric(12,2) DEFAULT 0`. No index exists on it.

**Backend refs:** none found across all `.js` files in `backend/src/`.

**Frontend refs:** none found across all `.jsx/.js/.ts/.tsx` files in `frontend/src/`.

**Verdict: GENUINELY DEAD**

**Evidence:** Zero references in any application code. The column was scaffolded for a per-member approval authorization feature (approving job expenses up to a dollar limit) that was never implemented. Safe to drop.

---

### c) job_team.notes

**Created in:** `backend/migrations/jobs_enhancement.sql:60` creates the `job_team` table with a `notes TEXT` column. It is also present in the live schema (`backups/emrs-schema.sql:1347`).

**Backend refs (in context of job_team):** Searching for `jt.notes` or SQL involving `job_team` with `notes` yields zero results in `backend/src/`. The `team.queries.js` SELECT query uses `jt.*` which would include `notes`, but no code reads or writes `jt.notes` explicitly.

**Frontend refs:** none found.

**Verdict: GENUINELY DEAD**

**Evidence:** The `job_team` table `notes` column is pulled in via `SELECT jt.*` but never used by any service, controller, or validation schema. No form field or API call writes it. It was scaffolded alongside the team table but never wired into the team member add/edit flow.

---

### d) users.notify_on_return

**Created in:** Not found in any tracked migration. `backend/migrations/007_emrs_v2_purchasing_flow.sql:178-180` adds `notify_on_disbursement`, `notify_on_request_approval`, and `notify_on_return_overdue` — but **not** `notify_on_return`. The column exists in the live schema (`backups/emrs-schema.sql:1899`): `notify_on_return boolean DEFAULT false`. It was likely added ad-hoc.

**Backend refs:** Zero — no file in `backend/src/` references `notify_on_return`, `notify_on_disbursement`, `notify_on_request_approval`, or `notify_on_return_overdue`. All four `notify_on_*` columns are completely unwired.

**Frontend refs:** Zero — no file in `frontend/src/` references any `notify_on_*` field.

**Verdict: GENUINELY DEAD**

**Evidence:** The entire `notify_on_*` preference column family (`notify_on_return`, `notify_on_disbursement`, `notify_on_request_approval`, `notify_on_return_overdue`) is dead. None are read by the notification service, none appear in the user settings form, and none are in any validation schema. They were scaffolded for a per-user notification preference feature that was never implemented in the MVP.

---

## Part 2 — Suspected Dead Tables

### a) job_inspections

**Created in:**
- `backend/migrations/004_create_jobs.sql:62` — original `job_inspections` table (5 columns, simple schema)
- `backend/migrations/jobs_enhancement.sql:101` — enhanced version with checklist_data, attachments, updated_at

**Backend refs:** Zero — no file in `backend/src/` references `job_inspections`. The jobs module uses `job_equipment_inspections` (a newer, richer table) instead.

**Frontend refs:** Zero.

**Verdict: GENUINELY DEAD**

**Evidence:** The `job_inspections` table was the original v1 inspection concept. It was superseded by `job_equipment_inspections` (per-equipment, per-job item inspection with checklist JSONB, draft mode, manager sign-off, etc.). The backend inspection module (`backend/src/modules/jobs/queries/inspection.queries.js`, `services/inspection.service.js`) exclusively uses `job_equipment_inspections` and `inspection_failed_items`. The old `job_inspections` table is an orphaned v1 relic.

---

### b) maintenance_log

**Created in:** `backend/migrations/002_create_equipment.sql:61` — original `maintenance_log` table (7 columns). Index `idx_maintenance_log_equipment` on line 77.

**Backend refs:**
- `backend/src/modules/equipment/equipment.queries.js:216` — `logMaintenance` inserts into `maintenance_log`
- `backend/src/modules/equipment/equipment.queries.js:223` — `getMaintenanceLog` reads from `maintenance_log`
- `backend/src/modules/equipment/equipment.service.js:288-300` — `logMaintenance` and `getMaintenanceLog` services call these queries
- `backend/src/modules/equipment/equipment.routes.js:74,76` — routes expose `GET /:id/maintenance-log` and `POST /:id/maintenance`

**Frontend refs:**
- `frontend/src/features/equipment/services/equipmentService.js:56` — `getMaintenanceLog`
- `frontend/src/services/endpoints.js:33` — `MAINTENANCE_LOG` endpoint constant defined
- `frontend/src/features/equipment/components/AddLogModal.jsx:18` — MAINTENANCE_LOG_TYPES constant for UI
- `frontend/src/features/equipment/components/LogFilters.jsx:19` — same

**Verdict: ACTIVE**

**Evidence:** `maintenance_log` is a live, actively used table for the simple equipment maintenance logging flow (`POST /equipment/:id/maintenance`). It is distinct from `equipment_maintenance_log`, which is a richer audit-style table used by the newer `equipmentLogs` module. Both tables are active but serve different purposes: `maintenance_log` is the simple write path from the equipment form; `equipment_maintenance_log` is the detailed structured log with labor hours, cost, parts, etc.

---

### c) job_status_history

**Created in:**
- `backend/migrations/004b_jobs_schema.sql:74` — `job_status_history` table
- `backend/migrations/jobs_enhancement.sql:119` — second creation (IF NOT EXISTS)

**Backend refs:**
- `backend/src/modules/jobs/queries/workflow.queries.js:57` — `addHistory` inserts into `job_status_history`
- `backend/src/modules/jobs/queries/workflow.queries.js:63` — `getHistory` reads from `job_status_history`
- `backend/src/modules/jobs/services/workflow.service.js:18,27,35,54,60,66,73` — writes history on every status transition
- `backend/src/modules/jobs/services/jobs.service.js:99` — writes initial 'DRAFT' record on job creation
- `backend/src/modules/jobs/services/jobs.service.js:73` — reads history as part of job detail payload

**Frontend refs:**
- `frontend/src/features/jobs/services/jobsService.js:19` — `getStatusHistory` API call defined
- `frontend/src/features/jobs/hooks/useJobsWrite.js:35` — `getHistory` action used by item history

**Verdict: ACTIVE (within jobs module, which is post-MVP)**

**Evidence:** `job_status_history` is actively written to and read from within the jobs module backend. It is part of the post-MVP jobs feature. It is not dead — it is scaffolding for the jobs feature that is intentionally disabled for MVP.

---

### d) job_item_comments

**Created in:** No migration file creates `job_item_comments`. It exists in the live schema dump (`backups/emrs-schema.sql:1272`) with 2 indexes (`idx_job_item_comments_item`, `idx_job_item_comments_created`), suggesting it was created directly in the database outside the tracked migration set.

**Backend refs:** Zero — no file in `backend/src/` references `job_item_comments` or any equivalent.

**Frontend refs:** Zero — no file in `frontend/src/` references `job_item_comments`.

**Verdict: GENUINELY DEAD**

**Evidence:** The table exists in the live schema but has no corresponding migration and zero code references in either backend or frontend. It was intended for a threaded commenting feature on job equipment items (visible to purchasing, per `is_visible_to_purchasing` column) that was never implemented. Pure DB scaffolding with no application wiring whatsoever.

---

## Part 3 — Forward-Looking Code

| File:line | Category | Intentional? | Note |
|-----------|----------|--------------|------|
| `frontend/src/routes/groups/jobsRoutes.jsx:14,17,20,23,26` | ROUTE STUB | Yes | All 5 jobs routes are gated behind `DEV_PREVIEW_ROLES = [ROLES.SUPER_ADMIN]`. Effectively Super_Admin-only preview. The entire jobs module (JobList, CreateJob, EditJob, JobDetail, PurchasingQueuePage) is accessible only to Super_Admin. |
| `frontend/src/config/sidebarConfig.js:33-34` | NAV LINK (post-MVP) | Yes | `/jobs` and `/jobs/purchasing-queue` appear in Super_Admin sidebar under "In Development" divider — matches gated routes. |
| `frontend/src/features/jobs/routes.js` | DEAD FILE | No | This file is a comment-only scaffold document listing route configurations as comments/strings. It exports `JOBS_ROLES`, `JOB_MANAGER_ROLES`, `PURCHASING_ROLES` arrays but these are never imported anywhere. The actual routes are in `frontend/src/routes/groups/jobsRoutes.jsx`. This file is stale documentation masquerading as code. |
| `frontend/src/features/jobs/pages/PurchasingQueue.jsx` | DEAD PAGE | No | The old `PurchasingQueue.jsx` is exported from `frontend/src/features/jobs/pages/index.js:5` but never lazy-imported by any router. The router uses `purchasing/PurchasingQueuePage.jsx` instead. `PurchasingQueue.jsx` references `frontend/src/features/jobs/routes.js:68` as a lazy import comment, which is itself dead code. |
| `frontend/src/services/endpoints.js:116-119` | DEAD ENDPOINT CONSTANT | No | `ACTIVITY` constant (`BASE: '/activity-logs'`) is never imported anywhere. `ActivityLogs.jsx` uses a local constant `ACTIVITY_ENDPOINT = '/activity'` (correct — matches backend route). The endpoints.js constant points to the wrong path AND is unused. |
| `frontend/src/services/endpoints.js:37-41` | DEAD ENDPOINT CONSTANT | No | `MAINTENANCE` constant (`BASE: '/maintenance'`, `BY_EQUIPMENT`) is never imported anywhere. The maintenance module uses inline paths. |
| `frontend/src/services/endpoints.js:20-24` | DEAD ENDPOINT CONSTANT | No | `DEPARTMENTS` constant (`BASE: '/departments'`) is never imported. No code fetches from `/departments`. |
| `frontend/src/services/endpoints.js:128-133` | DEAD ENDPOINT CONSTANT | No | `SUPERVISOR` constant (3 endpoints) is never imported anywhere. No backend `/supervisor` router exists in `backend/src/routes/index.js`. These endpoints point to a non-existent API. |
| `frontend/src/services/endpoints.js:121-126` | ORPHANED ENDPOINT CONSTANT | Yes | `FIELD_REPORTS` constant is defined but never imported in the frontend. The backend route exists (`router.use('/field-reports', ...)`). No frontend page or route references field reports — confirmed post-MVP. |
| `frontend/src/features/jobs/services/endpoints.js` | DUPLICATE ENDPOINTS | Uncertain | A second `endpoints.js` file exists inside `features/jobs/services/`. Needs review to determine if it conflicts with or duplicates `frontend/src/services/endpoints.js`. |
| `frontend/src/features/purchasing/pages/PurchasingDashboard.jsx:94` | TODO | No | `// TODO: Implement true per-item disbursement in backend` — unimplemented feature noted in MVP code. |
| `frontend/src/config/sidebarConfig.js:30,58` | NAV LINK | Partial | `/requests/all` appears in both `getSuperAdminSidebar` and `getAdminSidebar`. The route exists and is gated to `ADMIN_ROLES = [Super_Admin, Admin]` which matches. However, `Purchasing_Manager` and `Accounts_Manager` sidebars include `/requests/all` via children arrays — these roles are NOT in `ADMIN_ROLES`, so they will hit an Unauthorized redirect. Needs verification. |

**Feature Flags:** None found. No `FEATURES.`, `ENABLE_`, `feature_flag`, or `featureFlag` pattern exists in `frontend/src/`.

**Hooks defined but not called:**
- All hooks in `frontend/src/hooks/` (`useApi`, `useDebounce`, `useOffline`, `usePagination`) are imported in multiple component files — all active.
- Feature hooks in `frontend/src/features/*/hooks/` — all are imported by their respective page/component files. No orphaned hooks found.

**Validation schemas with fields not on any form:**
- `backend/src/modules/jobs/validation/team.validation.js` — defines `addTeamMemberSchema`, `addTeamMembersSchema`, `updateTeamRoleSchema`. These are wired into the jobs team routes. No dead fields found.
- `backend/src/modules/users/users.validation.js` — does not include any `notify_on_*` fields (correct, since those columns are dead).
- The four `notify_on_*` columns have no corresponding validation schema fields, confirming they are genuinely dead DB columns with no frontend form.

---

## Part 4 — Confirmed Post-MVP Modules

- **vendors module:** CONTRADICTING EVIDENCE — actively wired. Backend: `backend/src/modules/vendors/` (full CRUD), `backend/src/routes/index.js:48` mounts at `/vendors`. Frontend: `frontend/src/features/purchasing/pages/VendorsPage.jsx` calls `VENDORS.*` endpoints; route registered at `/purchasing/vendors` in `purchasingRoutes.jsx:19`; visible in Purchasing sidebar. Vendors are also used in the request approval flow (`ManagerVendorSection.jsx`, `VendorConfirmSection.jsx`). **Vendors are IN the MVP.**

- **purchase_orders:** CONFIRMED POST-MVP. The `purchase_orders` table exists in the schema and is referenced only in `backend/src/modules/vendors/vendors.queries.js` (subqueries for vendor stats: order count, total spend). There is no `purchase_orders` module, no routes, no frontend page. The vendors queries reference it but it appears to hold no data and no write path exists. Pure scaffolding.

- **vendor_reviews:** CONFIRMED POST-MVP. Referenced only in `backend/src/modules/vendors/vendors.queries.js:22,93` (review count subquery, addReview insert). No frontend component calls the review endpoint. Scaffolded in the vendor module but not surfaced in UI.

- **field_reports:** CONFIRMED POST-MVP. Backend module exists and is mounted (`/field-reports`). No frontend route, no page, no import, no navigation link to field reports. `FIELD_REPORTS` endpoint constant in `endpoints.js` is never imported. Referenced only in `activityFilterConfig.js` for activity log filtering (cosmetic, not functional).

- **damaged_inventory:** CONTRADICTING EVIDENCE — actively wired. Backend: `backend/src/modules/purchasing/damagedInventory.controller.js` and `damagedInventory.service.js` are mounted via `purchasing.routes.js`. Frontend: `DamagedInventoryPage.jsx` calls `useApi('/purchasing/damaged-inventory?...')`. Route registered at `/purchasing/damaged`. Also integrated into the return flow (`requests/services/return-helpers.js`). **Damaged inventory is IN the MVP.**

- **swap_requests:** CONFIRMED POST-MVP within jobs module. Referenced in `backend/src/modules/jobs/queries/purchasing.queries.js:97-106` and `services/purchasing.service.js:14,38,47`. Frontend references in `frontend/src/features/jobs/constants.js:375`, `QueueTabs.jsx:18`. These are inside the jobs feature which is gated to `DEV_PREVIEW_ROLES = [Super_Admin]`.

- **additional_requests:** PARTIALLY WIRED (mixed). The `additional_requests` table is used in the jobs purchasing queue (`jobs/queries/purchasing.queries.js:117-124`). However, in the MVP requests/maintenance flow, `maintenance.service.js:79-96` queries for "additional_requests" as supplemental items for a work order — this IS in the active maintenance module. The concept exists in two contexts: (1) jobs-module additional requests (post-MVP), (2) maintenance work order linked requests (MVP-adjacent). The DB table is referenced in active MVP-adjacent code.

- **return_extensions:** CONTRADICTING EVIDENCE — actively wired. Backend `extensions` module is mounted. Frontend `useExtensions.js`, `ExtensionRequestModal.jsx`, `PendingExtensionsPanel.jsx` all use `EXTENSIONS.*` endpoints. **Return extensions are IN the MVP.**

- **jobs feature (whole module):** CONFIRMED POST-MVP for regular users. The module is built but access-gated to `DEV_PREVIEW_ROLES = [Super_Admin]` only. All 5 job routes, all job pages, the jobs backend module (controllers, services, queries) exist and function but are not accessible to normal users. Backend jobs routes ARE mounted at `/jobs` — a Super_Admin could use them via API.

- **inspection workflow (job_pre_inspections, post_job_inspections, job_equipment_inspections, inspection_failed_items):**
  - `job_equipment_inspections` and `inspection_failed_items`: CONFIRMED POST-MVP (within jobs). Both tables are queried extensively in `backend/src/modules/jobs/queries/inspection.queries.js` and `services/inspection.service.js`. Frontend inspection modals (`PreInspectionModal.jsx`, `ViewInspectionModal.jsx`) and hooks use these. All gated inside the jobs module (Super_Admin only).
  - `job_pre_inspections`: Defined in `006c_jobs_enhancement.sql` and referenced in `frontend/src/features/jobs/hooks/useJobsRead.js`. Post-MVP (jobs module).
  - `post_job_inspections`: Exists in schema (`backups/emrs-schema.sql:1551`). Not found in any current backend source code — appears to be DB scaffolding only. Zero refs in `backend/src/` or `frontend/src/`.
  - `job_inspections` (the old v1 table): GENUINELY DEAD — see Part 2a.

---

## Recommended Action List

### SAFE TO DROP NOW
These have zero application references, no active data path, and are confirmed dead:

- `job_team.is_supervisor` (boolean column) — superseded by `role = 'SUPERVISOR'` enum check; also drop associated index `idx_job_team_supervisor`
- `job_team.approval_limit` (numeric column) — never written or read
- `job_team.notes` (text column) — never written or read explicitly
- `users.notify_on_return` (boolean column) — entire `notify_on_*` family is dead; also review `notify_on_disbursement`, `notify_on_request_approval`, `notify_on_return_overdue` for the same reason
- Table `job_inspections` — v1 relic superseded by `job_equipment_inspections`; has its own index `idx_job_inspections_job` (drop too)
- Table `job_item_comments` — no migration, no code refs, never used; drop indexes `idx_job_item_comments_item` and `idx_job_item_comments_created`

### KEEP AS SCAFFOLDING
These are intentionally deferred post-MVP features with real code written:

- `job_status_history` table — actively written by the jobs workflow service; part of the jobs post-MVP feature
- `job_pre_inspections` table — part of the jobs inspection workflow (post-MVP)
- `post_job_inspections` table — DB exists, referenced from schema; part of jobs post-MVP (note: currently has zero backend service code, review before launch)
- `job_equipment_inspections` and `inspection_failed_items` — complete inspection workflow for jobs module (post-MVP)
- `additional_requests` table — used in both jobs module (post-MVP) and maintenance work order flow (MVP-adjacent); keep
- `swap_requests` table — jobs module post-MVP
- `purchase_orders` table — vendor stats scaffolding; keep until vendor reviews are built
- `vendor_reviews` table — keep; vendor module is MVP and reviews are a natural extension
- `field_reports` table and backend module — complete scaffolding, preserve
- `users.notify_on_disbursement`, `notify_on_request_approval`, `notify_on_return_overdue` — if a notification preferences settings page is planned post-MVP, keep; otherwise drop

### INVESTIGATE FURTHER
- `frontend/src/features/jobs/routes.js` — This file exports `JOBS_ROLES`, `JOB_MANAGER_ROLES`, `PURCHASING_ROLES` but these exports are imported nowhere. The file is primarily comment documentation. Confirm it can be deleted before the jobs module is properly launched — it contains stale role arrays that conflict with the actual `routeRoles.js` definitions.
- `frontend/src/features/jobs/pages/PurchasingQueue.jsx` (old) — Exported from `pages/index.js` but never routed. Determine if this is intentionally kept as a v1 fallback or should be deleted in favor of `purchasing/PurchasingQueuePage.jsx`.
- `frontend/src/features/jobs/services/endpoints.js` — A second endpoints file exists inside the jobs feature. Confirm it does not conflict with or duplicate `frontend/src/services/endpoints.js`.
- `post_job_inspections` table — Exists in schema with indexes but zero backend code references found. Verify before the post-MVP inspection workflow launch.
- `/requests/all` in sidebar for non-admin manager roles — Sidebar configs for roles not in `ADMIN_ROLES` include the "All Requests" link. Affected sidebars: `getPurchasingManagerSidebar` and `getPurchasingStaffSidebar` do NOT include it (correct), but verify `getManagerSidebar` — it does not include `/requests/all` (correct). Low risk but confirm.
- `maintenance_log` vs `equipment_maintenance_log` — Two separate tables serve overlapping purposes. `maintenance_log` is the simple path (used by `POST /equipment/:id/maintenance`). `equipment_maintenance_log` is the richer audit log. Confirm whether both write paths remain intentional or if one should be deprecated.

### FIX FORWARD-LOOKING CODE
These are safe code cleanups that reduce confusion without breaking anything:

1. **`frontend/src/services/endpoints.js`** — Remove or correct dead constants:
   - `ACTIVITY` constant: points to `/activity-logs` (wrong path, unused) — remove
   - `MAINTENANCE` constant: never imported — remove
   - `DEPARTMENTS` constant: never imported — remove
   - `SUPERVISOR` constant: no backend route exists — remove
   - `FIELD_REPORTS` constant: never imported in frontend (backend exists, but frontend has no page) — keep but add a comment marking it as post-MVP

2. **`frontend/src/features/jobs/routes.js`** — Delete this file. It is stale comment documentation that exports unused constants. Route configurations live in `frontend/src/routes/groups/jobsRoutes.jsx`.

3. **`frontend/src/features/jobs/pages/PurchasingQueue.jsx`** (old) — Remove this file once confirmed the router exclusively uses `purchasing/PurchasingQueuePage.jsx`. Also remove the export from `frontend/src/features/jobs/pages/index.js:5`.

4. **`frontend/src/features/purchasing/pages/PurchasingDashboard.jsx:94`** — `TODO: Implement true per-item disbursement in backend` — Track this as a post-MVP task (already noted in CLAUDE.md task list as 3.7 / POST_MVP).

5. **`backend/src/modules/jobs/queries/d.html`** — A stray HTML file exists at `backend/src/modules/jobs/queries/d.html`. This is almost certainly a debug artifact that should be deleted from the source tree.
