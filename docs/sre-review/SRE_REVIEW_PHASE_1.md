# SRE Review — Phase 1: Security & Auth
**Date:** 2026-04-23
**Reviewer:** Claude Code (SRE Skill)
**Scope:** JWT config, auth middleware, role-based access control, CORS, input validation, HTTP headers, frontend token handling, known issue verification.

---

## Critical Issues (Must Fix Before Launch)

### C1 — Rate Limiting Disabled: Login Brute-Force Unprotected
- **Issue:** `authLimiter` is commented out on the login route; the global `apiLimiter` is also disabled.
- **Location:** `backend/src/modules/auth/auth.routes.js:15` and `backend/src/app.js:28`
- **Impact:** Unlimited login attempts against any user account. A targeted attack can brute-force any password at thousands of requests/second with no lockout.
- **Fix:** Remove the `// authLimiter,` comment on the login route. Separately re-enable `app.use('/api', apiLimiter)` in `app.js`. The implementations in `rateLimiter.js` are already correct; they just need to be turned on.

```js
// auth.routes.js — line 15: remove the comment
router.post('/login', authLimiter, validate(loginSchema), authController.login);

// app.js — line 28: remove the comment
app.use('/api', apiLimiter);
```

---

### C2 — JWT Token in localStorage: XSS Token Theft Risk
- **Issue:** Zustand `persist` is configured with `localStorage` as the storage backend. The JWT is stored under the key `emrs-auth` and the API interceptor reads it back from `localStorage` on every request.
- **Location:** `frontend/src/store/authStore.js:44` and `frontend/src/services/api.js:21-30`
- **Impact:** Any XSS payload — injected via a stored cross-site script or a compromised third-party script — can read `localStorage.getItem('emrs-auth')` and exfiltrate the JWT. With a 7-day-expiry token and no server-side invalidation (see C4), the attacker has a week-long session as the victim.
- **Fix:** Short-term: Move token to a `httpOnly` cookie (requires backend `Set-Cookie` response and CSRF protection). Medium-term while keeping localStorage: reduce token lifetime to ≤1 hour and implement a refresh-token flow (see M2). Also add a `Content-Security-Policy` to limit what scripts can execute (see M5).

---

### C3 — IDOR: Any Authenticated User Can Read Any Request
- **Issue:** Three routes in the requests module have no ownership or role restriction — any authenticated user (e.g., a Field_Engineer) can read the details, history, and audit trail of any request in the system by supplying its UUID.
- **Location:** `backend/src/modules/requests/requests.routes.js:65-67`
  ```js
  router.get('/:id', controller.getById);          // line 65 — no role check
  router.get('/:id/history', controller.getHistory); // line 66 — no role check
  router.get('/:id/audit-trail', controller.getAuditTrail); // line 67 — no role check
  ```
- **Impact:** Cross-department data exposure. An engineer in Maintenance can read Purchasing or Accounts requests. Sensitive fields (vendor quotes, approval notes, cost estimates) are returned in the `details` JSONB payload.
- **Fix:** Add an ownership or role check inside `getById` / `getHistory` / `getAuditTrail`. Allow if: `req.user.id === request.requester_id` OR `MANAGER_ROLES.includes(req.user.role)`. The existing `MANAGER_ROLES` array in `requests.routes.js:10` can be reused.

---

### C4 — Logout Does Not Invalidate the Token
- **Issue:** The logout endpoint in `auth.controller.js` only logs the action. It does not touch the JWT. The client clears localStorage on 401 errors, but the issued token remains cryptographically valid for its full 7-day lifetime.
- **Location:** `backend/src/modules/auth/auth.controller.js:133-153`
- **Impact:** If a token is stolen (e.g., via C2), the victim's logout does not protect them. The attacker's copy of the token continues to work for up to 7 days.
- **Fix (minimum viable):** Maintain a server-side token denylist (PostgreSQL table `revoked_tokens(jti, expires_at)`). Sign tokens with a `jti` claim. On logout, insert the `jti`. In `authenticate` middleware, query the denylist. Purge rows where `expires_at < NOW()` on a daily cron.

---

### C5 — DB Password Defaults to `'password'` if Env Var Not Set
- **Issue:** `env.js` has `password: process.env.DB_PASSWORD || 'password'`. If the `.env` file is absent or the variable is unset, the app silently connects to PostgreSQL as `postgres` with the password `password`.
- **Location:** `backend/src/config/env.js:13`
- **Impact:** If the server is misconfigured or the `.env` is lost on redeployment, the app runs with a default credential against the production database. A misconfigured PostgreSQL accepting local connections would be fully compromised.
- **Fix:** Apply the same fail-fast pattern used for `JWT_SECRET` (line 19-21). Throw at startup if `DB_PASSWORD` is not set and `NODE_ENV === 'production'`:
  ```js
  password: (() => {
    if (process.env.DB_PASSWORD) return process.env.DB_PASSWORD;
    if ((process.env.NODE_ENV || 'development') === 'production')
      throw new Error('DB_PASSWORD is required in production');
    return 'password';
  })(),
  ```

---

## Major Improvements (Strongly Recommended)

### M1 — Missing Roles in ROLE_HIERARCHY (Silent Privilege Downgrade)
- **Issue:** `roleCheck.js` defines 16 roles in `ROLES` and `ROLE_HIERARCHY`, but the PostgreSQL `user_role` enum contains 23 values. The following roles exist in the DB but are absent from the hierarchy: `Operator`, `Technician`, `Logistics_Coordinator`, `Department_Manager`, `Purchasing_Officer`, `Maintenance_Technician`, `IT_Admin`.
- **Location:** `backend/src/middleware/roleCheck.js:3-39`
- **Impact:** Any user assigned one of the missing roles in the DB will have `ROLE_HIERARCHY[req.user.role] === undefined`, which evaluates to `0` in `requireMinRole()`. These users are silently treated as having the lowest possible privilege level, causing every `requireMinRole` check to fail — they are effectively locked out even from endpoints they should access. Conversely, custom `requireRole` calls that hardcode the correct string still work for those roles, but the hierarchy is unusable for them.
- **Fix:** Add all missing roles to `ROLES` and `ROLE_HIERARCHY` with appropriate levels:
  ```js
  OPERATOR: 'Operator',          // level 4
  TECHNICIAN: 'Technician',       // level 4
  LOGISTICS_COORDINATOR: 'Logistics_Coordinator', // level 4
  DEPARTMENT_MANAGER: 'Department_Manager',        // level 7
  PURCHASING_OFFICER: 'Purchasing_Officer',         // level 5
  MAINTENANCE_TECHNICIAN: 'Maintenance_Technician', // level 4
  IT_ADMIN: 'IT_Admin',           // level 8 (below IT_Support or same)
  ```

---

### M2 — 7-Day Access Token With No Refresh Mechanism
- **Issue:** `JWT_EXPIRES_IN` defaults to `7d`. There is no refresh token endpoint. `authService.js:26` calls `AUTH.REFRESH` on the frontend but no corresponding backend route exists in `auth.routes.js`.
- **Location:** `backend/src/config/env.js:23`, `frontend/src/features/auth/services/authService.js:26`
- **Impact:** A 7-day window is industry-standard for refresh tokens, not access tokens. With localStorage storage (C2) and no server-side revocation (C4), a stolen token is usable for a full week. If a user is deactivated mid-session, their token remains valid until expiry.
- **Fix:** Reduce `JWT_EXPIRES_IN` to `15m` or `1h`. Implement the already-scaffolded refresh-token endpoint: issue a separate long-lived (7d) refresh token stored in an `httpOnly` cookie, use it to issue new short-lived access tokens.

---

### M3 — `optionalAuth` Silently Accepts Tampered Tokens
- **Issue:** The `optionalAuth` middleware catches all errors (including `JsonWebTokenError` and `TokenExpiredError`) and calls `next()` without error, setting `req.user = undefined`. This means a request with a forged or expired token is treated identically to an unauthenticated request.
- **Location:** `backend/src/middleware/auth.js:62`
- **Impact:** Any route using `optionalAuth` that performs different logic based on `req.user` being set could be bypassed by supplying an intentionally malformed token. The attacker doesn't need to forge a valid token — they just need one that fails verification.
- **Fix:** Distinguish between "no token" and "bad token":
  ```js
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      // Bad token — treat as unauthenticated but don't throw
    }
    next(); // Only suppress if it was a JWT error
  }
  ```
  Or more precisely, if a token is present but invalid, return 401 rather than proceeding.

---

### M4 — `.env.example` Is Excluded from Git
- **Issue:** `backend/.gitignore` includes `.env.example` in its ignore list.
- **Location:** `backend/.gitignore:4`
- **Impact:** The example config file won't be committed to the repository. New developers, CI systems, or redeployments have no reference for required environment variables. Combined with the silent DB password default (C5), a missing `.env` is dangerous.
- **Fix:** Remove `.env.example` from `.gitignore`. It should be committed. Only actual secret files (`.env`, `.env.local`, `.env.production`) should be ignored.

---

### M5 — Helmet Applied With Default Settings (No Custom CSP)
- **Issue:** `app.js` applies `helmet()` with no configuration. Helmet's default CSP (`Content-Security-Policy: default-src 'self'`) will likely break the app in production (blocks CDN fonts, inline styles, Vite assets). The real risk is that without a properly tuned CSP, the XSS risk in C2 is harder to mitigate.
- **Location:** `backend/src/app.js:13`
- **Impact:** A permissive CSP or no CSP provides no defense against XSS-based token theft (C2). Also, default helmet configuration doesn't set `Strict-Transport-Security` without HTTPS active.
- **Fix:** Configure CSP explicitly to match the app's actual asset sources. At minimum, add HSTS for production:
  ```js
  app.use(helmet({
    hsts: { maxAge: 31536000, includeSubDomains: true },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind requires this
      }
    }
  }));
  ```

---

### M6 — BREACH Vulnerability: Compression + Authenticated Responses
- **Issue:** `compression` middleware (app.js:21) is applied globally before all API routes. Authenticated API responses contain user-specific data. Under HTTPS, the BREACH attack can extract secrets from compressed TLS responses through length oracle attacks.
- **Location:** `backend/src/app.js:21`
- **Impact:** In a targeted attack against a logged-in user, an attacker controlling network traffic can extract predictable secrets (e.g., CSRF tokens) from compressed responses. Lower severity for an internal system, but non-zero.
- **Fix:** Disable compression on authenticated API routes, or limit compression to public static assets only:
  ```js
  app.use(compression({ filter: (req) => !req.headers.authorization }));
  ```

---

### M7 — `cancel` and `return` Routes Lack Ownership Check
- **Issue:** `POST /:id/cancel` and `POST /:id/return` in `requests.routes.js` have no role restriction. If the service layer doesn't enforce ownership, any authenticated user can cancel or initiate a return on any request.
- **Location:** `backend/src/modules/requests/requests.routes.js:21,24`
- **Impact:** Cross-user request manipulation — an attacker could cancel another user's request before it's approved.
- **Fix:** Check `request.requester_id === req.user.id` in the service layer before allowing cancel/return, or add a `requireOwnerOrAdmin` middleware.

---

## Minor Suggestions (Nice to Have)

- **`frontend/src/routes/ProtectedRoute.jsx:15`** — Case-insensitive role comparison is correct for UX but the server performs a case-sensitive exact match in `requireRole`. Keep them consistent or document the discrepancy.
- **`backend/src/middleware/roleCheck.js:64`** — `requireManager` is an alias for `requireMinRole(ROLES.SAFETY_OFFICER)` (level 6). The name implies "manager" but Safety_Officer is not a management role. Rename to `requireSeniorStaff` or raise the threshold to level 7.
- **`backend/src/modules/auth/auth.validation.js:3-6`** — `loginSchema` validates password as `min(1)`. Consider adding a reasonable upper bound (e.g., `max(128)`) to prevent DoS via bcrypt with excessively long passwords (bcrypt cost grows with input size).
- **`backend/src/config/env.js:27`** — Email credentials (`EMAIL_USER`, `EMAIL_PASSWORD`) have no fallback guards. If unconfigured, `sendPasswordReset` will silently fail in production.
- **`frontend/src/services/api.js:54-56`** — On 401, the interceptor calls `localStorage.removeItem('emrs-auth')` but doesn't call the Zustand store's `logout()` action. State could become inconsistent if Zustand holds a different snapshot in memory.
- **`backend/src/modules/requests/requests.routes.js:9-11`** — `MANAGER_ROLES` includes `IT_Support`. IT Support likely should not be approving operational requests (PPE, materials, maintenance). Verify this is intentional.
- **`backend/src/modules/auth/auth.service.js:22`** — Consistent timing on "invalid email" vs "invalid password" responses prevents user enumeration — this is implemented correctly. No change needed; just confirming.

---

## Phase Score

| Area | Score | Notes |
|------|-------|-------|
| 1.1 JWT & Secrets Management | ⚠️ Needs Work | Secret externalized ✅; 7d expiry + no refresh ⚠️ |
| 1.2 Token Storage (Frontend) | ❌ Critical Gap | localStorage is XSS-vulnerable |
| 1.3 Authentication Flow | ⚠️ Needs Work | No rate limiting, no server-side logout |
| 1.4 Authorization & RBAC | ⚠️ Needs Work | IDOR on requests; 7 missing roles in hierarchy |
| 1.5 CORS Configuration | ✅ Solid | Origin-specific, credentials allowed correctly |
| 1.6 Input Validation | ⚠️ Needs Work | Zod missing on several equipment/equipment-log endpoints |
| 1.7 HTTP Security Headers | ⚠️ Needs Work | Helmet default; BREACH risk; no custom CSP |
| 1.8 Known Issues Verified | ✅ Solid | JWT secret: fixed ✅  LoginPage localhost URL: fixed ✅ |

---

## Files Audited

| File | Lines |
|------|-------|
| `backend/src/config/env.js` | 50 |
| `backend/src/middleware/auth.js` | 66 |
| `backend/src/middleware/roleCheck.js` | 92 |
| `backend/src/middleware/validate.js` | 96 |
| `backend/src/middleware/rateLimiter.js` | 33 |
| `backend/src/middleware/index.js` | 46 |
| `backend/src/modules/auth/auth.controller.js` | 157 |
| `backend/src/modules/auth/auth.service.js` | 172 |
| `backend/src/modules/auth/auth.routes.js` | 53 |
| `backend/src/modules/auth/auth.validation.js` | 35 |
| `backend/src/modules/requests/requests.routes.js` | 77 |
| `backend/src/modules/requests/controllers/base.controller.js` | 105 |
| `backend/src/modules/accounts/accounts.routes.js` | 57 |
| `backend/src/modules/activity/activity.routes.js` | 34 |
| `backend/src/modules/activity/activity.controller.js` | 139 |
| `backend/src/modules/notifications/notifications.routes.js` | 27 |
| `backend/src/modules/notifications/notifications.controller.js` | 126 |
| `backend/src/modules/maintenance/maintenance.routes.js` | 99 |
| `backend/src/modules/users/users.routes.js` | 32 |
| `backend/src/modules/accounts/accounts.service.js` | 250 |
| `backend/src/utils/tokenGenerator.js` | 46 |
| `backend/src/app.js` | 41 |
| `backend/.env.example` | 76 |
| `backend/.gitignore` | 14 |
| `frontend/src/features/auth/pages/LoginPage.jsx` | 357 |
| `frontend/src/features/auth/services/authService.js` | 29 |
| `frontend/src/store/authStore.js` | 50 |
| `frontend/src/services/api.js` | 73 |
| `frontend/src/routes/ProtectedRoute.jsx` | 27 |
| `frontend/.gitignore` | 14 |
