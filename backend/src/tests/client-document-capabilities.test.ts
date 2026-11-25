import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import assert from 'assert';
import { DraftEngine } from '../modules/documents/drafts/draft.engine.js';
import { DraftDataResolver, FIELD_DICTIONARY } from '../modules/documents/drafts/draft.data-resolver.js';
import { AutomationCatalogService } from '../modules/documents/catalog/automation-catalog.service.js';
import { OcrService } from '../modules/documents/ocr/ocr.service.js';
import { StorageService } from '../modules/documents/storage/storage.service.js';
import { createFieldMappingSchema } from '../modules/templates/template.validation.js';
import { updateDocumentSchema } from '../modules/documents/document.validation.js';
import { rejectDraftSchema, sendDraftSchema } from '../modules/documents/drafts/draft.validation.js';

async function runTests() {
  console.log('=== Client-Document 10 Capabilities Verification ===\n');

  // 1. 300 Document Automations Catalog + Unique Template Codes + 300 DOCX Files on Disk
  const catalog = AutomationCatalogService.loadCatalog();
  assert.strictEqual(catalog.total, 300, `Expected 300 catalog items, got ${catalog.total}`);
  assert.strictEqual(catalog.items.length, 300, 'Expected 300 rows in catalog.items');
  const uniqueCodes = new Set(catalog.items.map((i) => i.templateCode));
  assert.strictEqual(uniqueCodes.size, 300, 'All 300 catalog items must have unique templateCodes');

  const summary = AutomationCatalogService.getSummary();
  assert.strictEqual(summary.totalAutomations, 300, 'Summary totalAutomations must be 300');
  assert(summary.practiceAreas.length === 10, `Expected 10 practice area buckets, got ${summary.practiceAreas.length}`);

  const diskGen = await AutomationCatalogService.generateAllTemplateFilesOnDisk();
  assert.strictEqual(diskGen.totalFiles, 300, 'Must generate all 300 DOCX template files on disk');
  const sampleCatFile = path.resolve(StorageService.getStorageRoot(), 'templates', 'CAT-001', 'template_CAT-001_v1.0.docx');
  const lastCatFile = path.resolve(StorageService.getStorageRoot(), 'templates', 'CAT-300', 'template_CAT-300_v1.0.docx');
  assert(fsSync.existsSync(sampleCatFile) && fsSync.existsSync(lastCatFile), 'CAT-001 and CAT-300 DOCX files must exist on disk');
  console.log(`PASS [300 Document Automations]: Verified 300 unique templates on disk (${diskGen.totalBytes} bytes) across ${summary.practiceAreas.length} categories (${summary.uniqueTriggersCount} triggers).`);

  // 2. Document Generation Engine + XML Escaping (F-0105) + Structural Conditionals & Repeating Loops (F-0103) + Word & PDF Generation
  const sampleTemplateText = [
    'IN THE THIRD JUDICIAL DISTRICT COURT',
    'Client: {{Client.Name}}',
    'Matter: {{Matter.Title}} ({{Matter.MatterNumber}})',
    'Litigation Stage: {{Litigation.LitigationStage}}',
    'Bankruptcy Chapter: {{Bankruptcy.Chapter}}',
    'Damages Demand: {{Demand.DemandedAmount}}',
    '{{#hasProviders}}Providers:',
    '{{#providers}}- {{providerName}} ({{facilityAddress}}){{/providers}}{{/hasProviders}}',
    '{{#isContingency}}Fee Arrangement: Contingency Fee{{/isContingency}}',
    'Prepared by {{Attorney.Name}} on {{CurrentDate.Long}}',
  ].join('\n');

  const rawTemplateDocx = DraftEngine.buildDocxFromText('Test Legal Motion', sampleTemplateText);
  const placeholders = DraftEngine.extractPlaceholdersFromDocx(rawTemplateDocx);
  assert(placeholders.includes('{{Client.Name}}'), 'Placeholder {{Client.Name}} must be detected');
  assert(placeholders.includes('{{Litigation.LitigationStage}}'), 'Placeholder {{Litigation.LitigationStage}} must be detected');

  // Test F-0105 (XML-sensitive characters &, <, >) and F-0103 (0, 1, 3 repeating providers)
  for (const providerCount of [0, 1, 3]) {
    const providers = Array.from({ length: providerCount }, (_, i) => ({
      providerName: `Provider #${i + 1} & Associates <Salt Lake>`,
      facilityAddress: `${100 + i} Main St`,
    }));

    const mockMatter = {
      id: `m-test-${providerCount}`,
      matterNumber: 'MAT-2026-0999',
      title: 'Vance & Sons v. Apex <Freight>',
      billingType: 'Contingency',
      courtName: 'Third District Court',
      judge: 'Hon. Coral Del-Valle',
      caseDocketNumber: '260901234',
      client: { id: 'c-1', name: 'Eleanor Vance & Co.', email: 'eleanor@example.com', phone: '8015550199' },
      responsibleAttorney: { id: 'u-1', name: 'Thomas Bludworth, Esq.' },
      practiceArea: { id: 'pa-civ', code: 'CIV', name: 'Civil/Commercial Litigation' },
      litigationCase: { litigationStage: 'Discovery', courtJurisdiction: 'Utah' },
      bankruptcyCase: { chapter: 'Chapter 7' },
      medicalProviders: providers,
      demandPackages: [{ demandedAmount: 125000 }],
    };

    const resolved = DraftDataResolver.resolve(mockMatter, {
      fieldMappings: [
        { placeholderTag: '{{Client.Name}}', sourceEntity: 'Client', sourceField: 'name', isRequired: true, formattingRule: 'UPPERCASE' },
        { placeholderTag: '{{Matter.Title}}', sourceEntity: 'Matter', sourceField: 'title', isRequired: true },
        { placeholderTag: '{{Matter.MatterNumber}}', sourceEntity: 'Matter', sourceField: 'matterNumber', isRequired: true },
        { placeholderTag: '{{Litigation.LitigationStage}}', sourceEntity: 'Litigation', sourceField: 'litigationStage', isRequired: true },
        { placeholderTag: '{{Bankruptcy.Chapter}}', sourceEntity: 'Bankruptcy', sourceField: 'chapter', isRequired: false },
        { placeholderTag: '{{Demand.DemandedAmount}}', sourceEntity: 'Demand', sourceField: 'demandedAmount', isRequired: true, formattingRule: 'CURRENCY_USD' },
        { placeholderTag: '{{Attorney.Name}}', sourceEntity: 'ResponsibleAttorney', sourceField: 'name', isRequired: true },
        { placeholderTag: '{{CurrentDate.Long}}', sourceEntity: 'CurrentDate', sourceField: 'long', isRequired: false },
      ],
    });

    assert.strictEqual(resolved.isValid, true, 'All required fields should resolve cleanly');
    assert.strictEqual(resolved.resolvedData['Client.Name'], 'ELEANOR VANCE & CO.');
    assert.strictEqual(resolved.resolvedData['Demand.DemandedAmount'], '$125,000.00');
    assert.strictEqual(resolved.resolvedData['hasProviders'], providerCount > 0);

    const populatedDocx = DraftEngine.generateDocx(rawTemplateDocx, resolved.resolvedData);
    const extracted = await OcrService.extract(populatedDocx, 'motion.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    assert(extracted.text.includes('ELEANOR VANCE & CO.'), 'XML-escaped ampersand must roundtrip cleanly');
    assert(extracted.text.includes('Vance & Sons v. Apex <Freight>'), 'XML-escaped angle brackets must roundtrip cleanly');
    if (providerCount > 0) {
      assert(extracted.text.includes(`Provider #${providerCount} & Associates <Salt Lake>`), 'Repeating providers must render');
    } else {
      assert(!extracted.text.includes('Providers:'), 'Conditional hasProviders section must omit when empty');
    }
  }

  // Generate final Word & PDF pair for verification
  const finalResolved = DraftDataResolver.resolve(
    {
      id: 'm-final',
      matterNumber: 'MAT-2026-0999',
      title: 'Vance v. Apex Freight',
      billingType: 'Contingency',
      client: { name: 'Eleanor Vance' },
      responsibleAttorney: { name: 'Thomas Bludworth, Esq.' },
      litigationCase: { litigationStage: 'Discovery' },
      bankruptcyCase: { chapter: 'Chapter 7' },
      medicalProviders: [{ providerName: 'Intermountain Medical', facilityAddress: 'Murray, UT' }],
      demandPackages: [{ demandedAmount: 125000 }],
    },
    {
      fieldMappings: [
        { placeholderTag: '{{Client.Name}}', sourceEntity: 'Client', sourceField: 'name', isRequired: true, formattingRule: 'UPPERCASE' },
        { placeholderTag: '{{Matter.Title}}', sourceEntity: 'Matter', sourceField: 'title', isRequired: true },
        { placeholderTag: '{{Matter.MatterNumber}}', sourceEntity: 'Matter', sourceField: 'matterNumber', isRequired: true },
        { placeholderTag: '{{Litigation.LitigationStage}}', sourceEntity: 'Litigation', sourceField: 'litigationStage', isRequired: true },
        { placeholderTag: '{{Bankruptcy.Chapter}}', sourceEntity: 'Bankruptcy', sourceField: 'chapter', isRequired: false },
        { placeholderTag: '{{Demand.DemandedAmount}}', sourceEntity: 'Demand', sourceField: 'demandedAmount', isRequired: true, formattingRule: 'CURRENCY_USD' },
        { placeholderTag: '{{Attorney.Name}}', sourceEntity: 'ResponsibleAttorney', sourceField: 'name', isRequired: true },
        { placeholderTag: '{{CurrentDate.Long}}', sourceEntity: 'CurrentDate', sourceField: 'long', isRequired: false },
      ],
    }
  );
  const populatedDocx = DraftEngine.generateDocx(rawTemplateDocx, finalResolved.resolvedData);
  const pdfBuffer = await DraftEngine.convertDocxToPdf(populatedDocx, 'TEST-DRAFT', {
    title: 'Test Legal Motion',
    draftCode: 'DFT-26-TEST',
    matterNumber: 'MAT-2026-0999',
    clientName: 'Eleanor Vance',
  });
  assert(pdfBuffer.subarray(0, 5).toString('ascii') === '%PDF-', 'PDF output must have valid %PDF- header');
  assert(pdfBuffer.length > 1000, 'Generated PDF must be non-trivial');
  console.log(`PASS [Word & PDF Generation + Engine (F-0103, F-0105)]: DOCX=${populatedDocx.length} bytes, PDF=${pdfBuffer.length} bytes.`);

  // 3. OCR & Structured Extraction (DOCX + PDF + TXT)
  const docxOcr = await OcrService.extract(populatedDocx, 'motion.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  assert(docxOcr.text.includes('ELEANOR VANCE'), 'DOCX OCR must extract populated client name');
  assert(docxOcr.extractedFields.monetaryAmounts.includes('$125,000.00'), 'Entity extraction must capture $125,000.00');

  const pdfOcr = await OcrService.extract(pdfBuffer, 'motion.pdf', 'application/pdf');
  assert(pdfOcr.method === 'PDF_TEXT', 'PDF extraction must use PDF_TEXT');
  assert(pdfOcr.text.includes('ELEANOR VANCE'), `PDF OCR must extract populated text, got: ${pdfOcr.text.slice(0, 120)}`);
  console.log(`PASS [OCR & Extraction]: DOCX words=${docxOcr.wordCount}, PDF words=${pdfOcr.wordCount}, extracted amounts=${docxOcr.extractedFields.monetaryAmounts.join(', ')}.`);

  // 4. Unified Document Storage & SHA-256 Verification
  const tempKey = `vault/test-suite/TEST-DOC/v1.0_motion.pdf`;
  const written = await StorageService.writeFile(tempKey, pdfBuffer);
  const integrity = await StorageService.verifyIntegrity(written.storageKey, written.sha256Checksum);
  assert(integrity.exists && integrity.verified, 'Storage integrity verification must pass');
  const stats = await StorageService.getStorageStats();
  assert(stats.totalFiles >= 300 && stats.totalBytes >= pdfBuffer.length, 'Storage stats must report 300+ stored files');
  await fs.rm(path.resolve(StorageService.getStorageRoot(), 'vault', 'test-suite'), { recursive: true, force: true });
  console.log(`PASS [Document Storage]: Verified write/read/SHA-256 check (${stats.totalFiles} files in unified storage).`);

  // 5. Field Mapping, Editable Display Metadata (F-0700) & Draft Approval Validation Schemas
  assert(FIELD_DICTIONARY.length >= 18, 'Field dictionary must expose all practice area entities');
  const mappingParsed = createFieldMappingSchema.parse({
    placeholderTag: '{{Litigation.TrialDate}}',
    sourceEntity: 'Litigation',
    sourceField: 'trialDate',
    isRequired: false,
    formattingRule: 'DATE_LONG',
  });
  assert.strictEqual(mappingParsed.sourceEntity, 'Litigation');

  const renameParsed = updateDocumentSchema.parse({ title: 'Renamed Display Title', isPrivileged: true });
  assert.strictEqual(renameParsed.title, 'Renamed Display Title');

  const rejectParsed = rejectDraftSchema.parse({ reason: 'Missing adjuster claim number' });
  assert.strictEqual(rejectParsed.rejectionReason, 'Missing adjuster claim number');

  const sendParsed = sendDraftSchema.parse({
    recipient: { name: 'State Farm', email: 'claims@statefarm.com' },
    channel: 'EMAIL',
  });
  assert.strictEqual(sendParsed.channel, 'EMAIL');
  console.log('PASS [Field Mapping, Editable Metadata & Draft Approval Schemas]: All validation schemas passed.');

  console.log('\nALL 10 CLIENT-DOCUMENT CAPABILITY CHECKS PASSED.');
}

runTests().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
