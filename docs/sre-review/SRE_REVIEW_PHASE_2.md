# SRE Review — Phase 2: Database & Queries
**Date:** 2026-04-24
**Reviewer:** Claude Code (SRE Skill)
**Scope:** All migration files, all `.queries.js` files, seed data, db.js pool config, frontend enum constants, N+1 patterns, schema integrity.

---

## Critical Issues (Must Fix Before Launch)

### C1 — `maintenance_schedule` Table Has No CREATE TABLE Migration
- **Issue:** The maintenance module's primary table (`maintenance_schedule`) is referenced in migrations `006_equipment_logs.sql` (adds columns), `007_emrs_v2_purchasing_flow.sql` (creates FK references), and `009_manager_approved_status.sql` (adds index) — but the `CREATE TABLE maintenance_schedule` statement does not exist in ANY migration file.
- **Location:** All files under `backend/migrations/` — the table is conspicuously absent.
- **Impact:** Running the migration runner on a fresh PostgreSQL database will fail mid-way when `006_equipment_logs.sql` tries to `ALTER TABLE maintenance_schedule`. The entire maintenance module — a core MVP feature — cannot be set up from the documented migrations. This is a data-loss risk at deployment and blocks any future developer onboarding.
- **Fix:** Create a migration file `005b_create_maintenance_schedule.sql` that contains the full `CREATE TABLE maintenance_schedule` DDL (columns, FK constraints, indexes). It must sort after `002_create_equipment.sql` and before `006_equipment_logs.sql`.

---

### C2 — Migration Order Broken: `001_jobs_schema.sql` References `equipment` Before It's Created
- **Issue:** The migrations runner sorts files alphabetically. `001_jobs_schema.sql` runs **before** `002_create_equipment.sql` (alphabetically `001_j` < `002_c` is false — `001_c` < `001_j` < `002_c`, so order is correct there). However `001_jobs_schema.sql` line 52 creates a FK: `equipment_id UUID REFERENCES equipment(id)`. The `equipment` table is created in `002_create_equipment.sql`. Running migrations in order will succeed only because `001_c` < `001_j` < `002_c` — but `001_jobs_enhancement.sql` also references `equipment` in FK constraints. The problem is `001_jobs_schema.sql` also references `jobs(id)` (line 40, 50, 76), but the `jobs` table is only created in `004_create_jobs.sql`. This means `001_jobs_schema.sql` will always fail on a fresh DB because `jobs` doesn't exist when it runs.
- **Location:** `backend/migrations/001_jobs_schema.sql:40,50,76` referencing `jobs(id)` which is created in `004_create_jobs.sql`
- **Impact:** Complete migration failure on any fresh database. The `job_team`, `job_equipment_items`, and `job_status_history` tables cannot be created.
- **Fix:** Rename `001_jobs_schema.sql` → `004b_jobs_schema.sql` so it runs after `004_create_jobs.sql`. Apply the same to `001_jobs_enhancement.sql` if it has similar dependencies (rename to `004c_jobs_enhancement.sql`). Add a comment at the top of each migration file documenting its dependencies.

---

### C3 — Seed Data Fails: `'Executive'` Department Not in DB Enum
- **Issue:** `seed.js:14` inserts the Super Admin user with `department = 'Executive'`. The `department` PostgreSQL enum (`001_create_users.sql`) only contains: `Operations, Engineering, Maintenance, Logistics, Safety, Purchasing, HR, Finance, IT, Management, Workshop, Field_Services`. The value `'Executive'` is not valid.
- **Location:** `backend/src/config/seed.js:14`
- **Impact:** Seeding fails immediately with `ERROR: invalid input value for enum department: "Executive"`. No test users, no equipment, no inventory — the entire database is unusable after migrations.
- **Fix:** Change `'Executive'` to `'Management'` (the closest equivalent in the DB enum):
  ```js
  ['superadmin@wellfluid.com', superAdminPassword, 'Super', 'Admin', 'Super_Admin', 'Management', true]
  ```

---

### C4 — Notification Enum Values Used in Code Are Not in Any Migration
- **Issue:** Multiple notification type values are used in backend code but were never added to the `notification_type` PostgreSQL enum via any migration `ADD VALUE` statement. `notifications.queries.js:26` casts to `::notification_type`, so any INSERT with an unlisted value throws a PostgreSQL error.
  
  Values used in code but absent from all migrations:
  | Value | Used In |
  |-------|---------|
  | `WORK_ORDER_CREATED` | `approval.service.js:169` |
  | `WORK_ORDER_COST` | `approval.service.js:190` |
  | `EXTENSION_REQUESTED` | `extensions/services/create.service.js:46` |
  | `EXTENSION_SUBMITTED` | `extensions/services/create.service.js:60` |
  | `EXTENSION_MANAGER_APPROVED` | `extensions/services/manager.service.js:34` |
  | `EXTENSION_PROGRESS` | `extensions/services/manager.service.js:48` |
  | `EXTENSION_APPROVED` | `extensions/services/purchasing.service.js:33` |
  | `EXTENSION_REJECTED` | `extensions/services/manager.service.js:95` |

  The `phase5-accounts.sql` migration correctly adds `Work_Order_Completed`, `Payment_Recorded`, and `High_Cost_Work_Order`, but it uses **mixed case** (`Work_Order_Completed`) inconsistent with the rest of the enum (which is `SCREAMING_SNAKE_CASE`). The accounts.service.js:217 correctly uses `'High_Cost_Work_Order'` / `'Work_Order_Completed'` matching these, but they were added via a separate `src/config/migrations/` file that is not part of the main migration runner (`src/config/migrate.js` only reads `../../migrations/`).

- **Location:** `backend/migrations/` — no ADD VALUE for the 8 types above; `backend/src/config/migrations/phase5-accounts.sql` — not run by `migrate.js`
- **Impact:** Every maintenance request approval (that creates a work order) throws a 500 error when trying to send `WORK_ORDER_CREATED` notification. Every return extension action throws a 500 error. These are core MVP workflows.
- **Fix:** Add a new migration `010_notification_type_additions.sql`:
  ```sql
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'WORK_ORDER_CREATED' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'notification_type')) THEN
      ALTER TYPE notification_type ADD VALUE 'WORK_ORDER_CREATED';
    END IF;
    -- Repeat for each missing value
    -- Also add WORK_ORDER_COST, EXTENSION_REQUESTED, EXTENSION_SUBMITTED,
    -- EXTENSION_MANAGER_APPROVED, EXTENSION_PROGRESS, EXTENSION_APPROVED, EXTENSION_REJECTED,
    -- RETURN_OVERDUE_ESCALATION, RETURN_OVERDUE_URGENT,
    -- Work_Order_Completed, Payment_Recorded, High_Cost_Work_Order
  END $$;
  ```
  Also move `phase5-accounts.sql` into the main `migrations/` folder with a proper sequence number so `migrate.js` picks it up.

---

### C5 — `notifyDepartment('Accounts', ...)` Silently Delivers Zero Notifications
- **Issue:** `approval.service.js:189` calls `notificationsService.notifyDepartment('Accounts', {...})`. The `notifyDepartment` function runs `WHERE department = $1` with value `'Accounts'`. The `department` enum has `'Finance'` — not `'Accounts'`. The Finance/Accounts team is assigned to the `Finance` department in the DB. This query always returns zero rows; all work-order-cost notifications to Accounts staff are silently lost.
- **Location:** `backend/src/modules/requests/services/approval.service.js:189`
- **Impact:** Accounts staff never receive notifications about new work orders. The Accounts dashboard's real-time update flow is broken. The `accounts.service.js:217` workaround (notifying by role) still works, but the department-based notification in approval.service.js is dead code that masks the issue.
- **Fix:** Change `'Accounts'` → `'Finance'`:
  ```js
  await notificationsService.notifyDepartment('Finance', { ... });
  ```

---

### C6 — User Role Enum: 9 Roles in DB Have No Migration `ADD VALUE` Statement
- **Issue:** The original `001_create_users.sql` defines only 14 `user_role` values. CLAUDE.md confirms the live DB has 23 roles. The 9 additional roles — `Super_Admin, IT_Support, Accounts_Manager, Accounts_Staff, Safety_Manager, Logistics_Manager, HR_Manager, Purchasing_Staff, Staff` — appear in seed data, business logic, and role checks throughout the codebase, but no migration file contains `ALTER TYPE user_role ADD VALUE` for any of them.
- **Location:** `backend/migrations/001_create_users.sql` — defines only 14 values. No other migration adds the remaining 9.
- **Impact:** On a fresh DB, seeding fails (C3 also). Any code path that inserts a user with one of these 9 roles throws `invalid input value for enum user_role`. Since `seed.js` creates `Super_Admin`, `IT_Support`, `Logistics_Manager`, `Purchasing_Staff`, and `Staff` users, seeding is completely broken even after fixing the `'Executive'` department (C3).
- **Fix:** Add all 9 missing roles to the initial `001_create_users.sql` enum definition (or create a `001b_user_role_additions.sql` with ADD VALUE statements):
  ```sql
  DO $$ BEGIN
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'Super_Admin';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'IT_Support';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'Accounts_Manager';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'Accounts_Staff';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'Safety_Manager';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'Logistics_Manager';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'HR_Manager';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'Purchasing_Staff';
    ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'Staff';
  END $$;
  ```

---

## Major Improvements (Strongly Recommended)

### M1 — Frontend `REQUEST_STATUS` Missing `Manager_Approved`
- **Issue:** `frontend/src/utils/constants.js:18-27` defines `REQUEST_STATUS` but does not include `Manager_Approved`, which is a valid status added by `009_manager_approved_status.sql` and used throughout the maintenance approval workflow.
- **Location:** `frontend/src/utils/constants.js:18`
- **Impact:** Any frontend code that renders status labels or filters by status will not recognize `Manager_Approved` requests — they'll display as an unknown status or be silently omitted from filtered views.
- **Fix:** Add `MANAGER_APPROVED: 'Manager_Approved'` to the `REQUEST_STATUS` constant.

---

### M2 — Frontend `JOB_STATUS` Is Completely Out of Sync With DB Enum
- **Issue:** DB `job_status` enum (from `004_create_jobs.sql` + enhancement): `DRAFT, PENDING_APPROVAL, APPROVED, IN_PROGRESS, POST_JOB, COMPLETED, CANCELLED`. Frontend `constants.js:62-74` has: `Draft, Team_Assigned, Planning, Inspection, Approved, Equipped, In_Transit, In_Progress, Completing, Post_Job, Completed`. Frontend is missing `PENDING_APPROVAL` and `CANCELLED`, and has 7 values (`Team_Assigned, Planning, Inspection, Equipped, In_Transit, Completing`) that don't exist in the DB enum.
- **Location:** `frontend/src/utils/constants.js:62`
- **Impact:** Job status rendering in the UI will fail for any request that returns a DB-valid status the frontend doesn't recognize. Filters using these constants will silently miss matching records. (Note: Jobs module is deferred MVP, but the constants file is shared.)
- **Fix:** Align `JOB_STATUS` with the DB enum. Archive the extra values in a comment until the Jobs module launches with its own expanded enum.

---

### M3 — Frontend `DEPARTMENTS` Includes `Executive` (Not in DB), Missing 3 DB Values
- **Issue:** `frontend/src/utils/roleConfig.js:54` defines `EXECUTIVE` as a valid department. The DB `department` enum has `Management` and `Field_Services` instead. Frontend is also missing `Engineering` and `Field_Services` from its department list.
- **Location:** `frontend/src/utils/roleConfig.js:44-55`
- **Impact:** The user creation form (IT Admin creating users) will offer `Executive` as a department option — any user created with this department will fail with a DB constraint error. `Engineering` and `Field_Services` departments cannot be assigned via the UI.
- **Fix:** Replace `Executive` with `Management`. Add `Engineering` and `Field_Services`. Remove `Executive`.

---

### M4 — `createBulk` Notification Uses Sequential N+1 INSERT Loop
- **Issue:** `notifications.service.js:56-67` loops over each `userId` and issues a separate `INSERT` statement per user inside a transaction. For 10 users, this is 10 round-trips to PostgreSQL.
- **Location:** `backend/src/modules/notifications/notifications.service.js:56-67`
- **Impact:** When approving a request that notifies admins + requester + purchasing staff (potentially 8-15 people), `createBulk` serializes all inserts. Under the default 20-connection pool, and with several concurrent approvals, this can hold a transaction open long enough to create lock contention.
- **Fix:** Use a single multi-row insert:
  ```js
  const values = userIds.map((_, i) => `($${i*7+1},$${i*7+2},$${i*7+3},$${i*7+4},$${i*7+5},$${i*7+6},$${i*7+7})`).join(',');
  const params = userIds.flatMap(userId => [userId, type, title, message, referenceType, referenceId, priority]);
  await client.query(`INSERT INTO notifications (user_id,type,title,message,reference_type,reference_id,priority) VALUES ${values} RETURNING *`, params);
  ```

---

### M5 — Migration Naming Conflict: Duplicate Prefix Numbers
- **Issue:** The `migrations/` directory contains three `001_*` files and two `006_*` files:
  - `001_create_users.sql`, `001_jobs_enhancement.sql`, `001_jobs_schema.sql`
  - `006_create_inventory.sql`, `006_equipment_logs.sql`
  
  The migration runner sorts and runs alphabetically. It does not detect naming conflicts. The actual execution order: `001_create_users → 001_jobs_enhancement → 001_jobs_schema → 002_create_equipment → ... → 006_create_inventory → 006_equipment_logs`. The jobs schemas are run before equipment, which may cause FK failures if jobs reference equipment.
- **Location:** `backend/migrations/` directory
- **Impact:** Any fresh-DB migration run risks FK constraint failures. The runner also tracks by filename, so renaming later requires manual deletion from the `migrations` table.
- **Fix:** Renumber all files sequentially with zero-padded 3-digit prefixes that respect dependency order. Document the intended execution order.

---

### M6 — `seed.js` Safety Manager Test User Has Wrong Role
- **Issue:** `seed.js:35` creates `safety.manager@wellfluid.com` with role `Safety_Officer` not `Safety_Manager`. The comment says "Managers (various departments)" but `Safety_Officer` is not a manager role in either the DB hierarchy or the roleCheck middleware.
- **Location:** `backend/src/config/seed.js:35`
- **Impact:** The safety manager test user cannot access manager-level routes, making testing the safety manager workflow impossible. The `Logistics_Manager` test user (line 36) is similarly assigned a role that was not in the original enum (now fixed by C6).
- **Fix:** Change `'Safety_Officer'` → `'Safety_Manager'` in the seed file.

---

### M7 — Inline SQL Scattered Across Service Files (Maintenance Risk)
- **Issue:** Raw SQL template literals appear in 8+ service/controller files outside the canonical `.queries.js` files:
  - `approval.service.js:46,107,114,144` — inline UPDATE queries
  - `disburse.service.js:36,41,64,76` — inline UPDATE queries
  - `maintenance/workOrder.service.js:213,232` — inline SELECT/UPDATE
  - `requests/controllers/purchasing.controller.js:95` — inline SELECT in controller
  - `overdueReminders.service.js:15,161` — inline SELECT
  
  All of these use parameterized queries ($1, $2) — no SQL injection risk — but they fragment the query surface area and make auditing harder.
- **Location:** Multiple files listed above
- **Impact:** Future developers modifying queries must find and update scattered inline SQL instead of going to a single `.queries.js` file. Phase 3 (API Resilience) and Phase 4 (Concurrency) audits will need to trace these too.
- **Fix:** Extract inline SQL into the appropriate `.queries.js` module. This is a refactoring task, not a critical fix — but should be done before the codebase grows further.

---

## Minor Suggestions (Nice to Have)

- **`backend/src/config/seed.js:9`** — Super Admin seeded with password `superadmin123`. Weak password even for dev seeds. Use `crypto.randomBytes(16).toString('hex')` and log it once.
- **`backend/src/config/seed.js:108-121`** — All test user passwords printed to stdout. If logs are stored, credentials are exposed. Use `console.log('✅ Test users created')` without printing the actual password.
- **`backend/src/modules/purchasing/purchasing.queries.js:63`** (`findPendingDisbursements`) and `equipment.queries.js:191` (`findMaintenanceDue`) have no LIMIT clause. Safe for current data volume but worth capping.
- **`backend/src/config/db.js:12`** — `connectionTimeoutMillis: 2000` (2 seconds). Under any sustained load with all 20 pool connections busy, new requests timeout quickly. Consider raising to 5000ms and monitoring.
- **`backend/migrations/001_create_users.sql:70-76`** — `CREATE INDEX` without `IF NOT EXISTS`. Safe because the migration runner prevents re-execution, but fragile if the tracking table is ever reset.
- **`backend/src/modules/maintenance/maintenance.queries.js:6`** — `getAll` query has no `LIMIT` in the SQL string itself; the service appends it dynamically. The raw query object could be called directly without pagination. Add a comment to prevent misuse.
- **`backend/migrations/`** — No rollback scripts exist. If a migration fails mid-way (e.g., during C1 fix), there is no documented recovery path. Consider adding `down` scripts for each migration.

---

## Enum Audit Summary Table

| Enum | DB Values | Code/Seed Uses | Mismatches |
|------|-----------|----------------|------------|
| `user_role` | 23 (per CLAUDE.md) | 14 in migration; 16 in roleCheck.js | 9 values missing from migration |
| `notification_type` | 22+ (per CLAUDE.md) | 14 in migration 007 + 3 in phase5 | 8+ values used in code with no migration |
| `department` | 12 values | 10 in frontend (missing Engineering, Field_Services; has wrong Executive) | 3 frontend/DB mismatches |
| `request_status` | 10 values | 9 in frontend constants (missing Manager_Approved) | 1 missing in frontend |
| `job_status` | 7 values | 10 in frontend (7 phantom, 2 missing) | 9 total mismatches |
| `priority_level` | 4 values | Correct everywhere | ✅ None |
| `maintenance_type` | 8 values (per CLAUDE.md) | 4 in migration 002 | 4 values missing from migration |

---

## Phase Score

| Area | Score | Notes |
|------|-------|-------|
| 2.1 Enum Integrity | ❌ Critical Gap | 5 enums have migration/code mismatches; 9 user_role values unmigratable |
| 2.2 Query Safety | ✅ Solid | All queries parameterized; dynamic sort columns whitelisted |
| 2.3 N+1 Patterns | ⚠️ Needs Work | `createBulk` N+1; no other systemic patterns found |
| 2.4 Connection Management | ✅ Solid | Pool configured, error handled, transaction helper present |
| 2.5 Migrations & Schema | ❌ Critical Gap | No CREATE TABLE for maintenance_schedule; ordering conflicts; no rollback |
| 2.6 Seed Data | ❌ Critical Gap | Department enum violation; weak passwords documented; wrong role seeded |
| 2.7 Data Integrity | ⚠️ Needs Work | Notifications silently failing (C5); no cascade guards on some modules |

---

## Files Audited

| File | Lines |
|------|-------|
| `backend/migrations/001_create_users.sql` | 90 |
| `backend/migrations/002_create_equipment.sql` | 83 |
| `backend/migrations/003_create_requests.sql` | 72 |
| `backend/migrations/003_return_extensions.sql` | 63 |
| `backend/migrations/004_create_jobs.sql` | 87 |
| `backend/migrations/005_create_safety.sql` | 69 |
| `backend/migrations/006_create_inventory.sql` | 87 |
| `backend/migrations/006_equipment_logs.sql` | 133 |
| `backend/migrations/007_emrs_v2_purchasing_flow.sql` | 261 |
| `backend/migrations/008_equipment_owning_department.sql` | 52 |
| `backend/migrations/009_manager_approved_status.sql` | 22 |
| `backend/migrations/001_jobs_schema.sql` | 94 |
| `backend/migrations/001_jobs_enhancement.sql` | 254 |
| `backend/migrations/jobs_enhancement.sql` | 172 |
| `backend/migrations/add_damaged_inventory_columns.sql` | 97 |
| `backend/migrations/add_inventory_aliases.sql` | 22 |
| `backend/migrations/create_damaged_inventory.sql` | 46 |
| `backend/src/config/migrations/phase5-accounts.sql` | 77 |
| `backend/src/config/db.js` | 60 |
| `backend/src/config/seed.js` | 131 |
| `backend/src/config/migrate.js` | 61 |
| `backend/src/modules/requests/requests.queries.js` | 398 |
| `backend/src/modules/notifications/notifications.queries.js` | 86 |
| `backend/src/modules/notifications/notifications.service.js` | 325 |
| `backend/src/modules/maintenance/maintenance.queries.js` | 176 |
| `backend/src/modules/equipment/equipment.queries.js` | 330 |
| `backend/src/modules/purchasing/purchasing.queries.js` | 139 |
| `backend/src/modules/accounts/accounts.service.js` | 250 |
| `backend/src/modules/requests/services/approval.service.js` | 343 |
| `frontend/src/utils/constants.js` | 142 |
| `frontend/src/utils/roleConfig.js` | 87 |
