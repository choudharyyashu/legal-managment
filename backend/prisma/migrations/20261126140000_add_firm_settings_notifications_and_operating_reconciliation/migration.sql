-- CreateTable
CREATE TABLE IF NOT EXISTS `firm_settings` (
    `id` VARCHAR(36) NOT NULL DEFAULT 'default',
    `firm_name` VARCHAR(150) NOT NULL DEFAULT 'LegalPro Law Firm',
    `tagline` VARCHAR(200) NULL,
    `primary_phone` VARCHAR(50) NULL,
    `primary_email` VARCHAR(255) NULL,
    `address` VARCHAR(300) NULL,
    `logo_url` TEXT NULL,
    `primary_color` VARCHAR(20) NOT NULL DEFAULT '#06244B',
    `secondary_color` VARCHAR(20) NOT NULL DEFAULT '#F5F0E5',
    `accent_color` VARCHAR(20) NOT NULL DEFAULT '#A4432B',
    `updated_by_user_id` VARCHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    CONSTRAINT `firm_settings_updated_by_user_id_fkey` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `user_notification_preferences` (
    `id` VARCHAR(36) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL,
    `court_deadline_email` BOOLEAN NOT NULL DEFAULT true,
    `court_deadline_sms` BOOLEAN NOT NULL DEFAULT true,
    `court_deadline_lead_time` VARCHAR(10) NOT NULL DEFAULT '48',
    `time_approval_alerts` BOOLEAN NOT NULL DEFAULT true,
    `conflict_check_notices` BOOLEAN NOT NULL DEFAULT true,
    `daily_digest_email` BOOLEAN NOT NULL DEFAULT false,
    `client_message_notification` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_notification_preferences_user_id_key`(`user_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `user_notification_preferences_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `operating_bank_reconciliations` (
    `id` VARCHAR(36) NOT NULL,
    `account_number` INTEGER NOT NULL DEFAULT 1010,
    `statement_date` DATE NOT NULL,
    `statement_opening_balance` DECIMAL(14, 2) NULL,
    `statement_ending_balance` DECIMAL(14, 2) NULL,
    `gl_book_balance` DECIMAL(14, 2) NOT NULL,
    `cleared_deposits_total` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `cleared_checks_total` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `cleared_transaction_ids` JSON NOT NULL,
    `deposits_in_transit` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `outstanding_checks` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `outstanding_transaction_ids` JSON NOT NULL,
    `book_adjustments` DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    `book_adjustments_detail` JSON NULL,
    `adjusted_bank_balance` DECIMAL(14, 2) NULL,
    `reconciliation_variance` DECIMAL(14, 2) NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'Draft',
    `is_locked` BOOLEAN NOT NULL DEFAULT false,
    `prepared_by_user_id` VARCHAR(36) NOT NULL,
    `certified_by_user_id` VARCHAR(36) NULL,
    `certified_at` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX `idx_operating_recon_status`(`status`),
    UNIQUE INDEX `operating_bank_reconciliations_account_number_statement_date_key`(`account_number`, `statement_date`),
    PRIMARY KEY (`id`),
    CONSTRAINT `operating_bank_reconciliations_account_number_fkey` FOREIGN KEY (`account_number`) REFERENCES `chart_of_accounts`(`account_number`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `operating_bank_reconciliations_prepared_by_user_id_fkey` FOREIGN KEY (`prepared_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `operating_bank_reconciliations_certified_by_user_id_fkey` FOREIGN KEY (`certified_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
