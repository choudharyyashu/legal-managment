import crypto from 'crypto';
import { prisma } from '../../config/database.js';
import { AppError } from '../../errors/AppError.js';
import { TokenService } from '../auth/token.service.js';
import {
  ClientPortalUser,
  ClientPortalAuthToken,
  ClientPortalMatterSummary,
  ClientPortalDocument,
  ClientPortalMessage,
  ClientPortalInvoiceSummary,
  ClientPortalSignaturePayload,
} from './portal.types.js';

export class ClientPortalService {
  /**
   * Separate Client Portal Authentication
   * Validates client email and checks portal_access_enabled.
   */
  static async authenticateClient(
    email: string,
    accessCodeOrPin?: string
  ): Promise<ClientPortalAuthToken> {
    if (!email) {
      throw AppError.badRequest('Client email is required for portal login.', 'EMAIL_REQUIRED');
    }

    const client = await prisma.client.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        status: 'Active',
      },
    });

    if (!client) {
      throw AppError.unauthorized('Invalid portal credentials or unregistered client account.', 'CLIENT_NOT_FOUND');
    }

    if (!client.portalAccessEnabled) {
      throw AppError.forbidden(
        'Client portal access is currently disabled for your account. Please contact your responsible attorney at Heugly & Bludworth.',
        'PORTAL_ACCESS_DISABLED'
      );
    }

    // Portal user object
    const portalUser: ClientPortalUser = {
      id: client.id,
      clientId: client.id,
      email: client.email,
      name: client.name,
      clientNumber: client.clientNumber,
      role: 'client',
    };

    // Generate JWT access token with role: 'client'
    const token = TokenService.generateAccessToken({
      userId: client.id,
      userCode: client.clientNumber,
      email: client.email,
      role: 'client',
      permissions: ['portal:read', 'portal:write', 'portal:sign'],
    });

    return {
      token,
      expiresIn: '1h',
      client: portalUser,
    };
  }

  /**
   * Enforces server-side matter-level access check.
   * Client can ONLY view matters that strictly belong to their clientId.
   */
  static async verifyMatterOwnership(clientId: string, matterId: string): Promise<any> {
    const matter = await prisma.matter.findUnique({
      where: { id: matterId },
      include: {
        practiceArea: true,
        currentStage: true,
        responsibleAttorney: { select: { id: true, name: true, email: true } },
      },
    });

    if (!matter) {
      throw AppError.notFound(`Matter '${matterId}' not found.`, 'MATTER_NOT_FOUND');
    }

    if (matter.clientId !== clientId) {
      throw AppError.forbidden(
        'Cross-client access denied. You are not authorized to view or access this legal matter.',
        'CROSS_CLIENT_ACCESS_DENIED'
      );
    }

    return matter;
  }

  /**
   * List authorized matters for the authenticated client ONLY.
   */
  static async getAuthorizedMatters(clientId: string): Promise<ClientPortalMatterSummary[]> {
    const matters = await prisma.matter.findMany({
      where: { clientId, status: { not: 'Archived' } },
      include: {
        practiceArea: true,
        currentStage: true,
        responsibleAttorney: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return matters.map((m) => ({
      id: m.id,
      matterNumber: m.matterNumber,
      title: m.title,
      practiceArea: m.practiceArea?.name || 'General Legal',
      status: m.status,
      responsibleAttorney: m.responsibleAttorney
        ? {
            id: m.responsibleAttorney.id,
            name: m.responsibleAttorney.name,
            email: m.responsibleAttorney.email,
          }
        : null,
      openedDate: m.openDate.toISOString().split('T')[0],
      stageName: m.currentStage?.stageName || 'In Progress',
    }));
  }

  /**
   * Get single matter detail with strict ownership verification.
   */
  static async getMatterDetail(clientId: string, matterId: string): Promise<ClientPortalMatterSummary> {
    const matter = await this.verifyMatterOwnership(clientId, matterId);
    return {
      id: matter.id,
      matterNumber: matter.matterNumber,
      title: matter.title,
      practiceArea: matter.practiceArea?.name || 'General Legal',
      status: matter.status,
      responsibleAttorney: matter.responsibleAttorney
        ? {
            id: matter.responsibleAttorney.id,
            name: matter.responsibleAttorney.name,
            email: matter.responsibleAttorney.email,
          }
        : null,
      openedDate: matter.openDate.toISOString().split('T')[0],
      stageName: matter.currentStage?.stageName || 'In Progress',
    };
  }

  /**
   * List documents for an authorized matter.
   */
  static async getMatterDocuments(clientId: string, matterId: string): Promise<ClientPortalDocument[]> {
    await this.verifyMatterOwnership(clientId, matterId);

    const documents = await prisma.document.findMany({
      where: { matterId },
      orderBy: { createdAt: 'desc' },
    });

    return documents.map((d) => ({
      id: d.id,
      matterId: d.matterId,
      title: d.title,
      documentType: d.category || 'General Document',
      fileSizeBytes: 1024,
      uploadedAt: d.createdAt.toISOString(),
      requiresSignature: false,
      isSigned: false,
    }));
  }

  /**
   * Client Document Upload: Uploads document for authorized matter.
   */
  static async uploadDocument(
    clientId: string,
    matterId: string,
    payload: { title: string; category?: string; fileSizeBytes?: number; storageKey?: string }
  ): Promise<ClientPortalDocument> {
    const matter = await this.verifyMatterOwnership(clientId, matterId);
    const docCode = `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const doc = await prisma.document.create({
      data: {
        documentCode: docCode,
        matterId: matter.id,
        clientId,
        title: payload.title,
        category: payload.category || 'Client Upload',
        currentVersion: 'v1.0',
      },
    });

    return {
      id: doc.id,
      matterId: matter.id,
      title: doc.title,
      documentType: doc.category || 'Client Upload',
      fileSizeBytes: payload.fileSizeBytes || 1024,
      uploadedAt: doc.createdAt.toISOString(),
      requiresSignature: false,
      isSigned: false,
    };
  }

  /**
   * Exchange Messages: Get conversation messages for authorized matter.
   */
  static async getMatterMessages(clientId: string, matterId: string): Promise<ClientPortalMessage[]> {
    await this.verifyMatterOwnership(clientId, matterId);

    const communications = await prisma.communication.findMany({
      where: { matterId },
      orderBy: { date: 'asc' },
    });

    return communications.map((c) => ({
      id: c.id,
      matterId: c.matterId || matterId,
      senderType: c.direction === 'INBOUND' ? 'CLIENT' : 'ATTORNEY',
      senderName: c.sender || 'Staff',
      body: c.summary || c.subject || '',
      timestamp: c.date.toISOString(),
      isRead: c.status !== 'UNREAD',
    }));
  }

  /**
   * Exchange Messages: Send client message linked to authorized matter and alert attorney.
   */
  static async sendMatterMessage(
    clientId: string,
    matterId: string,
    body: string
  ): Promise<ClientPortalMessage> {
    if (!body || !body.trim()) {
      throw AppError.badRequest('Message body cannot be empty.', 'EMPTY_MESSAGE');
    }

    const matter = await this.verifyMatterOwnership(clientId, matterId);

    const comm = await prisma.communication.create({
      data: {
        matterId: matter.id,
        clientId,
        type: 'Mobile Message',
        direction: 'INBOUND',
        sender: 'Client (Portal)',
        recipient: matter.responsibleAttorney?.name || 'Legal Staff',
        subject: `Portal Message: Matter ${matter.matterNumber}`,
        summary: body.trim(),
        status: 'UNREAD',
        date: new Date(),
      },
    });

    return {
      id: comm.id,
      matterId: matter.id,
      senderType: 'CLIENT',
      senderName: 'You (Client)',
      body: comm.summary || '',
      timestamp: comm.date.toISOString(),
      isRead: false,
    };
  }

  /**
   * E-Signature Workflow: Securely signs document with cryptographic audit hash.
   */
  static async signDocument(
    clientId: string,
    payload: ClientPortalSignaturePayload
  ): Promise<{ success: boolean; signatureHash: string; signedAt: string; documentId: string }> {
    if (!payload.documentId) {
      throw AppError.badRequest('Document ID is required for e-signature.', 'DOCUMENT_ID_REQUIRED');
    }
    if (!payload.signerName) {
      throw AppError.badRequest('Legal signer name is required.', 'SIGNER_NAME_REQUIRED');
    }

    const doc = await prisma.document.findUnique({
      where: { id: payload.documentId },
    });

    if (!doc) {
      throw AppError.notFound(`Document '${payload.documentId}' not found.`, 'DOC_NOT_FOUND');
    }

    if (doc.clientId !== clientId) {
      throw AppError.forbidden('Access denied. You cannot sign documents that do not belong to you.', 'SIGN_FORBIDDEN');
    }

    const signedAt = new Date().toISOString();
    const hashData = `${payload.documentId}:${clientId}:${payload.signerName}:${signedAt}:${payload.ipAddress || '127.0.0.1'}`;
    const signatureHash = crypto.createHash('sha256').update(hashData).digest('hex');

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: clientId,
        userName: payload.signerName,
        userRole: 'client',
        action: 'CLIENT_PORTAL_DOCUMENT_ESIGNED',
        resourceType: 'document',
        resourceId: doc.id,
        details: { signatureHash, signerName: payload.signerName, documentTitle: doc.title },
        ipAddress: payload.ipAddress || '127.0.0.1',
        userAgent: payload.userAgent || 'LegalPro-ClientPortal',
      },
    }).catch(() => {});

    return {
      success: true,
      signatureHash,
      signedAt,
      documentId: doc.id,
    };
  }

  /**
   * List Invoices for Authenticated Client
   */
  static async getClientInvoices(clientId: string): Promise<ClientPortalInvoiceSummary[]> {
    const invoices = await prisma.invoice.findMany({
      where: { clientId },
      include: { matter: { select: { matterNumber: true } } },
      orderBy: { issueDate: 'desc' },
    });

    return invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      matterNumber: inv.matter?.matterNumber || 'N/A',
      issueDate: inv.issueDate.toISOString().split('T')[0],
      dueDate: inv.dueDate.toISOString().split('T')[0],
      totalAmount: Number(inv.totalAmount || 0),
      balanceDue: Number(inv.balanceDue || 0),
      status: inv.status as any,
    }));
  }

  /**
   * List Payments for Authenticated Client
   */
  static async getClientPayments(clientId: string): Promise<any[]> {
    const payments = await prisma.paymentRecord.findMany({
      where: { clientId },
      orderBy: { receivedDate: 'desc' },
    });

    return payments.map((p) => ({
      id: p.id,
      referenceNumber: p.paymentReference,
      amount: Number(p.amount || 0),
      paymentMethod: p.paymentMethod,
      paymentDate: p.receivedDate.toISOString().split('T')[0],
      status: 'COMPLETED',
    }));
  }
}
