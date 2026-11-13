# DATABASE REQUIREMENTS GAP ANALYSIS
## HEUGLY & BLUDWORTH — LEGAL MANAGEMENT SOFTWARE

- **Project Root**: `D:\Kiaan\legal-pro`
- **Documentation Baseline**: `backend-docs/` (Specifically `03-DATABASE-DESIGN.md`, `04-ENTITY-RELATIONSHIPS.md`, `07-BUSINESS-LOGIC-AND-WORKFLOWS.md`)
- **Live Database**: MySQL `legal-db` (MariaDB 10.4.32)
- **Audit Date**: November 13, 2026
- **Auditor**: Independent Technical Auditor (Antigravity Core)

---

## 1. PROJECT REQUIREMENTS VS EXISTING DATABASE

The Heugly & Bludworth legal software architecture requires a robust relational model satisfying:
1. **Utah Rules of Professional Conduct (RPC 1.15)** for client trust accounting and double-entry reconciliation.
2. **Filevine-style workflow progression** for practice area phases and task triggers.
3. **UTBMS / LEDES legal billing compliance** (e-billing activity codes A101–A109, expense codes E101–E124).
4. **Document vault privileges & versioning** under Utah RPC 1.6 (client confidentiality).
5. **Granular Role-Based Access Control (RBAC)** across 5 staff tiers.

### Module Coverage Matrix

| Module / Subsystem | Documented Entity Requirements | Existing Database Tables | Missing Entities / Columns | Relational Integrity | Overall Database Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **1. Authentication & RBAC** | `users`, `roles`, `role_permissions` | `users`, `roles`, `role_permissions` | None | Fully enforced via FKs and unique composite keys | **COMPLETE** |
| **2. Clients & CRM** | `clients` | `clients` | Independent `contacts` junction table for secondary parties | `assigned_attorney_id` FK to `users` | **COMPLETE (95%)** |
| **3. Intake & Conflicts** | `intakes`, `conflict_search_logs` | `intakes`, `conflict_search_logs` | `converted_matter_id` (optional direct link) | FKs to `practice_areas`, `users`, `clients` | **COMPLETE (95%)** |
| **4. Practice Areas & Matters**| `practice_areas`, `matters`, `matter_staff_assignments` | `practice_areas`, `matters`, `matter_staff_assignments` | None. Practice fields covered via `custom_fields_json` | FKs to `clients`, `practice_areas`, `users` | **COMPLETE** |
| **5. Filevine Workflows** | `workflow_stages`, `matter_stage_histories` | `workflow_stages`, `matter_stage_histories` | None | FKs to `matters`, `workflow_stages`, `users` | **COMPLETE** |
| **6. Tasks & Docketing** | `tasks`, `calendar_events` | `tasks`, `calendar_events` | None | FKs to `matters`, `users` | **COMPLETE** |
| **7. Time & Passive Capture**| `time_entries`, `suggested_billing_captures` | `time_entries`, `suggested_billing_captures` | None | FKs to `matters`, `users`, `invoices` | **COMPLETE** |
| **8. Disbursements & Costs** | `expenses` | `expenses` | None | FKs to `matters`, `users`, `invoices` | **COMPLETE** |
| **9. Invoicing & Receivables** | `invoices`, `invoice_line_items`, `payment_records` | `invoices`, `invoice_line_items`, `payment_records` | None | FKs to `matters`, `clients`, `invoices`, `time_entries`, `expenses` | **COMPLETE** |
| **10. Client Trust (IOLTA)** | `trust_sub_ledgers`, `trust_transactions` | `trust_sub_ledgers`, `trust_transactions` | None | Unique key on `(client_id, matter_id)`; FK to `invoices` | **COMPLETE** |
| **11. General Ledger & Audit**| `chart_of_accounts`, `general_ledger_journals`, `general_ledger_entries`, `three_way_reconciliations` | `chart_of_accounts`, `general_ledger_journals`, `general_ledger_entries`, `three_way_reconciliations` | None | Double-entry debit/credit ledger enforced | **COMPLETE** |
| **12. Document Management** | `documents`, `document_versions` | `documents`, `document_versions` | BigInt serialization fix in app layer | FKs to `matters`, `clients`, `users`; unique `[document_id, version_label]` | **COMPLETE** |
| **13. Audit Trails** | `audit_logs` | `audit_logs` | None | Microsecond timestamps, JSON details | **COMPLETE** |

---

## 2. DETAILED GAP ANALYSIS & ARCHITECTURAL GAPS

### Gap 1: BigInt Representation in `document_versions.file_size_bytes`
- **Component**: Model `DocumentVersion` (Line 598 in `schema.prisma`).
- **Severity**: **HIGH**
- **Description**: Stored as `BigInt` in Prisma / `BIGINT` in MySQL. While technically suitable for multi-gigabyte litigation evidence files, native Node.js JSON serialization throws an unhandled exception when serializing BigInt values.
- **Recommended Remediation**:
  In `backend/src/app.ts`:
  ```typescript
  (BigInt.prototype as any).toJSON = function (): number {
    return Number(this);
  };
  ```

### Gap 2: Direct Intake-to-Matter Conversion Tracking
- **Component**: Model `Intake` (Lines 118–145).
- **Severity**: **MEDIUM**
- **Description**: `intakes.converted_client_id` accurately links to `clients.id`. However, if the business workflow transitions directly from an intake to a newly opened matter, the intake record does not maintain a direct foreign key to `matters.id`.
- **Recommended Remediation**:
  Add column to `Intake` in `schema.prisma`:
  ```prisma
  convertedMatterId  String?  @map("converted_matter_id") @db.VarChar(36)
  convertedMatter    Matter?  @relation("ConvertedMatter", fields: [convertedMatterId], references: [id], onDelete: SetNull)
  ```

### Gap 3: Standalone Contacts Table vs Client Model
- **Component**: Client Management CRM.
- **Severity**: **LOW**
- **Description**: The frontend has tabs for "Related Parties" and "Contacts" (witnesses, opposing counsel, judges, adjusters). Currently, `clients` stores `primary_contact` as a string, and `matters.custom_fields_json` stores related party data.
- **Recommended Remediation**:
  A dedicated `contacts` table can be added in a future phase (Phase 3) if multi-party contact management requires independent relational queries. The current JSON structure is sufficient for the initial launch.

### Gap 4: Workflow Stage Initial Data Seeding
- **Component**: `workflow_stages`.
- **Severity**: **LOW**
- **Description**: While `practice_areas` (9 rows), `roles` (5 rows), `role_permissions` (193 rows), and `chart_of_accounts` (6 rows) are seeded, `workflow_stages` has 0 rows in the live database.
- **Recommended Remediation**:
  Seed standard Filevine stages (e.g. `Intake`, `Investigation`, `Pleadings`, `Discovery`, `Settlement/Trial`, `Closed`) into `workflow_stages` for each practice area.

---

## 3. PRIORITIZED DATABASE REMEDIATION REGISTER

| Priority | Item | Target Table | Type of Action | Impact if Not Addressed |
| :---: | :--- | :--- | :--- | :--- |
| **P1** | Add BigInt JSON Serializer | Application Layer / `app.ts` | Code Polyfill | Runtime crash (HTTP 500) on document endpoints |
| **P2** | Seed Initial Super Admin | `users` | CLI Script Execution | Admin login & user management tests fail |
| **P3** | Add `converted_matter_id` | `intakes` | Schema Migration | Cannot navigate from intake directly to created matter |
| **P4** | Seed `workflow_stages` | `workflow_stages` | Seed Data | Matters cannot transition workflow stages |
| **P5** | Add `contacts` Table | CRM Subsystem | Future Migration | Extended litigation contact directory delayed |

