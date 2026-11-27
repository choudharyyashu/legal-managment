import fs from 'fs';
import path from 'path';
import { prisma } from '../../../config/database.js';
import { AppError } from '../../../errors/AppError.js';
import { DraftEngine } from '../drafts/draft.engine.js';
import { DraftService } from '../drafts/draft.service.js';
import { StorageService } from '../storage/storage.service.js';
import { AuthenticatedUser } from '../../auth/auth.types.js';
import { AutoDraftService } from '../events/auto-draft.service.js';
import { MatterService } from '../../matters/matter.service.js';
import { createAuditLog } from '../../../utils/auditLogger.js';

export interface CatalogAutomationItem {
  catalogId: string;
  number: number;
  templateCode: string;
  title: string;
  trigger: string;
  fields: string;
  practiceArea: string;
  practiceAreaId: string;
  isGlobal: boolean;
  category: string;
  sharedEngineFeatures: string[];
  specificFeatureLinks: string[];
  recipe: {
    qualifying_event?: string;
    source_fields?: string;
    template?: string;
    output?: string;
    follow_on?: string;
    missing_data?: string;
    version_changes?: string;
  };
  proposedAcceptance?: Record<string, any>;
}

interface CatalogDataset {
  total: number;
  items: CatalogAutomationItem[];
}

const PRACTICE_AREA_DEFAULTS: Array<{ id: string; code: string; name: string; brandColor: string }> = [
  { id: 'pa-pi', code: 'PI', name: 'Personal Injury', brandColor: '#ea580c' },
  { id: 'pa-bk', code: 'BK', name: 'Bankruptcy', brandColor: '#0284c7' },
  { id: 'pa-imm', code: 'IMM', name: 'Immigration', brandColor: '#059669' },
  { id: 'pa-civ', code: 'CIV', name: 'Civil/Commercial Litigation', brandColor: '#2563eb' },
  { id: 'pa-prob', code: 'PROB', name: 'Probate', brandColor: '#8b5cf6' },
  { id: 'pa-fam', code: 'FAM', name: 'Family Law', brandColor: '#ec4899' },
  { id: 'pa-crim', code: 'CRIM', name: 'Criminal Defense', brandColor: '#ef4444' },
  { id: 'pa-app', code: 'APP', name: 'Appeals', brandColor: '#4f46e5' },
  { id: 'pa-evict', code: 'EVICT', name: 'Landlord-Tenant/Evictions', brandColor: '#d97706' },
];

export class AutomationCatalogService {
  private static cachedCatalog: CatalogDataset | null = null;

  static loadCatalog(): CatalogDataset {
    if (this.cachedCatalog) return this.cachedCatalog;

    const candidates = [
      path.resolve(process.cwd(), 'src', 'modules', 'documents', 'catalog', 'document-automation-catalog.json'),
      path.resolve(process.cwd(), 'dist', 'modules', 'documents', 'catalog', 'document-automation-catalog.json'),
      path.resolve(process.cwd(), 'backend', 'src', 'modules', 'documents', 'catalog', 'document-automation-catalog.json'),
      path.resolve(process.cwd(), 'backend', 'dist', 'modules', 'documents', 'catalog', 'document-automation-catalog.json'),
    ];

    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        this.cachedCatalog = JSON.parse(raw) as CatalogDataset;
        return this.cachedCatalog;
      }
    }

    throw AppError.internal('300-document automation catalog dataset not found.', 'CATALOG_DATA_MISSING');
  }

  /**
   * Infers structured field mappings from a catalog item's comma-separated fields description.
   */
  static inferFieldMappings(item: CatalogAutomationItem): Array<{
    placeholderTag: string;
    sourceEntity: string;
    sourceField: string;
    isRequired: boolean;
    formattingRule: string;
  }> {
    const mappings: Array<{
      placeholderTag: string;
      sourceEntity: string;
      sourceField: string;
      isRequired: boolean;
      formattingRule: string;
    }> = [
      { placeholderTag: '{{Client.Name}}', sourceEntity: 'Client', sourceField: 'name', isRequired: true, formattingRule: 'NONE' },
      { placeholderTag: '{{Matter.MatterNumber}}', sourceEntity: 'Matter', sourceField: 'matterNumber', isRequired: true, formattingRule: 'NONE' },
      { placeholderTag: '{{Matter.Title}}', sourceEntity: 'Matter', sourceField: 'title', isRequired: true, formattingRule: 'NONE' },
      { placeholderTag: '{{Attorney.Name}}', sourceEntity: 'ResponsibleAttorney', sourceField: 'name', isRequired: true, formattingRule: 'NONE' },
    ];

    const seen = new Set(mappings.map((m) => m.placeholderTag.toLowerCase()));
    const rawTokens = (item.fields || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const addMapping = (
      placeholderTag: string,
      sourceEntity: string,
      sourceField: string,
      isRequired = false,
      formattingRule = 'NONE'
    ) => {
      if (!seen.has(placeholderTag.toLowerCase())) {
        seen.add(placeholderTag.toLowerCase());
        mappings.push({ placeholderTag, sourceEntity, sourceField, isRequired, formattingRule });
      }
    };

    for (const token of rawTokens) {
      const lower = token.toLowerCase();
      if (lower.includes('court') || lower.includes('caption') || lower.includes('venue')) {
        addMapping('{{Court.Name}}', 'Court', 'name', false);
      }
      if (lower.includes('docket') || lower.includes('case number')) {
        addMapping('{{Matter.CaseDocketNumber}}', 'Matter', 'caseDocketNumber', false);
      }
      if (lower.includes('judge')) {
        addMapping('{{Court.Judge}}', 'Court', 'judge', false);
      }
      if (lower.includes('adjuster')) {
        addMapping('{{Insurance.AdjusterName}}', 'Insurance', 'adjusterName', false);
      }
      if (lower.includes('carrier') || lower.includes('insurer') || lower.includes('policy')) {
        addMapping('{{Insurance.CarrierName}}', 'Insurance', 'insuranceCompany', false);
      }
      if (lower.includes('claim')) {
        addMapping('{{Insurance.ClaimNumber}}', 'Insurance', 'claimNumber', false);
      }
      if (lower.includes('provider') || lower.includes('medical')) {
        addMapping('{{MedicalProvider.Name}}', 'MedicalProvider', 'name', false);
      }
      if (lower.includes('incident') || lower.includes('accident')) {
        addMapping('{{Incident.AccidentDate}}', 'Incident', 'accidentDate', false, 'DATE_LONG');
      }
      if (lower.includes('demand') || lower.includes('settlement')) {
        addMapping('{{Demand.DemandedAmount}}', 'Demand', 'demandedAmount', false, 'CURRENCY_USD');
      }
      if (lower.includes('date') || lower.includes('deadline')) {
        addMapping('{{CurrentDate.Long}}', 'CurrentDate', 'long', false);
      }
    }

    return mappings;
  }

  static buildCatalogTemplateDocx(item: CatalogAutomationItem): Buffer {
    const mappings = this.inferFieldMappings(item);

    const practiceConditionalBlock: string[] = [];
    if (item.practiceAreaId === 'pa-pi') {
      practiceConditionalBlock.push(
        'INCIDENT & INSURANCE DETAILS:',
        'Incident Date: {{Incident.AccidentDate}} | Location: {{Incident.IncidentLocation}}',
        'Carrier: {{Insurance.CarrierName}} | Claim No.: {{Insurance.ClaimNumber}} | Adjuster: {{Insurance.AdjusterName}}',
        '{{#hasProviders}}TREATING PROVIDERS:',
        '{{#providers}}- {{providerName}} ({{facilityAddress}}){{/providers}}{{/hasProviders}}'
      );
    } else if (item.practiceAreaId === 'pa-bk') {
      practiceConditionalBlock.push(
        'BANKRUPTCY CASE DETAILS:',
        'Chapter: {{Bankruptcy.Chapter}} | District: {{Bankruptcy.CourtDistrict}} | Case No.: {{Bankruptcy.CaseNumber}}',
        '{{#hasCreditors}}SCHEDULED CREDITORS:',
        '{{#creditors}}- {{creditorName}} ({{claimType}}): {{claimAmount}}{{/creditors}}{{/hasCreditors}}'
      );
    } else if (item.practiceAreaId === 'pa-imm') {
      practiceConditionalBlock.push(
        'IMMIGRATION FILING DETAILS:',
        'Visa Category: {{Immigration.VisaCategory}} | Beneficiary: {{Immigration.BeneficiaryName}} | A-Number: {{Immigration.AlienRegistrationNum}}',
        '{{#hasParties}}LINKED PARTICIPANTS:',
        '{{#parties}}- {{name}} ({{relationshipRole}}){{/parties}}{{/hasParties}}'
      );
    } else if (item.practiceAreaId === 'pa-civ') {
      practiceConditionalBlock.push(
        '{{#hasCourt}}COURT CAPTION: {{Court.Name}} | Docket: {{Court.CaseDocketNumber}} | Judge: {{Court.Judge}}{{/hasCourt}}',
        '{{#hasHearings}}SCHEDULED HEARINGS:',
        '{{#hearings}}- {{hearingType}} on {{hearingDate}}{{/hearings}}{{/hasHearings}}'
      );
    }

    const bodyLines = [
      `HEUGLY & BLUDWORTH, ATTORNEYS AT LAW — ${item.practiceArea.toUpperCase()}`,
      `Catalog Automation: ${item.catalogId} | Trigger: ${item.trigger}`,
      '',
      'MATTER & CLIENT CAPTION:',
      'Client: {{Client.Name}} | Matter: {{Matter.Title}} ({{Matter.MatterNumber}})',
      'Responsible Counsel: {{Attorney.Name}}',
      '',
      'INSTRUMENT PURPOSE & OUTPUT:',
      item.recipe?.output || `${item.title} generated automatically from verified matter records.`,
      '',
      ...practiceConditionalBlock,
      '',
      'CAPTURED CASE & FIELD BINDINGS:',
      ...mappings.map((m) => `- ${m.placeholderTag.replace(/^\{\{|\}\}$/g, '')}: ${m.placeholderTag}`),
      '',
      '{{#isContingency}}FEE BASIS: Contingency Fee Arrangement pursuant to signed engagement terms.{{/isContingency}}',
      '{{#isHourly}}FEE BASIS: Standard Hourly Representation pursuant to signed engagement terms.{{/isHourly}}',
      '',
      `Configured Source Fields: ${item.fields}`,
      `Follow-On Workflow: ${item.recipe?.follow_on || 'Matter-linked record, attorney review task, and exception tracking.'}`,
      '',
      'Prepared by: {{Attorney.Name}} | {{Firm.Name}}',
      'Date: {{CurrentDate.Long}}',
    ];

    return DraftEngine.buildDocxFromText(item.title, bodyLines.join('\n'));
  }

  /**
   * Generates all 300 catalog DOCX template files on disk under storage/templates/CAT-001..CAT-300.
   */
  static async generateAllTemplateFilesOnDisk(): Promise<{ totalFiles: number; totalBytes: number }> {
    const catalog = this.loadCatalog();
    let totalBytes = 0;
    for (const item of catalog.items) {
      const docxBuffer = this.buildCatalogTemplateDocx(item);
      const fileName = `template_${item.templateCode}_v1.0.docx`;
      const stored = await StorageService.writeFile(`templates/${item.templateCode}/${fileName}`, docxBuffer);
      totalBytes += stored.fileSizeBytes;
    }
    return { totalFiles: catalog.items.length, totalBytes };
  }

  static async listAutomations(query: {
    practiceAreaId?: string;
    practiceArea?: string;
    trigger?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const catalog = this.loadCatalog();
    let filtered = catalog.items;

    if (query.practiceAreaId) {
      filtered = filtered.filter(
        (i) => i.practiceAreaId === query.practiceAreaId || (i.isGlobal && query.practiceAreaId === 'ALL')
      );
    }
    if (query.practiceArea) {
      const paLower = query.practiceArea.toLowerCase();
      filtered = filtered.filter((i) => i.practiceArea.toLowerCase().includes(paLower));
    }
    if (query.trigger) {
      const tLower = query.trigger.toLowerCase();
      filtered = filtered.filter((i) => i.trigger.toLowerCase().includes(tLower));
    }
    if (query.search) {
      const s = query.search.toLowerCase().trim();
      filtered = filtered.filter(
        (i) =>
          i.catalogId.toLowerCase().includes(s) ||
          i.templateCode.toLowerCase().includes(s) ||
          i.title.toLowerCase().includes(s) ||
          i.trigger.toLowerCase().includes(s) ||
          i.fields.toLowerCase().includes(s) ||
          i.practiceArea.toLowerCase().includes(s)
      );
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(300, Math.max(1, Number(query.limit) || 50));
    const offset = (page - 1) * limit;
    const paged = filtered.slice(offset, offset + limit);

    // Check which catalog codes already have materialized DocumentTemplate rows
    let materializedCodes = new Set<string>();
    try {
      const existing = await prisma.documentTemplate.findMany({
        select: { templateCode: true },
      });
      materializedCodes = new Set(existing.map((e) => e.templateCode));
    } catch {
      // Safe fallback if DB is offline during read-only inspection
    }

    return {
      totalCatalogCount: catalog.total,
      filteredCount: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit) || 1,
      items: paged.map((item) => ({
        ...item,
        isMaterialized: materializedCodes.has(item.templateCode) || materializedCodes.has(item.catalogId),
      })),
    };
  }

  static getSummary() {
    const catalog = this.loadCatalog();
    const byPracticeArea: Record<string, { practiceArea: string; practiceAreaId: string; count: number }> = {};
    const triggerSet = new Set<string>();

    for (const item of catalog.items) {
      if (!byPracticeArea[item.practiceArea]) {
        byPracticeArea[item.practiceArea] = {
          practiceArea: item.practiceArea,
          practiceAreaId: item.practiceAreaId,
          count: 0,
        };
      }
      byPracticeArea[item.practiceArea].count += 1;
      triggerSet.add(item.trigger);
    }

    return {
      totalAutomations: catalog.total,
      uniqueTriggersCount: triggerSet.size,
      practiceAreas: Object.values(byPracticeArea),
      triggers: Array.from(triggerSet).sort(),
    };
  }

  static async getAutomationById(idOrCode: string) {
    const catalog = this.loadCatalog();
    const normalized = idOrCode.trim().toUpperCase();
    const item = catalog.items.find(
      (i) =>
        i.catalogId.toUpperCase() === normalized ||
        i.templateCode.toUpperCase() === normalized ||
        String(i.number) === idOrCode.trim()
    );
    if (!item) {
      throw AppError.notFound(`Catalog automation '${idOrCode}' not found.`, 'AUTOMATION_NOT_FOUND');
    }

    let dbTemplate: any = null;
    try {
      dbTemplate = await prisma.documentTemplate.findFirst({
        where: { OR: [{ templateCode: item.templateCode }, { templateCode: item.catalogId }] },
        include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } },
      });
    } catch {
      // ignore if DB not connected
    }

    return {
      ...item,
      inferredMappings: this.inferFieldMappings(item),
      isMaterialized: Boolean(dbTemplate),
      templateId: dbTemplate?.id || null,
    };
  }

  /**
   * Ensures a catalog item exists in DocumentTemplate + TemplateVersion + DocumentFieldMapping.
   * Idempotent: never duplicates existing templates or overwrites custom versions.
   */
  static async ensureTemplateMaterialized(
    item: CatalogAutomationItem,
    userId: string
  ): Promise<{ templateId: string; templateCode: string; created: boolean }> {
    const existing = await prisma.documentTemplate.findFirst({
      where: {
        OR: [{ templateCode: item.templateCode }, { templateCode: item.catalogId }],
      },
      include: { versions: { take: 1 } },
    });

    if (existing && existing.versions.length > 0) {
      return { templateId: existing.id, templateCode: existing.templateCode, created: false };
    }

    // Ensure PracticeArea row exists
    const paDef = PRACTICE_AREA_DEFAULTS.find((p) => p.id === item.practiceAreaId) || PRACTICE_AREA_DEFAULTS[3];
    await prisma.practiceArea.upsert({
      where: { id: paDef.id },
      update: {},
      create: {
        id: paDef.id,
        code: paDef.code,
        name: paDef.name,
        brandColor: paDef.brandColor,
        isActive: true,
      },
    });

    const docxBuffer = this.buildCatalogTemplateDocx(item);
    const fileName = `template_${item.templateCode}_v1.0.docx`;
    const stored = await StorageService.writeFile(`templates/${item.templateCode}/${fileName}`, docxBuffer);
    const mappings = this.inferFieldMappings(item);

    if (existing) {
      await prisma.templateVersion.create({
        data: {
          templateId: existing.id,
          versionNumber: 'v1.0',
          docxStorageKey: stored.storageKey,
          sha256Checksum: stored.sha256Checksum,
          status: 'Published',
          changeSummary: `Materialized from 300-document catalog (${item.catalogId}).`,
          createdById: userId,
          fieldMappings: {
            create: mappings.map((m) => ({
              placeholderTag: m.placeholderTag,
              sourceEntity: m.sourceEntity,
              sourceField: m.sourceField,
              isRequired: m.isRequired,
              formattingRule: m.formattingRule,
            })),
          },
        },
      });
      return { templateId: existing.id, templateCode: existing.templateCode, created: false };
    }

    const createdTemplate = await prisma.documentTemplate.create({
      data: {
        templateCode: item.templateCode,
        templateName: `${item.title} (${item.catalogId})`,
        description: `Trigger: ${item.trigger} | Fields: ${item.fields}`,
        practiceAreaId: paDef.id,
        category: item.category,
        outputFormat: 'BOTH',
        currentVersion: 'v1.0',
        isActive: true,
        isSystemDefault: item.isGlobal,
        createdById: userId,
        versions: {
          create: {
            versionNumber: 'v1.0',
            docxStorageKey: stored.storageKey,
            sha256Checksum: stored.sha256Checksum,
            status: 'Published',
            changeSummary: `Initial catalog template release (${item.catalogId}).`,
            createdById: userId,
            fieldMappings: {
              create: mappings.map((m) => ({
                placeholderTag: m.placeholderTag,
                sourceEntity: m.sourceEntity,
                sourceField: m.sourceField,
                isRequired: m.isRequired,
                formattingRule: m.formattingRule,
              })),
            },
          },
        },
      },
    });

    return { templateId: createdTemplate.id, templateCode: createdTemplate.templateCode, created: true };
  }

  /**
   * Batch-materializes all 300 catalog items (or a filtered subset) into the template registry.
   */
  static async materializeCatalog(
    userId: string,
    options?: { practiceAreaId?: string; limit?: number }
  ): Promise<{ totalProcessed: number; createdCount: number; existingCount: number }> {
    const catalog = this.loadCatalog();
    let targets = catalog.items;
    if (options?.practiceAreaId) {
      targets = targets.filter((i) => i.practiceAreaId === options.practiceAreaId);
    }
    if (options?.limit && options.limit > 0) {
      targets = targets.slice(0, options.limit);
    }

    let createdCount = 0;
    let existingCount = 0;

    for (const item of targets) {
      const res = await this.ensureTemplateMaterialized(item, userId);
      if (res.created) createdCount++;
      else existingCount++;
    }

    return {
      totalProcessed: targets.length,
      createdCount,
      existingCount,
    };
  }

  /**
   * Triggers any of the 300 catalog automations on a target matter:
   * auto-materializes template -> creates idempotent DOCX draft -> creates review task.
   */
  static async triggerAutomation(
    idOrCode: string,
    matterId: string,
    currentUser: AuthenticatedUser,
    customOverrides: Record<string, any> = {},
    context: { ipAddress?: string; userAgent?: string } = {}
  ) {
    const catalog = this.loadCatalog();
    const normalized = idOrCode.trim().toUpperCase();
    const item = catalog.items.find(
      (i) =>
        i.catalogId.toUpperCase() === normalized ||
        i.templateCode.toUpperCase() === normalized ||
        String(i.number) === idOrCode.trim()
    );

    if (!item) {
      throw AppError.notFound(`Catalog automation '${idOrCode}' not found.`, 'AUTOMATION_NOT_FOUND');
    }

    // Enforce ethical wall & canonical matter ID resolution (prevents cross-matter leaks)
    const authorizedMatter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);
    const canonicalMatterId = authorizedMatter.id;

    const mat = await this.ensureTemplateMaterialized(item, currentUser.id);

    // Idempotency check: reuse existing active draft for same matter + template if already generated
    const existingDraft = await prisma.documentDraft.findFirst({
      where: {
        matterId: canonicalMatterId,
        templateId: mat.templateId,
        status: { in: ['Draft', 'Under Review'] },
      },
    });

    if (existingDraft) {
      const existingFull = await DraftService.getDraftById(existingDraft.id, currentUser);
      return {
        automation: item,
        draft: existingFull,
        isDuplicate: true,
        reviewTask: null,
      };
    }

    const draft = await DraftService.generateDraft(
      {
        matterId: canonicalMatterId,
        templateId: mat.templateId,
        title: `${item.title} (${item.catalogId})`,
        allowIncomplete: true,
        customOverrides,
      },
      currentUser,
      context
    );

    const matter = await prisma.matter.findUnique({ where: { id: draft.matterId } });
    const reviewTaskResult = matter
      ? await AutoDraftService.createDraftReviewTask(matter, draft, item.title, currentUser, context)
      : null;

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'CATALOG_AUTOMATION_TRIGGERED',
      resourceType: 'DOCUMENT_DRAFT',
      resourceId: draft.id,
      details: {
        catalogId: item.catalogId,
        templateCode: item.templateCode,
        trigger: item.trigger,
        draftCode: draft.draftCode,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      automation: item,
      draft,
      isDuplicate: false,
      reviewTask: reviewTaskResult?.task || null,
    };
  }
}
