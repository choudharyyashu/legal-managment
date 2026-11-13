# HEUGLY & BLUDWORTH – LEGAL PRACTICE MANAGEMENT SAAS
## Complete Backend Architecture & Technical Documentation Suite

**Law Firm:** Heugly & Bludworth, Attorneys at Law  
**Jurisdiction:** State of Utah (Utah State Bar, Utah Third Judicial District Court, U.S. District Court for the District of Utah)  
**Target User Scale:** 50 combined attorneys, paralegals, partners, and billing staff (expandable to 150+)  
**Frontend Baseline:** React 18 / Vite 5 / Tailwind CSS / Recharts / React Router v6  
**Primary Database:** MySQL 8.4 LTS (InnoDB Storage Engine / utf8mb4)  
**ORM:** Prisma ORM 5.x (`provider = "mysql"`)  
**Architecture Status:** Phase 2 Complete Technical Blueprint (Updated for MySQL 8.4 LTS)

---

## 1. Executive Summary

This documentation suite defines the complete, production-grade backend architecture for the **Heugly & Bludworth Legal Practice Management SaaS** platform. 

The Heugly & Bludworth platform is an integrated legal operating system custom-engineered to eliminate firm dependency on multiple fragmented legal technology platforms:
1. **Clio Parity**: Comprehensive 360° client and matter records, centralized contact directories, calendar docketing, court deadline calculation, and client-facing collaboration portals.
2. **Filevine Workflow Engine**: Configurable stage pipelines, required information gatekeepers, automated role-based task generation, and escalation protocols across 9 distinct practice areas.
3. **Best Case Bankruptcy Preparation**: Substantive Chapter 7, 11, and 13 debtor intake wizards, 6-month Form 122 Means-Test calculations, Utah statutory exemption calculators (§ 78B-5-501/505), Schedules A/B through J ledgers, and 14-day emergency stay CM/ECF compilation.
4. **Docketwise Immigration Preparation**: Multilingual questionnaires, single-source cross-form synchronization (Form G-28, I-130, I-485, I-765, I-864), USCIS case receipt tracking, and indexed 7-tab exhibit binders.
5. **CosmoLex Replacement & Autonomous Accounting**: Native double-entry general ledger, Utah RPC 1.15 IOLTA client trust accounting with anti-commingling rules, automated three-way reconciliation (Bank Statement $\leftrightarrow$ General Ledger $\leftrightarrow$ Client Sub-Ledgers), and personal injury contingency settlement disbursement models.

---

## 2. Core Legal & Regulatory Compliance Framework

Every architectural decision and data schema in this backend design enforces compliance with Utah and Federal statutory rules:

| Regulatory Standard | Legal Description | Backend Architectural Enforcement |
| :--- | :--- | :--- |
| **Utah RPC 1.15** | Safekeeping Property & Trust Accounts | Strict multi-tenant trust sub-ledgers; anti-commingling database `CHECK` constraints (MySQL 8.4); negative balance prevention; immutable transaction journals; monthly 3-way reconciliation balancing with $0 variance audit certificate generation. |
| **Utah RPC 1.6 & ABA Formal Op. 477R / 512** | Confidentiality of Information | AES-256 encryption at rest; strict ethical walls preventing unauthorized matter access; exclusion of privileged work product from client portals; private zero-training AI policy. |
| **Utah RPC 1.7** | Conflict of Interest | Pre-intake adverse party search engine; mandatory conflict clearance recording prior to client conversion or matter opening. |
| **Utah RPC 1.5(c)** | Contingency Fee Agreements | Automated itemization of gross recoveries, legal fee percentages, case disbursements, and third-party medical/ERISA liens in a signed disbursement statement. |
| **Utah URCP Rule 6** | Computation of Court Deadlines | Business-day calculation rules (excluding intermediate weekends and legal holidays for periods under 11 days; adding 3 days for electronic service). |
| **11 U.S.C. § 521 & FRBP Rule 1007** | Bankruptcy Debtor Compliance | Mandatory document checklist (60-day pay stubs, 2-year tax returns); formatted creditor matrix generation. |
| **8 CFR § 245.2 & § 292.1** | Concurrent Immigration Filing & Representation | Concurrent visa petition and adjustment package assembly; Form G-28 attorney appearance binding. |

---

## 3. Documentation Suite Index

This repository contains 15 detailed technical specifications covering every aspect of the backend system:

| Document | Title | Description |
| :--- | :--- | :--- |
| [01-BACKEND-ARCHITECTURE.md](./01-BACKEND-ARCHITECTURE.md) | **Backend Architecture** | Modular domain architecture, communication patterns, transactional boundaries, and scalability models for 50+ concurrent users on MySQL 8.4. |
| [02-TECHNOLOGY-STACK.md](./02-TECHNOLOGY-STACK.md) | **Technology Stack Recommendation** | Evaluation of Node.js/TypeScript / Express / Prisma ORM / MySQL 8.4 LTS / Redis / BullMQ. |
| [03-DATABASE-DESIGN.md](./03-DATABASE-DESIGN.md) | **Database Design & Schema** | Complete MySQL 8.4 schema definitions across 25+ relational tables, fields, constraints, enums, indexes, and frontend mock mappings. |
| [04-ENTITY-RELATIONSHIPS.md](./04-ENTITY-RELATIONSHIPS.md) | **Entity Relationship Diagrams** | Visual Mermaid ER diagrams detailing core domain models, trust accounting ledgers, and specialty practice dockets. |
| [05-API-SPECIFICATION.md](./05-API-SPECIFICATION.md) | **Complete API Specification** | Exhaustive catalog of 75+ RESTful endpoints under `/api/v1` with HTTP verbs, auth rules, schemas, and status codes. |
| [06-AUTHENTICATION-AUTHORIZATION.md](./06-AUTHENTICATION-AUTHORIZATION.md) | **Authentication & RBAC** | JWT token lifecycle, bcrypt hashing, 5 existing firm roles, 45+ granular permissions, Utah RPC 1.6 ethical walls, and TOTP MFA. |
| [07-BUSINESS-LOGIC-AND-WORKFLOWS.md](./07-BUSINESS-LOGIC-AND-WORKFLOWS.md) | **Business Logic & Workflows** | Transactional logic for Intake $\rightarrow$ Client, Stage transitions, Passive Time Capture, 3-Way Reconciliation, and Settlement models. |
| [08-FILE-STORAGE-AND-DOCUMENT-MANAGEMENT.md](./08-FILE-STORAGE-AND-DOCUMENT-MANAGEMENT.md) | **File Storage & Document Management** | S3-compatible vault, presigned URLs, AES-256 encryption, document versioning (`v1.0`..`v2.1`), MySQL FULLTEXT OCR pipeline, and Bates numbering. |
| [09-SECURITY-AND-COMPLIANCE.md](./09-SECURITY-AND-COMPLIANCE.md) | **Security & Regulatory Compliance** | Utah Bar compliance, immutable audit logging with MySQL `SIGNAL SQLSTATE '45000'` triggers, privilege separation, and disaster recovery. |
| [10-INTEGRATIONS-AND-THIRD-PARTY-SERVICES.md](./10-INTEGRATIONS-AND-THIRD-PARTY-SERVICES.md) | **Integrations & Cloud Services** | Integration register for Microsoft Graph (Outlook), OneDrive/Dropbox, Utah GreenFiling/ECF, LawPay, and the CosmoLex export bridge. |
| [11-FRONTEND-BACKEND-INTEGRATION.md](./11-FRONTEND-BACKEND-INTEGRATION.md) | **Frontend Integration Strategy** | Migration plan from `mockStorage` to live Axios API service layer, React Context updates, optimistic UI, and error handling. |
| [12-BACKEND-FOLDER-STRUCTURE.md](./12-BACKEND-FOLDER-STRUCTURE.md) | **Backend Folder Structure** | Production-ready, modular repository structure organizing controllers, services, repositories, validators, and middlewares. |
| [13-IMPLEMENTATION-ROADMAP.md](./13-IMPLEMENTATION-ROADMAP.md) | **12-Phase Implementation Roadmap** | Phased engineering plan detailing dependencies, database migrations, APIs, affected screens, and exit criteria per phase with MySQL 8.4. |
| [14-TESTING-STRATEGY.md](./14-TESTING-STRATEGY.md) | **Testing & Quality Assurance** | Unit testing, integration tests with MySQL 8.4 testcontainers, financial audit tests, RBAC security verification, and load tests. |
| [16-MYSQL-MIGRATION-REPORT.md](./16-MYSQL-MIGRATION-REPORT.md) | **MySQL Migration Report** | Detailed analysis of PostgreSQL to MySQL 8.4 LTS migration: data types, constraints, triggers, indexes, and full compatibility verification. |

---

## 4. Development Principles & Boundary Rules

1. **Strict Client Boundary (Zero-CosmoLex Dependency)**: CosmoLex remains available solely as a transitional export recipient (`/api/v1/integrations/cosmolex/export`). The internal general ledger and trust accounting operate 100% autonomously with native 3-way reconciliation.
2. **Double-Entry Financial Invariance**: No financial transaction (operating cash or trust) can be recorded without balanced debits and credits ($\sum \text{Debits} = \sum \text{Credits}$). Direct edits or deletions of posted financial transactions are strictly prohibited; all adjustments require auditable reversal entries.
3. **Client-Matter Isolation**: One client may have many matters; one matter involves multiple linked parties (adversaries, witnesses, insurers, experts). Billing, permissions, and deadlines never bleed across matters.
4. **Backend-Enforced Authorization**: Frontend permission checks and route guards exist solely for user experience. Every single backend endpoint independently validates user identity, role permissions, and matter-level ethical wall assignments.
5. **No Code Without Specification**: Implementation must follow the exact phases and contracts defined in this documentation suite.
