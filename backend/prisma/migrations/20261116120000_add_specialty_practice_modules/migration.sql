-- CreateTable
CREATE TABLE `communications` (
    `id` VARCHAR(36) NOT NULL,
    `client_id` VARCHAR(36) NULL,
    `matter_id` VARCHAR(36) NULL,
    `type` VARCHAR(50) NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `sender` VARCHAR(255) NOT NULL,
    `recipient` VARCHAR(255) NOT NULL,
    `summary` TEXT NOT NULL,
    `direction` VARCHAR(20) NOT NULL DEFAULT 'OUTBOUND',
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `duration_minutes` INTEGER NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Filed',
    `source_identifier` VARCHAR(255) NULL,
    `created_by_id` VARCHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_comms_client`(`client_id`),
    INDEX `idx_comms_matter`(`matter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `unmatched_communications` (
    `id` VARCHAR(36) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `sender_name` VARCHAR(200) NOT NULL,
    `sender_email` VARCHAR(200) NULL,
    `contact_number` VARCHAR(50) NULL,
    `subject` VARCHAR(255) NOT NULL,
    `preview` TEXT NOT NULL,
    `received_at` DATETIME(3) NOT NULL,
    `suggested_client_id` VARCHAR(36) NULL,
    `suggested_matter_id` VARCHAR(36) NULL,
    `suggested_client_name` VARCHAR(200) NULL,
    `suggested_matter_label` VARCHAR(255) NULL,
    `matching_status` VARCHAR(50) NOT NULL DEFAULT 'Unmatched',
    `review_notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `litigation_cases` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `court_jurisdiction` VARCHAR(150) NULL,
    `court_name` VARCHAR(255) NULL,
    `case_docket_number` VARCHAR(100) NULL,
    `presiding_judge` VARCHAR(150) NULL,
    `jury_demand` BOOLEAN NOT NULL DEFAULT false,
    `litigation_stage` VARCHAR(50) NOT NULL DEFAULT 'Pre-Filing',
    `filing_date` DATE NULL,
    `trial_date` DATE NULL,
    `discovery_cutoff_date` DATE NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `litigation_cases_matter_id_key`(`matter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `court_hearings` (
    `id` VARCHAR(36) NOT NULL,
    `litigation_case_id` VARCHAR(36) NOT NULL,
    `hearing_type` VARCHAR(100) NOT NULL,
    `hearing_date` DATETIME(3) NOT NULL,
    `courtroom` VARCHAR(100) NULL,
    `judge_name` VARCHAR(150) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Scheduled',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_hearings_lit_case`(`litigation_case_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `discovery_requests` (
    `id` VARCHAR(36) NOT NULL,
    `litigation_case_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `propounding_party` VARCHAR(150) NOT NULL,
    `responding_party` VARCHAR(150) NOT NULL,
    `served_date` DATE NULL,
    `due_date` DATE NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
    `completed_date` DATE NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_discovery_lit_case`(`litigation_case_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pleadings_records` (
    `id` VARCHAR(36) NOT NULL,
    `litigation_case_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `pleading_type` VARCHAR(100) NOT NULL,
    `filing_party` VARCHAR(150) NOT NULL,
    `filed_date` DATE NULL,
    `response_due_date` DATE NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Draft',
    `ecf_docket_number` VARCHAR(50) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_pleadings_lit_case`(`litigation_case_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trial_notebook_items` (
    `id` VARCHAR(36) NOT NULL,
    `litigation_case_id` VARCHAR(36) NOT NULL,
    `section` VARCHAR(100) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `admissibility` VARCHAR(50) NULL,
    `order_index` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_trial_nb_lit_case`(`litigation_case_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bankruptcy_cases` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `chapter` VARCHAR(20) NOT NULL,
    `case_number` VARCHAR(50) NULL,
    `court_district` VARCHAR(150) NULL DEFAULT 'District of Utah',
    `court_division` VARCHAR(100) NULL DEFAULT 'Salt Lake City',
    `assigned_judge` VARCHAR(150) NULL,
    `trustee_name` VARCHAR(150) NULL,
    `debtor_type` VARCHAR(50) NOT NULL DEFAULT 'Individual',
    `filing_date` DATE NULL,
    `meeting_341_date` DATETIME(3) NULL,
    `confirmation_date` DATE NULL,
    `discharge_date` DATE NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Pre-Filing',
    `household_size` INTEGER NULL DEFAULT 1,
    `monthly_gross_income` DECIMAL(12, 2) NULL,
    `means_test_status` VARCHAR(100) NULL,
    `total_secured_debt` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `total_unsecured_debt` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `total_priority_debt` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `total_assets` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bankruptcy_cases_matter_id_key`(`matter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bankruptcy_creditors` (
    `id` VARCHAR(36) NOT NULL,
    `bankruptcy_case_id` VARCHAR(36) NOT NULL,
    `creditor_name` VARCHAR(200) NOT NULL,
    `claim_type` VARCHAR(50) NOT NULL,
    `account_number` VARCHAR(100) NULL,
    `claim_amount` DECIMAL(12, 2) NOT NULL,
    `collateral_description` VARCHAR(255) NULL,
    `collateral_value` DECIMAL(12, 2) NULL,
    `address` VARCHAR(255) NULL,
    `city` VARCHAR(100) NULL,
    `state` VARCHAR(10) NULL,
    `zip` VARCHAR(20) NULL,
    `is_notice_only` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_creditors_bk_case`(`bankruptcy_case_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bankruptcy_schedules` (
    `id` VARCHAR(36) NOT NULL,
    `bankruptcy_case_id` VARCHAR(36) NOT NULL,
    `schedule_code` VARCHAR(10) NOT NULL,
    `description` TEXT NOT NULL,
    `value_amount` DECIMAL(12, 2) NOT NULL,
    `exempt_amount` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `statutory_exemption_law` VARCHAR(150) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_schedules_bk_case`(`bankruptcy_case_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `immigration_cases` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `visa_category` VARCHAR(100) NULL,
    `alien_registration_num` VARCHAR(50) NULL,
    `uscis_online_account_num` VARCHAR(50) NULL,
    `beneficiary_name` VARCHAR(200) NULL,
    `beneficiary_dob` DATE NULL,
    `country_of_citizenship` VARCHAR(100) NULL,
    `country_of_birth` VARCHAR(100) NULL,
    `current_immigration_status` VARCHAR(100) NULL,
    `class_of_admission` VARCHAR(50) NULL,
    `i94_number` VARCHAR(50) NULL,
    `priority_date` DATE NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Preparation',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `immigration_cases_matter_id_key`(`matter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `uscis_receipts` (
    `id` VARCHAR(36) NOT NULL,
    `immigration_case_id` VARCHAR(36) NOT NULL,
    `receipt_number` VARCHAR(50) NOT NULL,
    `form_type` VARCHAR(50) NOT NULL,
    `filing_date` DATE NOT NULL,
    `notice_date` DATE NULL,
    `service_center` VARCHAR(100) NULL,
    `current_status` VARCHAR(150) NOT NULL DEFAULT 'Case Was Received',
    `biometrics_date` DATETIME(3) NULL,
    `rfe_due_date` DATE NULL,
    `interview_date` DATETIME(3) NULL,
    `decision_date` DATE NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uscis_receipts_receipt_number_key`(`receipt_number`),
    INDEX `idx_receipts_imm_case`(`immigration_case_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `immigration_parties` (
    `id` VARCHAR(36) NOT NULL,
    `immigration_case_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `relationship_role` VARCHAR(100) NOT NULL,
    `citizenship` VARCHAR(100) NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(150) NULL,
    `address` VARCHAR(255) NULL,
    `is_signer` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_parties_imm_case`(`immigration_case_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `probate_cases` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `decedent_name` VARCHAR(200) NOT NULL,
    `date_of_death` DATE NOT NULL,
    `county_jurisdiction` VARCHAR(100) NULL DEFAULT 'Salt Lake County',
    `court_case_number` VARCHAR(100) NULL,
    `probate_type` VARCHAR(100) NOT NULL DEFAULT 'Informal Probate',
    `has_will` BOOLEAN NOT NULL DEFAULT true,
    `personal_rep_name` VARCHAR(200) NULL,
    `personal_rep_role` VARCHAR(100) NULL DEFAULT 'Executor',
    `inventory_value` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Opened',
    `notice_deadline` DATE NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `probate_cases_matter_id_key`(`matter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `probate_beneficiaries` (
    `id` VARCHAR(36) NOT NULL,
    `probate_case_id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `relationship` VARCHAR(100) NOT NULL,
    `share_percent` DECIMAL(5, 2) NULL,
    `specific_gift` TEXT NULL,
    `is_notice_sent` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_beneficiaries_probate`(`probate_case_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `probate_assets` (
    `id` VARCHAR(36) NOT NULL,
    `probate_case_id` VARCHAR(36) NOT NULL,
    `asset_type` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `estimated_value` DECIMAL(12, 2) NOT NULL,
    `appraisal_value` DECIMAL(12, 2) NULL,
    `is_disposed` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_assets_probate`(`probate_case_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `family_law_cases` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `case_type` VARCHAR(100) NOT NULL,
    `court_docket_number` VARCHAR(100) NULL,
    `marriage_date` DATE NULL,
    `separation_date` DATE NULL,
    `has_minor_children` BOOLEAN NOT NULL DEFAULT false,
    `custody_arrangement` VARCHAR(150) NULL,
    `monthly_child_support` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `monthly_alimony` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Filing Pending',
    `mediation_date` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `family_law_cases_matter_id_key`(`matter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `family_law_orders` (
    `id` VARCHAR(36) NOT NULL,
    `family_law_case_id` VARCHAR(36) NOT NULL,
    `order_title` VARCHAR(200) NOT NULL,
    `order_type` VARCHAR(100) NOT NULL,
    `entry_date` DATE NULL,
    `effective_date` DATE NULL,
    `signed_by_judge` VARCHAR(150) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Active',
    `summary_terms` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_orders_family_law`(`family_law_case_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `criminal_cases` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `defendant_name` VARCHAR(200) NOT NULL,
    `court_jurisdiction` VARCHAR(150) NULL,
    `case_docket_number` VARCHAR(100) NULL,
    `presiding_judge` VARCHAR(150) NULL,
    `prosecuting_agency` VARCHAR(150) NULL,
    `bail_amount` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `custody_status` VARCHAR(50) NOT NULL DEFAULT 'Released on Bail',
    `arraignment_date` DATETIME(3) NULL,
    `preliminary_hearing_date` DATETIME(3) NULL,
    `trial_date` DATETIME(3) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Arraignment Scheduled',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `criminal_cases_matter_id_key`(`matter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `criminal_charges` (
    `id` VARCHAR(36) NOT NULL,
    `criminal_case_id` VARCHAR(36) NOT NULL,
    `count_number` INTEGER NOT NULL,
    `statute_code` VARCHAR(100) NOT NULL,
    `charge_title` VARCHAR(255) NOT NULL,
    `severity_class` VARCHAR(50) NOT NULL,
    `plea` VARCHAR(50) NULL DEFAULT 'Not Guilty',
    `disposition` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_charges_criminal`(`criminal_case_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `appeals_cases` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `appellate_court` VARCHAR(150) NOT NULL DEFAULT 'Utah Court of Appeals',
    `appellate_docket_number` VARCHAR(100) NULL,
    `lower_court_name` VARCHAR(150) NULL,
    `lower_court_docket_number` VARCHAR(100) NULL,
    `notice_of_appeal_date` DATE NULL,
    `record_due_deadline` DATE NULL,
    `opening_brief_deadline` DATE NULL,
    `reply_brief_deadline` DATE NULL,
    `oral_argument_date` DATETIME(3) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Notice Filed',
    `appellant_role` VARCHAR(50) NOT NULL DEFAULT 'Appellant',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `appeals_cases_matter_id_key`(`matter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evictions_cases` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `property_address` VARCHAR(255) NOT NULL,
    `unit_number` VARCHAR(50) NULL,
    `tenant_name` VARCHAR(200) NOT NULL,
    `landlord_name` VARCHAR(200) NOT NULL,
    `lease_start_date` DATE NULL,
    `monthly_rent` DECIMAL(10, 2) NOT NULL,
    `outstanding_balance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `notice_type` VARCHAR(100) NULL,
    `notice_served_date` DATE NULL,
    `summons_issued_date` DATE NULL,
    `occupancy_hearing_date` DATETIME(3) NULL,
    `writ_of_restitution_date` DATE NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Notice Phase',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `evictions_cases_matter_id_key`(`matter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `communications` ADD CONSTRAINT `communications_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `communications` ADD CONSTRAINT `communications_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `litigation_cases` ADD CONSTRAINT `litigation_cases_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `court_hearings` ADD CONSTRAINT `court_hearings_litigation_case_id_fkey` FOREIGN KEY (`litigation_case_id`) REFERENCES `litigation_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `discovery_requests` ADD CONSTRAINT `discovery_requests_litigation_case_id_fkey` FOREIGN KEY (`litigation_case_id`) REFERENCES `litigation_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pleadings_records` ADD CONSTRAINT `pleadings_records_litigation_case_id_fkey` FOREIGN KEY (`litigation_case_id`) REFERENCES `litigation_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trial_notebook_items` ADD CONSTRAINT `trial_notebook_items_litigation_case_id_fkey` FOREIGN KEY (`litigation_case_id`) REFERENCES `litigation_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bankruptcy_cases` ADD CONSTRAINT `bankruptcy_cases_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bankruptcy_creditors` ADD CONSTRAINT `bankruptcy_creditors_bankruptcy_case_id_fkey` FOREIGN KEY (`bankruptcy_case_id`) REFERENCES `bankruptcy_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bankruptcy_schedules` ADD CONSTRAINT `bankruptcy_schedules_bankruptcy_case_id_fkey` FOREIGN KEY (`bankruptcy_case_id`) REFERENCES `bankruptcy_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `immigration_cases` ADD CONSTRAINT `immigration_cases_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `uscis_receipts` ADD CONSTRAINT `uscis_receipts_immigration_case_id_fkey` FOREIGN KEY (`immigration_case_id`) REFERENCES `immigration_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `immigration_parties` ADD CONSTRAINT `immigration_parties_immigration_case_id_fkey` FOREIGN KEY (`immigration_case_id`) REFERENCES `immigration_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `probate_cases` ADD CONSTRAINT `probate_cases_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `probate_beneficiaries` ADD CONSTRAINT `probate_beneficiaries_probate_case_id_fkey` FOREIGN KEY (`probate_case_id`) REFERENCES `probate_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `probate_assets` ADD CONSTRAINT `probate_assets_probate_case_id_fkey` FOREIGN KEY (`probate_case_id`) REFERENCES `probate_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `family_law_cases` ADD CONSTRAINT `family_law_cases_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `family_law_orders` ADD CONSTRAINT `family_law_orders_family_law_case_id_fkey` FOREIGN KEY (`family_law_case_id`) REFERENCES `family_law_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `criminal_cases` ADD CONSTRAINT `criminal_cases_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `criminal_charges` ADD CONSTRAINT `criminal_charges_criminal_case_id_fkey` FOREIGN KEY (`criminal_case_id`) REFERENCES `criminal_cases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `appeals_cases` ADD CONSTRAINT `appeals_cases_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evictions_cases` ADD CONSTRAINT `evictions_cases_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;