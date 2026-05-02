# 🛢️ EMRS - Equipment & Resource Management System

**WellFluid Services Nigeria** - Internal operations platform for oilfield service company. PWA-enabled SaaS for equipment tracking, resource requests, and departmental workflows.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Default Credentials](#default-credentials)

---

## ✨ Features

### Core Modules
- **Authentication** - JWT-based auth with role-based access control
- **Dashboard** - Role-specific dashboards with KPIs and quick actions
- **Equipment Management** - Track equipment, hours logging, maintenance scheduling
- **Request Hub** - Multi-type requests (PPE, Transport, Equipment, Material, Maintenance)
- **Job Management** - Job creation, team assignment, equipment allocation, inspections
- **Safety Reporting** - Incident/Hazard/Near-Miss reports with anonymous option
- **Purchasing & Inventory** - Stock management, disbursements, low-stock alerts
- **User Management** - Admin panel for user CRUD operations

### Technical Features
- 📱 PWA-enabled (installable, offline-capable)
- 🔄 SWR caching with automatic revalidation
- 🎨 Tailwind CSS with custom design system
- 📊 Activity logging for audit trails
- 🔐 Role-based route protection
- ⚡ Lazy-loaded routes for performance

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool with HMR
- **React Router 6** - Client-side routing
- **Zustand** - State management
- **SWR** - Data fetching & caching
- **React Hook Form + Zod** - Form handling & validation
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Node.js + Express** - API server
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Zod** - Request validation
- **Nodemailer** - Email service

---

## 📁 Project Structure

```
emrs/
├── frontend/                 # React PWA
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── common/       # Button, Input, Card, Modal, etc.
│   │   │   ├── feedback/     # Loaders, EmptyState, OfflineBanner
│   │   │   └── layout/       # Sidebar, Header, PageWrapper
│   │   ├── features/         # Feature modules
│   │   │   ├── auth/         # Login, password reset
│   │   │   ├── dashboard/    # Role-specific dashboards
│   │   │   ├── equipment/    # Equipment management
│   │   │   ├── requests/     # Request hub
│   │   │   ├── jobs/         # Job management
│   │   │   ├── safety/       # Safety reporting
│   │   │   ├── purchasing/   # Inventory & disbursements
│   │   │   └── users/        # User management
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API layer
│   │   ├── store/            # Zustand stores
│   │   ├── routes/           # Route configuration
│   │   ├── styles/           # Global styles
│   │   └── utils/            # Utilities & constants
│   └── public/               # Static assets
│
└── backend/                  # Express API
    ├── src/
    │   ├── config/           # Database, env, migrations
    │   ├── middleware/       # Auth, validation, error handling
    │   ├── modules/          # Feature modules
    │   │   ├── auth/
    │   │   ├── users/
    │   │   ├── equipment/
    │   │   ├── requests/
    │   │   ├── jobs/
    │   │   ├── safety/
    │   │   └── purchasing/
    │   ├── routes/           # Route aggregator
    │   └── utils/            # Logger, email, tokens
    └── migrations/           # SQL migration files
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone & Install

```bash
# Frontend
cd emrs/frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configure Environment

Create `backend/.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=emrs_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Email (optional - for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=EMRS <noreply@wellfluid.com>
```

### 3. Setup Database

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE emrs_db;
\q

# Run migrations
cd backend
npm run migrate

# Seed initial data
npm run seed
```

### 4. Start Development Servers

```bash
# Terminal 1 - Backend (port 5000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 3000)
cd frontend
npm run dev
```

### 5. Access Application

Open http://localhost:3000 in your browser.

---

## 🔧 Environment Setup

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | localhost |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_NAME` | Database name | emrs_db |
| `DB_USER` | Database user | postgres |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiration | 7d |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `FRONTEND_URL` | CORS origin | http://localhost:3000 |
| `EMAIL_HOST` | SMTP host | - |
| `EMAIL_PORT` | SMTP port | 587 |
| `EMAIL_USER` | SMTP user | - |
| `EMAIL_PASSWORD` | SMTP password | - |

---

## 🗄️ Database Setup

### Migrations

The `migrations/` folder contains SQL files that create the database schema:

1. `001_create_users.sql` - Users, roles, activity logs
2. `002_create_equipment.sql` - Equipment, hours tracking, maintenance
3. `003_create_requests.sql` - Multi-type requests with approval workflow
4. `004_create_jobs.sql` - Jobs, teams, equipment assignment, inspections
5. `005_create_safety.sql` - Safety reports with history tracking
6. `006_create_inventory.sql` - Inventory, stock movements, disbursements

```bash
# Run all migrations
npm run migrate

# The migration system tracks which migrations have run
```

### Seed Data

```bash
npm run seed
```

Creates:
- Admin user
- Test users for each role
- Sample equipment (7 items)
- Sample inventory (10 items)

---

## 🏃 Running the Application

### Development

```bash
# Backend with hot reload
cd backend && npm run dev

# Frontend with HMR
cd frontend && npm run dev
```

### Production

```bash
# Build frontend
cd frontend && npm run build

# Start backend
cd backend && npm start
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

### Endpoints

#### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |
| GET | `/auth/me` | Get current user |

#### Users (Admin/IT_Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List all users |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create user |
| PUT | `/users/:id` | Update user |
| POST | `/users/:id/reset-password` | Reset user password |
| PATCH | `/users/:id/toggle-active` | Toggle user active status |
| DELETE | `/users/:id` | Delete user |

#### Equipment
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/equipment` | List equipment |
| GET | `/equipment/maintenance-due` | Equipment needing maintenance |
| GET | `/equipment/:id` | Get equipment details |
| GET | `/equipment/:id/hours-log` | Get hours log |
| GET | `/equipment/:id/maintenance-log` | Get maintenance log |
| POST | `/equipment` | Create equipment |
| PUT | `/equipment/:id` | Update equipment |
| POST | `/equipment/:id/log-hours` | Log equipment hours |
| POST | `/equipment/:id/maintenance` | Log maintenance |

#### Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/requests` | List all requests |
| GET | `/requests/pending` | Pending requests queue |
| GET | `/requests/my` | Current user's requests |
| GET | `/requests/:id` | Get request details |
| GET | `/requests/:id/history` | Get request history |
| POST | `/requests` | Create request |
| POST | `/requests/:id/approve` | Approve request |
| POST | `/requests/:id/reject` | Reject request |
| POST | `/requests/:id/cancel` | Cancel request |

#### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/jobs` | List all jobs |
| GET | `/jobs/:id` | Get job details |
| POST | `/jobs` | Create job |
| PUT | `/jobs/:id` | Update job |
| PATCH | `/jobs/:id/status` | Update job status |
| POST | `/jobs/:id/team` | Add team member |
| DELETE | `/jobs/:id/team/:userId` | Remove team member |
| POST | `/jobs/:id/equipment` | Add equipment to job |
| POST | `/jobs/:id/inspections` | Add inspection |

#### Safety
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/safety` | List all reports |
| GET | `/safety/my` | Current user's reports |
| GET | `/safety/stats` | Safety statistics |
| GET | `/safety/:id` | Get report details |
| GET | `/safety/:id/history` | Get report history |
| POST | `/safety` | Create report |
| PATCH | `/safety/:id/status` | Update report status |

#### Purchasing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/purchasing/inventory` | List inventory items |
| GET | `/purchasing/inventory/low-stock` | Low stock items |
| GET | `/purchasing/inventory/:id` | Get item details |
| GET | `/purchasing/inventory/:id/movements` | Stock movements |
| POST | `/purchasing/inventory` | Create inventory item |
| PUT | `/purchasing/inventory/:id` | Update item |
| POST | `/purchasing/inventory/:id/add-stock` | Add stock |
| GET | `/purchasing/disbursements` | List disbursements |
| GET | `/purchasing/disbursements/pending` | Pending disbursements |
| POST | `/purchasing/disbursements` | Create disbursement |
| POST | `/purchasing/disbursements/:id/approve` | Approve |
| POST | `/purchasing/disbursements/:id/reject` | Reject |

---

## 👥 User Roles

| Role | Access Level |
|------|--------------|
| `Admin` | Full system access |
| `IT_Admin` | User management, system config |
| `Operations_Manager` | Jobs, equipment, requests approval |
| `Department_Manager` | Department requests approval |
| `Workshop_Manager` | Equipment, maintenance |
| `Safety_Officer` | Safety reports management |
| `Maintenance_Manager` | Maintenance scheduling |
| `Maintenance_Technician` | Maintenance logging |
| `Purchasing_Manager` | Full inventory access |
| `Purchasing_Officer` | Inventory operations |
| `Logistics_Coordinator` | Transport requests |
| `Field_Engineer` | Equipment hours, requests |
| `Operator` | Basic requests |
| `Technician` | Basic requests |

---

## 🔑 Default Credentials

### Admin User
- **Email:** admin@wellfluid.com
- **Password:** admin123

### Test Users (password: `password123`)
| Email | Role | Department |
|-------|------|------------|
| engineer@wellfluid.com | Field_Engineer | Field_Services |
| manager@wellfluid.com | Operations_Manager | Operations |
| safety@wellfluid.com | Safety_Officer | Safety |
| purchasing@wellfluid.com | Purchasing_Manager | Purchasing |
| maintenance@wellfluid.com | Maintenance_Manager | Maintenance |

---

## 🎨 Design System

### Colors
- **Primary:** #FF6B00 (Orange)
- **Secondary:** #8B4513 (Brown)
- **Background:** #F5F7FA
- **Surface:** #FFFFFF
- **Success:** #2ECC71
- **Warning:** #F1C40F
- **Error:** #E74C3C
- **Info:** #3498DB

### Typography
- **Font:** Inter (Google Fonts)
- **Headings:** 600-700 weight
- **Body:** 400-500 weight

---

## 📱 PWA Features

- Installable on desktop and mobile
- Offline capability with service worker
- Background sync for poor connectivity
- App-like experience

---

## 🧪 Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test
```

---

## 📦 Build for Production

```bash
# Build frontend
cd frontend
npm run build
# Output: dist/

# Backend runs directly with Node
cd backend
npm start
```

---

## 📄 License

Proprietary - WellFluid Services Nigeria

---

## 👨‍💻 Support

For technical support, contact the IT department.
