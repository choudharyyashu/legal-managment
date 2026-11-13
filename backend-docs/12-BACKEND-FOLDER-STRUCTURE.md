# 12 – BACKEND REPOSITORY FOLDER STRUCTURE

**Firm Name:** Heugly & Bludworth, Attorneys at Law  
**Framework Baseline:** Node.js 20 LTS / TypeScript 5 / Express 4 / Prisma ORM 5  
**Architectural Style:** Modular Domain-Driven Architecture

---

## 1. High-Level Directory Overview

```
backend/
├── prisma/
│   ├── schema.prisma                  # Master Prisma schema definitions
│   ├── migrations/                    # SQL migration history
│   └── seed.ts                        # Seed script (populates mock users, roles, practice areas)
├── src/
│   ├── app.ts                         # Express application setup & middleware assembly
│   ├── server.ts                      # Server entry point & HTTP listener
│   ├── common/                        # Cross-cutting concerns, shared utilities & base classes
│   │   ├── constants/                 # Business constants & error codes
│   │   ├── errors/                    # Custom AppError subclasses (NotFound, Forbidden, Conflict)
│   │   ├── middleware/                # Auth, RBAC, ethical walls, error handlers, rate limiters
│   │   ├── types/                     # Shared TypeScript interfaces & express.d.ts extensions
│   │   └── utils/                     # Formatting, date calculators, crypto helpers
│   ├── config/                        # Environment configuration & service initializers
│   │   ├── env.ts                     # Zod-validated environment variables
│   │   ├── database.ts                # Prisma client singleton
│   │   ├── redis.ts                   # Redis client & BullMQ connection
│   │   └── s3.ts                      # AWS S3 / MinIO client
│   ├── jobs/                          # Asynchronous workers & BullMQ queues
│   │   ├── queues.ts                  # Queue definitions (ocr, emailIngest, backup)
│   │   └── workers/                   # Worker processors
│   │       ├── ocr.worker.ts          # OCR & full-text extraction processor
│   │       ├── mail.worker.ts         # Microsoft Graph email ingestion processor
│   │       └── backup.worker.ts       # Automated daily snapshot & dry-run runner
│   └── modules/                       # Domain Modules (Autonomous business contexts)
│       ├── auth/                      # Authentication, session, login/logout, MFA
│       ├── users/                     # User management, rates, account activation
│       ├── clients/                   # 360° clients, contact directory
│       ├── intakes/                   # Prospective client intake, conflict checks (RPC 1.7)
│       ├── matters/                   # Matters docket, stage advancement, team roster
│       ├── tasks/                     # Task management, checklists, calendar events
│       ├── time-tracking/             # Billable time, suggested capture, approvals
│       ├── billing/                   # Invoices, expenses, payment allocations
│       ├── accounting/                # Trust sub-ledgers, GL, 3-way reconciliation (RPC 1.15)
│       ├── documents/                 # S3 vault, versioning, Bates stamping, privilege (RPC 1.6)
│       ├── communications/            # Outlook bridge, unmatched queue, client messages
│       ├── specialty-practices/       # Substantive specialty engines
│       │   ├── personal-injury/       # Treatment, medical providers, lien register
│       │   ├── bankruptcy/            # Debtor intake, means-test, Utah exemptions, ECF
│       │   ├── immigration/           # Cross-form sync, USCIS receipts, exhibit binders
│       │   ├── litigation/            # Proof matrix, litigation holds, discovery index
│       │   ├── probate/               # Estate inventory, creditor claims, bar dates
│       │   ├── family-law/            # Marital balance sheet, child support worksheet
│       │   ├── criminal/              # Charges, counts, plea offers, custody tracking
│       │   ├── appeals/               # Appellate briefs, record designation, oral arguments
│       │   └── evictions/             # 3-day notices, unlawful detainer, writ of restitution
│       ├── reports/                   # Staff realization, AR aging, compliance matrix
│       ├── settings/                  # Firm branding, workflow configurator, templates
│       └── audit-logs/                # Immutable compliance audit trail
├── tests/
│   ├── unit/                          # Isolated unit tests (calculators, math, validation)
│   ├── integration/                   # Supertest API tests with MySQL 8.4 testcontainers
│   └── fixtures/                      # Test payloads & seed factories
├── .dockerignore
├── .env.example                       # Documented environment configuration template
├── .gitignore
├── Dockerfile                         # Production multi-stage Alpine build
├── docker-compose.yml                 # Local dev orchestration (MySQL 8.4 LTS, Redis, MinIO)
├── package.json
└── tsconfig.json
```

---

## 2. Anatomy of a Domain Module

Every feature domain under `src/modules/<domain>/` is organized around a uniform 5-part architecture to ensure consistency:

```
src/modules/clients/
├── client.controller.ts     # Express route handlers; parses req, invokes service, returns res
├── client.service.ts        # Pure business logic, transactional rules & calculations
├── client.repository.ts     # Data access layer interfacing directly with Prisma
├── client.validators.ts     # Zod request validation schemas (body, query, params)
├── client.routes.ts         # Router definition attaching middleware (requireAuth, requirePermission)
└── client.dto.ts            # Exported TypeScript DTO types inferred from Zod schemas
```

### Module Responsibilities:
1. **`*.routes.ts`**: Declares endpoints, HTTP verbs, and attaches middleware (`requireAuth`, `requirePermission('clients:view')`).
2. **`*.validators.ts`**: Uses Zod to validate input data types, required strings, email formats, and positive decimals before requests reach the controller.
3. **`*.controller.ts`**: Extracts typed data from `req.body`, calls the corresponding service method, and formats the standardized JSON envelope.
4. **`*.service.ts`**: Contains pure business rules, cross-module service calls, conflict verifications, and financial invariants.
5. **`*.repository.ts`**: Encapsulates Prisma queries. Allows mocking data access during unit testing without requiring an active database.

---

## 3. Configuration & Startup Files

### 3.1 `src/server.ts`
- Binds Express application to port (default `5000`).
- Validates database connectivity on startup via `prisma.$connect()`.
- Validates Redis connectivity.
- Initializes BullMQ worker threads.
- Graceful shutdown handler (`SIGTERM`, `SIGINT`) draining connection pools safely.

### 3.2 `src/config/env.ts`
Zod schema verifying environment variables at boot time. The server crashes immediately if required configuration is missing:
```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  S3_ENDPOINT: z.string(),
  S3_BUCKET_NAME: z.string(),
  S3_ACCESS_KEY: z.string(),
  S3_SECRET_KEY: z.string(),
});

export const env = envSchema.parse(process.env);
```

