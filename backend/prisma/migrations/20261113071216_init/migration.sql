-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL,
    `user_code` VARCHAR(20) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `role` VARCHAR(50) NOT NULL,
    `title` VARCHAR(100) NULL,
    `initials` VARCHAR(10) NOT NULL,
    `department` VARCHAR(100) NULL,
    `billing_rate` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Active',
    `mfa_enabled` BOOLEAN NOT NULL DEFAULT false,
    `mfa_secret` VARCHAR(255) NULL,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_user_code_key`(`user_code`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `id` VARCHAR(36) NOT NULL,
    `role_id` VARCHAR(50) NOT NULL,
    `permission_key` VARCHAR(100) NOT NULL,
    `granted_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `role_permissions_role_id_permission_key_key`(`role_id`, `permission_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clients` (
    `id` VARCHAR(36) NOT NULL,
    `client_number` VARCHAR(50) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `client_type` VARCHAR(50) NOT NULL,
    `primary_contact` VARCHAR(255) NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `address` TEXT NULL,
    `assigned_attorney_id` VARCHAR(36) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Active',
    `notes` TEXT NULL,
    `portal_access_enabled` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `clients_client_number_key`(`client_number`),
    INDEX `idx_clients_search`(`name`, `email`, `client_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `intakes` (
    `id` VARCHAR(36) NOT NULL,
    `intake_number` VARCHAR(50) NOT NULL,
    `prospective_client` VARCHAR(255) NOT NULL,
    `contact_person` VARCHAR(255) NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `practice_area_id` VARCHAR(50) NULL,
    `adverse_parties` TEXT NOT NULL,
    `matter_summary` TEXT NOT NULL,
    `dispute_amount` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `jurisdiction_venue` VARCHAR(255) NULL,
    `conflict_status` VARCHAR(50) NOT NULL DEFAULT 'Not Started',
    `reviewed_by_user_id` VARCHAR(36) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `conflict_notes` TEXT NULL,
    `converted_to_client` BOOLEAN NOT NULL DEFAULT false,
    `converted_client_id` VARCHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `intakes_intake_number_key`(`intake_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conflict_search_logs` (
    `id` VARCHAR(36) NOT NULL,
    `intake_id` VARCHAR(36) NOT NULL,
    `queried_name` VARCHAR(255) NOT NULL,
    `matched_entity_type` VARCHAR(50) NOT NULL,
    `matched_record_id` VARCHAR(100) NOT NULL,
    `searched_by_user_id` VARCHAR(36) NOT NULL,
    `searched_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `practice_areas` (
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `brand_color` VARCHAR(20) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `practice_areas_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matters` (
    `id` VARCHAR(36) NOT NULL,
    `matter_number` VARCHAR(50) NOT NULL,
    `client_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `practice_area_id` VARCHAR(50) NOT NULL,
    `current_stage_id` VARCHAR(50) NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Active',
    `responsible_attorney_id` VARCHAR(36) NOT NULL,
    `billing_type` VARCHAR(50) NOT NULL,
    `hourly_rate` DECIMAL(10, 2) NULL,
    `flat_fee_amount` DECIMAL(12, 2) NULL,
    `contingency_percentage` DECIMAL(5, 2) NULL,
    `budget` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `open_date` DATE NOT NULL,
    `close_date` DATE NULL,
    `statute_of_limitations` DATE NULL,
    `next_court_date` DATETIME(3) NULL,
    `court_name` VARCHAR(255) NULL,
    `judge` VARCHAR(150) NULL,
    `case_docket_number` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `matters_matter_number_key`(`matter_number`),
    INDEX `idx_matters_client`(`client_id`),
    INDEX `idx_matters_attorney`(`responsible_attorney_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matter_staff_assignments` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `assignment_role` VARCHAR(50) NOT NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `matter_staff_assignments_matter_id_user_id_key`(`matter_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workflow_stages` (
    `id` VARCHAR(50) NOT NULL,
    `practice_area_id` VARCHAR(50) NOT NULL,
    `stage_name` VARCHAR(150) NOT NULL,
    `stage_code` VARCHAR(20) NOT NULL,
    `stage_order` INTEGER NOT NULL,
    `required_fields` JSON NOT NULL,
    `auto_tasks` JSON NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matter_stage_histories` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `from_stage_id` VARCHAR(50) NULL,
    `to_stage_id` VARCHAR(50) NOT NULL,
    `transitioned_by_user_id` VARCHAR(36) NOT NULL,
    `verified_gatekeepers` JSON NOT NULL,
    `transitioned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks` (
    `id` VARCHAR(36) NOT NULL,
    `task_code` VARCHAR(50) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `assigned_to_user_id` VARCHAR(36) NOT NULL,
    `created_by_user_id` VARCHAR(36) NOT NULL,
    `due_date` DATE NOT NULL,
    `priority` VARCHAR(20) NOT NULL DEFAULT 'Medium',
    `status` VARCHAR(30) NOT NULL DEFAULT 'Not Started',
    `completed_at` DATETIME(3) NULL,
    `reminder_setting` VARCHAR(50) NULL DEFAULT '1 day prior',
    `urcp_rule_reference` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tasks_task_code_key`(`task_code`),
    INDEX `idx_tasks_assigned_due`(`assigned_to_user_id`, `due_date`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calendar_events` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NULL,
    `title` VARCHAR(255) NOT NULL,
    `event_type` VARCHAR(50) NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `location` VARCHAR(255) NULL,
    `judge` VARCHAR(150) NULL,
    `is_court_appearance` BOOLEAN NOT NULL DEFAULT false,
    `created_by_user_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `time_entries` (
    `id` VARCHAR(36) NOT NULL,
    `entry_code` VARCHAR(50) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `date` DATE NOT NULL,
    `hours` DECIMAL(5, 2) NOT NULL,
    `rate` DECIMAL(10, 2) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `activity_type` VARCHAR(100) NOT NULL,
    `activity_code` VARCHAR(50) NULL,
    `description` TEXT NOT NULL,
    `is_billable` BOOLEAN NOT NULL DEFAULT true,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Submitted',
    `approved_by_user_id` VARCHAR(36) NULL,
    `approved_at` DATETIME(3) NULL,
    `rejection_comment` TEXT NULL,
    `exported_to_cosmolex` BOOLEAN NOT NULL DEFAULT false,
    `export_batch_id` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `time_entries_entry_code_key`(`entry_code`),
    INDEX `idx_time_matter_status`(`matter_id`, `status`),
    INDEX `idx_time_user_date`(`user_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suggested_billing_captures` (
    `id` VARCHAR(36) NOT NULL,
    `source_type` VARCHAR(50) NOT NULL,
    `source_identifier` VARCHAR(255) NOT NULL,
    `matter_id` VARCHAR(36) NULL,
    `date` DATE NOT NULL,
    `actual_duration_seconds` INTEGER NOT NULL,
    `suggested_hours` DECIMAL(4, 2) NOT NULL,
    `match_confidence` INTEGER NOT NULL,
    `activity_description` TEXT NOT NULL,
    `detected_rate` DECIMAL(10, 2) NULL,
    `is_converted` BOOLEAN NOT NULL DEFAULT false,
    `converted_time_entry_id` VARCHAR(36) NULL,
    `is_dismissed` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `suggested_billing_captures_source_identifier_key`(`source_identifier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expenses` (
    `id` VARCHAR(36) NOT NULL,
    `expense_code` VARCHAR(50) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `incurred_by_user_id` VARCHAR(36) NOT NULL,
    `date` DATE NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `vendor_name` VARCHAR(255) NULL,
    `receipt_document_id` VARCHAR(36) NULL,
    `is_billable` BOOLEAN NOT NULL DEFAULT true,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Unbilled',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `expenses_expense_code_key`(`expense_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` VARCHAR(36) NOT NULL,
    `invoice_number` VARCHAR(50) NOT NULL,
    `client_id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `issue_date` DATE NOT NULL,
    `due_date` DATE NOT NULL,
    `total_amount` DECIMAL(12, 2) NOT NULL,
    `paid_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `balance_due` DECIMAL(12, 2) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Draft',
    `sent_at` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `invoices_invoice_number_key`(`invoice_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoice_line_items` (
    `id` VARCHAR(36) NOT NULL,
    `invoice_id` VARCHAR(36) NOT NULL,
    `item_type` VARCHAR(20) NOT NULL,
    `time_entry_id` VARCHAR(36) NULL,
    `expense_id` VARCHAR(36) NULL,
    `description` TEXT NOT NULL,
    `quantity` DECIMAL(5, 2) NOT NULL,
    `unit_rate` DECIMAL(10, 2) NOT NULL,
    `total_price` DECIMAL(12, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_records` (
    `id` VARCHAR(36) NOT NULL,
    `payment_reference` VARCHAR(50) NOT NULL,
    `invoice_id` VARCHAR(36) NOT NULL,
    `client_id` VARCHAR(36) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `destination_account` VARCHAR(50) NOT NULL,
    `transaction_reference` VARCHAR(100) NULL,
    `received_date` DATE NOT NULL,
    `recorded_by_user_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `payment_records_payment_reference_key`(`payment_reference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trust_sub_ledgers` (
    `id` VARCHAR(36) NOT NULL,
    `ledger_code` VARCHAR(50) NOT NULL,
    `client_id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `balance` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `last_audit_date` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `trust_sub_ledgers_ledger_code_key`(`ledger_code`),
    UNIQUE INDEX `trust_sub_ledgers_matter_id_key`(`matter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trust_transactions` (
    `id` VARCHAR(36) NOT NULL,
    `trust_sub_ledger_id` VARCHAR(36) NOT NULL,
    `transaction_type` VARCHAR(50) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `running_balance` DECIMAL(12, 2) NOT NULL,
    `source_reference` VARCHAR(100) NOT NULL,
    `authorized_by_user_id` VARCHAR(36) NOT NULL,
    `purpose` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chart_of_accounts` (
    `account_number` INTEGER NOT NULL,
    `account_name` VARCHAR(100) NOT NULL,
    `account_type` VARCHAR(50) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`account_number`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `general_ledger_journals` (
    `id` VARCHAR(36) NOT NULL,
    `journal_number` VARCHAR(50) NOT NULL,
    `transaction_date` DATE NOT NULL,
    `memo` TEXT NOT NULL,
    `created_by_user_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `general_ledger_journals_journal_number_key`(`journal_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `general_ledger_entries` (
    `id` VARCHAR(36) NOT NULL,
    `journal_id` VARCHAR(36) NOT NULL,
    `account_number` INTEGER NOT NULL,
    `debit` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `credit` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `matter_id` VARCHAR(36) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `three_way_reconciliations` (
    `id` VARCHAR(36) NOT NULL,
    `reconciliation_month` VARCHAR(7) NOT NULL,
    `bank_statement_balance` DECIMAL(12, 2) NOT NULL,
    `deposits_in_transit` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `outstanding_checks` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `adjusted_bank_balance` DECIMAL(12, 2) NOT NULL,
    `gl_trust_liability_balance` DECIMAL(12, 2) NOT NULL,
    `client_subledgers_total_balance` DECIMAL(12, 2) NOT NULL,
    `reconciliation_variance` DECIMAL(12, 2) NOT NULL,
    `is_balanced` BOOLEAN NOT NULL,
    `audited_by_user_id` VARCHAR(36) NOT NULL,
    `audit_certificate_pdf_url` TEXT NULL,
    `reconciled_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `three_way_reconciliations_reconciliation_month_key`(`reconciliation_month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents` (
    `id` VARCHAR(36) NOT NULL,
    `document_code` VARCHAR(50) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `client_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `current_version` VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    `is_privileged` BOOLEAN NOT NULL DEFAULT false,
    `privilege_type` VARCHAR(100) NULL,
    `ocr_content` LONGTEXT NULL,
    `bates_number_start` VARCHAR(50) NULL,
    `bates_number_end` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `documents_document_code_key`(`document_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_versions` (
    `id` VARCHAR(36) NOT NULL,
    `document_id` VARCHAR(36) NOT NULL,
    `version_label` VARCHAR(20) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_type` VARCHAR(50) NOT NULL,
    `file_size_bytes` BIGINT NOT NULL,
    `s3_storage_key` VARCHAR(500) NOT NULL,
    `sha256_checksum` VARCHAR(64) NOT NULL,
    `uploaded_by_user_id` VARCHAR(36) NOT NULL,
    `revision_notes` TEXT NULL,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `document_versions_document_id_version_label_key`(`document_id`, `version_label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NULL,
    `user_name` VARCHAR(255) NOT NULL,
    `user_role` VARCHAR(50) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `resource_type` VARCHAR(50) NOT NULL,
    `resource_id` VARCHAR(100) NULL,
    `details` JSON NOT NULL,
    `ip_address` VARCHAR(50) NULL,
    `user_agent` TEXT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_audit_timestamp`(`timestamp`),
    INDEX `idx_audit_resource`(`resource_type`, `resource_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_fkey` FOREIGN KEY (`role`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `clients` ADD CONSTRAINT `clients_assigned_attorney_id_fkey` FOREIGN KEY (`assigned_attorney_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `intakes` ADD CONSTRAINT `intakes_practice_area_id_fkey` FOREIGN KEY (`practice_area_id`) REFERENCES `practice_areas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `intakes` ADD CONSTRAINT `intakes_reviewed_by_user_id_fkey` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `intakes` ADD CONSTRAINT `intakes_converted_client_id_fkey` FOREIGN KEY (`converted_client_id`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conflict_search_logs` ADD CONSTRAINT `conflict_search_logs_intake_id_fkey` FOREIGN KEY (`intake_id`) REFERENCES `intakes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conflict_search_logs` ADD CONSTRAINT `conflict_search_logs_searched_by_user_id_fkey` FOREIGN KEY (`searched_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matters` ADD CONSTRAINT `matters_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matters` ADD CONSTRAINT `matters_practice_area_id_fkey` FOREIGN KEY (`practice_area_id`) REFERENCES `practice_areas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matters` ADD CONSTRAINT `matters_responsible_attorney_id_fkey` FOREIGN KEY (`responsible_attorney_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matters` ADD CONSTRAINT `matters_current_stage_id_fkey` FOREIGN KEY (`current_stage_id`) REFERENCES `workflow_stages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matter_staff_assignments` ADD CONSTRAINT `matter_staff_assignments_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matter_staff_assignments` ADD CONSTRAINT `matter_staff_assignments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `workflow_stages` ADD CONSTRAINT `workflow_stages_practice_area_id_fkey` FOREIGN KEY (`practice_area_id`) REFERENCES `practice_areas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matter_stage_histories` ADD CONSTRAINT `matter_stage_histories_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matter_stage_histories` ADD CONSTRAINT `matter_stage_histories_to_stage_id_fkey` FOREIGN KEY (`to_stage_id`) REFERENCES `workflow_stages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matter_stage_histories` ADD CONSTRAINT `matter_stage_histories_transitioned_by_user_id_fkey` FOREIGN KEY (`transitioned_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_assigned_to_user_id_fkey` FOREIGN KEY (`assigned_to_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `time_entries` ADD CONSTRAINT `time_entries_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `time_entries` ADD CONSTRAINT `time_entries_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `time_entries` ADD CONSTRAINT `time_entries_approved_by_user_id_fkey` FOREIGN KEY (`approved_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `suggested_billing_captures` ADD CONSTRAINT `suggested_billing_captures_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `suggested_billing_captures` ADD CONSTRAINT `suggested_billing_captures_converted_time_entry_id_fkey` FOREIGN KEY (`converted_time_entry_id`) REFERENCES `time_entries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `expenses` ADD CONSTRAINT `expenses_incurred_by_user_id_fkey` FOREIGN KEY (`incurred_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_line_items` ADD CONSTRAINT `invoice_line_items_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_line_items` ADD CONSTRAINT `invoice_line_items_time_entry_id_fkey` FOREIGN KEY (`time_entry_id`) REFERENCES `time_entries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice_line_items` ADD CONSTRAINT `invoice_line_items_expense_id_fkey` FOREIGN KEY (`expense_id`) REFERENCES `expenses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_records` ADD CONSTRAINT `payment_records_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_records` ADD CONSTRAINT `payment_records_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_records` ADD CONSTRAINT `payment_records_recorded_by_user_id_fkey` FOREIGN KEY (`recorded_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trust_sub_ledgers` ADD CONSTRAINT `trust_sub_ledgers_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trust_sub_ledgers` ADD CONSTRAINT `trust_sub_ledgers_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trust_transactions` ADD CONSTRAINT `trust_transactions_trust_sub_ledger_id_fkey` FOREIGN KEY (`trust_sub_ledger_id`) REFERENCES `trust_sub_ledgers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trust_transactions` ADD CONSTRAINT `trust_transactions_authorized_by_user_id_fkey` FOREIGN KEY (`authorized_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `general_ledger_journals` ADD CONSTRAINT `general_ledger_journals_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `general_ledger_entries` ADD CONSTRAINT `general_ledger_entries_journal_id_fkey` FOREIGN KEY (`journal_id`) REFERENCES `general_ledger_journals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `general_ledger_entries` ADD CONSTRAINT `general_ledger_entries_account_number_fkey` FOREIGN KEY (`account_number`) REFERENCES `chart_of_accounts`(`account_number`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `general_ledger_entries` ADD CONSTRAINT `general_ledger_entries_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `three_way_reconciliations` ADD CONSTRAINT `three_way_reconciliations_audited_by_user_id_fkey` FOREIGN KEY (`audited_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_versions` ADD CONSTRAINT `document_versions_document_id_fkey` FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_versions` ADD CONSTRAINT `document_versions_uploaded_by_user_id_fkey` FOREIGN KEY (`uploaded_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
