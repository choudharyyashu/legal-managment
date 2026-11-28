# LEGALPRO – PRIORITY IMPLEMENTATION PLAN
## DEPENDENCY-AWARE, SAFE, PHASE-WISE EXECUTION BLUEPRINT

**Project Path:** `D:\Kiaan\legal-pro`  
**Client:** Dusten L. Heugly (Heugly & Bludworth, PLLC)  
**Reference Document:** `LEGALPRO_CLIENT_REQUIREMENTS_GAP_AUDIT.md`  
**Standard:** Strict Pre-Implementation Investigation & Verified Planning Only (Zero Code/Database Edits)  
**Date:** November 28, 2026  
**Auditor / Architect:** DeepMind Agentic Assistant (Antigravity)

---

## 1. PHASE 0 – GIT SAFETY PREFLIGHT RESULTS

Prior to conducting code inspection or drafting this implementation blueprint, repository and environment safety was independently checked:

| Parameter | Observed State | Safety Verdict |
| :--- | :--- | :---: |
| **Project Directory** | `D:\Kiaan\legal-pro` | **CONFIRMED** |
| **Current Branch** | `main` | **CONFIRMED** |
| **Branch Upstream** | `[origin/main: behind 6]` (Collaborator commits ahead on remote) | **PRESERVED** |
| **HEAD Commit** | `31ed32d` (`yyyyddddd`) by Yashwant Choudhary | **CLEAN** |
| **Working Tree Status** | Clean (Zero modified, zero staged changes). Single untracked report: `LEGALPRO_CLIENT_REQUIREMENTS_GAP_AUDIT.md` | **SAFE** |
| **Merge / Rebase / Cherry-Pick** | No active Git operations in progress | **CLEAN** |
| **Database Environment** | Local MariaDB/MySQL (`mysql://root:@localhost:3306/legal-db`). Railway proxy commented out. | **ISOLATED** |
| **Editor Swap Files** | No `.swp`, `.~`, or orphaned locks detected | **CLEAN** |

---

## 2. PHASE 1 – INDEPENDENT AUDIT FINDINGS VERIFICATION MATRIX

Every finding in `LEGALPRO_CLIENT_REQUIREMENTS_GAP_AUDIT.md` was cross-examined directly against the active source files, routes, database tables, and tests:

| Finding ID | Finding Description | Exact File Location & Function | Current Behavior | Expected Client Behavior | Audit Status | Regression Risk |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **VF-01** | **Workflow Configurator Save Button is a Mock** | `frontend/src/features/settings/pages/WorkflowManager.jsx` (lines 279–284, `handleSaveAll`) | Only invokes `addToast('... successfully saved to database!', 'success')`. Executes zero HTTP calls. Zero database persistence. | Must call `workflowService` to persist stage updates, required gatekeepers, and auto-tasks to MySQL InnoDB. | **VERIFIED** | **Low:** Backend endpoints `PUT /workflows/stages/:id/checklist` already exist. |
| **VF-02** | **Configurator Omits 4 Core Practice Areas** | `frontend/src/data/practiceAreaWorkflows.js` (lines 8–340, `PRACTICE_AREA_WORKFLOWS`) | Array keys define 5 valid areas + 4 legacy dummy categories (Commercial Law, Real Estate, Municipal Law, Labor). Appeals, Landlord-Tenant, Bankruptcy, and Immigration are 100% missing. | Configurator must allow selecting and customizing all 9 client practice areas. | **VERIFIED** | **Medium:** UI state shape must match canonical practice area IDs (`pa-app`, `pa-evict`, `pa-bk`, `pa-imm`). |
| **VF-03** | **Probate Workflow Lacks Required Stages** | `backend/src/scripts/seed-workflow-stages.ts` (lines 148–174) & MySQL `workflow_stages` | Only 3 stages exist: `PROB-1` (Petition), `PROB-2` (Letters/Inventory), `PROB-3` (Creditor Audit/Distribution). | Client requires 7 distinct procedural stages: 1. Appointment, 2. Notices, 3. Creditor claims, 4. Inventory, 5. Accounting, 6. Distribution, 7. Closing. | **VERIFIED** | **Low:** Database schema supports arbitrary stage orders per practice area. |
| **VF-04** | **Dual Conflicting Settlement Calculators** | `frontend/src/app/router.jsx` (lines 310, 515) & `features/billing/pages/` vs `features/personal-injury/pages/` | Two separate calculators mounted: `/billing/settlement-calculator` and `/personal-injury/settlement-calculator` with divergent state. | Single, authoritative, unified settlement calculation experience accessible across billing and PI workspaces. | **VERIFIED** | **Medium:** Navigation links from PI workspace and Billing workspace must point to unified engine. |
| **VF-05** | **Custom 30% Contingency Fee Unavailable** | `billing/pages/SettlementCalculator.jsx` (lines 352–356) & `personal-injury/pages/SettlementCalculator.jsx` (lines 361–405) | Dropdown hardcoded to 33.33%, 1/3, 40%, 25%, 50%; PI buttons hardcoded to 33.33%, 1/3, 40%, 25%. No 30% option or custom percentage input. | User must be able to enter custom fee rates (including 30%) or select from matter's signed fee agreement. | **VERIFIED** | **Low:** `settlementCalculations.js` already supports any numeric fee rate. |
| **VF-06** | **Settlement Disconnected from Live Liens & Expenses** | `billing/pages/SettlementCalculator.jsx` (lines 70–73) & `personal-injury/pages/SettlementCalculator.jsx` (lines 113–119) | Initialized only from previous settlement version totals (`latestVersion.totalLitigationCosts/totalMedicalLiens`) or empty arrays. | Must dynamically query live `pi_liens` and unbilled `expenses` for the selected matter via existing APIs. | **VERIFIED** | **Medium:** Requires handling manual overrides without clobbering actual database records. |
| **VF-07** | **Family Law Intake Discrepancy (`26-FAM-0101`)** | MySQL `intakes` (`INT-26-0001`), `clients` (`CLI-1001`), `matters` (`26-FAM-0101`) | `INT-26-0001` has `converted_matter_id = NULL` and `converted_to_client = false`, while `CLI-1001` notes reference intake. | Intake should reflect conversion; root cause was manual creation rather than conversion endpoint. | **VERIFIED** | **None (Read-Only):** Preserved untouched. Future intakes must use `IntakeService.convertToMatter()`. |
| **VF-08** | **Missing Client Portal Auth & Role** | `backend/prisma/schema.prisma` (lines 50–70) & `backend/src/modules/auth/` | No `client` role in DB; only 5 staff roles. Zero `/portal/login` routes or client password hash fields. | Separate client portal authentication with strict matter-level document and invoice isolation. | **VERIFIED** | **High:** Requires adding `client` role and dedicated portal JWT authentication middleware. |
| **VF-09** | **CosmoLex Backend Integration Absent** | `backend/src/modules/integrations/integrations.service.ts` (lines 20–36) | 0% integration code in backend. Only checks if `COSMOLEX_API_KEY` exists in env. CosmoLex is official financial system. | CosmoLex must remain system of record; export batches must be staged without claiming unauthorized live sync. | **VERIFIED** | **Critical:** Must NOT redirect accounting away from CosmoLex until client provides API credentials and approves migration. |
| **VF-10** | **Simulated Communications & Timing Capture** | `backend/src/modules/communications/` & `frontend/src/features/time/components/TimingActivityFeed.jsx` | Manual logging of phone/email only. Timing feed is client-side mock. No iPhone, iMessage, SMS, or VoIP bridge. | Full telephony/message capture requires hardware/VoIP carrier integration and desktop Timing.app agent. | **VERIFIED** | **Blocked on Credentials:** Requires Twilio/VoIP and Azure AD credentials. |
| **VF-11** | **Missing AI Legal Research & Citator** | Entire codebase (`backend/src/` & `frontend/src/`) | Zero citator, citation verification, Westlaw/CoCounsel API, or authority checking logic exists. | Full automated legal research requires Lexis/Westlaw API licensing. | **VERIFIED** | **Blocked on Licensing:** Third-party research API licensing not supplied. |
| **VF-12** | **Remaining 289 Document Automations Unwired** | `backend/src/modules/documents/events/auto-draft.service.ts` | 300 DOCX files and 300 DB templates exist. 11 workflows wired to automatic event handlers. Remaining 289 unwired. | Can be generated on-demand via `DocumentGenerationService`; automated event listeners remain to be wired progressively. | **VERIFIED** | **Low:** Templates are functional for on-demand generation. |

---

## 3. CONFIRMED WORKING FUNCTIONALITY (MUST PRESERVE)

Any future implementation must strictly protect the following verified and passing components:
1. **Local MySQL Relational Integrity:** 53 InnoDB tables, active foreign key constraints, connection pool on `localhost:3306/legal-db`.
2. **Master Document Template Registry:** 305 registered templates in `document_templates` and 305 versions in `template_versions` (v1.0 Published).
3. **Physical DOCX Template Files:** 300 valid OpenXML Microsoft Word files in `storage/templates/CAT-001/` through `CAT-300/`.
4. **The 11 Verified Real DB Workflows:**
   - CAT-001 (Consultation Confirmation Letter)
   - CAT-002 (Prospective Client Questionnaire)
   - CAT-003 (Conflict Search Report with `CONFLICT_ALERT` safeguard)
   - CAT-300 (Eviction Closure with `FINANCIAL_SAFEGUARD` enforcing remaining balance)
   - CAT-096 (Liability Insurer Representation Letter)
   - CAT-112 (Medical Authorization Request)
   - CAT-113 (Medical Records Request)
   - CAT-116 (Incomplete Records Follow-Up Notice)
   - CAT-130 (Settlement Demand Letter)
   - CAT-140 (Lien Payoff Confirmation Request)
   - CAT-010 (Intake Welcome Letter)
5. **Internal IOLTA Trust Accounting Engine (`TrustService`):** Strict Utah RPC 1.15 overdraft prevention under `SELECT ... FOR UPDATE` row locks; dual-entry General Ledger balancing (Accounts 1020 & 2100).
6. **OCR & Text Extraction Engine (`OcrService`):** Working DOCX XML extraction, PDF text parsing, and Tesseract.js raster image OCR with regex legal entity extraction.
7. **Server-Side RBAC Enforcement:** Five distinct staff roles (`super_admin`, `supervisor`, `attorney`, `billing`, `paralegal`) enforced via `requirePermission` middleware on backend routes.

---

## 4. PHASE-WISE IMPLEMENTATION PLAN

### Priority 1: Workflow Configurator & Practice Area Restoration

#### Objective:
Make `WorkflowManager.jsx` fully persistent and restore all 9 client practice areas, including the 7 client-specified stages for Probate.

#### Detailed Steps:
1. **Restore Canonical Practice Area Workflows in Frontend:**
   - File: `frontend/src/data/practiceAreaWorkflows.js`
   - Action: Replace the 4 non-practice categories with the 4 missing client practice areas:
     - `pa-app`: Appeals (3 stages: Notice of Appeal, Briefing Schedule, Oral Argument/Mandate)
     - `pa-evict`: Landlord-Tenant/Evictions (3 stages: Statutory Notice & Summons, Occupancy Hearing & Writ, Damages Judgment & Collection)
     - `pa-bk`: Bankruptcy (5 stages: Intake/Means Testing, Schedules/Credit Counseling, Petition Filing/341 Prep, Meeting of Creditors, Discharge Order & Closure)
     - `pa-imm`: Immigration (6 stages: Eligibility Audit, Petition Assembly, USCIS Filing/Receipts, Biometrics/RFE, Interview & Adjudication, Permanent Residency & Closure)
2. **Extend Probate Workflow in Database & Seed:**
   - Files: `backend/src/scripts/seed-workflow-stages.ts` & MySQL `workflow_stages` table.
   - Action: Expand `pa-prob` from 3 stages to the client's 7 required procedural stages:
     1. `PROB-1`: Appointment of Personal Representative & Letters
     2. `PROB-2`: Statutory Notices to Heirs & Creditors
     3. `PROB-3`: Creditor Claims Evaluation & Audit
     4. `PROB-4`: Formal Estate Inventory & Appraisal
     5. `PROB-5`: Estate Accounting & Tax Clearance
     6. `PROB-6`: Final Distribution to Beneficiaries
     7. `PROB-7`: Decree of Complete Settlement & Case Closing
3. **Connect `WorkflowManager.jsx` to Real Backend API:**
   - File: `frontend/src/features/settings/pages/WorkflowManager.jsx`
   - Actions:
     - On mount: Call `workflowService.getStages({ practiceAreaId })` to load active database stages.
     - On Add Gatekeeper: Call `workflowService.updateStageChecklist(stageId, updatedFields)` to persist checklist changes to MySQL.
     - On Add Auto-Task: Call `workflowService.addAutomationRule(stageId, ruleData)` to persist task automation chains.
     - On Save All: Iterate over modified stages and call backend endpoints with loading indicators and error handling.
     - On Reset: Prompt confirmation and re-seed practice defaults from database.
4. **Backend Authorization & Validation:**
   - Endpoints in `backend/src/modules/workflows/workflow.routes.ts` already exist and are protected by `requireAnyPermission(['templates:manage', 'matters:edit', 'admin:manage'])`. Ensure firm admins have this permission.

---

### Priority 2: Personal Injury Settlement Calculator Unification & Custom Fee Engine

#### Objective:
Deliver a unified, mathematically rigorous settlement disbursement calculator supporting custom contingency fees (including 30%), pulling live liens from `pi_liens` and unbilled costs from `expenses`.

#### Detailed Steps:
1. **Unify Entry Points:**
   - File: `frontend/src/app/router.jsx`
   - Action: Point `/billing/settlement-calculator` to render the authoritative personal-injury settlement calculator (`PISettlementCalculator`), ensuring both navigation paths load the exact same component and state.
2. **Add Custom Contingency Fee Input (Supporting 30% Acceptance Example):**
   - File: `frontend/src/features/personal-injury/pages/SettlementCalculator.jsx`
   - Actions:
     - Add a dedicated "Custom Percentage" input field beside the preset buttons (33.33%, 1/3, 40%, 25%).
     - Allow typing `30` (or any valid percentage between 1.00% and 60.00%).
     - When matter has `contingencyPercentage: 30`, auto-select and populate 30%.
     - Update calculation state via `calculateSettlement({ grossRecovery, feeRate: 30, ... })`.
3. **Connect Live Matter Liens and Case Expenses:**
   - File: `frontend/src/features/personal-injury/pages/SettlementCalculator.jsx`
   - Actions:
     - On matter selection: Call `piService.getLiens(activeCaseId)` and `expenseService.getExpenses({ matterId: activeCaseId })` in parallel.
     - Map live liens into `medicalLiens` state:
       `{ id: lien.id, holder: lien.lienholderName, originalAmount: lien.claimedAmount, negotiatedAmount: lien.negotiatedAmount || lien.claimedAmount, status: lien.status }`
     - Map live expenses into `caseExpenses` state:
       `{ id: exp.id, description: exp.description, amount: exp.amount, category: exp.category, payee: exp.payee || 'Vendor' }`
     - If approved negotiated payoff changes (e.g. from $7,000 to $6,500), immediately recalculate net client proceeds (from $60,000 to $60,500).
4. **Prevent Duplicate Deductions & Track Payees:**
   - Maintain itemized arrays with unique database UUIDs (`id`).
   - Prevent double-counting if an expense item appears in both general expenses and medical holdbacks.
   - In `ClosingStatementModal.jsx`, display the itemized payee and statutory lienholder names.
5. **Resolve `settlement is not defined` Runtime Error:**
   - File: `frontend/src/features/personal-injury/components/ClosingStatementModal.jsx`
   - Action: Ensure variable naming is strictly standardized to `settlementModel` with fallback default `{}` so no undefined variable references can crash the component.

---

### Priority 3: Family Law Intake Reconciliation & Governance

#### Objective:
Document and govern the relationship between `INT-26-0001` and `26-FAM-0101` without altering historical database records.

#### Detailed Steps:
1. **Preserve Historical Records (No Destructive SQL):**
   - `INT-26-0001` and `26-FAM-0101` remain untouched as historical audit evidence.
2. **Enforce Intake-to-Matter Wizard for All Future Intakes:**
   - File: `frontend/src/features/intake/pages/IntakeList.jsx`
   - Actions:
     - When clicking "Convert to Matter" on a cleared intake, route strictly through `IntakeService.convertToMatter(intakeId)` (which populates `converted_matter_id`).
     - Disable manual creation of matters with unlinked intake notes.
3. **UI Linkage Indicator:**
   - On the matter view for `26-FAM-0101`, if `notes` contain `"Converted from Intake INT-26-0001"`, display an informational badge linking to the intake summary view.

---

### Priority 4: Financial Accounting & CosmoLex Staging

#### Objective:
Maintain CosmoLex as the official financial system of record and establish clean, verifiable batch staging without premature direct replacements.

#### Detailed Steps:
1. **CosmoLex Bridge Staging:**
   - Maintain `CosmoLexSettings.jsx` as a staging and export management dashboard.
   - Structure export batches into standard CosmoLex-compatible CSV and JSON formats containing:
     - Source Record ID
     - Matter Number
     - Transaction Date
     - Timekeeper Initials
     - Hours / Rate / Total
     - Trust Account / Client Sub-Ledger Reference
2. **Protect Internal Trust Accounting:**
   - Do NOT modify `TrustService.ts` or disable Utah RPC 1.15 overdraft prevention.
   - Maintain strict separation: internal ledger tracks client trust sub-ledgers for operational compliance, while CosmoLex remains the official general ledger until explicit client sign-off.
3. **No External Writes Without Credentials:**
   - Live synchronization remains disabled until the client provides valid CosmoLex API credentials (`COSMOLEX_API_KEY`, `COSMOLEX_FIRM_ID`, `COSMOLEX_SECRET`).

---

### Priority 5: Client Portal Authentication Architecture

#### Objective:
Design and implement dedicated, secure client portal authentication without weakening staff RBAC.

#### Detailed Steps:
1. **Prisma Schema Update (When Authorized):**
   - Add `passwordHash`, `portalRole` ('CLIENT'), `lastPortalLoginAt` to the `Client` model or create a separate `ClientPortalUser` model linked to `Client`.
2. **Dedicated Authentication Endpoints:**
   - `POST /api/portal/auth/login`: Authenticates client email and portal password; issues restricted JWT with `role: 'CLIENT'` and `clientId: client.id`.
3. **Strict Matter-Level Isolation Middleware:**
   - Backend middleware `requireClientAuth` ensures client can ONLY query matters where `matter.clientId === req.user.clientId`.
   - Access to other clients, accounting ledgers, firm settings, or unshared notes is blocked at the database query level (`WHERE clientId = req.user.clientId`).
4. **Client Portal Views:**
   - Portal Dashboard: My Active Matters, Unpaid Invoices, Document Requests.
   - Document Upload: Direct upload to matter's document vault with `uploadedBy: 'Client'`.

---

### Priority 6: External Integrations & Advanced Automation Staging

#### Objective:
Progressively wire internal event triggers and stage third-party integrations with clean credential gates.

#### Detailed Steps:
1. **Wire Remaining 289 Document Automations:**
   - In `backend/src/modules/documents/events/auto-draft.service.ts`:
     - Group the 289 catalog entries by triggering domain event (e.g. `court.pleading.filed`, `billing.invoice.generated`, `probate.inventory.approved`).
     - Wire handlers to extract matter data, invoke `DocumentGenerationService.generateDraft(templateCode, matterId)`, and assign attorney review tasks.
2. **Stage Third-Party Integration Connectors:**
   - **DocuSign:** When `DOCUSIGN_INTEGRATION_KEY` is provided, connect `DocuSignService` to send generated retainers for e-signature.
   - **Microsoft 365:** When `AZURE_CLIENT_ID` is provided, connect Microsoft Graph API for court calendar sync.
   - **Utah Courts XChange / GreenFiling:** Prepare court header formatters and stage filing packet generator.
   - **LawPay:** When merchant credentials are provided, wire credit card retainer processing into `trust_transactions`.

---

## 5. FILES LIKELY TO REQUIRE MODIFICATION (UPON APPROVAL)

### Frontend Files:
1. `frontend/src/features/settings/pages/WorkflowManager.jsx` (Wire `workflowService` API persistence; remove mock toast)
2. `frontend/src/data/practiceAreaWorkflows.js` (Add Appeals, Landlord-Tenant, Bankruptcy, Immigration; remove 4 legacy non-practice areas)
3. `frontend/src/features/personal-injury/pages/SettlementCalculator.jsx` (Add custom 30% fee input; connect `piService.getLiens` and `expenseService.getExpenses`)
4. `frontend/src/features/billing/pages/SettlementCalculator.jsx` (Unify or sync with PI calculator)
5. `frontend/src/app/router.jsx` (Align settlement calculator routes to unified component)
6. `frontend/src/features/personal-injury/components/ClosingStatementModal.jsx` (Sanitize `settlementModel` prop scoping)
7. `frontend/src/features/intake/pages/IntakeList.jsx` (Enforce intake conversion wizard route)

### Backend Files:
1. `backend/src/scripts/seed-workflow-stages.ts` (Expand Probate from 3 to 7 stages)
2. `backend/src/modules/workflows/workflow.service.ts` (Add batch update endpoint for stage ordering if needed)
3. `backend/src/modules/documents/events/auto-draft.service.ts` (Progressively add domain event listeners for remaining automations)
4. `backend/prisma/schema.prisma` (Client portal auth models — strictly requires approval)

---

## 6. DATABASE AND REGRESSION SAFETY STRATEGY

### Safety Rules:
1. **Zero Destructive Migrations:** No tables or columns will be dropped.
2. **Preserve All Existing Records:** Historical clients (`CLI-1001`), matters (`26-FAM-0101`), and drafts (`DFT-26-0001` through `DFT-26-0013`) will be preserved untouched.
3. **Probate Stage Updates:** Updating `pa-prob` workflow stages will use non-destructive `UPSERT` operations based on `id` (`ws-prob-1` through `ws-prob-7`).
4. **Rollback Strategy:** A database backup SQL dump will be taken via `backend/src/scripts/backup-db.ts` immediately before any schema migration or database write.
5. **No Production Writes:** Database target remains strictly locked to `localhost:3306/legal-db`.

---

## 7. REQUIRED CLIENT CREDENTIALS CHECKLIST

The following items are completely staged in architecture and await live client account credentials from Heugly & Bludworth, PLLC:

| Provider | Purpose | Required Credentials from Client | Current Internal Status |
| :--- | :--- | :--- | :---: |
| **CosmoLex** | Official general ledger & accounting | API Key, Secret, Firm ID | Official system of record; export batch staging ready. |
| **DocuSign** | Automated client e-signatures | Integration Key, Account ID, RSA Private Key | Unsigned draft DOCX/PDF generation working. |
| **Microsoft 365** | Outlook email & court calendar sync | Azure AD Tenant ID, Client ID, Client Secret | Mailbox models ready; Graph API pending auth. |
| **Utah Courts** | Court docket & e-filing sync | XChange subscription credentials / GreenFiling API Key | Pleading headers format Utah rules; live filing pending auth. |
| **LawPay** | Online retainer card processing | Merchant ID, Secret API Key | Trust accounting ledger ready; payment gateway pending key. |
| **Twilio / VoIP** | Automated SMS and call tracking | Account SID, Auth Token, Firm Phone Number | Communication logging ready; live SMS pending gateway. |

---

## 8. ESTIMATED COMPLEXITY & IMPLEMENTATION ORDER

| Step | Priority Phase | Scope of Work | Estimated Effort | Risk Level |
| :---: | :--- | :--- | :---: | :---: |
| **1** | **Priority 1** | Restore 9 Practice Areas in Configurator & Wire Backend Save API | 3–4 hours | Low |
| **2** | **Priority 1** | Extend Probate Workflow to 7 Stages in DB & Configurator | 2 hours | Low |
| **3** | **Priority 2** | Add Custom 30% Fee Input & Unify Settlement Calculators | 3–4 hours | Medium |
| **4** | **Priority 2** | Connect Settlement Calculator to Live Lien Register & Case Expenses | 3–4 hours | Medium |
| **5** | **Priority 3** | Intake Governance: Ensure Future Intakes Route Through Conversion Wizard | 1–2 hours | Low |
| **6** | **Priority 4** | CosmoLex Export Batch Validation (Preserving CosmoLex as Record) | 2–3 hours | Low |
| **7** | **Priority 5** | Client Portal Authentication & Matter-Restricted Dashboard | 6–8 hours | High |
| **8** | **Priority 6** | Progressive Wiring of Domain Event Triggers for Catalog Automations | 8–12 hours | Medium |

---

## 9. EXPLICIT APPROVAL CHECKLIST

Before any code edits or database operations begin, the user must explicitly approve:

- [ ] **Approval 1:** Authorize updating `WorkflowManager.jsx` and `practiceAreaWorkflows.js` to persist changes to MySQL and restore Appeals, Landlord-Tenant, Bankruptcy, and Immigration.
- [ ] **Approval 2:** Authorize extending Probate from 3 to 7 procedural stages in the database.
- [ ] **Approval 3:** Authorize unifying the Settlement Calculator, adding custom 30% fee support, and connecting live lien register records.
- [ ] **Approval 4:** Confirm that CosmoLex remains the official financial system of record and that no accounting data will be replaced.
- [ ] **Approval 5:** Authorize proceeding phase-by-phase with verification tests after each step.
