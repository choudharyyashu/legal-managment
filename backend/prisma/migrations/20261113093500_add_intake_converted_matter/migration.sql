-- AlterTable
ALTER TABLE `intakes` ADD COLUMN `converted_matter_id` VARCHAR(36) NULL;

-- AddForeignKey
ALTER TABLE `intakes` ADD CONSTRAINT `intakes_converted_matter_id_fkey` FOREIGN KEY (`converted_matter_id`) REFERENCES `matters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
