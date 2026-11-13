# 13 – CONTROLLED 12-PHASE IMPLEMENTATION ROADMAP

**Firm Name:** Heugly & Bludworth, Attorneys at Law  
**Implementation Methodology:** Incremental, Test-Driven & Verified Pre-Integration  
**Execution Standard:** Zero Production Regression, Zero Unmigrated Data

---

## 1. Roadmap Overview & Timeline Phasing

```mermaid
gantt
    title Heugly & Bludworth Backend Engineering Roadmap
    dateFormat  YYYY-MM-DD
    section Foundation & Identity
    Phase 1: Project Setup & Tooling           :p1, 2026-11-15, 3d
    Phase 2: Database Schema & Migrations       :p2, after p1, 4d
    Phase 3: Authentication & RBAC Engine      :p3, after p2, 4d
    section Core Legal Practice
    Phase 4: Clients & Matters Dockets         :p4, after p3, 5d
    Phase 5: Intake & Conflict Clearance (RPC 1.7) :p5, after p4, 3d
    Phase 6: Tasks, Docketing & URCP Rule 6    :p6, after p5, 4d
    section Financials & Escrow
    Phase 7: Time Tracking & Invoicing         :p7, after p6, 5d
    Phase 8: Trust Accounting & 3-Way Reconcile :p8, after p7, 6d
    section Vault & Substantive Practice
    Phase 9: Document Vault & OCR Pipeline     :p9, after p8, 4d
    Phase 10: Specialty Practice Dockets       :p10, after p9, 6d
    section Reporting & Production
    Phase 11: Reports, Settings & Integrations :p11, after p10, 4d
    Phase 12: Frontend Cutover & E2E Verification :p12, after p11, 5d
```

---

## 2. Detailed Phase Specifications

### Phase 1: Backend Project Setup & Infrastructure Scaffolding
- **Objective**: Establish the TypeScript Node.js runtime, ESLint/Prettier, Docker development containers, and health check.
- **Files to Create**:
  - `backend/package.json`, `backend/tsconfig.json`
  - `backend/Dockerfile`, `backend/docker-compose.yml`
  - `backend/src/server.ts`, `backend/src/app.ts`
  - `backend/src/config/env.ts`
- **Dependencies**: `express`, `typescript`, `zod`, `dotenv`, `cors`, `helmet`, `pino`
- **APIs Implemented**: `GET /api/v1/health`
- **Database Tables**: None (Infrastructure baseline)
- **Frontend Pages Affected**: None
- **Testing Requirements**: Container spins up; `GET /api/v1/health` returns `200 OK`.
- **Completion Criteria**: Clean build via `npm run build`; Docker Compose provisions MySQL 8.4 LTS and Redis 7.

---

### Phase 2: Database Schema & Migrations
- **Objective**: Implement the complete Prisma schema, generate SQL migrations, and execute the database seed.
- **Files to Create**:
  - `backend/prisma/schema.prisma`
  - `backend/prisma/seed.ts`
  - `backend/src/config/database.ts`
- **Dependencies**: `prisma`, `@prisma/client`
- **APIs Implemented**: Database seed script populating 5 firm roles, 6 mock users, and 9 practice areas.
- **Database Tables**: All 25+ relational tables created in MySQL 8.4 LTS.
- **Frontend Pages Affected**: None
- **Testing Requirements**: Schema migration passes idempotently; all foreign key check constraints verified.
- **Completion Criteria**: `npx prisma migrate dev` executes with 0 errors; database populated with firm seed.

---

### Phase 3: Authentication & RBAC Engine
- **Objective**: Deliver secure JWT login, refresh cookies, 5-role RBAC, and ethical wall middleware.
- **Files to Create**:
  - `src/modules/auth/*` (controller, service, routes, validators)
  - `src/modules/users/*` (controller, service, routes, validators)
  - `src/common/middleware/auth.middleware.ts`, `permission.middleware.ts`, `ethical-wall.middleware.ts`
- **Dependencies**: `jsonwebtoken`, `bcryptjs`, `otplib`, `cookie-parser`
- **APIs Implemented**:
  - `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`
  - `GET /api/v1/users`, `POST /api/v1/users`, `PATCH /api/v1/users/:id/status`
- **Database Tables**: `users`, `roles`, `role_permissions`, `audit_logs`
- **Frontend Pages Affected**: `Login.jsx`, `UserManagement.jsx`, `RolesPermissions.jsx`
- **Testing Requirements**: Inactive user login returns `403 Forbidden`; password hash verified at 12 rounds.
- **Completion Criteria**: JWT bearer authentication verified with automated unit and integration tests.

---

### Phase 4: Clients & Matters Dockets
- **Objective**: Implement 360° client management and litigation matter dockets.
- **Files to Create**:
  - `src/modules/clients/*`
  - `src/modules/matters/*`
- **Dependencies**: `@prisma/client`, `zod`
- **APIs Implemented**:
  - `GET /api/v1/clients`, `POST /api/v1/clients`, `GET /api/v1/clients/:id`, `PUT /api/v1/clients/:id`
  - `GET /api/v1/matters`, `POST /api/v1/matters`, `GET /api/v1/matters/:id`, `PATCH /api/v1/matters/:id/stage`
- **Database Tables**: `clients`, `matters`, `matter_staff_assignments`, `workflow_stages`
- **Frontend Pages Affected**: `ClientsList.jsx`, `ClientDetails.jsx`, `MattersList.jsx`, `MatterDetails.jsx`
- **Testing Requirements**: Ethical wall blocks unassigned attorney from matter details; pagination math verified.
- **Completion Criteria**: Client-to-matter creation verified; stage gatekeeper validation enforced.

---

### Phase 5: Intake & Conflict Clearance (Utah RPC 1.7)
- **Objective**: Deliver prospective intake screening, adverse party search, and conversion.
- **Files to Create**:
  - `src/modules/intakes/*`
- **Dependencies**: `zod`
- **APIs Implemented**:
  - `GET /api/v1/intakes`, `POST /api/v1/intakes`
  - `POST /api/v1/intakes/search-conflicts`
  - `PATCH /api/v1/intakes/:id/conflict`
  - `POST /api/v1/intakes/:id/convert`
- **Database Tables**: `intakes`, `conflict_search_logs`
- **Frontend Pages Affected**: `IntakeList.jsx`, `ConflictSearchModal.jsx`
- **Testing Requirements**: Conversion blocked if conflict status is `'Not Started'` or `'Conflict Identified'`.
- **Completion Criteria**: Conversion creates client and matter in a single atomic transaction.

---

### Phase 6: Tasks, Docketing & Calendar (URCP Rule 6)
- **Objective**: Deliver task assignments, team workloads, firm calendar, and statutory court deadline computation.
- **Files to Create**:
  - `src/modules/tasks/*`
  - `src/common/utils/urcpDeadlineCalculator.ts`
- **Dependencies**: `zod`
- **APIs Implemented**:
  - `GET /api/v1/tasks/mine`, `GET /api/v1/tasks/team`, `POST /api/v1/tasks`, `PATCH /api/v1/tasks/:id/status`
  - `GET /api/v1/calendar/events`, `POST /api/v1/calendar/events`
  - `POST /api/v1/deadlines/calculate-urcp`
- **Database Tables**: `tasks`, `calendar_events`
- **Frontend Pages Affected**: `MyTasks.jsx`, `TeamTasks.jsx`, `CalendarPage.jsx`, `CourtDeadlines.jsx`
- **Testing Requirements**: URCP Rule 6 properly excludes intermediate weekends/holidays for periods under 11 days.
- **Completion Criteria**: Task completion updates `completedAt` timestamp; deadlines populate calendar.

---

### Phase 7: Time Tracking, Passive Capture & Invoicing
- **Objective**: Deliver daily time logging, mountain-time suggested billing queues, approval workflows, and invoices.
- **Files to Create**:
  - `src/modules/time-tracking/*`
  - `src/modules/billing/*`
- **Dependencies**: `zod`, `bullmq`
- **APIs Implemented**:
  - `POST /api/v1/time-entries`, `GET /api/v1/time-entries/suggested`
  - `POST /api/v1/time-entries/approvals/batch`, `PATCH /api/v1/time-entries/:id/reject`
  - `GET /api/v1/invoices`, `POST /api/v1/invoices`, `POST /api/v1/payments`
- **Database Tables**: `time_entries`, `suggested_billing_captures`, `expenses`, `invoices`, `invoice_line_items`
- **Frontend Pages Affected**: `TimeTracking.jsx`, `SuggestedBilling.jsx`, `TimeApprovals.jsx`, `InvoicesList.jsx`
- **Testing Requirements**: Deduplication engine discards duplicate `sourceIdentifier`; invoice locks billed entries.
- **Completion Criteria**: Hourly billing computed with decimal precision; draft invoices compile line items.

---

### Phase 8: Trust Accounting & 3-Way Reconciliation (Utah RPC 1.15)
- **Objective**: Deliver autonomous IOLTA trust sub-ledgers, general ledger journals, and 3-way reconciliation ($0 variance).
- **Files to Create**:
  - `src/modules/accounting/*`
  - `src/modules/accounting/reconciliation.engine.ts`
- **Dependencies**: `zod`
- **APIs Implemented**:
  - `GET /api/v1/accounting/trust/ledgers`, `POST /api/v1/accounting/trust/transactions`
  - `GET /api/v1/accounting/general-ledger`, `POST /api/v1/accounting/general-ledger/journals`
  - `GET /api/v1/accounting/reconcile/:month`, `POST /api/v1/accounting/reconcile/certificate`
- **Database Tables**: `trust_sub_ledgers`, `trust_transactions`, `chart_of_accounts`, `general_ledger_entries`, `three_way_reconciliations`
- **Frontend Pages Affected**: `TrustAccount.jsx`, `OperatingAccount.jsx`, `GeneralLedgerView.jsx`, `ThreeWayReconciliation.jsx`
- **Testing Requirements**: Trust balance check constraint prevents negative balances; reconciliation variance $> 0$ blocks certificate.
- **Completion Criteria**: $0 variance certified across Bank Statement, GL Account 2100, and Client Sub-Ledgers.

---

### Phase 9: Document Vault & OCR Pipeline
- **Objective**: Deliver S3-compatible document storage, versioning, Bates numbering, and asynchronous OCR.
- **Files to Create**:
  - `src/modules/documents/*`
  - `src/jobs/workers/ocr.worker.ts`
- **Dependencies**: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `pdf-parse`, `tesseract.js`
- **APIs Implemented**:
  - `POST /api/v1/documents/presigned-upload`, `POST /api/v1/documents/confirm-upload`
  - `GET /api/v1/documents/:id/download`, `POST /api/v1/documents/bates-stamp`
- **Database Tables**: `documents`, `document_versions`
- **Frontend Pages Affected**: `DocumentsList.jsx`, `ClientPortalPreview.jsx`
- **Testing Requirements**: Privileged documents excluded from portal endpoints; OCR text indexed in MySQL.
- **Completion Criteria**: Files stream directly to S3; OCR search query returns matching documents.

---

### Phase 10: Specialty Practice Area Dockets
- **Objective**: Deliver domain engines for Personal Injury, Bankruptcy, Immigration, Civil Litigation, Probate, Family, Criminal, Appeals, and Evictions.
- **Files to Create**:
  - `src/modules/specialty-practices/*` (9 sub-packages)
- **Dependencies**: `zod`
- **APIs Implemented**: All specialty endpoints detailed in [05-API-SPECIFICATION.md](./05-API-SPECIFICATION.md).
- **Database Tables**: Specialty tables (`personal_injury_dockets`, `bankruptcy_dockets`, `immigration_dockets`, etc.)
- **Frontend Pages Affected**: All 9 practice area workspace dashboards and forms.
- **Testing Requirements**: Means-test properly evaluates Utah median income; multi-form updates sync across G-28/I-130/I-485.
- **Completion Criteria**: Substantive workflows execute independently of external commercial SaaS subscriptions.

---

### Phase 11: Reports, Settings & Cloud Integrations
- **Objective**: Deliver staff realization reports, AR aging, Microsoft Graph email bridge, and CosmoLex export.
- **Files to Create**:
  - `src/modules/reports/*`
  - `src/modules/settings/*`
  - `src/modules/communications/*`
- **Dependencies**: `@microsoft/microsoft-graph-client`
- **APIs Implemented**:
  - `GET /api/v1/reports/staff`, `GET /api/v1/reports/matters`, `GET /api/v1/reports/financial`
  - `POST /api/v1/integrations/cosmolex/export`
  - `GET /api/v1/audit-logs`
- **Database Tables**: `audit_logs`, `communications`, `unmatched_communications`
- **Frontend Pages Affected**: `StaffReports.jsx`, `MatterReports.jsx`, `FinancialReports.jsx`, `ComplianceMatrix.jsx`
- **Testing Requirements**: LEDES 1998B format validator passes; audit log tampering triggers SQL exception.
- **Completion Criteria**: Compliance matrix reports 100% test pass; CosmoLex batch exported with sync reference.

---

### Phase 12: Frontend Integration, E2E Verification & Handover
- **Objective**: Connect the existing React 18 frontend to the backend API, retiring `mockStorage`.
- **Files to Create / Modify**:
  - `frontend/src/services/api/apiClient.js`
  - Update React contexts to invoke live API service layer
- **Dependencies**: `axios`
- **Testing Requirements**: Full End-to-End Cypress / Playwright user journeys matching all Phase 1 audit flows.
- **Completion Criteria**: Zero console errors; 100% of frontend forms, tables, and modals interact with the production backend.

