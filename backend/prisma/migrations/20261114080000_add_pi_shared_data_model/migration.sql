-- CreateTable
CREATE TABLE `pi_incidents` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `incident_date` DATE NULL,
    `incident_time` VARCHAR(20) NULL,
    `incident_location` VARCHAR(255) NULL,
    `accident_type` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `police_agency` VARCHAR(150) NULL,
    `report_number` VARCHAR(100) NULL,
    `investigating_officer` VARCHAR(150) NULL,
    `liability_assessment` VARCHAR(50) NULL,
    `plaintiff_fault_percentage` DECIMAL(5, 2) NULL,
    `adverse_fault_percentage` DECIMAL(5, 2) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_incidents_matter`(`matter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pi_insurance_policies` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `incident_id` VARCHAR(36) NULL,
    `coverage_type` VARCHAR(50) NOT NULL,
    `insurance_company` VARCHAR(200) NOT NULL,
    `policy_number` VARCHAR(100) NULL,
    `claim_number` VARCHAR(100) NULL,
    `adjuster_name` VARCHAR(150) NULL,
    `adjuster_phone` VARCHAR(50) NULL,
    `adjuster_email` VARCHAR(150) NULL,
    `adjuster_fax` VARCHAR(50) NULL,
    `insured_name` VARCHAR(150) NULL,
    `policy_limits` VARCHAR(100) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_policies_matter`(`matter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pi_medical_providers` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `provider_name` VARCHAR(200) NOT NULL,
    `provider_type` VARCHAR(100) NULL,
    `facility_address` VARCHAR(255) NULL,
    `phone` VARCHAR(50) NULL,
    `fax` VARCHAR(50) NULL,
    `email` VARCHAR(150) NULL,
    `treatment_start_date` DATE NULL,
    `treatment_end_date` DATE NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_providers_matter`(`matter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pi_medical_record_requests` (
    `id` VARCHAR(36) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `provider_id` VARCHAR(36) NOT NULL,
    `request_code` VARCHAR(50) NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Drafted',
    `authorization_signed` BOOLEAN NOT NULL DEFAULT false,
    `authorization_date` DATE NULL,
    `authorization_document_id` VARCHAR(36) NULL,
    `request_document_id` VARCHAR(36) NULL,
    `request_sent_date` DATE NULL,
    `request_due_date` DATE NULL,
    `records_received_date` DATE NULL,
    `is_complete` BOOLEAN NOT NULL DEFAULT false,
    `deficiency_notes` TEXT NULL,
    `follow_up_document_id` VARCHAR(36) NULL,
    `follow_up_sent_date` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pi_medical_record_requests_request_code_key`(`request_code`),
    INDEX `idx_record_requests_matter`(`matter_id`),
    INDEX `idx_record_requests_provider`(`provider_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pi_incidents` ADD CONSTRAINT `pi_incidents_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_insurance_policies` ADD CONSTRAINT `pi_insurance_policies_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_insurance_policies` ADD CONSTRAINT `pi_insurance_policies_incident_id_fkey` FOREIGN KEY (`incident_id`) REFERENCES `pi_incidents`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_medical_providers` ADD CONSTRAINT `pi_medical_providers_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_medical_record_requests` ADD CONSTRAINT `pi_medical_record_requests_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pi_medical_record_requests` ADD CONSTRAINT `pi_medical_record_requests_provider_id_fkey` FOREIGN KEY (`provider_id`) REFERENCES `pi_medical_providers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
