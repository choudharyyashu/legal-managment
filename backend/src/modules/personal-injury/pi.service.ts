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
import { SignAuthorizationInput, UpdateRecordsRequestStatusInput } from './pi.validation.js';
import { PIWorkflowAutomationService } from './pi.workflow.js';

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
        status: 'Drafted',
        authorizationSigned: false,
        requestSentDate: null,
        requestDueDate: dueDate,
      },
    });

    // Create workflow task to obtain client signed authorization if requested (Sub-Stage E)
    let authorizationTask = null;
    if (input.requestAuthorization !== false) {
      authorizationTask = await PIWorkflowAutomationService.onMissingAuthorizationDetected(
        matter,
        recordRequest,
        provider.providerName,
        currentUser,
        context
      );
    }

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
      authorizationTask,
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

    // Create actionable follow-up task on the Matter (Sub-Stage E)
    const followUpTask = await PIWorkflowAutomationService.onIncompleteRecordsFollowUpRequired(
      recordRequest.matter,
      recordRequest,
      recordRequest.provider.providerName,
      input.deficiencyNotes,
      currentUser,
      context
    );

    return {
      recordRequest: updatedRequest,
      autoDraftResult,
      followUpTask,
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

    // Trigger Document 096 Auto-Draft (Representation Letter for this Insurer)
    let autoDraftResult = null;
    try {
      const isPI =
        (matter as any).practiceArea?.code === 'PI' ||
        (matter as any).practiceArea?.name?.toLowerCase().includes('personal injury') ||
        matter.practiceAreaId === 'pa-pi' ||
        matter.title?.toLowerCase().includes('pi') ||
        matter.matterNumber?.startsWith('PI-');

      if (isPI) {
        const primaryIncident = await prisma.incident.findFirst({
          where: validatedIncidentId ? { id: validatedIncidentId } : { matterId: matter.id },
          orderBy: { createdAt: 'desc' },
        });

        autoDraftResult = await AutoDraftService.handleAccidentSaved(
          {
            matterId: matter.id,
            incidentDate: primaryIncident?.incidentDate
              ? primaryIncident.incidentDate.toISOString().split('T')[0]
              : undefined,
            incidentTime: primaryIncident?.incidentTime || undefined,
            incidentLocation: primaryIncident?.incidentLocation || undefined,
            accidentType: primaryIncident?.accidentType || undefined,
            description: primaryIncident?.description || undefined,
            policeAgency: primaryIncident?.policeAgency || undefined,
            reportNumber: primaryIncident?.reportNumber || undefined,
            investigatingOfficer: primaryIncident?.investigatingOfficer || undefined,
            insuranceCompany: policy.insuranceCompany,
            claimNumber: policy.claimNumber || undefined,
            adjusterName: policy.adjusterName || undefined,
            adjusterPhone: policy.adjusterPhone || undefined,
            adjusterEmail: policy.adjusterEmail || undefined,
            liabilityAssessment: primaryIncident?.liabilityAssessment || undefined,
            customOverrides: {
              insurance_policy_id: policy.id,
              insured_name: policy.insuredName || undefined,
              policy_number: policy.policyNumber || undefined,
            },
          },
          currentUser,
          context
        );
      }
    } catch (draftErr: any) {
      console.warn('[PI Service] Could not auto-draft representation letter for insurer:', draftErr.message);
    }

    return Object.assign(policy, { autoDraftResult });
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

    // 9. Automate workflow transitions (Sub-Stage E):
    // Auto-complete open "Obtain Signed Authorization" tasks & create transmission task
    const workflowTransition = await PIWorkflowAutomationService.onAuthorizationSigned(
      updatedRequest.matter,
      updatedRequest,
      updatedRequest.provider.providerName,
      currentUser,
      context
    );

    // 10. Immutable Audit Log (Utah RPC 1.6)
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
      workflowTransition,
    };
  }

  /**
   * Updates status of a MedicalRecordRequest with strict authorization transmission readiness enforcement (Sub-Stage E).
   * Prevents transitioning to 'Ready to Send' or 'Sent' if authorization has not been signed.
   */
  static async updateRecordRequestStatus(
    matterId: string,
    requestId: string,
    input: UpdateRecordsRequestStatusInput,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);

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

    if (recordRequest.matterId !== matter.id) {
      throw AppError.badRequest(
        `Medical record request '${requestId}' does not belong to matter '${matterId}'.`,
        'REQUEST_MATTER_MISMATCH'
      );
    }

    // Enforce Authorization Transmission Readiness Gate (Sub-Stage E)
    if (input.status === 'Ready to Send' || input.status === 'Sent') {
      PIWorkflowAutomationService.validateTransmissionReadiness(recordRequest);
    }

    const updateData: any = {
      status: input.status,
    };

    let followUpTask = null;
    if (input.status === 'Sent') {
      const sentDate = input.sentDate ? new Date(input.sentDate) : new Date();
      const dueDate = new Date(sentDate);
      dueDate.setDate(dueDate.getDate() + 30); // 30-day statutory turnaround standard

      updateData.requestSentDate = sentDate;
      updateData.requestDueDate = dueDate;

      // Schedule automated 30-day statutory turnaround follow-up task
      followUpTask = await PIWorkflowAutomationService.onRecordsRequestTransmitted(
        matter,
        recordRequest,
        recordRequest.provider.providerName,
        currentUser,
        context
      );
    }

    const updated = await prisma.medicalRecordRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        provider: true,
        matter: true,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'MEDICAL_RECORD_REQUEST_STATUS_UPDATED',
      resourceType: 'MEDICAL_RECORD_REQUEST',
      resourceId: updated.id,
      details: {
        requestCode: updated.requestCode,
        previousStatus: recordRequest.status,
        newStatus: input.status,
        notes: input.notes || null,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      recordRequest: updated,
      followUpTask,
    };
  }

  // ---------------------------------------------------------------------------
  // LIEN MANAGEMENT & RESOLUTION
  // ---------------------------------------------------------------------------

  static async getLiens(matterId: string, currentUser: AuthenticatedUser) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);
    return prisma.pILien.findMany({
      where: { matterId: matter.id },
      include: {
        provider: true,
        negotiations: {
          orderBy: { negotiationDate: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createLien(matterId: string, input: any, currentUser: AuthenticatedUser) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);
    const lien = await prisma.pILien.create({
      data: {
        matterId: matter.id,
        providerId: input.providerId || null,
        lienholderName: input.lienholderName || input.lienHolder || 'Unknown Lienholder',
        category: input.category || input.lienType || 'HEALTHCARE_PROVIDER',
        accountReference: input.accountReference || null,
        assertedAmount: new Prisma.Decimal(input.assertedAmount || input.originalLienAmount || 0),
        verifiedAmount: new Prisma.Decimal(input.verifiedAmount || input.verifiedLienAmount || 0),
        negotiatedAmount: new Prisma.Decimal(input.negotiatedAmount || 0),
        finalPayoffAmount: new Prisma.Decimal(input.finalPayoffAmount || input.verifiedAmount || input.assertedAmount || 0),
        status: input.status || input.confirmationStatus || 'ASSERTED',
        isERISAQualified: Boolean(input.isERISAQualified),
        notes: input.notes || null,
      },
      include: {
        provider: true,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'LIEN_RECORD_CREATED',
      resourceType: 'PI_LIEN',
      resourceId: lien.id,
      details: { matterId: matter.id, lienholder: lien.lienholderName, amount: lien.assertedAmount },
    });

    return lien;
  }

  static async updateLien(matterId: string, lienId: string, input: any, currentUser: AuthenticatedUser) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);
    const updated = await prisma.pILien.update({
      where: { id: lienId },
      data: {
        lienholderName: input.lienholderName || input.lienHolder,
        category: input.category || input.lienType,
        assertedAmount: input.assertedAmount !== undefined ? new Prisma.Decimal(input.assertedAmount) : undefined,
        verifiedAmount: input.verifiedAmount !== undefined ? new Prisma.Decimal(input.verifiedAmount) : undefined,
        negotiatedAmount: input.negotiatedAmount !== undefined ? new Prisma.Decimal(input.negotiatedAmount) : undefined,
        finalPayoffAmount: input.finalPayoffAmount !== undefined ? new Prisma.Decimal(input.finalPayoffAmount) : undefined,
        status: input.status || input.confirmationStatus,
        notes: input.notes !== undefined ? input.notes : undefined,
      },
      include: {
        provider: true,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'LIEN_RECORD_UPDATED',
      resourceType: 'PI_LIEN',
      resourceId: updated.id,
      details: { matterId: matter.id, status: updated.status, finalPayoff: updated.finalPayoffAmount },
    });

    return updated;
  }

  // ---------------------------------------------------------------------------
  // CLIENT DAMAGES, DIAGNOSTICS & WAGE LOSS
  // ---------------------------------------------------------------------------

  static async getDamages(matterId: string, currentUser: AuthenticatedUser) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);
    const [damages, diagnosticStudies, wageLoss] = await Promise.all([
      prisma.pIDamagesRecord.findMany({
        where: { matterId: matter.id },
        include: { diagnosticStudies: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pIDiagnosticStudy.findMany({
        where: { matterId: matter.id },
        orderBy: { studyDate: 'desc' },
      }),
      prisma.pIWageLossRecord.findMany({
        where: { matterId: matter.id },
        orderBy: { startDate: 'desc' },
      }),
    ]);

    return { damages, diagnosticStudies, wageLoss };
  }

  static async createDamage(matterId: string, input: any, currentUser: AuthenticatedUser) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);
    const record = await prisma.pIDamagesRecord.create({
      data: {
        matterId: matter.id,
        injuryCategory: input.injuryCategory || input.category || 'ORTHOPEDIC',
        anatomicalLocation: input.anatomicalLocation || input.bodyPart || 'General',
        severityGrade: input.severityGrade || input.severity || 'MODERATE',
        icdCode: input.icdCode || null,
        futureTreatmentProjected: Boolean(input.futureTreatmentProjected),
        futureMedicalEstimatedCost: new Prisma.Decimal(input.futureMedicalEstimatedCost || 0),
        treatmentSummary: input.treatmentSummary || input.description || null,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'DAMAGES_RECORD_CREATED',
      resourceType: 'PI_DAMAGES',
      resourceId: record.id,
      details: { matterId: matter.id, location: record.anatomicalLocation },
    });

    return record;
  }

  // ---------------------------------------------------------------------------
  // SETTLEMENT CALCULATOR & DISBURSEMENTS
  // ---------------------------------------------------------------------------

  static async getSettlements(matterId: string, currentUser: AuthenticatedUser) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);
    return prisma.pISettlementDisbursement.findMany({
      where: { matterId: matter.id },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createSettlement(matterId: string, input: any, currentUser: AuthenticatedUser) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);
    const gross = new Prisma.Decimal(input.grossSettlementAmount || input.grossSettlement || 0);
    const feePct = new Prisma.Decimal(input.contingencyFeePercentage || input.attorneyFeePercent || 33.33);
    const feeAmount = new Prisma.Decimal(input.calculatedAttorneyFee || input.attorneyFee || (Number(gross) * Number(feePct) / 100));
    const costs = new Prisma.Decimal(input.totalLitigationCosts || input.costs || 0);
    const liens = new Prisma.Decimal(input.totalMedicalLiens || input.liens || 0);
    const advances = new Prisma.Decimal(input.totalClientAdvances || 0);
    const deductions = new Prisma.Decimal(input.otherDeductions || 0);
    const net = new Prisma.Decimal(
      input.netClientRecovery ||
      (Number(gross) - Number(feeAmount) - Number(costs) - Number(liens) - Number(advances) - Number(deductions))
    );

    const settlement = await prisma.pISettlementDisbursement.create({
      data: {
        matterId: matter.id,
        settlementTitle: input.settlementTitle || `Settlement Disbursement - ${matter.title}`,
        status: input.status || 'DRAFT',
        versions: {
          create: {
            versionNumber: 1,
            grossSettlementAmount: gross,
            contingencyFeePercentage: feePct,
            calculatedAttorneyFee: feeAmount,
            totalLitigationCosts: costs,
            totalClientAdvances: advances,
            totalMedicalLiens: liens,
            otherDeductions: deductions,
            netClientRecovery: net,
            versionStatus: 'DRAFT',
            createdByUserId: currentUser.id,
            notes: input.notes || null,
          },
        },
      },
      include: {
        versions: true,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'SETTLEMENT_RECORD_CREATED',
      resourceType: 'PI_SETTLEMENT',
      resourceId: settlement.id,
      details: { matterId: matter.id, gross: String(gross), net: String(net) },
    });

    return settlement;
  }

  // ---------------------------------------------------------------------------
  // VENDORS & VENDOR ASSIGNMENTS
  // ---------------------------------------------------------------------------

  static async getVendors(_currentUser: AuthenticatedUser) {
    return prisma.pIVendor.findMany({
      where: { isActive: true },
      orderBy: { vendorName: 'asc' },
    });
  }

  static async createVendor(input: any, currentUser: AuthenticatedUser) {
    const vendor = await prisma.pIVendor.create({
      data: {
        vendorName: input.vendorName || input.name,
        category: input.category || 'EXPERT_WITNESS',
        contactPerson: input.contactPerson || null,
        phone: input.phone || null,
        email: input.email || null,
        hourlyRate: input.hourlyRate ? new Prisma.Decimal(input.hourlyRate) : null,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'PI_VENDOR_CREATED',
      resourceType: 'PI_VENDOR',
      resourceId: vendor.id,
      details: { name: vendor.vendorName, category: vendor.category },
    });

    return vendor;
  }

  static async getVendorAssignments(matterId: string, currentUser: AuthenticatedUser) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);
    return prisma.pIVendorAssignment.findMany({
      where: { matterId: matter.id },
      include: {
        vendor: true,
        assignedStaff: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { assignedDate: 'desc' },
    });
  }

  static async createVendorAssignment(matterId: string, input: any, currentUser: AuthenticatedUser) {
    const matter = await MatterService.getMatterByIdOrNumber(matterId, currentUser);
    const assignment = await prisma.pIVendorAssignment.create({
      data: {
        matterId: matter.id,
        vendorId: input.vendorId,
        assignedStaffId: input.assignedStaffId || currentUser.id,
        serviceScope: input.serviceScope || input.scopeOfWork || 'General Expert/Vendor Assignment',
        status: input.status || 'ASSIGNED',
        assignedDate: input.assignedDate ? new Date(input.assignedDate) : new Date(),
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        authorizedAmount: new Prisma.Decimal(input.authorizedAmount || 0),
        invoicedAmount: new Prisma.Decimal(input.invoicedAmount || 0),
        notes: input.notes || null,
      },
      include: {
        vendor: true,
      },
    });

    await createAuditLog({
      userId: currentUser.id,
      userRole: currentUser.role,
      action: 'PI_VENDOR_ASSIGNMENT_CREATED',
      resourceType: 'PI_VENDOR_ASSIGNMENT',
      resourceId: assignment.id,
      details: { matterId: matter.id, vendorId: assignment.vendorId },
    });

    return assignment;
  }

  // ---------------------------------------------------------------------------
  // PI DASHBOARD AGGREGATED METRICS
  // ---------------------------------------------------------------------------

  static async getPIDashboardMetrics(currentUser: AuthenticatedUser) {
    const piMatters = await prisma.matter.findMany({
      where: {
        practiceAreaId: 'pa-pi',
        status: { not: 'Concluded' },
      },
      include: {
        client: true,
        incidents: true,
        insurancePolicies: true,
        medicalProviders: {
          include: { recordRequests: true },
        },
        demandPackages: true,
        liens: true,
      },
    });

    const activeCasesCount = piMatters.length;
    let pendingRecordsCount = 0;
    let demandsInProgressCount = 0;
    let readyForSettlementCount = 0;
    let totalLienAmount = 0;

    piMatters.forEach((m) => {
      m.medicalProviders.forEach((p) => {
        p.recordRequests.forEach((r) => {
          if (!r.isComplete && r.status !== 'Received') pendingRecordsCount++;
        });
      });

      m.demandPackages.forEach((d) => {
        if (d.status === 'DRAFTING' || d.status === 'READY_FOR_REVIEW') demandsInProgressCount++;
        if (d.status === 'SENT' || d.status === 'NEGOTIATION') readyForSettlementCount++;
      });

      m.liens.forEach((l) => {
        totalLienAmount += Number(l.finalPayoffAmount || l.assertedAmount || 0);
      });
    });

    return {
      activeCasesCount,
      pendingRecordsCount,
      demandsInProgressCount,
      readyForSettlementCount,
      totalLienAmount,
      totalCases: activeCasesCount,
    };
  }
}
