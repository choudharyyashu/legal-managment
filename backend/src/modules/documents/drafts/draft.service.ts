import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { prisma } from '../../../config/database.js';
import { AppError } from '../../../errors/AppError.js';
import { createAuditLog } from '../../../utils/auditLogger.js';
import { MatterService } from '../../matters/matter.service.js';
import { AuthenticatedUser } from '../../auth/auth.types.js';
import { DraftDataResolver } from './draft.data-resolver.js';
import { DraftEngine } from './draft.engine.js';
import { TaskService } from '../../tasks/task.service.js';
import {
  ValidateDraftInput,
  GenerateDraftInput,
  CreateFollowUpTaskInput,
  DraftQueryInput,
} from './draft.validation.js';
import {
  DraftValidationResult,
  DocumentDraftResponse,
} from './draft.types.js';

export class DraftService {
  public static resolveStoragePath(storageKey: string): string {
    if (!storageKey) return '';
    if (path.isAbsolute(storageKey)) return storageKey;
    const normalized = storageKey.replace(/^[\\/]*/, '').replace(/^storage[\\/]/, '');
    const candidate1 = path.resolve(process.cwd(), 'storage', normalized);
    if (fsSync.existsSync(candidate1)) return candidate1;
    const candidate2 = path.resolve(process.cwd(), storageKey);
    if (fsSync.existsSync(candidate2)) return candidate2;
    return candidate1;
  }

  private static async generateDraftCode(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    let attempts = 0;
    while (attempts < 10) {
      attempts++;
      const count = await prisma.documentDraft.count();
      const sequence = String(count + attempts).padStart(4, '0');
      const candidate = `DFT-${year}-${sequence}`;
      const existing = await prisma.documentDraft.findUnique({ where: { draftCode: candidate } });
      if (!existing) return candidate;
    }
    return `DFT-${year}-${Date.now().toString().slice(-4)}`;
  }

  private static formatDraft(draft: any): DocumentDraftResponse {
    let missingFlags: any[] = [];
    if (draft.missingFieldsFlags) {
      try {
        missingFlags = typeof draft.missingFieldsFlags === 'string'
          ? JSON.parse(draft.missingFieldsFlags)
          : draft.missingFieldsFlags;
      } catch {
        missingFlags = [];
      }
    }

    return {
      id: draft.id,
      draftCode: draft.draftCode,
      matterId: draft.matterId,
      matterNumber: draft.matter?.matterNumber || null,
      matterTitle: draft.matter?.title || null,
      clientId: draft.clientId,
      clientNumber: draft.client?.clientNumber || null,
      clientName: draft.client?.name || null,
      templateId: draft.templateId,
      templateCode: draft.template?.templateCode || null,
      templateName: draft.template?.templateName || null,
      templateVersionId: draft.templateVersionId,
      versionNumber: draft.templateVersion?.versionNumber || null,
      title: draft.title,
      status: draft.status,
      docxStorageKey: draft.docxStorageKey,
      pdfStorageKey: draft.pdfStorageKey,
      hasPdf: Boolean(draft.pdfStorageKey),
      missingFieldsFlags: Array.isArray(missingFlags) ? missingFlags : [],
      generatedByUserId: draft.generatedByUserId,
      generatedByName: draft.generatedByUser?.name || null,
      reviewedByUserId: draft.reviewedByUserId || null,
      reviewedByName: draft.reviewedByUser?.name || null,
      reviewedAt: draft.reviewedAt ? draft.reviewedAt.toISOString() : null,
      hasManualEdits: draft.hasManualEdits,
      isStale: draft.isStale,
      finalDocumentId: draft.finalDocumentId || null,
      createdAt: draft.createdAt.toISOString(),
      updatedAt: draft.updatedAt.toISOString(),
    };
  }

  /**
   * Validates document generation prerequisites without writing files to disk.
   */
  static async validateDraft(
    input: ValidateDraftInput,
    currentUser: AuthenticatedUser
  ): Promise<DraftValidationResult> {
    // 1. Authorize Matter Access with Ethical Wall screening
    await MatterService.getMatterByIdOrNumber(input.matterId, currentUser);

    const matter = await prisma.matter.findFirst({
      where: {
        OR: [{ id: input.matterId }, { matterNumber: input.matterId }],
      },
      include: {
        client: true,
        responsibleAttorney: true,
        practiceArea: true,
        originatingIntakes: { take: 1 },
        incidents: { take: 1, orderBy: { createdAt: 'desc' } },
        insurancePolicies: { take: 1, orderBy: { createdAt: 'desc' } },
        medicalProviders: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!matter) {
      throw AppError.notFound(`Matter '${input.matterId}' not found.`, 'MATTER_NOT_FOUND');
    }

    // 2. Retrieve Template & Version
    const template = await prisma.documentTemplate.findFirst({
      where: {
        OR: [{ id: input.templateId }, { templateCode: input.templateId }],
      },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          include: { fieldMappings: true },
        },
      },
    });

    if (!template) {
      throw AppError.notFound(`Template '${input.templateId}' not found.`, 'TEMPLATE_NOT_FOUND');
    }

    if (!template.isActive) {
      throw AppError.badRequest(
        `Template '${template.templateCode}' is currently deactivated and cannot be used for generation.`,
        'INACTIVE_TEMPLATE'
      );
    }

    let version = template.versions[0];
    if (input.templateVersionId) {
      version = template.versions.find((v) => v.id === input.templateVersionId) || version;
    }

    if (!version) {
      throw AppError.badRequest(
        `Template '${template.templateCode}' does not have any published versions.`,
        'NO_TEMPLATE_VERSIONS'
      );
    }

    // 3. Resolve Field Mappings
    const resolved = DraftDataResolver.resolve(matter, version, input.customOverrides);

    // Build preview dictionary
    const preview: Record<string, any> = {};
    Object.keys(resolved.resolvedData).forEach((key) => {
      const v = resolved.resolvedData[key];
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
        preview[key] = v;
      }
    });

    return {
      isValid: resolved.isValid,
      canGenerate: resolved.canGenerate,
      templateCode: template.templateCode,
      templateName: template.templateName,
      versionNumber: version.versionNumber,
      matterNumber: matter.matterNumber,
      clientName: matter.client.name,
      totalFieldsCount: resolved.totalFieldsCount,
      missingFieldsCount: resolved.missingFieldsCount,
      missingRequiredCount: resolved.missingRequiredCount,
      missingOptionalCount: resolved.missingOptionalCount,
      missingFields: resolved.missingFields,
      optionalMissingFields: resolved.optionalMissingFields,
      resolvedPreview: preview,
    };
  }

  /**
   * Generates a physical populated DOCX draft and records it in document_drafts.
   */
  static async generateDraft(
    input: GenerateDraftInput,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<DocumentDraftResponse> {
    // 1. Authorize Matter Access
    await MatterService.getMatterByIdOrNumber(input.matterId, currentUser);

    const matter = await prisma.matter.findFirst({
      where: {
        OR: [{ id: input.matterId }, { matterNumber: input.matterId }],
      },
      include: {
        client: true,
        responsibleAttorney: true,
        practiceArea: true,
        originatingIntakes: { take: 1 },
        incidents: { take: 1, orderBy: { createdAt: 'desc' } },
        insurancePolicies: { take: 1, orderBy: { createdAt: 'desc' } },
        medicalProviders: { take: 1, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!matter) {
      throw AppError.notFound(`Matter '${input.matterId}' not found.`, 'MATTER_NOT_FOUND');
    }

    // 2. Load Template and Target Version
    const template = await prisma.documentTemplate.findFirst({
      where: {
        OR: [{ id: input.templateId }, { templateCode: input.templateId }],
      },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          include: { fieldMappings: true },
        },
      },
    });

    if (!template) {
      throw AppError.notFound(`Template '${input.templateId}' not found.`, 'TEMPLATE_NOT_FOUND');
    }

    if (!template.isActive) {
      throw AppError.badRequest(
        `Template '${template.templateCode}' is currently deactivated and cannot be used for generation.`,
        'INACTIVE_TEMPLATE'
      );
    }

    let version = template.versions[0];
    if (input.templateVersionId) {
      version = template.versions.find((v) => v.id === input.templateVersionId) || version;
    }

    if (!version) {
      throw AppError.badRequest(
        `Template '${template.templateCode}' has no uploaded versions.`,
        'NO_TEMPLATE_VERSIONS'
      );
    }

    // 3. Resolve Data & Validate Required Information
    const resolved = DraftDataResolver.resolve(matter, version, input.customOverrides);

    if (!resolved.isValid && !input.allowIncomplete) {
      throw AppError.unprocessable(
        `Cannot generate complete legal document. ${resolved.missingFields.length} required field(s) are missing from matter records.`,
        { missingFields: resolved.missingFields },
        'MISSING_REQUIRED_LEGAL_DATA'
      );
    }

    // 4. Read Template DOCX Binary from Storage
    const templateAbsolutePath = this.resolveStoragePath(version.docxStorageKey);
    let templateBuffer: Buffer;
    try {
      templateBuffer = await fs.readFile(templateAbsolutePath);
    } catch {
      throw AppError.notFound(
        `Template document binary file could not be read from storage ('${version.docxStorageKey}').`,
        'TEMPLATE_FILE_NOT_FOUND'
      );
    }

    // 5. Generate Populated Output DOCX
    const generatedBuffer = DraftEngine.generateDocx(templateBuffer, resolved.resolvedData);

    // 6. Write Generated DOCX to Safe Storage
    const draftCode = await this.generateDraftCode();
    const draftStorageDir = path.resolve('storage', 'drafts', matter.id);
    const draftStorageKey = `drafts/${matter.id}/${draftCode}.docx`;
    const draftAbsolutePath = path.join(draftStorageDir, `${draftCode}.docx`);

    await fs.mkdir(draftStorageDir, { recursive: true });
    await fs.writeFile(draftAbsolutePath, generatedBuffer);

    // 7. Save Draft Metadata in Database
    const title = input.title || `${template.templateName} - ${matter.title}`;
    const status = resolved.isValid ? 'Draft' : 'Under Review';

    const draft = await prisma.documentDraft.create({
      data: {
        draftCode,
        matterId: matter.id,
        clientId: matter.clientId,
        templateId: template.id,
        templateVersionId: version.id,
        title,
        status,
        docxStorageKey: draftStorageKey,
        pdfStorageKey: null,
        missingFieldsFlags: resolved.missingFields as any,
        generatedByUserId: currentUser.id,
        hasManualEdits: false,
        isStale: false,
      },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        client: { select: { id: true, clientNumber: true, name: true } },
        template: { select: { id: true, templateCode: true, templateName: true } },
        templateVersion: { select: { id: true, versionNumber: true } },
        generatedByUser: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'DOCUMENT_DRAFT_GENERATED',
      resourceType: 'DOCUMENT_DRAFT',
      resourceId: draft.id,
      details: {
        draftCode,
        templateCode: template.templateCode,
        matterNumber: matter.matterNumber,
        isComplete: resolved.isValid,
        missingFieldsCount: resolved.missingFields.length,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatDraft(draft);
  }

  /**
   * Converts an existing DOCX draft into a PDF using LibreOffice headless.
   */
  static async convertDraftToPdf(
    draftId: string,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<DocumentDraftResponse> {
    const draft = await prisma.documentDraft.findUnique({
      where: { id: draftId },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        client: { select: { id: true, clientNumber: true, name: true } },
        template: { select: { id: true, templateCode: true, templateName: true } },
        templateVersion: { select: { id: true, versionNumber: true } },
        generatedByUser: { select: { id: true, name: true } },
      },
    });

    if (!draft) {
      throw AppError.notFound(`Draft '${draftId}' not found.`, 'DRAFT_NOT_FOUND');
    }

    // Authorize matter access
    await MatterService.getMatterByIdOrNumber(draft.matterId, currentUser);

    if (!draft.docxStorageKey) {
      throw AppError.badRequest('Draft does not have a valid DOCX file for PDF conversion.', 'NO_DOCX_FILE');
    }

    const docxAbsolutePath = this.resolveStoragePath(draft.docxStorageKey);
    let docxBuffer: Buffer;
    try {
      docxBuffer = await fs.readFile(docxAbsolutePath);
    } catch {
      throw AppError.notFound('Source DOCX draft file could not be read from storage.', 'DOCX_NOT_FOUND');
    }

    // Convert to PDF using DraftEngine
    const pdfBuffer = await DraftEngine.convertDocxToPdf(docxBuffer, draft.draftCode);

    // Save PDF to storage
    const pdfStorageKey = `drafts/${draft.matterId}/${draft.draftCode}.pdf`;
    const pdfAbsolutePath = path.resolve('storage', pdfStorageKey);
    await fs.writeFile(pdfAbsolutePath, pdfBuffer);

    // Update database
    const updated = await prisma.documentDraft.update({
      where: { id: draft.id },
      data: { pdfStorageKey },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        client: { select: { id: true, clientNumber: true, name: true } },
        template: { select: { id: true, templateCode: true, templateName: true } },
        templateVersion: { select: { id: true, versionNumber: true } },
        generatedByUser: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'DOCUMENT_DRAFT_PDF_CONVERTED',
      resourceType: 'DOCUMENT_DRAFT',
      resourceId: draft.id,
      details: { draftCode: draft.draftCode, pdfStorageKey },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatDraft(updated);
  }

  static async getDrafts(
    query: DraftQueryInput,
    currentUser: AuthenticatedUser
  ): Promise<{ drafts: DocumentDraftResponse[]; pagination: any }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.matterId) where.matterId = query.matterId;
    if (query.clientId) where.clientId = query.clientId;
    if (query.status) where.status = query.status;
    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { draftCode: { contains: s } },
        { title: { contains: s } },
      ];
    }

    // Apply Ethical Wall matter filtering for non-super_admins
    if (currentUser.role !== 'super_admin') {
      where.matter = {
        OR: [
          { description: { not: { contains: '[ETHICAL_WALL:ENABLED' } } },
          { description: null },
          { responsibleAttorneyId: currentUser.id },
          { staffAssignments: { some: { userId: currentUser.id } } },
        ],
      };
    }

    const [total, records] = await Promise.all([
      prisma.documentDraft.count({ where }),
      prisma.documentDraft.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          matter: { select: { id: true, matterNumber: true, title: true } },
          client: { select: { id: true, clientNumber: true, name: true } },
          template: { select: { id: true, templateCode: true, templateName: true } },
          templateVersion: { select: { id: true, versionNumber: true } },
          generatedByUser: { select: { id: true, name: true } },
        },
      }),
    ]);

    return {
      drafts: records.map(this.formatDraft),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getDraftById(
    draftId: string,
    currentUser: AuthenticatedUser
  ): Promise<DocumentDraftResponse> {
    const draft = await prisma.documentDraft.findFirst({
      where: {
        OR: [{ id: draftId }, { draftCode: draftId }],
      },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        client: { select: { id: true, clientNumber: true, name: true } },
        template: { select: { id: true, templateCode: true, templateName: true } },
        templateVersion: { select: { id: true, versionNumber: true } },
        generatedByUser: { select: { id: true, name: true } },
        reviewedByUser: { select: { id: true, name: true } },
      },
    });

    if (!draft) {
      throw AppError.notFound(`Draft '${draftId}' not found.`, 'DRAFT_NOT_FOUND');
    }

    // Authorize matter access
    await MatterService.getMatterByIdOrNumber(draft.matterId, currentUser);

    return this.formatDraft(draft);
  }

  static async downloadDraft(
    draftId: string,
    format: 'docx' | 'pdf',
    currentUser: AuthenticatedUser
  ): Promise<{ buffer: Buffer; fileName: string; contentType: string; draftCode: string }> {
    const draft = await this.getDraftById(draftId, currentUser);

    const isPdf = format.toLowerCase() === 'pdf';
    const storageKey = isPdf ? draft.pdfStorageKey : draft.docxStorageKey;

    if (!storageKey) {
      if (isPdf) {
        throw AppError.notFound(
          'PDF rendering has not yet been generated for this draft. Use DOCX format or request PDF conversion.',
          'PDF_NOT_GENERATED'
        );
      }
      throw AppError.notFound('Draft document file is missing from storage.', 'FILE_NOT_FOUND');
    }

    const absolutePath = path.resolve('storage', storageKey);
    let buffer: Buffer;
    try {
      buffer = await fs.readFile(absolutePath);
    } catch {
      throw AppError.notFound('Draft physical document file could not be read from disk.', 'FILE_NOT_FOUND');
    }

    const ext = isPdf ? 'pdf' : 'docx';
    const contentType = isPdf
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    return {
      buffer,
      fileName: `${draft.draftCode}_${draft.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${ext}`,
      contentType,
      draftCode: draft.draftCode,
    };
  }

  /**
   * Creates a structured follow-up task directly from missing document information.
   * Prevents duplicate open tasks for the same unresolved issue.
   * Enforces matter-level access and Utah RPC 1.10 Ethical Wall restrictions.
   */
  static async createFollowUpTask(
    input: CreateFollowUpTaskInput,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<any> {
    // 1. Authorize matter access (Ethical Wall enforcement)
    await MatterService.getMatterByIdOrNumber(input.matterId, currentUser);

    const fullMatter = await prisma.matter.findFirst({
      where: { OR: [{ id: input.matterId }, { matterNumber: input.matterId }] },
      include: { responsibleAttorney: true },
    });

    if (!fullMatter) {
      throw AppError.notFound(`Matter '${input.matterId}' not found.`, 'MATTER_NOT_FOUND');
    }

    // 2. Resolve Assignee (defaults to matter's lead attorney or current user)
    let assigneeId = input.assignedToUserId;
    if (!assigneeId) {
      assigneeId = fullMatter.responsibleAttorneyId || currentUser.id;
    }

    const assignee = await prisma.user.findUnique({
      where: { id: assigneeId },
      select: { id: true, name: true, status: true },
    });

    if (!assignee || assignee.status !== 'Active') {
      throw AppError.badRequest('Assigned staff member is invalid or inactive.', 'INVALID_ASSIGNEE');
    }

    // 3. Resolve Title and Description with issue tag
    const fieldTag = `${input.missingField.sourceEntity}.${input.missingField.sourceField}`;
    const taskTitle = input.title || `Follow-up: Missing ${input.missingField.sourceEntity} ${input.missingField.sourceField}`;
    const issueMarker = `[ISSUE:${fieldTag}]`;
    const taskDescription = input.description
      ? `${issueMarker} ${input.description}`
      : `${issueMarker} Required document generation field '${input.missingField.placeholderTag}' is missing from matter records. ${input.missingField.description || ''}`.trim();

    // 4. Duplicate Open Task Prevention
    const existingOpenTask = await prisma.task.findFirst({
      where: {
        matterId: fullMatter.id,
        status: { not: 'Completed' },
        OR: [
          { title: taskTitle },
          { description: { contains: issueMarker } },
        ],
      },
      include: {
        assignee: { select: { id: true, name: true } },
        matter: { select: { id: true, matterNumber: true, title: true } },
      },
    });

    if (existingOpenTask) {
      throw AppError.conflict(
        `An open follow-up task already exists for this unresolved issue ('${existingOpenTask.taskCode}' - ${existingOpenTask.title}).`,
        'DUPLICATE_OPEN_TASK'
      );
    }

    // 5. Default Due Date (7 days from today if not provided)
    let dueDateStr = input.dueDate;
    if (!dueDateStr) {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      dueDateStr = d.toISOString().split('T')[0];
    }

    // 6. Create Task via TaskService
    const createdTask = await TaskService.createTask(
      {
        matterId: fullMatter.id,
        title: taskTitle,
        description: taskDescription,
        assignedToUserId: assignee.id,
        dueDate: dueDateStr,
        priority: input.priority || 'High',
        reminderSetting: '1 day prior',
      },
      {
        userId: currentUser.id,
        userRole: currentUser.role,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      }
    );

    // 7. Immutable Audit Log
    await createAuditLog({
      userId: currentUser.id,
      action: 'CREATE',
      resourceType: 'tasks',
      resourceId: createdTask.id,
      details: {
        purpose: 'DOCUMENT_MISSING_INFO_FOLLOWUP',
        matterId: fullMatter.id,
        taskCode: createdTask.taskCode,
        missingField: input.missingField,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return createdTask;
  }
}

