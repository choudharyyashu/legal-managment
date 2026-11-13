# BACKEND REMAINING WORK ROADMAP
## HEUGLY & BLUDWORTH — LEGAL MANAGEMENT SOFTWARE

**Workspace:** `D:\Kiaan\legal-pro`  
**Backend:** `D:\Kiaan\legal-pro\backend`  
**Audit Date:** November 13, 2026  
**Auditor:** Antigravity AI  

---

## 1. STRATEGIC EXECUTION SEQUENCE

The remaining work is organized into four sequential phases based on strict architectural dependencies:

```
[Phase 0 Fixes & Verification] 
         │
         ▼
[Phase 1A: Practice Operations APIs] (Intake, Tasks, Calendar, Documents)
         │
         ▼
[Phase 1B: Financial & Billing APIs] (Time, Expenses, Invoicing, Trust Accounting, Ledger)
         │
         ▼
[Phase 2: Frontend-Backend Integration] (API Client, Interceptors, Contexts)
         │
         ▼
[Phase 3: Production Hardening & E2E Verification]
```

---

## 2. PHASE 0 — IMMEDIATE REMEDIATION & VERIFICATION UNLOCK (PRIORITY: IMMEDIATE)

Before implementing any new business endpoints, the existing codebase defects and test isolation gaps must be resolved:

### Task 0.1: Repair Corrupted `backend/package.json`
- **Problem:** Git conflict markers (`<<<<<<< HEAD`, `=======`, `>>>>>>>`) at lines 22-27 cause invalid JSON syntax, crashing `npm` and `prisma validate`.
- **Action Required:** Remove conflict markers, leaving valid JSON:
  ```json
  "test:clients": "tsx src/tests/client-api-test-suite.ts",
  "test:matters": "tsx src/tests/matter-api-test-suite.ts",
  "prisma:deploy": "prisma migrate deploy"
  ```
- **Estimated Effort:** 5 minutes.

### Task 0.2: Add Test Isolation Guards to Client & Matter Test Suites
- **Problem:** `client-api-test-suite.ts` and `matter-api-test-suite.ts` currently target `legal-db` without the test isolation guard, which risks corrupting primary data.
- **Action Required:** Add the `TEST_DATABASE_URL` runtime guard and teardown logic (identical to `foundation-db-test-suite.ts` and `auth-rbac-test-suite.ts`) so they run exclusively against `legal-db-test`.
- **Verification:** Execute `npm run test:clients` (14 tests) and `npm run test:matters` (23 tests) against `legal-db-test` and verify 37/37 pass.
- **Estimated Effort:** 30 minutes.

---

## 3. PHASE 1A — PRACTICE OPERATIONS MODULES (PRIORITY: HIGH)

These modules depend directly on the existing `clients` and `matters` database records.

### Module 1: Intake & Conflict Clearance (`/api/v1/intakes`)
- **Dependencies:** `clients`, `matters`, `users`, `practice_areas`.
- **Scope:**
  - Create `src/modules/intakes/` (types, validation, service, controller, routes).
  - Implement automated Utah RPC 1.7 conflict search matching adverse parties against existing clients and matters.
  - Conflict waiver clearance workflow.
  - One-click intake-to-client and intake-to-matter conversion.
- **Automated Tests Required:** 15 test cases.

### Module 2: Tasks & Checklists (`/api/v1/tasks`)
- **Dependencies:** `matters`, `users`.
- **Scope:**
  - Create `src/modules/tasks/` (types, validation, service, controller, routes).
  - Task CRUD, priority assignment, due dates, reminder notifications.
  - Practice-area workflow checklist generation linked to matter workflow stages.
- **Automated Tests Required:** 12 test cases.

### Module 3: Calendar & Docketing (`/api/v1/calendar`)
- **Dependencies:** `matters`, `users`.
- **Scope:**
  - Create `src/modules/calendar/` (types, validation, service, controller, routes).
  - Hearing and court appearance scheduling, statute of limitations deadline tracking.
  - Attendee association and conflict-free calendar queries.
- **Automated Tests Required:** 10 test cases.

### Module 4: Document Vault & Storage Engine (`/api/v1/documents`)
- **Dependencies:** `matters`, `clients`, `users`.
- **Scope:**
  - Create `src/modules/documents/` (types, validation, service, controller, routes).
  - Integrate Multer for multipart file streams.
  - S3 / MinIO storage adapter with local filesystem fallback.
  - Document versioning, metadata extraction, access permission validation.
- **Automated Tests Required:** 12 test cases.

---

## 4. PHASE 1B — FINANCIAL, BILLING & TRUST ACCOUNTING (PRIORITY: CRITICAL)

Financial accuracy and Utah State Bar compliance require strict atomic transactions.

### Module 5: Time Tracking & Passive Capture (`/api/v1/time`)
- **Dependencies:** `matters`, `users`.
- **Scope:**
  - Create `src/modules/time/` (types, validation, service, controller, routes).
  - Billable/non-billable time entry logging with attorney billing rate snapshots.
  - Daily time review and partner approval queues.
  - Passive capture queue for suggested billing entries.
- **Automated Tests Required:** 14 test cases.

### Module 6: Expenses & Disbursements (`/api/v1/expenses`)
- **Dependencies:** `matters`, `users`.
- **Scope:**
  - Create `src/modules/expenses/` (types, validation, service, controller, routes).
  - Expense logging (court fees, filing costs, depositions, mileage).
  - Matter association, client reimbursement flags, approval gates.
- **Automated Tests Required:** 10 test cases.

### Module 7: Invoicing, Payments & Accounts Receivable (`/api/v1/billing`)
- **Dependencies:** `matters`, `clients`, `time_entries`, `expenses`.
- **Scope:**
  - Create `src/modules/billing/` (types, validation, service, controller, routes).
  - Batch invoice generation pulling unbilled time and approved expenses.
  - Strict `DECIMAL(12,2)` calculations for line items, taxes, adjustments, and balance due.
  - Payment recording and invoice allocation.
- **Automated Tests Required:** 18 test cases.

### Module 8: Trust Accounting / IOLTA Compliance (`/api/v1/trust`)
- **Dependencies:** `clients`, `matters`, `chart_of_accounts`.
- **Scope:**
  - Create `src/modules/trust/` (types, validation, service, controller, routes).
  - Client trust sub-ledger balances, retainer deposit logging into IOLTA (Account 1010).
  - Earned fee disbursements transferring funds from Trust to Operating (Account 1000).
  - Utah RPC 1.15 compliance safeguards: absolute negative balance prevention.
- **Automated Tests Required:** 16 test cases.

### Module 9: General Ledger & Three-Way Reconciliation (`/api/v1/accounting`)
- **Dependencies:** `chart_of_accounts`, `trust_sub_ledgers`, `invoices`, `payments`.
- **Scope:**
  - Create `src/modules/accounting/` (types, validation, service, controller, routes).
  - Double-entry journal posting with balanced debit/credit validation.
  - Three-Way Reconciliation engine comparing:
    1. Bank statement balance
    2. Trust ledger balance (Account 1010)
    3. Sum of all individual client trust sub-ledgers
- **Automated Tests Required:** 14 test cases.

### Module 10: Reports & Executive Dashboard (`/api/v1/reports`)
- **Dependencies:** All operational tables.
- **Scope:**
  - Create `src/modules/reports/` (types, validation, service, controller, routes).
  - Real-time dashboard KPI summaries (Active Matters, Unbilled Time, AR Aging, Trust Balance).
  - Utilization and realization rate reports by attorney.
- **Automated Tests Required:** 8 test cases.

---

## 5. PHASE 2 — FRONTEND-BACKEND INTEGRATION (PRIORITY: HIGH)

### Step 2.1: Implement Centralized API Client
- Create `frontend/src/api/client.js` using Axios or Fetch.
- Configure `baseURL`, credentials (`cookies: true`), authorization header interceptors, and 401 refresh token retry interceptors.

### Step 2.2: Migrate Context Providers from Mock to Live
- `AuthContext.jsx`: Connect to `/api/v1/auth/login`, `/api/v1/auth/me`, `/api/v1/auth/logout`.
- `ClientContext.jsx`: Connect to `/api/v1/clients`.
- `MatterContext.jsx`: Connect to `/api/v1/matters`.
- `TaskContext.jsx`: Connect to `/api/v1/tasks`.
- `TimeContext.jsx`: Connect to `/api/v1/time`.

### Step 2.3: Remove Mock Storage and Datasets
- Deprecate `frontend/src/services/mockStorage.js` and eliminate static files in `frontend/src/data/mock*.js`.

---

## 6. PHASE 3 — PRODUCTION HARDENING & SYSTEM AUDIT (PRIORITY: MEDIUM)

1. **Security Audit:** Run automated vulnerability scans and test for SQL injection, CSRF, and token tampering.
2. **Performance Benchmarking:** Verify database query performance on indexed foreign keys under 1,000+ simulated concurrent requests.
3. **Automated CI/CD Test Pipeline:** Combine all test suites into an integrated runner executing against `legal-db-test`.
