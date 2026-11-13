-- CreateTable
CREATE TABLE `document_templates` (
    `id` VARCHAR(36) NOT NULL,
    `template_code` VARCHAR(50) NOT NULL,
    `template_name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `practice_area_id` VARCHAR(50) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `output_format` VARCHAR(20) NOT NULL DEFAULT 'DOCX',
    `current_version` VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_system_default` BOOLEAN NOT NULL DEFAULT false,
    `created_by_user_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `document_templates_template_code_key`(`template_code`),
    INDEX `idx_doc_templates_search`(`practice_area_id`, `category`, `is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `template_versions` (
    `id` VARCHAR(36) NOT NULL,
    `template_id` VARCHAR(36) NOT NULL,
    `version_number` VARCHAR(20) NOT NULL,
    `docx_storage_key` VARCHAR(500) NOT NULL,
    `sha256_checksum` VARCHAR(64) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Draft',
    `change_summary` TEXT NULL,
    `created_by_user_id` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `template_versions_template_id_version_number_key`(`template_id`, `version_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_field_mappings` (
    `id` VARCHAR(36) NOT NULL,
    `template_version_id` VARCHAR(36) NOT NULL,
    `placeholder_tag` VARCHAR(150) NOT NULL,
    `source_entity` VARCHAR(50) NOT NULL,
    `source_field` VARCHAR(100) NOT NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT true,
    `default_value` VARCHAR(255) NULL,
    `formatting_rule` VARCHAR(50) NULL,
    `conditional_expression` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_field_mappings_version`(`template_version_id`),
    UNIQUE INDEX `document_field_mappings_template_version_id_placeholder_tag_key`(`template_version_id`, `placeholder_tag`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_drafts` (
    `id` VARCHAR(36) NOT NULL,
    `draft_code` VARCHAR(50) NOT NULL,
    `matter_id` VARCHAR(36) NOT NULL,
    `client_id` VARCHAR(36) NOT NULL,
    `template_id` VARCHAR(36) NOT NULL,
    `template_version_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Draft',
    `docx_storage_key` VARCHAR(500) NULL,
    `pdf_storage_key` VARCHAR(500) NULL,
    `missing_fields_flags` JSON NOT NULL,
    `generated_by_user_id` VARCHAR(36) NOT NULL,
    `reviewed_by_user_id` VARCHAR(36) NULL,
    `reviewed_at` DATETIME(3) NULL,
    `has_manual_edits` BOOLEAN NOT NULL DEFAULT false,
    `is_stale` BOOLEAN NOT NULL DEFAULT false,
    `final_document_id` VARCHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `document_drafts_draft_code_key`(`draft_code`),
    INDEX `idx_doc_drafts_matter`(`matter_id`, `status`),
    INDEX `idx_doc_drafts_client`(`client_id`),
    INDEX `idx_doc_drafts_stale`(`is_stale`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `document_templates` ADD CONSTRAINT `document_templates_practice_area_id_fkey` FOREIGN KEY (`practice_area_id`) REFERENCES `practice_areas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_templates` ADD CONSTRAINT `document_templates_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_versions` ADD CONSTRAINT `template_versions_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `document_templates`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `template_versions` ADD CONSTRAINT `template_versions_created_by_user_id_fkey` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_field_mappings` ADD CONSTRAINT `document_field_mappings_template_version_id_fkey` FOREIGN KEY (`template_version_id`) REFERENCES `template_versions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_drafts` ADD CONSTRAINT `document_drafts_matter_id_fkey` FOREIGN KEY (`matter_id`) REFERENCES `matters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_drafts` ADD CONSTRAINT `document_drafts_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_drafts` ADD CONSTRAINT `document_drafts_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `document_templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_drafts` ADD CONSTRAINT `document_drafts_template_version_id_fkey` FOREIGN KEY (`template_version_id`) REFERENCES `template_versions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_drafts` ADD CONSTRAINT `document_drafts_generated_by_user_id_fkey` FOREIGN KEY (`generated_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_drafts` ADD CONSTRAINT `document_drafts_reviewed_by_user_id_fkey` FOREIGN KEY (`reviewed_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_drafts` ADD CONSTRAINT `document_drafts_final_document_id_fkey` FOREIGN KEY (`final_document_id`) REFERENCES `documents`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
