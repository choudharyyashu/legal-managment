# POINT 1 — PRACTICE AREA BASED DOCUMENT TEMPLATE FILTERING AUDIT
## Project: HEUGLY & BLUDWORTH Legal Practice Management SaaS
**Audit Date:** November 16, 2026  
**Document Reference:** `Next_Development_Instructions_and_300_Document_Automations.docx` & `Immediate_Intake_Workflow_Corrections.docx`  
**Target Audit Report:** `backend-docs/54-PRACTICE-AREA-TEMPLATE-FILTERING-AUDIT.md`  
**Execution Mode:** STRICT READ-ONLY AUDIT (Zero code, schema, migration, or database modifications)

---

## 1. DEVELOPER-SAFETY & GIT PRESERVATION CONFIRMATION

Prior to executing this audit, the environment and repository state were inspected:

- **Git Root Confirmed:** `D:\legal-ui1\legal-managment`
- **Active Branch:** `main` (Up to date with `origin/main`)
- **Git Status:** Working tree clean (`nothing to commit, working tree clean`)
- **Recent Commit History:**
  - `7ca6753` - pr
  - `0cf6808` - 4444
  - `e6d5398` - 444
  - `bac0979` - i
  - `251d95f` - 333
- **Preservation Check:** Zero uncommitted changes detected. No files overwritten, stashed, reset, or modified during this investigation.

---

## 2. EXECUTIVE SUMMARY & AUDIT OBJECTIVE

### Client Requirement
> *"Document templates must be filtered according to the Practice Area of the currently selected Matter.*
> *Examples:*
> *- Personal Injury matter → only applicable Personal Injury templates.*
> *- Family Law matter → only applicable Family Law templates.*
> *- Civil/Commercial Litigation matter → only applicable Civil/Commercial Litigation templates.*
> *- Bankruptcy matter → only applicable Bankruptcy templates.*
> *- Immigration matter → only applicable Immigration templates.*
> *The dropdown must not display the same five Personal Injury templates for every Practice Area."*

### Key Audit Finding
The defect reported by the user (where a Family Law matter `26-FAM-0101 — david john v. thomas` displayed Personal Injury templates `096`, `112`, `113`, `115`, and `116`) is **CONFIRMED** and caused by a three-tiered architectural disconnection:

1. **Frontend Disconnection:** `GenerateDraftModal.jsx` calls `fetch('/api/v1/templates?limit=50')` without passing the `practiceAreaId` query parameter, and performs no client-side filtering on the returned array when `selectedMatterId` changes.
2. **Backend Validation Gap:** `DraftService.validateDraftPrerequisites` and `DraftService.generateDraft` do not check if `template.practiceAreaId` matches `matter.practiceAreaId`, allowing cross-practice-area document generation via direct API requests.
3. **Database Seed Scope:** Only 7 templates exist in the registry (6 for Personal Injury `pa-pi`, and 1 for Master Engagement `001` tied to `pa-fam`). Foundational templates for Civil Litigation, Bankruptcy, Immigration, and Probate have not yet been registered.

---

## 3. AUDIT FINDINGS SUMMARY BY COMPONENT

| Component / Layer | Function / Capability | Audit Status | Audit Details |
| :--- | :--- | :--- | :--- |
| **Frontend Dropdown** | `GenerateDraftModal.jsx` | ⚠️ **BROKEN** | Displays all firm templates or 5 PI fallbacks regardless of Matter practice area. |
| **Backend Template API** | `GET /api/v1/templates` | 🟡 **PARTIALLY WORKING** | Supports `?practiceAreaId=...` in service query, but frontend never sends it. |
| **Backend Draft Validation** | `validateDraftPrerequisites` | ❌ **NOT IMPLEMENTED** | Does not validate template-to-matter practice area compatibility. |
| **Backend Draft Generator** | `generateDraft` | ❌ **NOT IMPLEMENTED** | Allows generating PI drafts for Family Law / Bankruptcy matters without error. |
| **Prisma Schema Mapping** | `DocumentTemplate` (1:N) | 🟡 **PARTIALLY WORKING** | Supports single practice area per template; lacks shared/global template flag. |
| **Template Registry Data** | Practice Area Coverage | ⚠️ **BROKEN** | 6 templates for PI, 1 for FAM, 0 for CIV, BK, IMM, PROB, CRIM, APP, EVICT. |

---

## 4. DETAILED COMPONENT AUDIT

### Task 1: Template Dropdown Locations in Frontend

The frontend was scanned for all occurrences of template selection, modals, and registries:

1. **Primary Generation Modal:**
   - **File:** `frontend/src/features/documents/components/GenerateDraftModal.jsx`
   - **Role:** Generates legal drafts from templates with real-time field validation.
   - **Dropdown Element:** `<select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>` (Lines 237–248).
2. **Document Hub Page:**
   - **File:** `frontend/src/features/documents/pages/DocumentsList.jsx`
   - **Role:** Host component containing the "Generate Legal Draft" button that mounts `GenerateDraftModal` (Line 962).
3. **Template Registry & Merge Studio:**
   - **File:** `frontend/src/features/settings/pages/TemplatesSettings.jsx`
   - **Role:** Admin settings interface to create templates, inspect dynamic merge tags, and preview pleading text (Lines 37–126).
4. **Matter Creation Auto-Draft Hook:**
   - **File:** `frontend/src/features/matters/forms/MatterForm.jsx`
   - **Role:** Triggers automatic generation of Template 096 (Letter of Representation) when a Personal Injury matter is saved (Lines 236–260).
5. **Draft Review & Transmission Modal:**
   - **File:** `frontend/src/features/documents/components/DraftReviewModal.jsx`
   - **Role:** Displays generated drafts for partner review, editing, and transmission (Does not contain a template picker).

---

### Task 2: Frontend Template Fetching & Filtering Behavior

Inspection of `frontend/src/features/documents/components/GenerateDraftModal.jsx`:

#### 1. Fetching Logic (Lines 42–64)
```javascript
useEffect(() => {
  if (isOpen) {
    setValidationResult(null);
    if (matters.length > 0 && !selectedMatterId) {
      setSelectedMatterId(matters[0].id);
    }
    // Fetch active templates without practice area scoping
    fetch('/api/v1/templates?limit=50', {
      headers: {
        Authorization: `Bearer ${tokenStorage.get() || ''}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        const list = Array.isArray(json?.data) ? json.data : [];
        if (list.length > 0) {
          setTemplates(list); // All templates loaded into state
          if (!selectedTemplateId) setSelectedTemplateId(list[0].id);
        }
      })
      .catch(() => {
        // Hardcoded 5 PI templates fallback
        const fallback = [
          { id: 'TPL-PI-096', templateCode: 'UT-PI-REP-096', templateName: 'Liability Insurer Letter of Representation (096)', category: 'Personal Injury' },
          { id: 'TPL-PI-112', templateCode: 'UT-PI-MED-112', templateName: 'Medical Authorization (112)', category: 'Personal Injury' },
          { id: 'TPL-PI-113', templateCode: 'UT-PI-MED-113', templateName: 'Medical Records Request Letter (113)', category: 'Personal Injury' },
          { id: 'TPL-PI-116', templateCode: 'UT-PI-DEF-116', templateName: 'Incomplete Medical Records Follow-up (116)', category: 'Personal Injury' },
          { id: 'TPL-PI-140', templateCode: 'UT-PI-DEM-140', templateName: 'Personal Injury Settlement Demand Letter (140)', category: 'Personal Injury' },
        ];
        setTemplates(fallback);
      });
  }
}, [isOpen, matters]);
```

#### 2. Switching Matters Behavior
- When the user selects a different matter from the "Target Legal Matter" dropdown (e.g., switches from PI matter `26-PI-0101` to Family Law matter `26-FAM-0101`), `selectedMatterId` changes.
- **Defect:** No `useEffect` listens to `selectedMatterId` to filter or refetch `templates`. The `templates` state array remains completely unchanged.
- Stale templates (such as HIPAA Medical Authorization or Settlement Demand) remain displayed in the dropdown for the Family Law matter.

---

### Task 3: Backend Template API & Filtering Inspection

Inspection of `backend/src/modules/templates/`:

#### 1. Route & Controller
- **Route:** `GET /api/v1/templates` (`template.routes.ts` Lines 25–30)
- **Controller:** `TemplateController.getTemplates` (`template.controller.ts` Lines 6–17)
- **Query Validation Schema:** `templateQuerySchema` (`template.validation.ts` Lines 47–57):
  ```typescript
  export const templateQuerySchema = z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    practiceAreaId: z.string().optional(),
    category: z.string().optional(),
    isActive: z.enum(['true', 'false']).transform((val) => val === 'true').optional(),
    search: z.string().optional(),
  });
  ```

#### 2. Service Implementation (`template.service.ts` Lines 149–185)
```typescript
static async getTemplates(query: TemplateListQuery) {
  const where: any = {};
  if (query.practiceAreaId) where.practiceAreaId = query.practiceAreaId;
  if (query.category) where.category = query.category;
  if (query.isActive !== undefined) where.isActive = query.isActive;
  ...
  const records = await prisma.documentTemplate.findMany({ where, ... });
  return { templates: records.map(this.formatTemplate), ... };
}
```
- **Backend Status:** **PARTIALLY WORKING**. The backend service supports `?practiceAreaId=pa-pi` or `?practiceAreaId=pa-fam`. However, if the query parameter is omitted (as `GenerateDraftModal.jsx` does), it returns all templates unconditionally.

#### 3. Backend Generation Compatibility Verification (`draft.service.ts`)
- **Inspection of `validateDraftPrerequisites` (Lines 110–180):**
  - Fetches `matter` from database.
  - Fetches `template` from database.
  - Checks if `template.isActive === true`.
  - **MISSING CHECK:** Does NOT verify `template.practiceAreaId === matter.practiceAreaId`.
- **Inspection of `generateDraft` (Lines 230–320):**
  - **MISSING CHECK:** Does NOT verify practice area compatibility before generating a draft.

---

### Task 4: Database & Prisma Schema Structure

Inspection of `backend/prisma/schema.prisma`:

```prisma
model PracticeArea {
  id          String   @id @db.VarChar(50)
  name        String   @db.VarChar(150)
  code        String   @unique @db.VarChar(10)
  brandColor  String   @map("brand_color") @db.VarChar(20)
  isActive    Boolean  @default(true) @map("is_active")

  matters           Matter[]
  intakes           Intake[]
  workflowStages    WorkflowStage[]
  documentTemplates DocumentTemplate[]

  @@map("practice_areas")
}

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

  practiceArea  PracticeArea      @relation(fields: [practiceAreaId], references: [id], onDelete: Restrict)
  createdByUser User              @relation("TemplateCreator", fields: [createdById], references: [id], onDelete: Restrict)
  versions      TemplateVersion[]
  drafts        DocumentDraft[]

  @@index([practiceAreaId, category, isActive], name: "idx_doc_templates_search")
  @@map("document_templates")
}
```

#### Schema Capabilities Analysis:
1. **Single Practice Area Mapping:** Supported (`practiceAreaId` foreign key to `practice_areas.id`).
2. **Multiple Practice Area Mapping (Many-to-Many):** NOT supported in schema (no join table).
3. **Shared / Global Templates (e.g. Master Retainer 001):** NOT directly represented. `practiceAreaId` is non-nullable (`VARCHAR(50) NOT NULL`). A template cannot have `practiceAreaId = null`. To represent a shared template under the current schema, a designated identifier (such as `pa-global` or `isSystemDefault: true`) is required.

---

### Task 5: Existing Template Registry Data & Practice Area Mapping

Inspection of `backend/prisma/seed-primary-templates.ts`:

| Template Code | Template Name | Seeded Practice Area ID | Actual Category | Intended Practice Area |
| :--- | :--- | :--- | :--- | :--- |
| **001** | Master Client Engagement & Retainer Agreement | `pa-fam` *(Hardcoded)* | Engagement | **Global / All Practice Areas** |
| **096** | Representation Letter - Liability Carrier | `pa-pi` | Correspondence | Personal Injury |
| **112** | HIPAA Medical Information Authorization | `pa-pi` | Authorizations | Personal Injury / Medical |
| **113** | Medical Records & Billing Request | `pa-pi` | Medical | Personal Injury / Medical |
| **115** | Medical Records Deficiency Notice | `pa-pi` | Notices | Personal Injury / Medical |
| **116** | Incomplete Medical Records Follow-up | `pa-pi` | Medical | Personal Injury / Medical |
| **140** | Personal Injury Settlement Demand Letter | `pa-pi` | Demand | Personal Injury |

#### Distribution Across the 9 Approved Practice Areas:
- **Personal Injury (`pa-pi`):** 6 templates (096, 112, 113, 115, 116, 140)
- **Family Law (`pa-fam`):** 1 template (001 - Retainer Agreement)
- **Civil Litigation (`pa-civ`):** 0 templates
- **Bankruptcy (`pa-bk`):** 0 templates
- **Immigration (`pa-imm`):** 0 templates
- **Probate (`pa-prob`):** 0 templates
- **Criminal Defense (`pa-crim`):** 0 templates
- **Appeals (`pa-app`):** 0 templates
- **Landlord-Tenant (`pa-evict`):** 0 templates

---

### Task 6: Edge Cases & Risk Identification

1. **Matter Without Practice Area:** If a matter record has an invalid or empty `practiceAreaId`, the dropdown could either display nothing or crash without fallback handling.
2. **Global / Shared Templates:** An engagement retainer (Template 001) applies to all 9 practice areas. If strict filtering (`template.practiceAreaId === matter.practiceAreaId`) is applied without allowing global templates, Template 001 will disappear for 8 out of 9 practice areas.
3. **Direct API Generation Bypass:** If only frontend filtering is implemented, a user or script can POST directly to `/api/v1/documents/drafts/generate` with `templateId: '096'` and a Divorce matter ID. The backend will currently generate a Personal Injury Representation Letter for a Divorce case.
4. **Inactive Templates:** Inactive templates must never appear in the dropdown, even if their practice area matches. (Already handled by `where.isActive = true` in backend).

---

## 5. CURRENT BEHAVIOR VS. CLIENT-REQUIRED BEHAVIOR

| Aspect | Current Behavior (Defect) | Client Required Behavior |
| :--- | :--- | :--- |
| **Family Law Matter Selection** | Shows Template 001 plus all 5 PI templates (096, 112, 113, 115, 116). | Shows only Family Law templates (Divorce Petition, Financial Declaration) + Global Retainer. |
| **Matter Switching in Modal** | Template list remains completely static when changing the matter dropdown. | Template list immediately updates to reflect the practice area of the newly selected matter. |
| **API Template Query** | Frontend requests `/api/v1/templates?limit=50` (unscoped). | Frontend requests `/api/v1/templates?practiceAreaId=${currentMatter.practiceAreaId}` or filters client-side. |
| **Backend Compatibility Gate** | Backend accepts any template for any matter without checking practice area. | Backend returns `400 Bad Request: Incompatible practice area for template` if mismatched. |
| **Global Agreements** | Template 001 is locked to `pa-fam`. | Template 001 is recognized as a firm-wide Master Retainer applicable across all practice areas. |

---

## 6. FILES & FUNCTIONS REQUIRING MODIFICATION

When implementation is authorized, changes will be isolated to the following components:

1. **Frontend: `frontend/src/features/documents/components/GenerateDraftModal.jsx`**
   - Derive `currentMatter` from `matters.find(m => m.id === selectedMatterId)`.
   - Filter `templates` so that only templates matching `currentMatter.practiceAreaId` OR global templates (`isSystemDefault: true` / `templateCode: '001'`) are displayed in the `<select>`.
   - Update `selectedTemplateId` automatically when switching matters so it selects the first valid template for that matter.
   - If no practice-specific templates exist for that matter, display a clear notice (e.g., *"No specific templates configured for [Practice Area]; Master Engagement Agreement available."*).

2. **Backend: `backend/src/modules/documents/drafts/draft.service.ts`**
   - In `validateDraftPrerequisites` and `generateDraft`:
     Add compatibility validation:
     ```typescript
     const isGlobalTemplate = template.isSystemDefault || template.templateCode === '001';
     if (!isGlobalTemplate && template.practiceAreaId !== matter.practiceAreaId) {
       throw AppError.badRequest(
         `Template '${template.templateCode}' is configured for practice area '${template.practiceArea?.name || template.practiceAreaId}' and cannot be applied to matter '${matter.matterNumber}' (${matter.practiceArea?.name || matter.practiceAreaId}).`,
         'INCOMPATIBLE_PRACTICE_AREA'
       );
     }
     ```

3. **Backend: `backend/src/modules/templates/template.service.ts`**
   - In `getTemplates`: Ensure templates with `isSystemDefault: true` are returned alongside the requested `practiceAreaId` query.

---

## 7. RECOMMENDED IMPLEMENTATION PLAN (Without Execution)

1. **Step 1 (Backend Compatibility Gate):** Add practice-area compatibility check in `DraftService.validateDraftPrerequisites` and `DraftService.generateDraft` (permitting global/retainer templates).
2. **Step 2 (Frontend Reactive Filtering):** Update `GenerateDraftModal.jsx` to dynamically filter templates based on `targetMatter.practiceAreaId`.
3. **Step 3 (Matter Change Synchronization):** Reset `selectedTemplateId` when `selectedMatterId` changes so stale template selections are discarded.
4. **Step 4 (Foundational Template Registration):** Seed starter templates for other practice areas (e.g., Template 180 Petition for Dissolution of Marriage for Family Law; Template 040 Interrogatories for Civil Litigation).

---

## 8. REQUIRED TESTS AFTER IMPLEMENTATION

1. **Unit Test (Backend Compatibility):**
   - Attempt to call `validateDraftPrerequisites` with Template 096 (PI) against a Family Law matter (`pa-fam`). Verify it rejects with `400 INCOMPATIBLE_PRACTICE_AREA`.
   - Call `validateDraftPrerequisites` with Template 001 (Master Retainer) against both PI and Family Law matters. Verify it succeeds for both.
2. **Frontend UI Test:**
   - Open `GenerateDraftModal` with a PI matter selected. Verify templates 096, 112, 113, 115, 116, 140 are visible.
   - Switch dropdown to a Family Law matter (`26-FAM-0101`). Verify PI templates disappear immediately and only applicable Family Law / Retainer templates are displayed.
3. **Build & Regression Verification:**
   - Run `npm run build` in `frontend` and `backend` to ensure zero compilation or TypeScript errors.
