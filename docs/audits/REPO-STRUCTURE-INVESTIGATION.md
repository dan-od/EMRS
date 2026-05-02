# EMRS Repo Structure Investigation
Generated: 2026-05-02

---

## Part 1 — SRE Review Folders

### emrs-sre-review/

**Structure:** The folder has a doubled path — `emrs-sre-review/emrs-sre-review/` (the outer folder contains a same-named inner folder). The actual content lives in the inner folder.

**Full file listing with sizes and mtimes:**

| Relative Path (from emrs-sre-review/) | Size (bytes) | Last Modified |
|----------------------------------------|-------------|---------------|
| emrs-sre-review/SKILL.md | 7,709 | 2026-03-27 18:13 |
| emrs-sre-review/references/phases/phase-1.md | 4,032 | 2026-03-27 17:42 |
| emrs-sre-review/references/phases/phase-2.md | 3,613 | 2026-03-27 17:42 |
| emrs-sre-review/references/phases/phase-3.md | 3,070 | 2026-03-27 17:42 |
| emrs-sre-review/references/phases/phase-4.md | 8,967 | 2026-03-27 17:42 |
| emrs-sre-review/references/phases/phase-5.md | 3,362 | 2026-03-27 17:42 |
| emrs-sre-review/references/phases/phase-6.md | 2,970 | 2026-03-27 17:42 |
| emrs-sre-review/references/phases/phase-7.md | 4,051 | 2026-03-27 17:42 |

**Total files:** 8  
**Total size:** ~37,774 bytes (~37 KB)

**Sample — SKILL.md (first 200 chars):**
```
---
name: emrs-sre-review
description: >
  Production-grade SRE and security code review for the EMRS codebase.
  Use this skill whenever you need to audit, review, or assess the EMRS system
  for production readiness...
```

**Sample — references/phases/phase-1.md (first 200 chars):**
```
# Phase 1: Security & Auth

The highest-priority phase. Auth vulnerabilities have the largest blast radius
in a role-based system with 13 distinct roles and sensitive operational data.

## Checklist

### 1.1 JWT & Secrets Management
```

**Character of content:** This folder is a **Claude Code skill definition**. `SKILL.md` is a YAML-frontmatter skill manifest; the `references/phases/phase-*.md` files are **pre-review checklists** — templates with items to check, not actual findings.

---

### SRE_REVIEW/

**Full file listing with sizes and mtimes:**

| Filename | Size (bytes) | Last Modified |
|----------|-------------|---------------|
| SRE_REVIEW_PHASE_1.md | 15,778 | 2026-04-24 00:01 |
| SRE_REVIEW_PHASE_2.md | 21,020 | 2026-04-24 00:16 |
| SRE_REVIEW_PHASE_3.md | 17,719 | 2026-04-24 00:26 |
| SRE_REVIEW_PHASE_4.md | 13,164 | 2026-03-27 18:13 |
| SRE_REVIEW_PHASE_5.md | 17,233 | 2026-04-24 00:50 |
| SRE_REVIEW_PHASE_6.md | 13,171 | 2026-04-24 00:56 |
| SRE_REVIEW_PHASE_7.md | 13,167 | 2026-04-24 01:03 |
| SRE_REVIEW_SUMMARY.md | 10,995 | 2026-04-24 01:04 |
| SRE_REVIEW_TRACKER.md | 9,604 | 2026-05-01 11:34 |

**Total files:** 9  
**Total size:** ~131,851 bytes (~129 KB)

**Sample — SRE_REVIEW_PHASE_1.md (first 200 chars):**
```
# SRE Review — Phase 1: Security & Auth
**Date:** 2026-04-23
**Reviewer:** Claude Code (SRE Skill)
**Scope:** JWT config, auth middleware, role-based access control, CORS, input validation, HTTP headers, frontend token handling, known issue verification.

## Critical Issues (Must Fix Before Launch)

### C1 — Rate Limiting Disabled: Login Brute-Force Unprotected
```

**Sample — SRE_REVIEW_SUMMARY.md (first 200 chars):**
```
# EMRS SRE Review — Final Summary
**Date:** 2026-04-24
**Reviewer:** Claude Code (SRE Skill)
**Phases Completed:** 7 of 7

## Total Findings Across All Phases
| Phase | Critical | Major | Minor |
| 1: Security & Auth | 5 | 7 | 7 |
```

**Character of content:** This folder contains **actual review findings** — dated reports authored by Claude Code, listing critical/major/minor issues found during each review phase, plus a summary and a tracker that was last updated 2026-05-01.

---

### Comparison

| Dimension | emrs-sre-review/ | SRE_REVIEW/ |
|-----------|-----------------|-------------|
| Purpose | Skill template / checklist prompts | Actual completed review reports |
| Content type | Pre-defined checklists (what to look for) | Findings & remediation notes |
| File count | 8 | 9 |
| Total size | ~37 KB | ~129 KB |
| Created | 2026-03-27 | 2026-03-27 through 2026-04-24 |
| Last updated | 2026-03-27 | 2026-05-01 |
| Overlap | phase-1..7 subjects match | SRE_REVIEW_PHASE_1..7 are the outputs of those checklists |

**Verdict: Genuinely different — NOT duplicates.**

- `emrs-sre-review/` is the **input**: a Claude Code skill definition that tells the AI *how* to perform an SRE review (structured YAML manifest + checklist prompts per phase). It belongs in `.claude/` or a `skills/` directory.
- `SRE_REVIEW/` is the **output**: the actual executed review documents — timestamped findings, critical/major/minor issue lists, a cross-phase summary, and an active tracker. This is canonical reference material for the project team.

**Canonical for team reference:** `SRE_REVIEW/`  
**Canonical as a reusable skill:** `emrs-sre-review/emrs-sre-review/` (note the doubled nesting is an artifact of how the skill was created/copied — the inner `emrs-sre-review/` folder is the actual skill root)

---

## Part 2 — Root package.json

**Full contents of `package.json`:**
```json
{
  "name": "emrs",
  "version": "1.0.0",
  "description": "**WellFluid Services Nigeria** - Internal operations platform for oilfield service company. PWA-enabled SaaS for equipment tracking, resource requests, and departmental workflows.",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@anthropic-ai/claude-code": "^2.1.50"
  }
}
```

**`package-lock.json` (first 14 lines):**
```json
{
  "name": "emrs",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "emrs",
      "version": "1.0.0",
      "license": "ISC",
      "devDependencies": {
        "@anthropic-ai/claude-code": "^2.1.50"
      }
    },
    "node_modules/@anthropic-ai/claude-code": { ... }
  }
}
```

**Analysis: ONE-OFF SCRIPT HOLDER (not a real monorepo workspace)**

Evidence:
1. **No `workspaces` field** — a real npm/pnpm/yarn workspace root would declare `"workspaces": ["frontend", "backend"]`. This one does not.
2. **No scripts for sub-packages** — no `start`, `build`, `dev` scripts that delegate to `frontend/` or `backend/`. The only script is the default `"test"` placeholder.
3. **No real dependencies** — the only dependency is `@anthropic-ai/claude-code` as a devDependency. This is the Claude Code CLI installed at root level so that `npx claude` is available from the project directory. It is not a project build dependency.
4. **No `index.js`** — despite `"main": "index.js"`, no such file exists at root. This is the `npm init` default.
5. **`package-lock.json` is `lockfileVersion: 3`** — consistent with a minimal `npm install @anthropic-ai/claude-code` run, nothing more.

**Conclusion:** The root `package.json` is a stub created by `npm init` that was subsequently used only to install the Claude Code CLI. It does not manage or orchestrate the frontend or backend packages. Frontend and backend are standalone packages with their own `package.json` files.

---

## Part 3 — Root-Level Files

| Filename | Size | Classification | Reason |
|----------|------|---------------|--------|
| `.gitignore` | 91 B | ESSENTIAL | Git ignore rules — actively used (contains backups rules) |
| `CLAUDE.md` | 9,801 B | ESSENTIAL | Claude Code project instructions — read on every session |
| `README.md` | 13,108 B | DOCS | Project documentation for onboarding |
| `MOBILE_RESPONSIVE.md` | 26,497 B | LEGACY | Mobile responsiveness notes — should be in `docs/` not root |
| `package.json` | 468 B | LEGACY | Stub root package — only holds Claude Code CLI install; not a real workspace root |
| `package-lock.json` | 11,267 B | LEGACY | Lock file for stub package — tied to root package.json |

---

## Part 4 — backup/ vs backups/

### backup/

Content: Zipped snapshots of old code versions (Jan–Feb 2026) plus one extracted frontend snapshot from 2026-01-07.

| File / Path | Size | Last Modified |
|-------------|------|---------------|
| `backend 02.16.zip` | 3,608,673 B (3.4 MB) | 2026-02-16 15:58 |
| `backend.zip` | 211,763 B (207 KB) | 2026-01-11 07:37 |
| `backup_2026-01-07_1247 (backend).zip` | 404,578 B (395 KB) | 2026-01-08 23:11 |
| `frontedn.zip` *(typo)* | 1,227,833 B (1.2 MB) | 2026-02-08 09:47 |
| `frontend.zip` | 374,418 B (366 KB) | 2026-01-11 07:36 |
| `public.zip` | 1,227,833 B (1.2 MB) | 2026-02-16 15:58 |
| `backup_2026-01-07_1247 (frontend)/` *(extracted dir)* | ~115 KB across 44 files | 2026-01-07 to 2026-01-23 |

**Note:** `frontedn.zip` is a typo for `frontend.zip`. `public.zip` and `frontedn.zip` are the same size (1,227,833 B) — likely identical content under different names.

### backups/

Content: PostgreSQL database dumps and audit reports from the current sprint (May 2026).

| File / Path | Size | Last Modified |
|-------------|------|---------------|
| `emrs-full.dump` *(root — pre-cleanup)* | 372,460 B (364 KB) | 2026-05-01 21:26 |
| `emrs-full.sql` *(root — pre-cleanup)* | 1,033,713 B (1009 KB) | 2026-05-01 21:26 |
| `emrs-schema.sql` *(root — pre-cleanup)* | 135,754 B (133 KB) | 2026-05-01 21:26 |
| `INVESTIGATION-REPORT.md` | 23,503 B (23 KB) | 2026-05-01 22:54 |
| `SCHEMA-AUDIT.md` | 41,086 B (40 KB) | 2026-05-01 21:40 |
| `2026-05-02-final-clean/emrs-full.dump` | 367,246 B (359 KB) | 2026-05-02 00:29 |
| `2026-05-02-final-clean/emrs-full.sql` | 1,032,895 B (1008 KB) | 2026-05-02 00:29 |
| `2026-05-02-final-clean/emrs-schema.sql` | 132,345 B (129 KB) | 2026-05-02 00:29 |
| `2026-05-02-post-runtime-fixes/dropped-job_inspections.sql` | 2,146 B (2 KB) | 2026-05-02 00:23 |
| `2026-05-02-post-runtime-fixes/emrs-full.dump` | 372,931 B (364 KB) | 2026-05-01 22:39 |
| `2026-05-02-post-runtime-fixes/emrs-full.sql` | 1,035,450 B (1011 KB) | 2026-05-01 22:39 |
| `2026-05-02-post-runtime-fixes/emrs-schema.sql` | 135,824 B (133 KB) | 2026-05-01 22:38 |

**Note:** The `.gitignore` explicitly excludes `backups/**/*.dump` but allows `.sql` and `.md` files in `backups/`. The root-level `emrs-full.dump`, `emrs-full.sql`, `emrs-schema.sql` appear to be the earliest snapshot (2026-05-01 21:26) before subsequent cleanup runs produced the timestamped subdirectories.

---

## Part 5 — Dotfiles at Root

| Name | Type | Purpose | Needed for Dev/Deploy? |
|------|------|---------|----------------------|
| `.gitignore` | File (91 B) | Excludes `backups/**/*.dump` and allows `.sql`/`.md` in backups. Minimal — does not cover `node_modules`, `.env`, build artifacts at root level. | YES — essential for git hygiene; should be expanded |
| `.git/` | Directory | Git repository metadata (created 2026-03-27) | YES — do not touch |
| `.claude/` | Directory | Contains `settings.local.json` (112 B) — Claude Code project-level settings | YES for dev (Claude Code sessions); not needed at runtime/deployment |
| `.vscode/` | Directory | Contains `launch.json` (498 B) — VSCode debugger launch configuration | YES for dev; not needed at deployment |

**`.gitignore` current contents:**
```
backups/**/*.dump
!backups/**/emrs-schema.sql
!backups/**/emrs-full.sql
!backups/**/*.md
```

**Notable gaps in `.gitignore`:**
- No entry for `node_modules/` (currently only exists in `backend/` and `frontend/` which have their own `.gitignore` entries, but root has no guard)
- No entry for `.env` files at root
- No entry for `backup/` (the old zip archive folder is fully tracked by git)
- `MOBILE_RESPONSIVE.md` and other stray docs at root are tracked with no exclusion

---

## Part 6 — node_modules Locations

**node_modules does NOT exist at repo root.**

Confirmed locations:
- `backend/node_modules/` — backend Node.js dependencies (Express, pg, JWT, etc.)
- `frontend/node_modules/` — frontend dependencies (React, Vite, Tailwind, etc.)

No other `node_modules` directories were found within the first 3 levels of the repo tree.

**Suspicious large directories at root:** None found. The large directories at root are:
- `backup/` — ~7 MB of old zip archives (code snapshots from Dec 2025 – Feb 2026)
- `backups/` — ~3.4 MB of database dumps (mostly `.dump` binary files excluded by `.gitignore`)
- `emrs-sre-review/` — ~38 KB of skill definition files
- `SRE_REVIEW/` — ~129 KB of review reports

---

## PROPOSED RESTRUCTURE

The following commands describe every recommended reorganization based on the findings above. No deletions are executed — proposed deletions are noted as comments for manual review.

```powershell
# ============================================================
# PART 1 — Fix the doubled emrs-sre-review nesting
# The skill lives at emrs-sre-review/emrs-sre-review/ (nested).
# Move it to a .claude/skills/ directory where Claude Code
# skill definitions belong.
# ============================================================

# Create the skills directory under .claude
New-Item -ItemType Directory -Force -Path "c:\Users\danie\Desktop\Codes\v2.2 release\emrs\.claude\skills"

# Move the inner skill folder (the real content) to .claude/skills/
Move-Item "c:\Users\danie\Desktop\Codes\v2.2 release\emrs\emrs-sre-review\emrs-sre-review" `
          "c:\Users\danie\Desktop\Codes\v2.2 release\emrs\.claude\skills\emrs-sre-review"

# After move, the outer emrs-sre-review/ folder will be empty
# PROPOSE DELETE: c:\Users\danie\Desktop\Codes\v2.2 release\emrs\emrs-sre-review\ (empty outer folder)

# Git tracking for the move
# git mv emrs-sre-review/emrs-sre-review .claude/skills/emrs-sre-review
# (then remove the now-empty emrs-sre-review/ directory from git)
# git rm -r emrs-sre-review

# ============================================================
# PART 1 — Move SRE_REVIEW outputs into docs/
# The SRE review findings are project documentation and belong
# in docs/sre-review/ rather than a top-level folder.
# ============================================================

New-Item -ItemType Directory -Force -Path "c:\Users\danie\Desktop\Codes\v2.2 release\emrs\docs\sre-review"

Move-Item "c:\Users\danie\Desktop\Codes\v2.2 release\emrs\SRE_REVIEW\*" `
          "c:\Users\danie\Desktop\Codes\v2.2 release\emrs\docs\sre-review\"

# After move, SRE_REVIEW/ will be empty
# PROPOSE DELETE: c:\Users\danie\Desktop\Codes\v2.2 release\emrs\SRE_REVIEW\ (empty after move)

# Git tracking
# git mv SRE_REVIEW/SRE_REVIEW_PHASE_1.md docs/sre-review/SRE_REVIEW_PHASE_1.md
# git mv SRE_REVIEW/SRE_REVIEW_PHASE_2.md docs/sre-review/SRE_REVIEW_PHASE_2.md
# git mv SRE_REVIEW/SRE_REVIEW_PHASE_3.md docs/sre-review/SRE_REVIEW_PHASE_3.md
# git mv SRE_REVIEW/SRE_REVIEW_PHASE_4.md docs/sre-review/SRE_REVIEW_PHASE_4.md
# git mv SRE_REVIEW/SRE_REVIEW_PHASE_5.md docs/sre-review/SRE_REVIEW_PHASE_5.md
# git mv SRE_REVIEW/SRE_REVIEW_PHASE_6.md docs/sre-review/SRE_REVIEW_PHASE_6.md
# git mv SRE_REVIEW/SRE_REVIEW_PHASE_7.md docs/sre-review/SRE_REVIEW_PHASE_7.md
# git mv SRE_REVIEW/SRE_REVIEW_SUMMARY.md  docs/sre-review/SRE_REVIEW_SUMMARY.md
# git mv SRE_REVIEW/SRE_REVIEW_TRACKER.md  docs/sre-review/SRE_REVIEW_TRACKER.md
# git rm -r SRE_REVIEW

# ============================================================
# PART 2 — Root package.json / package-lock.json
# The root package.json is a stub that only holds the Claude
# Code CLI install. It is not a workspace root and not needed
# for the app. It can be left in place (it is harmless) OR
# it can be cleaned up — but do NOT delete the package-lock.json
# without also removing package.json (they go together).
# ============================================================

# PROPOSE DELETE: c:\Users\danie\Desktop\Codes\v2.2 release\emrs\package.json
# PROPOSE DELETE: c:\Users\danie\Desktop\Codes\v2.2 release\emrs\package-lock.json
# PROPOSE DELETE: c:\Users\danie\Desktop\Codes\v2.2 release\emrs\node_modules\ (if it appears after npm install at root)
# Note: install Claude Code globally instead: npm install -g @anthropic-ai/claude-code

# ============================================================
# PART 3 — Move MOBILE_RESPONSIVE.md to docs/
# This file documents mobile responsiveness decisions and
# does not belong at repo root.
# ============================================================

New-Item -ItemType Directory -Force -Path "c:\Users\danie\Desktop\Codes\v2.2 release\emrs\docs"

Move-Item "c:\Users\danie\Desktop\Codes\v2.2 release\emrs\MOBILE_RESPONSIVE.md" `
          "c:\Users\danie\Desktop\Codes\v2.2 release\emrs\docs\MOBILE_RESPONSIVE.md"

# Git tracking
# git mv MOBILE_RESPONSIVE.md docs/MOBILE_RESPONSIVE.md

# ============================================================
# PART 4 — backup/ folder (old code zips)
# The backup/ folder contains old zip archives from Dec 2025
# through Feb 2026 and an extracted snapshot directory.
# These are NOT database dumps — they are old source code.
# They are large (~7 MB) and clutter the repo root.
# Move them to a dedicated archive location outside the repo,
# or at minimum into a clearly-named archive folder.
# ============================================================

# PROPOSE: Move old code zip archives out of the repo root into
# an external archive directory (e.g. Desktop/emrs-archives/).
# They are not needed for development or deployment.

# PROPOSE DELETE (after archiving externally):
#   backup/backend 02.16.zip       (3.4 MB — Feb 2026 backend snapshot)
#   backup/backend.zip             (207 KB — Jan 2026 backend)
#   backup/backup_2026-01-07_1247 (backend).zip  (395 KB)
#   backup/frontedn.zip            (1.2 MB — likely duplicate of public.zip)
#   backup/frontend.zip            (366 KB — Jan 2026 frontend)
#   backup/public.zip              (1.2 MB — Feb 2026 frontend, same size as frontedn.zip)
#   backup/backup_2026-01-07_1247 (frontend)/  (extracted snapshot, 44 files)

# Add backup/ to .gitignore if keeping it locally
# (Add to .gitignore: backup/)

# ============================================================
# PART 4 — backups/ folder (DB dumps — mostly already gitignored)
# The .gitignore already excludes *.dump files.
# The INVESTIGATION-REPORT.md and SCHEMA-AUDIT.md in the root
# of backups/ should be moved to docs/audits/ where this
# report also lives.
# ============================================================

Move-Item "c:\Users\danie\Desktop\Codes\v2.2 release\emrs\backups\INVESTIGATION-REPORT.md" `
          "c:\Users\danie\Desktop\Codes\v2.2 release\emrs\docs\audits\INVESTIGATION-REPORT.md"

Move-Item "c:\Users\danie\Desktop\Codes\v2.2 release\emrs\backups\SCHEMA-AUDIT.md" `
          "c:\Users\danie\Desktop\Codes\v2.2 release\emrs\docs\audits\SCHEMA-AUDIT.md"

# Git tracking
# git mv backups/INVESTIGATION-REPORT.md docs/audits/INVESTIGATION-REPORT.md
# git mv backups/SCHEMA-AUDIT.md docs/audits/SCHEMA-AUDIT.md

# ============================================================
# PART 5 — .gitignore expansion
# The current .gitignore is minimal (only 4 lines, all about
# backups/ dumps). Recommended additions:
# ============================================================

# Append to .gitignore:
Add-Content -Path "c:\Users\danie\Desktop\Codes\v2.2 release\emrs\.gitignore" -Value @"

# Old code archive folder at root (not needed in git)
backup/

# Environment files (never commit secrets)
.env
.env.local
.env.*.local

# OS files
.DS_Store
Thumbs.db
"@

# ============================================================
# SUMMARY OF FINAL INTENDED STRUCTURE
# After all moves above, the repo root should contain:
#
# emrs/
#   .claude/
#     settings.local.json
#     skills/
#       emrs-sre-review/       (moved from emrs-sre-review/emrs-sre-review/)
#   .git/
#   .gitignore                 (expanded)
#   .vscode/
#     launch.json
#   backend/                   (unchanged)
#   backups/                   (DB dumps only, no .md files)
#     2026-05-02-final-clean/
#     2026-05-02-post-runtime-fixes/
#     emrs-full.sql
#     emrs-schema.sql
#   docs/
#     audits/
#       INVESTIGATION-REPORT.md   (moved from backups/)
#       REPO-STRUCTURE-INVESTIGATION.md  (this file)
#       SCHEMA-AUDIT.md            (moved from backups/)
#     sre-review/
#       SRE_REVIEW_PHASE_1.md .. _7.md  (moved from SRE_REVIEW/)
#       SRE_REVIEW_SUMMARY.md
#       SRE_REVIEW_TRACKER.md
#     MOBILE_RESPONSIVE.md        (moved from root)
#   frontend/                  (unchanged)
#   CLAUDE.md                  (stays at root — Claude Code requires it here)
#   README.md                  (stays at root — standard project README)
#
# REMOVED from root:
#   emrs-sre-review/           (content moved to .claude/skills/)
#   SRE_REVIEW/                (content moved to docs/sre-review/)
#   backup/                    (archive externally or gitignore)
#   MOBILE_RESPONSIVE.md       (moved to docs/)
#   package.json               (stub — remove if Claude Code installed globally)
#   package-lock.json          (stub — remove with package.json)
# ============================================================
```
