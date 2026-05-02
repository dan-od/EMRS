# EMRS — Claude Code Instructions

## Project Overview
**EMRS (Equipment & Resource Management System)** — Internal operations platform for WellFluid Services Nigeria, an oilfield service company. React frontend, Node.js/Express backend, PostgreSQL database. PWA-enabled SaaS for equipment tracking, resource requests, and departmental workflows.

**Project root:** `C:\Users\danie\Desktop\Codes\v2.2 release\emrs`
**Frontend:** `./frontend/` (Vite + React + Tailwind + Zustand + SWR)
**Backend:** `./backend/` (Express + PostgreSQL + JWT + Zod)

---

## MVP Scope — What's Launching

### In MVP
- **Auth** — Login, JWT sessions, role-based routing
- **Requests** — PPE, Material, Transport, Equipment, Maintenance request creation and approval workflows
- **Maintenance workflow** — Engineer → Manager → Purchasing → Work Order (multi-step approval)
- **Purchasing** — Disbursement of approved requests, inventory linking
- **Equipment** — Tracking, status management
- **Dashboards** — Role-based (Engineer, Manager, Admin, Purchasing, Accounts, Safety)
- **Notifications** — In-app + SMS via Termii
- **Activity Logs** — System-wide audit trail

### NOT in MVP (do not fix or touch)
- **Jobs module** — `features/jobs/`, `modules/jobs/` — not launching
- **Field Reports** — `modules/fieldReports/` — not launching
- **Vehicles module** — deferred
- **Reports/Analytics** — deferred

---

## Coding Standards — STRICT

### File Size Limits
| File Type | Max Lines | If Exceeded |
|-----------|-----------|-------------|
| Component | 100 | Split into sub-components |
| Page | 150 | Extract sections to components |
| Hook | 80 | Split by concern |
| Service | 100 | Split by entity |
| Controller | 80 | One action per function |
| Utils | 50 | Group related functions |

### Rules
- **No monolithic files** — Split anything approaching limits
- **Single Responsibility** — Each file does ONE thing
- **No console.log in production code** — Use proper error handling
- **No hardcoded URLs** — Use API service/interceptors
- **Memoize expensive components** — Use React.memo where needed
- **Error handling everywhere** — try/catch with meaningful messages
- **Activity logging** — Log all user actions that change state
- **Dark mode support** — All UI must work in both themes

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `EquipmentCard.jsx` |
| Hooks | camelCase with "use" | `useEquipment.js` |
| Services | camelCase with suffix | `equipmentApi.js` |
| Constants | UPPER_SNAKE_CASE | `REQUEST_STATUS` |
| Routes | kebab-case | `/equipment-list` |

### Design Aesthetic — "Industrial Premium"
- Colors: Carbon Black, Petroleum Gold (#FF6B00), Nigeria Green
- Professional, authoritative — not generic tech startup
- Dark mode uses `dark:bg-[#0f1419]`, `dark:bg-[#1a1f26]`, `dark:bg-[#242b33]`
- Consistent border treatment: `border-gray-100 dark:border-white/10`

---

## Database Enum Reference — VERIFIED March 26, 2026

These are the actual PostgreSQL enum values (from `SELECT enum_range`). Code MUST match exactly.

### notification_type
**Active (sent by backend code):**
```
REQUEST_APPROVED, REQUEST_REJECTED, REQUEST_DISBURSED,
TRANSPORT_ASSIGNED, RETURN_OVERDUE, RETURN_INITIATED, RETURN_CONFIRMED,
RETURN_OVERDUE_ESCALATION, RETURN_OVERDUE_URGENT,
VENDOR_ADDED, LOW_STOCK_ALERT, GENERAL,
WORK_ORDER_CREATED, WORK_ORDER_COST,
Work_Order_Completed, High_Cost_Work_Order,
EXTENSION_REQUESTED, EXTENSION_SUBMITTED,
EXTENSION_MANAGER_APPROVED, EXTENSION_PROGRESS,
EXTENSION_APPROVED, EXTENSION_REJECTED
```
**Legacy (in DB but unused — do not use in new code):**
```
Request_Approved, Request_Rejected, Request_Disbursed,
Return_Reminder, Transport_Assigned, Vendor_Added,
Stock_Low, Maintenance_Due, System, Payment_Recorded
```

### priority_level
```
Low, Medium, High, Critical
```
**NOT "Urgent"** — any code referencing "Urgent" as a priority is wrong.

### maintenance_type
```
Scheduled, Unscheduled, Repair, Inspection,
Routine_Service, Calibration, Overhaul, Emergency
```
Note: `Scheduled` and `Unscheduled` are legacy values in DB. Active forms use: `Routine_Service, Repair, Inspection, Calibration, Overhaul, Emergency`.

### request_status
```
Pending, Approved, Manager_Approved, Rejected, Cancelled,
Completed, On_Hold, Disbursed, Pending_Return, Transferred
```

### user_role
```
Field_Engineer, Operator, Technician, Logistics_Coordinator,
Workshop_Manager, Operations_Manager, Department_Manager,
Safety_Officer, Purchasing_Manager, Purchasing_Officer,
Maintenance_Manager, Maintenance_Technician, Admin, IT_Manager,
Super_Admin, IT_Support, Staff, Purchasing_Staff,
Logistics_Manager, Safety_Manager, Accounts_Manager,
Accounts_Staff, HR_Manager
```
Note: `IT_Admin` was renamed to `IT_Manager` in migration 014.

---

## Request Workflow

### Standard Requests (PPE, Material, Transport, Equipment)
```
Engineer creates → Pending → Manager approves → Approved → Purchasing disburses → Disbursed
```

### Maintenance Requests (multi-step)
```
Engineer creates → Pending → Manager approves (adds cost estimate, notes, vendor)
→ Manager_Approved → Purchasing approves (confirms vendor, links inventory, final cost)
→ Approved + Work Order created → Purchasing disburses → Disbursed
```

### Notes Flow
- **Engineer:** `details.additionalNotes` (maintenance) or `details.purpose`/`details.reason` (others)
- **Manager:** `details.managerNotes` + approval_history comments
- **Purchasing:** `details.purchasingNotes` + approval_history comments
- Each role sees notes from previous steps in the chain

---

## Task Status — Updated May 1, 2026

### ✅ DONE — Phase 1
| Task | Description |
|------|-------------|
| 1.1 | Notification enum mismatch — code + DB fixed |
| 1.2 | Urgent → Critical in constants.js + ManagerDashboard |
| 1.3 | Load audit trail in request getById |
| 1.4 | ApprovalHistory field name alignment |
| 1.5 | canDisburse for procurement items (V2 + MaintenanceQueuePanel) |
| 1.6 | Maintenance notes/specs/details in disburse modal |
| 1.7 | maintenance_type alignment — code + DB fixed |

### ✅ DONE — Security
| Task | Description |
|------|-------------|
| N1 | JWT secret externalized (no more hardcoded) |
| N7 | LoginPage uses API service (no hardcoded localhost) |
| B4 | httpOnly cookie auth (additive — cookie set on login, read first by middleware, cleared on logout; Bearer header fallback preserved) |

### ✅ DONE — MVP Blockers (completed Feb 25, 2026)
| Task | Description |
|------|-------------|
| 2.4 | AccountsDashboard + Accounts role routing |
| 2.5 | Safety_Officer dashboard routing + sidebar nav |

### ✅ DONE — Should-Have (completed Feb 25, 2026)
| Task | Description |
|------|-------------|
| 2.1 | Notification click navigation |
| 2.2 | Notify purchasing when request approved |
| 2.3 | NotificationBell dark mode |
| 3.2 | Request description display on engineer dashboard |
| 3.3 | Assigned equipment count |
| 3.4 | Purchasing "Awaiting Review" stat card |
| 4.1 | SWR central auto-refresh (60s) |
| N10 | Remove console.log from authStore.js |

### ✅ DONE — Sprint 3 Backend Hardening (May 1, 2026)
| Task | Description |
|------|-------------|
| B2 | Performance indexes — 015_performance_indexes.sql (10 indexes, CONCURRENTLY IF NOT EXISTS) |
| B3 | Console.log cleanup — verified clean; only 26 remain in migrate.js/seed.js/logger.js (all legitimate CLI/internal) |
| B4 | httpOnly cookie auth — additive migration (login sets cookie, middleware reads cookie first then Bearer header, logout clears cookie, frontend withCredentials: true) |
| B5 | Error boundaries — ErrorBoundary already existed + wired to App.jsx; added content-level boundary to MainLayout (sidebar survives route errors) |
| BUG-ACTIVITY-NULL | equipmentLogs.controller.js createGeneralLog: ACTIONS.CREATE (undefined) → ACTIONS.EQUIPMENT_HOURS_LOGGED; added null guard in logActivity |

### ⬜ POST-MVP — Don't Touch Now
| Task | Description |
|------|-------------|
| 3.1 | Activity log pagination count with filters |
| 3.5 | Auto-refresh notification list |
| 3.7 | Persist top-level request notes to DB |
| 4.2 | Remove duplicate toast system |
| 4.3 | Seed accounts test users |
| 4.4 | PWA icons |
| 5.1-5.5 | Refactoring, error boundaries, skeletons |
| N2 | Job status enum (NOT IN MVP) |
| N3 | User role enum gaps |
| N4 | Rate limiting |
| N5 | Transaction wrapping |
| N6 | Field report permissions (NOT IN MVP) |
| N8 | Equipment status format |
| N9 | React error boundaries |
| N11-N15 | Various polish items |

---

## Key Architecture Notes

### Frontend State
- **Auth:** Zustand store (`authStore.js`) with persist middleware
- **UI:** Zustand store (`uiStore.js`) for toasts, sidebar state
- **Server data:** SWR for all API data fetching with caching
- **Forms:** react-hook-form + Zod validation

### Backend Structure
- **Modular monolith** — `src/modules/{feature}/` with controller, service, routes, queries
- **Auth:** JWT with bcrypt passwords
- **DB:** PostgreSQL with enum types — MUST match code exactly
- **Notifications:** Termii SMS for Nigerian operations
- **Activity logging:** `activityLogger.js` wraps all state-changing actions

### Common Gotchas
- **Enum mismatches** — PostgreSQL enums are case-sensitive. Always verify code values match DB.
- **Role checks** — Use case-insensitive comparison: `role.toLowerCase().includes('purchasing')`
- **Dark mode** — Every UI element needs `dark:` variants
- **Details JSON** — Request details stored as JSONB. Different request types have different schemas.
- **SMS > Email** — Nigerian infrastructure favors SMS. Termii is the provider.
