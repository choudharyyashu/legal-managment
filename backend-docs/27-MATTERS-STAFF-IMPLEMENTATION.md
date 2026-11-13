# HEUGLY & BLUDWORTH – LEGAL PRACTICE MANAGEMENT SAAS
# DOCUMENT 27: MATTERS & STAFF ASSIGNMENT BACKEND IMPLEMENTATION REPORT

**Author:** Senior Backend Architect  
**Jurisdiction:** State of Utah (Utah State Bar, Third Judicial District Court)  
**Database:** `legal-db` (MariaDB 10.11.16 LTS / MySQL 8.4 LTS Compatible)  
**ORM:** Prisma ORM 5.22.0  
**Phase:** Phase 6.3 – Matters & Staff Assignment Backend Implementation  
**Status:** **COMPLETE & FULLY VERIFIED (23/23 MATTER TESTS PASSING, 14/14 CLIENT TESTS PASSING, 15/15 AUTH TESTS PASSING)**

---

## 1. Executive Summary

Phase 6.3 delivers the **Matters** and **Matter Staff Assignment** backend domain for the Heugly & Bludworth Legal Practice Management SaaS. 

This module establishes core matter operations, workflow state transitions, billing rate enforcement, staff allocation management, and ethical boundary enforcement adhering strictly to Utah Rules of Professional Conduct (RPC 1.6 & 1.10).

### Key Architectural Highlights:
1. **Concurrency-Safe Matter Numbering:** Generated atomically adhering to `{YY}-{PA_CODE}-{SEQUENCE}` (e.g., `26-CIV-0101`, `26-PI-0102`) with collision-handling retry transactions against the database unique constraint `uq_matter_number`.
2. **Utah RPC 1.10 Ethical Wall Screening:** Full access restriction logic protecting confidential client matters. Screened personnel are blocked with `403 ETHICAL_WALL_RESTRICTION` on direct access, and restricted matters are eliminated at the SQL query level from list views and total count metrics to prevent information leakage.
3. **Staff Assignment Management:** Explicit legal team assignment via the `matter_staff_assignments` relational table with duplicate assignment prevention guards (`uq_matter_staff`) and audit trail tracking.
4. **Lifecycle & Status Transitions:** Supports `Active`, `In Discovery`, `Trial Prep`, `On Hold`, and `Concluded`, automatically managing closure timestamps (`closeDate`) upon concluding matters.
5. **Zero Schema Modifications:** Implemented entirely against the active MariaDB schema, standard Prisma models, and existing 193 RBAC permission mappings.

---

## 2. Inventory of Implemented Files

| File Path | Role | Description |
| :--- | :--- | :--- |
| `src/modules/matters/matter.types.ts` | Type Definitions | TypeScript interfaces for `MatterResponse`, `MatterStaffResponse`, `MatterBillingType`, `MatterStatus`, and `MatterListQuery`. |
| `src/modules/matters/matter.validation.ts` | Validation Layer | Zod schemas enforcing required fields, billing cross-validations (Hourly requires rate; Flat Fee requires fee), status transitions, staff assignments, and pagination queries. |
| `src/modules/matters/matter.service.ts` | Domain Business Logic | Concurrency-safe matter number generation, Utah RPC 1.10 Ethical Wall serialization and screening, CRUD operations, staff allocation/removal, and immutable audit logging. |
| `src/modules/matters/matter.controller.ts` | Controller Layer | Express request handlers with standardized JSON envelopes (`success`, `data`, `pagination`, `message`). |
| `src/modules/matters/matter.routes.ts` | Route Declarations | Protected route definitions with global `requireAuth`, granular RBAC permissions (`matters:view`, `matters:create`, `matters:edit`), and Zod validation middleware. |
| `src/app.ts` | Application Mount | Mounted `matterRouter` under `/api/v1/matters`. |
| `src/tests/matter-api-test-suite.ts` | Automated E2E Suite | 23 comprehensive end-to-end automated integration tests verifying security, validation, CRUD, staff assignments, and ethical wall enforcement. |
| `package.json` | NPM Script | Registered `"test:matters": "tsx src/tests/matter-api-test-suite.ts"`. |

---

## 3. Endpoints Implemented & RBAC Permissions Matrix

All endpoints require authentication (`Authorization: Bearer <access_token>`). Permissions are validated against active database roles.

| Method | Endpoint | Required Permission | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/matters` | `matters:view` | Paginated listing with multi-field search (`title`, `matterNumber`, `courtName`, `caseDocketNumber`, `clientName`), filters (`clientId`, `practiceAreaId`, `responsibleAttorneyId`, `status`, `billingType`), sorting, and SQL-level Ethical Wall screening. |
| `GET` | `/api/v1/matters/:id` | `matters:view` | Resolves single matter by either internal UUID or business `matterNumber`. Enforces Utah RPC 1.10 Ethical Wall restriction. |
| `POST` | `/api/v1/matters` | `matters:create` | Creates new legal matter, validates active client, active practice area, and active lead attorney, allocates atomic sequence number, creates initial staff assignments, and records audit log. |
| `PUT` | `/api/v1/matters/:id` | `matters:edit` | Updates matter title, financial terms, court details, or practice area with audit trail. |
| `PATCH` | `/api/v1/matters/:id/status` | `matters:edit` | Updates lifecycle status (`Active`, `In Discovery`, `Trial Prep`, `On Hold`, `Concluded`). Automatically populates `closeDate` when transitioning to `Concluded`. |
| `POST` | `/api/v1/matters/:id/staff` | `matters:edit` | Assigns an active attorney or paralegal to the matter staff roster. Prevents duplicate assignment via `uq_matter_staff`. |
| `DELETE` | `/api/v1/matters/:id/staff/:userId` | `matters:edit` | Removes staff member assignment from the matter with audit logging. |

---

## 4. Business Rules & Validation Architecture

### 4.1 Client Association & Status Enforcement
- Every matter must be linked to a valid client UUID.
- If the target client record has `status: 'Inactive'`, matter creation is rejected with `400 Bad Request` (`CLIENT_INACTIVE`), preventing firm staff from opening matters on dormant or severed client relationships.

### 4.2 Practice Area Validation
- The `practiceAreaId` must match an active practice area in the database (`pa-app`, `pa-bk`, `pa-civ`, `pa-crim`, `pa-evict`, `pa-fam`, `pa-imm`, `pa-pi`, `pa-prob`). Invalid codes are rejected with `400 Bad Request` (`INVALID_PRACTICE_AREA`).

### 4.3 Billing Terms Cross-Validation
- Under Zod refinement rules:
  - `billingType: 'Hourly'` strictly requires `hourlyRate > 0`.
  - `billingType: 'Flat Fee'` strictly requires `flatFeeAmount > 0`.
  - Violations result in `422 Unprocessable Entity` (`VALIDATION_FAILED`).

### 4.4 Concurrency-Safe Sequential Matter Numbering
- Pattern: `{YY}-{PA_CODE}-{SEQUENCE}` (e.g. `26-CIV-0101`, `26-CIV-0102`).
- The generation algorithm:
  1. Identifies the latest matter number with the matching year and practice area prefix.
  2. Increments the sequence portion starting from `0101`.
  3. Verifies non-existence in a retry loop.
  4. Wraps creation in a transaction that catches MySQL `P2002` duplicate key errors and retries sequentially up to 3 attempts.

---

## 5. Utah RPC 1.10 Ethical Wall Security Implementation

In compliance with the Utah Rules of Professional Conduct (Utah RPC 1.6 Confidentiality & RPC 1.10 Imputation of Conflicts of Interest), the firm must maintain effective screening mechanisms to isolate lawyers or staff possessing disqualifying confidential information.

### 5.1 Storage Representation
Because the existing Prisma `Matter` model lacks isolated boolean columns for ethical walls, the backend safely serializes the ethical screen state into the matter description header:
```
[ETHICAL_WALL:ENABLED:Excluded={ExcludedRoleOrGroup}]
{UserFacingCleanDescription}
```
Upon serialization/deserialization:
- The clean description is presented transparently to authorized frontend consumers.
- `isEthicalWallEnabled` and `ethicalWallExcludedRole` are exposed as structured boolean and string fields.

### 5.2 Access Control Gatekeeper (`isUserAuthorizedForMatter`)
Access is evaluated according to the following strict hierarchy:
1. **Super Admin Supervisory Authority (Utah RPC 5.1):** Super administrators retain firm-wide administrative and audit authority.
2. **Responsible Lead Attorney:** The attorney assigned to lead the matter always retains access.
3. **Unrestricted Matters:** If no ethical wall is active, any authenticated user possessing `matters:view` is authorized.
4. **Screened Personnel Restriction:** When an Ethical Wall is active, non-assigned users are strictly screened. Direct detail requests return `403 Forbidden` (`ETHICAL_WALL_RESTRICTION`).

### 5.3 Anti-Leakage Query-Level List Screening
To prevent unauthorized users from discovering the existence, caption, docket number, or financial budget of a restricted matter:
- For non-super_admin users, `MatterService.getMatters` injects SQL `WHERE` conditions that exclude matters containing `[ETHICAL_WALL:ENABLED` unless the user is the responsible attorney or is present in `MatterStaffAssignment`.
- Excluded matters are omitted from both the returned list and the `pagination.total` count.

---

## 6. Audit Trail Logging

All state modifications generate immutable audit log records in `audit_logs`:

| Action | Resource Type | Audited Context Details |
| :--- | :--- | :--- |
| `MATTER_CREATED` | `MATTER` | Matter number, title, client name, practice area, billing type, ethical wall flag |
| `MATTER_UPDATED` | `MATTER` | Matter number, delta changes object |
| `MATTER_STATUS_UPDATED` | `MATTER` | Matter number, previous status, new status |
| `MATTER_STAFF_ASSIGNED` | `MATTER` | Matter number, assigned user ID, assigned user name, role |
| `MATTER_STAFF_REMOVED` | `MATTER` | Matter number, removed user ID, removed user name |

---

## 7. Verification & Test Execution Evidence

### 7.1 Matter E2E Test Suite (`npm run test:matters`)
Executed against local MariaDB 10.11 on port 3306 with an ephemeral Express HTTP server on port 5895:

```
================================================================
HEUGLY & BLUDWORTH - End-to-End Matters Module Test Suite
================================================================

✅ PASS - 1. Unauthenticated request without token rejected (401 Unauthorized) [Status: 401, Expected: 401]
✅ PASS - 2. Request with invalid/tampered token rejected (401 Unauthorized) [Status: 401, Expected: 401]
✅ PASS - 3. Paralegal lacking matters:create rejected (403 Forbidden) [Status: 403, Expected: 403]
✅ PASS - 4. Valid Matter Creation with Hourly billing (201 Created) [Status: 201, Expected: 201]
✅ PASS - 5. Hourly billing without hourlyRate rejected (422 Unprocessable Entity) [Status: 422, Expected: 422]
✅ PASS - 6. Non-existent Client UUID rejected (404 Not Found) [Status: 404, Expected: 404]
✅ PASS - 7. Inactive client rejected from opening new matters (400 CLIENT_INACTIVE) [Status: 400, Expected: 400]
✅ PASS - 8. Invalid practice area ID rejected (400 INVALID_PRACTICE_AREA) [Status: 400, Expected: 400]
✅ PASS - 9. Non-existent lead attorney rejected (400 INVALID_ATTORNEY) [Status: 400, Expected: 400]
✅ PASS - 10. Concurrency-safe Matter Number format & uniqueness ({YY}-{PA_CODE}-{SEQ}) [Status: 201, Expected: 201]
✅ PASS - 11. Paginated matter listing returns data and metadata (200 OK) [Status: 200, Expected: 200]
✅ PASS - 12. Search query matches matter by title/caption (200 OK) [Status: 200, Expected: 200]
✅ PASS - 13. Matter filtering by practice area and billing type (200 OK) [Status: 200, Expected: 200]
✅ PASS - 14. Get matter detail by UUID (200 OK) [Status: 200, Expected: 200]
✅ PASS - 15. Get matter detail by Matter Number (200 OK) [Status: 200, Expected: 200]
✅ PASS - 16. Update matter details via PUT /api/v1/matters/:id (200 OK) [Status: 200, Expected: 200]
✅ PASS - 17. Status transition to Concluded populates closeDate (200 OK) [Status: 200, Expected: 200]
✅ PASS - 18. Assign staff member to matter (POST /api/v1/matters/:id/staff -> 200 OK) [Status: 200, Expected: 200]
✅ PASS - 19. Duplicate staff assignment guard prevents duplicate records (409 DUPLICATE_STAFF_ASSIGNMENT) [Status: 409, Expected: 409]
✅ PASS - 20. Remove staff assignment (DELETE /api/v1/matters/:id/staff/:userId -> 200 OK) [Status: 200, Expected: 200]
✅ PASS - 21. Utah RPC 1.10 Ethical Wall restriction blocks unassigned staff from detail view (403 ETHICAL_WALL_RESTRICTION) [Status: 403, Expected: 403]
✅ PASS - 22. Ethical Wall prevents data leakage: restricted matter omitted from list & counts for screened user [Status: 200, Expected: 200]
✅ PASS - 23. Immutable Audit Logs recorded for all Matter actions (CREATED, UPDATED, STATUS_UPDATED, STAFF_ASSIGNED, STAFF_REMOVED) [Status: 5, Expected: 5]

================================================================
MATTERS TEST SUITE SUMMARY
================================================================
Total Tests Run: 23
Passed:          23
Failed:          0
================================================================
```

### 7.2 Regression Verification Summary

| Suite / Check | Command | Result | Notes |
| :--- | :--- | :--- | :--- |
| **TypeScript Compilation** | `npm run build` | **0 Errors (Exit Code 0)** | Full compile across all modules and tests |
| **Matters Module** | `npm run test:matters` | **23 / 23 Passed** | Complete CRUD, Ethical Wall, Staff Assignment, Audit |
| **Clients Module** | `npm run test:clients` | **14 / 14 Passed** | No regressions in client operations |
| **Auth & RBAC Module** | `npm run test:auth` | **15 / 15 Passed** | No regressions in tokens, cookies, or permissions |

---

## 8. Conclusion & Next Steps

Phase 6.3 is **100% complete and fully verified**. The Matters & Staff Assignment domain is ready for frontend consumption and provides a rock-solid foundation for future phases (Conflict Checking and Document Management).

