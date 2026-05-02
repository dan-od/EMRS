# MOBILE RESPONSIVENESS + DARK MODE FIX — Claude Code Instructions

## CONTEXT
EMRS is a PWA for WellFluid Services Nigeria (oilfield company). Field engineers use this ON PHONES in the field. Modern phones (2024+) have:
- **Notches / Dynamic Islands** eating into top screen area
- **Gesture navigation bars** — no physical home button, swipe-up from bottom
- **Rounded screen corners** — content in corners gets clipped
- **Smaller effective viewport** — camera cutouts reduce usable area
- This means we MUST account for safe areas on all edges

## PROJECT PATH
```
C:\Users\danie\Desktop\Codes\v2.2 release\emrs\frontend\src
```

## CODING STANDARDS (MANDATORY)
- **Components: max 100 lines** | **Pages: max 150 lines** | **Hooks: max 80 lines**
- If a file exceeds limits, SPLIT it — don't just leave it oversized
- **DO NOT rewrite working logic** — only touch layout/styling/responsive classes
- **Keep all existing functionality** — this is a styling pass, not a refactor
- Use Tailwind classes only — no inline styles
- Test dark mode classes exist alongside light mode changes

---

## PHASE 1: FOUNDATION (Do these FIRST)

### 1.1 — index.html (viewport-fit)
**File:** Find the source `index.html` (likely project root, not dist/)
**Change:** Update the viewport meta tag:
```html
<!-- BEFORE -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<!-- AFTER -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```
This enables `env(safe-area-inset-*)` CSS values.

### 1.2 — globals.css (safe area utilities)
**File:** `src/styles/globals.css`
**Add** these utility classes (after existing animations):
```css
/* === Safe Area Utilities === */
.safe-top { padding-top: env(safe-area-inset-top, 0px); }
.safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
.safe-left { padding-left: env(safe-area-inset-left, 0px); }
.safe-right { padding-right: env(safe-area-inset-right, 0px); }
.safe-x { padding-left: env(safe-area-inset-left, 0px); padding-right: env(safe-area-inset-right, 0px); }
.safe-y { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }

/* Mobile touch targets - minimum 44px per Apple HIG */
.touch-target { min-height: 44px; min-width: 44px; }

/* Horizontal scroll container for tables/filters on mobile */
.mobile-scroll-x {
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.mobile-scroll-x::-webkit-scrollbar { display: none; }

/* Bottom sheet animation for mobile modals */
@keyframes slideUpSheet {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.animate-sheet { animation: slideUpSheet 0.3s ease-out; }
```

### 1.3 — MainLayout.jsx
**File:** `src/components/layout/MainLayout.jsx`
**Change:** Add safe-bottom padding to main content area so content isn't hidden behind gesture bar:
```jsx
<div className={cn(
  'transition-all duration-300 ease-out min-h-screen',
  'pb-safe',  // Add this — gesture bar clearance
  sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-60'
)}>
```
NOTE: Since we defined `.safe-bottom` in CSS, use className `safe-bottom` on the wrapper.
Actually just add `pb-6 sm:pb-0` as a simpler approach that adds bottom padding on all screens (mobile gets it, desktop sidebar handles it).

### 1.4 — Header.jsx
**File:** `src/components/layout/Header.jsx`
**Current:** `sticky top-0 z-30` — this is fine, but on phones with notches in PWA standalone mode, the status bar area overlaps.
**Change:** Add `safe-top` class to header:
```jsx
<header className="sticky top-0 z-30 safe-top bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/10">
```

### 1.5 — Sidebar.jsx
**File:** `src/components/layout/Sidebar.jsx`
**Changes:**
- Add `safe-top` to the logo section at top
- Add `safe-bottom` to the footer section (Settings/Logout) so it doesn't get cut off by gesture bar
- The sidebar footer `<div>` should get: `className="border-t ... p-2 flex-shrink-0 safe-bottom"`

### 1.6 — PageWrapper.jsx
**File:** `src/components/layout/PageWrapper.jsx`
**Current:** `<main className={cn('flex-1 animate-fadeIn', !noPadding && 'p-4 lg:p-6')}>`
**Change:** Add bottom padding for gesture area clearance:
```jsx
<main className={cn('flex-1 animate-fadeIn', !noPadding && 'p-4 pb-8 lg:p-6 lg:pb-6')}>
```
The extra `pb-8` on mobile ensures the last content card isn't hidden behind the gesture bar.

---

## PHASE 2: COMMON COMPONENTS

### 2.1 — Modal.jsx → Bottom Sheet on Mobile
**File:** `src/components/common/Modal.jsx`
**Problem:** Modals center vertically on mobile — hard to reach dismiss button, wastes screen space.
**Solution:** On mobile (<640px), modals should anchor to bottom as a "sheet" that slides up.
**Changes to the modal dialog wrapper:**
```jsx
{/* Change the centering container */}
<div className="min-h-full flex items-end sm:items-center justify-center p-0 sm:p-4">
  <div
    role="dialog"
    className={cn(
      'relative w-full shadow-xl',
      'bg-white dark:bg-[#1a1f26]',
      'border border-gray-200/60 dark:border-white/10',
      // Mobile: full-width bottom sheet with rounded top corners + safe area
      'rounded-t-2xl sm:rounded-2xl',
      'max-h-[85vh] overflow-y-auto',
      'safe-bottom',
      'animate-sheet sm:animate-slideUp',
      sizes[size],
      className
    )}
  >
    {/* Add a drag handle indicator for mobile */}
    <div className="sm:hidden flex justify-center pt-3 pb-1">
      <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
    </div>
    ...existing header and content...
  </div>
</div>
```
Keep existing desktop behavior (centered) — only override on mobile via responsive classes.

### 2.2 — Button.jsx (Touch Targets)
**File:** `src/components/common/Button.jsx`
**Problem:** Small buttons are hard to tap on mobile.
**Change:** Ensure minimum touch target height:
- Add `min-h-[44px]` to the base button classes for `md` and `lg` sizes
- `sm` size buttons should get `min-h-[36px]` minimum on mobile

### 2.3 — Input.jsx / Select.jsx / Textarea.jsx (Touch Targets)
**Files:** `src/components/common/Input.jsx`, `Select.jsx`, `Textarea.jsx`
**Problem:** Form inputs may be too small for comfortable touch input.
**Change:** Ensure inputs have `min-h-[44px]` or `py-3` on mobile. Check each file and ensure the `<input>`, `<select>`, `<textarea>` elements have adequate height.

### 2.4 — Card.jsx
**File:** `src/components/common/Card.jsx`
**Change:** On mobile, cards should go edge-to-edge (no rounded corners at viewport edge):
If cards currently have `rounded-xl`, consider `rounded-none sm:rounded-xl` only IF they're full-width on mobile. Leave cards that are inside padded containers as-is.
Actually — PageWrapper already adds `p-4` padding, so cards inside it already have margin. **Skip this one** unless specific pages have edge-to-edge card issues.

### 2.5 — StatCard.jsx (Touch Friendly)
**File:** `src/components/common/StatCard.jsx`
**Check:** Ensure stat cards have adequate padding and readable font sizes on mobile. The grid wrapping should handle responsiveness (2 cols on mobile, 4 on desktop).

---

## PHASE 3: PAGE-BY-PAGE FIXES

### PRIORITY: HIGH-TRAFFIC PAGES

#### 3.1 — Dashboard Pages
**Files:** `src/features/dashboard/pages/AdminDashboard.jsx`, `EngineerDashboard.jsx`, `ManagerDashboard.jsx`, `StaffDashboard.jsx`, `PurchasingDashboard.jsx`, `ITSupportDashboard.jsx`
**Common issues:**
- Stat card grids: Ensure `grid-cols-2 lg:grid-cols-4` (NOT `grid-cols-4` on mobile)
- Quick action buttons: Ensure they wrap properly with `flex-wrap`
- Any horizontal button rows should use `flex flex-wrap gap-2` not `flex gap-4`
- Tables in dashboards should have `overflow-x-auto` wrapper on mobile

#### 3.2 — Equipment Pages
**Files:** `src/features/equipment/pages/*.jsx`
**EquipmentList.jsx:**
- Table needs `overflow-x-auto` wrapper on mobile
- Filter row needs horizontal scroll or stacking: `flex flex-col sm:flex-row`
- Action buttons in table rows — consider icon-only on mobile (hide text labels)

**EquipmentDetail.jsx:**
- Info grid: ensure `grid-cols-1 sm:grid-cols-2` (one column on mobile)
- Long equipment names/serial numbers: add `break-all` or `truncate`

**AddEquipment.jsx / EditEquipment.jsx:**
- Form grids should collapse to single column: `grid-cols-1 sm:grid-cols-2`
- Submit buttons should be full-width on mobile: `w-full sm:w-auto`

#### 3.3 — Request Pages
**Files:** `src/features/requests/pages/*.jsx`
**RequestHub.jsx:**
- Category cards grid: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`
- Icons/text should remain readable at small sizes

**MyRequests.jsx / DeptRequests.jsx:**
- Table needs `overflow-x-auto` wrapper
- Status badges must not wrap text
- Request type and date columns — consider hiding less important columns on mobile

**RequestDetail.jsx:**
- This is a critical page (335 lines — OVER LIMIT, but don't refactor logic, only touch responsive classes)
- Approval action buttons at bottom: `flex flex-col sm:flex-row gap-2`
- Detail grid: single column on mobile
- Notes/comments section: full width

**CreateRequest.jsx:**
- Form fields single column on mobile
- Submit/Cancel buttons: stack on mobile `flex flex-col-reverse sm:flex-row`

#### 3.4 — User Management Pages
**Files:** `src/features/users/pages/*.jsx`
**UserList.jsx:**
- Table with `overflow-x-auto`
- Grid view cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

**UserDetail.jsx:**
- Avatar + info section: stack on mobile `flex flex-col sm:flex-row`
- Action buttons: `flex flex-col sm:flex-row gap-2`

**CreateUser.jsx / EditUser.jsx:**
- Form grid to single column on mobile
- Submit buttons full width on mobile

#### 3.5 — Purchasing Pages
**Files:** `src/features/purchasing/pages/*.jsx`
**PurchasingDashboard.jsx (336 lines — oversized):**
- Only touch responsive classes, don't restructure
- Stat grids: 2 cols on mobile
- Tables: overflow-x-auto

**InventoryPage.jsx / DamagedInventoryPage.jsx / VehiclesPage.jsx / VendorsPage.jsx:**
- All table views need `overflow-x-auto` wrapper
- Filter bars should stack on mobile or scroll horizontally

#### 3.6 — Maintenance Pages
**Files:** `src/features/maintenance/pages/*.jsx`
- Same table pattern: `overflow-x-auto`
- Detail page: single column info grid on mobile

#### 3.7 — Safety Pages
**Files:** `src/features/safety/pages/*.jsx`
**CreateSafetyReport.jsx (222 lines — over limit):**
- Only touch responsive, don't restructure
- Form should be single column on mobile

#### 3.8 — Activity Logs Page
**File:** `src/features/activity/pages/ActivityLogs.jsx`
- Log table: `overflow-x-auto`
- Filter row: stack or scroll on mobile

#### 3.9 — Auth Pages (Login, Forgot Password, Reset Password)
**Files:** `src/features/auth/pages/*.jsx`
- These should already be mobile-friendly (single column forms)
- Check: form card is centered, not too wide on mobile
- Login form: ensure inputs have `w-full` and proper spacing
- Add `safe-y` to auth page containers for standalone PWA mode

#### 3.10 — Settings Page
**File:** `src/features/dashboard/pages/Settings.jsx` + `components/settings/*.jsx`
- Already revamped — just check sections stack properly on mobile
- Profile info grid: single column on mobile ✓ (already `grid-cols-1 sm:grid-cols-2`)
- Security password form: already full width ✓

---

## PHASE 4: TABLE PATTERN (Apply everywhere)

Many pages have tables. Apply this CONSISTENT pattern wherever there's a `<table>`:

```jsx
{/* Wrap every table in this */}
<div className="overflow-x-auto -mx-4 sm:mx-0">
  <div className="inline-block min-w-full align-middle">
    <table className="min-w-full">
      ...
    </table>
  </div>
</div>
```

The `-mx-4 sm:mx-0` allows the table to go edge-to-edge on mobile while staying contained on desktop.

If the table is inside a Card that already has padding, use `-mx-5 sm:-mx-0` or `-mx-6 sm:mx-0` to match the card's padding.

---

## PHASE 5: FORM PATTERN (Apply everywhere)

Every form grid should follow this responsive pattern:
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {/* form fields */}
</div>
```

Every form action row (Submit/Cancel) should follow:
```jsx
<div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
  <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
  <Button variant="primary" className="w-full sm:w-auto">Submit</Button>
</div>
```
Note: `flex-col-reverse` puts Submit on top on mobile (primary action first), Cancel below.

---

## PHASE 6: FILTER BAR PATTERN (Apply everywhere)

Many pages have a filter/search bar above tables. Ensure they all follow:
```jsx
{/* Stack on mobile, row on desktop */}
<div className="flex flex-col sm:flex-row gap-3 mb-4">
  <div className="flex-1">
    <Input placeholder="Search..." />
  </div>
  <div className="flex gap-2 overflow-x-auto mobile-scroll-x">
    <Select ... />
    <Select ... />
    <Button>Filter</Button>
  </div>
</div>
```

---

## CHECKLIST — Verify Each Page

For EVERY page file, verify:
- [ ] No horizontal overflow on 375px width (iPhone SE)
- [ ] All grids collapse to 1 column on mobile (except 2-col stat grids)
- [ ] Tables wrapped in `overflow-x-auto`
- [ ] Buttons have adequate touch targets (min 44px height)
- [ ] Form inputs are full width on mobile
- [ ] Action buttons stack or wrap on mobile
- [ ] Text truncates or wraps properly (no overflow)
- [ ] Bottom content isn't hidden behind gesture bar (pb-8 on mobile)
- [ ] Modals are accessible on mobile (bottom sheet pattern)

## WHAT NOT TO TOUCH
- **Do NOT change business logic, API calls, state management, or data flow**
- **Do NOT rename files or move files between directories**
- **Do NOT change the Sidebar navigation structure or route config**
- **Do NOT remove any existing functionality**
- **Do NOT install new npm packages** — use only Tailwind utilities + the CSS we added
- Keep all dark mode classes intact when modifying className strings
- If a file is over the line limit, only split it if the responsive changes push it significantly over AND you can cleanly extract a sub-component

## PRIORITY ORDER
1. Foundation (Phase 1) — viewport, safe areas, layout shells
2. Modal bottom sheet (Phase 2.1) — used by EVERY feature
3. Dashboard pages (Phase 3.1) — most visited pages
4. Equipment + Requests (Phase 3.2, 3.3) — core workflow
5. Everything else (Phase 3.4+)
6. Table/Form/Filter patterns (Phase 4-6) as you encounter them

---

## ============================================================
## DARK MODE FIX — CRITICAL (DO ALONGSIDE MOBILE WORK)
## ============================================================

## PROBLEM
The app has a working dark mode toggle and tailwind `darkMode: 'class'` config, but **most pages have hardcoded light-only colors** — `bg-gray-50`, `text-blue-600`, `border-gray-300`, `hover:bg-gray-100` — without `dark:` counterparts. This makes text invisible, backgrounds too bright, and borders disappear in dark mode.

## COLOR TOKEN SYSTEM (from tailwind.config.js)

### Light Mode Tokens
| Usage | Class | Color |
|-------|-------|-------|
| Page background | `bg-background` | #F5F7FA |
| Card/surface | `bg-surface` or `bg-white` | #FFFFFF |
| Primary text | `text-text-primary` | #2C3E50 |
| Secondary text | `text-text-secondary` | #64748b |
| Muted text | `text-text-muted` | #94a3b8 |
| Brand orange | `text-primary-500` / `bg-primary-500` | #FF6B00 |

### Dark Mode Tokens
| Usage | Class | Color |
|-------|-------|-------|
| Page background | `dark:bg-dark-bg` | #0f1419 |
| Card/surface | `dark:bg-dark-surface` | #1a1f26 |
| Card inner/elevated | `dark:bg-dark-card` | #242b33 |
| Border | `dark:border-dark-border` | #2f3943 |
| Primary text | `dark:text-dark-text` | #e7e9ea |
| Muted text | `dark:text-dark-muted` | #8899a6 |

## MASTER REPLACEMENT RULES

Apply these rules to EVERY .jsx file in `src/features/` and `src/components/`.

### Background Colors
Every `bg-white` or `bg-gray-50/100` needs a dark counterpart:
```
bg-white           → bg-white dark:bg-dark-surface
bg-gray-50         → bg-gray-50 dark:bg-dark-card
bg-gray-100        → bg-gray-100 dark:bg-dark-card
bg-gray-200        → bg-gray-200 dark:bg-dark-border
```

### Colored Backgrounds (stat cards, badges, system overview)
These colored bg- tiles need dark-adapted versions:
```
bg-blue-50         → bg-blue-50 dark:bg-blue-900/20
bg-green-50        → bg-green-50 dark:bg-green-900/20
bg-red-50          → bg-red-50 dark:bg-red-900/20
bg-orange-50       → bg-orange-50 dark:bg-orange-900/20
bg-yellow-50       → bg-yellow-50 dark:bg-yellow-900/20
bg-yellow-100      → bg-yellow-100 dark:bg-yellow-900/30
bg-purple-50       → bg-purple-50 dark:bg-purple-900/20
bg-amber-50        → bg-amber-50 dark:bg-amber-900/20
bg-indigo-50       → bg-indigo-50 dark:bg-indigo-900/20
```

### Text on Colored Backgrounds
These text colors that sit on the colored bg tiles above:
```
text-blue-600      → text-blue-600 dark:text-blue-400
text-blue-800      → text-blue-800 dark:text-blue-300
text-green-600     → text-green-600 dark:text-green-400
text-green-800     → text-green-800 dark:text-green-300
text-red-600       → text-red-600 dark:text-red-400
text-red-800       → text-red-800 dark:text-red-300
text-orange-600    → text-orange-600 dark:text-orange-400
text-orange-800    → text-orange-800 dark:text-orange-300
text-yellow-600    → text-yellow-600 dark:text-yellow-400
text-yellow-800    → text-yellow-800 dark:text-yellow-300
text-purple-600    → text-purple-600 dark:text-purple-400
text-purple-800    → text-purple-800 dark:text-purple-300
text-amber-600     → text-amber-600 dark:text-amber-400
text-amber-800     → text-amber-800 dark:text-amber-300
text-indigo-600    → text-indigo-600 dark:text-indigo-400
text-indigo-800    → text-indigo-800 dark:text-indigo-300
```

### Generic Text Colors
```
text-gray-500      → text-gray-500 dark:text-gray-400
text-gray-600      → text-gray-600 dark:text-gray-300
text-gray-700      → text-gray-700 dark:text-gray-200
text-gray-800      → text-gray-800 dark:text-dark-text
text-gray-900      → text-gray-900 dark:text-dark-text
```

### Text using custom tokens (ALREADY correct — don't change these)
If you see `text-text-primary dark:text-dark-text` — that's already correct, skip it.
If you see `text-text-secondary dark:text-dark-muted` — that's already correct, skip it.
Only add `dark:` classes where they are MISSING.

### Border Colors
```
border-gray-100    → border-gray-100 dark:border-dark-border
border-gray-200    → border-gray-200 dark:border-dark-border
border-gray-300    → border-gray-300 dark:border-dark-border
border-red-200     → border-red-200 dark:border-red-800
border-blue-200    → border-blue-200 dark:border-blue-800
border-green-200   → border-green-200 dark:border-green-800
border-yellow-200  → border-yellow-200 dark:border-yellow-800
border-orange-200  → border-orange-200 dark:border-orange-800
```

### Hover States
```
hover:bg-gray-50   → hover:bg-gray-50 dark:hover:bg-dark-card
hover:bg-gray-100  → hover:bg-gray-100 dark:hover:bg-dark-card
hover:bg-gray-200  → hover:bg-gray-200 dark:hover:bg-dark-border
```

### Divide Colors
```
divide-gray-100    → divide-gray-100 dark:divide-dark-border
divide-gray-200    → divide-gray-200 dark:divide-dark-border
```

### Ring Colors
```
ring-gray-300      → ring-gray-300 dark:ring-dark-border
focus:ring-gray-300 → focus:ring-gray-300 dark:focus:ring-dark-border
```

## WORST OFFENDER FILES (fix these first)

These files have the most dark mode violations. Fix in this order:

### CRITICAL (20+ violations each)
1. `requests/pages/DeptRequests.jsx` — 72 violations
2. `requests/pages/detail/StatusNotice.jsx` — 56 violations
3. `requests/pages/detail/MaintenanceDetailsSection.jsx` — 42 violations
4. `requests/components/RequestCard.jsx` — 45 violations
5. `purchasing/pages/DamagedInventoryPage.jsx` — 49 violations
6. `purchasing/components/DisbursedItemsPanel.jsx` — 36 violations
7. `purchasing/components/ConfirmReturnModal.jsx` — 28 violations
8. `jobs/components/ViewInspectionModal.jsx` — 57 violations
9. `jobs/components/PendingEquipmentApprovals.jsx` — 47 violations
10. `jobs/components/EquipmentMaterialsSection.jsx` — 30 violations

### HIGH (10-20 violations each)
11. `dashboard/pages/AdminDashboard.jsx` — 31 violations
12. `dashboard/pages/ManagerDashboard.jsx` — 33 violations  
13. `dashboard/pages/PurchasingDashboard.jsx` — 28 violations
14. `dashboard/pages/StaffDashboard.jsx` — 28 violations
15. `dashboard/pages/EngineerDashboard.jsx` — 13 violations
16. `dashboard/pages/ITSupportDashboard.jsx` — 18 violations
17. `dashboard/components/StatCard.jsx` — 16 violations
18. `dashboard/components/QuickActions.jsx` — 14 violations
19. `maintenance/components/MaintenanceStats.jsx` — 17 violations
20. `maintenance/components/MaintenanceCard.jsx` — 16 violations

### MEDIUM (5-10 violations each)
21-50: All remaining files in purchasing/components, requests/components, requests/forms, safety/components, equipment/components, jobs/components, maintenance/components, activity/components, accounts/components

## SPECIFIC EXAMPLES FROM AdminDashboard.jsx

### Quick Actions Cards
```jsx
// BEFORE (invisible text in dark mode)
className={`${action.color} p-4 rounded-xl hover:shadow-md transition-all flex flex-col items-center gap-2`}
// where action.color = 'bg-blue-50 text-blue-600'

// AFTER
className={`${action.color} p-4 rounded-xl hover:shadow-md transition-all flex flex-col items-center gap-2`}
// AND update the adminActions array colors:
{ color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' }
{ color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' }
{ color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' }
{ color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' }
```

### System Overview Stats
```jsx
// BEFORE
<div className="text-center p-4 bg-blue-50 rounded-lg">
  <p className="text-3xl font-bold text-blue-600">{count}</p>
  <p className="text-sm text-blue-800">Active Users</p>
</div>

// AFTER
<div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{count}</p>
  <p className="text-sm text-blue-800 dark:text-blue-300">Active Users</p>
</div>
```

### Pending Approvals List Items
```jsx
// BEFORE
className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"

// AFTER  
className="p-3 bg-gray-50 dark:bg-dark-card rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-border"
```

### Settings Button
```jsx
// BEFORE
className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"

// AFTER
className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-card dark:text-dark-text"
```

### Alert Banner
```jsx
// BEFORE
className="bg-red-50 border border-red-200 rounded-lg p-4"
<p className="font-medium text-red-800">
<p className="text-sm text-red-600">

// AFTER
className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
<p className="font-medium text-red-800 dark:text-red-300">
<p className="text-sm text-red-600 dark:text-red-400">
```

### Section Headings (bare text without dark class)
```jsx
// BEFORE
<h3 className="text-lg font-semibold mb-4">Quick Actions</h3>

// AFTER
<h3 className="text-lg font-semibold mb-4 text-text-primary dark:text-dark-text">Quick Actions</h3>
```

## HOW TO APPROACH THIS EFFICIENTLY

Do NOT manually go through each file finding each class. Instead:

### Step 1: Use search-and-replace patterns
For each file, apply these regex replacements in order:

```
1. bg-gray-50" → bg-gray-50 dark:bg-dark-card"
   (but SKIP if dark: already follows)
   
2. bg-gray-100" → bg-gray-100 dark:bg-dark-card"
   
3. bg-white" → bg-white dark:bg-dark-surface"
   (SKIP if dark: already follows)
   
4. border-gray-200" → border-gray-200 dark:border-dark-border"
   border-gray-300" → border-gray-300 dark:border-dark-border"
   
5. hover:bg-gray-50" → hover:bg-gray-50 dark:hover:bg-dark-card"
   hover:bg-gray-100" → hover:bg-gray-100 dark:hover:bg-dark-card"
   
6. For colored backgrounds/text, handle file-by-file
```

### Step 2: Handle the tricky cases
Some classes appear MID-STRING, not at end of className:
```
className="bg-gray-50 rounded-lg p-4"
                     ↑ not at end of string
```
These need the dark: variant inserted right after the light class:
```
className="bg-gray-50 dark:bg-dark-card rounded-lg p-4"
```

### Step 3: Don't double-add
ALWAYS check if `dark:` already exists nearby before adding. Use this rule:
- If the same line already has `dark:bg-` → skip bg replacement
- If the same line already has `dark:text-` → skip text replacement
- If the same line already has `dark:border-` → skip border replacement

### Step 4: Verify with grep
After fixing each file, run:
```bash
grep -n 'bg-gray-50\|bg-gray-100\|bg-white' FILE | grep -v 'dark:'
```
This shows remaining unfixed instances.

## WHAT NOT TO CHANGE
- Don't change colors that are INSIDE SVG or icon components
- Don't change `bg-primary-500` — the brand orange works in both modes
- Don't change `bg-white` when it's inside a gradient (e.g., `from-white`)
- Don't change colors in Tailwind config or globals.css
- Don't add dark mode to `text-white` (white text is for on colored backgrounds)
- Don't change colors inside template literals that compute dynamic classes — instead fix the source variable/constant
- Don't change anything in `node_modules`

## PRIORITY ORDER FOR DARK MODE
1. Dashboard pages (AdminDashboard, ManagerDashboard, etc.) — most seen
2. StatCard, QuickActions components — used by ALL dashboards
3. Equipment pages + components
4. Request pages + components
5. Purchasing pages + components  
6. Maintenance pages + components
7. Everything else

## COMBINED WORKFLOW
When Claude Code works through each file for mobile responsive fixes, it should SIMULTANEOUSLY fix dark mode issues in that same file. Don't do two separate passes — fix both in one go per file.
