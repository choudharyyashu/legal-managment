# BACKEND API ENDPOINT INVENTORY
## HEUGLY & BLUDWORTH — LEGAL MANAGEMENT SOFTWARE

**Workspace:** `D:\Kiaan\legal-pro`  
**Backend:** `D:\Kiaan\legal-pro\backend`  
**Audit Date:** November 13, 2026  
**Auditor:** Antigravity AI  

---

## 1. INVENTORY OF ACTUAL IMPLEMENTED ENDPOINTS

This table contains all 26 endpoints that actually exist in the Express application code (`backend/src/app.ts` and mounted module routers). No endpoints have been fabricated or assumed.

| Method | Endpoint | Module | Authentication | Required Permission | Implementation Status | Controller / Service Handler |
|:---:|:---|:---:|:---:|:---:|:---:|:---|
| `GET` | `/` | Foundation | None | None | **VERIFIED COMPLETE** | `app.ts` root welcome handler |
| `GET` | `/api/v1/health` | Foundation | None | None | **VERIFIED COMPLETE** | `app.ts` dual DB ping & metrics |
| `POST` | `/api/v1/auth/login` | Authentication | None (Rate Limited) | None | **VERIFIED COMPLETE** | `AuthController.login` |
| `POST` | `/api/v1/auth/refresh` | Authentication | None (Cookie / Body) | None | **VERIFIED COMPLETE** | `AuthController.refresh` |
| `POST` | `/api/v1/auth/logout` | Authentication | None | None | **VERIFIED COMPLETE** | `AuthController.logout` |
| `GET` | `/api/v1/auth/me` | Authentication | `requireAuth` | None | **VERIFIED COMPLETE** | `AuthController.me` |
| `POST` | `/api/v1/auth/forgot-password` | Authentication | None (Rate Limited) | None | **VERIFIED COMPLETE** | `AuthController.forgotPassword` |
| `POST` | `/api/v1/auth/reset-password` | Authentication | None | None | **VERIFIED COMPLETE** | `AuthController.resetPassword` |
| `GET` | `/api/v1/users` | User Governance | `requireAuth` | `users:view` | **VERIFIED COMPLETE** | `UserController.getUsers` |
| `GET` | `/api/v1/users/:id` | User Governance | `requireAuth` | `users:view` | **VERIFIED COMPLETE** | `UserController.getUserById` |
| `POST` | `/api/v1/users` | User Governance | `requireAuth` | `users:manage` | **VERIFIED COMPLETE** | `UserController.createUser` |
| `PUT` | `/api/v1/users/:id` | User Governance | `requireAuth` | `users:manage` | **VERIFIED COMPLETE** | `UserController.updateUser` |
| `PATCH` | `/api/v1/users/:id/status` | User Governance | `requireAuth` | `users:manage` | **VERIFIED COMPLETE** | `UserController.updateStatus` |
| `GET` | `/api/v1/clients` | Client Management | `requireAuth` | `clients:view` | **IMPLEMENTED — NOT VERIFIED** | `ClientController.getClients` |
| `GET` | `/api/v1/clients/:id` | Client Management | `requireAuth` | `clients:view` | **IMPLEMENTED — NOT VERIFIED** | `ClientController.getClientById` |
| `GET` | `/api/v1/clients/:id/matters` | Client Management | `requireAuth` | `clients:view` | **IMPLEMENTED — NOT VERIFIED** | `ClientController.getClientMatters` |
| `POST` | `/api/v1/clients` | Client Management | `requireAuth` | `clients:create` | **IMPLEMENTED — NOT VERIFIED** | `ClientController.createClient` |
| `PUT` | `/api/v1/clients/:id` | Client Management | `requireAuth` | `clients:edit` | **IMPLEMENTED — NOT VERIFIED** | `ClientController.updateClient` |
| `PATCH` | `/api/v1/clients/:id/status` | Client Management | `requireAuth` | `clients:edit` | **IMPLEMENTED — NOT VERIFIED** | `ClientController.updateStatus` |
| `GET` | `/api/v1/matters` | Matter Management | `requireAuth` | `matters:view` | **IMPLEMENTED — NOT VERIFIED** | `MatterController.getMatters` |
| `GET` | `/api/v1/matters/:id` | Matter Management | `requireAuth` | `matters:view` | **IMPLEMENTED — NOT VERIFIED** | `MatterController.getMatterById` |
| `POST` | `/api/v1/matters` | Matter Management | `requireAuth` | `matters:create` | **IMPLEMENTED — NOT VERIFIED** | `MatterController.createMatter` |
| `PUT` | `/api/v1/matters/:id` | Matter Management | `requireAuth` | `matters:edit` | **IMPLEMENTED — NOT VERIFIED** | `MatterController.updateMatter` |
| `PATCH` | `/api/v1/matters/:id/status` | Matter Management | `requireAuth` | `matters:edit` | **IMPLEMENTED — NOT VERIFIED** | `MatterController.updateStatus` |
| `POST` | `/api/v1/matters/:id/staff` | Matter Management | `requireAuth` | `matters:edit` | **IMPLEMENTED — NOT VERIFIED** | `MatterController.assignStaff` |
| `DELETE` | `/api/v1/matters/:id/staff/:userId` | Matter Management | `requireAuth` | `matters:edit` | **IMPLEMENTED — NOT VERIFIED** | `MatterController.removeStaff` |

---

## 2. INVENTORY SUMMARY METRICS

- **Total Implemented Routes:** 26
- **Verified Complete Routes:** 13 (Foundation: 2, Auth: 6, Users: 5)
- **Implemented — Not Verified Routes:** 13 (Clients: 6, Matters: 7)
- **Partially Implemented Routes:** 0
- **Scaffolded Only Routes:** 0
- **Routes Requiring Authentication:** 20 (76.9%)
- **Public Routes:** 6 (23.1%: `/`, `/api/v1/health`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password`)
- **Routes with RBAC Permission Checks:** 18 (69.2%)

---

## 3. MISSING ENDPOINTS BY BUSINESS MODULE

The following documented business endpoints are completely missing from the backend routing architecture:

### 3.1 Intake & Conflict Management (`/api/v1/intakes`) — MISSING
- `GET /api/v1/intakes` (List intakes with conflict status)
- `GET /api/v1/intakes/:id` (Intake detail & questionnaire)
- `POST /api/v1/intakes` (Create prospective intake)
- `PUT /api/v1/intakes/:id` (Update intake record)
- `POST /api/v1/intakes/:id/conflict-check` (Execute Utah RPC 1.7 automated conflict check)
- `POST /api/v1/intakes/:id/clear-conflict` (Formal conflict waiver clearance)
- `POST /api/v1/intakes/:id/convert-client` (Convert intake to active client)
- `POST /api/v1/intakes/:id/convert-matter` (Convert intake directly to active matter)

### 3.2 Tasks & Checklists (`/api/v1/tasks`) — MISSING
- `GET /api/v1/tasks` (List tasks with filters: assignee, matter, status, priority)
- `GET /api/v1/tasks/:id` (Task detail)
- `POST /api/v1/tasks` (Create new task)
- `PUT /api/v1/tasks/:id` (Update task)
- `PATCH /api/v1/tasks/:id/status` (Update status: `Pending`, `In Progress`, `Completed`)
- `DELETE /api/v1/tasks/:id` (Delete task)

### 3.3 Calendar & Docketing (`/api/v1/calendar`) — MISSING
- `GET /api/v1/calendar/events` (List court hearings, deadlines, appointments)
- `GET /api/v1/calendar/events/:id` (Event detail)
- `POST /api/v1/calendar/events` (Schedule court event or hearing)
- `PUT /api/v1/calendar/events/:id` (Reschedule or modify event)
- `DELETE /api/v1/calendar/events/:id` (Cancel event)

### 3.4 Document Management (`/api/v1/documents`) — MISSING
- `GET /api/v1/documents` (List documents with matter/client filter)
- `GET /api/v1/documents/:id` (Document metadata)
- `POST /api/v1/documents/upload` (Multipart file upload to S3 / local vault)
- `GET /api/v1/documents/:id/download` (Download stream or signed URL)
- `POST /api/v1/documents/:id/versions` (Upload new version)
- `DELETE /api/v1/documents/:id` (Soft delete / archive document)

### 3.5 Time Tracking (`/api/v1/time`) — MISSING
- `GET /api/v1/time/entries` (List time entries with filters: user, matter, date range)
- `POST /api/v1/time/entries` (Create billable/non-billable time entry)
- `PUT /api/v1/time/entries/:id` (Update time entry)
- `PATCH /api/v1/time/entries/:id/approve` (Supervisor / partner approval)
- `GET /api/v1/time/suggested-billing` (Passive capture suggested entries queue)

### 3.6 Expenses & Disbursements (`/api/v1/expenses`) — MISSING
- `GET /api/v1/expenses` (List client matter expenses)
- `POST /api/v1/expenses` (Log filing fee, deposition, expert witness cost)
- `PUT /api/v1/expenses/:id` (Update expense)
- `PATCH /api/v1/expenses/:id/approve` (Approve expense for client billing)

### 3.7 Billing, Invoicing & Payments (`/api/v1/billing`) — MISSING
- `GET /api/v1/billing/invoices` (List invoices with status filter)
- `GET /api/v1/billing/invoices/:id` (Invoice detail with line items)
- `POST /api/v1/billing/invoices/generate` (Generate invoice from approved time & expenses)
- `PATCH /api/v1/billing/invoices/:id/status` (Update status: `Draft`, `Issued`, `Paid`, `Void`)
- `POST /api/v1/billing/payments` (Record payment receipt & apply to invoices)

### 3.8 Trust Accounting / IOLTA (`/api/v1/trust`) — MISSING
- `GET /api/v1/trust/accounts` (List firm IOLTA trust accounts)
- `GET /api/v1/trust/ledgers` (List individual client sub-ledgers)
- `POST /api/v1/trust/deposits` (Record client retainer deposit into IOLTA)
- `POST /api/v1/trust/disbursements` (Disburse earned fees to operating account)
- `GET /api/v1/trust/transactions` (Audit log of all trust transactions)

### 3.9 General Ledger & Reconciliation (`/api/v1/accounting`) — MISSING
- `GET /api/v1/accounting/chart-of-accounts` (List 6 chart of accounts)
- `GET /api/v1/accounting/journals` (List general ledger journals)
- `POST /api/v1/accounting/journals` (Post balanced double-entry journal)
- `GET /api/v1/accounting/three-way-reconciliation` (Three-Way Reconciliation engine)
- `POST /api/v1/accounting/three-way-reconciliation` (Submit monthly IOLTA reconciliation report)

### 3.10 Reports & Analytics (`/api/v1/reports`) — MISSING
- `GET /api/v1/reports/dashboard` (Firm-wide operational & financial KPI summary)
- `GET /api/v1/reports/ar-aging` (Accounts receivable aging analysis)
- `GET /api/v1/reports/realization` (Attorney billing realization & collection rate)
