-- CreateTable
CREATE TABLE IF NOT EXISTS `matter_overview_panels` (
  `id` VARCHAR(36) NOT NULL,
  `matter_id` VARCHAR(36) NOT NULL,
  `panels_data` LONGTEXT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `matter_overview_panels_matter_id_key` (`matter_id`),
  CONSTRAINT `matter_overview_panels_matter_id_fkey`
    FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE IF NOT EXISTS `related_parties` (
  `id` VARCHAR(36) NOT NULL,
  `matter_id` VARCHAR(36) NULL,
  `client_id` VARCHAR(36) NULL,
  `intake_id` VARCHAR(36) NULL,
  `name` VARCHAR(255) NOT NULL,
  `aliases` TEXT NULL,
  `role_id` VARCHAR(50) NOT NULL,
  `role_label` VARCHAR(100) NOT NULL,
  `firm_name` VARCHAR(255) NULL,
  `contact_person` VARCHAR(255) NULL,
  `email` VARCHAR(255) NULL,
  `phone` VARCHAR(50) NULL,
  `address` TEXT NULL,
  `service_type` VARCHAR(150) NULL,
  `notes` TEXT NULL,
  `created_by_user_id` VARCHAR(36) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `idx_related_parties_matter` (`matter_id`),
  INDEX `idx_related_parties_client` (`client_id`),
  INDEX `idx_related_parties_intake` (`intake_id`),
  INDEX `idx_related_parties_name` (`name`),
  CONSTRAINT `related_parties_matter_id_fkey`
    FOREIGN KEY (`matter_id`) REFERENCES `matters` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `related_parties_client_id_fkey`
    FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `related_parties_intake_id_fkey`
    FOREIGN KEY (`intake_id`) REFERENCES `intakes` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
