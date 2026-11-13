import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { CreateDocumentInput, UploadVersionInput } from './document.validation.js';
import { DocumentResponse, DocumentListQuery, DocumentVersionResponse } from './document.types.js';

export class DocumentService {
  private static async generateDocumentCode(): Promise<string> {
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
      versions: doc.versions ? doc.versions.map(this.formatVersion) : undefined,
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
      where.OR = [
        { title: { contains: query.search } },
        { documentCode: { contains: query.search } },
      ];
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
          versions: { orderBy: { uploadedAt: 'desc' }, take: 1 },
        },
      }),
    ]);

    return {
      documents: records.map(this.formatResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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

  static async uploadVersion(
    documentId: string,
    input: UploadVersionInput,
    context: { userId: string; userRole: string; ipAddress?: string; userAgent?: string }
  ): Promise<DocumentVersionResponse> {
    const doc = await this.getDocumentByIdOrCode(documentId);

    // Determine version label
    const existingVersions = await prisma.documentVersion.count({ where: { documentId: doc.id } });
    const versionNumber = existingVersions + 1;
    const versionLabel = `v${versionNumber}.0`;

    // Calculate sha256 checksum
    const buffer = input.fileContentBase64
      ? Buffer.from(input.fileContentBase64, 'base64')
      : Buffer.from(`Simulated-Vault-File-${doc.documentCode}-${versionLabel}`);
    
    const sha256Checksum = crypto.createHash('sha256').update(buffer).digest('hex');
    const s3StorageKey = `vault/${doc.matterId}/${doc.documentCode}/${versionLabel}_${input.fileName}`;

    // Write file to local vault directory for persistence
    const vaultDir = path.resolve('vault', doc.matterId, doc.documentCode);
    await fs.mkdir(vaultDir, { recursive: true }).catch(() => {});
    await fs.writeFile(path.join(vaultDir, `${versionLabel}_${input.fileName}`), buffer).catch(() => {});

    const fileSizeBytes = BigInt(input.fileSizeBytes);

    const version = await prisma.documentVersion.create({
      data: {
        documentId: doc.id,
        versionLabel,
        fileName: input.fileName,
        fileType: input.fileType,
        fileSizeBytes,
        s3StorageKey,
        sha256Checksum,
        uploadedByUserId: context.userId,
        revisionNotes: input.revisionNotes,
      },
      include: {
        uploadedByUser: { select: { id: true, name: true } },
      },
    });

    // Update document's currentVersion
    await prisma.document.update({
      where: { id: doc.id },
      data: { currentVersion: versionLabel },
    });

    await createAuditLog({
      userId: context.userId,
      userRole: context.userRole,
      action: 'DOCUMENT_VERSION_UPLOADED',
      resourceType: 'DOCUMENT',
      resourceId: doc.id,
      details: { documentCode: doc.documentCode, versionLabel, fileName: input.fileName, sha256: sha256Checksum },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return this.formatVersion(version);
  }

  static async downloadDocument(documentId: string): Promise<{ version: DocumentVersionResponse; content: Buffer }> {
    const doc = await this.getDocumentByIdOrCode(documentId);

    const latestVersion = await prisma.documentVersion.findFirst({
      where: { documentId: doc.id },
      orderBy: { uploadedAt: 'desc' },
      include: { uploadedByUser: { select: { id: true, name: true } } },
    });

    if (!latestVersion) {
      throw AppError.notFound('No file version has been uploaded for this document record.', 'VERSION_NOT_FOUND');
    }

    const localPath = path.resolve('vault', doc.matterId, doc.documentCode, `${latestVersion.versionLabel}_${latestVersion.fileName}`);
    let content: Buffer;
    try {
      content = await fs.readFile(localPath);
    } catch {
      content = Buffer.from(`Simulated file payload for ${latestVersion.fileName}`);
    }

    return {
      version: this.formatVersion(latestVersion),
      content,
    };
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
