import crypto from 'crypto';
import path from 'path';
import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { CreateDocumentInput, UpdateDocumentInput, UploadVersionInput } from './document.validation.js';
import { DocumentResponse, DocumentListQuery, DocumentVersionResponse } from './document.types.js';
import { StorageService } from './storage/storage.service.js';
import { OcrService, OcrExtractionResult } from './ocr/ocr.service.js';

export class DocumentService {
  public static async generateDocumentCode(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    let attempts = 0;
    while (attempts < 10) {
      attempts++;
      const count = await prisma.document.count();
      const sequence = String(count + attempts).padStart(4, '0');
      const candidate = `DOC-${year}-${sequence}`;
      const existing = await prisma.document.findUnique({ where: { documentCode: candidate } });
      if (!existing) return candidate;
    }
    return `DOC-${year}-${Date.now().toString().slice(-4)}`;
  }

  private static sanitizeFileName(fileName: string): string {
    return path.basename(fileName || 'document.bin').replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  private static formatVersion(version: any): DocumentVersionResponse {
    return {
      id: version.id,
      versionLabel: version.versionLabel,
      fileName: version.fileName,
      fileType: version.fileType,
      fileSizeBytes: version.fileSizeBytes <= BigInt(Number.MAX_SAFE_INTEGER)
        ? Number(version.fileSizeBytes)
        : version.fileSizeBytes.toString(),
      s3StorageKey: version.s3StorageKey,
      sha256Checksum: version.sha256Checksum,
      uploadedByUserId: version.uploadedByUserId,
      uploadedByName: version.uploadedByUser?.name || null,
      revisionNotes: version.revisionNotes || null,
      uploadedAt: version.uploadedAt.toISOString(),
    };
  }

  private static formatResponse(doc: any): DocumentResponse {
    return {
      id: doc.id,
      documentCode: doc.documentCode,
      matterId: doc.matterId,
      matterNumber: doc.matter?.matterNumber || null,
      matterTitle: doc.matter?.title || null,
      clientId: doc.clientId,
      clientNumber: doc.client?.clientNumber || null,
      clientName: doc.client?.name || null,
      title: doc.title,
      category: doc.category,
      currentVersion: doc.currentVersion,
      isPrivileged: doc.isPrivileged,
      privilegeType: doc.privilegeType || null,
      ocrContent: doc.ocrContent || null,
      batesNumberStart: doc.batesNumberStart || null,
      batesNumberEnd: doc.batesNumberEnd || null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      versions: doc.versions ? doc.versions.map((v: any) => DocumentService.formatVersion(v)) : undefined,
    };
  }

  static async getDocuments(query: DocumentListQuery): Promise<{ documents: DocumentResponse[]; pagination: any }> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.matterId) where.matterId = query.matterId;
    if (query.clientId) where.clientId = query.clientId;
    if (query.category) where.category = query.category;
    if (query.isPrivileged !== undefined) where.isPrivileged = query.isPrivileged;
    if (query.search) {
      const orConditions: any[] = [
        { title: { contains: query.search } },
        { documentCode: { contains: query.search } },
        { batesNumberStart: { contains: query.search } },
        { batesNumberEnd: { contains: query.search } },
        {
          versions: {
            some: {
              OR: [
                { fileName: { contains: query.search } },
                { sha256Checksum: { contains: query.search } },
                { revisionNotes: { contains: query.search } },
              ],
            },
          },
        },
      ];
      if (query.ocrSearch !== false) {
        orConditions.push({ ocrContent: { contains: query.search } });
      }
      where.OR = orConditions;
    }

    const [total, records] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          matter: { select: { id: true, matterNumber: true, title: true } },
          client: { select: { id: true, clientNumber: true, name: true } },
          versions: {
            orderBy: { uploadedAt: 'desc' },
            include: { uploadedByUser: { select: { id: true, name: true } } },
          },
        },
      }),
    ]);

    return {
      documents: records.map((doc) => DocumentService.formatResponse(doc)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getDocumentByIdOrCode(idOrCode: string): Promise<DocumentResponse> {
    const doc = await prisma.document.findFirst({
      where: {
        OR: [{ id: idOrCode }, { documentCode: idOrCode }],
      },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        client: { select: { id: true, clientNumber: true, name: true } },
        versions: {
          orderBy: { uploadedAt: 'desc' },
          include: { uploadedByUser: { select: { id: true, name: true } } },
        },
      },
    });

    if (!doc) {
      throw AppError.notFound(`Document '${idOrCode}' not found.`, 'DOCUMENT_NOT_FOUND');
    }
    return this.formatResponse(doc);
  }

  static async createDocument(
    input: CreateDocumentInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<DocumentResponse> {
    const matter = await prisma.matter.findUnique({ where: { id: input.matterId } });
    if (!matter) throw AppError.badRequest('Referenced legal matter not found.', 'MATTER_NOT_FOUND');

    const client = await prisma.client.findUnique({ where: { id: input.clientId } });
    if (!client) throw AppError.badRequest('Referenced client not found.', 'CLIENT_NOT_FOUND');

    const documentCode = await this.generateDocumentCode();

    const created = await prisma.document.create({
      data: {
        documentCode,
        matterId: input.matterId,
        clientId: input.clientId,
        title: input.title,
        category: input.category,
        isPrivileged: input.isPrivileged,
        privilegeType: input.privilegeType,
        batesNumberStart: input.batesNumberStart,
        batesNumberEnd: input.batesNumberEnd,
        ocrContent: input.ocrContent || null,
        currentVersion: 'v1.0',
      },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        client: { select: { id: true, clientNumber: true, name: true } },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'DOCUMENT_CREATED',
      resourceType: 'DOCUMENT',
      resourceId: created.id,
      details: { documentCode, title: input.title, matterNumber: matter.matterNumber },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(created);
  }

  /**
   * Single-step document creation + v1.0 binary upload + automatic OCR & entity extraction.
   */
  static async createAndUploadDocument(
    input: {
      matterId: string;
      clientId?: string;
      title: string;
      category: string;
      isPrivileged?: boolean;
      privilegeType?: string;
      revisionNotes?: string;
      fileName: string;
      fileType: string;
      fileBuffer?: Buffer;
      fileContentBase64?: string;
    },
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<{ document: DocumentResponse; version: DocumentVersionResponse; ocrExtraction: OcrExtractionResult }> {
    const matter = await prisma.matter.findFirst({
      where: { OR: [{ id: input.matterId }, { matterNumber: input.matterId }] },
    });
    if (!matter) throw AppError.badRequest('Referenced legal matter not found.', 'MATTER_NOT_FOUND');

    const clientId = input.clientId || matter.clientId;
    const doc = await this.createDocument(
      {
        matterId: matter.id,
        clientId,
        title: input.title,
        category: (input.category as any) || 'Other',
        isPrivileged: Boolean(input.isPrivileged),
        privilegeType: input.privilegeType,
      },
      context
    );

    const uploadResult = await this.uploadVersion(
      doc.id,
      {
        fileName: input.fileName,
        fileType: input.fileType,
        fileSizeBytes: input.fileBuffer?.length,
        fileContentBase64: input.fileContentBase64,
        revisionNotes: input.revisionNotes || 'Initial document upload & OCR indexing.',
      },
      context,
      input.fileBuffer
    );

    const refreshed = await this.getDocumentByIdOrCode(doc.id);
    return {
      document: refreshed,
      version: uploadResult,
      ocrExtraction: uploadResult.ocrExtraction,
    };
  }

  static async uploadVersion(
    documentId: string,
    input: UploadVersionInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string },
    rawFileBuffer?: Buffer
  ): Promise<DocumentVersionResponse & { ocrExtraction: OcrExtractionResult }> {
    const doc = await this.getDocumentByIdOrCode(documentId);

    const existingVersions = await prisma.documentVersion.count({ where: { documentId: doc.id } });
    const versionNumber = existingVersions + 1;
    const versionLabel = `v${versionNumber}.0`;

    let buffer: Buffer;
    if (rawFileBuffer && rawFileBuffer.length > 0) {
      buffer = rawFileBuffer;
    } else if (input.fileContentBase64) {
      const cleanedBase64 = input.fileContentBase64.includes(',')
        ? input.fileContentBase64.split(',')[1]
        : input.fileContentBase64;
      buffer = Buffer.from(cleanedBase64, 'base64');
    } else {
      buffer = Buffer.from(`Vault-File-${doc.documentCode}-${versionLabel}`);
    }

    const safeFileName = this.sanitizeFileName(input.fileName);
    const relativeKey = `vault/${doc.matterId}/${doc.documentCode}/${versionLabel}_${safeFileName}`;
    const stored = await StorageService.writeFile(relativeKey, buffer);

    // Automatically run OCR & text extraction on uploaded content
    const ocrExtraction = await OcrService.extract(buffer, safeFileName, input.fileType);

    const fileSizeBytes = BigInt(input.fileSizeBytes ?? stored.fileSizeBytes);

    const version = await prisma.documentVersion.create({
      data: {
        documentId: doc.id,
        versionLabel,
        fileName: safeFileName,
        fileType: input.fileType,
        fileSizeBytes,
        s3StorageKey: stored.storageKey,
        sha256Checksum: stored.sha256Checksum,
        uploadedByUserId: context.userId,
        revisionNotes: input.revisionNotes,
      },
      include: {
        uploadedByUser: { select: { id: true, name: true } },
      },
    });

    await prisma.document.update({
      where: { id: doc.id },
      data: {
        currentVersion: versionLabel,
        ...(ocrExtraction.text ? { ocrContent: ocrExtraction.text } : {}),
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'DOCUMENT_VERSION_UPLOADED',
      resourceType: 'DOCUMENT',
      resourceId: doc.id,
      details: {
        documentCode: doc.documentCode,
        versionLabel,
        fileName: safeFileName,
        sha256: stored.sha256Checksum,
        ocrMethod: ocrExtraction.method,
        ocrWords: ocrExtraction.wordCount,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      ...this.formatVersion(version),
      ocrExtraction,
    };
  }

  static async getVersions(documentId: string): Promise<DocumentVersionResponse[]> {
    const doc = await this.getDocumentByIdOrCode(documentId);
    const versions = await prisma.documentVersion.findMany({
      where: { documentId: doc.id },
      orderBy: { uploadedAt: 'desc' },
      include: { uploadedByUser: { select: { id: true, name: true } } },
    });
    return versions.map((v) => this.formatVersion(v));
  }

  static async downloadDocument(
    documentId: string,
    versionIdOrLabel?: string
  ): Promise<{ version: DocumentVersionResponse; content: Buffer }> {
    const doc = await this.getDocumentByIdOrCode(documentId);

    const targetVersion = versionIdOrLabel
      ? await prisma.documentVersion.findFirst({
          where: {
            documentId: doc.id,
            OR: [{ id: versionIdOrLabel }, { versionLabel: versionIdOrLabel }],
          },
          include: { uploadedByUser: { select: { id: true, name: true } } },
        })
      : await prisma.documentVersion.findFirst({
          where: { documentId: doc.id },
          orderBy: { uploadedAt: 'desc' },
          include: { uploadedByUser: { select: { id: true, name: true } } },
        });

    if (!targetVersion) {
      throw AppError.notFound('No matching file version has been uploaded for this document record.', 'VERSION_NOT_FOUND');
    }

    const legacyRelative = `${doc.matterId}/${doc.documentCode}/${targetVersion.versionLabel}_${targetVersion.fileName}`;
    let content: Buffer;
    try {
      content = await StorageService.readFile(targetVersion.s3StorageKey, legacyRelative);
    } catch {
      content = Buffer.from(`File payload unavailable on disk for ${targetVersion.fileName}`);
    }

    return {
      version: this.formatVersion(targetVersion),
      content,
    };
  }

  /**
   * Non-destructively restores a historical version by promoting its exact binary
   * into a new immutable version (preserving full audit trail).
   */
  static async restoreVersion(
    documentId: string,
    versionIdOrLabel: string,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<DocumentVersionResponse> {
    const doc = await this.getDocumentByIdOrCode(documentId);
    const targetVersion = await prisma.documentVersion.findFirst({
      where: {
        documentId: doc.id,
        OR: [{ id: versionIdOrLabel }, { versionLabel: versionIdOrLabel }],
      },
    });

    if (!targetVersion) {
      throw AppError.notFound(`Version '${versionIdOrLabel}' not found for document '${doc.documentCode}'.`, 'VERSION_NOT_FOUND');
    }

    const legacyRelative = `${doc.matterId}/${doc.documentCode}/${targetVersion.versionLabel}_${targetVersion.fileName}`;
    const buffer = await StorageService.readFile(targetVersion.s3StorageKey, legacyRelative);

    const restored = await this.uploadVersion(
      doc.id,
      {
        fileName: targetVersion.fileName,
        fileType: targetVersion.fileType,
        fileSizeBytes: buffer.length,
        revisionNotes: `Restored from historical version ${targetVersion.versionLabel} (${targetVersion.fileName}).`,
      },
      context,
      buffer
    );

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'DOCUMENT_VERSION_RESTORED',
      resourceType: 'DOCUMENT',
      resourceId: doc.id,
      details: {
        documentCode: doc.documentCode,
        restoredFromVersion: targetVersion.versionLabel,
        newVersionLabel: restored.versionLabel,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return restored;
  }

  static async runOcrExtraction(
    documentId: string,
    versionIdOrLabel: string | undefined,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<{
    documentId: string;
    documentCode: string;
    versionLabel: string;
    ocrContent: string;
    extraction: OcrExtractionResult;
  }> {
    const doc = await this.getDocumentByIdOrCode(documentId);
    const { version, content } = await this.downloadDocument(doc.id, versionIdOrLabel);
    const extraction = await OcrService.extract(content, version.fileName, version.fileType);

    await prisma.document.update({
      where: { id: doc.id },
      data: { ocrContent: extraction.text || doc.ocrContent || '' },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'DOCUMENT_OCR_EXTRACTED',
      resourceType: 'DOCUMENT',
      resourceId: doc.id,
      details: {
        documentCode: doc.documentCode,
        versionLabel: version.versionLabel,
        method: extraction.method,
        wordCount: extraction.wordCount,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      documentId: doc.id,
      documentCode: doc.documentCode,
      versionLabel: version.versionLabel,
      ocrContent: extraction.text,
      extraction,
    };
  }

  static async getOcrDetails(documentId: string): Promise<{
    documentId: string;
    documentCode: string;
    title: string;
    ocrContent: string;
    extractedFields: ReturnType<typeof OcrService.extractStructuredEntities>;
  }> {
    const doc = await this.getDocumentByIdOrCode(documentId);
    const text = doc.ocrContent || '';
    return {
      documentId: doc.id,
      documentCode: doc.documentCode,
      title: doc.title,
      ocrContent: text,
      extractedFields: OcrService.extractStructuredEntities(text),
    };
  }

  static async verifyDocumentIntegrity(documentId: string): Promise<{
    documentId: string;
    documentCode: string;
    allVerified: boolean;
    versions: Array<{
      versionId: string;
      versionLabel: string;
      fileName: string;
      exists: boolean;
      verified: boolean;
      expectedSha256: string;
      actualSha256: string | null;
      fileSizeBytes: number;
    }>;
  }> {
    const doc = await this.getDocumentByIdOrCode(documentId);
    const versions = doc.versions || [];

    const checks = await Promise.all(
      versions.map(async (v) => {
        const legacyRelative = `${doc.matterId}/${doc.documentCode}/${v.versionLabel}_${v.fileName}`;
        const check = await StorageService.verifyIntegrity(v.s3StorageKey, v.sha256Checksum, legacyRelative);
        return {
          versionId: v.id,
          versionLabel: v.versionLabel,
          fileName: v.fileName,
          ...check,
        };
      })
    );

    return {
      documentId: doc.id,
      documentCode: doc.documentCode,
      allVerified: checks.length > 0 && checks.every((c) => c.exists && c.verified),
      versions: checks,
    };
  }

  static async getStorageStats() {
    const [diskStats, documentsCount, versionsCount, draftsCount, templatesCount] = await Promise.all([
      StorageService.getStorageStats(),
      prisma.document.count(),
      prisma.documentVersion.count(),
      prisma.documentDraft.count(),
      prisma.documentTemplate.count(),
    ]);

    return {
      ...diskStats,
      databaseCounts: {
        documentsCount,
        versionsCount,
        draftsCount,
        templatesCount,
      },
    };
  }

  /**
   * F-0700: Updates editable display metadata (title, privilege tag, Bates range)
   * while preserving immutable documentCode, origin versions, and SHA-256 checksums.
   */
  static async updateDocumentMetadata(
    idOrCode: string,
    input: UpdateDocumentInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<DocumentResponse> {
    const existing = await this.getDocumentByIdOrCode(idOrCode);

    const updated = await prisma.document.update({
      where: { id: existing.id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.isPrivileged !== undefined ? { isPrivileged: input.isPrivileged } : {}),
        ...(input.privilegeType !== undefined ? { privilegeType: input.privilegeType } : {}),
        ...(input.batesNumberStart !== undefined ? { batesNumberStart: input.batesNumberStart } : {}),
        ...(input.batesNumberEnd !== undefined ? { batesNumberEnd: input.batesNumberEnd } : {}),
      },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        client: { select: { id: true, clientNumber: true, name: true } },
        versions: {
          orderBy: { uploadedAt: 'desc' },
          include: { uploadedByUser: { select: { id: true, name: true } } },
        },
      },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'DOCUMENT_METADATA_UPDATED',
      resourceType: 'DOCUMENT',
      resourceId: existing.id,
      details: {
        documentCode: existing.documentCode,
        previousTitle: existing.title,
        changes: input,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatResponse(updated);
  }

  static async deleteDocument(
    id: string,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<void> {
    const existing = await this.getDocumentByIdOrCode(id);

    await prisma.document.delete({ where: { id: existing.id } });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'DOCUMENT_DELETED',
      resourceType: 'DOCUMENT',
      resourceId: existing.id,
      details: { documentCode: existing.documentCode, title: existing.title },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }
}
