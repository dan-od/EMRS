# WFSL Job Tracker — Backend Architecture

## Stack

- **Runtime:** Node.js 20+
- **API Framework:** Fastify 5 (REST + WebSocket via @fastify/websocket)
- **Database:** PostgreSQL 16 (Neon free tier / Supabase / self-hosted)
- **ORM:** Prisma 6
- **Real-time:** WebSocket (native via Fastify plugin) + Redis pub/sub for multi-instance broadcasting
- **Cache/Pub-Sub:** Redis (Upstash free tier / self-hosted)
- **Auth:** JWT access tokens (15min) + refresh tokens (7d) + bcrypt password hashing
- **Email:** Resend (free tier 100 emails/day) or Nodemailer with SMTP
- **Validation:** Zod schemas (shared between API + frontend)
- **Monorepo:** pnpm workspaces

## Monorepo Structure

```
wfsl-tracker/
├── pnpm-workspace.yaml
├── package.json                 # root scripts: dev, build, db:migrate, db:seed
├── packages/
│   ├── api/                     # Fastify backend
│   │   ├── src/
│   │   │   ├── server.ts        # Fastify app setup, plugin registration
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts      # POST /auth/login, /auth/refresh, /auth/logout
│   │   │   │   ├── invite.ts    # POST /invite/resolve, /invite/accept
│   │   │   │   ├── jobs.ts      # CRUD /jobs, /jobs/:id
│   │   │   │   ├── equipment.ts # CRUD /jobs/:id/equipment
│   │   │   │   ├── checks.ts    # POST /checks (engineer submits), GET /checks
│   │   │   │   ├── breakdowns.ts # POST /breakdowns, GET /breakdowns
│   │   │   │   ├── templates.ts # CRUD /templates
│   │   │   │   ├── companies.ts # CRUD /companies, /companies/:id/contacts
│   │   │   │   ├── engineers.ts # CRUD /engineers
│   │   │   │   ├── alerts.ts    # CRUD /alerts (client alert rules)
│   │   │   │   └── export.ts    # GET /export/pdf/:jobId
│   │   │   ├── ws/
│   │   │   │   ├── handler.ts   # WebSocket connection handler
│   │   │   │   ├── rooms.ts     # Job-based room management (subscribe/unsubscribe)
│   │   │   │   └── broadcast.ts # Broadcast check/breakdown to subscribed clients
│   │   │   ├── services/
│   │   │   │   ├── auth.ts      # JWT sign/verify, password hashing, refresh token rotation
│   │   │   │   ├── alerts.ts    # Evaluate alert rules on new check/breakdown
│   │   │   │   ├── email.ts     # Send invite, alert, digest emails
│   │   │   │   └── realtime.ts  # Redis pub/sub for multi-instance WS broadcast
│   │   │   ├── middleware/
│   │   │   │   ├── authenticate.ts # JWT verification hook
│   │   │   │   └── authorize.ts    # Role-based access (admin, engineer, client)
│   │   │   └── config.ts        # Environment variables, secrets
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── db/                      # Database layer
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # Full data model
│   │   │   ├── migrations/      # Auto-generated migrations
│   │   │   └── seed.ts          # Seed with EPF demo data (same as current scenario.js)
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── shared/                  # Shared between all packages
│   │   ├── src/
│   │   │   ├── types.ts         # TypeScript interfaces (Job, Equipment, Check, User, etc.)
│   │   │   ├── validation.ts    # Zod schemas for API request/response
│   │   │   ├── constants.ts     # Status enums, role enums, system categories
│   │   │   └── tokens.ts        # Design tokens (colors, fonts) — shared with frontend
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── admin/                   # Admin console frontend
│   │   ├── src/                 # Moved from current src/components/admin + pages
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   ├── client/                  # Client portal frontend
│   │   ├── src/                 # Moved from current src/components/client
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── engineer/                # Engineer portal frontend
│       ├── src/                 # Moved from current src/components/engineer
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
```

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// === USERS & AUTH ===

enum Role {
  ADMIN
  ENGINEER
  CLIENT
}

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String
  passwordHash      String
  role              Role
  mustResetPassword Boolean   @default(false)
  companyId         String?
  company           Company?  @relation(fields: [companyId], references: [id])
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  engineerProfile   Engineer?
  refreshTokens     RefreshToken[]
  alertRules        AlertRule[]
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model InviteToken {
  id        String   @id @default(cuid())
  token     String   @unique
  email     String
  name      String?
  companyId String
  company   Company  @relation(fields: [companyId], references: [id])
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())
}

// === COMPANIES ===

model Company {
  id          String   @id @default(cuid())
  name        String
  logo        String?  // URL to uploaded logo
  accentColor String   @default("#0A3D62")
  tagline     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  users       User[]
  jobs        Job[]
  invites     InviteToken[]
}

// === ENGINEERS ===

model Engineer {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  status    String   @default("off") // "on" | "off"

  // Relations
  jobAssignments JobEngineer[]
  checks         Check[]
  breakdowns     Breakdown[]
}

// === JOB TEMPLATES ===

model Template {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  equipmentTemplates EquipmentTemplate[]
  jobs               Job[]
}

model EquipmentTemplate {
  id         String   @id @default(cuid())
  templateId String
  template   Template @relation(fields: [templateId], references: [id], onDelete: Cascade)
  name       String
  assetId    String   // e.g. "G-101"
  system     String   // e.g. "POWER GENERATION"
  sortOrder  Int      @default(0)

  // Relations
  checkParams CheckParamTemplate[]
}

model CheckParamTemplate {
  id                  String            @id @default(cuid())
  equipmentTemplateId String
  equipmentTemplate   EquipmentTemplate @relation(fields: [equipmentTemplateId], references: [id], onDelete: Cascade)
  frequency           String            // "daily" | "weekly" | "monthly"
  paramName           String            // e.g. "Pressure"
  unit                String?           // e.g. "psi"
  thresholdMin        Float?
  thresholdMax        Float?
  sortOrder           Int               @default(0)
}

// === JOBS ===

model Job {
  id         String   @id @default(cuid())
  name       String
  code       String   // e.g. "OML 53"
  status     String   @default("active") // "active" | "completed"
  templateId String
  template   Template @relation(fields: [templateId], references: [id])
  companyId  String
  company    Company  @relation(fields: [companyId], references: [id])
  startDate  DateTime
  endDate    DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Site manager assigned to this job
  siteManagerName String?
  siteManagerInitials String?

  // Relations
  equipment  Equipment[]
  engineers  JobEngineer[]
  checks     Check[]
  breakdowns Breakdown[]
}

model JobEngineer {
  id         String   @id @default(cuid())
  jobId      String
  job        Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  engineerId String
  engineer   Engineer @relation(fields: [engineerId], references: [id])

  @@unique([jobId, engineerId])
}

// === EQUIPMENT (instances on a job) ===

model Equipment {
  id       String @id @default(cuid())
  jobId    String
  job      Job    @relation(fields: [jobId], references: [id], onDelete: Cascade)
  name     String
  assetId  String // e.g. "G-101"
  system   String // e.g. "POWER GENERATION"
  status   String @default("ok") // "ok" | "attn" | "down"

  // Relations
  checks     Check[]
  breakdowns Breakdown[]
  alertRules AlertRule[]
}

// === CHECKS (engineer inspections) ===

model Check {
  id          String   @id @default(cuid())
  jobId       String
  job         Job      @relation(fields: [jobId], references: [id])
  equipmentId String
  equipment   Equipment @relation(fields: [equipmentId], references: [id])
  engineerId  String
  engineer    Engineer  @relation(fields: [engineerId], references: [id])
  frequency   String   // "daily" | "weekly" | "monthly"
  status      String   // "ok" | "not_ok"
  observation String?
  actionTaken String?
  photoUrl    String?
  createdAt   DateTime @default(now())

  // Relations
  params CheckParam[]
}

model CheckParam {
  id      String @id @default(cuid())
  checkId String
  check   Check  @relation(fields: [checkId], references: [id], onDelete: Cascade)
  name    String
  value   String
  unit    String?
  flag    String? // null | "amber" | "red"
}

// === BREAKDOWNS ===

model Breakdown {
  id              String   @id @default(cuid())
  jobId           String
  job             Job      @relation(fields: [jobId], references: [id])
  equipmentId     String
  equipment       Equipment @relation(fields: [equipmentId], references: [id])
  engineerId      String
  engineer        Engineer  @relation(fields: [engineerId], references: [id])
  failure         String
  rootCause       String?
  correctiveAction String?
  spareParts      String?
  downtime        String?
  photoUrl        String?
  resolvedAt      DateTime?
  createdAt       DateTime @default(now())
}

// === ALERT RULES (client-configured) ===

model AlertRule {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  equipmentId String?
  equipment   Equipment? @relation(fields: [equipmentId], references: [id])
  type        String   // "threshold" | "status_change" | "inactivity" | "breakdown" | "escalation" | "digest"
  parameter   String?  // e.g. "Pressure"
  condition   String?  // e.g. "above"
  value       String?  // e.g. "180"
  channel     String   // "email" | "push" | "both"
  enabled     Boolean  @default(true)
  createdAt   DateTime @default(now())
}

// === ACTIVITY LOG ===

model ActivityLog {
  id          String   @id @default(cuid())
  jobId       String
  tag         String   // "CHECK" | "OBSRV" | "BRKDN" | "SCHED" | "SYNC" | "START"
  message     String
  equipmentId String?
  engineerId  String?
  createdAt   DateTime @default(now())
}
```

## API Endpoints

### Auth
- `POST /auth/login` — email + password → JWT access + refresh token
- `POST /auth/refresh` — refresh token → new access token
- `POST /auth/logout` — revoke refresh token
- `POST /auth/reset-password` — current + new password (for must-reset flow)

### Invites
- `GET /invite/:token` — resolve invite token → company name, email
- `POST /invite/:token/accept` — name + password → create account + login

### Jobs (admin only)
- `GET /jobs` — list all jobs
- `POST /jobs` — create job from template
- `GET /jobs/:id` — job detail with equipment + engineers
- `PATCH /jobs/:id` — update job (status, assignments)

### Equipment (admin + engineer + client read-only)
- `GET /jobs/:id/equipment` — list equipment for a job
- `GET /jobs/:id/equipment/:eqId` — equipment detail with latest check

### Checks (engineer writes, admin + client read)
- `POST /checks` — engineer submits a check → triggers WS broadcast + alert evaluation
- `GET /checks?jobId=X&equipmentId=Y` — check history

### Breakdowns (engineer writes, admin + client read)
- `POST /breakdowns` — engineer files breakdown report → triggers WS broadcast + alert
- `GET /breakdowns?jobId=X` — breakdown history
- `PATCH /breakdowns/:id` — resolve/update breakdown

### Templates (admin only)
- `GET /templates` — list templates
- `POST /templates` — create template
- `GET /templates/:id` — template with equipment + params
- `PUT /templates/:id` — update template

### Companies (admin only)
- `GET /companies` — list companies
- `POST /companies` — create company (name, logo, accent)
- `GET /companies/:id` — company detail with contacts
- `POST /companies/:id/invite` — send invite to a contact

### Engineers (admin only)
- `GET /engineers` — list engineers
- `POST /engineers` — create engineer account
- `PATCH /engineers/:id` — update assignment, status

### Alerts (client only)
- `GET /alerts` — list my alert rules
- `POST /alerts` — create alert rule
- `PATCH /alerts/:id` — toggle/update rule
- `DELETE /alerts/:id` — delete rule

### Export
- `GET /export/pdf/:jobId` — generate branded PDF report

## Real-Time Flow

```
Engineer submits check (POST /checks)
  ↓
API persists to PostgreSQL
  ↓
API publishes to Redis channel: `job:{jobId}:update`
  ↓
All API instances subscribed to Redis pick up the message
  ↓
Each instance broadcasts to WebSocket clients in that job's room
  ↓
Client portal dashboards update instantly (no refresh)
Admin console updates instantly
  ↓
Alert engine evaluates all active rules for this job/equipment
  ↓
Matching rules → fire email/push notification
```

### WebSocket Protocol

Client connects: `ws://api.jobs.wellfluidservices.com/ws?token=JWT`

Server authenticates JWT, determines role + job access, subscribes to rooms.

Messages from server:
```json
{ "type": "check", "jobId": "...", "equipmentId": "...", "data": { ... } }
{ "type": "breakdown", "jobId": "...", "equipmentId": "...", "data": { ... } }
{ "type": "status_change", "jobId": "...", "equipmentId": "...", "newStatus": "attn" }
{ "type": "alert", "ruleId": "...", "message": "..." }
```

## Auth Flow

### Admin login
1. POST /auth/login → JWT access (15min) + refresh token (7d, httpOnly cookie)
2. Access token in Authorization header for all API calls
3. Refresh token auto-rotates on /auth/refresh

### Engineer login
1. Same as admin but role=ENGINEER
2. If mustResetPassword=true → forced to POST /auth/reset-password before accessing any other endpoint

### Client invite + login
1. Admin creates invite → POST /companies/:id/invite → email sent with token link
2. Client clicks link → GET /invite/:token → shows company name, pre-filled email
3. Client sets password → POST /invite/:token/accept → account created + auto-login
4. Subsequent logins via POST /auth/login

## Deployment

### Docker Compose (homelab / VPS)
```yaml
services:
  api:
    build: ./packages/api
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgresql://...
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ...
    depends_on: [postgres, redis]

  postgres:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: wfsl
      POSTGRES_PASSWORD: ...

  redis:
    image: redis:7-alpine

  admin:
    build: ./packages/admin
    # Serves static files via Nginx

  client:
    build: ./packages/client

  engineer:
    build: ./packages/engineer

  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    # Routes:
    # jobs.wellfluidservices.com/api/* → api:3000
    # jobs.wellfluidservices.com/admin/* → admin static
    # jobs.wellfluidservices.com/field/* → engineer static
    # jobs.wellfluidservices.com/* → client static
```

### Vercel / Free hosting
- Admin, Client, Engineer → 3 Vercel projects (free tier)
- API → Railway or Render (free tier)
- PostgreSQL → Neon or Supabase (free tier)
- Redis → Upstash (free tier)
