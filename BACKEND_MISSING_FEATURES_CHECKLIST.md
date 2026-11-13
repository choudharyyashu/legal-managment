# BACKEND MISSING FEATURES CHECKLIST & IMPLEMENTATION BLUEPRINT
## Heugly & Bludworth Legal Management Software

**Audit Date:** November 13, 2026  
**Auditor:** Automated Engineering Audit System  
**Standard:** Prioritized Actionable Checklist for Remaining Work  

---

## 1. MODULE: AUTHENTICATION & RBAC (PRIORITY: CRITICAL)

- **Feature Name**: JWT Authentication & Role-Based Access Control
- **Current Status**: `MISSING`
- **What is Already Developed**: `User`, `Role`, `RolePermission` models exist in MySQL. Placeholder secrets exist in `backend/.env`.
- **What is Missing**:
  - `bcryptjs` password hashing and salting.
  - `jsonwebtoken` access token (15m) and refresh token (7d) minting.
  - Express authentication middleware (`requireAuth`).
  - Express authorization middleware (`requirePermission(key)`).
  - Routes: `POST /api/v1/auth/login`, `POST /refresh`, `POST /logout`, `GET /me`.
- **Required Files**:
  - `src/middleware/auth.middleware.ts`
  - `src/middleware/rbac.middleware.ts`
  - `src/modules/auth/auth.routes.ts`
  - `src/modules/auth/auth.controller.ts`
  - `src/modules/auth/auth.service.ts`
  - `src/modules/auth/auth.validators.ts`
- **Dependencies**: `npm i bcryptjs jsonwebtoken && npm i -D @types/bcryptjs @types/jsonwebtoken`.
- **Acceptance Criteria**: Sending valid email/password returns 200 with JWT access token; protected endpoints return 401 without token, or 403 without role permission.

---

## 2. MODULE: USERS & STAFF MANAGEMENT (PRIORITY: CRITICAL)

- **Feature Name**: Firm Personnel & Hourly Rate Administration
- **Current Status**: `MISSING`
- **What is Already Developed**: Table `users` exists with `billing_rate`, `role`, and status fields.
- **What is Missing**: User CRUD endpoints, rate modification audits, account activation/deactivation.
- **Required Files**:
  - `src/modules/users/user.routes.ts`
  - `src/modules/users/user.controller.ts`
  - `src/modules/users/user.service.ts`
  - `src/modules/users/user.validators.ts`
- **Dependencies**: Authentication module.
- **Acceptance Criteria**: Super Admin can create new staff, update billing rates, and deactivate accounts; deactivated accounts are blocked from login.

---

## 3. MODULE: CLIENTS & CONTACTS (PRIORITY: CRITICAL)

- **Feature Name**: 360° Client Profile & Directory
- **Current Status**: `MISSING`
- **What is Already Developed**: Table `clients` exists with unique `client_number` and search indexes.
- **What is Missing**: Auto-generating client numbers (`CLI-1001`), client CRUD, conflict search linking, assigned attorney updates.
- **Required Files**:
  - `src/modules/clients/client.routes.ts`
  - `src/modules/clients/client.controller.ts`
  - `src/modules/clients/client.service.ts`
  - `src/modules/clients/client.validators.ts`
- **Dependencies**: Users module.
- **Acceptance Criteria**: Clients can be created, paginated, filtered by status, and searched by name/email/number.

---

## 4. MODULE: INTAKE & CONFLICT CLEARANCE (PRIORITY: CRITICAL)

- **Feature Name**: Utah RPC 1.7 Conflict Clearance & Prospective Screening
- **Current Status**: `MISSING`
- **What is Already Developed**: Tables `intakes` and `conflict_search_logs` exist live in MySQL.
- **What is Missing**: Adverse party search algorithm across clients, matters, and conflict logs; conflict clearance certification; conversion to active client.
- **Required Files**:
  - `src/modules/intakes/intake.routes.ts`
  - `src/modules/intakes/intake.controller.ts`
  - `src/modules/intakes/intake.service.ts`
  - `src/modules/intakes/intake.validators.ts`
- **Dependencies**: Clients and Users modules.
- **Acceptance Criteria**: Inquiries cannot be converted into active clients without a recorded conflict clearance note and attorney ID.

---

## 5. MODULE: MATTERS & STAGE WORKFLOWS (PRIORITY: CRITICAL)

- **Feature Name**: Legal Matter Docket & Filevine-Style Progression Engine
- **Current Status**: `MISSING`
- **What is Already Developed**: Tables `matters`, `practice_areas`, `matter_staff_assignments`, `workflow_stages`, and `matter_stage_histories` exist in MySQL.
- **What is Missing**: Auto-generating matter numbers (`25-CV-0101`), stage advancement gatekeeper validation, staff assignments, ethical wall enforcement.
- **Required Files**:
  - `src/modules/matters/matter.routes.ts`
  - `src/modules/matters/matter.controller.ts`
  - `src/modules/matters/matter.service.ts`
  - `src/modules/matters/matter.validators.ts`
- **Dependencies**: Clients and Users modules.
- **Acceptance Criteria**: Stage progression verifies that required gatekeeper fields are filled; matter access is restricted to assigned staff.

---

## 6. MODULE: TASKS & COURT DOCKETING (PRIORITY: HIGH)

- **Feature Name**: Task Checklists & Utah URCP Rule 6 Deadline Calculator
- **Current Status**: `MISSING`
- **What is Already Developed**: Tables `tasks` and `calendar_events` exist in MySQL.
- **What is Missing**: Business-day calculation excluding intermediate weekends and Utah legal holidays; recurring task checklists; court hearing docketing.
- **Required Files**:
  - `src/modules/tasks/task.routes.ts`, `task.controller.ts`, `task.service.ts`
  - `src/modules/calendar/calendar.routes.ts`, `calendar.controller.ts`, `calendar.service.ts`
- **Dependencies**: Matters module.
- **Acceptance Criteria**: Deadlines under 11 days correctly skip intermediate weekends per Utah URCP Rule 6.

---

## 7. MODULE: TIME TRACKING & BILLING (PRIORITY: HIGH)

- **Feature Name**: Billable Time Ledger, Passive Capture & Invoice Generation
- **Current Status**: `MISSING`
- **What is Already Developed**: Tables `time_entries`, `suggested_billing_captures`, `expenses`, `invoices`, `invoice_line_items`, and `payment_records` exist in MySQL.
- **What is Missing**: Time approval workflows, unbilled item aggregation, automated invoice compilation, payment balance reduction.
- **Required Files**:
  - `src/modules/time-tracking/time.routes.ts`, `time.controller.ts`, `time.service.ts`
  - `src/modules/billing/billing.routes.ts`, `billing.controller.ts`, `billing.service.ts`
- **Dependencies**: Matters and Users modules.
- **Acceptance Criteria**: Invoices correctly compile approved unbilled time and expenses; applying payments updates balance due and marked status.

---

## 8. MODULE: IOLTA TRUST ACCOUNTING (PRIORITY: HIGH)

- **Feature Name**: Utah RPC 1.15 Anti-Commingling & 3-Way Reconciliation
- **Current Status**: `MISSING`
- **What is Already Developed**: Tables `trust_sub_ledgers`, `trust_transactions`, and `three_way_reconciliations` exist in MySQL.
- **What is Missing**: Negative balance prevention guards, atomic transfers to operating accounts, monthly 3-way reconciliation balancing engine.
- **Required Files**:
  - `src/modules/accounting/trust.routes.ts`
  - `src/modules/accounting/trust.controller.ts`
  - `src/modules/accounting/trust.service.ts`
- **Dependencies**: Billing and Matters modules.
- **Acceptance Criteria**: Attempted disbursements exceeding an individual client's trust sub-ledger balance fail with HTTP 409 `DEFICIT_PREVENTION`.

---

## 9. MODULE: FRONTEND API CLIENT INTEGRATION (PRIORITY: HIGH)

- **Feature Name**: Live Axios API Layer Replacing `mockStorage`
- **Current Status**: `MISSING`
- **What is Already Developed**: Full React 18 UI with 15 functional modules in `frontend/`.
- **What is Missing**: Centralized Axios client (`frontend/src/api/client.js`), domain API services, refactoring 5 React contexts to fetch from live endpoints.
- **Required Files**:
  - `frontend/src/api/client.js`
  - `frontend/src/api/auth.api.js`, `clients.api.js`, `matters.api.js`, `tasks.api.js`
- **Dependencies**: Backend Authentication and Core APIs.
- **Acceptance Criteria**: Logging in and creating clients in the UI persists to MySQL and reloads live upon page refresh.

