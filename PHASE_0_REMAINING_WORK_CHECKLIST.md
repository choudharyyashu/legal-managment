# PHASE 0 — REMAINING WORK CHECKLIST
## HEUGLY & BLUDWORTH — LEGAL MANAGEMENT SOFTWARE

- **Project Root**: `D:\Kiaan\legal-pro`
- **Backend Directory**: `D:\Kiaan\legal-pro\backend`
- **Audit Date**: November 13, 2026
- **Auditor**: Independent Technical Auditor (Antigravity Core)

---

## 1. PRIORITIZED REMAINING WORK REGISTER

| Task ID | Component Affected | Priority | Blocker for 100%? | Why It Is Needed | Required Verification Method |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **REM-01** | `backend/src/tests/auth-rbac-test-suite.ts` | **HIGH** | **YES** | Test suite currently pollutes the live `legal-db` with residual attorney users (`USR-002`, `USR-003`). | Implement teardown hook to delete created test user; verify `SELECT COUNT(*) FROM users` remains at 1 (Super Admin). |
| **REM-02** | `backend/src/app.ts` | **HIGH** | **NO** | Rejection of unauthorized CORS origins throws an `Error` leading to HTTP 500 Unhandled Exception. | Refactor CORS reject callback to return 403 or omit allow-origin header; verify clean 403 response. |
| **REM-03** | `backend/src/app.ts` | **MEDIUM** | **NO** | No global rate limiter is active on general endpoints (`GET /`, `GET /health`). | Mount a standard global rate limiter (e.g. 100 requests per 15 minutes) on `app.use()`. |
| **REM-04** | `backend/src/scripts/restore-db.ts` | **MEDIUM** | **YES** | Backup exists (`legal-db-backup-*.json`), but dry-run restore readiness has never been verified. | Author `restore-db.ts` script; execute test restore against an isolated scratch database (`legal-db-test`). |
| **REM-05** | `backend/src/modules/users/user.service.ts` | **MEDIUM** | **NO** | No defensive check preventing non-super-admins with `users:manage` from promoting users to `super_admin`. | Add check: `if (input.role === 'super_admin' && creator.userRole !== 'super_admin') throw AppError.forbidden(...)`. |
| **REM-06** | `backend/node_modules/.prisma/client/` | **LOW** | **NO** | `npx prisma generate` throws Windows `EPERM` when renaming temporary DLL over `query_engine-windows.dll.node`. | Add npm script hook that kills orphaned engine processes before generating client, or run in isolated terminal. |
| **REM-07** | `backend/src/middleware/auth.ts` | **LOW** | **NO** | Access tokens are stateless (15 min expiry); deactivation takes effect on next login or refresh. | In Phase 3/4, introduce Redis token blacklist or fast in-memory revocation check for sub-second invalidation. |

---

## 2. DETAILED ACTIONABLE SPECIFICATIONS

### Task REM-01: Automated Test Cleanup Hook
- **File**: `backend/src/tests/auth-rbac-test-suite.ts`
- **Action**: Add a post-test teardown block inside `runTestSuite()`:
  ```typescript
  finally {
    if (createdUserId) {
      await prisma.user.delete({ where: { id: createdUserId } }).catch(() => {});
    }
    server.close();
  }
  ```
- **Verification**: Run `npm test` twice. Query MySQL `users` table and verify row count remains exactly 1 (`USR-001`).

### Task REM-02: Clean CORS Rejection Handling
- **File**: `backend/src/app.ts`
- **Action**: Replace `callback(new Error(...))` in CORS origin validator:
  ```typescript
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isAllowed =
          config.allowedOrigins.includes(origin) ||
          (config.nodeEnv === 'development' &&
            (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')));
        if (isAllowed) return callback(null, true);
        return callback(null, false); // Omits CORS header cleanly without throwing HTTP 500
      },
      credentials: true,
    })
  );
  ```
- **Verification**: Test with unauthorized origin (`curl -H "Origin: https://bad.com"`). Response status should be 200/403 without an internal server error stack.

### Task REM-03: Global Rate Limiting
- **File**: `backend/src/app.ts`
- **Action**: Mount a global rate limiter:
  ```typescript
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } },
  });
  app.use(globalLimiter);
  ```

### Task REM-04: Test Database Restore Verification
- **File**: `backend/src/scripts/restore-db.ts`
- **Action**: Create a restore utility reading the JSON snapshot and executing DDL/inserts into a test database `legal-db-restore-test` to empirically prove restore readiness.
- **Verification**: Verify that all 29 tables and records reconstruct with 100% fidelity.

---

## 3. CHECKLIST SUMMARY FOR 100% COMPLETION SIGN-OFF

- [ ] Clean up residual test users in `legal-db` (`USR-002`, `USR-003`).
- [ ] Add automated cleanup (`finally { delete createdUserId }`) in `auth-rbac-test-suite.ts`.
- [ ] Refactor CORS reject callback to omit origin header rather than throwing an unhandled 500 error.
- [ ] Add global rate limiting to `backend/src/app.ts`.
- [ ] Create and verify `restore-db.ts` against a test schema to mark Database Restore as VERIFIED.
- [ ] Add explicit defensive check in `user.service.ts` blocking non-super-admins from assigning the `super_admin` role.

