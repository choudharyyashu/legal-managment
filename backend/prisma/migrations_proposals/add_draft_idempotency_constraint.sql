-- =============================================================================
-- HEUGLY & BLUDWORTH Legal Practice Management SaaS
-- Phase 4 Sub-stage B.2 Schema Migration Proposal (UNEXECUTED PROPOSAL ONLY)
--
-- Objective:
-- Guarantees atomic database-enforced idempotency for auto-drafted legal documents
-- Scoped strictly to: matter_id + demand_package_id + template_id.
-- =============================================================================

-- Step 1: Add dedicated idempotency_key column to document_drafts
ALTER TABLE `document_drafts`
ADD COLUMN `idempotency_key` VARCHAR(191) NULL
COMMENT 'Unique idempotency key formatted as matterId:demandPackageId:templateId';

-- Step 2: Create Unique Constraint on idempotency_key
-- Ensures MySQL InnoDB rejects duplicate concurrent draft creation at the database engine level
-- with ER_DUP_ENTRY (1062) if two concurrent worker nodes attempt simultaneous inserts.
ALTER TABLE `document_drafts`
ADD CONSTRAINT `uq_document_drafts_idempotency_key` UNIQUE (`idempotency_key`);

-- Step 3: Fast B-Tree Index for rapid preflight existence queries
CREATE INDEX `idx_doc_drafts_idempotency_matter`
ON `document_drafts` (`matter_id`, `idempotency_key`);
