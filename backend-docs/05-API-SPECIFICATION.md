# 05 – COMPLETE RESTful API SPECIFICATION (/api/v1)

**Firm Name:** Heugly & Bludworth, Attorneys at Law  
**Protocol:** HTTPS / RESTful JSON  
**Base Path:** `/api/v1`  
**Authentication Standard:** Bearer JWT in `Authorization` header (`Bearer <access_token>`)  
**Standard Error Envelope:** `{ "success": false, "error": { "code": string, "message": string, "details": any } }`

---

## 1. Global Response Standards & Status Codes

| HTTP Status | Semantics | Scenario in System |
| :--- | :--- | :--- |
| **`200 OK`** | Request succeeded | Successful GET, PUT, or PATCH operation. |
| **`201 Created`** | Resource instantiated | Successful POST creating a client, matter, task, or time entry. |
| **`204 No Content`** | Operation completed | Successful deletion of a draft record. |
| **`400 Bad Request`** | Malformed syntax / validation error | Zod schema validation failure or unparseable JSON payload. |
| **`401 Unauthorized`** | Missing or invalid authentication | Missing JWT access token, expired signature, or blacklisted token. |
| **`403 Forbidden`** | Insufficient capability or ethical wall | User lacks granular permission (e.g. paralegal accessing `/settings/security`), or attorney is ethically walled from matter. |
| **`404 Not Found`** | Resource missing | Entity ID does not exist in the active firm database. |
| **`409 Conflict`** | Business rule conflict | Adverse party conflict detected, duplicate invoice number, or non-zero 3-way reconciliation variance. |
| **`422 Unprocessable`** | Semantic violation | Negative trust balance attempt, unearned retainer drawdown exceeding available balance. |
| **`500 Internal Error`**| Unexpected failure | Uncaught exception logged with request UUID. |

---

## 2. Authentication & User Management Endpoints

### `POST /api/v1/auth/login`
- **Purpose**: Authenticates firm personnel and establishes user session.
- **Auth**: Public
- **Permission**: None
- **Request Body**:
```json
{
  "email": "e.heugly@utahslawyers.com",
  "password": "FirmPassword123!"
}
```
- **Validation**: Email must be valid format; password non-empty string.
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "c1f7a8b2-6d3e-4b9a-8c1f-2e3d4a5b6c7d",
      "userCode": "usr-1",
      "name": "Eleanor Heugly, Esq.",
      "email": "e.heugly@utahslawyers.com",
      "role": "super_admin",
      "title": "Managing Partner",
      "initials": "EH",
      "billingRate": 550.00,
      "status": "Active"
    },
    "permissions": ["dashboard:view", "clients:create", "matters:manage", "trust:reconcile"]
  }
}
```
- **Error Response (`403 Forbidden`)**:
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_INACTIVE",
    "message": "Account has been deactivated by firm Super Admin. Workstation login is blocked."
  }
}
```

### `POST /api/v1/auth/refresh`
- **Purpose**: Issues a new short-lived access token using `HttpOnly` refresh cookie.
- **Auth**: Refresh Token Cookie
- **Success Response (`200 OK`)**: `{ "success": true, "accessToken": "..." }`

### `POST /api/v1/auth/logout`
- **Purpose**: Revokes refresh token in Redis blacklist and clears cookie.
- **Auth**: Authenticated
- **Success Response (`200 OK`)**: `{ "success": true, "message": "Session terminated." }`

### `GET /api/v1/users`
- **Purpose**: Lists all active and inactive firm personnel.
- **Auth**: Bearer Token
- **Permission**: `users:view` (`super_admin`, `supervisor`)
- **Query Params**: `role`, `status`, `search`, `page`, `limit`
- **Success Response (`200 OK`)**: Returns array of user profiles with billing rates.

### `POST /api/v1/users`
- **Purpose**: Provisions new firm user account with billing rate and role.
- **Auth**: Bearer Token
- **Permission**: `users:manage` (`super_admin` only)
- **Request Body**:
```json
{
  "name": "David Sterling, Esq.",
  "email": "d.sterling@utahslawyers.com",
  "phone": "(801) 555-0106",
  "role": "supervisor",
  "title": "Practice Supervisor & Of Counsel",
  "department": "Supervisory Review",
  "billingRate": 475.00,
  "status": "Active"
}
```
- **Success Response (`201 Created`)**: Returns created user entity.

---

## 3. Clients & Intake Endpoints

### `GET /api/v1/clients`
- **Purpose**: Retrieves paginated list of firm clients with search, status, and attorney filters.
- **Auth**: Bearer Token
- **Permission**: `clients:view`
- **Query Params**: `search`, `status`, `attorneyId`, `page`, `pageSize`, `sortBy`, `sortDir`
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "clientNumber": "CLI-1001",
      "name": "Wasatch Mountain Logistics LLC",
      "clientType": "Organization",
      "primaryContact": "Robert H. Henderson (CEO)",
      "email": "rhenderson@wasatchlogistics.com",
      "phone": "(801) 555-0192",
      "assignedAttorneyId": "usr-2",
      "assignedAttorneyName": "Thomas Bludworth, Esq.",
      "status": "Active",
      "totalMatters": 2,
      "outstandingBalance": 14500.00,
      "trustBalance": 25000.00
    }
  ],
  "pagination": { "currentPage": 1, "pageSize": 10, "totalRecords": 8, "totalPages": 1 }
}
```

### `GET /api/v1/clients/:id`
- **Purpose**: Returns full 360° dossier including matters, AR aging, IOLTA sub-ledger balance, and privileged notes.
- **Auth**: Bearer Token
- **Permission**: `clients:view`
- **Success Response (`200 OK`)**: Returns complete client object with nested tabs.

### `POST /api/v1/clients`
- **Purpose**: Creates a new client profile.
- **Auth**: Bearer Token
- **Permission**: `clients:create`
- **Request Body**:
```json
{
  "name": "Wasatch Mountain Logistics LLC",
  "clientType": "Organization",
  "primaryContact": "Robert H. Henderson",
  "email": "rhenderson@wasatchlogistics.com",
  "phone": "(801) 555-0192",
  "address": "1420 South Foothill Blvd, Salt Lake City, UT",
  "assignedAttorneyId": "c1f7a8b2-6d3e-4b9a-8c1f-2e3d4a5b6c7d",
  "status": "Active",
  "notes": "Commercial freight and supply chain logistics client."
}
```
- **Success Response (`201 Created`)**: Returns created client with assigned `CLI-XXXX` number.

### `POST /api/v1/intakes`
- **Purpose**: Creates prospective client intake file with adverse party collection.
- **Auth**: Bearer Token
- **Permission**: `intake:create`
- **Request Body**:
```json
{
  "prospectiveClient": "Clearwater Basin Agricultural Water Co.",
  "contactPerson": "LeRoy Jenkins",
  "email": "leroy@clearwaterbasin.org",
  "phone": "(435) 555-0311",
  "practiceAreaId": "pa-6",
  "adverseParties": "Utah State Water Resources Board, Central Valley Irrigation Canal Co.",
  "matterSummary": "Petition for supplemental ground well extraction rights."
}
```
- **Success Response (`201 Created`)**: Returns intake with `conflictStatus: 'Not Started'`.

### `PATCH /api/v1/intakes/:id/conflict`
- **Purpose**: Records attorney conflict review determination under Utah RPC 1.7.
- **Auth**: Bearer Token
- **Permission**: `intake:conflict_review` (`super_admin`, `supervisor`, `attorney`)
- **Request Body**:
```json
{
  "status": "Cleared",
  "notes": "Adverse parties verified against firm client directory; no direct or material limitation conflicts."
}
```
- **Success Response (`200 OK`)**: Updates `conflict_status = 'Cleared'`, captures reviewer user ID and timestamp.

### `POST /api/v1/intakes/:id/convert`
- **Purpose**: Converts cleared intake into permanent client record and triggers initial matter setup.
- **Auth**: Bearer Token
- **Permission**: `clients:create`
- **Success Response (`201 Created`)**: Returns `{ "clientId": "...", "clientNumber": "CLI-1008" }`.

---

## 4. Matters & Workflows Endpoints

### `GET /api/v1/matters`
- **Purpose**: Retrieves legal matter docket with multi-criteria filters.
- **Auth**: Bearer Token
- **Permission**: `matters:view`
- **Query Params**: `practiceAreaId`, `status`, `attorneyId`, `search`, `page`, `pageSize`
- **Ethical Wall Check**: If caller is attorney/paralegal, excludes matters where caller is not assigned staff unless supervisor/admin.

### `GET /api/v1/matters/:id`
- **Purpose**: Retrieves litigation workspace: stages, next actions, missing info, team roster, time ledger.
- **Auth**: Bearer Token
- **Permission**: `matters:view`
- **Success Response (`200 OK`)**: Returns full matter dossier.

### `POST /api/v1/matters`
- **Purpose**: Creates new legal matter and initializes practice area workflow stages.
- **Auth**: Bearer Token
- **Permission**: `matters:create`
- **Request Body**:
```json
{
  "clientId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "title": "Wasatch Mountain Logistics v. Interstate Freightlines Inc.",
  "practiceAreaId": "pa-1",
  "responsibleAttorneyId": "c1f7a8b2-6d3e-4b9a-8c1f-2e3d4a5b6c7d",
  "billingType": "Hourly",
  "hourlyRate": 500.00,
  "budget": 85000.00,
  "courtName": "Utah Third Judicial District Court - Salt Lake City",
  "judge": "Hon. Elizabeth A. Hruby-Mills",
  "description": "Commercial contract breach regarding cold-chain telemetry failure."
}
```
- **Success Response (`201 Created`)**: Returns created matter docket `25-CV-0101` with stage `civ-1` active.

### `PATCH /api/v1/matters/:id/stage`
- **Purpose**: Advances matter to next workflow stage after validating gatekeeper requirements.
- **Auth**: Bearer Token
- **Permission**: `matters:edit`
- **Request Body**:
```json
{
  "targetStageId": "civ-2",
  "verifiedChecklistItems": [
    "Conflict Check Cleared (RPC 1.7)",
    "Master Engagement Retainer Signed",
    "IOLTA Deposit Recorded"
  ]
}
```
- **Success Response (`200 OK`)**: Transitions stage and automatically spawns stage auto-tasks.

---

## 5. Tasks, Calendar & Court Deadlines Endpoints

### `GET /api/v1/tasks/mine`
- **Purpose**: Retrieves personal tasks for the authenticated user sorted by due date and priority.
- **Auth**: Bearer Token
- **Permission**: `tasks:view_own`
- **Success Response (`200 OK`)**: Array of personal tasks with countdown days.

### `GET /api/v1/tasks/team`
- **Purpose**: Retrieves firm-wide task distribution matrix by associate and paralegal.
- **Auth**: Bearer Token
- **Permission**: `tasks:view_team` (`super_admin`, `supervisor`)

### `POST /api/v1/tasks`
- **Purpose**: Creates a task with priority, due date, and reminder.
- **Auth**: Bearer Token
- **Permission**: `tasks:create`
- **Request Body**:
```json
{
  "matterId": "e2a1b4c3-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
  "title": "Serve Utah URCP Rule 26 Initial Disclosures",
  "assignedToUserId": "usr-4",
  "dueDate": "2026-11-20",
  "priority": "High",
  "reminderSetting": "2 days prior"
}
```
- **Success Response (`201 Created`)**: Returns created task with code `TSK-105`.

### `PATCH /api/v1/tasks/:id/status`
- **Purpose**: Updates task status (`Completed`, `In Progress`, `Blocked`).
- **Auth**: Bearer Token
- **Permission**: `tasks:edit`
- **Request Body**: `{ "status": "Completed" }`
- **Success Response (`200 OK`)**: Returns updated task with `completedAt` timestamp.

### `GET /api/v1/calendar/events`
- **Purpose**: Retrieves firm calendar hearings and deadlines within date range.
- **Auth**: Bearer Token
- **Permission**: `calendar:view`
- **Query Params**: `startDate`, `endDate`, `matterId`, `attorneyId`

---

## 6. Time Tracking, Passive Capture & Suggested Billing Endpoints

### `POST /api/v1/time-entries`
- **Purpose**: Logs manual billable/non-billable time entry with UTBMS coding.
- **Auth**: Bearer Token
- **Permission**: `time:log`
- **Request Body**:
```json
{
  "matterId": "e2a1b4c3-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
  "date": "2026-11-13",
  "hours": 2.4,
  "rate": 500.00,
  "activityType": "Legal Research & Brief Drafting",
  "activityCode": "A104",
  "description": "Researched Utah groundwater appropriation standards and drafted reply brief.",
  "isBillable": true
}
```
- **Validation**: `hours > 0`, `rate >= 0`, `matterId` valid.
- **Success Response (`201 Created`)**: Returns entry with computed `amount: 1200.00`, `status: 'Submitted'`.

### `GET /api/v1/time-entries/suggested`
- **Purpose**: Retrieves passive captures from Outlook, phone logs, and documents.
- **Auth**: Bearer Token
- **Permission**: `time:suggested_view`
- **Success Response (`200 OK`)**: Returns passive suggestions with actual duration, suggested hours, and confidence.

### `POST /api/v1/time-entries/suggested/:id/accept`
- **Purpose**: Converts a suggested passive capture into an official submitted time entry.
- **Auth**: Bearer Token
- **Permission**: `time:log`
- **Request Body**: `{ "matterId": "...", "suggestedHours": 0.3, "description": "..." }`
- **Success Response (`201 Created`)**: Returns generated `time_entry` record.

### `POST /api/v1/time-entries/approvals/batch`
- **Purpose**: Batch approves submitted time entries for billing.
- **Auth**: Bearer Token
- **Permission**: `time:approve` (`super_admin`, `supervisor`, `billing`)
- **Request Body**: `{ "entryIds": ["TIM-501", "TIM-502"] }`
- **Success Response (`200 OK`)**: Sets `status = 'Approved'`, captures partner approver ID.

### `PATCH /api/v1/time-entries/:id/reject`
- **Purpose**: Rejects a submitted time entry with an attorney correction note.
- **Auth**: Bearer Token
- **Permission**: `time:reject`
- **Request Body**: `{ "comment": "Reduce duration to 0.2 hr per client retainer agreement cap." }`
- **Success Response (`200 OK`)**: Sets `status = 'Rejected'`, attaches comment.

---

## 7. Billing, Invoices, Expenses & Payments Endpoints

### `POST /api/v1/invoices`
- **Purpose**: Generates formal client invoice consolidating approved time entries and unbilled expenses.
- **Auth**: Bearer Token
- **Permission**: `invoices:create` (`super_admin`, `supervisor`, `billing`)
- **Request Body**:
```json
{
  "clientId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "matterId": "e2a1b4c3-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
  "issueDate": "2026-11-13",
  "dueDate": "2026-12-13",
  "timeEntryIds": ["uuid-1", "uuid-2"],
  "expenseIds": ["uuid-3"],
  "notes": "Thank you for retaining Heugly & Bludworth."
}
```
- **Success Response (`201 Created`)**: Returns invoice `HB-2025-004` with line items; marks time entries as `Billed`.

### `POST /api/v1/payments`
- **Purpose**: Records incoming client payment and applies it across invoices or trust retainer accounts.
- **Auth**: Bearer Token
- **Permission**: `payments:record`
- **Request Body**:
```json
{
  "invoiceId": "f4b2c1d0-a9e8-4f7b-6c5d-3e2f1a0b9c8d",
  "clientId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "amount": 14500.00,
  "paymentMethod": "ACH",
  "destinationAccount": "Operating Account",
  "transactionReference": "ACH-TRACE-889102"
}
```
- **Success Response (`201 Created`)**: Updates invoice balance and posts cash receipt to General Ledger.

---

## 8. Trust Accounting & 3-Way Reconciliation Endpoints (Utah RPC 1.15)

### `GET /api/v1/accounting/trust/ledgers`
- **Purpose**: Retrieves all client trust sub-ledgers with running balances and audit verification.
- **Auth**: Bearer Token
- **Permission**: `trust:view`
- **Success Response (`200 OK`)**: Returns sub-ledgers with zero negative balance guarantee.

### `POST /api/v1/accounting/trust/transactions`
- **Purpose**: Executes an authorized trust deposit, drawdown, or disbursement with double-entry journal creation.
- **Auth**: Bearer Token
- **Permission**: `trust:manage` (`super_admin`, `billing`)
- **Request Body**:
```json
{
  "trustSubLedgerId": "TR-1001",
  "transactionType": "Earned Fee Drawdown",
  "amount": -5000.00,
  "sourceReference": "Invoice HB-2025-001 Approved Drawdown",
  "purpose": "Transfer earned legal fees from IOLTA to Operating Account."
}
```
- **Validation**: Checks that `current_balance + amount >= 0.00` (anti-commingling enforcement).
- **Success Response (`201 Created`)**: Posts transaction and updates ledger balance atomically.

### `GET /api/v1/accounting/reconcile/:month`
- **Purpose**: Computes 3-way reconciliation pillars for specified month: Adjusted Bank Statement, General Ledger Account 2100, and Client Sub-Ledgers.
- **Auth**: Bearer Token
- **Permission**: `trust:view`
- **Success Response (`200 OK`)**:
```json
{
  "success": true,
  "data": {
    "month": "2026-11",
    "pillar1_adjustedBankBalance": 74278.00,
    "pillar2_generalLedgerTrustBalance": 74278.00,
    "pillar3_clientSubledgersTotal": 74278.00,
    "variance": 0.00,
    "isBalanced": true,
    "status": "In Balance (Utah RPC 1.15 Compliant)"
  }
}
```

### `POST /api/v1/accounting/reconcile/certificate`
- **Purpose**: Certifies monthly 3-way reconciliation and generates printable PDF audit certificate.
- **Auth**: Bearer Token
- **Permission**: `trust:manage`
- **Request Body**: `{ "reconciliationMonth": "2026-11" }`
- **Success Response (`201 Created`)**: Returns signed certificate URL and locks the month from further edits.

---

## 9. Documents & Vault Endpoints

### `POST /api/v1/documents/upload`
- **Purpose**: Uploads a legal instrument or exhibit with privilege classification (Utah RPC 1.6) and OCR text extraction.
- **Auth**: Bearer Token
- **Permission**: `documents:upload`
- **Content-Type**: `multipart/form-data`
- **Form Fields**: `matterId`, `clientId`, `title`, `category`, `isPrivileged`, `privilegeType`, `file`
- **Success Response (`201 Created`)**: Returns document record with version `v1.0`.

### `GET /api/v1/documents/:id/download`
- **Purpose**: Generates a temporary presigned URL (15-minute validity) to download encrypted document binary.
- **Auth**: Bearer Token
- **Permission**: `documents:view`
- **Success Response (`200 OK`)**: `{ "downloadUrl": "https://vault.utahslawyers.com/files/...?token=..." }`

---

## 10. Specialty Practices Endpoints

### Personal Injury (`/api/v1/specialty/personal-injury`)
- `GET /cases`: Retrieves PI caseload with medical bill totals and demand package statuses.
- `POST /medical-providers`: Logs treatment provider, records request date, and medical bills.
- `POST /liens`: Records subrogation lien (ERISA, hospital, Medicare) with asserted and negotiated amounts.
- `POST /settlement-statements`: Generates Utah RPC 1.5(c) contingency disbursement breakdown.

### Bankruptcy (`/api/v1/specialty/bankruptcy`)
- `POST /debtor-intake`: 5-step debtor wizard creating Chapter 7/11/13 filing docket.
- `POST /means-test/calculate`: Computes Form 122 median income comparison against Utah statutory benchmarks.
- `GET /exemptions/utah`: Evaluates homestead (§ 78B-5-501) and motor vehicle (§ 78B-5-505) allowances.
- `POST /creditor-matrix/export`: Generates ASCII CM/ECF compliant creditor address matrix.

### Immigration (`/api/v1/specialty/immigration`)
- `POST /multi-form/sync`: Single-source questionnaire updating Form G-28, I-130, I-485, I-765, and I-864 simultaneously.
- `GET /receipts/tracker`: USCIS receipt milestone inspector tracking priority dates and biometrics.
- `POST /package-assembly`: Compiles 7-tab exhibit binder (Tabs A through G) and clearance letter.

