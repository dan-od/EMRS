# SRE Review — Phase 6: PWA & Offline
**Date:** 2026-04-24
**Reviewer:** Claude Code (SRE Skill)
**Scope:** Service worker configuration (vite-plugin-pwa / Workbox), caching strategies, offline UX, manifest & installability, HTTPS readiness, update flow.

---

## Critical Issues (Must Fix Before Launch)

### C1 — Workbox Caches Auth Endpoints: Deactivated Users Appear Authenticated for 24 Hours Offline
- **Issue:** The `runtimeCaching` rule in `vite.config.js` matches the pattern `/\/api\/.*/i` with no HTTP method restriction and no URL exclusions. This means `GET /auth/me` — the endpoint that verifies a user's identity and role — is cached in `api-cache` with a 24-hour TTL. If a user is deactivated, suspended, or has their role changed in the DB, those changes will not be reflected until the cached `/auth/me` entry expires.
- **Location:** `frontend/vite.config.js:27-37`
- **Impact:** A user whose account is disabled by an admin will continue to appear authenticated to the PWA for up to 24 hours if they are operating in an area with intermittent connectivity. When the device goes online, the next `/auth/me` call in NetworkFirst mode will hit the network first — but if the network call fails (flaky signal), the stale cached 200 response is served. A deactivated field engineer retains full app access offline.
- **Fix:** Exclude auth endpoints from the Workbox cache, or use a `StaleWhileRevalidate` strategy with a very short TTL (60s) for `/auth/me` specifically. The simplest fix:
  ```js
  runtimeCaching: [
    {
      // Exclude auth endpoints from caching
      urlPattern: /\/api\/(?!auth).*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 }
      }
    }
  ]
  ```

---

### C2 — No Offline Guard on Mutations: Form Submissions Fail Silently When Offline
- **Issue:** The `useOffline` hook and `uiStore.isOffline` correctly detect offline status and display the `OfflineBanner`. However, `isOffline` is not checked by any form submit handler. Every form in the app — request creation, approval, disbursement, equipment update — allows submission when offline. The resulting Axios request fails with a network error (`ERR_NETWORK`), which is caught by each action hook and typically shows a generic error message ("Failed to create request") with no indication that connectivity is the cause. The user's form data is not preserved.
- **Location:** `frontend/src/hooks/useOffline.js:1-29`, `frontend/src/features/requests/pages/CreateRequest.jsx` (submit handler), `frontend/src/features/requests/hooks/useRequests.js:102-117` (action hooks)
- **Impact:** A field engineer in the field creates a PPE request, taps Submit, gets a generic failure toast, and loses the form data. They don't know if the request was submitted or not. For maintenance requests with cost estimates and vendor details, this is a significant data loss risk. The offline banner is visible but the UX implication ("forms won't work") is not communicated.
- **Fix (minimum viable):** In each form submit handler, guard with:
  ```js
  if (!navigator.onLine) {
    addNotification({ type: 'error', message: 'You are offline. Please connect to submit.' });
    return;
  }
  ```
  **Fix (proper):** Implement a mutation queue with IndexedDB or `workbox-background-sync` that stores pending mutations and replays them when connectivity is restored.

---

## Major Improvements (Strongly Recommended)

### M1 — Single `NetworkFirst` Strategy for All API Data: Wrong for List Endpoints
- **Issue:** All `/api/*` routes use `NetworkFirst`, which means every API call always attempts the network first and only falls back to cache on failure. For frequently-read, slowly-changing data (equipment list, user list, inventory) this strategy gives no offline benefit — these endpoints only serve cached data if the network is completely unreachable.
- **Location:** `frontend/vite.config.js:27-37`
- **Impact:** Field engineers viewing the equipment list while on poor connectivity will see a spinner until the network times out (up to 30s per `api.js` timeout), then see the cached list. `StaleWhileRevalidate` would show cached data immediately while refreshing in the background — better offline UX with no data-freshness regression for list views.
- **Fix:** Use differentiated strategies:
  ```js
  runtimeCaching: [
    { // Auth: never cache (exclude from all rules)
      urlPattern: /\/api\/auth\/.*/i,
      handler: 'NetworkOnly',
    },
    { // Real-time data: NetworkFirst with short TTL
      urlPattern: /\/api\/requests.*/i,
      handler: 'NetworkFirst',
      options: { cacheName: 'requests-cache', expiration: { maxAgeSeconds: 300 } }
    },
    { // Stable data: StaleWhileRevalidate
      urlPattern: /\/api\/(equipment|users|inventory).*/i,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'stable-cache', expiration: { maxAgeSeconds: 3600 } }
    }
  ]
  ```

---

### M2 — No Background Sync: Offline Mutations Are Permanently Lost
- **Issue:** There is no `workbox-background-sync` integration or any IndexedDB-based mutation queue. When a user submits a form offline (which is not blocked — see C2), the mutation fails immediately with no queueing. There is no mechanism to replay the mutation when connectivity is restored.
- **Location:** `frontend/vite.config.js` (workbox config has no `BackgroundSyncPlugin`)
- **Impact:** Offline mutations for critical operations (PPE requests, maintenance reports) are silently lost. Field engineers in oilfield environments commonly lose connectivity for hours at a time. Without background sync, any work done offline is lost — defeating a core PWA value proposition.
- **Fix:** Add `workbox-background-sync` with a `BackgroundSyncPlugin` to the POST/PUT/PATCH routes:
  ```js
  {
    urlPattern: /\/api\/requests$/i,
    method: 'POST',
    handler: 'NetworkOnly',
    options: {
      backgroundSync: {
        name: 'request-mutations-queue',
        options: { maxRetentionTime: 24 * 60 } // 24 hours
      }
    }
  }
  ```

---

### M3 — `autoUpdate` Registration with No Visible Update Notification
- **Issue:** `vite.config.js` sets `registerType: 'autoUpdate'`. This causes `vite-plugin-pwa` to generate a service worker that automatically activates the new version without user interaction. There is no call to `useRegisterSW` anywhere in the app, so the app provides no "New version available — click to reload" prompt. More critically, there is no `skipWaiting`+`clientsClaim` notification path, so the new SW activates only when all tabs are closed and reopened.
- **Location:** `frontend/vite.config.js:9`, `frontend/src/main.jsx` (no `useRegisterSW` import)
- **Impact:** After a backend deployment that changes API response shapes (e.g., adding a required field), the old JavaScript bundle — served from the browser's cache or old SW precache — will run against new API responses until the user closes and reopens all tabs. In practice on mobile PWAs, tabs are rarely fully closed. Users can be stuck on an old version for days, getting subtle UI bugs from schema mismatches.
- **Fix:** Add `useRegisterSW` with an update prompt:
  ```jsx
  // In App.jsx or main.jsx
  import { useRegisterSW } from 'virtual:pwa-register/react';
  
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();
  // Show a non-blocking banner: "Update available. Tap to reload."
  ```

---

### M4 — External Google Fonts Dependency Unavailable Offline
- **Issue:** `index.html:11-12` includes a `<link>` preconnect to `fonts.googleapis.com` and a stylesheet link to load the `Inter` font family. The service worker precaches only assets matching the `globPatterns` (`**/*.{js,css,html,ico,png,svg,woff2}`) — it cannot precache external CDN resources.
- **Location:** `frontend/index.html:11-12`
- **Impact:** When the app is used offline, the Inter font fails to load. The browser falls back to the system sans-serif font, causing layout shifts in components that depend on Inter's specific metrics (form labels, table headers). More importantly, the `<link>` tag itself causes a failed DNS lookup on first offline load, adding ~2–5 seconds of network timeout before the page renders.
- **Fix (recommended):** Self-host the Inter font. Download the woff2 files, add them to `public/fonts/`, and declare them in `globals.css` with `@font-face`. Workbox will then precache the woff2 files automatically via `globPatterns`. This also removes the privacy concern of Google tracking font requests.

---

### M5 — Single `api-cache` Bucket (100 Entries, 24h TTL) for All API Data
- **Issue:** All API responses land in a single `api-cache` with `maxEntries: 100` and `maxAgeSeconds: 86400`. There is no per-endpoint TTL differentiation. A user's browsing pattern (repeatedly viewing the equipment list) could fill the 100-entry quota, evicting more critical cached data (request details, user profiles) via the LRU eviction policy.
- **Location:** `frontend/vite.config.js:33-36`
- **Impact:** The most-recently-viewed data may not be the most-needed data. A field engineer who browses equipment details extensively could evict their own cached request list. With 24h TTL across all entries, stale data (old equipment status, old request status) is served to users long after it changes.
- **Fix:** Use separate cache buckets per data type with appropriate entry limits and TTLs (see M1 fix above). Typical guidance: requests cache — 50 entries, 5 min TTL; equipment/users — 200 entries, 1h TTL; auth — no cache.

---

## Minor Suggestions (Nice to Have)

- **`frontend/index.html:5`** — References `/favicon.svg` but `public/` contains no `favicon.svg` file. Requests for this URL will 404 in both dev and production. The VitePWA `includeAssets` also references `favicon.ico` which does not exist. Rename or create the appropriate favicon file.

- **`frontend/vite.config.js:11`** — `includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png']`: `favicon.ico` and `robots.txt` do not exist in `public/`. The build will succeed (vite-plugin-pwa ignores missing includeAssets) but the resulting manifest will reference non-existent assets. Add a basic `robots.txt` (`User-agent: *\nDisallow: /api/`) and generate or replace `favicon.svg` with `favicon.ico`.

- **`frontend/vite.config.js:23`** — The PWA manifest uses the same `pwa-512x512.png` for both the standard 512×512 icon and the `maskable` icon (`purpose: 'maskable'`). Maskable icons require a safe-zone (the center 80% of the image must contain the relevant content, with the outer 20% used as padding). Reusing a non-maskable icon as maskable typically causes the icon to be clipped or distorted on Android adaptive icons. Generate a separate maskable version with appropriate padding.

- **`frontend/vite.config.js`** — No `devOptions` block is configured for `vite-plugin-pwa`. The service worker is only active in the production build (`vite build`). There is no way to test offline behavior during development without a separate production-mode server. Add `devOptions: { enabled: true }` during active PWA development cycles to enable SW testing in dev mode.

- **`frontend/src/hooks/useOffline.js`** — The `useOffline` hook initializes `isOffline` using `!navigator.onLine` at the time the component mounts. This is correct for initial state. However, `uiStore.js:73` also initializes `isOffline: !navigator.onLine` at module load time (before React mounts), and the two can diverge if `navigator.onLine` changes between module init and component mount. Consolidate to one source of truth.

---

## Phase Score

| Area | Score | Notes |
|------|-------|-------|
| 6.1 Service Worker Config | ⚠️ Needs Work | vite-plugin-pwa + autoUpdate configured ✅; no method filter on cache ❌; auth endpoints cached ❌ |
| 6.2 Caching Strategy | ❌ Critical Gap | Single NetworkFirst for everything ❌; auth responses cacheable ❌; no per-type TTL ❌ |
| 6.3 Offline UX | ❌ Critical Gap | OfflineBanner present ✅; isOffline tracked ✅; no mutation guard ❌; no offline queue ❌ |
| 6.4 Manifest & Installability | ⚠️ Needs Work | Manifest inline in vite.config ✅; icons present ✅; maskable icon reuses non-maskable ⚠️; favicon.svg missing ❌ |
| 6.5 HTTPS & Security | ⚠️ Needs Work | No HTTPS config found in codebase ⚠️; service workers require HTTPS in production |
| 6.6 Update Flow | ⚠️ Needs Work | autoUpdate configured ✅; no user-visible update prompt ⚠️; stale SW risk on schema changes ⚠️ |

---

## Files Audited

| File | Lines |
|------|-------|
| `frontend/vite.config.js` | 55 |
| `frontend/index.html` | 19 |
| `frontend/public/` | (directory listing) |
| `frontend/src/hooks/useOffline.js` | 29 |
| `frontend/src/store/uiStore.js` | 114 |
| `frontend/src/components/feedback/OfflineBanner.jsx` | 18 |
| `frontend/src/App.jsx` | 40 |
| `frontend/src/main.jsx` | 44 |
| `frontend/src/services/api.js` | 73 |
| `frontend/src/services/endpoints.js` | ~80 |
| `frontend/package.json` | 43 |
