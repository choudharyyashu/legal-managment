# HEUGLY & BLUDWORTH – LEGAL PRACTICE MANAGEMENT SAAS
# DOCUMENT 31: PHASE 7.1 – CONFLICT CHECKING & INTAKE CLEARANCE READ-ONLY AUDIT

**Author:** Senior Backend Architect & Security Auditor  
**Audit Date:** 2026-11-13  
**Jurisdiction:** State of Utah (Utah State Bar, Third Judicial District Court)  
**Database:** `legal-db` (MariaDB 10.11.16 LTS / MySQL 8.4 LTS Compatible)  
**ORM:** Prisma ORM 5.22.0  
**Audit Mode:** **READ-ONLY AUDIT** (Zero code, schema, migration, or record modifications)  
**Final Audit Verdict:** **PARTIAL / IMPLEMENTATION REQUIRED (CLEAN FOUNDATION, ZERO CONFLICT APIS IMPLEMENTED)**

---

## 1. Executive Summary

Phase 7.1 conducts a comprehensive, read-only architectural, security, and database audit of the prospective client **Intake** and **Conflict Clearance (Utah RPC 1.7)** functionality across the Heugly & Bludworth Legal Practice Management SaaS platform.

### Key Audit Findings:
1. **Frontend Architecture:** The user interface features a fully designed `IntakeList.jsx` and `ConflictSearchModal.jsx` with Utah RPC 1.7 clearance workflows, adverse party screening inputs, conflict certificate generation, and client conversion buttons. However, these components currently interact exclusively with **local browser mock storage** (`mockStorage` via `ClientContext.jsx` and `MOCK_RELATED_PARTIES.js`). No real backend API communication is wired.
2. **Backend Architecture:** In the backend (`backend/src/modules/`), **zero intake or conflict checking endpoints, services, or controllers currently exist**. Only `auth`, `users`, `clients`, and `matters` modules are implemented.
3. **Database Schema & Unapplied Migration:** 
   * Both `intakes` and `conflict_search_logs` tables physically exist in the MariaDB `legal-db` database.
   * `schema.prisma` declares `Intake.convertedMatterId` (`VARCHAR(36)`), but physical inspection of the MariaDB `intakes` table revealed that migration `20261113093500_add_intake_converted_matter` has **not been deployed** to `legal-db`. The column `converted_matter_id` does not physically exist in the database table yet.
4. **Adverse Parties & Related Parties Data Gap:** Adverse parties are stored strictly as an unstructured plain `TEXT` column (`intakes.adverse_parties`). No relational `RelatedParty` model or table exists in the schema.
5. **RBAC & Authorization Matrix:** The database and frontend permissions configuration already define the required permission keys (`intake:view`, `intake:create`, `intake:conflict_review`). Only `attorney`, `super_admin`, and `supervisor` hold `intake:conflict_review` rights; paralegals and billing staff are prohibited from clearing conflicts.

---

## 2. Documentation Reviewed

The following architectural and specification documents were audited as the authoritative baseline:

1. **`backend-docs/01-BACKEND-ARCHITECTURE.md`**: Section 2 (Clients & Intake), Section 4 (Cross-Module Workflows: Intake Conversion to Client).
2. **`backend-docs/03-DATABASE-DESIGN.md`**: Section 2.2 (`intakes` and `conflict_search_logs` schema specifications).
3. **`backend-docs/05-API-SPECIFICATION.md`**: Planned endpoints for `POST /api/v1/intakes`, `GET /api/v1/intakes`, `PATCH /api/v1/intakes/:id/conflict`, and `POST /api/v1/intakes/:id/convert`.
4. **`backend-docs/06-AUTHENTICATION-AUTHORIZATION.md`**: Ethical Walls and Utah RPC 1.7 conflict gatekeeper design.
5. **`backend-docs/07-BUSINESS-LOGIC-AND-WORKFLOWS.md`**: Conflict clearance flowchart (Step 1: Intake $\rightarrow$ Step 2: Automated Conflict Search Engine $\rightarrow$ Step 3: Attorney Review $\rightarrow$ Step 4: Clearance/Waiver $\rightarrow$ Step 5: Client Conversion).
6. **`backend-docs/09-SECURITY-AND-COMPLIANCE.md`**: Pre-intake adverse party search engine indexing all entities under Utah RPC 1.7, 1.9, and 1.10.
7. **`backend-docs/25-CLIENTS-MATTERS-MODULE-AUDIT.md`**: Section 5 (Conflict of Interest Audit Findings) and Section 6.3 (Conflict Search & Clearance Endpoints).
8. **`backend-docs/27-MATTERS-STAFF-IMPLEMENTATION.md`** & **`29-MATTERS-SECURITY-REMEDIATION-REPORT.md`**: Ethical Wall implementation standards.
9. **`backend-docs/30-PHASE-6-FINAL-VERIFICATION.md`**: Sign-off of Phase 6 and readiness for Phase 7.

---

## 3. Frontend Audit

### 3.1 Components & Screens Inspected
* **`src/features/intake/pages/IntakeList.jsx`**: Primary dashboard for prospective client files.
* **`src/features/intake/components/ConflictSearchModal.jsx`**: Multi-entity adverse party search and disposition modal.
* **`src/features/intake/components/EndToEndDemoWizard.jsx`**: Interactive clearance walkthrough wizard.
* **`src/context/ClientContext.jsx`**: Mock state management for `intakes`.
* **`src/data/mockRelatedParties.js`**: Mock taxonomy and entity datasets.
* **`src/config/permissions.js`**: UI permission definitions (`INTAKE_VIEW`, `INTAKE_CREATE`, `INTAKE_CONFLICT_REVIEW`).

### 3.2 Form Fields & User Interactions
In `IntakeList.jsx`:
* **Creation Form Modal (`handleCreateIntake`):**
  * `prospectiveClient` (`string`, required)
  * `contactPerson` (`string`, optional)
  * `email` (`string`, required, email format)
  * `phone` (`string`, required)
  * `practiceAreaId` (`select`, required)
  * `adverseParties` (`text`, free-text comma-delimited input)
  * `matterSummary` (`text`, optional)
  * `disputeAmount` (`decimal/string`, optional)
  * `jurisdictionVenue` (`string`, optional)
* **Intake Detail & Review Modal:**
  * Displays client, contact, practice area, adverse parties, summary, and current `conflictStatus` (`Not Started`, `In Review`, `Cleared`, `Conflict Identified`).
  * Displays `reviewedBy` (Attorney Name) and `reviewedAt` timestamp.
  * Action button: **"Run RPC 1.7 Conflict Check"** (opens `ConflictSearchModal`).
  * Action button: **"Convert to Client & Open Matter"** — conditionally rendered **only when `conflictStatus === 'Cleared'`** (`IntakeList.jsx`, line 329).

### 3.3 Conflict Search Modal (`ConflictSearchModal.jsx`)
* **Search Execution (`runSearch`):**
  * Searches prospective client name or adverse party query against:
    1. Active Clients (`MOCK_CLIENTS`): matches name and primary contact.
    2. Active Matters (`MOCK_MATTERS`): matches title and description.
    3. Related Parties (`MOCK_RELATED_PARTIES`): matches entity name and firm name.
  * Categorizes hits: `Critical Conflict` (Direct Adverse Conflict under Utah RPC 1.7(a)(1)), `Potential Conflict` (Substantially Related Matter under RPC 1.9), or `Informational Hit`.
* **Clearance Disposition & Certificate:**
  * Attorney reviewer selection (`reviewer`).
  * Disposition dropdown: `'Cleared'` vs `'Conflict Identified'`.
  * `analysisNotes` input for legal justification.
  * Formats and prints an official Utah RPC 1.7 Conflict Check Certificate (`handleIssueCertificate`).
  * Dispatches `onConflictResolved(disposition, notes)`.

### 3.4 Client Conversion Workflow
In `IntakeList.jsx` (`handleConvertClient`, lines 103–119):
* Dispatches `addClient(...)` directly into mock state.
* Generates client ID `CLI-xxxx` in client-side state.
* Redirects user immediately to `/clients/{clientId}`.

### 3.5 Frontend Gaps & Mock State Dependency
1. **Zero HTTP API Integration:** All intake and conflict actions mutate client-side React state (`ClientContext.jsx` `mockStorage`) rather than calling backend endpoints.
2. **Client-Side Only Gatekeeping:** The restriction requiring `conflictStatus === 'Cleared'` prior to client conversion is enforced purely by rendering logic in React (`{selectedIntake.conflictStatus === 'Cleared' && ...}`). No backend validation currently blocks conversion.
3. **No Direct Adversary Search Input:** The search query is pre-populated with the entire comma-separated `adverseParties` string, requiring the user to manually edit the search box if multiple adverse parties were entered.

---

## 4. Backend Audit

### 4.1 Modules and Route Stack
Inspection of `backend/src/modules/` and `backend/src/app.ts` confirmed:
* **Existing Modules:** `auth`, `users`, `clients`, `matters`.
* **Missing Modules:** Zero intake services, conflict search controllers, or intake route files exist in `backend/src/modules/`.
* **Missing Mount Points:** `src/app.ts` has no `/api/v1/intakes` or `/api/v1/conflicts` routers registered.

### 4.2 Data Models in Prisma Schema (`backend/prisma/schema.prisma`)
The schema contains two models relevant to Phase 7:

```prisma
model Intake {
  id                  String    @id @default(uuid()) @db.VarChar(36)
  intakeNumber        String    @unique @map("intake_number") @db.VarChar(50)
  prospectiveClient   String    @map("prospective_client") @db.VarChar(255)
  contactPerson       String?   @map("contact_person") @db.VarChar(255)
  email               String    @db.VarChar(255)
  phone               String    @db.VarChar(50)
  practiceAreaId      String?   @map("practice_area_id") @db.VarChar(50)
  adverseParties      String    @map("adverse_parties") @db.Text
  matterSummary       String    @map("matter_summary") @db.Text
  disputeAmount       Decimal?  @default(0.00) @map("dispute_amount") @db.Decimal(12, 2)
  jurisdictionVenue   String?   @map("jurisdiction_venue") @db.VarChar(255)
  conflictStatus      String    @default("Not Started") @map("conflict_status") @db.VarChar(50)
  reviewedByUserId    String?   @map("reviewed_by_user_id") @db.VarChar(36)
  reviewedAt          DateTime? @map("reviewed_at") @db.DateTime(3)
  conflictNotes       String?   @map("conflict_notes") @db.Text
  convertedToClient   Boolean   @default(false) @map("converted_to_client")
  convertedClientId   String?   @map("converted_client_id") @db.VarChar(36)
  convertedMatterId   String?   @map("converted_matter_id") @db.VarChar(36)
  createdAt           DateTime  @default(now()) @map("created_at") @db.DateTime(3)
  updatedAt           DateTime  @updatedAt @map("updated_at") @db.DateTime(3)

  practiceArea       PracticeArea?       @relation(fields: [practiceAreaId], references: [id], onDelete: SetNull)
  reviewedByUser     User?               @relation("IntakeReviewer", fields: [reviewedByUserId], references: [id], onDelete: SetNull)
  convertedClient    Client?             @relation("ConvertedClient", fields: [convertedClientId], references: [id], onDelete: SetNull)
  convertedMatter    Matter?             @relation("ConvertedMatter", fields: [convertedMatterId], references: [id], onDelete: SetNull)
  conflictSearchLogs ConflictSearchLog[]

  @@map("intakes")
}

model ConflictSearchLog {
  id                String   @id @default(uuid()) @db.VarChar(36)
  intakeId          String   @map("intake_id") @db.VarChar(36)
  queriedName       String   @map("queried_name") @db.VarChar(255)
  matchedEntityType String   @map("matched_entity_type") @db.VarChar(50)
  matchedRecordId   String   @map("matched_record_id") @db.VarChar(100)
  searchedByUserId  String   @map("searched_by_user_id") @db.VarChar(36)
  searchedAt        DateTime @default(now()) @map("searched_at") @db.DateTime(3)

  intake         Intake @relation(fields: [intakeId], references: [id], onDelete: Cascade)
  searchedByUser User   @relation(fields: [searchedByUserId], references: [id], onDelete: Restrict)

  @@map("conflict_search_logs")
}
```

---

## 5. Database Verification (MariaDB 10.11 `legal-db`)

Database tables, columns, constraints, and record counts were physically verified against `legal-db` via the MySQL binary CLI in read-only mode:

### 5.1 Tables and Physical Columns
* **`intakes` Table Structure (`DESCRIBE intakes`):**
  * `id`: `varchar(36)` Primary Key
  * `intake_number`: `varchar(50)` Unique Key
  * `prospective_client`: `varchar(255)` NOT NULL
  * `contact_person`: `varchar(255)` NULL
  * `email`: `varchar(255)` NOT NULL
  * `phone`: `varchar(50)` NOT NULL
  * `practice_area_id`: `varchar(50)` Foreign Key to `practice_areas.id`
  * `adverse_parties`: `text` NOT NULL
  * `matter_summary`: `text` NOT NULL
  * `dispute_amount`: `decimal(12,2)` NULL DEFAULT `0.00`
  * `jurisdiction_venue`: `varchar(255)` NULL
  * `conflict_status`: `varchar(50)` NOT NULL DEFAULT `'Not Started'`
  * `reviewed_by_user_id`: `varchar(36)` Foreign Key to `users.id`
  * `reviewed_at`: `datetime(3)` NULL
  * `conflict_notes`: `text` NULL
  * `converted_to_client`: `tinyint(1)` NOT NULL DEFAULT `0`
  * `converted_client_id`: `varchar(36)` Foreign Key to `clients.id`
  * `created_at`: `datetime(3)` NOT NULL DEFAULT `current_timestamp(3)`
  * `updated_at`: `datetime(3)` NOT NULL
* **`conflict_search_logs` Table Structure (`DESCRIBE conflict_search_logs`):**
  * `id`: `varchar(36)` Primary Key
  * `intake_id`: `varchar(36)` Foreign Key to `intakes.id` (`ON DELETE CASCADE`)
  * `queried_name`: `varchar(255)` NOT NULL
  * `matched_entity_type`: `varchar(50)` NOT NULL
  * `matched_record_id`: `varchar(100)` NOT NULL
  * `searched_by_user_id`: `varchar(36)` Foreign Key to `users.id` (`ON DELETE RESTRICT`)
  * `searched_at`: `datetime(3)` NOT NULL DEFAULT `current_timestamp(3)`

### 5.2 Critical Schema Discrepancy Found (Unapplied Migration)
* Inspection of `DESCRIBE intakes` revealed that **the column `converted_matter_id` does NOT physically exist** in `legal-db`.
* Inspection of `_prisma_migrations` revealed that only `20261113071216_init` has been applied. Migration `20261113093500_add_intake_converted_matter` has not been executed against `legal-db`.
* **Operational Impact:** If Prisma attempts to query `convertedMatterId`, MariaDB will throw an unhandled `ER_BAD_FIELD_ERROR (1054): Unknown column 'converted_matter_id' in 'field list'`.

### 5.3 Active Foreign Keys
* `conflict_search_logs.intake_id` $\rightarrow$ `intakes.id` (`ON DELETE CASCADE`)
* `conflict_search_logs.searched_by_user_id` $\rightarrow$ `users.id` (`ON DELETE RESTRICT`)
* `intakes.converted_client_id` $\rightarrow$ `clients.id` (`ON DELETE SET NULL`)
* `intakes.practice_area_id` $\rightarrow$ `practice_areas.id` (`ON DELETE SET NULL`)
* `intakes.reviewed_by_user_id` $\rightarrow$ `users.id` (`ON DELETE SET NULL`)

### 5.4 Existing Data Counts
* Total `intakes` in DB: **0**
* Total `conflict_search_logs` in DB: **0**
* Total `clients` in DB: **6** (including verified test records)
* Total `matters` in DB: **9** (including verified test records)

---

## 6. Existing API Inventory

| Target Endpoint | Method | Planned Functionality | Backend Implementation Status |
| :--- | :--- | :--- | :--- |
| `/api/v1/intakes` | `GET` | List prospective client intakes with status filtering and pagination | **MISSING** (No route or controller) |
| `/api/v1/intakes/:id` | `GET` | Retrieve intake details by UUID or `intakeNumber` | **MISSING** (No route or controller) |
| `/api/v1/intakes` | `POST` | Create new prospective client intake record | **MISSING** (No route or controller) |
| `/api/v1/intakes/:id/conflict-search` | `POST` | Execute multi-entity conflict search and log hits to `conflict_search_logs` | **MISSING** (No route or controller) |
| `/api/v1/intakes/:id/conflict` | `PATCH` | Record attorney conflict disposition (`Cleared`, `Conflict Identified`, `In Review`) | **MISSING** (No route or controller) |
| `/api/v1/intakes/:id/convert` | `POST` | Convert cleared intake into active `Client` and initial `Matter` | **MISSING** (No route or controller) |

---

## 7. Existing RBAC & Security Analysis

Database inspection of `role_permissions` verified the exact permissions seeded in `legal-db`:

| Permission Key | Description | Roles Possessing Permission | Roles Excluded |
| :--- | :--- | :--- | :--- |
| `intake:view` | Inspect intake directories, prospective client data, and status | `super_admin`, `supervisor`, `attorney`, `paralegal` | `billing` |
| `intake:create` | Submit new prospective client intake information | `super_admin`, `supervisor`, `attorney`, `paralegal` | `billing` |
| `intake:conflict_review` | Review search hits, determine conflicts, clear/flag intake files under Utah RPC 1.7 | `super_admin`, `supervisor`, `attorney` | `paralegal`, `billing` |

### Security Observations:
1. **Clearance Privilege Isolation:** Only licensed attorneys (`attorney`), supervisors (`supervisor`), and partners (`super_admin`) hold `intake:conflict_review`. Paralegals can view and create intake records, but cannot clear conflict status.
2. **Missing Search Permission Distinction:** The permission set lacks a dedicated `intake:conflict_search` permission. If running a conflict search requires `intake:conflict_review`, paralegals will be unable to run automated initial searches. If running a search is allowed under `intake:view`, any staff with view rights can query the entity database.

---

## 8. Conflict Checking Workflow Analysis (Utah RPC 1.7)

The required legal conflict checking process comprises three stages:

### Stage 1: Query Execution
* The system must query an entity or individual name against:
  1. `clients.name` and `clients.primary_contact` (Direct client conflicts).
  2. `matters.title` and `matters.case_docket_number` (Substantially related litigation).
  3. `intakes.prospective_client` and `intakes.adverse_parties` (Prior prospective adverse representations).
* For every hit detected, a record must be created in `conflict_search_logs` capturing:
  * `intake_id`
  * `queried_name`
  * `matched_entity_type` (`'CLIENT'`, `'MATTER'`, `'INTAKE'`)
  * `matched_record_id` (UUID or Reference ID)
  * `searched_by_user_id`
  * `searched_at`

### Stage 2: Ethical Wall Interaction (Utah RPC 1.10)
* **Crucial Security Requirement:** When an attorney or paralegal executes a conflict search, can the search query match a matter from which the searching user is walled off by an active Ethical Wall?
* **Legal Policy Standard:** In Utah legal ethics, a conflict search system must alert the firm that a conflict exists without disclosing privileged defense work product or walled-off confidential notes. The search hit should indicate `[ETHICAL WALL RESTRICTION: Confidential Matter Exists - Contact Firm Conflict Partner]` without exposing matter descriptions.

### Stage 3: Attorney Review & Disposition
* Status transitions:
  * `Not Started` $\rightarrow$ Initial state upon intake creation.
  * `In Review` $\rightarrow$ Automated search executed, awaiting attorney evaluation.
  * `Cleared` $\rightarrow$ Attorney confirms zero direct or material limitation conflicts.
  * `Conflict Identified` $\rightarrow$ Direct adverse party or un-waivable conflict detected.

---

## 9. Intake Clearance Workflow Analysis

Converting a prospective client intake into an active client record (`Client`) and opening an initial legal case (`Matter`) represents a critical regulatory transition:

```
[Intake Created: Not Started]
         │
         ▼
[Run Conflict Check Engine] ──(Logs to conflict_search_logs)──► [Conflict Identified (RPC 1.7)]
         │                                                                   │
         ▼                                                                   ▼
[Attorney Reviews Search Hits]                                      [File Rejected / Letter of Non-Engagement]
         │
         ▼
[Attorney Clears Conflict: conflict_status = 'Cleared']
         │
         ▼
[Convert to Client Endpoint]
   ├── 1. Validates conflict_status === 'Cleared' (Blocks with 409 if not cleared)
   ├── 2. Atomically allocates CLI-xxxx
   ├── 3. Creates Client entity
   ├── 4. Atomically allocates YY-PA-xxxx
   ├── 5. Creates Matter entity
   ├── 6. Updates Intake: converted_to_client = true, converted_client_id = client.id
   └── 7. Logs Immutable Audit Event: INTAKE_CONVERTED_TO_CLIENT
```

**Security Vulnerability in Current State:** Because no backend conversion endpoint exists, if frontend code or an unauthenticated client sends a direct `POST /api/v1/clients` request, the backend creates the client immediately without verifying whether an intake existed or whether conflicts were cleared!

---

## 10. Related Parties Data Gap

### 10.1 Direct Verification of Database Structure
* `intakes.adverse_parties` is a simple MariaDB `TEXT` column (unstructured free-text).
* In `matters`, there is **no field or table** for adverse parties, co-counsel, expert witnesses, or opposing parties.
* In `schema.prisma`, there is **no `RelatedParty` model**.
* In frontend mock data (`MOCK_RELATED_PARTIES`), 9 distinct party roles exist (`opposing_party`, `opposing_counsel`, `co_counsel`, `expert_witness`, `fact_witness`, `judge`, `insurer`, `lienholder`, `registered_agent`).

### 10.2 Consequences for Conflict Checking
1. **Fuzzy & Substring Reliance:** Without a structured table of adverse parties, the conflict search engine must perform `LIKE '%query%'` substring searches across `intakes.adverse_parties` and `matters.title`.
2. **Missing Closed-Matter Adverse Entities:** Once an intake is converted into a Matter, the adverse parties recorded on the intake remain in `intakes.adverse_parties`. If a future matter is created directly via `POST /api/v1/matters`, its adverse parties are not captured in any structured form.

### 10.3 Architectural Options for Resolution
* **Option A (Zero Schema Change - Recommended for Immediate Phase 7):**
  * Search prospective client query against:
    * `clients.name` and `clients.primary_contact`
    * `matters.title` and `matters.court_name`
    * `intakes.prospective_client` and `intakes.adverse_parties`
  * Fully compliant with the existing database schema; requires zero new migrations or table additions.
* **Option B (Dedicated RelatedParty Schema - Future Phase):**
  * Introduce a `related_parties` model linked to `matters` and `intakes`.
  * Requires schema modification and formal client approval.

---

## 11. Requirements Coverage Matrix

| Requirement | Existing Implementation | Evidence (file/model/API) | Status | Gap |
| :--- | :--- | :--- | :--- | :--- |
| **Prospective Client Intake Capture** | UI Form in `IntakeList.jsx`; `Intake` model in `schema.prisma` | `frontend/src/features/intake/pages/IntakeList.jsx`<br/>`backend/prisma/schema.prisma` | **PARTIAL** | UI exists but saves to mock storage. Backend API routes and services are missing. |
| **Adverse Party Input** | Single free-text textarea in `IntakeList.jsx`; `adverse_parties` in DB | `IntakeList.jsx` (line 360)<br/>`intakes.adverse_parties` (`TEXT`) | **PARTIAL** | Unstructured comma-separated string; no structured relational model. |
| **Conflict Search Across Clients** | Mock search in `ConflictSearchModal.jsx` | `ConflictSearchModal.jsx` (lines 83–96) | **MISSING** | No backend search endpoint querying `clients` table. |
| **Conflict Search Across Matters** | Mock search in `ConflictSearchModal.jsx` | `ConflictSearchModal.jsx` (lines 98–110) | **MISSING** | No backend search endpoint querying `matters` table. |
| **Conflict Search Across Intakes** | Mock search | `ConflictSearchModal.jsx` | **MISSING** | No backend search querying prior `intakes.adverse_parties`. |
| **Conflict Search History Logging** | Mock history array in `ConflictSearchModal.jsx`; `conflict_search_logs` table in DB | `conflict_search_logs` table in MariaDB | **PARTIAL** | Table exists in MariaDB, but zero backend code writes to it. |
| **Attorney Conflict Review Disposition** | Dropdown in UI; `conflict_status` column in DB | `intakes.conflict_status`<br/>`intakes.reviewed_by_user_id` | **PARTIAL** | DB columns exist, but no `PATCH /api/v1/intakes/:id/conflict` endpoint exists. |
| **Mandatory Clearance Before Conversion** | UI conditional check `{conflictStatus === 'Cleared'}` | `IntakeList.jsx` (line 329) | **MISSING** | Enforced only in React UI. Backend has no intake conversion endpoint to block un-cleared conversion. |
| **Unapplied Database Migration** | Migration SQL file exists | `migrations/20261113093500_add_intake_converted_matter` | **NEEDS CONFIRMATION** | `converted_matter_id` is declared in Prisma schema but missing from physical MariaDB table. |
| **Immutable Audit Trail for Clearance** | Planned in documentation | `backend-docs/05-API-SPECIFICATION.md` | **MISSING** | No audit logging implemented for intake creation, search, or clearance. |

---

## 12. Security Findings

| Finding ID | Severity | Category | Description |
| :--- | :--- | :--- | :--- |
| **SEC-PH7-01** | **CRITICAL** | Authorization Bypass | **No Server-Side Clearance Gate:** Client creation (`POST /api/v1/clients`) does not require an intake or verified conflict clearance. Anyone with `clients:create` can open a client directly, bypassing Utah RPC 1.7 screening. |
| **SEC-PH7-02** | **HIGH** | Database Desynchronization | **Missing Column in MariaDB:** `converted_matter_id` is present in `schema.prisma` but missing from the physical `intakes` table in `legal-db`. Any Prisma query selecting this field will crash with a SQL syntax error. |
| **SEC-PH7-03** | **HIGH** | Audit Trail Gap | **Un-audited Conflict Review:** Because no backend endpoints exist, conflict searches, hit disclosures, and attorney clearances leave zero records in `audit_logs` or `conflict_search_logs`. |
| **SEC-PH7-04** | **MEDIUM** | Information Disclosure | **Unscreened Conflict Search Hits:** A conflict search query could potentially disclose matter titles or party names from matters protected by Utah RPC 1.10 Ethical Walls to screened staff. |
| **SEC-PH7-05** | **LOW** | Privilege Ambiguity | **Paralegal Search Execution:** In `legal-db`, paralegals lack `intake:conflict_review`. If conflict search is gated by this permission, paralegals cannot assist in running preliminary searches. |

---

## 13. Risks and Dependencies

1. **Database Migration Dependency:** Before deploying or running backend queries against `Intake`, the migration adding `converted_matter_id` must be deployed, OR the Prisma schema must exclude `convertedMatterId` until migration execution is approved.
2. **Client Conversion Dependency:** Converting an intake requires invoking `ClientService.createClient` and `MatterService.createMatter` in an atomic transaction to ensure neither orphan clients nor orphan matters are created.
3. **Data Quality Dependency:** Because `adverse_parties` is free-text, search accuracy depends on query tokenization and normalization (e.g. trimming punctuation, normalizing "LLC", "Inc.", "Co.").

---

## 14. Recommended Implementation Plan (Planning Only)

### Step 1: Database Alignment
* Safely apply migration `20261113093500_add_intake_converted_matter` using `npx prisma migrate deploy` to add `converted_matter_id` to `intakes` table, or align schema.

### Step 2: Intake Domain Backend Module (`src/modules/intakes/`)
* **`intake.types.ts`**: Define `IntakeResponse`, `ConflictSearchHit`, `ConflictDispositionInput`, `ConvertIntakeInput`.
* **`intake.validation.ts`**: Zod schemas for intake creation, conflict check queries, and attorney review disposition.
* **`intake.service.ts`**:
  * `createIntake`: Generates `INT-xxxx`, stores adverse parties.
  * `getIntakes`: Paginated list with status and practice area filters.
  * `getIntakeById`: Resolves intake by UUID or `intakeNumber`.
  * `runConflictSearch`: Multi-entity search across `clients`, `matters`, and `intakes`; inserts records into `conflict_search_logs`.
  * `updateConflictDisposition`: Enforces `intake:conflict_review`; sets status (`Cleared` / `Conflict Identified`), notes, and reviewer ID.
  * `convertIntakeToClient`: Atomic transaction verifying `conflict_status === 'Cleared'`; provisions `Client` and `Matter`; marks `converted_to_client = true`.
* **`intake.controller.ts`**: Standardized Express request handlers.
* **`intake.routes.ts`**: Routes mounted under `/api/v1/intakes` protected by `requireAuth` and granular RBAC middleware.

### Step 3: Frontend Integration
* Wire `IntakeList.jsx` and `ConflictSearchModal.jsx` to dispatch real API calls to `/api/v1/intakes`.

### Step 4: Automated E2E Test Suite (`src/tests/intake-conflict-test-suite.ts`)
* Cover intake creation, conflict search hit detection, conflict review disposition, clearance gate enforcement, and client conversion.

---

## 15. Questions Requiring Client/Firm Confirmation

Before starting implementation in Phase 7.2, the following policy decisions require firm confirmation:

1. **Conflict Search Initiation vs. Approval:**  
   * *Question:* Should paralegals (`role: 'paralegal'`) be permitted to run initial conflict searches, leaving only the final clearance disposition (`Cleared` / `Conflict Identified`) restricted to attorneys (`role: 'attorney'`, `'super_admin'`)?
2. **Direct Client Creation Policy:**  
   * *Question:* Should direct client creation (`POST /api/v1/clients`) be restricted or flagged if it does not originate from a cleared intake, or do partners retain the prerogative to open emergency clients directly?
3. **Fuzzy Search Threshold:**  
   * *Question:* What level of name matching is required for conflict checks (exact substring matching vs. soundex/levenshtein fuzzy scoring)?
4. **Adverse Party Storage Evolution:**  
   * *Question:* Does the firm require a structured `RelatedParty` model in this phase, or is the existing `adverse_parties` text field with multi-entity substring search acceptable?

---

## 16. Final Audit Verdict

### **PARTIAL / IMPLEMENTATION REQUIRED**

* **Justification:**  
  The database foundation (`intakes`, `conflict_search_logs`, and RBAC permissions) and frontend UI designs are established. However, **zero backend APIs or server-side clearance enforcement currently exist**. Prospective client intake and conflict clearance operate entirely on mock data in the browser.
  Phase 7 implementation is required to deliver the backend services, conflict search engine, clearance gatekeeper, and automated test suite.

