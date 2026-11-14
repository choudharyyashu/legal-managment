/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Personal Injury Module Service
 */

import { prisma } from '../../config/database.js';
import { Prisma } from '@prisma/client';
import { AppError } from '../../errors/AppError.js';
import { createAuditLog } from '../../utils/auditLogger.js';
import { MatterService } from '../matters/matter.service.js';
import { AuthenticatedUser } from '../auth/auth.types.js';
import { AutoDraftService } from '../documents/events/auto-draft.service.js';
import { DocumentEventBus } from '../documents/events/event-bus.js';
import { DOCUMENT_EVENT } from '../documents/events/event.types.js';
import {
  IncidentInput,
  InsurancePolicyInput,
  MedicalProviderInput,
  MarkIncompleteInput,
  DemandPackageInput,
} from './pi.types.js';
import { SignAuthorizationInput } from './pi.validation.js';

export class PersonalInjuryService {
  private static async generateRequestCode(): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2);
    let attempts = 0;
    while (attempts < 10) {
      attempts++;
      const count = await prisma.medicalRecordRequest.count();
      const sequence = String(count + attempts).padStart(4, '0');
      const candidate = `MRR-${year}-${sequence}`;
      const existing = await prisma.medicalRecordRequest.findUnique({ where: { requestCode: candidate } });
      if (!existing) return candidate;
    }
    return `MRR-${year}-${Date.now().toString().slice(-4)}`;
  }

  /**
   * Retrieves incident and liability investigation details for a PI matter.
   */
  static async getIncident(matterId: string, currentUser: AuthenticatedUser) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);

    const incident = await prisma.incident.findFirst({
      where: { matterId: matter.id },
      include: {
        insurancePolicies: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      matterId: matter.id,
      matterNumber: matter.matterNumber,
      title: matter.title,
      incident: incident || null,
    };
  }

  /**
   * Saves or updates an accident and liability investigation record.
   * Dispatches Document 096 Auto-Draft trigger (Liability Insurer Representation Letter).
   */
  static async saveIncident(
    matterId: string,
    input: IncidentInput,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);

    // Upsert or create incident
    let incident = await prisma.incident.findFirst({
      where: { matterId: matter.id },
    });

    const incidentDateObj = input.incidentDate ? new Date(input.incidentDate) : null;

    if (incident) {
      incident = await prisma.incident.update({
        where: { id: incident.id },
        data: {
          incidentDate: incidentDateObj,
          incidentTime: input.incidentTime || null,
          incidentLocation: input.incidentLocation || null,
          accidentType: input.accidentType || null,
          description: input.description || null,
          policeAgency: input.policeAgency || null,
          reportNumber: input.reportNumber || null,
          investigatingOfficer: input.investigatingOfficer || null,
          liabilityAssessment: input.liabilityAssessment || null,
          plaintiffFaultPercentage: input.plaintiffFaultPercentage ?? null,
          adverseFaultPercentage: input.adverseFaultPercentage ?? null,
          notes: input.notes || null,
        },
      });
    } else {
      incident = await prisma.incident.create({
        data: {
          matterId: matter.id,
          incidentDate: incidentDateObj,
          incidentTime: input.incidentTime || null,
          incidentLocation: input.incidentLocation || null,
          accidentType: input.accidentType || null,
          description: input.description || null,
          policeAgency: input.policeAgency || null,
          reportNumber: input.reportNumber || null,
          investigatingOfficer: input.investigatingOfficer || null,
          liabilityAssessment: input.liabilityAssessment || null,
          plaintiffFaultPercentage: input.plaintiffFaultPercentage ?? null,
          adverseFaultPercentage: input.adverseFaultPercentage ?? null,
          notes: input.notes || null,
        },
      });
    }

    // Save Insurance Policy if provided
    let policy = null;
    if (input.insurancePolicy && input.insurancePolicy.insuranceCompany) {
      const polInput = input.insurancePolicy;
      policy = await prisma.insurancePolicy.create({
        data: {
          matterId: matter.id,
          incidentId: incident.id,
          coverageType: polInput.coverageType || 'Liability',
          insuranceCompany: polInput.insuranceCompany,
          policyNumber: polInput.policyNumber || null,
          claimNumber: polInput.claimNumber || null,
          adjusterName: polInput.adjusterName || null,
          adjusterPhone: polInput.adjusterPhone || null,
          adjusterEmail: polInput.adjusterEmail || null,
          adjusterFax: polInput.adjusterFax || null,
          insuredName: polInput.insuredName || null,
          policyLimits: polInput.policyLimits || null,
          status: polInput.status || 'Active',
        },
      });
    }

    // Trigger Document 096 Auto-Draft (Liability Insurer Representation Letter)
    const autoDraftResult = await AutoDraftService.handleAccidentSaved(
      {
        matterId: matter.id,
        incidentDate: input.incidentDate || undefined,
        incidentTime: input.incidentTime || undefined,
        incidentLocation: input.incidentLocation || undefined,
        accidentType: input.accidentType || undefined,
        description: input.description || undefined,
        policeAgency: input.policeAgency || undefined,
        reportNumber: input.reportNumber || undefined,
        investigatingOfficer: input.investigatingOfficer || undefined,
        insuranceCompany: input.insurancePolicy?.insuranceCompany || undefined,
        claimNumber: input.insurancePolicy?.claimNumber || undefined,
        adjusterName: input.insurancePolicy?.adjusterName || undefined,
        adjusterPhone: input.insurancePolicy?.adjusterPhone || undefined,
        adjusterEmail: input.insurancePolicy?.adjusterEmail || undefined,
        liabilityAssessment: input.liabilityAssessment || undefined,
      },
      currentUser,
      context
    );

    return {
      incident,
      insurancePolicy: policy,
      autoDraftResult,
    };
  }

  /**
   * Retrieves all treating medical providers and their record request history for a PI matter.
   */
  static async getProviders(matterId: string, currentUser: AuthenticatedUser) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);

    const providers = await prisma.medicalProvider.findMany({
      where: { matterId: matter.id },
      include: {
        recordRequests: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return providers;
  }

  /**
   * Adds a medical provider to a PI matter and initializes record request workflow.
   * Dispatches Document 113 (Records Request) and 112 (Medical Authorization) Auto-Draft triggers.
   */
  static async addProvider(
    matterId: string,
    input: MedicalProviderInput,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);

    const startDate = input.treatmentStartDate ? new Date(input.treatmentStartDate) : null;
    const endDate = input.treatmentEndDate ? new Date(input.treatmentEndDate) : null;

    const provider = await prisma.medicalProvider.create({
      data: {
        matterId: matter.id,
        providerName: input.providerName,
        providerType: input.providerType || 'Clinic / Hospital',
        facilityAddress: input.facilityAddress || null,
        phone: input.phone || null,
        fax: input.fax || null,
        email: input.email || null,
        treatmentStartDate: startDate,
        treatmentEndDate: endDate,
        notes: input.notes || null,
      },
    });

    // Create medical record request record
    const requestCode = await this.generateRequestCode();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days statutory turnaround standard

    const recordRequest = await prisma.medicalRecordRequest.create({
      data: {
        matterId: matter.id,
        providerId: provider.id,
        requestCode,
        status: 'Requested',
        authorizationSigned: Boolean(input.requestAuthorization),
        requestSentDate: new Date(),
        requestDueDate: dueDate,
      },
    });

    // Trigger Document 113 & 112 Auto-Drafts
    const autoDraftResult = await AutoDraftService.handleProviderAdded(
      {
        matterId: matter.id,
        providerName: provider.providerName,
        providerType: provider.providerType || undefined,
        facilityAddress: provider.facilityAddress || undefined,
        phone: provider.phone || undefined,
        fax: provider.fax || undefined,
        email: provider.email || undefined,
        treatmentDates: input.treatmentStartDate && input.treatmentEndDate
          ? `${input.treatmentStartDate} to ${input.treatmentEndDate}`
          : input.treatmentStartDate || undefined,
        requestAuthorization: input.requestAuthorization !== false,
        requestRecords: input.requestRecords !== false,
      },
      currentUser,
      context
    );

    return {
      provider,
      recordRequest,
      autoDraftResult,
    };
  }

  /**
   * Flags received medical records packet as incomplete or deficient.
   * Dispatches Document 116 Auto-Draft trigger (Incomplete medical records follow-up).
   */
  static async markRecordsIncomplete(
    recordRequestId: string,
    input: MarkIncompleteInput,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ) {
    const recordRequest = await prisma.medicalRecordRequest.findUnique({
      where: { id: recordRequestId },
      include: {
        provider: true,
        matter: true,
      },
    });

    if (!recordRequest) {
      throw AppError.notFound(`Medical record request '${recordRequestId}' not found.`, 'REQUEST_NOT_FOUND');
    }

    // Authorize matter access (Ethical Wall enforcement)
    await MatterService.getMatterByIdOrNumber(recordRequest.matterId, currentUser);

    const updatedRequest = await prisma.medicalRecordRequest.update({
      where: { id: recordRequestId },
      data: {
        status: 'Incomplete',
        isComplete: false,
        deficiencyNotes: input.deficiencyNotes,
      },
    });

    // Trigger Document 116 Auto-Draft (Incomplete medical records follow-up)
    const autoDraftResult = await AutoDraftService.handleMissingRecords(
      {
        matterId: recordRequest.matterId,
        providerName: recordRequest.provider.providerName,
        daysOverdue: input.daysOverdue || 30,
        outstandingRecords: input.outstandingRecords || [],
        followUpNotes: input.deficiencyNotes,
      },
      currentUser,
      context
    );

    return {
      recordRequest: updatedRequest,
      autoDraftResult,
    };
  }

  /**
   * Retrieves all Insurance Policies for a specified Matter.
   * Enforces matter access authorization (Utah RPC 1.10).
   */
  static async getInsurancePolicies(
    matterId: string,
    currentUser: AuthenticatedUser
  ) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);

    const policies = await prisma.insurancePolicy.findMany({
      where: { matterId: matter.id },
      include: {
        incident: {
          select: {
            id: true,
            incidentDate: true,
            incidentLocation: true,
            reportNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      matterId: matter.id,
      matterNumber: matter.matterNumber,
      totalCount: policies.length,
      policies,
    };
  }

  /**
   * Creates a new Insurance Policy under a Matter.
   * Enforces field validation, matter-level authorization, and cross-Matter isolation.
   */
  static async createInsurancePolicy(
    matterId: string,
    input: InsurancePolicyInput & { incidentId?: string | null },
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);

    if (!input.insuranceCompany || !input.insuranceCompany.trim()) {
      throw AppError.badRequest('Insurance company name is required.', 'INVALID_INSURANCE_COMPANY');
    }

    // Cross-Matter Isolation check for incidentId if supplied
    let validatedIncidentId: string | null = null;
    if (input.incidentId) {
      const incident = await prisma.incident.findFirst({
        where: { id: input.incidentId, matterId: matter.id },
      });
      if (!incident) {
        throw AppError.badRequest(
          `Incident '${input.incidentId}' does not belong to Matter '${matter.matterNumber}'. Cross-matter linking rejected.`,
          'CROSS_MATTER_ISOLATION_VIOLATION'
        );
      }
      validatedIncidentId = incident.id;
    } else {
      // Link to primary incident of the matter if available
      const primaryIncident = await prisma.incident.findFirst({
        where: { matterId: matter.id },
        orderBy: { createdAt: 'desc' },
      });
      if (primaryIncident) {
        validatedIncidentId = primaryIncident.id;
      }
    }

    const policy = await prisma.insurancePolicy.create({
      data: {
        matterId: matter.id,
        incidentId: validatedIncidentId,
        coverageType: input.coverageType?.trim() || 'Liability',
        insuranceCompany: input.insuranceCompany.trim(),
        policyNumber: input.policyNumber?.trim() || null,
        claimNumber: input.claimNumber?.trim() || null,
        adjusterName: input.adjusterName?.trim() || null,
        adjusterPhone: input.adjusterPhone?.trim() || null,
        adjusterEmail: input.adjusterEmail?.trim() || null,
        adjusterFax: input.adjusterFax?.trim() || null,
        insuredName: input.insuredName?.trim() || null,
        policyLimits: input.policyLimits?.trim() || null,
        status: input.status?.trim() || 'Active',
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      action: 'CREATE',
      resourceType: 'insurance_policies',
      resourceId: policy.id,
      details: {
        matterId: matter.id,
        insuranceCompany: policy.insuranceCompany,
        coverageType: policy.coverageType,
        claimNumber: policy.claimNumber,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return policy;
  }

  /**
   * Retrieves all Personal Injury Demand Packages for a specified Matter.
   * Enforces matter access authorization (Utah RPC 1.10).
   */
  static async getDemandPackages(
    matterId: string,
    currentUser: AuthenticatedUser
  ) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);

    const demands = await (prisma as any).pIDemandPackage.findMany({
      where: { matterId: matter.id },
      include: {
        insurancePolicy: {
          select: {
            id: true,
            insuranceCompany: true,
            claimNumber: true,
            policyNumber: true,
            adjusterName: true,
          },
        },
        approvedByAttorney: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      matterId: matter.id,
      matterNumber: matter.matterNumber,
      totalCount: demands.length,
      demands,
    };
  }

  /**
   * Creates a new Settlement Demand Package for a Matter.
   * Validates exact decimal financials and prevents cross-Matter data access.
   * Emits PI_DEMAND_READY only when actual readiness conditions are verified.
   */
  static async createDemandPackage(
    matterId: string,
    input: DemandPackageInput,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);

    // Validate Demand Title
    if (!input.demandTitle || !input.demandTitle.trim()) {
      throw AppError.badRequest('Demand title is required.', 'INVALID_DEMAND_TITLE');
    }

    // Validate Recipient Carrier
    if (!input.recipientCarrier || !input.recipientCarrier.trim()) {
      throw AppError.badRequest('Recipient insurance carrier is required.', 'INVALID_RECIPIENT_CARRIER');
    }

    // Validate Demanded Amount (Financial Decimal Validation)
    if (input.demandedAmount === null || input.demandedAmount === undefined || input.demandedAmount === '') {
      throw AppError.badRequest('Demanded settlement amount is required.', 'INVALID_DEMANDED_AMOUNT');
    }

    let demandedDecimal: Prisma.Decimal;
    try {
      demandedDecimal = new Prisma.Decimal(input.demandedAmount);
      if (demandedDecimal.isNegative() || demandedDecimal.isZero() || isNaN(demandedDecimal.toNumber())) {
        throw new Error();
      }
    } catch {
      throw AppError.badRequest(
        'Demanded settlement amount must be a positive decimal value.',
        'INVALID_DEMANDED_AMOUNT'
      );
    }

    // Validate Policy Limit Amount if provided
    let policyLimitDecimal: Prisma.Decimal | null = null;
    if (input.policyLimitAmount !== undefined && input.policyLimitAmount !== null && input.policyLimitAmount !== '') {
      try {
        policyLimitDecimal = new Prisma.Decimal(input.policyLimitAmount);
        if (policyLimitDecimal.isNegative() || isNaN(policyLimitDecimal.toNumber())) {
          throw new Error();
        }
      } catch {
        throw AppError.badRequest(
          'Policy limit amount must be a non-negative decimal value.',
          'INVALID_POLICY_LIMIT_AMOUNT'
        );
      }
    }

    // Validate Deadline Date
    if (!input.deadlineDate) {
      throw AppError.badRequest('Response deadline date is required.', 'INVALID_DEADLINE_DATE');
    }
    const deadlineObj = new Date(input.deadlineDate);
    if (isNaN(deadlineObj.getTime())) {
      throw AppError.badRequest('Invalid deadline date format.', 'INVALID_DEADLINE_DATE');
    }

    // Cross-Matter Isolation Check for insurancePolicyId if provided
    let validatedPolicyId: string | null = null;
    if (input.insurancePolicyId) {
      const policy = await prisma.insurancePolicy.findFirst({
        where: { id: input.insurancePolicyId, matterId: matter.id },
      });
      if (!policy) {
        throw AppError.badRequest(
          `Insurance policy '${input.insurancePolicyId}' does not belong to Matter '${matter.matterNumber}'. Cross-matter policy linking rejected.`,
          'CROSS_MATTER_ISOLATION_VIOLATION'
        );
      }
      validatedPolicyId = policy.id;
    }

    // Create the Demand Package record
    const demandPackage = await (prisma as any).pIDemandPackage.create({
      data: {
        matterId: matter.id,
        insurancePolicyId: validatedPolicyId,
        demandTitle: input.demandTitle.trim(),
        recipientCarrier: input.recipientCarrier.trim(),
        claimNumber: input.claimNumber?.trim() || null,
        demandedAmount: demandedDecimal,
        policyLimitAmount: policyLimitDecimal,
        isPolicyLimitDemand: Boolean(input.isPolicyLimitDemand),
        status: input.status?.trim() || 'DRAFTING',
        deadlineDate: deadlineObj,
        checklistState: input.checklistState || null,
        notes: input.notes?.trim() || null,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      action: 'CREATE',
      resourceType: 'pi_demand_packages',
      resourceId: demandPackage.id,
      details: {
        matterId: matter.id,
        demandTitle: demandPackage.demandTitle,
        recipientCarrier: demandPackage.recipientCarrier,
        demandedAmount: demandPackage.demandedAmount.toString(),
        isPolicyLimitDemand: demandPackage.isPolicyLimitDemand,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    // -------------------------------------------------------------------------
    // Demand Ready Event Integration:
    // Only emit PI_DEMAND_READY when actual readiness conditions are met:
    // 1. Status indicates readiness ('READY' or 'DEMAND_READY' or explicit emitDemandReady: true)
    // 2. Demanded amount is positive
    // 3. Recipient carrier and deadline date are populated
    // 4. Duplicate prevention: Check if a draft was already generated for this demand package
    // -------------------------------------------------------------------------
    let eventDispatched = false;
    const isReadyStatus =
      input.status === 'READY' ||
      input.status === 'DEMAND_READY' ||
      input.emitDemandReady === true;

    if (isReadyStatus) {
      // Check for existing draft to ensure idempotency and prevent duplicate tasks
      // 1. Direct database record check via checklistState or draftDocumentId
      let existingDraft: any = null;
      try {
        const existingPkg = await (prisma as any).pIDemandPackage.findUnique({
          where: { id: demandPackage.id },
          select: { id: true, checklistState: true, draftDocumentId: true },
        });
        const linkedDraftId = existingPkg?.checklistState?.autoDraftId || existingPkg?.draftDocumentId;
        if (linkedDraftId) {
          existingDraft = await (prisma as any).documentDraft.findUnique({
            where: { id: linkedDraftId },
          });
        }
      } catch {}

      // 2. Scoped database query fallback (matterId + demandPackage.id)
      if (!existingDraft) {
        existingDraft = await (prisma as any).documentDraft.findFirst({
          where: {
            matterId: matter.id,
            title: { contains: demandPackage.id },
          },
        });
      }

      if (!existingDraft) {
        DocumentEventBus.emitAsync(
          DOCUMENT_EVENT.PI_DEMAND_READY,
          {
            matterId: matter.id,
            demandPackageId: demandPackage.id,
            recipientCarrier: demandPackage.recipientCarrier,
            claimNumber: demandPackage.claimNumber || undefined,
            demandAmount: Number(demandPackage.demandedAmount),
            policyLimit: demandPackage.policyLimitAmount ? Number(demandPackage.policyLimitAmount) : undefined,
            deadlineDate: demandPackage.deadlineDate.toISOString().split('T')[0],
            demandTitle: demandPackage.demandTitle,
          },
          {
            user: currentUser,
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
          }
        );
        eventDispatched = true;
      }
    }

    return {
      demandPackage,
      eventDispatched,
    };
  }

  /**
   * Records verified client signature evidence for a MedicalRecordRequest (Utah RPC 1.1 / 1.6)
   * Links a finalized medical authorization document from the same matter.
   */
  static async recordAuthorizationSignature(
    matterId: string,
    requestId: string,
    input: SignAuthorizationInput,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string } = {}
  ) {
    // 1. Authorize matter access with Ethical Wall screening (Utah RPC 1.10)
    await MatterService.getMatterByIdOrNumber(matterId, currentUser);

    // 2. Fetch the Medical Record Request
    const recordRequest = await prisma.medicalRecordRequest.findUnique({
      where: { id: requestId },
      include: {
        provider: true,
        matter: true,
      },
    });

    if (!recordRequest) {
      throw AppError.notFound(`Medical record request '${requestId}' not found.`, 'REQUEST_NOT_FOUND');
    }

    // 3. Verify Matter association
    if (recordRequest.matterId !== matterId) {
      throw AppError.badRequest(
        `Medical record request '${recordRequest.requestCode}' does not belong to matter '${matterId}'.`,
        'REQUEST_MATTER_MISMATCH'
      );
    }

    // 4. Verify Authorization Document existence
    const authDoc = await prisma.document.findUnique({
      where: { id: input.authorizationDocumentId },
      include: {
        versions: { orderBy: { uploadedAt: 'desc' }, take: 1 },
        originatingDrafts: { include: { template: true } },
      },
    });

    if (!authDoc) {
      throw AppError.notFound(
        `Authorization document '${input.authorizationDocumentId}' not found.`,
        'DOCUMENT_NOT_FOUND'
      );
    }

    // 5. Cross-Matter Document Isolation
    if (authDoc.matterId !== recordRequest.matterId) {
      throw AppError.forbidden(
        `Document '${authDoc.documentCode}' belongs to a different legal matter. Cross-matter document linking is strictly prohibited.`,
        'CROSS_MATTER_DOCUMENT_ACCESS'
      );
    }

    // 6. Verify Correct Document Type / Category
    const titleLower = authDoc.title.toLowerCase();
    const categoryLower = (authDoc.category || '').toLowerCase();
    const templateCodes = authDoc.originatingDrafts?.map((d: any) => d.template?.templateCode) || [];

    const isAuthCategory =
      categoryLower.includes('authorization') ||
      categoryLower.includes('release') ||
      categoryLower.includes('medical') ||
      categoryLower.includes('legal draft') ||
      categoryLower.includes('correspondence');

    const isAuthTitle =
      titleLower.includes('authorization') ||
      titleLower.includes('auth') ||
      titleLower.includes('hipaa') ||
      titleLower.includes('medical release');

    const is112Template = templateCodes.some((code: string) =>
      ['112', 'UT-PI-MED-112', 'TPL-PI-112'].includes(code)
    );

    if (!isAuthTitle && !is112Template && !isAuthCategory) {
      throw AppError.badRequest(
        `Document '${authDoc.title}' (${authDoc.category}) is not a recognized Medical Authorization document.`,
        'INVALID_DOCUMENT_TYPE'
      );
    }

    // 7. Check for duplicate / conflicting evidence
    if (recordRequest.authorizationSigned && recordRequest.authorizationDocumentId) {
      if (recordRequest.authorizationDocumentId === authDoc.id) {
        return {
          recordRequest,
          authorizationDocument: authDoc,
          evidence: {
            requestId: recordRequest.id,
            requestCode: recordRequest.requestCode,
            matterId: recordRequest.matterId,
            authorizationDocumentId: authDoc.id,
            authorizationDocumentCode: authDoc.documentCode,
            authorizationDocumentTitle: authDoc.title,
            signatureDate: recordRequest.authorizationDate?.toISOString().split('T')[0] || input.signatureDate,
            recordedByUserId: currentUser.id,
            recordedAt: new Date().toISOString(),
            notes: input.notes || null,
            isDuplicate: true,
          },
        };
      }
      throw AppError.conflict(
        `Medical record request '${recordRequest.requestCode}' already has signature evidence linked to document '${recordRequest.authorizationDocumentId}'. Conflicting evidence is rejected.`,
        'DUPLICATE_AUTHORIZATION_EVIDENCE'
      );
    }

    // 8. Update Medical Record Request with Signature Evidence
    const sigDate = new Date(input.signatureDate);
    const updatedRequest = await prisma.medicalRecordRequest.update({
      where: { id: requestId },
      data: {
        authorizationSigned: true,
        authorizationDate: sigDate,
        authorizationDocumentId: authDoc.id,
        status: recordRequest.status === 'Drafted' ? 'Ready to Send' : recordRequest.status,
      },
      include: {
        provider: true,
        matter: true,
      },
    });

    const evidence = {
      requestId: updatedRequest.id,
      requestCode: updatedRequest.requestCode,
      matterId: updatedRequest.matterId,
      authorizationDocumentId: authDoc.id,
      authorizationDocumentCode: authDoc.documentCode,
      authorizationDocumentTitle: authDoc.title,
      signatureDate: input.signatureDate,
      recordedByUserId: currentUser.id,
      recordedAt: new Date().toISOString(),
      notes: input.notes || null,
      isDuplicate: false,
    };

    // 9. Immutable Audit Log (Utah RPC 1.6)
    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'MEDICAL_AUTHORIZATION_SIGNED',
      resourceType: 'MEDICAL_RECORD_REQUEST',
      resourceId: updatedRequest.id,
      details: evidence,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      recordRequest: updatedRequest,
      authorizationDocument: authDoc,
      evidence,
    };
  }
}
