# BACKEND REMAINING WORK ROADMAP & IMPLEMENTATION BLUEPRINT
## Heugly & Bludworth Legal Management Software

**Audit Date:** November 13, 2026  
**Auditor:** Automated Engineering Audit System  
**Standard:** Prioritized Implementation Roadmap (P0 through P7)  

---

## 1. PRIORITY LEVEL P0: CRITICAL BLOCKERS (DATABASE ACTIVATION)

### Task P0.1: Activate Local MySQL Service & Target Database
- **Exact Work Required**: Launch XAMPP MySQL service on port 3306. Verify connection via `mysql2` client. Create database: `CREATE DATABASE \`legal-db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;`.
- **Dependencies**: Host XAMPP installation (`C:\xampp\mysql\bin\mysql.exe`).
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: Live MySQL instance listening on port 3306 with active `legal-db` database.
- **Acceptance Criteria**: Running `npm run db:test` in `backend/` outputs `SUCCESS: Connected to MySQL server!`.

### Task P0.2: Apply Initial Database Migration
- **Exact Work Required**: Execute `npx prisma migrate dev --name init` in `backend/` to apply `backend/prisma/migrations/20261113071216_init/migration.sql` against the live MySQL database.
- **Dependencies**: Task P0.1 (active MySQL instance).
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: All 28 relational tables, indexes, and foreign keys created in MySQL.
- **Acceptance Criteria**: `npx prisma migrate status` outputs `Database schema is up to date!`.

### Task P0.3: Database Seed Script
- **Exact Work Required**: Create `backend/prisma/seed.ts` to populate initial firm roles (`super_admin`, `attorney`, `paralegal`, `billing`, `supervisor`), 45+ role permissions, default practice areas, and seed administrative user.
- **Dependencies**: Task P0.2.
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: `backend/prisma/seed.ts` executed via `npx prisma db seed`.
- **Acceptance Criteria**: Database contains verified super admin and practice area records.

---

## 2. PRIORITY LEVEL P1: AUTHENTICATION & RBAC FOUNDATION

### Task P1.1: Install Authentication Libraries
- **Exact Work Required**: Install `bcryptjs`, `jsonwebtoken`, and their TypeScript definitions (`@types/bcryptjs`, `@types/jsonwebtoken`).
- **Dependencies**: Task P0.2.
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: Dependencies added to `backend/package.json`.
- **Acceptance Criteria**: `backend/package-lock.json` updated with zero version conflicts.

### Task P1.2: Server-Side Authentication Middleware
- **Exact Work Required**: Build `backend/src/middleware/auth.middleware.ts` to intercept HTTP `Authorization: Bearer <token>` headers, verify HMAC-SHA256 signatures, check expiration, and attach decoded user payload to Express `req.user`.
- **Dependencies**: Task P1.1.
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: `requireAuth` Express middleware.
- **Acceptance Criteria**: Unauthenticated requests receive HTTP 401 with standard RFC problem details.

### Task P1.3: Role-Based Authorization Middleware
- **Exact Work Required**: Build `backend/src/middleware/rbac.middleware.ts` (`requirePermission(permissionKey: string)`) to verify that the authenticated user's role possesses the requested permission key in `RolePermission`.
- **Dependencies**: Task P1.2.
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: `requirePermission` Express middleware.
- **Acceptance Criteria**: Unauthorized requests receive HTTP 403 `FORBIDDEN`.

### Task P1.4: Complete Authentication Module
- **Exact Work Required**: Implement `backend/src/modules/auth/`:
  - `auth.routes.ts`: `POST /api/v1/auth/login`, `POST /refresh`, `POST /logout`, `GET /me`.
  - `auth.controller.ts`: Request parsing and response envelopes.
  - `auth.service.ts`: Bcrypt password verification, JWT access token minting (15m), refresh token generation (7d).
  - `auth.validators.ts`: Zod schema for login credentials.
- **Dependencies**: Tasks P1.1, P1.2, P1.3.
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: Fully operational authentication endpoints mounted in `src/app.ts`.
- **Acceptance Criteria**: Valid credentials return JWT access token and user record; invalid credentials return 401.

---

## 3. PRIORITY LEVEL P2: CORE PRACTICE MANAGEMENT APIS

### Task P2.1: Users & Staff Management Module
- **Exact Work Required**: Implement `src/modules/users/` (`GET /api/v1/users`, `POST /users`, `GET /users/:id`, `PATCH /users/:id`, `GET /roles`).
- **Dependencies**: Priority P1.
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: User CRUD endpoints with password hashing and role validation.
- **Acceptance Criteria**: Super Admin can create, deactivate, and assign hourly billing rates to staff.

### Task P2.2: Clients & Contact Management Module
- **Exact Work Required**: Implement `src/modules/clients/` (`GET /api/v1/clients`, `POST /clients`, `GET /clients/:id`, `PATCH /clients/:id`, `DELETE /clients/:id`).
- **Dependencies**: Task P2.1.
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: Client 360° profile endpoints with auto-generating `clientNumber` (`CLI-1001`).
- **Acceptance Criteria**: Client records persist to MySQL with search indexing across name, email, number.

### Task P2.3: Prospective Intake & Conflict Clearance (Utah RPC 1.7)
- **Exact Work Required**: Implement `src/modules/intakes/`:
  - `POST /api/v1/intakes`: Create prospective inquiry with JSON adverse parties.
  - `POST /api/v1/intakes/:id/conflict-check`: Execute adverse party search across existing clients, matters, and previous conflict logs.
  - `POST /api/v1/intakes/:id/clear-conflict`: Record conflict clearance notes and attorney ID.
  - `POST /api/v1/intakes/:id/convert`: Convert cleared intake into active Client and Matter.
- **Dependencies**: Task P2.2.
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: Intake lifecycle endpoints enforcing Utah RPC 1.7 conflict clearance.
- **Acceptance Criteria**: Unconverted intakes cannot create matters without recorded conflict clearance.

### Task P2.4: Matters & Stage Progression Module
- **Exact Work Required**: Implement `src/modules/matters/`:
  - Matter docket CRUD with auto-generated matter number (`25-CV-0101`).
  - `POST /api/v1/matters/:id/advance-stage`: Verify required gatekeeper fields before advancing to next stage.
  - `GET /api/v1/matters/:id/team`: Roster management with `MatterStaffAssignment`.
- **Dependencies**: Task P2.2, Task P2.3.
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: Matter management module with stage history audit logging.
- **Acceptance Criteria**: Stage progression fails if gatekeeper fields are incomplete.

### Task P2.5: Tasks, Deadlines & Calendar Docketing (Utah URCP Rule 6)
- **Exact Work Required**: Implement `src/modules/tasks/` and `src/modules/calendar/`:
  - Task assignments with priority and due date.
  - Court deadline calculation engine factoring Utah judicial holidays and 3-day electronic service additions.
  - Calendar event management for hearings, depositions, and trials.
- **Dependencies**: Task P2.4.
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: Task and court calendar docketing APIs.
- **Acceptance Criteria**: Calculating a 10-day response deadline excludes intermediate weekends per URCP Rule 6.

---

## 4. PRIORITY LEVEL P3: TIME TRACKING, BILLING & INVOICING

### Task P3.1: Billable Time & Passive Capture Module
- **Exact Work Required**: Implement `src/modules/time-tracking/`:
  - Time entry logging (`hours`, `rate`, `amount = hours * rate`, `activityType`).
  - Suggested billing capture queue with attorney approval/rejection endpoints.
- **Dependencies**: Task P2.4.
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: Time entry CRUD and review queue APIs.
- **Acceptance Criteria**: Approved time entries lock and cannot be edited by standard staff.

### Task P3.2: Matter Expenses & Invoicing Module
- **Exact Work Required**: Implement `src/modules/billing/`:
  - Matter expense disbursements (filing fees, deposition transcripts, process servers).
  - Automated invoice generation pulling unbilled approved time entries and expenses.
  - Itemized `InvoiceLineItem` creation and balance tracking.
- **Dependencies**: Task P3.1.
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: Invoicing engine with balance due calculations.
- **Acceptance Criteria**: Invoices correctly compute subtotal, tax, payments applied, and balance due.

### Task P3.3: Payment Allocation Module
- **Exact Work Required**: Implement `POST /api/v1/billing/invoices/:id/payments` allocating receipts to outstanding invoices and updating status to `Paid` or `Partially Paid`.
- **Dependencies**: Task P3.2.
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: Payment recording endpoints with receipt generation.
- **Acceptance Criteria**: Paying full balance due marks invoice `Paid` and updates `paidAt` timestamp.

---

## 5. PRIORITY LEVEL P4: FINANCIAL & IOLTA TRUST ACCOUNTING (Utah RPC 1.15)

### Task P4.1: IOLTA Client Trust Accounting Engine
- **Exact Work Required**: Implement `src/modules/accounting/trust/`:
  - Multi-tenant client trust sub-ledgers.
  - Atomic transactions for retainer deposits, third-party settlements, and earned fee transfers.
  - Strict database transaction (`prisma.$transaction`) enforcing `CHECK (balance >= 0.00)` to prevent individual client sub-ledger deficits.
- **Dependencies**: Task P2.4, Task P3.3.
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: Trust subledger APIs compliant with Utah RPC 1.15.
- **Acceptance Criteria**: Withdrawing more than an individual client's trust balance is blocked with HTTP 409 `DEFICIT_PREVENTION`.

### Task P4.2: Automated Three-Way Reconciliation
- **Exact Work Required**: Implement `POST /api/v1/trust/reconcile` calculating:
  $$\text{Adjusted Bank Balance} = \text{Statement Balance} + \text{Deposits In Transit} - \text{Outstanding Checks}$$
  $$\text{Variance} = \text{Adjusted Bank Balance} - \text{GL Trust Liability} - \sum \text{Client Subledgers}$$
  If $\text{Variance} = 0$, generate verified audit certificate.
- **Dependencies**: Task P4.1.
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: Monthly 3-way reconciliation engine with audit certificate storage.
- **Acceptance Criteria**: Any non-zero variance flags `isBalanced: false` and logs discrepancy details.

---

## 6. PRIORITY LEVEL P5: ADVANCED SPECIALTY MODULES & DOCUMENTS

### Task P5.1: Document Vault with S3 / MinIO
- **Exact Work Required**: Implement `src/modules/documents/` with Multer file upload, S3 presigned URL generation, document versioning (`v1.0`..`v2.0`), and privilege tagging (Utah RPC 1.6).
- **Dependencies**: Task P2.4.
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: Document upload, versioning, and download endpoints.
- **Acceptance Criteria**: Privileged work-product documents cannot be accessed by unauthorized portal roles.

### Task P5.2: Bankruptcy & Immigration Specialty Dockets
- **Exact Work Required**: Add dedicated Prisma models and controllers for Bankruptcy (Form 122 Means-Test, Schedules A–J) and Immigration (USCIS receipt tracking, Form G-28/I-130 sync).
- **Dependencies**: Task P2.4, Task P5.1.
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: Specialty practice API endpoints matching frontend mock datasets.
- **Acceptance Criteria**: Bankruptcy schedule ledgers compute total secured and unsecured debt.

---

## 7. PRIORITY LEVEL P6: FRONTEND API INTEGRATION

### Task P6.1: HTTP Client Layer & Axios Setup
- **Exact Work Required**: In `frontend/`, install `axios`. Create `frontend/src/api/client.js` with `baseURL = http://localhost:5000/api/v1`, `withCredentials = true`, and response interceptor extracting `response.data.data`.
- **Dependencies**: Priority P1.
- **Recommended Developer**: Developer 1 (`Yashwant Choudhary`).
- **Expected Deliverable**: Centralized Axios client with automatic bearer token attachment.
- **Acceptance Criteria**: Interceptor unwraps standardized `{ success, data }` envelopes without breaking frontend array mappings.

### Task P6.2: Migrate Contexts from `mockStorage` to Live APIs
- **Exact Work Required**: Refactor React contexts to call live API endpoints:
  - `AuthContext.jsx` $\rightarrow$ `POST /api/v1/auth/login`
  - `ClientContext.jsx` $\rightarrow$ `GET /api/v1/clients`
  - `MatterContext.jsx` $\rightarrow$ `GET /api/v1/matters`
  - `TaskContext.jsx` $\rightarrow$ `GET /api/v1/tasks`
  - `TimeContext.jsx` $\rightarrow$ `GET /api/v1/time-entries`
- **Dependencies**: Tasks P2.1–P2.5, Task P6.1.
- **Recommended Developer**: Developer 1 (`Yashwant Choudhary`).
- **Expected Deliverable**: React application state populated from live MySQL database.
- **Acceptance Criteria**: Creating a client in the UI persists to MySQL and renders immediately upon browser refresh.

---

## 8. PRIORITY LEVEL P7: AUTOMATED TESTING & PRODUCTION HARDENING

### Task P7.1: Unit & Integration Test Suites
- **Exact Work Required**: Install `vitest` / `jest` and `supertest`. Author unit tests for financial calculations, date engines, and integration tests for all REST endpoints.
- **Dependencies**: Priorities P1–P4.
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: Automated test suite executed via `npm test`.
- **Acceptance Criteria**: Minimum 80% test coverage across financial and auth modules.

### Task P7.2: Production Dockerfile & Deployment Configuration
- **Exact Work Required**: Create multi-stage production `Dockerfile`, `docker-compose.yml` for local stack (MySQL 8.4, Redis, MinIO), and automated database backup script.
- **Dependencies**: Priorities P1–P6.
- **Recommended Developer**: Developer 2 (`prernaverma0502`).
- **Expected Deliverable**: Containerized production deployment configuration.
- **Acceptance Criteria**: Container boots, applies migrations, and passes health check.

