# BACKEND BUGS AND RISKS REPORT
## HEUGLY & BLUDWORTH LEGAL MANAGEMENT SOFTWARE

- **Project Root**: `D:\Kiaan\legal-pro`
- **Audit Date**: November 13, 2026
- **Auditor**: Independent Technical Auditor (Antigravity Core)
- **Scope**: Source Code, Database Architecture, Security, and Production Readiness

---

## 1. DEFECT & ARCHITECTURAL RISK SUMMARY

| Severity | Count | Blockers | Areas Affected |
| :---: | :---: | :---: | :--- |
| **CRITICAL** | 3 | 3 | Authentication, Security Dependencies, Frontend-Backend Gap |
| **HIGH** | 4 | 2 | BigInt Serialization, Unconstrained Foreign Keys, Missing Rate Limiting, Missing Tests |
| **MEDIUM** | 3 | 0 | Single-Origin CORS, Lack of Database Retry Logic, Decimal Serialization |
| **LOW** | 2 | 0 | Missing Health Metrics, NPM Scripts Standardization |
| **TOTAL** | **12** | **5** | — |

---

## 2. PRIORITIZED DEFECT & RISK REGISTER

### BUG-01: Complete Absence of Authentication & Authorization Middleware
- **Component**: Security / Authentication
- **File Path**: `backend/src/middleware/` (Missing file: `auth.ts`)
- **Severity**: **CRITICAL**
- **Blocker Status**: **YES** (Blocks all protected business APIs)
- **Description**: There is no authentication mechanism implemented anywhere in the backend. Neither JSON Web Token (JWT) verification nor session-based auth exists.
- **Evidence**:
  - `backend/package.json` contains no authentication dependencies (`jsonwebtoken`, `bcrypt`, `argon2`, `passport`).
  - `backend/src/app.ts` contains no authentication middleware registrations.
- **Impact**: Any business API implemented right now would either be completely open to the public internet or fail to identify the authenticated staff member.
- **Recommended Fix**: Install `jsonwebtoken` and `bcryptjs` (with `@types/jsonwebtoken` and `@types/bcryptjs`). Implement `authenticate` and `requirePermission(permissionKey)` middleware that validates Bearer JWT tokens against the `User` and `RolePermission` tables.

---

### BUG-02: Missing Password Hashing Infrastructure
- **Component**: User Management / Security
- **File Path**: `backend/prisma/schema.prisma` (`User.passwordHash`)
- **Severity**: **CRITICAL**
- **Blocker Status**: **YES** (Prevents user seeding and login implementation)
- **Description**: While the `User` table defines `passwordHash String @map("password_hash") @db.VarChar(255)`, there is no utility or cryptographic library installed to hash or verify passwords.
- **Evidence**:
  - No hashing libraries are listed under dependencies in `backend/package.json`.
  - No auth service exists in `backend/src/modules/`.
- **Impact**: If a developer implements a naive login endpoint without adding standard bcrypt/argon2 hashing, plaintext or weakly hashed passwords could be written to the database.
- **Recommended Fix**: Add `bcryptjs` and export standard helper functions:
  ```typescript
  export const hashPassword = async (password: string): Promise<string> => bcrypt.hash(password, 12);
  export const verifyPassword = async (password: string, hash: string): Promise<boolean> => bcrypt.compare(password, hash);
  ```

---

### BUG-03: Complete Disconnect Between Frontend and Backend
- **Component**: Architecture / System Integration
- **File Path**: `frontend/src/` & `backend/src/`
- **Severity**: **CRITICAL**
- **Blocker Status**: **YES** (End-to-end functionality is 0%)
- **Description**: The entire frontend is currently hardwired to `localStorage` through `frontend/src/utils/mockStorage.js` and 26 static mock data files in `frontend/src/data/`. The frontend does not make any HTTP requests to `http://localhost:5000`.
- **Evidence**:
  - `frontend/src/utils/mockStorage.js` intercepts all read/write actions.
  - Zero `fetch` or `axios` API calls point to `/api/v1/`.
- **Impact**: Changes made in the UI are persisted only in the user's browser local storage and never reach MySQL `legal-db`.
- **Recommended Fix**: Implement an API client service in `frontend/src/services/api.js` (using `fetch` or `axios`), establish authentication token storage, and replace `mockStorage` methods with asynchronous API queries.

---

### BUG-04: BigInt Serialization Runtime Crash Risk on `Document.fileSize`
- **Component**: Database Schema / Document Management
- **File Path**: `backend/prisma/schema.prisma` (Line 139)
- **Severity**: **HIGH**
- **Blocker Status**: **YES** (Will cause runtime HTTP 500 when document routes are added)
- **Description**: In model `Document`, `fileSize` is typed as `BigInt @map("file_size")`. By default, JavaScript `JSON.stringify()` throws `TypeError: Do not know how to serialize a BigInt` when attempting to serialize native BigInt values returned by Prisma.
- **Evidence**:
  ```prisma
  model Document {
    id        String @id @default(uuid()) @db.VarChar(36)
    fileSize  BigInt @map("file_size")
    ...
  }
  ```
- **Impact**: As soon as any endpoint returns a `Document` entity via `res.json(document)`, the server will throw an unhandled TypeError and return HTTP 500.
- **Recommended Fix**: Either implement a global BigInt JSON serializer in `backend/src/app.ts`:
  ```typescript
  (BigInt.prototype as any).toJSON = function () {
    return Number(this);
  };
  ```
  Or change `fileSize` in `schema.prisma` to `Int` (up to 2GB) or transform it in a document DTO/mapper service.

---

### BUG-05: Missing Foreign Key Integrity on Converted Intake Entities
- **Component**: Database Schema / Intake Management
- **File Path**: `backend/prisma/schema.prisma` (Lines 118–119)
- **Severity**: **HIGH**
- **Blocker Status**: **NO**
- **Description**: In model `Intake`, fields `convertedToClientId` and `convertedToMatterId` are stored as bare `String? @db.VarChar(36)` without `@relation` references to `Client` or `Matter`.
- **Evidence**:
  ```prisma
  model Intake {
    id                   String    @id @default(uuid()) @db.VarChar(36)
    convertedToClientId  String?   @map("converted_to_client_id") @db.VarChar(36)
    convertedToMatterId  String?   @map("converted_to_matter_id") @db.VarChar(36)
  }
  ```
- **Impact**: If a client or matter converted from an intake is hard-deleted or updated, the intake table retains dangling pointer strings, violating relational integrity.
- **Recommended Fix**: Add explicit Prisma relations linking `convertedToClientId` to `Client(id)` and `convertedToMatterId` to `Matter(id)` with `onDelete: SetNull`.

---

### BUG-06: Complete Lack of Rate Limiting
- **Component**: Security / Denial of Service Protection
- **File Path**: `backend/src/app.ts`
- **Severity**: **HIGH**
- **Blocker Status**: **NO**
- **Description**: The Express application has no request rate-limiting middleware configured.
- **Evidence**:
  - `backend/package.json` does not contain `express-rate-limit`.
  - `backend/src/app.ts` accepts unrestricted request volume.
- **Impact**: The backend is susceptible to DoS attacks, connection starvation, and brute-force password guessing once auth endpoints are introduced.
- **Recommended Fix**: Install `express-rate-limit` and configure a global limiter (e.g. 100 requests per 15 minutes) and a strict auth limiter (5 attempts per 15 minutes for `/api/v1/auth/login`).

---

### BUG-07: Complete Lack of Automated Test Suites
- **Component**: Quality Assurance & CI/CD
- **File Path**: `backend/package.json`
- **Severity**: **HIGH**
- **Blocker Status**: **YES** (Prevents automated regression testing)
- **Description**: No unit or integration testing framework (such as Vitest or Jest with Supertest) is installed or configured.
- **Evidence**:
  - `backend/package.json` defines `"test": "echo \"Error: no test specified\" && exit 1"`.
  - Zero test files (`*.test.ts` or `*.spec.ts`) exist in the backend repository.
- **Impact**: Any refactoring, schema migrations, or business route development cannot be automatically verified against regressions.
- **Recommended Fix**: Install `vitest`, `supertest`, and `@types/supertest`. Create unit tests for middlewares and integration tests against test MySQL containers.

---

### BUG-08: Rigid Single-Origin CORS Policy
- **Component**: Network & Configuration
- **File Path**: `backend/src/app.ts` (Lines 31–34) & `backend/src/config/env.ts`
- **Severity**: **MEDIUM**
- **Blocker Status**: **NO**
- **Description**: CORS is configured with a single origin string: `origin: config.clientOrigin`. In modern deployments, frontend apps frequently run on both local dev servers (`localhost:5173`, `localhost:3000`), preview environments, and production domains.
- **Evidence**:
  ```typescript
  app.use(cors({
    origin: config.clientOrigin,
    credentials: true,
  }));
  ```
- **Impact**: Developers running the frontend on alternative ports or staging URLs will encounter browser CORS rejection errors.
- **Recommended Fix**: Support an array of origins or a regex matcher in `env.ts` and `app.ts` to cleanly accommodate local development and production domains.

---

### BUG-09: Lack of Database Reconnection / Retry Loop on Server Boot
- **Component**: Database Reliability
- **File Path**: `backend/src/server.ts` (Lines 16–22)
- **Severity**: **MEDIUM**
- **Blocker Status**: **NO**
- **Description**: During `startServer()`, `testPrismaConnection()` is invoked once. If the MySQL service is restarting or slow to initialize during container startup, the backend immediately throws an error and exits without retrying.
- **Evidence**:
  ```typescript
  const isConnected = await testPrismaConnection();
  if (!isConnected) {
    logger.warn('Initial Prisma connection check failed. Ensure MySQL is running.');
  }
  ```
- **Impact**: In containerized deployments (Docker Compose / Kubernetes), the API server may crash loop if the database container starts a few seconds after the API container.
- **Recommended Fix**: Implement an exponential backoff retry loop (e.g., 5 attempts with 2s delays) before failing startup.

---

### BUG-10: Decimal Precision Serialization in JSON
- **Component**: Financial Accuracy & API Serialization
- **File Path**: `backend/prisma/schema.prisma` (`Decimal(12,2)`)
- **Severity**: **MEDIUM**
- **Blocker Status**: **NO**
- **Description**: Prisma returns `Decimal` fields (e.g. `hourlyRate`, `totalAmount`) as `Prisma.Decimal` objects, which serialize to string representations (e.g., `"150.00"`) in JSON.
- **Evidence**: Models `Matter`, `Invoice`, `Expense`, `Payment`, and `TrustAccount` all utilize `@db.Decimal(12,2)`.
- **Impact**: If the frontend expects numbers rather than strings for arithmetic, calculations could concatenate strings or produce `NaN`.
- **Recommended Fix**: Establish standard DTO mappers or document API contracts specifying that financial amounts are returned as numbers or strings formatted consistently.

---

### BUG-11: Health Check Endpoint Lacks Detailed Resource Diagnostics
- **Component**: Monitoring & Observability
- **File Path**: `backend/src/app.ts` (Lines 53–76)
- **Severity**: **LOW**
- **Blocker Status**: **NO**
- **Description**: `GET /api/v1/health` provides basic memory and DB latency, but does not report active database connection pool counts, disk space availability, or worker threads.
- **Impact**: Operations teams have limited visibility into pool saturation.
- **Recommended Fix**: Extend the health payload with connection pool telemetry when available.

---

### BUG-12: Missing NPM Production Scripts
- **Component**: Build & Deployment Tooling
- **File Path**: `backend/package.json`
- **Severity**: **LOW**
- **Blocker Status**: **NO**
- **Description**: `backend/package.json` contains `"build": "tsc"`, `"start": "node dist/server.js"`, and `"dev": "tsx watch src/server.ts"`. However, it lacks a dedicated linting script or migration deployment script (`prisma migrate deploy`).
- **Impact**: Deployment pipelines must execute manual Prisma CLI commands rather than standard npm lifecycle hooks.
- **Recommended Fix**: Add `"lint": "eslint src --ext .ts"` and `"db:migrate:prod": "prisma migrate deploy"` to `backend/package.json`.

