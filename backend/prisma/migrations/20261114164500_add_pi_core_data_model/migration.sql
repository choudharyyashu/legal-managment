-- CreateTable
CREATE TABLE `pi_incident_parties` (
    `id` VARCHAR(36) NOT NULL,
    `incident_id` VARCHAR(36) NOT NULL,
    `party_type` VARCHAR(50) NOT NULL,
    `full_name` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `insurance_carrier` VARCHAR(150) NULL,
    `policy_number` VARCHAR(100) NULL,
    `claim_number` VARCHAR(100) NULL,
    `vehicle_make` VARCHAR(50) NULL,
    `vehicle_model` VARCHAR(50) NULL,
    `vehicle_year` INTEGER NULL,
    `vehicle_plate` VARCHAR(20) NULL,
    `vehicle_state` VARCHAR(10) NULL,
    `citations_issued` VARCHAR(255) NULL,
    `admitted_fault` BOOLEAN NOT NULL DEFAULT false,
    `fault_percentage` DECIMAL(5, 2) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_parties_incident`(`incident_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pi_medical_billing_summaries` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `provider_id` VARCHAR(36) NOT NULL,
    `account_number` VARCHAR(100) NOT NULL DEFAULT 'PRIMARY',
    `service_category` VARCHAR(150) NULL,
    `total_billed` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `cached_balance_owed` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `billing_ledger_document_id` VARCHAR(36) NULL,
    `treatment_status` VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_med_billing_matter`(`matter_id`),
    INDEX `idx_med_billing_provider`(`provider_id`),
    UNIQUE INDEX `pi_medical_billing_summaries_provider_id_account_number_key`(`provider_id`, `account_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pi_medical_payment_records` (
    `id` VARCHAR(36) NOT NULL,
    `billing_summary_id` VARCHAR(36) NOT NULL,
    `transaction_type` VARCHAR(50) NOT NULL,
    `payment_source` VARCHAR(50) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `payment_date` DATE NOT NULL,
    `check_or_reference_number` VARCHAR(50) NULL,
    `eob_document_id` VARCHAR(36) NULL,
    `reversal_of_record_id` VARCHAR(36) NULL,
    `reason_notes` TEXT NULL,
    `created_by_user_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pi_medical_payment_records_reversal_of_record_id_key`(`reversal_of_record_id`),
    INDEX `idx_payments_summary`(`billing_summary_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pi_vendors` (
    `id` VARCHAR(36) NOT NULL,
    `vendor_name` VARCHAR(200) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `contact_person` VARCHAR(150) NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(150) NULL,
    `hourly_rate` DECIMAL(10, 2) NULL,
    `tax_id` VARCHAR(50) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pi_vendor_assignments` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `vendor_id` VARCHAR(36) NOT NULL,
    `assigned_staff_id` VARCHAR(36) NOT NULL,
    `expense_id` VARCHAR(36) NULL,
    `service_scope` TEXT NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'ASSIGNED',
    `assigned_date` DATE NOT NULL,
    `due_date` DATE NULL,
    `authorized_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `invoiced_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `report_document_id` VARCHAR(36) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_vendor_assign_matter`(`matter_id`),
    INDEX `idx_vendor_assign_vendor`(`vendor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pi_demand_packages` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `insurance_policy_id` VARCHAR(36) NULL,
    `draft_document_id` VARCHAR(36) NULL,
    `approved_by_attorney_id` VARCHAR(36) NULL,
    `demand_title` VARCHAR(255) NOT NULL,
    `recipient_carrier` VARCHAR(200) NOT NULL,
    `claim_number` VARCHAR(100) NULL,
    `demanded_amount` DECIMAL(12, 2) NOT NULL,
    `policy_limit_amount` DECIMAL(12, 2) NULL,
    `is_policy_limit_demand` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(50) NOT NULL DEFAULT 'DRAFTING',
    `sent_date` DATE NULL,
    `deadline_date` DATE NOT NULL,
    `response_received_date` DATE NULL,
    `checklist_state` JSON NULL,
    `counter_offer_amount` DECIMAL(12, 2) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_demand_matter`(`matter_id`),
    INDEX `idx_demand_policy`(`insurance_policy_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pi_liens` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `provider_id` VARCHAR(36) NULL,
    `lienholder_name` VARCHAR(200) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `account_reference` VARCHAR(100) NULL,
    `asserted_amount` DECIMAL(12, 2) NOT NULL,
    `verified_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `negotiated_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `common_fund_reduction_rate` DECIMAL(5, 2) NULL,
    `procurement_cost_deduction` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `final_payoff_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `status` VARCHAR(50) NOT NULL DEFAULT 'ASSERTED',
    `final_payoff_letter_document_id` VARCHAR(36) NULL,
    `is_erisa_qualified` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_liens_matter`(`matter_id`),
    INDEX `idx_liens_provider`(`provider_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pi_lien_negotiations` (
    `id` VARCHAR(36) NOT NULL,
    `lien_id` VARCHAR(36) NOT NULL,
    `conducted_by_user_id` VARCHAR(36) NOT NULL,
    `negotiation_date` DATE NOT NULL,
    `offered_amount` DECIMAL(12, 2) NOT NULL,
    `response_amount` DECIMAL(12, 2) NULL,
    `outcome` VARCHAR(50) NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_negotiations_lien`(`lien_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pi_settlement_disbursements` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `settlement_title` VARCHAR(255) NOT NULL,
    `current_version_number` INTEGER NOT NULL DEFAULT 1,
    `status` VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_settlements_matter`(`matter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pi_settlement_disbursement_versions` (
    `id` VARCHAR(36) NOT NULL,
    `settlement_disbursement_id` VARCHAR(36) NOT NULL,
    `version_number` INTEGER NOT NULL,
    `gross_settlement_amount` DECIMAL(12, 2) NOT NULL,
    `contingency_fee_percentage` DECIMAL(5, 2) NOT NULL,
    `calculated_attorney_fee` DECIMAL(12, 2) NOT NULL,
    `total_litigation_costs` DECIMAL(12, 2) NOT NULL,
    `total_client_advances` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total_medical_liens` DECIMAL(12, 2) NOT NULL,
    `other_deductions` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `net_client_recovery` DECIMAL(12, 2) NOT NULL,
    `version_status` VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    `is_immutable` BOOLEAN NOT NULL DEFAULT false,
    `signed_closing_statement_doc_id` VARCHAR(36) NULL,
    `client_approval_date` DATE NULL,
    `client_approval_evidence` VARCHAR(255) NULL,
    `approved_by_attorney_id` VARCHAR(36) NULL,
    `approved_at` DATETIME(3) NULL,
    `created_by_user_id` VARCHAR(36) NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pi_settlement_disbursement_versions_settlement_disbursement__key`(`settlement_disbursement_id`, `version_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pi_settlement_executions` (
    `id` VARCHAR(36) NOT NULL,
    `settlement_version_id` VARCHAR(36) NOT NULL,
    `trust_sub_ledger_id` VARCHAR(36) NOT NULL,
    `idempotency_key` VARCHAR(100) NOT NULL,
    `executed_by_user_id` VARCHAR(36) NOT NULL,
    `executed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pi_settlement_executions_settlement_version_id_key`(`settlement_version_id`),
    UNIQUE INDEX `pi_settlement_executions_idempotency_key_key`(`idempotency_key`),
    UNIQUE INDEX `pi_settlement_executions_id_trust_sub_ledger_id_key`(`id`, `trust_sub_ledger_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pi_settlement_execution_lines` (
    `id` VARCHAR(36) NOT NULL,
    `settlement_execution_id` VARCHAR(36) NOT NULL,
    `trust_sub_ledger_id` VARCHAR(36) NOT NULL,
    `trust_transaction_id` VARCHAR(36) NOT NULL,
    `disbursement_role` VARCHAR(50) NOT NULL,
    `line_identifier` VARCHAR(100) NOT NULL,
    `lien_id` VARCHAR(36) NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `payee_name` VARCHAR(200) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pi_settlement_execution_lines_trust_transaction_id_key`(`trust_transaction_id`),
    INDEX `idx_execution_lines_subledger`(`trust_sub_ledger_id`),
    INDEX `idx_execution_lines_lien`(`lien_id`),
    UNIQUE INDEX `pi_settlement_execution_lines_settlement_execution_id_line_i_key`(`settlement_execution_id`, `line_identifier`),
    UNIQUE INDEX `pi_settlement_execution_lines_trust_transaction_id_trust_sub_key`(`trust_transaction_id`, `trust_sub_ledger_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pi_damages_records` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `injury_category` VARCHAR(50) NOT NULL,
    `anatomical_location` VARCHAR(150) NOT NULL,
    `severity_grade` VARCHAR(50) NOT NULL,
    `icd_code` VARCHAR(30) NULL,
    `future_treatment_projected` BOOLEAN NOT NULL DEFAULT false,
    `future_medical_estimated_cost` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `treatment_summary` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_damages_matter`(`matter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pi_diagnostic_studies` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `damages_record_id` VARCHAR(36) NULL,
    `imaging_report_document_id` VARCHAR(36) NULL,
    `study_type` VARCHAR(50) NOT NULL,
    `body_region` VARCHAR(100) NOT NULL,
    `study_date` DATE NOT NULL,
    `facility_name` VARCHAR(200) NOT NULL,
    `radiologist_impression` TEXT NOT NULL,
    `is_positive_finding` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_diagnostics_matter`(`matter_id`),
    INDEX `idx_diagnostics_damage`(`damages_record_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pi_wage_loss_records` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `verification_document_id` VARCHAR(36) NULL,
    `employer_name` VARCHAR(200) NOT NULL,
    `job_title` VARCHAR(150) NOT NULL,
    `pay_rate_type` VARCHAR(50) NOT NULL DEFAULT 'HOURLY',
    `base_pay_rate` DECIMAL(10, 2) NOT NULL,
    `hours_lost` DECIMAL(8, 2) NULL,
    `days_lost` INTEGER NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `total_lost_wages` DECIMAL(12, 2) NOT NULL,
    `is_verified_by_employer` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_wageloss_matter`(`matter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `trust_transactions_id_trust_sub_ledger_id_key` ON `trust_transactions`(`id`, `trust_sub_ledger_id`);

-- CreateIndex
CREATE UNIQUE INDEX `pi_medical_providers_id_matter_id_key` ON `pi_medical_providers`(`id`, `matter_id`);

-- AddForeignKey
ALTER TABLE `pi_incident_parties` ADD CONSTRAINT `pi_incident_parties_incident_id_fkey` FOREIGN KEY (`incident_id`) REFERENCES `pi_incidents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_medical_billing_summaries` ADD CONSTRAINT `pi_medical_billing_summaries_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_medical_billing_summaries` ADD CONSTRAINT `pi_medical_billing_summaries_provider_id_matter_id_fkey` FOREIGN KEY (`provider_id`, `matter_id`) REFERENCES `pi_medical_providers`(`id`, `matter_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_medical_billing_summaries` ADD CONSTRAINT `pi_medical_billing_summaries_billing_ledger_document_id_fkey` FOREIGN KEY (`billing_ledger_document_id`) REFERENCES `documents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_medical_payment_records` ADD CONSTRAINT `pi_medical_payment_records_billing_summary_id_fkey` FOREIGN KEY (`billing_summary_id`) REFERENCES `pi_medical_billing_summaries`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_medical_payment_records` ADD CONSTRAINT `pi_medical_payment_records_eob_document_id_fkey` FOREIGN KEY (`eob_document_id`) REFERENCES `documents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_medical_payment_records` ADD CONSTRAINT `pi_medical_payment_records_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_medical_payment_records` ADD CONSTRAINT `pi_medical_payment_records_reversal_of_record_id_fkey` FOREIGN KEY (`reversal_of_record_id`) REFERENCES `pi_medical_payment_records`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_vendor_assignments` ADD CONSTRAINT `pi_vendor_assignments_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_vendor_assignments` ADD CONSTRAINT `pi_vendor_assignments_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `pi_vendors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_vendor_assignments` ADD CONSTRAINT `pi_vendor_assignments_assigned_staff_id_fkey` FOREIGN KEY (`assigned_staff_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_vendor_assignments` ADD CONSTRAINT `pi_vendor_assignments_expense_id_fkey` FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_vendor_assignments` ADD CONSTRAINT `pi_vendor_assignments_report_document_id_fkey` FOREIGN KEY (`report_document_id`) REFERENCES `documents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_demand_packages` ADD CONSTRAINT `pi_demand_packages_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_demand_packages` ADD CONSTRAINT `pi_demand_packages_insurance_policy_id_fkey` FOREIGN KEY (`insurance_policy_id`) REFERENCES `pi_insurance_policies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_demand_packages` ADD CONSTRAINT `pi_demand_packages_draft_document_id_fkey` FOREIGN KEY (`draft_document_id`) REFERENCES `documents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_demand_packages` ADD CONSTRAINT `pi_demand_packages_approved_by_attorney_id_fkey` FOREIGN KEY (`approved_by_attorney_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_liens` ADD CONSTRAINT `pi_liens_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_liens` ADD CONSTRAINT `pi_liens_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `pi_medical_providers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_liens` ADD CONSTRAINT `pi_liens_final_payoff_letter_document_id_fkey` FOREIGN KEY (`final_payoff_letter_document_id`) REFERENCES `documents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_lien_negotiations` ADD CONSTRAINT `pi_lien_negotiations_lien_id_fkey` FOREIGN KEY (`lien_id`) REFERENCES `pi_liens`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_lien_negotiations` ADD CONSTRAINT `pi_lien_negotiations_conducted_by_user_id_fkey` FOREIGN KEY (`conducted_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_settlement_disbursements` ADD CONSTRAINT `pi_settlement_disbursements_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_settlement_disbursement_versions` ADD CONSTRAINT `pi_settlement_disbursement_versions_settlement_disbursement_fkey` FOREIGN KEY (`settlement_disbursement_id`) REFERENCES `pi_settlement_disbursements`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_settlement_disbursement_versions` ADD CONSTRAINT `pi_settlement_disbursement_versions_signed_closing_statemen_fkey` FOREIGN KEY (`signed_closing_statement_doc_id`) REFERENCES `documents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_settlement_disbursement_versions` ADD CONSTRAINT `pi_settlement_disbursement_versions_approved_by_attorney_id_fkey` FOREIGN KEY (`approved_by_attorney_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_settlement_disbursement_versions` ADD CONSTRAINT `pi_settlement_disbursement_versions_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_settlement_executions` ADD CONSTRAINT `pi_settlement_executions_settlement_version_id_fkey` FOREIGN KEY (`settlement_version_id`) REFERENCES `pi_settlement_disbursement_versions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_settlement_executions` ADD CONSTRAINT `pi_settlement_executions_trust_sub_ledger_id_fkey` FOREIGN KEY (`trust_sub_ledger_id`) REFERENCES `trust_sub_ledgers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_settlement_executions` ADD CONSTRAINT `pi_settlement_executions_executed_by_user_id_fkey` FOREIGN KEY (`executed_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_settlement_execution_lines` ADD CONSTRAINT `pi_settlement_execution_lines_settlement_execution_id_trust_fkey` FOREIGN KEY (`settlement_execution_id`, `trust_sub_ledger_id`) REFERENCES `pi_settlement_executions`(`id`, `trust_sub_ledger_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_settlement_execution_lines` ADD CONSTRAINT `pi_settlement_execution_lines_trust_transaction_id_trust_su_fkey` FOREIGN KEY (`trust_transaction_id`, `trust_sub_ledger_id`) REFERENCES `trust_transactions`(`id`, `trust_sub_ledger_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_settlement_execution_lines` ADD CONSTRAINT `pi_settlement_execution_lines_lien_id_fkey` FOREIGN KEY (`lien_id`) REFERENCES `pi_liens`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_damages_records` ADD CONSTRAINT `pi_damages_records_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_diagnostic_studies` ADD CONSTRAINT `pi_diagnostic_studies_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_diagnostic_studies` ADD CONSTRAINT `pi_diagnostic_studies_damages_record_id_fkey` FOREIGN KEY (`damages_record_id`) REFERENCES `pi_damages_records`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_diagnostic_studies` ADD CONSTRAINT `pi_diagnostic_studies_imaging_report_document_id_fkey` FOREIGN KEY (`imaging_report_document_id`) REFERENCES `documents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_wage_loss_records` ADD CONSTRAINT `pi_wage_loss_records_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_wage_loss_records` ADD CONSTRAINT `pi_wage_loss_records_verification_document_id_fkey` FOREIGN KEY (`verification_document_id`) REFERENCES `documents`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

