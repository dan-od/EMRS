# EMRS Schema Audit
Generated: 2026-05-01

---

## TOP 10 CRITICAL ITEMS
(sorted by severity: Critical → High → Medium → Low)

1. **[Critical]** `seed.js` inserts into `equipment.category` — column does not exist in actual schema. The column is `equipment.type` (enum `equipment_type`) and `equipment.asset_category` (enum `asset_category`). Values used (`Pump`, `Coiled_Tubing`, `Nitrogen`, `Wireline`, `Support`, `Vehicle`, `Other`) match neither enum. — `backend/src/config/seed.js:79`

2. **[Critical]** Migration `009_manager_approved_status.sql` references `work_orders(id)` as a foreign key target — the table `work_orders` does NOT exist in the actual schema. The actual work-order table is `maintenance_schedule`. The FK was silently skipped by PostgreSQL, leaving `requests.work_order_id` as an unforced UUID. — `backend/migrations/009_manager_approved_status.sql:14`

3. **[Critical]** `accounts.queries.js` selects `phone_number` from `users` — the actual column is `phone` (VARCHAR(20)). This SELECT will return NULL for every row silently. — `backend/src/modules/accounts/accounts.queries.js:195`; also `backend/src/utils/sms.js:126,128,197`

4. **[High]** `equipment_general_log` and `equipment_maintenance_log` were created in migration `006b_equipment_logs.sql` with `equipment_id INTEGER` (references `equipment(id)`). The actual schema uses `equipment_id uuid`. The FK type mismatch means the migration is incompatible with any fresh deploy — the actual DB was likely created out-of-order or the schema was manually patched. — `backend/migrations/006b_equipment_logs.sql:10,46`

5. **[High]** `inspection.queries.js` references `j.client_name` (line 177) — the `jobs` table has column `client` (VARCHAR(255)), not `client_name`. This query will fail at runtime. — `backend/src/modules/jobs/queries/inspection.queries.js:177`

6. **[High]** `jobs/queries/equipment.queries.js` and `inspection.queries.js` select `e.category` (lines 9, 133, 167, 195) from the `equipment` table. The column `category` does NOT exist; the correct columns are `asset_category` (enum `asset_category`) and `type` (enum `equipment_type`). This will return NULL silently. — `backend/src/modules/jobs/queries/equipment.queries.js:9,133,167`; `backend/src/modules/jobs/queries/inspection.queries.js:195`

7. **[High]** `team.queries.js` references `job_team.updated_at` in its UPDATE query (line 31) — the `job_team` table in the actual schema has no `updated_at` column. This will cause a runtime SQL error. — `backend/src/modules/jobs/queries/team.queries.js:31`

8. **[High]** `maintenance.queries.js` uses status value `'Overdue'` in WHERE and COUNT clauses. The `maintenance_schedule.status` column is VARCHAR with no enum enforcement; `'Overdue'` is never set by any INSERT or UPDATE in any migration or query file — no rows will ever match. — `backend/src/modules/maintenance/maintenance.queries.js:59,159`

9. **[Medium]** `activityLogger.js` defines numerous ACTIONS (`APPROVE`, `REJECT`, `DISBURSE`, `PUT_ON_HOLD`, `MAINTENANCE_CANCELLED`, `MAINTENANCE_ASSIGNED`, `VENDOR_RATING_UPDATED`, etc.) that are NOT valid values in the `activity_action` enum in the actual schema. Inserts using these actions succeed only because `activity_logs.action` is stored as `VARCHAR(50)`, not an enum — but this means audit trail values are inconsistent and non-queryable via enum. — `backend/src/utils/activityLogger.js:41-50,65-67,187`

10. **[Medium]** `movement_type` enum in actual schema has values `IN, OUT, ADJUSTMENT, DISBURSE, RETURN, WRITE_OFF` — migration `006_create_inventory.sql` only created `IN, OUT, ADJUSTMENT`. The additional values `DISBURSE, RETURN, WRITE_OFF` have no creating migration. Code in `purchasing.queries.js` uses `logStockMovement` but the values passed are not audited; any code passing `DISBURSE` or `RETURN` or `WRITE_OFF` that came before the DB was manually extended would have failed.

---

## PART A — Migration vs Reality

### TABLE: users
Created in: `001_create_users.sql`
Altered in: `007_emrs_v2_purchasing_flow.sql` (added notify_on_disbursement, notify_on_request_approval, notify_on_return_overdue, is_driver); `011_add_missing_enum_values.sql` (added roles to enum); `012_must_change_password.sql` (DEFAULT changed); `014_rename_it_admin.sql` (IT_Admin → IT_Manager)
Status:
  ✓ Core columns match actual schema
  ✓ `must_change_password DEFAULT true` — matches actual schema
  ✓ Roles added in `011`: Super_Admin, IT_Support, Accounts_Manager, Accounts_Staff, Safety_Manager, Logistics_Manager, HR_Manager, Purchasing_Staff, Staff — all present in actual schema
  ✓ `IT_Admin` → `IT_Manager` rename in `014` — matches actual schema
  ⚠ Migration `001` creates `user_role` enum WITHOUT: Super_Admin, IT_Support, Accounts_Manager, Accounts_Staff, Safety_Manager, Logistics_Manager, HR_Manager, Purchasing_Staff, Staff — those were added in `011`, which means any fresh deploy must run `011` to function
  ⚠ Actual schema has additional user columns: `notify_on_disbursement`, `notify_on_return`, `notify_on_request_approval`, `notify_on_return_overdue`, `is_driver` — `notify_on_return` is NOT added by any migration (migration `007` adds `notify_on_return_overdue` not `notify_on_return`)
  ⚠ `vendor_id` was added to `inventory` and `equipment` in migration `007` — but was NOT added to `users` (no issue, just noting)

### TABLE: activity_logs
Created in: `001_create_users.sql`
Altered in: `015_performance_indexes.sql` (performance indexes added per CLAUDE.md notes)
Status:
  ✓ Core columns (id, user_id, action, entity_type, entity_id, details, ip_address, created_at) match
  ⚠ Actual schema has additional columns NOT in `001`: `user_email`, `user_role`, `entity_name`, `user_agent`, `department` — no migration creates these columns. They exist in production DB but have no migration source.

### TABLE: equipment
Created in: `002_create_equipment.sql`
Altered in: `007_emrs_v2_purchasing_flow.sql` (added vendor_id); `008_equipment_owning_department.sql` (added owning_department)
Status:
  ✓ Core columns (id, name, serial_number, status, location, assigned_to, current_hours, maintenance_interval_hours, last_maintenance_date, next_maintenance_due, notes, created_at, updated_at) match
  ⚠ Migration `002` creates `equipment` with `category equipment_category NOT NULL` — the actual schema has NO `category` column. Instead it has `type equipment_type NOT NULL` and `asset_category asset_category NOT NULL`. The old `equipment_category` enum was completely replaced by these two columns with no migration that performs the ALTER.
  ⚠ Actual schema columns with no creating migration: `asset_tag`, `quantity`, `cost`, `is_hidden`, `hidden_by`, `hidden_at`, `hidden_reason`, `shared_with_departments`, `type`, `asset_category` — none of these appear in any numbered migration.
  ⚠ `vendor_id` was added in `007` but does NOT appear in the actual schema dump for `equipment` — either it was later dropped or the migration ran but the dump doesn't capture it. The actual `equipment` table columns (per schema dump lines 706-730) do not include `vendor_id`.

### TABLE: equipment_hours_log
Created in: `002_create_equipment.sql`
Altered in: none
Status:
  ✓ All columns match actual schema

### TABLE: maintenance_log
Created in: `002_create_equipment.sql`
Altered in: none
Status:
  ✓ All columns match actual schema

### TABLE: equipment_general_log
Created in: `006b_equipment_logs.sql`
Altered in: none
Status:
  ⚠ Migration creates `equipment_id INTEGER` — actual schema uses `equipment_id uuid`. Type mismatch. Migration cannot run on fresh deploy without failure.
  ⚠ Migration creates `reference_id INTEGER` — actual schema uses `reference_id uuid`.
  ✓ All other columns present and match

### TABLE: equipment_maintenance_log
Created in: `006b_equipment_logs.sql`
Altered in: none
Status:
  ⚠ Migration creates `equipment_id INTEGER` — actual schema uses `equipment_id uuid`. Same type mismatch as equipment_general_log.
  ✓ All other columns present and match

### TABLE: equipment_custom_types
Created in: no numbered migration — no migration file creates this table
Altered in: none
Status:
  ⚠ NO creating migration. Table exists in actual DB with columns: id, name, display_name, asset_category, description, created_by, created_at, is_active. Must have been created manually or via an unlisted migration.

### TABLE: equipment_requests
Created in: no numbered migration — no migration file creates this table
Altered in: none
Status:
  ⚠ NO creating migration. Table exists in actual DB. All columns appear manually created.

### TABLE: requests
Created in: `003_create_requests.sql`
Altered in: `007_emrs_v2_purchasing_flow.sql` (many new columns); `008_equipment_owning_department.sql` (manager_cost_estimate, purchasing_final_cost); `009_manager_approved_status.sql` (purchasing_final_cost dup, work_order_id); `add_damaged_inventory_columns.sql` (return_items, overdue_reminder_sent, manager_reminder_sent); `003_return_extensions.sql` (return_items dup, has_pending_extension, extension_count); `016_add_request_notes.sql` (notes)
Status:
  ✓ Core columns match actual schema
  ✓ All status additions (On_Hold, Disbursed, Pending_Return, Transferred, Manager_Approved) present in actual schema
  ⚠ Migration `003` creates `request_status` enum missing: `On_Hold`, `Disbursed`, `Pending_Return`, `Transferred`, `Manager_Approved` — added via separate migrations
  ⚠ `work_order_id` in migration `009` references `work_orders(id)` — table doesn't exist. In actual schema, `requests.work_order_id` is a plain UUID column (FK was silently dropped/ignored).
  ⚠ `expected_return_date` is added as `DATE` in migration `007` but actual schema has it as `TIMESTAMP WITHOUT TIME ZONE` — type drift.
  ✓ `disbursed_items` column in actual schema — no creating migration found (added manually or missing migration).

### TABLE: request_history
Created in: `003_create_requests.sql`
Altered in: none
Status:
  ✓ All columns match actual schema

### TABLE: request_approvals
Created in: `007_emrs_v2_purchasing_flow.sql`
Altered in: none
Status:
  ✓ All columns match actual schema

### TABLE: jobs
Created in: `004_create_jobs.sql` (basic), `004b_jobs_schema.sql` (enhanced), `jobs_enhancement.sql` (further)
Altered in: `jobs_enhancement.sql`
Status:
  ✓ Core columns present
  ⚠ Migration `004b_jobs_schema.sql` creates `status job_status` (enum values: DRAFT, PENDING_APPROVAL, etc.) — actual schema uses `status job_status_expanded` (enum values: Draft, Team_Assigned, Planning, Inspection, Approved, Equipped, In_Transit, In_Progress, Completing, Post_Job, Completed, On_Hold, Cancelled, APPROVED, POST_JOB, IN_PROGRESS). Massive enum drift — the `job_status_expanded` type has no creating migration.
  ⚠ `jobs_enhancement.sql` creates `jobs` with `status VARCHAR(50) DEFAULT 'Draft'` — conflicts with `004b_jobs_schema.sql`'s enum approach.
  ⚠ Actual schema column `department` — not in any creating migration.
  ⚠ Actual schema column `actual_start_date` — added in `jobs_enhancement.sql` via DO block.
  ⚠ `budget` column in `jobs_enhancement.sql` CREATE TABLE — NOT in actual schema. Dropped or never committed.
  ✓ `well_name`, `expected_end_date`, `submitted_at`, `submitted_by`, `started_at`, `started_by`, `completed_at`, `signoff_*` columns — added via `004b_jobs_schema.sql`

### TABLE: job_team
Created in: `004_create_jobs.sql`, superseded by `jobs_enhancement.sql`, `004b_jobs_schema.sql`
Status:
  ✓ Core columns present
  ⚠ `004b_jobs_schema.sql` adds `role job_team_role` column; `jobs_enhancement.sql` adds `role_in_job VARCHAR(50)` — both exist in actual schema, meaning redundant role tracking columns.
  ⚠ `job_team.updated_at` — does NOT exist in actual schema. Code in `team.queries.js:31` tries to SET it — will fail at runtime.
  ⚠ `job_team.notes`, `job_team.approval_limit`, `job_team.is_supervisor` — in actual schema but no migration creates them.

### TABLE: job_equipment
Created in: `004_create_jobs.sql`, enhanced in `jobs_enhancement.sql`
Status:
  ✓ All columns present in actual schema

### TABLE: job_equipment_items
Created in: `004b_jobs_schema.sql`
Altered in: `006c_jobs_enhancement.sql` (many columns added)
Status:
  ✓ Core columns match
  ✓ Sourcing columns added in `006c_jobs_enhancement.sql` match actual schema
  ✓ Approval flow columns added in `006c_jobs_enhancement.sql` match actual schema
  ⚠ Actual schema columns NOT added by any migration: `return_notes`, `approved_quantity`, `original_quantity`, `partial_approval_reason`, `rejection_count`, `last_rejection_reason`, `resubmission_notes`, `disposition_type`, `site_contact_name`, `site_contact_phone`, `pickup_reminder_date`, `post_inspection_id`, `need_by_date`, `request_type`, `manager_approved_at`, `manager_approved_by`, `manager_approval_notes`, `manager_rejected_at`, `manager_rejected_by`, `manager_rejection_reason`, `repair_notes`

### TABLE: job_equipment_history
Created in: `006c_jobs_enhancement.sql`
Altered in: none
Status:
  ✓ All columns match actual schema

### TABLE: job_equipment_inspections
Created in: no numbered migration — no migration creates this table
Status:
  ⚠ NO creating migration. Table has columns: id, job_equipment_item_id, inspected_by, inspected_at, signed_off_by, signed_off_at, overall_status, checklist_data, failed_items, notes, created_at, updated_at, is_draft, submitted_at, manager_decision, manager_notes, manager_decision_at, manager_decision_by, signed_all. Must have been created manually.

### TABLE: job_pre_inspections
Created in: `006c_jobs_enhancement.sql`
Status:
  ✓ All columns match actual schema

### TABLE: job_inspections
Created in: `004_create_jobs.sql`, `jobs_enhancement.sql`
Status:
  ⚠ `jobs_enhancement.sql` adds `checklist_data` and `attachments` columns — NOT in actual schema. These were dropped or never committed.
  ✓ Core columns (id, job_id, inspector_id, inspection_type, findings, status, inspection_date, created_at) present

### TABLE: job_status_history
Created in: `004b_jobs_schema.sql`, `jobs_enhancement.sql`
Status:
  ✓ All columns match actual schema

### TABLE: job_team_audit
Created in: no migration
Status:
  ⚠ NO creating migration.

### TABLE: job_item_comments
Created in: no migration
Status:
  ⚠ NO creating migration.

### TABLE: inspection_failed_items
Created in: no migration
Status:
  ⚠ NO creating migration.

### TABLE: post_job_inspections
Created in: no migration
Status:
  ⚠ NO creating migration.

### TABLE: additional_requests
Created in: no migration
Status:
  ⚠ NO creating migration.

### TABLE: swap_requests
Created in: no migration
Status:
  ⚠ NO creating migration.

### TABLE: job_inspections (enhanced)
Note: actual `job_inspections` table has `inspection_type inspection_type` (enum: Pre_Job, Daily, Post_Job, Safety) and `status inspection_status` (enum: Pass, Fail, Conditional) — matches `004_create_jobs.sql` and `005` definitions.

### TABLE: safety_reports
Created in: `005_create_safety.sql`
Altered in: none
Status:
  ✓ All columns match actual schema

### TABLE: safety_report_history
Created in: `005_create_safety.sql`
Status:
  ✓ All columns match actual schema

### TABLE: inventory
Created in: `006_create_inventory.sql`
Altered in: `007_emrs_v2_purchasing_flow.sql` (added vendor_id)
Status:
  ✓ Core columns match actual schema
  ⚠ `vendor_id` added in `007` — NOT in actual schema for `inventory` table. Was it dropped? Actual `inventory` columns are: id, name, category, quantity, unit, reorder_level, location, created_at, updated_at. No `vendor_id` visible.

### TABLE: inventory_aliases
Created in: `add_inventory_aliases.sql`
Status:
  ✓ All columns match actual schema

### TABLE: inventory_transactions
Created in: no numbered migration (only exists in actual schema)
Status:
  ⚠ NO creating migration.

### TABLE: stock_movements
Created in: `006_create_inventory.sql`
Status:
  ✓ All columns match actual schema
  ⚠ `movement_type` enum in `006` only has IN, OUT, ADJUSTMENT. Actual schema adds DISBURSE, RETURN, WRITE_OFF with no migration.

### TABLE: disbursements
Created in: `006_create_inventory.sql`
Status:
  ✓ All columns match actual schema

### TABLE: damaged_inventory
Created in: `create_damaged_inventory.sql`
Altered in: `add_damaged_inventory_columns.sql`, `003_return_extensions.sql`
Status:
  ✓ All columns match actual schema
  ⚠ `create_damaged_inventory.sql` had CHECK constraint `status IN ('Pending', 'Under_Review', ...)` — `003_return_extensions.sql` dropped and replaced it with expanded values. Actual schema CHECK matches `003_return_extensions.sql` version. Correct.

### TABLE: return_extensions
Created in: `003_return_extensions.sql`
Status:
  ✓ All columns match actual schema

### TABLE: maintenance_schedule
Created in: `010_create_maintenance_schedule.sql`
Altered in: `006b_equipment_logs.sql` (DO block adds started_by, started_at, assigned_by, assigned_at, cancelled_by, cancelled_at, cancellation_reason); `008_equipment_owning_department.sql` (adds estimated_cost, actual_cost, parts_cost, labor_cost, vendor_cost)
Status:
  ✓ All columns match actual schema
  ⚠ `description` is NOT NULL in migration `010` but actual schema shows `description text` (nullable). Minor drift.
  ⚠ `maintenance_schedule.parts_cost`, `labor_cost`, `vendor_cost` — in actual schema, added in `008`. Actual schema also has `accounts_final_payment`, `accounts_payment_date`, `accounts_payment_notes`, `accounts_recorded_by` — these are in `010` migration. Consistent.

### TABLE: maintenance_parts
Created in: `010_create_maintenance_schedule.sql`
Status:
  ✓ All columns match actual schema
  ⚠ Migration `010` uses `added_at` column — actual schema has `created_at`. Column renamed without migration.

### TABLE: maintenance_history
Created in: `010_create_maintenance_schedule.sql`
Status:
  ✓ All columns match actual schema

### TABLE: maintenance_log
Created in: `002_create_equipment.sql`
Status:
  ✓ All columns match actual schema

### TABLE: notifications
Created in: `007_emrs_v2_purchasing_flow.sql`
Altered in: `011_add_missing_enum_values.sql` (added many notification_type values)
Status:
  ✓ Core columns match actual schema
  ⚠ Migration `007` creates `notification_type` with values: REQUEST_CREATED, REQUEST_APPROVED, REQUEST_REJECTED, REQUEST_DISBURSED, REQUEST_DISBURSED_NO_APPROVAL, TRANSPORT_ASSIGNED, RETURN_OVERDUE, RETURN_INITIATED, RETURN_CONFIRMED, VENDOR_ADDED, VENDOR_DELETION_REQUESTED, LOW_STOCK_ALERT, SAFETY_REPORT_SUBMITTED, GENERAL.
  ⚠ Actual schema has these ADDITIONAL values (some added in `011`, some with no migration): `Request_Approved`, `Request_Rejected`, `Request_Disbursed`, `Return_Reminder`, `Transport_Assigned`, `Vendor_Added`, `Stock_Low`, `Maintenance_Due`, `System`, `RETURN_OVERDUE_ESCALATION`, `RETURN_OVERDUE_URGENT`, `WORK_ORDER_CREATED`, `WORK_ORDER_COST`, `Work_Order_Completed`, `High_Cost_Work_Order`, `EXTENSION_REQUESTED`, `EXTENSION_SUBMITTED`, `EXTENSION_MANAGER_APPROVED`, `EXTENSION_PROGRESS`, `EXTENSION_APPROVED`, `EXTENSION_REJECTED`.
  ⚠ Legacy mixed-case values (`Request_Approved`, `Stock_Low`, etc.) — present in actual DB but NOT in migration `011` and NOT in `007`. These have NO creating migration.
  ⚠ `Payment_Recorded` — referenced in `backend/src/config/migrations/phase5-accounts.sql` but NOT in actual schema. This stray migration file was never run.
  ⚠ Values in migration `007` NOT in actual schema: `REQUEST_CREATED` (actually absent from actual schema), `REQUEST_DISBURSED_NO_APPROVAL`, `VENDOR_DELETION_REQUESTED`, `SAFETY_REPORT_SUBMITTED`. These were created but then not preserved in the actual schema (dropped?). Code should not use these values.

### TABLE: vendors
Created in: `007_emrs_v2_purchasing_flow.sql` (minimal schema), likely re-created via code
Status:
  ✓ Core columns present
  ⚠ Migration `007` creates vendors with different schema (has `is_active`, `deletion_requested_by`, `deletion_requested_at`, `deletion_approved_by`, `deletion_approved_at`) — actual schema has `status VARCHAR(20) DEFAULT 'Active'` and `deleted_at TIMESTAMP`. The vendor table was substantially restructured with no migration.

### TABLE: vendor_reviews
Created in: no migration
Status:
  ⚠ NO creating migration.

### TABLE: vehicles
Created in: `007_emrs_v2_purchasing_flow.sql`
Status:
  ✓ Core columns match
  ⚠ Migration creates `created_by` column — actual schema does NOT have `created_by` on vehicles. The column was dropped with no migration.
  ⚠ Actual schema columns NOT in migration: `make`, `model`, `year`, `fuel_type`, `mileage`, `assigned_driver_id`, `last_service_date` — no migration adds these.
  ⚠ Migration `007` INSERT seeds use `created_by` FK — would fail on actual schema since column was dropped.

### TABLE: transport_assignments
Created in: `007_emrs_v2_purchasing_flow.sql`
Status:
  ⚠ Migration has `driver_id UUID NOT NULL` — actual schema has `driver_id uuid` (nullable). The NOT NULL was dropped without migration.
  ⚠ Migration has `assigned_by UUID NOT NULL` — actual schema has `assigned_by uuid` (nullable). Same issue.
  ✓ All other columns match

### TABLE: purchase_orders
Created in: no numbered migration
Status:
  ⚠ NO creating migration.

### TABLE: token_denylist
Created in: `013_token_denylist.sql`
Status:
  ✓ All columns match actual schema

### TABLE: field_reports
Created in: no numbered migration
Status:
  ⚠ NO creating migration.

### TABLE: migrations (tracking table)
Created in: no numbered migration
Status:
  ⚠ No migration creates the migrations table itself.

### Summary
- Total tables in actual schema: 46
  (activity_logs, additional_requests, damaged_inventory, disbursements, equipment, equipment_custom_types, equipment_general_log, equipment_hours_log, equipment_maintenance_log, equipment_requests, field_reports, inspection_failed_items, inventory, inventory_aliases, inventory_transactions, inventory_with_usage (VIEW), job_equipment, job_equipment_history, job_equipment_inspections, job_equipment_items, job_inspections, job_item_comments, job_pre_inspections, job_status_history, job_team, job_team_audit, jobs, maintenance_history, maintenance_log, maintenance_parts, maintenance_schedule, migrations, notifications, post_job_inspections, purchase_orders, request_approvals, request_history, requests, return_extensions, safety_report_history, safety_reports, stock_movements, swap_requests, token_denylist, transport_assignments, users, vendor_reviews, vendors, vehicles)

- **Tables with no creating migration:** equipment_custom_types, equipment_requests, job_equipment_inspections, job_team_audit, job_item_comments, inspection_failed_items, post_job_inspections, additional_requests, swap_requests, inventory_transactions, vendor_reviews, purchase_orders, field_reports

- **Migrations whose target tables don't exist:** `009_manager_approved_status.sql` references `work_orders(id)` (table does not exist)

- **Columns in actual schema with no migration source:**
  - `activity_logs`: user_email, user_role, entity_name, user_agent, department
  - `equipment`: asset_tag, quantity, cost, is_hidden, hidden_by, hidden_at, hidden_reason, shared_with_departments, type, asset_category
  - `requests`: disbursed_items
  - `users`: notify_on_return
  - `job_team`: notes, approval_limit, is_supervisor
  - `movement_type` enum values: DISBURSE, RETURN, WRITE_OFF
  - `notification_type` legacy values: Request_Approved, Request_Rejected, Request_Disbursed, Return_Reminder, Transport_Assigned, Vendor_Added, Stock_Low, Maintenance_Due, System
  - `vehicles`: make, model, year, fuel_type, mileage, assigned_driver_id, last_service_date
  - `job_equipment_items`: return_notes, approved_quantity, original_quantity, partial_approval_reason, rejection_count, last_rejection_reason, resubmission_notes, disposition_type, site_contact_name, site_contact_phone, pickup_reminder_date, post_inspection_id, need_by_date, request_type, manager_approved_at, manager_approved_by, manager_approval_notes, manager_rejected_at, manager_rejected_by, manager_rejection_reason, repair_notes

---

## PART B — Code vs Reality

### FILE: `backend/src/config/seed.js`
Status:
  ⚠ Line 79: `INSERT INTO equipment (name, serial_number, category, status, location, current_hours, maintenance_interval_hours)` — column `category` does NOT exist on `equipment`. The actual columns are `type` (equipment_type enum) and `asset_category` (asset_category enum).
  ⚠ Line 79: Values passed for `category`: `'Pump'`, `'Coiled_Tubing'`, `'Nitrogen'`, `'Wireline'`, `'Support'`, `'Vehicle'`, `'Other'` — none of these are valid values for `equipment_type` enum (valid: PUMPING_UNIT, PRESSURE_CONTROL, WELL_INTERVENTION, POWER_GENERATION, TANK_VESSEL, VEHICLE, COMPRESSOR, OTHER_EQUIPMENT, HAND_TOOL, POWER_TOOL, MEASURING_INSTRUMENT, CUTTING_TOOL, LIFTING_GEAR, WELDING_EQUIPMENT, OTHER_TOOL) nor for `asset_category` (valid: TOOL, EQUIPMENT).
  ✓ Lines 100-105: `INSERT INTO inventory` columns — all correct (name, category, quantity, unit, reorder_level, location)
  ✓ Lines 11-14, 19-23, 57-63: `INSERT INTO users` — all columns correct

### FILE: `backend/src/modules/accounts/accounts.queries.js`
Status:
  ⚠ Line 195: `SELECT id, email, first_name, last_name, phone_number FROM users` — column `phone_number` does NOT exist. Actual column is `phone`. This will return NULL for every row silently.
  ✓ All other column references (maintenance_schedule, requests, equipment, users, vendors) match actual schema

### FILE: `backend/src/utils/sms.js`
Status:
  ⚠ Lines 126, 128, 197: References `user.phone_number` — actual users table column is `phone`. Any SMS dispatch using this path will silently fail to find a phone number.

### FILE: `backend/src/modules/jobs/queries/equipment.queries.js`
Status:
  ⚠ Lines 9, 133, 167: `e.category` — column `category` does NOT exist on `equipment` table. Correct references: `e.asset_category`, `e.type`. This will always return NULL.
  ✓ All other column references match actual schema

### FILE: `backend/src/modules/jobs/queries/inspection.queries.js`
Status:
  ⚠ Line 177: `j.client_name` — column does NOT exist on `jobs` table. Actual column is `j.client`. Query will fail at runtime with "column j.client_name does not exist".
  ⚠ Line 195: `e.category` — column does NOT exist on `equipment` table (same as above).
  ✓ All other column references match actual schema

### FILE: `backend/src/modules/jobs/queries/team.queries.js`
Status:
  ⚠ Line 31: `UPDATE job_team SET role = $3, updated_at = NOW()` — column `updated_at` does NOT exist on `job_team` table. This UPDATE will fail at runtime.

### FILE: `backend/src/modules/maintenance/maintenance.queries.js`
Status:
  ⚠ Lines 59, 159: Status value `'Overdue'` — `maintenance_schedule.status` is a VARCHAR with no enum. The value `'Overdue'` is never assigned in any INSERT or UPDATE query, meaning these filters will never match any rows.
  ✓ All other column references match actual schema

### FILE: `backend/src/modules/equipment/equipment.queries.js`
Status:
  ✓ All column references match actual schema (uses asset_category correctly)

### FILE: `backend/src/modules/requests/requests.queries.js`
Status:
  ✓ All column references match actual schema

### FILE: `backend/src/modules/purchasing/purchasing.queries.js`
Status:
  ✓ All column references match actual schema

### FILE: `backend/src/modules/users/users.queries.js`
Status:
  ✓ All column references match actual schema

### FILE: `backend/src/modules/notifications/notifications.queries.js`
Status:
  ✓ All column references match actual schema

### FILE: `backend/src/modules/safety/safety.queries.js`
Status:
  ✓ All column references match actual schema

### FILE: `backend/src/modules/vendors/vendors.queries.js`
Status:
  ✓ All column references match actual schema (uses `contact_email`, `contact_phone`, `contact_person` which all exist on `vendors`)

### FILE: `backend/src/modules/vehicles/vehicles.queries.js`
Status:
  ✓ All column references match actual schema (uses make, model, year, fuel_type, mileage, assigned_driver_id, which are all in actual schema)

### FILE: `backend/src/modules/field-reports/field-reports.queries.js`
Status:
  ✓ All column references match actual schema for `field_reports` table

### FILE: `backend/src/modules/jobs/queries/workflow.queries.js`
Status:
  ✓ Column references correct
  ⚠ Sets `status = 'Team_Assigned'` on submit — this value IS in `job_status_expanded` enum. OK.
  ⚠ `FROM jobs WHERE UPPER(status::text) = 'DRAFT'` — 'Draft' is the actual default in schema but code compares against 'DRAFT' (upper-cased). Will work at runtime. Not a bug, but fragile.

### FILE: `backend/src/modules/jobs/queries/material.queries.js`
Status:
  ✓ All column references match actual schema

### FILE: `backend/src/modules/jobs/queries/purchasing.queries.js`
Status:
  ✓ All column references match actual schema
  ⚠ `getSwapRequests` references `sr.replacement_item_id` — column in `swap_requests` is `replacement_item_id`. This exists in actual schema. OK.

### FILE: `backend/src/modules/equipment/equipmentLogs.queries.js`
Status:
  ✓ All column references match actual schema

### FILE: `backend/src/modules/accounts/accounts.queries.js`
Status:
  ⚠ Line 195: `phone_number` — does not exist on `users`. See critical item #3 above.
  ✓ All other column references match actual schema

### FILE: `backend/src/utils/activityLogger.js`
Status:
  ✓ INSERT INTO `activity_logs` — all column references correct (user_id, user_email, user_role, action, entity_type, entity_id, entity_name, details, ip_address, user_agent, department)
  ⚠ ACTIONS constants include values NOT in the `activity_action` enum: `APPROVE`, `REJECT`, `DISBURSE`, `PUT_ON_HOLD`, `RELEASE_FROM_HOLD`, `INITIATE_RETURN`, `CONFIRM_RETURN`, `COMPLETE`, `RETURN_INITIATED`, `RETURN_CONFIRMED`, `MAINTENANCE_CANCELLED`, `MAINTENANCE_ASSIGNED`, `JOB_SUBMITTED`, `JOB_REJECTED`, `JOB_STARTED`, `JOB_COMPLETED`, `JOB_CANCELLED`, `JOB_SIGNOFF`, `JOB_REASSIGNED`, `JOB_PRIORITY_CHANGED`, `JOB_DEADLINE_EXTENDED`, `TEAM_MEMBER_ADDED`, `TEAM_MEMBER_REMOVED`, `TEAM_ROLE_CHANGED`, `SUPERVISOR_CHANGED`, `EQUIPMENT_ADDED_TO_JOB`, `EQUIPMENT_REMOVED_FROM_JOB`, `MATERIAL_ADDED_TO_JOB`, `MATERIAL_REMOVED_FROM_JOB`, `CLIENT_EQUIPMENT_ADDED`, `EQUIPMENT_REQUEST_ADDED`, `EQUIPMENT_QUANTITY_CHANGED`, `EQUIPMENT_PRIORITY_CHANGED`, `NEW_EQUIPMENT_REQUESTED`, `EQUIPMENT_REQUEST_CREATED`, `EQUIPMENT_REQUEST_SUPERVISOR_APPROVED`, `EQUIPMENT_REQUEST_SUPERVISOR_REJECTED`, `EQUIPMENT_REQUEST_MANAGER_APPROVED`, `EQUIPMENT_REQUEST_MANAGER_REJECTED`, `ITEM_DISBURSED`, `ITEM_SOURCING_STARTED`, `ITEM_SOURCING_UPDATED`, `ITEM_SOURCING_CANCELLED`, `ITEM_ARRIVED`, `ITEM_LINKED_TO_INVENTORY`, `PRE_INSPECTION_STARTED`, `PRE_INSPECTION_SAVED_DRAFT`, `PRE_INSPECTION_COMPLETED`, `PRE_INSPECTION_ISSUE_FOUND`, `PRE_INSPECTION_ISSUE_RESOLVED`, `PRE_INSPECTION_APPROVED`, `PRE_INSPECTION_REJECTED`, `FIELD_NOTE_ADDED`, `EQUIPMENT_ISSUE_REPORTED`, `EQUIPMENT_HOURS_UPDATED`, `ADDITIONAL_EQUIPMENT_REQUESTED`, `POST_JOB_STARTED`, `POST_JOB_COMPLETED`, `ITEM_RETURN_INITIATED`, `ITEM_RETURN_ACCEPTED`, `ITEM_RETURN_REJECTED`, `ITEM_MARKED_DAMAGED`, `ITEM_MARKED_LOST`, `SAFETY_INCIDENT_REPORTED`, `VENDOR_RATING_UPDATED`. These will insert fine (column is VARCHAR) but are semantically orphaned from the enum.

---

## PART C — Seed Drift

### `seed.js` — INSERT INTO users
Columns used: `email, password_hash, first_name, last_name, role, department, is_active, must_change_password`
- All columns exist in actual schema
- Role values used: `Super_Admin`, `Admin`, `IT_Support`, `Operations_Manager`, `Maintenance_Manager`, `Safety_Manager`, `Logistics_Manager`, `Purchasing_Manager`, `Purchasing_Staff`, `Accounts_Manager`, `Accounts_Staff`, `Field_Engineer`, `Staff` — **all valid** against actual `user_role` enum
- Department values: `Management`, `IT`, `Operations`, `Maintenance`, `Safety`, `Logistics`, `Purchasing`, `Finance`, `HR` — **all valid** against actual `department` enum

### `seed.js` — INSERT INTO equipment
Columns used: `name, serial_number, category, status, location, current_hours, maintenance_interval_hours`
- **`category` does NOT exist** on `equipment` table — **CRITICAL FAILURE**
- Correct columns are `type` (equipment_type enum) and `asset_category` (asset_category enum)
- Values passed for category: `Pump`, `Coiled_Tubing`, `Nitrogen`, `Wireline`, `Support`, `Vehicle`, `Other`
  - None match `asset_category` enum (TOOL, EQUIPMENT)
  - None match `equipment_type` enum (PUMPING_UNIT, PRESSURE_CONTROL, WELL_INTERVENTION, POWER_GENERATION, TANK_VESSEL, VEHICLE, COMPRESSOR, OTHER_EQUIPMENT, HAND_TOOL, POWER_TOOL, MEASURING_INSTRUMENT, CUTTING_TOOL, LIFTING_GEAR, WELDING_EQUIPMENT, OTHER_TOOL)
- Status values: `Available`, `In_Use`, `Maintenance` — **all valid** against `equipment_status` enum

### `seed.js` — INSERT INTO inventory
Columns used: `name, category, quantity, unit, reorder_level, location`
- All columns exist in actual schema
- Category values: `PPE`, `Spare_Parts`, `Consumables`, `Office_Supplies` — **all valid** against `inventory_category` enum (PPE, Tools, Consumables, Spare_Parts, Office_Supplies, Other)

---

## PART D — Dead Tables / Dead Columns

### LIKELY DEAD TABLES
These tables exist in the actual schema but have no references in any query file in `backend/src`:

| Table | Evidence |
|-------|----------|
| `job_inspections` | Created in early migrations; code uses `job_equipment_inspections` and `job_pre_inspections` instead. No query in `backend/src` targets `job_inspections` directly. |
| `maintenance_log` | Created in `002_create_equipment.sql`; `equipment.queries.js` still inserts into it via `logMaintenance`. ALIVE — still used. |
| `stock_movements` | `purchasing.queries.js` uses `logStockMovement` to insert. ALIVE — still used. |

Grep verification:
- `job_inspections` — no query files reference INSERT/UPDATE into it. The only reference is in `004_create_jobs.sql` and index definitions. The functional inspection system uses `job_equipment_inspections`.

### LIKELY DEAD COLUMNS
Based on grep across `backend/src`:

| Table | Column | Reason |
|-------|--------|--------|
| `equipment` | `vendor_id` (if it exists — may have been dropped) | Added in migration `007` but not found in actual schema dump columns |
| `inventory` | `vendor_id` (if it exists — may have been dropped) | Added in migration `007` but not found in actual schema dump columns |
| `jobs` | `budget` | In `jobs_enhancement.sql` CREATE but NOT in actual schema |
| `job_inspections` | `checklist_data`, `attachments` | Added in `jobs_enhancement.sql`, NOT in actual schema |
| `maintenance_parts` | `added_at` | Migration uses `added_at`; actual schema uses `created_at` |
| `vehicles` | `created_by` | In migration, NOT in actual schema |
| `users` | `notify_on_return` | In actual schema, NOT added by any migration, not referenced in any query file |
| `activity_logs` | `user_agent` | In actual schema (inserted by activityLogger.js — ALIVE) |
| `job_team` | `role_in_job` | In actual schema, added in `jobs_enhancement.sql`. Still referenced in `team.queries.js` getByJobId select via `jt.*`. Potentially shadowed by `jt.role` (job_team_role enum). |
| `job_team` | `is_supervisor` | In actual schema (index exists), but no query file sets it. Superseded by `role = 'SUPERVISOR'`. |
| `job_team` | `approval_limit` | In actual schema, not set by any query. Likely dead. |

---

## PART E — Code References with No DB Target

### Enum value mismatches

| Code Value | Enum | Status |
|------------|------|--------|
| `'Overdue'` | `maintenance_schedule.status` (VARCHAR) | Not a defined status; never set by any query — dead filter |
| `'Pump'`, `'Coiled_Tubing'`, `'Nitrogen'`, `'Wireline'`, `'Support'` | `equipment_category` (seed.js) | Enum `equipment_category` was DROPPED; replaced by `equipment_type` and `asset_category` |
| `'DRAFT'` (upper-case in workflow queries) | `job_status_expanded` | Actual value is `'Draft'` — query uses `UPPER()` comparison so it works, but is fragile |
| `REQUEST_CREATED` notification type | `notification_type` enum | NOT in actual schema enum (was in migration `007` initial definition but not preserved) |
| `REQUEST_DISBURSED_NO_APPROVAL` | `notification_type` enum | NOT in actual schema enum |
| `VENDOR_DELETION_REQUESTED` | `notification_type` enum | NOT in actual schema enum |
| `SAFETY_REPORT_SUBMITTED` | `notification_type` enum | NOT in actual schema enum |
| `'In_Progress'` (mixed-case) in `job_status_expanded` | `job_status_expanded` | Actual enum has both `'In_Progress'` AND `'IN_PROGRESS'` — inconsistency in enum itself |
| `'APPROVED'` (all-caps) in `job_status_expanded` | `job_status_expanded` | Actual enum has both `'Approved'` AND `'APPROVED'` — inconsistency in enum itself |
| `'POST_JOB'` (all-caps) in `job_status_expanded` | `job_status_expanded` | Actual enum has both `'Post_Job'` AND `'POST_JOB'` — inconsistency in enum itself |
| `'Urgency': 'Routine', 'Urgent', 'Emergency'` | `requests.validation.js:96` | Not a DB enum, but `'Urgent'` contradicts `priority_level` guidance (CLAUDE.md says not 'Urgent') |
| `'Payment_Recorded'` | `notification_type` enum | Referenced in `phase5-accounts.sql` migration (in `src/config/migrations/`) but NOT in actual schema enum and migration was never run against main DB |

### Table references not in schema
- `work_orders` — referenced in migration `009_manager_approved_status.sql` as FK target; table does not exist

### ENTITY_TYPES in activityLogger not in entity_type enum
The `ENTITY_TYPES` in activityLogger includes `JOB_TEAM`, `JOB_EQUIPMENT`, `JOB_MATERIAL`, `PRE_INSPECTION`, `VENDOR`, `PURCHASE_ORDER` — none of these are valid values in the actual `entity_type` enum (USER, REQUEST, EQUIPMENT, JOB, SAFETY_REPORT, INVENTORY, DISBURSEMENT, PURCHASE_REQUEST, MAINTENANCE_LOG, INSPECTION, FIELD_REPORT, SYSTEM). Since `activity_logs.entity_type` is stored as VARCHAR(50), inserts succeed but values are inconsistent.

---

## END SHORTLISTS

### 1. DROP THESE TABLES
These tables have no creating migration and no live code references — candidates for cleanup:

- `job_inspections` — superseded by `job_equipment_inspections` and `job_pre_inspections`. No INSERT/UPDATE in backend query files.

> Note: Before dropping, verify no ad-hoc queries or future migration references exist.

### 2. DROP THESE COLUMNS (or add missing ones)
| Table | Column | Action |
|-------|--------|--------|
| `job_team` | `updated_at` | Either ADD the column (it's referenced in `team.queries.js:31`) or REMOVE the SET clause from the query |
| `job_team` | `is_supervisor` | DROP — superseded by `role = 'SUPERVISOR'` |
| `job_team` | `approval_limit` | DROP — no code sets or reads it |
| `users` | `notify_on_return` | DROP — no migration creates it, no code references it |

### 3. FIX THESE CODE REFERENCES

| File | Line | Issue | Fix |
|------|------|-------|-----|
| `backend/src/config/seed.js` | 79 | `INSERT INTO equipment` uses column `category` | Replace with `type` and `asset_category`; map values to valid enums |
| `backend/src/modules/accounts/accounts.queries.js` | 195 | `phone_number` → does not exist | Change to `phone` |
| `backend/src/utils/sms.js` | 126, 128, 197 | `user.phone_number` → does not exist | Change to `user.phone` |
| `backend/src/modules/jobs/queries/equipment.queries.js` | 9, 133, 167 | `e.category` → does not exist | Change to `e.asset_category` (and `e.type` if needed) |
| `backend/src/modules/jobs/queries/inspection.queries.js` | 177 | `j.client_name` → does not exist | Change to `j.client` |
| `backend/src/modules/jobs/queries/inspection.queries.js` | 195 | `e.category` → does not exist | Change to `e.asset_category` |
| `backend/src/modules/jobs/queries/team.queries.js` | 31 | `SET role = $3, updated_at = NOW()` — `updated_at` missing on `job_team` | Either run `ALTER TABLE job_team ADD COLUMN updated_at TIMESTAMP DEFAULT NOW()` or remove `updated_at = NOW()` from the query |
| `backend/src/modules/maintenance/maintenance.queries.js` | 59, 159 | Status `'Overdue'` never set in DB | Remove filter or add logic to set status to 'Overdue' when past scheduled_date |
| `backend/migrations/009_manager_approved_status.sql` | 14 | `REFERENCES work_orders(id)` → table doesn't exist | Change to `REFERENCES maintenance_schedule(id)` |
| `backend/src/config/migrations/phase5-accounts.sql` | 40 | `ADD VALUE 'Payment_Recorded'` to `notification_type` | This migration was never applied; either apply it or delete the file |
