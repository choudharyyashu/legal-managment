# HEUGLY & BLUDWORTH – LEGAL PRACTICE MANAGEMENT SAAS
# DOCUMENT 37: PHASE 1 — DOCUMENT AUTOMATION DATABASE FOUNDATION: READ-ONLY VERIFICATION AUDIT

**Project:** HEUGLY & BLUDWORTH Legal Practice Management SaaS (Salt Lake City, Utah)  
**Workspace:** `D:\legal-ui1\legal-managment`  
**Backend:** `D:\legal-ui1\legal-managment\backend`  
**Documentation:** `D:\legal-ui1\legal-managment\backend-docs`  
**Date:** 2026-11-13  
**Auditor:** Principal Enterprise Database Architect & Senior Security Auditor  
**Audit Standard:** Strict Read-Only Verification Audit (Zero code, schema, migration, or Git modifications)  
**Deliverable File:** `backend-docs/37-DOCUMENT-AUTOMATION-DATABASE-FOUNDATION-AUDIT.md`  
**Predecessor Audit:** `backend-docs/36-DOCUMENT-AUTOMATION-ENGINE-AUDIT.md`  

---

## 1. Executive Summary

This read-only audit provides a rigorous, deep technical verification of the database architecture required to implement the **Document Automation Engine Foundation (Phase 1)** for HEUGLY & BLUDWORTH.

Following the initial high-level system audit in Document 36, this verification evaluates four proposed core database models:
1. `document_templates` (`DocumentTemplate`) — Central catalog of legal templates across 9 practice areas.
2. `template_versions` (`TemplateVersion`) — Immutable version history of Word `.docx` template files.
3. `document_field_mappings` (`DocumentFieldMapping`) — Dynamic placeholder tag to database column bindings.
4. `document_drafts` (`DocumentDraft`) — Generated matter-specific working legal drafts with completeness tracking.

### Core Audit Verdict:
- **Architecture Readiness:** **READY FOR ADDITIVE IMPLEMENTATION.**
- **Existing Schema Conflicts:** **ZERO CONFLICTS.** The 4 proposed tables are completely absent from both `schema.prisma` (28 existing models) and MariaDB (`legal-db`).
- **Data Loss Risk:** **ZERO RISK.** Because the proposed foundation is strictly additive (new tables, new foreign keys originating from new tables to existing tables), existing tables (`clients`, `matters`, `users`, `documents`, `intakes`, etc.) will remain completely unaffected.
- **Git & Team Safety:** Safe to proceed once the ongoing branch merge between `origin/main` and `main` is concluded by the responsible developer.

---

## 2. STEP 1 — Git & Developer Safety Verification

A comprehensive inspection of the workspace Git status was performed at `D:\legal-ui1\legal-managment`.

### Git Status Findings:
```text
On branch main
Your branch and 'origin/main' have diverged,
and have 3 and 1 different commits each, respectively.
  (use "git pull" if you want to integrate the remote branch with yours)

All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)

Changes to be committed:
	new file:   P0_BACKEND_REMEDIATION_REPORT.md
	new file:   P0_REMEDIATION_INDEPENDENT_VERIFICATION.md

Untracked files:
	backend-docs/36-DOCUMENT-AUTOMATION-ENGINE-AUDIT.md
	client-document/~$veloper_Instructions_Open_Source_and_Automation.docx
	client-document/~$xt_Development_Instructions_and_300_Document_Automations.docx
```

### Safety Rules Adherence:
- **Active Merge in Working Tree:** Developers Yashwant Choudhary and Prerna Verma have staged remediation documents (`P0_BACKEND_REMEDIATION_REPORT.md`, `P0_REMEDIATION_INDEPENDENT_VERIFICATION.md`) during a merge resolution.
- **Strict Read-Only Enforcement:**
  - `git reset` was **NOT** executed.
  - `git clean` was **NOT** executed.
  - `git stash` was **NOT** executed.
  - `git checkout` was **NOT** executed.
  - `git commit` was **NOT** executed.
  - Working tree state was completely preserved without interference.

---

## 3. STEP 2 — Prisma Schema Technical Audit

The backend Prisma configuration was audited at `backend/prisma/schema.prisma`.

### Technical Parameters:
- **Prisma Version:** 5.22.0
- **Database Provider:** `mysql` (targeting MariaDB 10.11.16 LTS InnoDB)
- **Client Generator:** `prisma-client-js`
- **Total Existing Models:** 28 models across 9 functional sections:
  1. Identity & RBAC: `User`, `Role`, `RolePermission`
  2. Clients & Intakes: `Client`, `Intake`, `ConflictSearchLog`
  3. Matters & Workflows: `PracticeArea`, `Matter`, `MatterStaffAssignment`, `WorkflowStage`, `MatterStageHistory`
  4. Tasks & Calendar: `Task`, `CalendarEvent`
  5. Billing & Invoicing: `TimeEntry`, `SuggestedBillingCapture`, `Expense`, `Invoice`, `InvoiceLineItem`, `PaymentRecord`
  6. Trust Accounting: `TrustSubLedger`, `TrustTransaction`
  7. General Ledger: `ChartOfAccount`, `GeneralLedgerJournal`, `GeneralLedgerEntry`, `ThreeWayReconciliation`
  8. Document Vault: `Document`, `DocumentVersion`
  9. Audit & Security: `AuditLog`

### Document Vault vs. Document Automation Comparison:
| Model / Table | Existing Scope & Purpose | Can It Serve Document Automation? |
|---|---|---|
| `Document` (`documents`) | Stores matter-bound client files (contracts, evidence, filed pleadings). Required FKs: `matterId`, `clientId`. | **NO.** Reusable templates cannot require a matter or client ID. |
| `DocumentVersion` (`document_versions`) | Stores uploaded S3/vault revisions of a specific matter document instance. | **NO.** Tied via FK `documentId` to a matter document; lacks template placeholders, categories, or recipe metadata. |
| `DocumentTemplate` | **DOES NOT EXIST.** | **REQUIRED.** |
| `TemplateVersion` | **DOES NOT EXIST.** | **REQUIRED.** |
| `DocumentFieldMapping` | **DOES NOT EXIST.** | **REQUIRED.** |
| `DocumentDraft` | **DOES NOT EXIST.** | **REQUIRED.** |

---

## 4. STEP 3 — MariaDB Database & Table Structure Verification

Direct verification of the physical MariaDB database was performed.

### Database Environment:
- **Engine:** MariaDB 10.11.16 LTS (InnoDB Storage Engine)
- **Database Name:** `legal-db`
- **Host / Port:** `localhost:3306`
- **Migration Status (`npx prisma migrate status`):**
  - Applied migrations:
    1. `20261113071216_init`
    2. `20261113093500_add_intake_converted_matter`
  - **Status:** Database schema is 100% up to date with `schema.prisma`. No pending, unapplied, or drifted migrations.

### Table Verification:
```sql
SHOW TABLES LIKE '%template%'; --> 0 rows returned
SHOW TABLES LIKE '%draft%';    --> 0 rows returned
SHOW TABLES LIKE '%mapping%';  --> 0 rows returned
```

Physical tables `documents` and `document_versions` were inspected:
- `documents`: 14 columns (`id`, `document_code`, `matter_id`, `client_id`, `title`, `category`, `current_version`, `is_privileged`, `privilege_type`, `ocr_content`, `bates_number_start`, `bates_number_end`, `created_at`, `updated_at`).
- `document_versions`: 11 columns (`id`, `document_id`, `version_label`, `file_name`, `file_type`, `file_size_bytes`, `s3_storage_key`, `sha256_checksum`, `uploaded_by_user_id`, `revision_notes`, `uploaded_at`).

**Conclusion:** Zero collisions exist between physical MariaDB tables and the proposed document automation entities.

---

## 5. STEP 4 — Proposed Entity & Field-by-Field Classification

Every proposed entity and attribute has been evaluated against existing database tables, the client specification (`Developer_Instructions_Open_Source_and_Automation.docx` and `Next_Development_Instructions_and_300_Document_Automations.docx`), and Utah legal practice requirements.

### Entity 1: `document_templates` (`DocumentTemplate`)
*Purpose: Reusable catalog registry for ~300 legal templates across 9 practice areas.*

| Proposed Field | Column Name | Type & Constraints | Status | Technical Rationale & Mapping |
|---|---|---|:---:|---|
| `id` | `id` | `VARCHAR(36)` PK (UUIDv4) | **MISSING** | Standard primary key matching system conventions. |
| `templateCode` | `template_code` | `VARCHAR(50)` UNIQUE NOT NULL | **MISSING** | Unique alphanumeric business code (e.g. `TPL-LIT-001`, `UT-DIV-PET-001`). Matches pattern in `tasks` (`task_code`) and `documents` (`document_code`). |
| `templateName` | `template_name` | `VARCHAR(255)` NOT NULL | **MISSING** | Descriptive title of the legal form or pleading. |
| `description` | `description` | `TEXT` NULL | **MISSING** | Explains procedural context, court rules, and required trigger events. |
| `practiceAreaId` | `practice_area_id` | `VARCHAR(50)` NOT NULL (FK) | **MISSING** | Links template to existing `practice_areas.id`. Restricts template filtering by legal department. |
| `category` | `category` | `VARCHAR(100)` NOT NULL | **MISSING** | Functional grouping: "Pleadings", "Discovery", "Notices", "Agreements", "Medical Records", "Client Intake". |
| `outputFormat` | `output_format` | `VARCHAR(20)` DEFAULT 'DOCX' | **MISSING** | Output capabilities: `DOCX`, `PDF`, or `BOTH`. |
| `currentVersion` | `current_version` | `VARCHAR(20)` DEFAULT 'v1.0' | **MISSING** | Tracks published version pointer (e.g. "v1.0", "v2.1"). |
| `isActive` | `is_active` | `BOOLEAN` DEFAULT TRUE | **MISSING** | Soft-disables retired templates without breaking historical draft associations. |
| `isSystemDefault`| `is_system_default`| `BOOLEAN` DEFAULT FALSE | **NEEDS CLIENT CONFIRMATION** | Protects firm-wide core Utah templates from unauthorized deletion/modification by non-admin staff. |
| `createdById` | `created_by_user_id` | `VARCHAR(36)` NOT NULL (FK) | **MISSING** | Audit link to `users.id` who authored or imported the template. |
| `createdAt` | `created_at` | `DATETIME(3)` DEFAULT NOW() | **MISSING** | Creation timestamp. |
| `updatedAt` | `updated_at` | `DATETIME(3)` UPDATED AT | **MISSING** | Last modification timestamp. |

---

### Entity 2: `template_versions` (`TemplateVersion`)
*Purpose: Immutable storage and change tracking for `.docx` binary templates.*

| Proposed Field | Column Name | Type & Constraints | Status | Technical Rationale & Mapping |
|---|---|---|:---:|---|
| `id` | `id` | `VARCHAR(36)` PK (UUIDv4) | **MISSING** | Primary key. |
| `templateId` | `template_id` | `VARCHAR(36)` NOT NULL (FK) | **MISSING** | Foreign key referencing parent `document_templates.id`. |
| `versionNumber` | `version_number` | `VARCHAR(20)` NOT NULL | **MISSING** | Semantic or sequential version label (`v1.0`, `v1.1`, `v2.0`). Combined with `template_id` in unique composite constraint. |
| `docxStorageKey` | `docx_storage_key` | `VARCHAR(500)` NOT NULL | **MISSING** | Absolute storage key or relative path to template binary containing merge tags (e.g. `templates/pi/rep-letter-v1.0.docx`). |
| `sha256Checksum` | `sha256_checksum` | `VARCHAR(64)` NOT NULL | **MISSING** | Cryptographic hash ensuring binary integrity and non-tampering (matches `document_versions` pattern). |
| `status` | `status` | `VARCHAR(30)` DEFAULT 'Draft' | **MISSING** | Version lifecycle: `Draft`, `Published`, `Archived`, `Deprecated`. |
| `changeSummary` | `change_summary` | `TEXT` NULL | **MISSING** | Attorney / Administrator notes detailing statutory or clause revisions. |
| `createdById` | `created_by_user_id` | `VARCHAR(36)` NOT NULL (FK) | **MISSING** | Audit link to `users.id` who uploaded this version. |
| `createdAt` | `created_at` | `DATETIME(3)` DEFAULT NOW() | **MISSING** | Publication timestamp. |

---

### Entity 3: `document_field_mappings` (`DocumentFieldMapping`)
*Purpose: Declarative dictionary linking template placeholder tags to system entities.*

| Proposed Field | Column Name | Type & Constraints | Status | Technical Rationale & Mapping |
|---|---|---|:---:|---|
| `id` | `id` | `VARCHAR(36)` PK (UUIDv4) | **MISSING** | Primary key. |
| `templateVersionId`| `template_version_id`| `VARCHAR(36)` NOT NULL (FK) | **MISSING** | Ties mappings to a specific template version snapshot so tag updates don't break old versions. |
| `placeholderTag` | `placeholder_tag` | `VARCHAR(150)` NOT NULL | **MISSING** | Exact merge tag in `.docx` (e.g. `{{Client.Name}}`, `{{Court.Judge}}`, `{{Matter.CaseDocketNumber}}`). |
| `sourceEntity` | `source_entity` | `VARCHAR(50)` NOT NULL | **MISSING** | Target database entity: `Client`, `Matter`, `ResponsibleAttorney`, `Intake`, `WorkflowStage`, `CustomField`. |
| `sourceField` | `source_field` | `VARCHAR(100)` NOT NULL | **MISSING** | Database column name or JSON path (e.g. `name`, `caseDocketNumber`, `courtName`, `billingRate`). |
| `isRequired` | `is_required` | `BOOLEAN` DEFAULT TRUE | **MISSING** | If `TRUE` and database value is `NULL`, document generator flags draft as missing critical info. |
| `defaultValue` | `default_value` | `VARCHAR(255)` NULL | **MISSING** | Fallback text if database column is null (e.g. `"[NOT SPECIFIED]"` or `"N/A"`). |
| `formattingRule` | `formatting_rule` | `VARCHAR(50)` NULL | **MISSING** | Text transformer: `UPPERCASE`, `DATE_LONG`, `DATE_COURT`, `CURRENCY_USD`, `PHONE_STANDARD`. |
| `conditionalExpression`| `conditional_expression`| `VARCHAR(255)` NULL | **NEEDS CLIENT CONFIRMATION** | Logic for optional paragraphs (e.g. `Matter.billingType == 'Contingency'`). |
| `createdAt` | `created_at` | `DATETIME(3)` DEFAULT NOW() | **MISSING** | Creation timestamp. |
| `updatedAt` | `updated_at` | `DATETIME(3)` UPDATED AT | **MISSING** | Modification timestamp. |

---

### Entity 4: `document_drafts` (`DocumentDraft`)
*Purpose: Living working legal draft generated from a template, awaiting attorney review.*

| Proposed Field | Column Name | Type & Constraints | Status | Technical Rationale & Mapping |
|---|---|---|:---:|---|
| `id` | `id` | `VARCHAR(36)` PK (UUIDv4) | **MISSING** | Primary key. |
| `draftCode` | `draft_code` | `VARCHAR(50)` UNIQUE NOT NULL | **MISSING** | Unique reference code (e.g. `DFT-2026-00412`). |
| `matterId` | `matter_id` | `VARCHAR(36)` NOT NULL (FK) | **MISSING** | Links draft directly to case matter in `matters.id`. |
| `clientId` | `client_id` | `VARCHAR(36)` NOT NULL (FK) | **MISSING** | Links draft to client in `clients.id`. |
| `templateId` | `template_id` | `VARCHAR(36)` NOT NULL (FK) | **MISSING** | References parent `document_templates.id`. |
| `templateVersionId`| `template_version_id`| `VARCHAR(36)` NOT NULL (FK) | **MISSING** | References exact `template_versions.id` used for generation. |
| `title` | `title` | `VARCHAR(255)` NOT NULL | **MISSING** | Document title (e.g. "Complaint - Smith v. Jones"). |
| `status` | `status` | `VARCHAR(30)` DEFAULT 'Draft' | **MISSING** | Workflow state: `Draft`, `Under Review`, `Approved`, `Finalized`, `Stale`. |
| `docxStorageKey` | `docx_storage_key` | `VARCHAR(500)` NULL | **MISSING** | Storage path to generated `.docx` file in draft storage. |
| `pdfStorageKey` | `pdf_storage_key` | `VARCHAR(500)` NULL | **MISSING** | Storage path to rendered preview `.pdf` file. |
| `missingFieldsFlags`| `missing_fields_flags`| `JSON` NOT NULL | **MISSING** | JSON array of detected missing tags requiring attorney or paralegal attention prior to filing. |
| `generatedByUserId`| `generated_by_user_id`| `VARCHAR(36)` NOT NULL (FK) | **MISSING** | User who clicked Generate, or `SYSTEM` automation bot. |
| `reviewedByUserId` | `reviewed_by_user_id` | `VARCHAR(36)` NULL (FK) | **MISSING** | Attorney who reviewed and approved the draft. |
| `reviewedAt` | `reviewed_at` | `DATETIME(3)` NULL | **MISSING** | Timestamp of attorney clearance. |
| `hasManualEdits` | `has_manual_edits` | `BOOLEAN` DEFAULT FALSE | **MISSING** | Flags if attorney edited the `.docx` outside or inside the app. |
| `isStale` | `is_stale` | `BOOLEAN` DEFAULT FALSE | **MISSING** | Set to `TRUE` if underlying Matter/Client records were updated after draft generation date. |
| `finalDocumentId` | `final_document_id` | `VARCHAR(36)` NULL (FK) | **MISSING** | When finalized, points to permanent immutable entry in `documents.id`. |
| `createdAt` | `created_at` | `DATETIME(3)` DEFAULT NOW() | **MISSING** | Creation timestamp. |
| `updatedAt` | `updated_at` | `DATETIME(3)` UPDATED AT | **MISSING** | Modification timestamp. |

---

## 6. STEP 5 — Relationship & Integrity Analysis

To prevent database corruption, orphan records, or accidental deletion of legal work product, foreign key constraints, cascading behaviors, and uniqueness rules must adhere to strict legal practice standards:

### 1. Foreign Key Cascades vs. Restrictions
```text
PracticeArea (1) <--- [ON DELETE RESTRICT] --- (M) DocumentTemplate
  └── Deleting a practice area must NEVER wipe firm templates.

DocumentTemplate (1) <--- [ON DELETE CASCADE] --- (M) TemplateVersion
  └── If an unpublished custom template is purged, its version records may cascade.

TemplateVersion (1) <--- [ON DELETE CASCADE] --- (M) DocumentFieldMapping
  └── Mappings belong directly to a version; deleting the version cascades mappings.

TemplateVersion (1) <--- [ON DELETE RESTRICT] --- (M) DocumentDraft
  └── CRITICAL: Deleting a template version must NEVER delete or orphan historical legal drafts!

Matter (1) <--- [ON DELETE CASCADE] --- (M) DocumentDraft
  └── If a test matter is deleted, associated working drafts cascade.

Client (1) <--- [ON DELETE RESTRICT] --- (M) DocumentDraft
  └── Clients with active legal drafts cannot be deleted without matter cleanup.

User (1) <--- [ON DELETE RESTRICT] --- (M) DocumentTemplate (as createdBy)
  └── Departing attorneys/staff cannot cause template deletion.
```

### 2. Unique Constraints & Compound Indexes
- **`document_templates.template_code`:** `UNIQUE` (Enforces standard alphanumeric identifiers across practice groups).
- **`template_versions.[template_id, version_number]`:** `UNIQUE` composite constraint (Prevents duplicate version tags under the same template).
- **`document_drafts.draft_code`:** `UNIQUE` (Ensures unambiguous draft referencing across billing and matter teams).
- **`document_field_mappings.[template_version_id, placeholder_tag]`:** `UNIQUE` composite constraint (Prevents conflicting collision mappings for the same placeholder in a single template version).

### 3. Performance Indexing Strategy
To ensure sub-second response times across 300 templates and thousands of matter drafts:
- `idx_doc_templates_practice_area`: `[practice_area_id, category, is_active]`
- `idx_doc_drafts_matter`: `[matter_id, status]`
- `idx_doc_drafts_client`: `[client_id]`
- `idx_doc_drafts_stale`: `[is_stale, status]`
- `idx_field_mappings_version`: `[template_version_id]`

### 4. Database Transaction Requirements
Atomic `$transaction` guarantees must be enforced in the service layer:
1. **Template Creation Transaction:** Inserting `DocumentTemplate` + initial `TemplateVersion` + parsed default `DocumentFieldMapping`s must succeed or fail as an indivisible unit.
2. **Draft Finalization Transaction:** Moving a draft to the Document Vault must atomically:
   - Create a row in `documents` (`category = 'Filed Pleadings'` or `'Generated Agreements'`).
   - Create a row in `document_versions` (`s3_storage_key = finalDocxStorageKey`, checksum calculation).
   - Update `document_drafts` (`status = 'Finalized'`, `final_document_id = document.id`).
   - Write an immutable record to `audit_logs`.

---

## 7. STEP 6 — Existing Data & Migration Impact Analysis

### 1. Purely Additive Nature
- The 4 proposed tables introduce **zero column alterations, zero index drops, and zero data migrations** across existing tables.
- All existing 28 models and MariaDB tables will retain their exact schema, relationships, and data.
- Existing records in `users`, `clients`, `matters`, `intakes`, `documents`, `document_versions`, and financial ledgers will experience **zero downtime and zero regression risk**.

### 2. Backward Compatibility with Existing Document Vault
- The existing `documents` and `document_versions` tables remain the permanent, immutable repository for client-facing filed records and uploaded evidence.
- The new `document_drafts` table acts as a staging and generation pipeline. When an attorney approves a generated draft, the document is sealed into `documents` and `document_versions`, maintaining full backward compatibility with the existing Document Vault UI.

---

## 8. STEP 7 — Developer Coordination & Risk Assessment

### 1. Current Git Merge State
- The workspace currently exhibits an ongoing Git merge resolution between `origin/main` and `main` with staged files `P0_BACKEND_REMEDIATION_REPORT.md` and `P0_REMEDIATION_INDEPENDENT_VERIFICATION.md`.
- **Precaution:** To maintain developer safety and prevent merge conflicts, the actual migration implementation (Phase 1.1) should only be executed once the lead developer has committed the merge resolution, or should be isolated strictly to a clean, non-conflicting migration file.

### 2. Migration Isolation Strategy
- When approved, the migration will be generated using a deterministic timestamped name:
  `20261113XXXXXX_add_document_automation_foundation`
- The migration SQL will strictly contain:
  - `CREATE TABLE document_templates ...`
  - `CREATE TABLE template_versions ...`
  - `CREATE TABLE document_field_mappings ...`
  - `CREATE TABLE document_drafts ...`
  - Associated `FOREIGN KEY` constraints and indexes.
- No `DROP TABLE`, `ALTER TABLE ... DROP COLUMN`, or destructive DDL commands will be present.

---

## 9. STEP 8 — Recommended Prisma Schema Definition & Implementation Roadmap

### 1. Recommended Prisma Schema Additions

The following block defines the production-ready schema models designed for inclusion in `backend/prisma/schema.prisma`:

```prisma
// -----------------------------------------------------------------------------
// 10. DOCUMENT AUTOMATION ENGINE (Phase 1 Foundation)
// -----------------------------------------------------------------------------

model DocumentTemplate {
  id              String   @id @default(uuid()) @db.VarChar(36)
  templateCode    String   @unique @map("template_code") @db.VarChar(50)
  templateName    String   @map("template_name") @db.VarChar(255)
  description     String?  @db.Text
  practiceAreaId  String   @map("practice_area_id") @db.VarChar(50)
  category        String   @db.VarChar(100)
  outputFormat    String   @default("DOCX") @map("output_format") @db.VarChar(20)
  currentVersion  String   @default("v1.0") @map("current_version") @db.VarChar(20)
  isActive        Boolean  @default(true) @map("is_active")
  isSystemDefault Boolean  @default(false) @map("is_system_default")
  createdById     String   @map("created_by_user_id") @db.VarChar(36)
  createdAt       DateTime @default(now()) @map("created_at") @db.DateTime(3)
  updatedAt       DateTime @updatedAt @map("updated_at") @db.DateTime(3)

  practiceArea   PracticeArea      @relation(fields: [practiceAreaId], references: [id], onDelete: Restrict)
  createdByUser  User              @relation("TemplateCreator", fields: [createdById], references: [id], onDelete: Restrict)
  versions       TemplateVersion[]
  drafts         DocumentDraft[]

  @@index([practiceAreaId, category, isActive], name: "idx_doc_templates_search")
  @@map("document_templates")
}

model TemplateVersion {
  id             String   @id @default(uuid()) @db.VarChar(36)
  templateId     String   @map("template_id") @db.VarChar(36)
  versionNumber  String   @map("version_number") @db.VarChar(20)
  docxStorageKey String   @map("docx_storage_key") @db.VarChar(500)
  sha256Checksum String   @map("sha256_checksum") @db.VarChar(64)
  status         String   @default("Draft") @db.VarChar(30)
  changeSummary  String?  @map("change_summary") @db.Text
  createdById    String   @map("created_by_user_id") @db.VarChar(36)
  createdAt      DateTime @default(now()) @map("created_at") @db.DateTime(3)

  template       DocumentTemplate       @relation(fields: [templateId], references: [id], onDelete: Cascade)
  createdByUser  User                   @relation("TemplateVersionCreator", fields: [createdById], references: [id], onDelete: Restrict)
  fieldMappings  DocumentFieldMapping[]
  drafts         DocumentDraft[]

  @@unique([templateId, versionNumber], name: "uq_template_version")
  @@map("template_versions")
}

model DocumentFieldMapping {
  id                    String   @id @default(uuid()) @db.VarChar(36)
  templateVersionId     String   @map("template_version_id") @db.VarChar(36)
  placeholderTag        String   @map("placeholder_tag") @db.VarChar(150)
  sourceEntity          String   @map("source_entity") @db.VarChar(50)
  sourceField           String   @map("source_field") @db.VarChar(100)
  isRequired            Boolean  @default(true) @map("is_required")
  defaultValue          String?  @map("default_value") @db.VarChar(255)
  formattingRule        String?  @map("formatting_rule") @db.VarChar(50)
  conditionalExpression String?  @map("conditional_expression") @db.VarChar(255)
  createdAt             DateTime @default(now()) @map("created_at") @db.DateTime(3)
  updatedAt             DateTime @updatedAt @map("updated_at") @db.DateTime(3)

  templateVersion TemplateVersion @relation(fields: [templateVersionId], references: [id], onDelete: Cascade)

  @@unique([templateVersionId, placeholderTag], name: "uq_version_placeholder")
  @@index([templateVersionId], name: "idx_field_mappings_version")
  @@map("document_field_mappings")
}

model DocumentDraft {
  id                 String    @id @default(uuid()) @db.VarChar(36)
  draftCode          String    @unique @map("draft_code") @db.VarChar(50)
  matterId           String    @map("matter_id") @db.VarChar(36)
  clientId           String    @map("client_id") @db.VarChar(36)
  templateId         String    @map("template_id") @db.VarChar(36)
  templateVersionId  String    @map("template_version_id") @db.VarChar(36)
  title              String    @db.VarChar(255)
  status             String    @default("Draft") @db.VarChar(30)
  docxStorageKey     String?   @map("docx_storage_key") @db.VarChar(500)
  pdfStorageKey      String?   @map("pdf_storage_key") @db.VarChar(500)
  missingFieldsFlags Json      @map("missing_fields_flags")
  generatedByUserId  String    @map("generated_by_user_id") @db.VarChar(36)
  reviewedByUserId   String?   @map("reviewed_by_user_id") @db.VarChar(36)
  reviewedAt         DateTime? @map("reviewed_at") @db.DateTime(3)
  hasManualEdits     Boolean   @default(false) @map("has_manual_edits")
  isStale            Boolean   @default(false) @map("is_stale")
  finalDocumentId    String?   @map("final_document_id") @db.VarChar(36)
  createdAt          DateTime  @default(now()) @map("created_at") @db.DateTime(3)
  updatedAt          DateTime  @updatedAt @map("updated_at") @db.DateTime(3)

  matter          Matter           @relation(fields: [matterId], references: [id], onDelete: Cascade)
  client          Client           @relation(fields: [clientId], references: [id], onDelete: Restrict)
  template        DocumentTemplate @relation(fields: [templateId], references: [id], onDelete: Restrict)
  templateVersion TemplateVersion  @relation(fields: [templateVersionId], references: [id], onDelete: Restrict)
  generatedByUser User             @relation("DraftGenerator", fields: [generatedByUserId], references: [id], onDelete: Restrict)
  reviewedByUser  User?            @relation("DraftReviewer", fields: [reviewedByUserId], references: [id], onDelete: SetNull)
  finalDocument   Document?        @relation("FinalizedDraftDocument", fields: [finalDocumentId], references: [id], onDelete: SetNull)

  @@index([matterId, status], name: "idx_doc_drafts_matter")
  @@index([clientId], name: "idx_doc_drafts_client")
  @@index([isStale, status], name: "idx_doc_drafts_stale")
  @@map("document_drafts")
}
```

### 2. Reverse Relations to Add to Existing Models:
- In `User`:
  ```prisma
  templatesCreated       DocumentTemplate[]       @relation("TemplateCreator")
  templateVersionsUpload TemplateVersion[]        @relation("TemplateVersionCreator")
  draftsGenerated        DocumentDraft[]          @relation("DraftGenerator")
  draftsReviewed         DocumentDraft[]          @relation("DraftReviewer")
  ```
- In `PracticeArea`:
  ```prisma
  documentTemplates DocumentTemplate[]
  ```
- In `Matter`:
  ```prisma
  documentDrafts DocumentDraft[]
  ```
- In `Client`:
  ```prisma
  documentDrafts DocumentDraft[]
  ```
- In `Document`:
  ```prisma
  originatingDrafts DocumentDraft[] @relation("FinalizedDraftDocument")
  ```

---

## 10. Phase 1.1 Implementation Roadmap (Actionable Steps)

Once the user approves proceeding to implementation, execution should follow these sequential steps:

1. **Pre-Implementation Database Backup:**
   - Execute a safe `mysqldump` snapshot of `legal-db` prior to running DDL changes.
2. **Schema Integration:**
   - Append the verified models to `backend/prisma/schema.prisma` and add reverse relations to `User`, `PracticeArea`, `Matter`, `Client`, and `Document`.
3. **Migration Creation:**
   - Generate the clean migration via `npx prisma migrate dev --create-only --name add_document_automation_foundation`.
   - Inspect generated SQL for 100% additive safety.
4. **Migration Deployment:**
   - Deploy migration via `npx prisma migrate deploy`.
5. **Prisma Client Regeneration & Build Check:**
   - Run `npm run prisma:generate`.
   - Validate zero TypeScript errors with `npx tsc --noEmit`.
6. **Initial Seed Script (`seed-document-templates.ts`):**
   - Seed the 4 core practice templates currently mocked in `TemplatesSettings.jsx` (`TPL-01` through `TPL-04`) along with their default placeholder field mappings.

---
*Report certified by Principal Enterprise Database Architect & Senior Security Auditor.*  
*Audit status: READ-ONLY VERIFICATION COMPLETE.*

