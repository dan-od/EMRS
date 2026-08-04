# Admin Routes Audit — Phase 1

**Date:** 2026-07-28
**Scope:** Investigation only, no code changes. Answers whether `Admin`-visible-but-not-`Admin`-sidebar routes are deliberate design or drift from `FIX-ROLE-SYSTEM`.
**Note on skill reference:** the task pointed at an `emrs-sre-review` skill under `.claude/skills/`. No `.claude/skills/` directory exists in this repo (there's a `docs/sre-review/` phase-report set instead, which is prior audit *output*, not a skill). This report was produced by direct investigation of the route, sidebar, and backend-guard files.

---

## 1. Route inventory (`frontend/src/routes/`)

Routes are assembled in [`index.jsx`](../../frontend/src/routes/index.jsx) from eight group files under `routes/groups/`. The whole `AppRoutes` tree sits inside one top-level `<ProtectedRoute>` (auth-only, no role check) from `routes/index.jsx:26`; individual routes then optionally add a second `<ProtectedRoute allowedRoles={...}>` layer.

| Path | Component | File | `allowedRoles` | Guard? |
|---|---|---|---|---|
| `/dashboard` | Dashboard | `features/dashboard/pages/Dashboard.jsx` | — | auth only |
| `/` | → redirect `/dashboard` | — | — | auth only |
| `/accounts` | AccountsDashboard | `features/accounts/pages/AccountsDashboard.jsx` | `ACCOUNTS_ROLES` | role-guarded |
| `/activity` | ActivityLogs | `features/activity/pages/ActivityLogs.jsx` | **none** | **auth only, no role check** |
| `/settings` | Settings | `features/dashboard/pages/Settings.jsx` | — | auth only |
| `/unauthorized` | Unauthorized | `features/auth/pages/Unauthorized.jsx` | — | auth only |
| `/equipment` | EquipmentList | `features/equipment/pages/EquipmentList.jsx` | — | auth only |
| `/equipment/new` | AddEquipment | … | `EQUIPMENT_MANAGER_ROLES` | role-guarded |
| `/equipment/request` | RequestAssetForm | … | — | auth only |
| `/equipment/requests` | EquipmentRequestsList | … | `EQUIPMENT_MANAGER_ROLES` | role-guarded |
| `/equipment/requests/:id` | EquipmentRequestDetail | … | `EQUIPMENT_MANAGER_ROLES` | role-guarded |
| `/equipment/:id` | EquipmentDetail | … | — | auth only |
| `/equipment/:id/edit` | EditEquipment | … | `EQUIPMENT_MANAGER_ROLES` | role-guarded |
| `/jobs` | JobList | `features/jobs/pages/JobList.jsx` | `DEV_PREVIEW_ROLES` (`Super_Admin` only) | role-guarded |
| `/jobs/new` | CreateJob | … | `DEV_PREVIEW_ROLES` | role-guarded |
| `/jobs/purchasing-queue` | PurchasingQueuePage | … | `DEV_PREVIEW_ROLES` | role-guarded |
| `/jobs/:id/edit` | EditJob | … | `DEV_PREVIEW_ROLES` | role-guarded |
| `/jobs/:id` | JobDetail | … | `DEV_PREVIEW_ROLES` | role-guarded |
| `/maintenance` | MaintenanceList | `features/maintenance/pages/MaintenanceList.jsx` | `MAINTENANCE_ROLES` | role-guarded |
| `/maintenance/:id` | MaintenanceDetail | … | `MAINTENANCE_ROLES` | role-guarded |
| `/purchasing` | PurchasingDashboard | `features/purchasing/pages/PurchasingDashboard.jsx` | `PURCHASING_ROLES` | role-guarded |
| `/purchasing/inventory` | InventoryPage | … | `PURCHASING_ROLES` | role-guarded |
| `/purchasing/vendors` | VendorsPage | … | `PURCHASING_ROLES` | role-guarded |
| `/purchasing/vehicles` | VehiclesPage | … | `PURCHASING_ROLES` | role-guarded |
| `/purchasing/damaged` | DamagedInventoryPage | … | `PURCHASING_ROLES` | role-guarded |
| `/requests`, `/requests/hub` | RequestHub | `features/requests/pages/RequestHub.jsx` | — | auth only |
| `/requests/my` | MyRequests | … | — | auth only |
| `/requests/new` | CreateRequest | … | — | auth only |
| `/requests/all` | AllRequests | … | `ADMIN_ROLES` | role-guarded |
| `/requests/dept` | DeptRequests | … | `MANAGER_ROLES` | role-guarded |
| `/requests/:id` | RequestDetail | … | — | auth only |
| `/safety` | SafetyHub | `features/safety/pages/SafetyHub.jsx` | `SAFETY_ROLES` | role-guarded |
| `/safety/new` | CreateSafetyReport | … | `SAFETY_ROLES` | role-guarded |
| `/safety/:id` | SafetyReportDetail | … | `SAFETY_ROLES` | role-guarded |
| `/users` | UserList | `features/users/pages/UserList.jsx` | `USER_MANAGEMENT_ROLES` | role-guarded |
| `/users/new` | CreateUser | … | `USER_MANAGEMENT_ROLES` | role-guarded |
| `/users/:id/edit` | EditUser | … | `USER_MANAGEMENT_ROLES` | role-guarded |
| `/users/:id` | UserDetail | … | `USER_MANAGEMENT_ROLES` | role-guarded |

**Flag — `/activity` is unguarded, as suspected.** No `allowedRoles` at all; any authenticated user (any of the 23 roles) can load the page. This is **not** an oversight relative to the backend: `activity.routes.js` also applies `authenticate` only, with no `requireRoles`, and the controller does row-level filtering instead (`activity.controller.js:78-81` — own logs unless `Super_Admin`/`Admin`/`*Manager`). Frontend and backend agree: this route is intentionally open-with-server-side-filtering, not a hole. Listed here per the brief, verdict below is **intentional**.

Role-group constants resolved from [`routes/routeRoles.js`](../../frontend/src/routes/routeRoles.js):

```js
ADMIN_ROLES            = [Super_Admin, Admin]
USER_MANAGEMENT_ROLES  = [Super_Admin, Admin, IT_Support, IT_Manager]
PURCHASING_ROLES       = [Super_Admin, Admin, Purchasing_Manager, Purchasing_Staff]
MANAGER_ROLES          = [Super_Admin, Admin, IT_Manager, Operations_Manager, Purchasing_Manager,
                           Accounts_Manager, Safety_Manager, Maintenance_Manager, HR_Manager,
                           Logistics_Manager, Workshop_Manager]
EQUIPMENT_MANAGER_ROLES= MANAGER_ROLES + Purchasing_Staff
MAINTENANCE_ROLES      = [Super_Admin, Admin, IT_Support, IT_Manager, Operations_Manager,
                           Maintenance_Manager, Field_Engineer, Purchasing_Manager, Purchasing_Staff,
                           Accounts_Manager, Accounts_Staff, HR_Manager, Logistics_Manager, Workshop_Manager]
ACCOUNTS_ROLES         = [Super_Admin, Admin, Accounts_Manager, Accounts_Staff]
SAFETY_ROLES           = [Super_Admin, Admin, Safety_Officer, Safety_Manager, Operations_Manager]
DEV_PREVIEW_ROLES      = [Super_Admin]
```

`Admin` is present in every group above except `DEV_PREVIEW_ROLES` (Jobs module — correctly excluded, Jobs is explicitly NOT MVP per `CLAUDE.md`).

---

## 2. Sidebar visibility (`frontend/src/config/sidebarConfig.js`)

Comparing `getAdminSidebar()` against `getSuperAdminSidebar()`:

| Nav item | In Admin sidebar? | In Super_Admin sidebar? |
|---|---|---|
| Dashboard | ✅ | ✅ |
| Equipment | ✅ | ✅ |
| Maintenance / Work Orders | ✅ | ✅ |
| Requests (hub/my/dept) | ✅ | ✅ |
| Requests → All Requests | ✅ (child) | ✅ (child) |
| **Safety Reports** | ❌ | ✅ |
| **Purchasing (dashboard/inventory/damaged/vendors/vehicles)** | ❌ | ✅ |
| **Accounts (Asset Ledger)** | ❌ | ✅ |
| Users → User Management | ✅ | ✅ |
| Activity Logs | ✅ | ✅ |
| Jobs / Purchasing Queue | ❌ | ✅ ("In Development" divider) |

Three groups are absent from `getAdminSidebar()` (`sidebarConfig.js:50-63`) but present in `getSuperAdminSidebar()` (`sidebarConfig.js:22-48`): **Safety, Purchasing, Accounts**. Jobs is also Super_Admin-only in the sidebar, but that tracks its `DEV_PREVIEW_ROLES` guard and the "NOT in MVP" status in `CLAUDE.md` — not part of the anomaly.

---

## 3. Backend cross-check

For each of the three candidate gaps, the matching `backend/src/modules/*/**.routes.js` guard:

| Module | Backend role list | Includes `Admin`? | Matches frontend? |
|---|---|---|---|
| `safety.routes.js:16` | `['Super_Admin','Admin','IT_Support','Safety_Manager','Safety_Officer','Operations_Manager']` | ✅ | Frontend `SAFETY_ROLES` matches except backend also admits `IT_Support` (frontend doesn't) — no 403 risk, just an extra backend allowance the UI never surfaces. |
| `purchasing.routes.js:12` | `['Super_Admin','Admin','Purchasing_Manager','Purchasing_Staff']` | ✅ | Exact match with frontend `PURCHASING_ROLES`. |
| `accounts.routes.js:13` (applied via `router.use(...)` to the whole module) | `['Super_Admin','Admin','Accounts_Manager','Accounts_Staff']` | ✅ | Exact match with frontend `ACCOUNTS_ROLES`. |

**No frontend/backend mismatch.** For all three, `Admin` is already permitted end-to-end — the backend never rejects an Admin user hitting these endpoints. That rules out the "worse" failure mode the brief was worried about (page loads, then 403s). The only thing missing is the **sidebar nav entry**; an Admin who types `/safety`, `/purchasing`, or `/accounts` directly gets a fully working page today.

`ROLE_HIERARCHY` in `backend/src/middleware/roleCheck.js:28-46` puts `Admin` at level 9, one below `Super_Admin` (10), and above every department-manager role (7). That hierarchy is consistent with Admin being "almost-Super_Admin" — it supports reading the sidebar gap as unintentional rather than a deliberate demotion.

No trace of `IT_Admin`, `Purchasing_Officer`, or `Department_Manager` remains in any of `routeRoles.js`, `sidebarConfig.js`, `roleConfig.js`, or the backend `roleCheck.js` — the `FIX-ROLE-SYSTEM` rename/removal is fully applied on both sides. Git history for `sidebarConfig.js` and `routeRoles.js` shows only the single squashed "Initial commit" in this repo, so the exact PR that introduced the gap can't be traced locally — but the fact that role-group constants (`routeRoles.js`) already include `Admin` everywhere, while the sidebar file alone omits three of those groups, strongly suggests the sidebar just wasn't updated when Purchasing/Safety/Accounts were built out for Admin-level access. It reads as **missed sidebar wiring**, not a deliberate access decision.

`/purchasing/vehicles` is a special case: it inherits the same `PURCHASING_ROLES` guard and same sidebar gap as the rest of Purchasing, but the Vehicles module itself is separately listed as **deferred** in `CLAUDE.md`. Its absence from the Admin sidebar is correct today regardless of the Purchasing gap's resolution — it shouldn't be added to an Admin Console until Vehicles ships.

---

## 4. Full verdict matrix

| Route | Component | Frontend roles | In Admin sidebar? | In SA sidebar? | Backend guard | Verdict |
|---|---|---|---|---|---|---|
| `/safety` | SafetyHub | `SAFETY_ROLES` (incl. Admin) | ❌ | ✅ | `requireRoles(safetyRoles)` incl. Admin (list/stats/status endpoints; detail/history endpoints are open to any authenticated user) | **accidental gap** |
| `/safety/new` | CreateSafetyReport | `SAFETY_ROLES` | ❌ (no direct nav; reached from hub) | ✅ | `POST /` open to all authenticated (report creation is universal) | accidental gap (inherits hub) |
| `/purchasing` | PurchasingDashboard | `PURCHASING_ROLES` (incl. Admin) | ❌ | ✅ | `requireRoles(purchasingRoles)` on every endpoint, incl. Admin | **accidental gap** |
| `/purchasing/inventory` | InventoryPage | `PURCHASING_ROLES` | ❌ | ✅ | same | **accidental gap** |
| `/purchasing/vendors` | VendorsPage | `PURCHASING_ROLES` | ❌ | ✅ | same | **accidental gap** |
| `/purchasing/damaged` | DamagedInventoryPage | `PURCHASING_ROLES` | ❌ | ✅ | same | **accidental gap** |
| `/purchasing/vehicles` | VehiclesPage | `PURCHASING_ROLES` | ❌ | ✅ | same | **dead** (Vehicles module deferred per `CLAUDE.md` — correct to omit regardless of the Purchasing gap) |
| `/accounts` | AccountsDashboard | `ACCOUNTS_ROLES` (incl. Admin) | ❌ | ✅ | `router.use(requireRoles(ACCOUNTS_ROLES))` module-wide, incl. Admin | **accidental gap** |
| `/jobs`, `/jobs/new`, `/jobs/:id`, `/jobs/:id/edit`, `/jobs/purchasing-queue` | Jobs pages | `DEV_PREVIEW_ROLES` (Super_Admin only) | ❌ | ✅ | Mixed — many Jobs endpoints have no `requireRoles` at all (e.g. `GET /`, `GET /:id`), relying on the frontend gate | **intentional** (Jobs is explicitly NOT MVP per `CLAUDE.md`; do not touch) |
| `/activity` | ActivityLogs | none (auth only) | ✅ | ✅ | `authenticate` only + row-level filtering by role in controller | **intentional** (open-by-design, server-side filtered — not a gap) |
| `/dashboard`, `/equipment`, `/equipment/:id`, `/requests*` (hub/my/new/:id), `/settings` | various | none (auth only) | ✅ | ✅ | varies, not role-gated at list level | **intentional** (baseline authenticated pages) |
| `/maintenance`, `/maintenance/:id` | Maintenance pages | `MAINTENANCE_ROLES` (incl. Admin) | ✅ | ✅ | `requireRoles([...])` incl. Admin per write endpoint | consistent, no gap |
| `/requests/all` | AllRequests | `ADMIN_ROLES` | ✅ (child) | ✅ (child) | `requireRoles(ADMIN_ROLES)` | consistent, no gap |
| `/requests/dept` | DeptRequests | `MANAGER_ROLES` (incl. Admin) | ✅ (child) | ✅ (child) | `requireRoles(MANAGER_ROLES)` | consistent, no gap |
| `/users*` | User management pages | `USER_MANAGEMENT_ROLES` (incl. Admin) | ✅ | ✅ | `requireRoles([...])` incl. Admin per endpoint (delete restricted to `Super_Admin`/`Admin` only) | consistent, no gap |
| `/equipment/new`, `/equipment/requests`, `/equipment/requests/:id`, `/equipment/:id/edit` | Equipment write pages | `EQUIPMENT_MANAGER_ROLES` (incl. Admin) | n/a (sub-routes, reached from `/equipment`) | n/a | `requireRoles(MANAGERS_PLUS)` incl. Admin | consistent, no gap |

---

## 5. Recommendation

The gap is **accidental, not intentional** — Safety, Purchasing (minus Vehicles), and Accounts should all be in the Admin sidebar. The role-group constants (`routeRoles.js`) and every relevant backend `requireRoles` array already grant `Admin` full access; only `sidebarConfig.js`'s `getAdminSidebar()` was never updated to surface them. Since the backend already agrees, adding the three nav sections is a pure UI fix with no permission-model change and no matching backend edit required.

For the Phase 2 Admin Console:

- **Belongs in Admin Console (fix now):** Safety Reports, Purchasing (dashboard/inventory/damaged/vendors), Accounts (Asset Ledger) — add to `getAdminSidebar()`, no backend change needed since guards already admit `Admin`.
- **Stays Super_Admin-only:** Jobs / Purchasing Queue (not MVP, per `CLAUDE.md` — leave untouched), Purchasing → Vehicles (deferred module, leave untouched until it ships).
- **No action needed:** `/activity` — already correctly open-with-filtering; don't add a role guard to it, that would be a behavior change, not a fix.
- **Worth a follow-up note (not urgent):** `safety.routes.js` backend admits `IT_Support` on list/stats/status endpoints that the frontend `SAFETY_ROLES` never grants — dead permission, no user can reach it through the UI. Low priority cleanup, unrelated to the Admin-sidebar question.

No implementation performed in this pass, per the brief.
