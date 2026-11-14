-- =============================================================================
-- HEUGLY & BLUDWORTH Legal Practice Management SaaS
-- Migration: 20261114164600_add_pi_triggers_and_constraints
-- Purpose: Adds engine-level check constraints and triggers for:
--          1. Trust accounting negative balance prevention (Utah RPC 1.15).
--          2. Settlement version immutability protection (UPDATE and DELETE).
--          3. Cross-matter settlement disbursement to trust subledger alignment.
-- Database Target: MySQL 8.4 LTS
-- =============================================================================

-- 1. Trust Sub-Ledger Non-Negative Balance Check Constraint
ALTER TABLE `trust_sub_ledgers`
  ADD CONSTRAINT `chk_trust_subledger_non_negative` CHECK (`balance` >= 0.00);

-- 2. Trigger: Prevent Negative Balance on Trust Sub-Ledger Update
DROP TRIGGER IF EXISTS `trg_prevent_subledger_negative_balance`;
CREATE TRIGGER `trg_prevent_subledger_negative_balance`
BEFORE UPDATE ON `trust_sub_ledgers`
FOR EACH ROW
BEGIN
    IF NEW.`balance` < 0.00 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'IOLTA Violation (Utah RPC 1.15): Trust subledger balance cannot be negative.';
    END IF;
END;

-- 3. Trigger: Prevent Negative Running Balance on Trust Transaction Insertion
DROP TRIGGER IF EXISTS `trg_prevent_trust_overdraft`;
CREATE TRIGGER `trg_prevent_trust_overdraft`
BEFORE INSERT ON `trust_transactions`
FOR EACH ROW
BEGIN
    IF NEW.`running_balance` < 0.00 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'IOLTA Violation (Utah RPC 1.15): Trust transaction running balance cannot be negative.';
    END IF;
END;

-- 4. Trigger: Prevent Updates to Finalized (Immutable) Settlement Versions
DROP TRIGGER IF EXISTS `trg_prevent_immutable_settlement_update`;
CREATE TRIGGER `trg_prevent_immutable_settlement_update`
BEFORE UPDATE ON `pi_settlement_disbursement_versions`
FOR EACH ROW
BEGIN
    IF OLD.`is_immutable` = 1 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Execution Blocked: Settlement version is finalized and immutable. Modifications are prohibited.';
    END IF;
END;

-- 5. Trigger: Prevent Deletion of Finalized (Immutable) Settlement Versions
DROP TRIGGER IF EXISTS `trg_prevent_immutable_settlement_delete`;
CREATE TRIGGER `trg_prevent_immutable_settlement_delete`
BEFORE DELETE ON `pi_settlement_disbursement_versions`
FOR EACH ROW
BEGIN
    IF OLD.`is_immutable` = 1 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Audit Violation: Finalized settlement versions cannot be deleted.';
    END IF;
END;

-- 6. Trigger: Enforce Cross-Matter Alignment Between Settlement and Trust Sub-Ledger
DROP TRIGGER IF EXISTS `trg_verify_settlement_matter_subledger`;
CREATE TRIGGER `trg_verify_settlement_matter_subledger`
BEFORE INSERT ON `pi_settlement_executions`
FOR EACH ROW
BEGIN
    DECLARE v_settlement_matter_id VARCHAR(36);
    DECLARE v_subledger_matter_id VARCHAR(36);

    SELECT d.`matter_id` INTO v_settlement_matter_id
    FROM `pi_settlement_disbursement_versions` v
    JOIN `pi_settlement_disbursements` d ON v.`settlement_disbursement_id` = d.`id`
    WHERE v.`id` = NEW.`settlement_version_id`
    LIMIT 1;

    SELECT s.`matter_id` INTO v_subledger_matter_id
    FROM `trust_sub_ledgers` s
    WHERE s.`id` = NEW.`trust_sub_ledger_id`
    LIMIT 1;

    IF v_settlement_matter_id IS NULL OR v_subledger_matter_id IS NULL OR v_settlement_matter_id <> v_subledger_matter_id THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Integrity Violation: TrustSubLedger matter does not match Settlement Disbursement matter.';
    END IF;
END;
