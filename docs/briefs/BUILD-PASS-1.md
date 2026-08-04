# EMRS — Build Pass 1: Ship Maintenance, Safety, and Jobs steps 1–11

Autonomous pass. Work the five tasks below in order. Run tests and commit after each one. Don't batch them into one commit.

Source of truth: `docs/audits/IN-DEVELOPMENT-AUDIT.md`. Read it first.

## STOP CONDITION — read before doing anything

Task 1 seeds a database. The only known EMRS instance is the live deployment at `emrs.okoro.me`. Do not seed it.

Find or create a local dev database first:

* check for `docker-compose.yml` and try `docker compose up -d db`
* check for a local Postgres and a `.env` pointing at localhost
* run migrations from `backend/migrations/` against it

If you cannot get a local database running, stop and report. Do not fall back to any remote or production connection string. Do not proceed to tasks 2–5 that depend on seeded data — instead skip to the parts that don't (the code fixes in tasks 2, 4, 5 are all verifiable by reading and by unit tests), and report clearly which verifications you could not perform.

Also stop and ask if any task requires a schema migration you didn't expect, or if a fix turns out to be larger than the audit described.

## Task 1 — Seed local test data (E3-011)

Write a re-runnable seed script (idempotent, or truncate-and-reseed) under `backend/seeds/`. Mark every seeded row so it's identifiable and removable — a recognizable prefix on titles, or a dedicated flag.

* Safety: 15–20 `safety_reports` covering all 3 types x 4 severities x 4 statuses, every enum value at least twice. Include reporters from different departments, and at least one `is_anonymous = true`.
* Maintenance: one Maintenance-type request at each stage — Pending, Manager_Approved, Approved-with-WorkOrder, work order In_Progress, work order Completed.
* Jobs: equipment + inventory, users in distinct `job_team` roles (Supervisor, Chief Operator, DAQ, Engineer), and jobs parked at each of the 7 real statuses.

While seeding Jobs, record which literal status strings the DB actually accepts and stores. Task 4 depends on knowing this.

Commit: `chore(seeds): add local test data for safety, maintenance, jobs`

## Task 2 — Maintenance Work Order link (E3-005)

`RequestDetailsSection.jsx:26` renders the Work Order block only when `isAdditionalRequest` is true — never true for a standard Maintenance request from `/requests/new?type=MAINTENANCE`. The data is there (`details.workOrderId` is written by `approval.service.js` on Purchasing approval); only the UI condition is wrong.

Drop the `isAdditionalRequest &&` guard or add a second branch, pointing at `/maintenance/:workOrderId`. Keep the existing additional-request behaviour working.

Verify: open a seeded Maintenance request that has a work order, confirm the link renders and navigates.

Commit: `fix(maintenance): show work order link on standard maintenance requests`

## Task 3 — Safety's four bugs (E3-003)

All four are in the same area. One commit is fine.

1. `SafetyReportDetail.jsx:62` crashes — reads `report.report_type`; the query returns the column as `type`. `SafetyReportCard.jsx` already has the fallback `report.type || report.report_type`. Apply the same handling. This is the ship blocker — nothing past it is reachable.
2. Status-update section never renders — `canUpdateStatus` depends on `user.department_name`, which exists nowhere. The user object carries `user.department` (plain string), set in `auth.service.js`, `auth.controller.js`, `users.controller.js`. Fix the field reference.
3. "Mark Resolved" writes `'Closed'` — the enum has both `Resolved` and `Closed`; `resolved_at` and the stats query's `resolved_count` both key off `'Resolved'`. Decision: make the button write `'Resolved'`. That makes the label honest and unsticks the stat card. Leave `'Closed'` reachable as a separate action only if one already exists — don't build a new one.
4. `SafetyHub.jsx:13` `SAFETY_ADMIN_ROLES` is missing `Safety_Manager` — backend `safety.routes.js` and `routeRoles.js` `SAFETY_ROLES` both include it. Add it. Don't invent a new shared constant in this pass; just correct the array.

Verify with seeded data: open a detail page (no crash), change a status, confirm the Resolved stat moves, and log in as `Safety_Manager` to confirm the full list view with filters and stats.

Commit: `fix(safety): detail crash, dead status gate, resolved status, role list`

## Task 4 — Job status badges render gray (E3-006)

`JobStatusBadge.jsx` does a raw `JOB_STATUS_CONFIG[status]` lookup. Frontend constants use SCREAMING_SNAKE_CASE; `workflow.queries.js` writes TitleCase (`'Approved'`, `'Post_Job'`, `'In_Progress'`). The key never matches, so every badge falls through to gray.

`WorkflowActions.jsx` already has a case-insensitive `statusIs()` helper. Reuse or extract it — do not add a third normalization approach. If extracting, put it somewhere both can import.

Use the actual stored strings recorded in Task 1, not the constants file.

Out of scope: the enum cleanup (duplicate casings, dead members, the unused `job_status` type). Leave it.

Verify: seeded jobs at all 7 statuses render with correct colour and label.

Commit: `fix(jobs): normalize status lookup in JobStatusBadge`

## Task 5 — Duplicate activity logging (E3-007)

`equipment.controller.js`'s `disburseItem` / `startSourcing` / `itemArrived` / `returnItem` each call `logAction()`, and `equipment.service.js` independently calls `logActivity()` inside the same operations — two rows per event, two shapes, two different action-name strings.

Decision: keep the service-level logging, remove the controller-level calls. Service-level can't be bypassed by another caller. But first grep for any non-controller caller of those service functions and confirm nothing depends on the controller's shape — if something does, stop and report rather than guessing.

This matters because the activity log is the audit trail, and the export in E3-008 will read it. Getting this right first avoids shipping a double-counting report.

Verify: perform each of the four actions on seeded data, confirm exactly one activity_log row per action with a consistent shape.

Commit: `fix(jobs): remove duplicate activity logging in equipment actions`

## Rules for the whole pass

* Run the test suite after each task. If tests fail, fix before moving on. If a fix has no coverage and is cheap to test, add a test.
* Commit per task, messages as given above.
* Respect the 150-line file ceiling in `CLAUDE.md`. If a fix pushes a file over, extract rather than let it grow.
* Don't touch: `E3-001` (premise is wrong, see the task comment), the 17 open SRE tasks, the enum cleanup, the sidebar's IN DEVELOPMENT labels, or anything in `E3-010` (Comments, partial approval, richer Safety form, post-job inspection — all pending a build-or-cut decision).
* Don't remove the IN DEVELOPMENT labels. That's a separate call after these are verified working.
* If a fix reveals a second instance of the same bug elsewhere (this codebase has a pattern of fixes applied to one file and missed in its neighbour), note it — don't silently expand scope.

## Report at the end

Per task: what changed, what you verified and how, what you couldn't verify. Then: whether Maintenance, Safety, and Jobs steps 1–11 are now shippable, and anything you hit that the audit didn't predict.
