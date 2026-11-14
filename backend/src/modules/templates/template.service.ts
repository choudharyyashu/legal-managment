import crypto from 'crypto';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import {
  CreateTemplateInput,
  UpdateTemplateInput,
  UploadTemplateVersionInput,
  CreateFieldMappingInput,
  BatchFieldMappingsInput,
  UpdateFieldMappingInput,
} from './template.validation.js';
import {
  DocumentTemplateResponse,
  TemplateVersionResponse,
  DocumentFieldMappingResponse,
  TemplateListQuery,
} from './template.types.js';

const MAX_TEMPLATE_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export class TemplateService {
  private static sanitizeFileName(fileName: string): string {
    const base = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    return base.endsWith('.docx') ? base : `${base}.docx`;
  }

  private static formatVersion(version: any): TemplateVersionResponse {
    return {
      id: version.id,
      templateId: version.templateId,
      versionNumber: version.versionNumber,
      docxStorageKey: version.docxStorageKey,
      sha256Checksum: version.sha256Checksum,
      status: version.status,
      changeSummary: version.changeSummary || null,
      createdById: version.createdById,
      createdByName: version.createdByUser?.name || null,
      createdAt: version.createdAt.toISOString(),
      fieldMappingsCount: version._count?.fieldMappings ?? version.fieldMappings?.length ?? undefined,
    };
  }

  private static formatMapping(mapping: any): DocumentFieldMappingResponse {
    return {
      id: mapping.id,
      templateVersionId: mapping.templateVersionId,
      placeholderTag: mapping.placeholderTag,
      sourceEntity: mapping.sourceEntity,
      sourceField: mapping.sourceField,
      isRequired: mapping.isRequired,
      defaultValue: mapping.defaultValue || null,
      formattingRule: mapping.formattingRule || null,
      conditionalExpression: mapping.conditionalExpression || null,
      createdAt: mapping.createdAt.toISOString(),
      updatedAt: mapping.updatedAt.toISOString(),
    };
  }

  private static formatTemplate(tpl: any): DocumentTemplateResponse {
    return {
      id: tpl.id,
      templateCode: tpl.templateCode,
      templateName: tpl.templateName,
      description: tpl.description || null,
      practiceAreaId: tpl.practiceAreaId,
      practiceAreaCode: tpl.practiceArea?.code || null,
      practiceAreaName: tpl.practiceArea?.name || null,
      category: tpl.category,
      outputFormat: tpl.outputFormat,
      currentVersion: tpl.currentVersion,
      isActive: tpl.isActive,
      isSystemDefault: tpl.isSystemDefault,
      createdById: tpl.createdById,
      createdByName: tpl.createdByUser?.name || null,
      createdAt: tpl.createdAt.toISOString(),
      updatedAt: tpl.updatedAt.toISOString(),
      versions: tpl.versions ? tpl.versions.map(this.formatVersion) : undefined,
      draftsCount: tpl._count?.drafts ?? undefined,
    };
  }

  static async createTemplate(
    input: CreateTemplateInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<DocumentTemplateResponse> {
    const code = input.templateCode.toUpperCase().trim();

    const existing = await prisma.documentTemplate.findUnique({
      where: { templateCode: code },
    });
    if (existing) {
      throw AppError.conflict(
        `Template with code '${code}' already exists.`,
        'TEMPLATE_CODE_CONFLICT'
      );
    }

    const practiceArea = await prisma.practiceArea.findUnique({
      where: { id: input.practiceAreaId },
    });
    if (!practiceArea) {
      throw AppError.badRequest(
        `Referenced practice area '${input.practiceAreaId}' not found.`,
        'PRACTICE_AREA_NOT_FOUND'
      );
    }

    const template = await prisma.documentTemplate.create({
      data: {
        templateCode: code,
        templateName: input.templateName.trim(),
        description: input.description?.trim(),
        practiceAreaId: input.practiceAreaId,
        category: input.category.trim(),
        outputFormat: input.outputFormat,
        currentVersion: 'v1.0',
        isActive: true,
        isSystemDefault: input.isSystemDefault,
        createdById: context.userId,
      },
      include: {
        practiceArea: { select: { id: true, code: true, name: true } },
        createdByUser: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'TEMPLATE_CREATED',
      resourceType: 'DOCUMENT_TEMPLATE',
      resourceId: template.id,
      details: {
        templateCode: code,
        templateName: input.templateName,
        practiceAreaCode: practiceArea.code,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatTemplate(template);
  }

  static async getTemplates(query: TemplateListQuery): Promise<{
    templates: DocumentTemplateResponse[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.practiceAreaId) where.practiceAreaId = query.practiceAreaId;
    if (query.category) where.category = query.category;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { templateCode: { contains: s } },
        { templateName: { contains: s } },
        { description: { contains: s } },
      ];
    }

    const [total, records] = await Promise.all([
      prisma.documentTemplate.count({ where }),
      prisma.documentTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ practiceAreaId: 'asc' }, { templateCode: 'asc' }],
        include: {
          practiceArea: { select: { id: true, code: true, name: true } },
          createdByUser: { select: { id: true, name: true } },
          _count: { select: { versions: true, drafts: true } },
        },
      }),
    ]);

    return {
      templates: records.map(this.formatTemplate),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getTemplateByIdOrCode(idOrCode: string): Promise<DocumentTemplateResponse> {
    const template = await prisma.documentTemplate.findFirst({
      where: {
        OR: [{ id: idOrCode }, { templateCode: idOrCode }],
      },
      include: {
        practiceArea: { select: { id: true, code: true, name: true } },
        createdByUser: { select: { id: true, name: true } },
        versions: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdByUser: { select: { id: true, name: true } },
            _count: { select: { fieldMappings: true } },
          },
        },
        _count: { select: { drafts: true } },
      },
    });

    if (!template) {
      throw AppError.notFound(
        `Template '${idOrCode}' not found.`,
        'TEMPLATE_NOT_FOUND'
      );
    }

    return this.formatTemplate(template);
  }

  static async updateTemplate(
    id: string,
    input: UpdateTemplateInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<DocumentTemplateResponse> {
    const template = await prisma.documentTemplate.findUnique({ where: { id } });
    if (!template) {
      throw AppError.notFound(`Template '${id}' not found.`, 'TEMPLATE_NOT_FOUND');
    }

    if (template.isSystemDefault && context.userRole !== 'super_admin') {
      if (input.isSystemDefault === false) {
        throw AppError.forbidden(
          'Only a Super Admin can remove the System Default protection flag.',
          'PROTECTED_SYSTEM_TEMPLATE'
        );
      }
    }

    if (input.practiceAreaId && input.practiceAreaId !== template.practiceAreaId) {
      const pa = await prisma.practiceArea.findUnique({ where: { id: input.practiceAreaId } });
      if (!pa) {
        throw AppError.badRequest(
          `Referenced practice area '${input.practiceAreaId}' not found.`,
          'PRACTICE_AREA_NOT_FOUND'
        );
      }
    }

    const updated = await prisma.documentTemplate.update({
      where: { id },
      data: {
        templateName: input.templateName !== undefined ? input.templateName.trim() : undefined,
        description: input.description !== undefined ? input.description?.trim() : undefined,
        practiceAreaId: input.practiceAreaId,
        category: input.category !== undefined ? input.category.trim() : undefined,
        outputFormat: input.outputFormat,
        isSystemDefault: input.isSystemDefault,
      },
      include: {
        practiceArea: { select: { id: true, code: true, name: true } },
        createdByUser: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'TEMPLATE_UPDATED',
      resourceType: 'DOCUMENT_TEMPLATE',
      resourceId: updated.id,
      details: {
        templateCode: updated.templateCode,
        changes: input,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatTemplate(updated);
  }

  static async setTemplateStatus(
    id: string,
    isActive: boolean,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<DocumentTemplateResponse> {
    const template = await prisma.documentTemplate.findUnique({ where: { id } });
    if (!template) {
      throw AppError.notFound(`Template '${id}' not found.`, 'TEMPLATE_NOT_FOUND');
    }

    const updated = await prisma.documentTemplate.update({
      where: { id },
      data: { isActive },
      include: {
        practiceArea: { select: { id: true, code: true, name: true } },
        createdByUser: { select: { id: true, name: true } },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'TEMPLATE_STATUS_CHANGED',
      resourceType: 'DOCUMENT_TEMPLATE',
      resourceId: updated.id,
      details: {
        templateCode: updated.templateCode,
        isActive,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatTemplate(updated);
  }

  static async uploadVersion(
    templateIdOrCode: string,
    input: UploadTemplateVersionInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<TemplateVersionResponse> {
    const template = await prisma.documentTemplate.findFirst({
      where: {
        OR: [{ id: templateIdOrCode }, { templateCode: templateIdOrCode }],
      },
      include: { versions: true },
    });

    if (!template) {
      throw AppError.notFound(
        `Template '${templateIdOrCode}' not found.`,
        'TEMPLATE_NOT_FOUND'
      );
    }

    // Decode and validate binary
    let buffer: Buffer;
    try {
      buffer = Buffer.from(input.fileContentBase64, 'base64');
    } catch {
      throw AppError.badRequest('Invalid base64 file encoding.', 'INVALID_FILE_ENCODING');
    }

    if (buffer.length === 0) {
      throw AppError.badRequest('File content is empty.', 'EMPTY_FILE');
    }

    if (buffer.length > MAX_TEMPLATE_FILE_SIZE) {
      throw AppError.badRequest(
        `File size exceeds maximum permitted limit of 10 MB (received ${Math.round(buffer.length / 1024)} KB).`,
        'FILE_TOO_LARGE'
      );
    }

    // Validate DOCX / ZIP magic bytes: PK\x03\x04 (hex: 50 4b 03 04)
    if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b || buffer[2] !== 0x03 || buffer[3] !== 0x04) {
      throw AppError.badRequest(
        'File is not a valid Microsoft Word (.docx) document (invalid binary signature).',
        'INVALID_DOCX_SIGNATURE'
      );
    }

    // Determine version label
    let versionNumber: string;
    if (input.versionNumber) {
      versionNumber = input.versionNumber.startsWith('v')
        ? input.versionNumber
        : `v${input.versionNumber}`;
    } else {
      const existingCount = template.versions.length;
      versionNumber = `v${existingCount + 1}.0`;
    }

    // Check unique constraint per template
    const existingVersion = await prisma.templateVersion.findUnique({
      where: {
        uq_template_version: {
          templateId: template.id,
          versionNumber,
        },
      },
    });

    if (existingVersion) {
      throw AppError.conflict(
        `Version '${versionNumber}' already exists for template '${template.templateCode}'. Historical versions cannot be overwritten.`,
        'VERSION_ALREADY_EXISTS'
      );
    }

    const sha256Checksum = crypto.createHash('sha256').update(buffer).digest('hex');
    const safeFileName = this.sanitizeFileName(input.fileName);
    const storageDir = path.resolve('storage', 'templates', template.templateCode);
    const storageKey = `templates/${template.templateCode}/${versionNumber}_${safeFileName}`;
    const absoluteFilePath = path.join(storageDir, `${versionNumber}_${safeFileName}`);

    await fs.mkdir(storageDir, { recursive: true });
    await fs.writeFile(absoluteFilePath, buffer);

    // Atomically create version and update template currentVersion
    const [createdVersion] = await prisma.$transaction([
      prisma.templateVersion.create({
        data: {
          templateId: template.id,
          versionNumber,
          docxStorageKey: storageKey,
          sha256Checksum,
          status: input.status,
          changeSummary: input.changeSummary?.trim(),
          createdById: context.userId,
        },
        include: {
          createdByUser: { select: { id: true, name: true } },
        },
      }),
      prisma.documentTemplate.update({
        where: { id: template.id },
        data: { currentVersion: versionNumber },
      }),
    ]);

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'TEMPLATE_VERSION_UPLOADED',
      resourceType: 'TEMPLATE_VERSION',
      resourceId: createdVersion.id,
      details: {
        templateCode: template.templateCode,
        versionNumber,
        fileName: safeFileName,
        sha256Checksum,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatVersion(createdVersion);
  }

  static async getTemplateVersions(templateIdOrCode: string): Promise<TemplateVersionResponse[]> {
    const template = await prisma.documentTemplate.findFirst({
      where: {
        OR: [{ id: templateIdOrCode }, { templateCode: templateIdOrCode }],
      },
    });

    if (!template) {
      throw AppError.notFound(`Template '${templateIdOrCode}' not found.`, 'TEMPLATE_NOT_FOUND');
    }

    const versions = await prisma.templateVersion.findMany({
      where: { templateId: template.id },
      orderBy: { createdAt: 'desc' },
      include: {
        createdByUser: { select: { id: true, name: true } },
        _count: { select: { fieldMappings: true } },
      },
    });

    return versions.map(this.formatVersion);
  }

  static async getTemplateVersionById(
    templateIdOrCode: string,
    versionId: string
  ): Promise<TemplateVersionResponse & { fieldMappings: DocumentFieldMappingResponse[] }> {
    const template = await prisma.documentTemplate.findFirst({
      where: {
        OR: [{ id: templateIdOrCode }, { templateCode: templateIdOrCode }],
      },
    });

    if (!template) {
      throw AppError.notFound(`Template '${templateIdOrCode}' not found.`, 'TEMPLATE_NOT_FOUND');
    }

    const version = await prisma.templateVersion.findFirst({
      where: {
        id: versionId,
        templateId: template.id,
      },
      include: {
        createdByUser: { select: { id: true, name: true } },
        fieldMappings: {
          orderBy: { placeholderTag: 'asc' },
        },
      },
    });

    if (!version) {
      throw AppError.notFound(
        `Version '${versionId}' not found for template '${template.templateCode}'.`,
        'VERSION_NOT_FOUND'
      );
    }

    return {
      ...this.formatVersion(version),
      fieldMappings: version.fieldMappings.map(this.formatMapping),
    };
  }

  static async downloadTemplateVersion(
    templateIdOrCode: string,
    versionId: string
  ): Promise<{ buffer: Buffer; fileName: string; versionNumber: string; sha256Checksum: string }> {
    const version = await this.getTemplateVersionById(templateIdOrCode, versionId);
    const normalized = version.docxStorageKey.replace(/^[\\/]*/, '').replace(/^storage[\\/]/, '');
    const candidate1 = path.resolve(process.cwd(), 'storage', normalized);
    const absolutePath = fsSync.existsSync(candidate1) ? candidate1 : path.resolve(process.cwd(), version.docxStorageKey);

    try {
      const buffer = await fs.readFile(absolutePath);
      const fileName = path.basename(version.docxStorageKey);
      return {
        buffer,
        fileName,
        versionNumber: version.versionNumber,
        sha256Checksum: version.sha256Checksum,
      };
    } catch {
      throw AppError.notFound(
        'Template physical document file could not be read from storage.',
        'FILE_NOT_FOUND'
      );
    }
  }

  static async getFieldMappings(
    templateIdOrCode: string,
    versionId: string
  ): Promise<DocumentFieldMappingResponse[]> {
    const version = await this.getTemplateVersionById(templateIdOrCode, versionId);
    const mappings = await prisma.documentFieldMapping.findMany({
      where: { templateVersionId: version.id },
      orderBy: { placeholderTag: 'asc' },
    });
    return mappings.map(this.formatMapping);
  }

  private static normalizePlaceholderTag(tag: string): string {
    const trimmed = tag.trim();
    if (trimmed.startsWith('{{') && trimmed.endsWith('}}')) {
      return trimmed;
    }
    return `{{${trimmed}}}`;
  }

  static async createFieldMapping(
    templateIdOrCode: string,
    versionId: string,
    input: CreateFieldMappingInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<DocumentFieldMappingResponse> {
    const version = await this.getTemplateVersionById(templateIdOrCode, versionId);
    const tag = this.normalizePlaceholderTag(input.placeholderTag);

    const existing = await prisma.documentFieldMapping.findUnique({
      where: {
        uq_version_placeholder: {
          templateVersionId: version.id,
          placeholderTag: tag,
        },
      },
    });

    if (existing) {
      throw AppError.conflict(
        `Field mapping for placeholder '${tag}' already exists in this template version.`,
        'PLACEHOLDER_MAPPING_CONFLICT'
      );
    }

    const mapping = await prisma.documentFieldMapping.create({
      data: {
        templateVersionId: version.id,
        placeholderTag: tag,
        sourceEntity: input.sourceEntity,
        sourceField: input.sourceField.trim(),
        isRequired: input.isRequired,
        defaultValue: input.defaultValue?.trim(),
        formattingRule: input.formattingRule,
        conditionalExpression: input.conditionalExpression?.trim(),
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'FIELD_MAPPING_CREATED',
      resourceType: 'DOCUMENT_FIELD_MAPPING',
      resourceId: mapping.id,
      details: {
        templateVersionId: version.id,
        placeholderTag: tag,
        sourceEntity: input.sourceEntity,
        sourceField: input.sourceField,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatMapping(mapping);
  }

  static async batchSaveFieldMappings(
    templateIdOrCode: string,
    versionId: string,
    input: BatchFieldMappingsInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<DocumentFieldMappingResponse[]> {
    const version = await this.getTemplateVersionById(templateIdOrCode, versionId);

    // Atomically upsert mappings
    await prisma.$transaction(async (tx) => {
      for (const m of input.mappings) {
        const tag = this.normalizePlaceholderTag(m.placeholderTag);
        await tx.documentFieldMapping.upsert({
          where: {
            uq_version_placeholder: {
              templateVersionId: version.id,
              placeholderTag: tag,
            },
          },
          create: {
            templateVersionId: version.id,
            placeholderTag: tag,
            sourceEntity: m.sourceEntity,
            sourceField: m.sourceField.trim(),
            isRequired: m.isRequired,
            defaultValue: m.defaultValue?.trim(),
            formattingRule: m.formattingRule,
            conditionalExpression: m.conditionalExpression?.trim(),
          },
          update: {
            sourceEntity: m.sourceEntity,
            sourceField: m.sourceField.trim(),
            isRequired: m.isRequired,
            defaultValue: m.defaultValue?.trim(),
            formattingRule: m.formattingRule,
            conditionalExpression: m.conditionalExpression?.trim(),
          },
        });
      }
    });

    const refreshed = await prisma.documentFieldMapping.findMany({
      where: { templateVersionId: version.id },
      orderBy: { placeholderTag: 'asc' },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'FIELD_MAPPINGS_BATCH_UPDATED',
      resourceType: 'TEMPLATE_VERSION',
      resourceId: version.id,
      details: {
        count: input.mappings.length,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return refreshed.map(this.formatMapping);
  }

  static async updateFieldMapping(
    templateIdOrCode: string,
    versionId: string,
    mappingId: string,
    input: UpdateFieldMappingInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<DocumentFieldMappingResponse> {
    const version = await this.getTemplateVersionById(templateIdOrCode, versionId);

    const mapping = await prisma.documentFieldMapping.findFirst({
      where: { id: mappingId, templateVersionId: version.id },
    });

    if (!mapping) {
      throw AppError.notFound(`Field mapping '${mappingId}' not found.`, 'MAPPING_NOT_FOUND');
    }

    const tag = input.placeholderTag ? this.normalizePlaceholderTag(input.placeholderTag) : undefined;

    const updated = await prisma.documentFieldMapping.update({
      where: { id: mappingId },
      data: {
        placeholderTag: tag,
        sourceEntity: input.sourceEntity,
        sourceField: input.sourceField !== undefined ? input.sourceField.trim() : undefined,
        isRequired: input.isRequired,
        defaultValue: input.defaultValue !== undefined ? input.defaultValue?.trim() : undefined,
        formattingRule: input.formattingRule,
        conditionalExpression: input.conditionalExpression !== undefined ? input.conditionalExpression?.trim() : undefined,
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'FIELD_MAPPING_UPDATED',
      resourceType: 'DOCUMENT_FIELD_MAPPING',
      resourceId: updated.id,
      details: { mappingId, changes: input },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatMapping(updated);
  }

  static async deleteFieldMapping(
    templateIdOrCode: string,
    versionId: string,
    mappingId: string,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    const version = await this.getTemplateVersionById(templateIdOrCode, versionId);

    const mapping = await prisma.documentFieldMapping.findFirst({
      where: { id: mappingId, templateVersionId: version.id },
    });

    if (!mapping) {
      throw AppError.notFound(`Field mapping '${mappingId}' not found.`, 'MAPPING_NOT_FOUND');
    }

    await prisma.documentFieldMapping.delete({ where: { id: mappingId } });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'FIELD_MAPPING_DELETED',
      resourceType: 'DOCUMENT_FIELD_MAPPING',
      resourceId: mappingId,
      details: { placeholderTag: mapping.placeholderTag },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }
}
