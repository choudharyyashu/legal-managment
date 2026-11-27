/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Master Catalog Template Seeder & Dry-Run Validator
 *
 * Scans all 300 catalog items in document-automation-catalog.json,
 * validates corresponding physical DOCX templates in storage/templates/CAT-xxx/,
 * and idempotently registers them into DocumentTemplate and TemplateVersion models.
 *
 * Usage:
 *   npx tsx src/scripts/seed-catalog-templates.ts --dry-run
 *   npx tsx src/scripts/seed-catalog-templates.ts
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import PizZip from 'pizzip';
import dotenv from 'dotenv';

// Load backend environment variables
const envPath = fs.existsSync(path.resolve(process.cwd(), 'backend/.env'))
  ? path.resolve(process.cwd(), 'backend/.env')
  : path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

import { prisma } from '../config/database.js';

interface CatalogItem {
  catalogId: string;
  number: number;
  templateCode: string;
  title: string;
  trigger: string;
  fields: string;
  practiceArea: string;
  practiceAreaId: string;
  isGlobal?: boolean;
  category: string;
  recipe?: {
    qualifying_event?: string;
    source_fields?: string;
    template?: string;
    output?: string;
    follow_on?: string;
  };
}

export interface DryRunReport {
  totalCatalogEntries: number;
  validDocxFiles: number;
  missingDocxFiles: string[];
  invalidDocxFiles: string[];
  missingPracticeAreas: string[];
  existingRegisteredTemplates: number;
  proposedNewRegistrations: number;
  proposedNewVersions: number;
}

export async function runCatalogTemplateSeeder(options: { dryRun?: boolean; isolatedDbUrl?: string } = {}) {
  const isDryRun = options.dryRun ?? process.argv.includes('--dry-run');

  console.log('=============================================================================');
  console.log('HEUGLY & BLUDWORTH MASTER DOCUMENT AUTOMATION TEMPLATE SEEDER');
  console.log(`Execution Mode: ${isDryRun ? 'DRY-RUN (Zero Database Writes)' : 'ACTIVE REGISTRATION'}`);
  console.log('=============================================================================\n');

  // 1. Load Catalog
  const catalogPaths = [
    path.resolve(process.cwd(), 'src/modules/documents/catalog/document-automation-catalog.json'),
    path.resolve(process.cwd(), 'backend/src/modules/documents/catalog/document-automation-catalog.json'),
  ];
  let catalogPath = catalogPaths.find((p) => fs.existsSync(p));
  if (!catalogPath) {
    throw new Error('Could not locate document-automation-catalog.json');
  }

  const raw = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const items: CatalogItem[] = raw.automations || raw.items || (Array.isArray(raw) ? raw : Object.values(raw));
  console.log(`[1] Loaded ${items.length} automations from catalog.`);

  // 2. Validate Physical Templates on Disk
  const storageRoots = [
    path.resolve(process.cwd(), 'storage/templates'),
    path.resolve(process.cwd(), 'backend/storage/templates'),
  ];
  const storageRoot = storageRoots.find((p) => fs.existsSync(p));
  if (!storageRoot) {
    throw new Error('Could not locate storage/templates directory.');
  }

  const report: DryRunReport = {
    totalCatalogEntries: items.length,
    validDocxFiles: 0,
    missingDocxFiles: [],
    invalidDocxFiles: [],
    missingPracticeAreas: [],
    existingRegisteredTemplates: 0,
    proposedNewRegistrations: 0,
    proposedNewVersions: 0,
  };

  const validEntries: Array<{
    item: CatalogItem;
    fileName: string;
    relativePath: string;
    sha256: string;
  }> = [];

  for (const item of items) {
    const catFolder = path.join(storageRoot, item.catalogId);
    if (!fs.existsSync(catFolder)) {
      report.missingDocxFiles.push(`${item.catalogId} (directory missing)`);
      continue;
    }

    const files = fs.readdirSync(catFolder).filter((f) => f.endsWith('.docx'));
    if (files.length === 0) {
      report.missingDocxFiles.push(`${item.catalogId} (no .docx file found in directory)`);
      continue;
    }

    const fileName = files[0];
    const fullPath = path.join(catFolder, fileName);
    const buf = fs.readFileSync(fullPath);

    // Validate DOCX structure
    try {
      const zip = new PizZip(buf);
      if (!zip.file('word/document.xml')) {
        report.invalidDocxFiles.push(`${item.catalogId}/${fileName} (missing word/document.xml)`);
        continue;
      }
    } catch (err: any) {
      report.invalidDocxFiles.push(`${item.catalogId}/${fileName} (${err.message})`);
      continue;
    }

    const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
    const relativePath = `storage/templates/${item.catalogId}/${fileName}`;

    report.validDocxFiles++;
    validEntries.push({ item, fileName, relativePath, sha256 });
  }

  console.log(`[2] Physical DOCX verification: ${report.validDocxFiles}/${items.length} files valid.`);
  if (report.missingDocxFiles.length > 0) {
    console.warn(`    ⚠️ Missing templates: ${report.missingDocxFiles.length}`);
  }
  if (report.invalidDocxFiles.length > 0) {
    console.warn(`    ⚠️ Corrupt templates: ${report.invalidDocxFiles.length}`);
  }

  // 3. Query Database State if Accessible
  let existingTemplatesMap = new Map<string, any>();
  let systemUser: any = null;
  let dbAccessible = false;

  try {
    const existing = await prisma.documentTemplate.findMany({
      select: { id: true, templateCode: true, currentVersion: true, isActive: true },
    });
    existing.forEach((t) => existingTemplatesMap.set(t.templateCode, t));
    report.existingRegisteredTemplates = existing.length;

    systemUser = await prisma.user.findFirst({
      where: { role: { in: ['super_admin', 'attorney', 'admin'] } },
      orderBy: { createdAt: 'asc' },
    });

    dbAccessible = true;
    console.log(`[3] Database connection successful. Existing registered templates: ${existing.length}.`);
  } catch (err: any) {
    console.log(`[3] Database query bypassed or offline (${err.message}). Proceeding in static mode.`);
  }

  // 4. Calculate Proposed Actions
  for (const entry of validEntries) {
    const existing = existingTemplatesMap.get(entry.item.catalogId);
    if (!existing) {
      report.proposedNewRegistrations++;
      report.proposedNewVersions++;
    }
  }

  console.log('\n--- DRY-RUN SUMMARY REPORT ---');
  console.log(`Total Catalog Automations:     ${report.totalCatalogEntries}`);
  console.log(`Valid Physical DOCX Files:     ${report.validDocxFiles}`);
  console.log(`Missing DOCX Files:            ${report.missingDocxFiles.length}`);
  console.log(`Invalid DOCX Files:            ${report.invalidDocxFiles.length}`);
  console.log(`Currently Registered in DB:    ${report.existingRegisteredTemplates}`);
  console.log(`Proposed New Registrations:    ${report.proposedNewRegistrations}`);
  console.log(`Proposed New Versions:         ${report.proposedNewVersions}`);

  if (isDryRun || !dbAccessible) {
    console.log('\nDry-run complete. Zero modifications were written to the database.\n');
    return report;
  }

  // 5. Active Registration (Idempotent Transactional Inserts)
  if (!systemUser) {
    throw new Error('Cannot seed templates: No system or admin user found to assign createdById.');
  }

  console.log(`\n[4] Commencing idempotent registration for ${report.proposedNewRegistrations} templates...`);
  let insertedTemplates = 0;
  let insertedVersions = 0;

  for (const entry of validEntries) {
    const existing = existingTemplatesMap.get(entry.item.catalogId);
    if (existing) {
      continue; // Never overwrite existing user-configured templates
    }

    try {
      const created = await prisma.documentTemplate.create({
        data: {
          templateCode: entry.item.catalogId,
          templateName: entry.item.title,
          description: entry.item.trigger ? `Trigger: ${entry.item.trigger}` : undefined,
          practiceAreaId: entry.item.practiceAreaId,
          category: entry.item.category || 'General',
          outputFormat: 'DOCX',
          currentVersion: 'v1.0',
          isActive: true,
          isSystemDefault: entry.item.isGlobal ?? false,
          createdById: systemUser.id,
          versions: {
            create: {
              versionNumber: '1.0',
              docxStorageKey: entry.relativePath,
              sha256Checksum: entry.sha256,
              status: 'Published',
              changeSummary: 'Initial automated catalog import (Master Execution Prompt)',
              createdById: systemUser.id,
            },
          },
        },
      });

      insertedTemplates++;
      insertedVersions++;
    } catch (createErr: any) {
      console.error(`    ❌ Failed to register ${entry.item.catalogId}: ${createErr.message}`);
    }
  }

  console.log(`\n[5] Completed. Successfully registered ${insertedTemplates} new templates and ${insertedVersions} versions.`);
  return report;
}

// Auto-run when executed directly via CLI
if (process.argv[1] && process.argv[1].includes('seed-catalog-templates')) {
  runCatalogTemplateSeeder()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeder execution error:', err);
      process.exit(1);
    });
}
