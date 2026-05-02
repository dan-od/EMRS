# SRE Review — Phase 5: Frontend State & Performance
**Date:** 2026-04-24
**Reviewer:** Claude Code (SRE Skill)
**Scope:** Zustand store design, route splitting & lazy loading, re-render patterns, SWR data fetching, bundle size, component architecture, role-based dashboard routing.

---

## Critical Issues (Must Fix Before Launch)

### C1 — No React Error Boundary: Unhandled Render Errors Crash Entire App
- **Issue:** `App.jsx` wraps routes in `<Suspense>` but provides no `<ErrorBoundary>`. `Suspense` handles loading states only — it does not catch runtime errors. Any unhandled throw in a lazily-loaded page component (prop access on undefined, malformed API response, or library error) causes React to unmount the entire component tree with a blank white screen.
- **Location:** `frontend/src/App.jsx:24`, `frontend/src/routes/index.jsx:115`
- **Impact:** A single crash in any one of the 30+ lazy-loaded page components (e.g., `RequestDetail.jsx` encountering a null `request.details` access) kills the app for that user with no error message and no recovery path. Field engineers working offline or on poor connectivity are especially vulnerable. CLAUDE.md item N9 acknowledges this as a known gap but it is still absent.
- **Fix:** Add an `ErrorBoundary` class component around the lazy route tree. At minimum:
  ```jsx
  // In App.jsx, wrap the Suspense block:
  <ErrorBoundary fallback={<ErrorPage />}>
    <Suspense fallback={<PageLoader />}>
      ...
    </Suspense>
  </ErrorBoundary>
  ```
  Also add per-route error boundaries around high-risk pages (`RequestDetail`, `PurchasingDashboard`, `MaintenanceDetail`) so an error in one page doesn't kill navigation.

---

### C2 — 7 DB Roles Unhandled in Route Guards: Functional Lockout
- **Issue:** Seven `user_role` enum values exist in PostgreSQL that are absent from the frontend `ROLES` constant in `roleConfig.js`: `Operator`, `Technician`, `Logistics_Coordinator`, `Department_Manager`, `Purchasing_Officer`, `Maintenance_Technician`, `IT_Admin`. These roles are defined in the DB and can be assigned to users. The route guard arrays in `routes/index.jsx` are built from `ROLES.*` — none of these seven values are present in any guard.
- **Location:** `frontend/src/utils/roleConfig.js:3-16`, `frontend/src/routes/index.jsx:73-99`
- **Impact by role:**
  - `Purchasing_Officer` — sidebar correctly shows Purchasing nav (sidebarConfig handles it by string), but `PURCHASING_ROLES` route guard does not include this role. The user clicks any Purchasing link → `ProtectedRoute` redirects to `/unauthorized`. Fully locked out of their own module.
  - `Department_Manager` — `isManager()` matches because the string contains `'Manager'`, so they get `ManagerDashboard` and manager sidebar. But `MANAGER_ROLES` in `routes/index.jsx:74` does not include this role, so `/requests/dept` and equipment management routes redirect to `/unauthorized`.
  - `Operator`, `Technician`, `Maintenance_Technician`, `Logistics_Coordinator`, `IT_Admin` — fall through all dashboard checks to the default `EngineerDashboard`, and are silently treated as the lowest-privilege role. They can only access routes that have no `allowedRoles` guard.
- **Fix:** Add all seven roles to `ROLES` in `roleConfig.js` with appropriate levels, then add them to the relevant role-group arrays in `routes/index.jsx`. `Purchasing_Officer` must be added to `PURCHASING_ROLES`. `Department_Manager` must be added to `MANAGER_ROLES`.

---

## Major Improvements (Strongly Recommended)

### M1 — Full-Store Zustand Subscriptions: 30+ Components Subscribe to Entire `authStore`
- **Issue:** Every component reads auth state with `const { user } = useAuthStore()`. This is destructuring from a full store subscription — the component subscribes to the entire `authStore` slice, not just `user`. When any field in `authStore` changes (including `token` being updated on a future refresh flow), all 30+ subscribed components re-render.
- **Location:** Every file matching `const { ... } = useAuthStore()` — confirmed 30+ occurrences across `Header.jsx`, `Sidebar.jsx`, `Dashboard.jsx`, `RequestDetail.jsx`, `EquipmentList.jsx`, `MaintenanceDetail.jsx`, `DeptRequests.jsx`, and many others.
- **Impact:** Any authStore mutation (e.g., `updateUser()`, which is called by profile updates) triggers a full re-render cascade across all mounted components that subscribe to the store. On the `PurchasingDashboard` or `RequestDetail` pages with 10+ child components each subscribing, this creates noticeable jank.
- **Fix:** Use selector syntax:
  ```js
  // BAD (subscribes to all 6 fields in authStore):
  const { user } = useAuthStore();
  
  // GOOD (subscribes only to user, doesn't re-render on token change):
  const user = useAuthStore(state => state.user);
  ```

---

### M2 — Full UIStore Subscription in High-Traffic Components
- **Issue:** `CreateRequest.jsx:57` and `RequestDetail.jsx:89` each use `const uiStore = useUIStore()` — assigning the entire store to a variable. `uiStore` contains theme, sidebar state, modal state, global loading, offline state, notification count, and the toast queue. Any change to any of these 10+ fields (sidebar collapse, new toast, theme toggle) triggers a full re-render of these two pages and all their children.
- **Location:** `frontend/src/features/requests/pages/CreateRequest.jsx:57`, `frontend/src/features/requests/pages/RequestDetail.jsx:89`
- **Impact:** `RequestDetail` is the most complex page in the app (335 lines, multiple panels, approval forms). A sidebar collapse or an unrelated toast notification triggers a full re-render of the entire page including approval forms mid-edit. This risks losing unsaved form state.
- **Fix:**
  ```js
  // In CreateRequest.jsx — only need addNotification:
  const addNotification = useUIStore(state => state.addNotification);
  
  // In RequestDetail.jsx — only need addNotification:
  const addNotification = useUIStore(state => state.addNotification);
  ```

---

### M3 — PurchasingDashboard Fires 11 Concurrent SWR Requests on Every Mount
- **Issue:** `PurchasingDashboard.jsx` invokes 11 separate SWR-backed hooks at mount time: `usePurchasingStats`, `usePurchasingRequests`, `useReadyToDisburse`, `useOnHoldRequests`, `useDisbursedActive`, `usePendingReturnRequests`, `useOverdueReturns`, `useCompletedRequests`, `useLowStock`, `useMaintenanceApprovals`, `usePendingExtensionsPurchasing`, and one bare `useApi` call. All 11 have distinct cache keys so SWR cannot deduplicate them.
- **Location:** `frontend/src/features/purchasing/pages/PurchasingDashboard.jsx:48-74`
- **Impact:** With the global `refreshInterval: 60000`, each Purchasing user generates 11 HTTP requests per minute. Each request hits the backend and runs a DB query. With 2–3 concurrent Purchasing users, that is 22–33 DB queries per minute from dashboards alone — before any user action. On a single-server deployment with a 20-connection pool, this leaves less headroom for actual user-initiated operations.
- **Fix:** Consolidate into a single `/requests/purchasing/summary` endpoint that returns all dashboard data in one response, or lazy-load the tab data (only fetch the data for the active tab, not all tabs simultaneously).

---

### M4 — AdminDashboard Fetches All Users and All Equipment Without Pagination
- **Issue:** `AdminDashboard.jsx:16-17` calls `useApi(USERS.BASE)` and `useApi(EQUIPMENT.BASE)` with no pagination parameters. Both endpoints return full table contents. As the company grows, these become unbounded queries.
- **Location:** `frontend/src/features/dashboard/pages/AdminDashboard.jsx:16-19`
- **Impact:** A 500-user company with 200 equipment items sends a response payload of ~500KB per dashboard load plus 60-second refresh. The dashboard then `.filter()` across the full arrays in the render function, adding client-side CPU work on every re-render.
- **Fix:** Request only the stats needed for the dashboard (counts, recent items). Add `?limit=5` for recent-items display, or create a `/admin/summary` endpoint that returns pre-aggregated stats.

---

### M5 — `useNotifications` Bypasses SWR: Parallel Polling Infrastructure
- **Issue:** `useNotifications.js` implements its own `useState + useEffect + setInterval` polling at 30-second intervals, bypassing the global SWR configuration entirely. The `NotificationBell` in `Header.jsx` is rendered on every authenticated page, so this 30-second interval is always active.
- **Location:** `frontend/src/features/notifications/hooks/useNotifications.js:24-82`
- **Impact:** This creates a second polling infrastructure that cannot be paused when the user is idle, cannot be controlled by SWR's `revalidateOnFocus`/`revalidateOnReconnect` flags, and cannot benefit from SWR's deduplication. Effectively every authenticated user makes 2 requests per minute just to `GET /notifications` and `GET /notifications/unread-count`.
- **Fix:** Migrate to `useSWR` with the global config. SWR's `refreshInterval` and `revalidateOnFocus: false` would give the same behavior with proper lifecycle management and deduplication.

---

### M6 — 401 Interceptor Clears localStorage But Skips Zustand `logout()`
- **Issue:** When the API interceptor catches a 401 (`api.js:49-56`), it calls `localStorage.removeItem('emrs-auth')` and then `window.location.href = '/login'`. The Zustand `logout()` action is never called. The full-page redirect masks this because Zustand rehydrates from localStorage on load (now empty), but during the brief window between the `removeItem` call and the redirect, in-memory Zustand state still shows `isAuthenticated: true`.
- **Location:** `frontend/src/services/api.js:49-56`
- **Impact:** Any synchronous code that runs after the 401 (including React render cycles triggered by the SWR error) reads `isAuthenticated: true` from the in-memory store and may try to access the now-invalid session. More importantly, if another API call fires before the redirect completes (SWR retries, polling interval), it reads the token from in-memory state — but `localStorage` is already cleared, causing inconsistency.
- **Fix:**
  ```js
  if (error.response?.status === 401) {
    if (!window.location.pathname.includes('/login')) {
      // Import and call store's logout, THEN redirect:
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
  }
  ```

---

### M7 — Dual Toast Notification Systems Active Simultaneously
- **Issue:** Two independent toast systems are active: (1) `react-hot-toast` with a `<Toaster>` in `main.jsx:24` and (2) `uiStore.addNotification` with a custom `<Toast>/<ToastContainer>` component used by purchasing pages, `PurchasingApprovalForm`, and other mutation handlers. `useAuth.js` uses `react-hot-toast`; purchasing mutation handlers use `addNotification`.
- **Location:** `frontend/src/main.jsx:24`, `frontend/src/store/uiStore.js:82-101`, `frontend/src/features/purchasing/pages/PurchasingDashboard.jsx` (addNotification), `frontend/src/features/auth/hooks/useAuth.js:5` (toast from react-hot-toast)
- **Impact:** Users may see two different toast styles or duplicate notifications. The systems have different auto-dismiss timers (4000ms for react-hot-toast vs 5000ms for uiStore). Error messages from login use one system; error messages from disbursement use the other. CLAUDE.md task 4.2 acknowledges this as a post-MVP cleanup item.
- **Fix:** Standardize on `react-hot-toast` (already in the dependency list and used for auth) and remove `uiStore.addNotification`. Replace all `addNotification` calls with `toast.success`/`toast.error`.

---

## Minor Suggestions (Nice to Have)

- **`frontend/src/utils/constants.js:18-27`** — `REQUEST_STATUS` is missing `MANAGER_APPROVED: 'Manager_Approved'` and `CANCELLED: 'Cancelled'`. Both values are used as raw string literals throughout the codebase (`AllRequests.jsx:82`, `RequestDetail.jsx:4`). Adding them to the constant prevents future typo bugs and enables IDE autocomplete.

- **`frontend/src/routes/routeConfig.js`** — This file exports a `routeConfig` object but is never imported anywhere in the project. The actual route definitions are inline in `routes/index.jsx`. Dead code that will mislead future developers into thinking it's authoritative. Delete it.

- **`frontend/package.json:26`** — `xlsx: ^0.18.5` is listed as a production dependency but no `import from 'xlsx'` was found in any source file. The `xlsx` library adds ~750KB (minified) to the bundle. If it is genuinely unused, remove it. If export-to-Excel is planned, import it dynamically inside the handler that needs it, not as a top-level bundle dep.

- **`frontend/src/features/requests/pages/RequestDetail.jsx` (335 lines)** and **`DeptRequests.jsx` (338 lines)** — Both exceed the project's 150-line page limit defined in CLAUDE.md. `RequestDetail` embeds the entire approval context logic (`getApprovalContext` function at line 50), duplicate role-check helpers (`isManagerRole`, `isPurchasingRole`) that duplicate `helpers.js`, and renders 6 different conditional sections. Extracting the approval logic into a hook and role helpers into `helpers.js` would bring these under limit.

- **`frontend/src/features/requests/pages/RequestDetail.jsx:31-38`** — `isManagerRole()` defined locally includes `'Department_Manager'` and `'Manager'` as allowed approver roles. `helpers.js:isManager()` checks `role.includes('Manager')` which covers the same set. These two implementations can diverge silently. Consolidate to a single helper.

- **`frontend/src/main.jsx:10-16`** — SWR global `refreshInterval: 60000` applies to every SWR key including rarely-changing data like `/users`, `/equipment`, and vendor lists. Consider per-hook overrides: `useApi('/users', { refreshInterval: 0 })` for static admin data, keeping the 60s interval only for request-status hooks where freshness matters.

- **`frontend/src/features/dashboard/pages/Dashboard.jsx:26`** — When no `isX(role)` check matches (e.g., for the 7 missing roles), the fallback is `EngineerDashboard`. An unrecognized role should ideally render a minimal "Contact your administrator" dashboard rather than the engineer view, which may confuse the user with irrelevant data.

---

## Phase Score

| Area | Score | Notes |
|------|-------|-------|
| 5.1 Zustand Store Design | ⚠️ Needs Work | Stores scoped correctly ✅; full-store subscriptions in 30+ components ⚠️; `uiStore` monolith causes cascade re-renders ⚠️ |
| 5.2 Route Splitting & Lazy Loading | ⚠️ Needs Work | All pages lazy-loaded ✅; `Suspense` present ✅; no `ErrorBoundary` ❌ |
| 5.3 Re-render Patterns | ⚠️ Needs Work | `memo()` used on list items ✅; full-store subscriptions at page level ⚠️ |
| 5.4 API Data Fetching | ⚠️ Needs Work | SWR used globally ✅; deduping at 5s ✅; 11 concurrent dashboard fetches ⚠️; unpaginated admin fetches ⚠️ |
| 5.5 Bundle Size | ⚠️ Needs Work | date-fns ✅ (no moment.js); lucide-react used correctly ✅; xlsx possibly dead dep ⚠️ |
| 5.6 Component Architecture | ⚠️ Needs Work | Good modular structure ✅; 2 pages over 150-line limit ⚠️; routeConfig.js is dead code ⚠️ |
| 5.7 Role-Based Routing | ❌ Critical Gap | 7 DB roles unhandled ❌; Purchasing_Officer locked out ❌; `Department_Manager` blocked from manager routes ❌ |

---

## Files Audited

| File | Lines |
|------|-------|
| `frontend/src/App.jsx` | 40 |
| `frontend/src/main.jsx` | 44 |
| `frontend/src/store/authStore.js` | 49 |
| `frontend/src/store/uiStore.js` | 114 |
| `frontend/src/store/index.js` | 2 |
| `frontend/src/routes/index.jsx` | 296 |
| `frontend/src/routes/ProtectedRoute.jsx` | 26 |
| `frontend/src/routes/routeConfig.js` | 79 |
| `frontend/src/utils/constants.js` | 142 |
| `frontend/src/utils/roleConfig.js` | 80 |
| `frontend/src/utils/helpers.js` | 247 |
| `frontend/src/config/sidebarConfig.js` | 208 |
| `frontend/src/services/api.js` | 73 |
| `frontend/src/services/endpoints.js` | ~80 |
| `frontend/src/hooks/useApi.js` | 90 |
| `frontend/src/features/dashboard/pages/Dashboard.jsx` | 29 |
| `frontend/src/features/dashboard/pages/ManagerDashboard.jsx` | 225 |
| `frontend/src/features/dashboard/pages/EngineerDashboard.jsx` | 147 |
| `frontend/src/features/dashboard/pages/AdminDashboard.jsx` | 250 |
| `frontend/src/features/dashboard/pages/PurchasingDashboard.jsx` | 336 |
| `frontend/src/features/requests/hooks/useRequests.js` | 218 |
| `frontend/src/features/requests/pages/RequestDetail.jsx` | 335 |
| `frontend/src/features/requests/pages/CreateRequest.jsx` | 163 |
| `frontend/src/features/requests/pages/DeptRequests.jsx` | 338 |
| `frontend/src/features/notifications/hooks/useNotifications.js` | 90 |
| `frontend/src/features/notifications/components/NotificationBell.jsx` | ~100 |
| `frontend/src/features/auth/hooks/useAuth.js` | 85 |
| `frontend/src/features/purchasing/pages/PurchasingDashboard.jsx` | 336 |
| `frontend/src/features/purchasing/hooks/usePurchasing.js` | ~160 |
| `frontend/src/components/layout/Header.jsx` | 65 |
| `frontend/src/components/layout/Sidebar.jsx` | ~100 |
| `frontend/vite.config.js` | 55 |
| `frontend/package.json` | 43 |
