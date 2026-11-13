# HEUGLY & BLUDWORTH — BACKEND API SERVICE

**Firm Name:** Heugly & Bludworth, Attorneys at Law  
**Jurisdiction:** State of Utah (Utah State Bar, Third Judicial District Court)  
**Technology Stack:** Node.js 20+ LTS / TypeScript 5.6 / Express 4.21 / Prisma ORM 5.22 / MySQL 8.4 LTS  

---

## 1. Directory Structure

```
backend/
├── prisma/
│   └── schema.prisma         # Master Prisma schema definitions (17 core models)
│
├── src/
│   ├── config/               # System and database initializers
│   │   ├── database.ts       # Prisma Client singleton & MySQL connection checks
│   │   └── env.ts            # Zod-validated environment configuration
│   │
│   ├── errors/               # Standardized operational error classes
│   │   └── AppError.ts       # AppError hierarchy with HTTP status and error codes
│   │
│   ├── middleware/           # Reusable Express request & error interceptors
│   │   ├── errorHandler.ts   # Centralized error handler returning RFC JSON envelopes
│   │   ├── notFound.ts       # 404 handler for unregistered API routes
│   │   └── validate.ts       # Generic Zod request validator factory (body, query, params)
│   │
│   ├── utils/                # Utility helpers and loggers
│   │   └── logger.ts         # Structured JSON logger with ISO timestamps and context
│   │
│   ├── app.ts                # Express application setup, security, and middleware assembly
│   ├── server.ts             # Server entry point, port listener, and graceful teardown
│   └── test-db.ts            # Diagnostic database connection verification utility
│
├── .env.example              # Documented environment variables template
├── .gitignore                # Backend-specific ignore rules
├── package.json              # NPM dependencies and development scripts
├── package-lock.json         # Locked dependency versions
├── tsconfig.json             # TypeScript configuration (ES2022 / NodeNext)
└── README.md                 # This documentation file
```

---

## 2. Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts server in watch mode using `tsx` (`src/server.ts`). |
| `npm run build` | Compiles TypeScript source code to `dist/` using `tsc`. |
| `npm start` | Runs the compiled server from `dist/server.js`. |
| `npm run db:test` | Runs the standalone database connection diagnostic script. |
| `npm run prisma:generate` | Generates the `@prisma/client` library from `prisma/schema.prisma`. |
| `npm run prisma:migrate` | Runs Prisma development migrations. |
| `npm run prisma:studio` | Launches Prisma Studio GUI for database inspection. |

---

## 3. Environment Configuration

Copy `.env.example` to `.env` to configure your local development environment:

```powershell
cp .env.example .env
```

Key variables:
- `PORT`: HTTP port for API server (default: `5000`)
- `NODE_ENV`: Runtime environment (`development`, `production`, `test`)
- `CLIENT_ORIGIN`: Allowed frontend origin for CORS (default: `http://localhost:5173`)
- `DATABASE_URL`: Connection string (`mysql://root:@localhost:3306/legal-db`)
- `JWT_ACCESS_SECRET`: Secret key for JWT access tokens (minimum 16 chars)
- `JWT_REFRESH_SECRET`: Secret key for JWT refresh tokens (minimum 16 chars)

---

## 4. Architecture Specifications

For complete domain architecture, database ERDs, compliance rules (Utah RPC 1.15 trust accounting), and API specifications, consult the master documentation suite in `../backend-docs/`.

