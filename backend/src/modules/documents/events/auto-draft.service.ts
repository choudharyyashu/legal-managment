/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Auto Draft Trigger Service (Phase 4)
 * Orchestrates event-driven legal document generation across Personal Injury workflows.
 */

import { prisma } from '../../../config/database.js';
import { createAuditLog } from '../../../utils/auditLogger.js';
import { MatterService } from '../../matters/matter.service.js';
import { AuthenticatedUser } from '../../auth/auth.types.js';
import { TaskService } from '../../tasks/task.service.js';
import { DraftService } from '../drafts/draft.service.js';
import { PIWorkflowAutomationService } from '../../personal-injury/pi.workflow.js';
import {
  DOCUMENT_EVENT,
  DocumentEventType,
  AccidentSavedPayload,
  ProviderAddedPayload,
  MissingRecordsPayload,
  DemandReadyPayload,
  AutoDraftTriggerResult,
  ConsultationBookedPayload,
  ConsultationRescheduledPayload,
  ProspectSavedPayload,
  ConflictSearchCompletedPayload,
  MatterCreatedFromIntakePayload,
  EvictionClosureReviewedPayload,
} from './event.types.js';
import { DocumentEventBus, DomainEventContext } from './event-bus.js';

export class AutoDraftService {
  /**
   * Concurrency Serialization Mutex: Tracks active in-flight document generations
   * Scoped to: matterId + demandPackageId + templateCode
   * Prevents TOCTOU race conditions between simultaneous concurrent requests.
   */
  private static inFlightOperations = new Map<string, Promise<AutoDraftTriggerResult>>();

  /**
   * Initialize event subscribers on application start.
   */
  static initSubscriptions(): void {
    DocumentEventBus.subscribe<AccidentSavedPayload>(
      DOCUMENT_EVENT.PI_ACCIDENT_SAVED,
      async (payload, context) => {
        await AutoDraftService.handleAccidentSaved(payload, context.user, {
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
      }
    );

    DocumentEventBus.subscribe<ProviderAddedPayload>(
      DOCUMENT_EVENT.PI_PROVIDER_ADDED,
      async (payload, context) => {
        await AutoDraftService.handleProviderAdded(payload, context.user, {
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
      }
    );

    DocumentEventBus.subscribe<MissingRecordsPayload>(
      DOCUMENT_EVENT.PI_MISSING_RECORDS,
      async (payload, context) => {
        await AutoDraftService.handleMissingRecords(payload, context.user, {
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
      }
    );

    DocumentEventBus.subscribe<DemandReadyPayload>(
      DOCUMENT_EVENT.PI_DEMAND_READY,
      async (payload, context) => {
        await AutoDraftService.handleDemandReady(payload, context.user, {
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
      }
    );

    // Phase 3.A: Core Intake & Priority 4 Event Subscriptions
    DocumentEventBus.subscribe<ConsultationBookedPayload>(
      DOCUMENT_EVENT.INTAKE_CONSULTATION_BOOKED,
      async (payload, context) => {
        try {
          const res = await AutoDraftService.handleConsultationBooked(payload, context.user, {
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
          });
          if (res.errors.length) console.error('[AutoDraftService] ConsultationBooked errors:', res.errors);
          if (res.skipped.length) console.log('[AutoDraftService] ConsultationBooked skipped:', res.skipped);
          if (res.draftsCreated.length) console.log('[AutoDraftService] ConsultationBooked drafts:', res.draftsCreated.map((d) => d.draftCode));
        } catch (e: any) {
          console.error('[AutoDraftService] ConsultationBooked exception:', e);
        }
      }
    );

    DocumentEventBus.subscribe<ConsultationRescheduledPayload>(
      DOCUMENT_EVENT.INTAKE_CONSULTATION_RESCHEDULED,
      async (payload, context) => {
        try {
          const res = await AutoDraftService.handleConsultationRescheduled(payload, context.user, {
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
          });
          if (res.errors.length) console.error('[AutoDraftService] ConsultationRescheduled errors:', res.errors);
          if (res.skipped.length) console.log('[AutoDraftService] ConsultationRescheduled skipped:', res.skipped);
          if (res.draftsCreated.length) console.log('[AutoDraftService] ConsultationRescheduled drafts:', res.draftsCreated.map((d) => d.draftCode));
        } catch (e: any) {
          console.error('[AutoDraftService] ConsultationRescheduled exception:', e);
        }
      }
    );

    DocumentEventBus.subscribe<ProspectSavedPayload>(
      DOCUMENT_EVENT.INTAKE_PROSPECT_SAVED,
      async (payload, context) => {
        try {
          const res = await AutoDraftService.handleProspectSaved(payload, context.user, {
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
          });
          if (res.errors.length) console.error('[AutoDraftService] ProspectSaved errors:', res.errors);
          if (res.skipped.length) console.log('[AutoDraftService] ProspectSaved skipped:', res.skipped);
          if (res.draftsCreated.length) console.log('[AutoDraftService] ProspectSaved drafts:', res.draftsCreated.map((d) => d.draftCode));
        } catch (e: any) {
          console.error('[AutoDraftService] ProspectSaved exception:', e);
        }
      }
    );

    DocumentEventBus.subscribe<ConflictSearchCompletedPayload>(
      DOCUMENT_EVENT.INTAKE_CONFLICT_SEARCH_COMPLETED,
      async (payload, context) => {
        try {
          const res = await AutoDraftService.handleConflictSearchCompleted(payload, context.user, {
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
          });
          if (res.errors.length) console.error('[AutoDraftService] ConflictSearchCompleted errors:', res.errors);
          if (res.skipped.length) console.log('[AutoDraftService] ConflictSearchCompleted skipped:', res.skipped);
          if (res.draftsCreated.length) console.log('[AutoDraftService] ConflictSearchCompleted drafts:', res.draftsCreated.map((d) => d.draftCode));
        } catch (e: any) {
          console.error('[AutoDraftService] ConflictSearchCompleted exception:', e);
        }
      }
    );

    DocumentEventBus.subscribe<MatterCreatedFromIntakePayload>(
      DOCUMENT_EVENT.MATTER_CREATED_FROM_INTAKE,
      async (payload, context) => {
        try {
          const res = await AutoDraftService.handleMatterCreatedFromIntake(payload, context.user, {
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
          });
          if (res.errors.length) console.error('[AutoDraftService] MatterCreatedFromIntake errors:', res.errors);
          if (res.skipped.length) console.log('[AutoDraftService] MatterCreatedFromIntake skipped:', res.skipped);
          if (res.draftsCreated.length) console.log('[AutoDraftService] MatterCreatedFromIntake drafts:', res.draftsCreated.map((d) => d.draftCode));
        } catch (e: any) {
          console.error('[AutoDraftService] MatterCreatedFromIntake exception:', e);
        }
      }
    );

    DocumentEventBus.subscribe<EvictionClosureReviewedPayload>(
      DOCUMENT_EVENT.EVICTION_CLOSURE_REVIEWED,
      async (payload, context) => {
        try {
          const res = await AutoDraftService.handleEvictionClosureReviewed(payload, context.user, {
            ipAddress: context.ipAddress,
            userAgent: context.userAgent,
          });
          if (res.errors.length) console.error('[AutoDraftService] EvictionClosureReviewed errors:', res.errors);
          if (res.skipped.length) console.log('[AutoDraftService] EvictionClosureReviewed skipped:', res.skipped);
          if (res.draftsCreated.length) console.log('[AutoDraftService] EvictionClosureReviewed drafts:', res.draftsCreated.map((d) => d.draftCode));
        } catch (e: any) {
          console.error('[AutoDraftService] EvictionClosureReviewed exception:', e);
        }
      }
    );
  }

  /**
   * Helper: Resolves an active DocumentTemplate by prioritized codes or semantic search.
   */
  private static async findTemplate(
    preferredCodes: string[],
    keyword: string
  ): Promise<any | null> {
    // 1. Try exact code matches
    for (const code of preferredCodes) {
      const template = await prisma.documentTemplate.findFirst({
        where: {
          OR: [{ templateCode: code }, { templateCode: { contains: code } }],
          isActive: true,
        },
        include: {
          versions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { fieldMappings: true },
          },
        },
      });
      if (template && template.versions.length > 0) return template;
    }

    // 2. Fallback to keyword matching within category or templateName
    const fallback = await prisma.documentTemplate.findFirst({
      where: {
        isActive: true,
        OR: [
          { templateName: { contains: keyword } },
          { description: { contains: keyword } },
        ],
      },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { fieldMappings: true },
        },
      },
    });

    return fallback && fallback.versions.length > 0 ? fallback : null;
  }

  /**
   * Helper: Verifies that the matter exists and is within the Personal Injury practice area.
   */
  private static async verifyPIMatter(matterId: string, user: AuthenticatedUser): Promise<any> {
    try {
      const matter = await MatterService.getMatterByIdOrNumber(matterId, user);
      if (!matter) return null;

      const fullMatter = await prisma.matter.findFirst({
        where: { OR: [{ id: matterId }, { matterNumber: matterId }] },
        include: { practiceArea: true, client: true, responsibleAttorney: true },
      });

      return fullMatter;
    } catch {
      return null;
    }
  }

  /**
   * Helper: Automatically assigns an attorney review task upon auto-draft generation.
   * Ensures Utah RPC 1.1, 1.3 ethical diligence so no draft is issued unreviewed.
   * Enforces retry-safe idempotency so duplicate events do not create duplicate tasks.
   */
  public static async createDraftReviewTask(
    matter: any,
    draft: any,
    templateName: string,
    user: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<any> {
    try {
      // 1. Idempotency Check: Do not create duplicate open review task for the same draftCode
      const existingTask = await prisma.task.findFirst({
        where: {
          matterId: matter.id,
          status: { not: 'Completed' },
          OR: [
            { description: { contains: `[IDEMPOTENCY_KEY: DRAFT_REVIEW_${draft.draftCode}]` } },
            { description: { contains: draft.draftCode } },
            { title: `Review Document Draft: ${draft.title}` },
          ],
        },
      });

      if (existingTask) {
        return { task: existingTask, isDuplicate: true };
      }

      const assigneeId = matter.responsibleAttorneyId || user.id;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 2);

      const created = await TaskService.createTask(
        {
          matterId: matter.id,
          assignedToUserId: assigneeId,
          title: `Review Document Draft: ${draft.title}`,
          description: `Auto-generated draft '${draft.draftCode}' (${templateName}) requires attorney review and approval prior to transmission. [IDEMPOTENCY_KEY: DRAFT_REVIEW_${draft.draftCode}]`,
          dueDate: dueDate.toISOString().split('T')[0],
          priority: 'High',
          reminderSetting: '1 day prior',
        },
        {
          userId: user.id,
          userRole: user.role,
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        }
      );
      return { task: created, isDuplicate: false };
    } catch (err: any) {
      console.warn(`[AutoDraft] Could not create review task for draft ${draft.draftCode}:`, err.message);
      return null;
    }
  }

  /**
   * EVENT 1: PI Client & Accident Record Saved
   * Target Document: 096 ("Liability insurer letter of representation")
   */
  static async handleAccidentSaved(
    payload: AccidentSavedPayload,
    user: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<AutoDraftTriggerResult> {
    const result: AutoDraftTriggerResult = {
      success: true,
      event: DOCUMENT_EVENT.PI_ACCIDENT_SAVED,
      matterId: payload.matterId,
      draftsCreated: [],
      skipped: [],
      errors: [],
    };

    try {
      const matter = await this.verifyPIMatter(payload.matterId, user);
      if (!matter) {
        result.skipped.push({ reason: `Matter '${payload.matterId}' not found or access restricted.` });
        return result;
      }

      // Check practice area
      const isPI =
        matter.practiceArea?.code === 'PI' ||
        matter.practiceArea?.name?.toLowerCase().includes('personal injury') ||
        matter.title?.toLowerCase().includes('pi') ||
        matter.matterNumber?.startsWith('PI-');

      if (!isPI) {
        result.skipped.push({
          reason: `Matter '${matter.matterNumber}' practice area is '${matter.practiceArea?.name || 'General'}', not Personal Injury.`,
        });
        return result;
      }

      // Find template for Document 096
      const template = await this.findTemplate(
        ['UT-PI-REP-096', 'TPL-PI-096', 'UT-PI-096', '096'],
        'Representation'
      );

      if (!template) {
        result.skipped.push({
          templateCode: '096',
          reason: 'Template for Liability Insurer Letter of Representation (096) is unavailable or has no active version.',
        });
        return result;
      }

      // Idempotency check: Do not re-trigger representation letter if already created
      // Scoped to matterId + templateId + insuranceCompany to support multiple insurers per Matter
      const draftTitle = `Representation Letter - ${payload.insuranceCompany || 'Adverse Insurer'}`;
      const existingDraft = await prisma.documentDraft.findFirst({
        where: {
          matterId: matter.id,
          templateId: template.id,
          ...(payload.insuranceCompany
            ? { title: { contains: payload.insuranceCompany } }
            : {}),
        },
      });

      if (existingDraft) {
        result.skipped.push({
          templateCode: template.templateCode,
          reason: `Draft '${existingDraft.draftCode}' already exists for this matter and insurer '${payload.insuranceCompany || 'Adverse Insurer'}' (Idempotent trigger).`,
        });
        return result;
      }

      // Populate custom overrides from accident details
      const customOverrides: Record<string, any> = {
        accident_date: payload.incidentDate,
        incident_date: payload.incidentDate,
        accident_type: payload.accidentType,
        incident_location: payload.incidentLocation,
        police_agency: payload.policeAgency,
        report_number: payload.reportNumber,
        insurance_company: payload.insuranceCompany,
        claim_number: payload.claimNumber,
        adjuster_name: payload.adjusterName,
        event_notes: `Auto-generated on PI accident save event. Police Report: ${payload.reportNumber || 'Pending'}`,
        ...payload.customOverrides,
      };

      // Generate Draft (allowIncomplete: true ensures draft is saved even if some fields are missing)
      const draft = await DraftService.generateDraft(
        {
          matterId: matter.id,
          templateId: template.id,
          title: draftTitle,
          allowIncomplete: true,
          customOverrides,
        },
        user,
        context
      );

      result.draftsCreated.push({
        id: draft.id,
        draftCode: draft.draftCode,
        templateCode: template.templateCode,
        templateName: template.templateName,
        title: draft.title,
        missingFieldsCount: draft.missingFieldsFlags.length,
        filePath: draft.docxStorageKey || '',
      });

      // Assign attorney review task
      await this.createDraftReviewTask(matter, draft, template.templateName, user, context);

      await createAuditLog({
        userId: user.id,
        action: 'CREATE',
        resourceType: 'document_drafts',
        resourceId: draft.id,
        details: {
          event: DOCUMENT_EVENT.PI_ACCIDENT_SAVED,
          matterId: matter.id,
          draftCode: draft.draftCode,
          templateCode: template.templateCode,
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    } catch (err: any) {
      result.success = false;
      result.errors.push(err.message || String(err));
    }

    return result;
  }

  /**
   * EVENT 2: Treating Medical Provider Linked to PI Matter
   * Target Documents:
   *   - 113: "Medical Records Request Letter"
   *   - 112: "Medical Authorization Letter" (if requested or default)
   */
  static async handleProviderAdded(
    payload: ProviderAddedPayload,
    user: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<AutoDraftTriggerResult> {
    const result: AutoDraftTriggerResult = {
      success: true,
      event: DOCUMENT_EVENT.PI_PROVIDER_ADDED,
      matterId: payload.matterId,
      draftsCreated: [],
      skipped: [],
      errors: [],
    };

    try {
      const matter = await this.verifyPIMatter(payload.matterId, user);
      if (!matter) {
        result.skipped.push({ reason: `Matter '${payload.matterId}' not found or access restricted.` });
        return result;
      }

      // Check practice area
      const isPI =
        matter.practiceArea?.code === 'PI' ||
        matter.practiceArea?.name?.toLowerCase().includes('personal injury') ||
        matter.title?.toLowerCase().includes('pi') ||
        matter.matterNumber?.startsWith('PI-');

      if (!isPI) {
        result.skipped.push({
          reason: `Matter '${matter.matterNumber}' practice area is '${matter.practiceArea?.name || 'General'}', not Personal Injury.`,
        });
        return result;
      }

      // Document 113: Medical Records Request Letter
      if (payload.requestRecords !== false) {
        const template113 = await this.findTemplate(
          ['UT-PI-MED-113', 'TPL-PI-113', 'UT-PI-113', '113'],
          'Records Request'
        );

        if (!template113) {
          result.skipped.push({
            templateCode: '113',
            reason: 'Template for Medical Records Request (113) is unavailable or has no active version.',
          });
        } else {
          // Idempotency: check if request already exists for this provider
          const existingDraft113 = await prisma.documentDraft.findFirst({
            where: {
              matterId: matter.id,
              templateId: template113.id,
              title: { contains: payload.providerName },
            },
          });

          if (existingDraft113) {
            result.skipped.push({
              templateCode: template113.templateCode,
              reason: `Records request draft '${existingDraft113.draftCode}' already exists for '${payload.providerName}'.`,
            });
          } else {
            const draft113 = await DraftService.generateDraft(
              {
                matterId: matter.id,
                templateId: template113.id,
                title: `Medical Records Request - ${payload.providerName}`,
                allowIncomplete: true,
                customOverrides: {
                  provider_name: payload.providerName,
                  facility_address: payload.facilityAddress,
                  'MedicalProvider.Name': payload.providerName,
                  'MedicalProvider.name': payload.providerName,
                  'MedicalProvider.Address': payload.facilityAddress,
                  'MedicalProvider.address': payload.facilityAddress,
                  provider_phone: payload.phone,
                  provider_fax: payload.fax,
                  dates_of_service: payload.treatmentDates,
                  ...payload.customOverrides,
                },
              },
              user,
              context
            );

            result.draftsCreated.push({
              id: draft113.id,
              draftCode: draft113.draftCode,
              templateCode: template113.templateCode,
              templateName: template113.templateName,
              title: draft113.title,
              missingFieldsCount: draft113.missingFieldsFlags.length,
              filePath: draft113.docxStorageKey || '',
            });

            // Assign attorney review task
            await this.createDraftReviewTask(matter, draft113, template113.templateName, user, context);
          }
        }
      }

      // Document 112: Medical Authorization Letter
      if (payload.requestAuthorization !== false) {
        const template112 = await this.findTemplate(
          ['UT-PI-MED-112', 'TPL-PI-112', 'UT-PI-112', '112'],
          'Authorization'
        );

        if (!template112) {
          result.skipped.push({
            templateCode: '112',
            reason: 'Template for Medical Authorization (112) is unavailable or has no active version.',
          });
        } else {
          const existingDraft112 = await prisma.documentDraft.findFirst({
            where: {
              matterId: matter.id,
              templateId: template112.id,
              title: { contains: payload.providerName },
            },
          });

          if (existingDraft112) {
            result.skipped.push({
              templateCode: template112.templateCode,
              reason: `Medical authorization draft '${existingDraft112.draftCode}' already exists for '${payload.providerName}'.`,
            });
          } else {
            const draft112 = await DraftService.generateDraft(
              {
                matterId: matter.id,
                templateId: template112.id,
                title: `Medical Authorization - ${payload.providerName}`,
                allowIncomplete: true,
                customOverrides: {
                  provider_name: payload.providerName,
                  facility_address: payload.facilityAddress,
                  'MedicalProvider.Name': payload.providerName,
                  'MedicalProvider.name': payload.providerName,
                  'MedicalProvider.Address': payload.facilityAddress,
                  'MedicalProvider.address': payload.facilityAddress,
                  ...payload.customOverrides,
                },
              },
              user,
              context
            );

            result.draftsCreated.push({
              id: draft112.id,
              draftCode: draft112.draftCode,
              templateCode: template112.templateCode,
              templateName: template112.templateName,
              title: draft112.title,
              missingFieldsCount: draft112.missingFieldsFlags.length,
              filePath: draft112.docxStorageKey || '',
            });

            // Assign attorney review task
            await this.createDraftReviewTask(matter, draft112, template112.templateName, user, context);
          }
        }
      }
    } catch (err: any) {
      result.success = false;
      result.errors.push(err.message || String(err));
    }

    return result;
  }

  /**
   * EVENT 3: Received Medical Records Packet Marked Incomplete or Deficient
   * Target Document: 116 ("Incomplete medical records follow-up")
   * IMPORTANT CATALOG CORRECTION:
   * Client Catalog ID 115 is "Imaging and diagnostic study request".
   * Client Catalog ID 116 is "Incomplete medical records follow-up".
   * Never map ID 116 to template code 115.
   */
  static async handleMissingRecords(
    payload: MissingRecordsPayload,
    user: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<AutoDraftTriggerResult> {
    const result: AutoDraftTriggerResult = {
      success: true,
      event: DOCUMENT_EVENT.PI_MISSING_RECORDS,
      matterId: payload.matterId,
      draftsCreated: [],
      skipped: [],
      errors: [],
    };

    try {
      const matter = await this.verifyPIMatter(payload.matterId, user);
      if (!matter) {
        result.skipped.push({ reason: `Matter '${payload.matterId}' not found or access restricted.` });
        return result;
      }

      // Find template for Document 116 (Incomplete medical records follow-up)
      const template116 = await this.findTemplate(
        ['UT-PI-DEF-116', 'TPL-PI-116', 'UT-PI-116', '116'],
        'Incomplete'
      );

      if (!template116) {
        result.skipped.push({
          templateCode: '116',
          reason: 'Template for Incomplete Medical Records Follow-up (116) is unavailable or has no active version.',
        });
        return result;
      }

      // Idempotency check: Don't create duplicate follow-up letter for the same deficiency on the same day
      const deficiencyKey = payload.followUpNotes ? payload.followUpNotes.trim().slice(0, 30) : null;
      const today = new Date().toISOString().split('T')[0];
      const existingDraft116 = await prisma.documentDraft.findFirst({
        where: {
          matterId: matter.id,
          templateId: template116.id,
          AND: [
            { title: { contains: payload.providerName } },
            ...(deficiencyKey
              ? [{ title: { contains: deficiencyKey } }]
              : [{ createdAt: { gte: new Date(`${today}T00:00:00.000Z`) } }]),
          ],
        },
      });

      if (existingDraft116) {
        result.skipped.push({
          templateCode: template116.templateCode,
          reason: `Incomplete records follow-up draft '${existingDraft116.draftCode}' already exists for '${payload.providerName}' and this deficiency (Idempotent trigger).`,
        });
        return result;
      }

      const draftTitle = deficiencyKey
        ? `Incomplete Records Follow-up - ${payload.providerName} (${deficiencyKey})`
        : `Incomplete Records Follow-up - ${payload.providerName}`;

      const draft116 = await DraftService.generateDraft(
        {
          matterId: matter.id,
          templateId: template116.id,
          title: draftTitle,
          allowIncomplete: true,
          customOverrides: {
            provider_name: payload.providerName,
            initial_request_date: payload.requestDate,
            days_overdue: payload.daysOverdue || 30,
            missing_records_summary: (payload.outstandingRecords || []).join(', ') || 'All outstanding medical & billing records',
            follow_up_notes: payload.followUpNotes,
            ...payload.customOverrides,
          },
        },
        user,
        context
      );

      result.draftsCreated.push({
        id: draft116.id,
        draftCode: draft116.draftCode,
        templateCode: template116.templateCode,
        templateName: template116.templateName,
        title: draft116.title,
        missingFieldsCount: draft116.missingFieldsFlags.length,
        filePath: draft116.docxStorageKey || '',
      });

      // Assign attorney review task
      await this.createDraftReviewTask(matter, draft116, template116.templateName, user, context);
    } catch (err: any) {
      result.success = false;
      result.errors.push(err.message || String(err));
    }

    return result;
  }

  /**
   * EVENT 4: PI Demand Package / Demand Ready Event
   * Target Document: 140 ("Personal Injury Settlement Demand Letter")
   * Canonical Code: UT-PI-DEM-140 / PI-DOC-005
   * Idempotency Scoped: matterId + demandPackageId + templateCode (140)
   * Guaranteed concurrency serialization via inFlightOperations mutex.
   */
  static async handleDemandReady(
    payload: DemandReadyPayload,
    user: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<AutoDraftTriggerResult> {
    const idempotencyKey = `${payload.matterId}:${payload.demandPackageId || 'default'}:140`;

    // 1. Concurrency Check: If an identical generation is currently executing, attach to active promise
    if (this.inFlightOperations.has(idempotencyKey)) {
      return await this.inFlightOperations.get(idempotencyKey)!;
    }

    // 2. Wrap execution in active operation promise to serialize concurrent requests
    const executionPromise = (async () => {
      try {
        return await this.executeDemandReady(payload, user, context);
      } finally {
        this.inFlightOperations.delete(idempotencyKey);
      }
    })();

    this.inFlightOperations.set(idempotencyKey, executionPromise);
    return await executionPromise;
  }

  private static async executeDemandReady(
    payload: DemandReadyPayload,
    user: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<AutoDraftTriggerResult> {
    const result: AutoDraftTriggerResult = {
      success: true,
      event: DOCUMENT_EVENT.PI_DEMAND_READY,
      matterId: payload.matterId,
      draftsCreated: [],
      skipped: [],
      errors: [],
    };

    try {
      const matter = await this.verifyPIMatter(payload.matterId, user);
      if (!matter) {
        result.skipped.push({ reason: `Matter '${payload.matterId}' not found or access restricted.` });
        return result;
      }

      // Check practice area
      const isPI =
        matter.practiceArea?.code === 'PI' ||
        matter.practiceArea?.name?.toLowerCase().includes('personal injury') ||
        matter.title?.toLowerCase().includes('pi') ||
        matter.matterNumber?.startsWith('PI-');

      if (!isPI) {
        result.skipped.push({
          reason: `Matter '${matter.matterNumber}' practice area is '${matter.practiceArea?.name || 'General'}', not Personal Injury.`,
        });
        return result;
      }

      // Find template for Document 140 (Personal Injury Settlement Demand Letter)
      const template140 = await this.findTemplate(
        ['UT-PI-DEM-140', 'PI-DOC-005', 'TPL-PI-140', 'UT-PI-140', '140'],
        'Demand'
      );

      if (!template140) {
        result.skipped.push({
          templateCode: '140',
          reason: 'Template for Personal Injury Settlement Demand Letter (140) is unavailable or has no active version.',
        });
        return result;
      }

      // Database-backed idempotency check (Does NOT rely only on document titles)
      let existingDraft140: any = null;

      if (payload.demandPackageId) {
        // 1. Direct relational check via PIDemandPackage metadata
        try {
          const pkg = await (prisma as any).pIDemandPackage.findUnique({
            where: { id: payload.demandPackageId },
            select: { id: true, checklistState: true, draftDocumentId: true },
          });

          const linkedDraftId = pkg?.checklistState?.autoDraftId || pkg?.draftDocumentId;
          if (linkedDraftId) {
            existingDraft140 = await prisma.documentDraft.findUnique({
              where: { id: linkedDraftId },
            });
          }
        } catch {}
      }

      // 2. Scoped query fallback (matterId + templateId + demandPackageId)
      if (!existingDraft140) {
        existingDraft140 = await prisma.documentDraft.findFirst({
          where: {
            matterId: matter.id,
            templateId: template140.id,
            ...(payload.demandPackageId
              ? { title: { contains: payload.demandPackageId } }
              : { title: { contains: 'Settlement Demand' } }),
          },
        });
      }

      if (existingDraft140) {
        result.skipped.push({
          templateCode: template140.templateCode,
          reason: `Settlement demand draft '${existingDraft140.draftCode}' already exists for this demand package (Idempotent trigger).`,
        });
        return result;
      }

      // Populate custom overrides from demand payload
      const customOverrides: Record<string, any> = {
        demand_package_id: payload.demandPackageId,
        settlement_demand_id: payload.settlementDemandId,
        insurance_claim_id: payload.insuranceClaimId,
        demand_title: payload.demandTitle || 'Settlement Demand Letter',
        demand_amount: payload.demandAmount,
        policy_limit: payload.policyLimit,
        recipient_carrier: payload.recipientCarrier,
        claim_number: payload.claimNumber,
        deadline_date: payload.deadlineDate,
        total_specials: payload.totalSpecialDamages,
        total_generals: payload.totalGeneralDamages,
        ...payload.customOverrides,
      };

      const draftTitle = payload.demandPackageId
        ? `${payload.demandTitle || 'Settlement Demand Letter'} - [Pkg: ${payload.demandPackageId}]`
        : payload.demandTitle
        ? payload.demandTitle
        : `Settlement Demand Letter - ${payload.recipientCarrier || 'Adverse Carrier'}`;

      const draft140 = await DraftService.generateDraft(
        {
          matterId: matter.id,
          templateId: template140.id,
          title: draftTitle,
          allowIncomplete: true,
          customOverrides,
        },
        user,
        context
      );

      result.draftsCreated.push({
        id: draft140.id,
        draftCode: draft140.draftCode,
        templateCode: template140.templateCode,
        templateName: template140.templateName,
        title: draft140.title,
        missingFieldsCount: draft140.missingFieldsFlags.length,
        filePath: draft140.docxStorageKey || '',
      });

      // Link the generated draft directly to the PIDemandPackage record in database
      if (payload.demandPackageId) {
        try {
          const currentPkg = await (prisma as any).pIDemandPackage.findUnique({
            where: { id: payload.demandPackageId },
          });
          const currentState = (currentPkg?.checklistState as Record<string, any>) || {};

          await (prisma as any).pIDemandPackage.update({
            where: { id: payload.demandPackageId },
            data: {
              checklistState: {
                ...currentState,
                autoDraftId: draft140.id,
                autoDraftCode: draft140.draftCode,
                generatedAt: new Date().toISOString(),
              },
            },
          });
        } catch (dbErr: any) {
          console.warn('[AutoDraft] Could not link draft to demandPackage checklistState:', dbErr.message);
        }
      }

      // Assign attorney review task
      await this.createDraftReviewTask(matter, draft140, template140.templateName, user, context);

      // Create dedicated demand review task for responsible attorney (Sub-Stage E)
      if (payload.demandPackageId) {
        try {
          const pkg = await (prisma as any).pIDemandPackage.findUnique({
            where: { id: payload.demandPackageId },
          });
          if (pkg) {
            await PIWorkflowAutomationService.onDemandDraftReady(matter, pkg, user, context);
          }
        } catch (demandTaskErr: any) {
          console.warn('[AutoDraft] Could not create demand review task:', demandTaskErr.message);
        }
      }

      await createAuditLog({
        userId: user.id,
        action: 'CREATE',
        resourceType: 'document_drafts',
        resourceId: draft140.id,
        details: {
          event: DOCUMENT_EVENT.PI_DEMAND_READY,
          matterId: matter.id,
          draftCode: draft140.draftCode,
          templateCode: template140.templateCode,
          demandPackageId: payload.demandPackageId,
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      });
    } catch (err: any) {
      result.success = false;
      result.errors.push(err.message || String(err));
    }

    return result;
  }

  /**
   * EVENT: Consultation Booked (CAT-001)
   */
  static async handleConsultationBooked(
    payload: ConsultationBookedPayload,
    user: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<AutoDraftTriggerResult> {
    const result: AutoDraftTriggerResult = {
      success: true,
      event: DOCUMENT_EVENT.INTAKE_CONSULTATION_BOOKED,
      matterId: payload.matterId || payload.intakeId,
      draftsCreated: [],
      skipped: [],
      errors: [],
    };

    const inFlightKey = `consultation:${payload.intakeId}:${payload.consultationDate}`;
    if (this.inFlightOperations.has(inFlightKey)) {
      return await this.inFlightOperations.get(inFlightKey)!;
    }

    const operation = (async () => {
      try {
        const matter = await this.resolveMatterForIntake(payload, user);
        if (!matter) {
          result.skipped.push({ reason: `No matter context available for intake '${payload.intakeId}'.` });
          return result;
        }

        const template = await this.findTemplate(['CAT-001', '001'], 'consultation confirmation');
        if (!template) {
          result.skipped.push({ templateCode: 'CAT-001', reason: 'Template CAT-001 is unavailable.' });
          return result;
        }

        // Idempotency check: Do not create duplicate draft for same consultation date
        const existingDraft = await prisma.documentDraft.findFirst({
          where: {
            matterId: matter.id,
            templateId: template.id,
            status: { not: 'Archived' },
            title: { contains: payload.consultationDate },
          },
        });
        if (existingDraft) {
          result.skipped.push({
            templateCode: template.templateCode,
            reason: `Consultation confirmation draft '${existingDraft.draftCode}' already exists for date '${payload.consultationDate}' (Idempotent trigger).`,
          });
          return result;
        }

        const clientName = payload.prospectiveClient || matter.client?.name || 'Prospective Client';
        const draftTitle = `Consultation confirmation - ${clientName} (${payload.consultationDate})`;

        const customOverrides = {
          client_name: clientName,
          consultation_date: payload.consultationDate,
          consultation_time: payload.consultationTime || '10:00 AM MST',
          consultation_location: payload.location || 'Heugly & Bludworth Law Offices, Salt Lake City, UT',
          attorney_name: payload.attorneyName || matter.responsibleAttorney?.name || 'Responsible Counsel',
          preparation_instructions: payload.preparationInstructions || 'Please bring government-issued photo ID and all documents relating to your inquiry.',
          ...payload.customOverrides,
        };

        const draft = await DraftService.generateDraft(
          {
            matterId: matter.id,
            templateId: template.id,
            title: draftTitle,
            allowIncomplete: true,
            customOverrides,
          },
          user,
          context
        );

        result.draftsCreated.push({
          id: draft.id,
          draftCode: draft.draftCode,
          templateCode: template.templateCode,
          templateName: template.templateName,
          title: draft.title,
          missingFieldsCount: draft.missingFieldsFlags.length,
          filePath: draft.docxStorageKey || '',
        });

        await this.createDraftReviewTask(matter, draft, template.templateName, user, context);

        await createAuditLog({
          userId: user.id,
          action: 'CREATE',
          resourceType: 'document_drafts',
          resourceId: draft.id,
          details: {
            event: DOCUMENT_EVENT.INTAKE_CONSULTATION_BOOKED,
            matterId: matter.id,
            intakeId: payload.intakeId,
            draftCode: draft.draftCode,
            templateCode: template.templateCode,
          },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
      } catch (err: any) {
        result.success = false;
        result.errors.push(err.message || String(err));
      }
      return result;
    })();

    this.inFlightOperations.set(inFlightKey, operation);
    try {
      return await operation;
    } finally {
      this.inFlightOperations.delete(inFlightKey);
    }
  }

  /**
   * EVENT: Consultation Rescheduled (CAT-001 explicitly approved rule)
   * Preserves previous draft, marks superseded/archived, generates new linked draft.
   */
  static async handleConsultationRescheduled(
    payload: ConsultationRescheduledPayload,
    user: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<AutoDraftTriggerResult> {
    const result: AutoDraftTriggerResult = {
      success: true,
      event: DOCUMENT_EVENT.INTAKE_CONSULTATION_RESCHEDULED,
      matterId: payload.matterId || payload.intakeId,
      draftsCreated: [],
      skipped: [],
      errors: [],
    };

    const inFlightKey = `reschedule:${payload.intakeId}:${payload.consultationDate}`;
    if (this.inFlightOperations.has(inFlightKey)) {
      return await this.inFlightOperations.get(inFlightKey)!;
    }

    const operation = (async () => {
      try {
        const matter = await this.resolveMatterForIntake(payload, user);
        if (!matter) {
          result.skipped.push({ reason: `No matter context available for intake '${payload.intakeId}'.` });
          return result;
        }

        const template = await this.findTemplate(['CAT-001', '001'], 'consultation confirmation');
        if (!template) {
          result.skipped.push({ templateCode: 'CAT-001', reason: 'Template CAT-001 is unavailable.' });
          return result;
        }

        const clientName = payload.prospectiveClient || matter.client?.name || 'Prospective Client';
        const newDraftTitle = `Rescheduled Consultation Confirmation - ${clientName} (${payload.consultationDate})`;

        // Idempotency: Prevent duplicate rescheduled draft for identical new date
        const existingNewDraft = await prisma.documentDraft.findFirst({
          where: {
            matterId: matter.id,
            templateId: template.id,
            title: newDraftTitle,
            status: { not: 'Archived' },
          },
        });
        if (existingNewDraft) {
          result.skipped.push({
            templateCode: template.templateCode,
            reason: `Rescheduled consultation confirmation '${existingNewDraft.draftCode}' already exists for date '${payload.consultationDate}' (Idempotent trigger).`,
          });
          return result;
        }

        // 1. Locate previous active draft(s)
        const priorDrafts = await prisma.documentDraft.findMany({
          where: {
            matterId: matter.id,
            templateId: template.id,
            status: { in: ['Draft', 'Under Review', 'Approved'] },
          },
          orderBy: { createdAt: 'desc' },
        });

        // 2. Mark prior draft as Archived without deleting or overwriting
        let supersededRef = '';
        if (priorDrafts.length > 0) {
          const prior = priorDrafts[0];
          supersededRef = prior.draftCode;
          await prisma.documentDraft.update({
            where: { id: prior.id },
            data: {
              status: 'Archived',
            },
          });
        }

        // 3. Generate New Linked Draft
        const customOverrides = {
          client_name: clientName,
          consultation_date: payload.consultationDate,
          consultation_time: payload.consultationTime || '10:00 AM MST',
          consultation_location: payload.location || 'Heugly & Bludworth Law Offices, Salt Lake City, UT',
          attorney_name: payload.attorneyName || matter.responsibleAttorney?.name || 'Responsible Counsel',
          is_rescheduled: true,
          superseded_draft_code: supersededRef || 'Initial Draft',
          reschedule_reason: payload.rescheduleReason || 'Client requested scheduling adjustment.',
          ...payload.customOverrides,
        };

        const draft = await DraftService.generateDraft(
          {
            matterId: matter.id,
            templateId: template.id,
            title: newDraftTitle,
            allowIncomplete: true,
            customOverrides,
          },
          user,
          context
        );

        result.draftsCreated.push({
          id: draft.id,
          draftCode: draft.draftCode,
          templateCode: template.templateCode,
          templateName: template.templateName,
          title: draft.title,
          missingFieldsCount: draft.missingFieldsFlags.length,
          filePath: draft.docxStorageKey || '',
        });

        await this.createDraftReviewTask(matter, draft, `Rescheduled: ${template.templateName}`, user, context);

        await createAuditLog({
          userId: user.id,
          action: 'CREATE',
          resourceType: 'document_drafts',
          resourceId: draft.id,
          details: {
            event: DOCUMENT_EVENT.INTAKE_CONSULTATION_RESCHEDULED,
            matterId: matter.id,
            intakeId: payload.intakeId,
            draftCode: draft.draftCode,
            supersededDraftCode: supersededRef,
            newDate: payload.consultationDate,
          },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
      } catch (err: any) {
        result.success = false;
        result.errors.push(err.message || String(err));
      }
      return result;
    })();

    this.inFlightOperations.set(inFlightKey, operation);
    try {
      return await operation;
    } finally {
      this.inFlightOperations.delete(inFlightKey);
    }
  }

  /**
   * EVENT: Prospective Client Saved (CAT-002)
   * Segregates practice area subtypes (Family, PI, Estate).
   */
  static async handleProspectSaved(
    payload: ProspectSavedPayload,
    user: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<AutoDraftTriggerResult> {
    const result: AutoDraftTriggerResult = {
      success: true,
      event: DOCUMENT_EVENT.INTAKE_PROSPECT_SAVED,
      matterId: payload.matterId || payload.intakeId,
      draftsCreated: [],
      skipped: [],
      errors: [],
    };

    const inFlightKey = `prospect:${payload.intakeId}`;
    if (this.inFlightOperations.has(inFlightKey)) {
      return await this.inFlightOperations.get(inFlightKey)!;
    }

    const operation = (async () => {
      try {
        const matter = await this.resolveMatterForIntake(payload, user);
        if (!matter) {
          result.skipped.push({ reason: `No matter context available for intake '${payload.intakeId}'.` });
          return result;
        }

        const template = await this.findTemplate(['CAT-002', '002'], 'prospective client questionnaire');
        if (!template) {
          result.skipped.push({ templateCode: 'CAT-002', reason: 'Template CAT-002 is unavailable.' });
          return result;
        }

        // Idempotency: Do not duplicate questionnaire for same intake
        const existingDraft = await prisma.documentDraft.findFirst({
          where: {
            matterId: matter.id,
            templateId: template.id,
            status: { not: 'Archived' },
          },
        });
        if (existingDraft) {
          result.skipped.push({
            templateCode: template.templateCode,
            reason: `Questionnaire draft '${existingDraft.draftCode}' already exists for this prospect (Idempotent trigger).`,
          });
          return result;
        }

        const clientName = payload.prospectiveClient || matter.client?.name || 'Prospect';
        const paId = (payload.practiceAreaId || matter.practiceAreaId || '').toLowerCase();

        let subtypeLabel = 'General Legal';
        const conditionalFlags: Record<string, boolean> = {
          is_family_law: false,
          is_personal_injury: false,
          is_estate_probate: false,
        };

        if (paId.includes('fam')) {
          subtypeLabel = 'Family Law';
          conditionalFlags.is_family_law = true;
        } else if (paId.includes('pi') || paId.includes('injury')) {
          subtypeLabel = 'Personal Injury';
          conditionalFlags.is_personal_injury = true;
        } else if (paId.includes('prob') || paId.includes('estate') || paId.includes('trust')) {
          subtypeLabel = 'Estate & Probate';
          conditionalFlags.is_estate_probate = true;
        }

        const draftTitle = `Prospective Client Questionnaire - ${subtypeLabel} (${clientName})`;

        const customOverrides = {
          client_name: clientName,
          practice_subtype: subtypeLabel,
          matter_summary: payload.matterSummary || matter.title || 'Prospective Inquiry',
          ...conditionalFlags,
          ...payload.customOverrides,
        };

        const draft = await DraftService.generateDraft(
          {
            matterId: matter.id,
            templateId: template.id,
            title: draftTitle,
            allowIncomplete: true,
            customOverrides,
          },
          user,
          context
        );

        result.draftsCreated.push({
          id: draft.id,
          draftCode: draft.draftCode,
          templateCode: template.templateCode,
          templateName: template.templateName,
          title: draft.title,
          missingFieldsCount: draft.missingFieldsFlags.length,
          filePath: draft.docxStorageKey || '',
        });

        await this.createDraftReviewTask(matter, draft, template.templateName, user, context);

        await createAuditLog({
          userId: user.id,
          action: 'CREATE',
          resourceType: 'document_drafts',
          resourceId: draft.id,
          details: {
            event: DOCUMENT_EVENT.INTAKE_PROSPECT_SAVED,
            matterId: matter.id,
            intakeId: payload.intakeId,
            subtype: subtypeLabel,
            draftCode: draft.draftCode,
          },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
      } catch (err: any) {
        result.success = false;
        result.errors.push(err.message || String(err));
      }
      return result;
    })();

    this.inFlightOperations.set(inFlightKey, operation);
    try {
      return await operation;
    } finally {
      this.inFlightOperations.delete(inFlightKey);
    }
  }

  /**
   * EVENT: Conflict Search Completed (CAT-003)
   * Mandatory Safety: Never auto-clear pending/flagged conflicts; status must remain Under Review.
   */
  static async handleConflictSearchCompleted(
    payload: ConflictSearchCompletedPayload,
    user: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<AutoDraftTriggerResult> {
    const result: AutoDraftTriggerResult = {
      success: true,
      event: DOCUMENT_EVENT.INTAKE_CONFLICT_SEARCH_COMPLETED,
      matterId: payload.matterId || payload.intakeId,
      draftsCreated: [],
      skipped: [],
      errors: [],
    };

    const inFlightKey = `conflict:${payload.intakeId}`;
    if (this.inFlightOperations.has(inFlightKey)) {
      return await this.inFlightOperations.get(inFlightKey)!;
    }

    const operation = (async () => {
      try {
        const matter = await this.resolveMatterForIntake(payload, user);
        if (!matter) {
          result.skipped.push({ reason: `No matter context available for intake '${payload.intakeId}'.` });
          return result;
        }

        const template = await this.findTemplate(['CAT-003', '003'], 'conflict search report');
        if (!template) {
          result.skipped.push({ templateCode: 'CAT-003', reason: 'Template CAT-003 is unavailable.' });
          return result;
        }

        // Idempotency: Do not duplicate conflict report for same search
        const existingDraft = await prisma.documentDraft.findFirst({
          where: {
            matterId: matter.id,
            templateId: template.id,
            status: { in: ['Draft', 'Under Review'] },
          },
        });
        if (existingDraft) {
          result.skipped.push({
            templateCode: template.templateCode,
            reason: `Conflict report '${existingDraft.draftCode}' already active for this matter (Idempotent trigger).`,
          });
          return result;
        }

        const clientName = payload.prospectiveClient || matter.client?.name || 'Subject Party';
        const hasUnresolved =
          payload.hasConflicts === true ||
          payload.conflictStatus !== 'Cleared' ||
          (payload.matches && payload.matches.some((m) => m.status === 'FLAGGED' || m.status === 'PENDING' || m.entityType === 'ADVERSE_PARTY'));

        const draftTitle = hasUnresolved
          ? `Conflict Search Report (FLAGGED) - ${clientName}`
          : `Conflict Search Report (CLEARED) - ${clientName}`;

        const missingFieldsFlags: any[] = [];
        if (hasUnresolved) {
          missingFieldsFlags.push({
            type: 'CONFLICT_ALERT',
            status: 'FLAGGED_CONFLICT',
            details: 'Unresolved conflict or pending attorney review. Auto-clearance prohibited under Utah RPC 1.7.',
            matches: payload.matches,
          });
        }

        const customOverrides = {
          client_name: clientName,
          queried_terms: (payload.queriedTerms || []).join(', '),
          conflict_status: hasUnresolved ? 'FLAGGED / UNDER REVIEW' : 'CLEARED',
          unresolved_conflict: hasUnresolved,
          ...payload.customOverrides,
        };

        const draft = await DraftService.generateDraft(
          {
            matterId: matter.id,
            templateId: template.id,
            title: draftTitle,
            allowIncomplete: true,
            customOverrides,
          },
          user,
          context
        );

        // Ensure status reflects Under Review when unresolved
        if (hasUnresolved) {
          await prisma.documentDraft.update({
            where: { id: draft.id },
            data: {
              status: 'Under Review',
              missingFieldsFlags,
            },
          });
        }

        result.draftsCreated.push({
          id: draft.id,
          draftCode: draft.draftCode,
          templateCode: template.templateCode,
          templateName: template.templateName,
          title: draftTitle,
          missingFieldsCount: missingFieldsFlags.length,
          filePath: draft.docxStorageKey || '',
        });

        await this.createDraftReviewTask(matter, draft, `Compliance Review: ${template.templateName}`, user, context);

        await createAuditLog({
          userId: user.id,
          action: 'CREATE',
          resourceType: 'document_drafts',
          resourceId: draft.id,
          details: {
            event: DOCUMENT_EVENT.INTAKE_CONFLICT_SEARCH_COMPLETED,
            matterId: matter.id,
            intakeId: payload.intakeId,
            hasUnresolved,
            draftCode: draft.draftCode,
          },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
      } catch (err: any) {
        result.success = false;
        result.errors.push(err.message || String(err));
      }
      return result;
    })();

    this.inFlightOperations.set(inFlightKey, operation);
    try {
      return await operation;
    } finally {
      this.inFlightOperations.delete(inFlightKey);
    }
  }

  /**
   * EVENT: Matter Created From Intake (CAT-010)
   * Dispatches welcome letter on successful matter conversion.
   */
  static async handleMatterCreatedFromIntake(
    payload: MatterCreatedFromIntakePayload,
    user: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<AutoDraftTriggerResult> {
    const result: AutoDraftTriggerResult = {
      success: true,
      event: DOCUMENT_EVENT.MATTER_CREATED_FROM_INTAKE,
      matterId: payload.matterId,
      draftsCreated: [],
      skipped: [],
      errors: [],
    };

    const inFlightKey = `matter_convert:${payload.matterId}`;
    if (this.inFlightOperations.has(inFlightKey)) {
      return await this.inFlightOperations.get(inFlightKey)!;
    }

    const operation = (async () => {
      try {
        const matter = await prisma.matter.findUnique({
          where: { id: payload.matterId },
          include: { client: true, responsibleAttorney: true },
        });
        if (!matter) {
          result.skipped.push({ reason: `Matter '${payload.matterId}' not found.` });
          return result;
        }

        const template = await this.findTemplate(['CAT-010', '010'], 'welcome letter');
        if (!template) {
          result.skipped.push({ templateCode: 'CAT-010', reason: 'Template CAT-010 is unavailable.' });
          return result;
        }

        // Idempotency: Prevent duplicate welcome letter for same converted matter
        const existingDraft = await prisma.documentDraft.findFirst({
          where: {
            matterId: matter.id,
            templateId: template.id,
            status: { not: 'Archived' },
          },
        });
        if (existingDraft) {
          result.skipped.push({
            templateCode: template.templateCode,
            reason: `Welcome letter draft '${existingDraft.draftCode}' already exists for matter '${matter.matterNumber}' (Idempotent trigger).`,
          });
          return result;
        }

        const draftTitle = `Welcome letter and next steps - ${matter.title}`;

        const customOverrides = {
          intake_number: payload.intakeNumber,
          client_name: payload.clientName || matter.client?.name,
          matter_number: payload.matterNumber || matter.matterNumber,
          matter_title: payload.matterTitle || matter.title,
          ...payload.customOverrides,
        };

        const draft = await DraftService.generateDraft(
          {
            matterId: matter.id,
            templateId: template.id,
            title: draftTitle,
            allowIncomplete: true,
            customOverrides,
          },
          user,
          context
        );

        result.draftsCreated.push({
          id: draft.id,
          draftCode: draft.draftCode,
          templateCode: template.templateCode,
          templateName: template.templateName,
          title: draft.title,
          missingFieldsCount: draft.missingFieldsFlags.length,
          filePath: draft.docxStorageKey || '',
        });

        await this.createDraftReviewTask(matter, draft, template.templateName, user, context);

        await createAuditLog({
          userId: user.id,
          action: 'CREATE',
          resourceType: 'document_drafts',
          resourceId: draft.id,
          details: {
            event: DOCUMENT_EVENT.MATTER_CREATED_FROM_INTAKE,
            matterId: matter.id,
            intakeId: payload.intakeId,
            draftCode: draft.draftCode,
          },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
      } catch (err: any) {
        result.success = false;
        result.errors.push(err.message || String(err));
      }
      return result;
    })();

    this.inFlightOperations.set(inFlightKey, operation);
    try {
      return await operation;
    } finally {
      this.inFlightOperations.delete(inFlightKey);
    }
  }

  /**
   * EVENT: Eviction Closure Reviewed (CAT-300)
   * Mandatory Financial Safeguard: Full satisfaction ONLY if balance=0. Partial balance preserved and release withheld.
   */
  static async handleEvictionClosureReviewed(
    payload: EvictionClosureReviewedPayload,
    user: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<AutoDraftTriggerResult> {
    const result: AutoDraftTriggerResult = {
      success: true,
      event: DOCUMENT_EVENT.EVICTION_CLOSURE_REVIEWED,
      matterId: payload.matterId,
      draftsCreated: [],
      skipped: [],
      errors: [],
    };

    const inFlightKey = `eviction_close:${payload.matterId}`;
    if (this.inFlightOperations.has(inFlightKey)) {
      return await this.inFlightOperations.get(inFlightKey)!;
    }

    const operation = (async () => {
      try {
        const matter = await prisma.matter.findUnique({
          where: { id: payload.matterId },
          include: { client: true, responsibleAttorney: true, evictionsCase: true },
        });
        if (!matter) {
          result.skipped.push({ reason: `Matter '${payload.matterId}' not found.` });
          return result;
        }

        const template = await this.findTemplate(['CAT-300', '300'], 'eviction judgment payment and closure letter');
        if (!template) {
          result.skipped.push({ templateCode: 'CAT-300', reason: 'Template CAT-300 is unavailable.' });
          return result;
        }

        // Idempotency: Prevent duplicate closure letter for this eviction case
        const existingDraft = await prisma.documentDraft.findFirst({
          where: {
            matterId: matter.id,
            templateId: template.id,
            status: { in: ['Draft', 'Under Review'] },
          },
        });
        if (existingDraft) {
          result.skipped.push({
            templateCode: template.templateCode,
            reason: `Eviction closure letter draft '${existingDraft.draftCode}' already active for matter '${matter.matterNumber}' (Idempotent trigger).`,
          });
          return result;
        }

        const bal = Number(payload.outstandingBalance || 0);
        const isFull = bal === 0;

        const draftTitle = isFull
          ? `Eviction Closure Letter - Full Satisfaction ($${Number(payload.totalCollected || 0).toFixed(2)})`
          : `Eviction Closure Letter - Partial Payment (Remaining Balance: $${bal.toFixed(2)})`;

        const customOverrides = {
          tenant_name: payload.tenantName || matter.evictionsCase?.tenantName || 'Tenant',
          landlord_name: payload.landlordName || matter.client?.name || 'Landlord',
          property_address: payload.propertyAddress || matter.evictionsCase?.propertyAddress || 'Subject Premises',
          judgment_amount: Number(payload.judgmentAmount || 0),
          total_collected: Number(payload.totalCollected || 0),
          outstanding_balance: bal,
          is_full_satisfaction: isFull,
          satisfaction_declared: isFull,
          release_authorized: isFull,
          closure_review_notes: payload.closureReviewNotes || '',
          ...payload.customOverrides,
        };

        const draft = await DraftService.generateDraft(
          {
            matterId: matter.id,
            templateId: template.id,
            title: draftTitle,
            allowIncomplete: true,
            customOverrides,
          },
          user,
          context
        );

        if (!isFull) {
          // Explicitly set to Under Review with withholding flag
          await prisma.documentDraft.update({
            where: { id: draft.id },
            data: {
              status: 'Under Review',
              missingFieldsFlags: [
                {
                  type: 'FINANCIAL_SAFEGUARD',
                  balanceStatus: 'UNSATISFIED_BALANCE',
                  remainingBalance: bal,
                  details: `Partial payment of $${Number(payload.totalCollected || 0).toFixed(2)} received against judgment $${Number(payload.judgmentAmount || 0).toFixed(2)}. Full satisfaction withheld. Remaining balance: $${bal.toFixed(2)}.`,
                },
              ],
            },
          });
        }

        result.draftsCreated.push({
          id: draft.id,
          draftCode: draft.draftCode,
          templateCode: template.templateCode,
          templateName: template.templateName,
          title: draftTitle,
          missingFieldsCount: isFull ? 0 : 1,
          filePath: draft.docxStorageKey || '',
        });

        await this.createDraftReviewTask(matter, draft, template.templateName, user, context);

        await createAuditLog({
          userId: user.id,
          action: 'CREATE',
          resourceType: 'document_drafts',
          resourceId: draft.id,
          details: {
            event: DOCUMENT_EVENT.EVICTION_CLOSURE_REVIEWED,
            matterId: matter.id,
            isFullSatisfaction: isFull,
            outstandingBalance: bal,
            draftCode: draft.draftCode,
          },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
      } catch (err: any) {
        result.success = false;
        result.errors.push(err.message || String(err));
      }
      return result;
    })();

    this.inFlightOperations.set(inFlightKey, operation);
    try {
      return await operation;
    } finally {
      this.inFlightOperations.delete(inFlightKey);
    }
  }

  /**
   * Helper: Resolves or provisions an intake-stage matter and client so that drafts
   * satisfy database foreign key requirements before formal intake conversion.
   */
  private static async resolveMatterForIntake(
    payload: { matterId?: string; clientId?: string; intakeId?: string; prospectiveClient?: string },
    user: AuthenticatedUser
  ): Promise<any | null> {
    if (payload.matterId) {
      const matter = await prisma.matter.findFirst({
        where: { OR: [{ id: payload.matterId }, { matterNumber: payload.matterId }] },
        include: { client: true, responsibleAttorney: true },
      });
      if (matter) return matter;
    }

    if (payload.intakeId) {
      const intake = await prisma.intake.findUnique({
        where: { id: payload.intakeId },
        include: {
          convertedMatter: { include: { client: true, responsibleAttorney: true } },
          convertedClient: true,
        },
      });

      if (intake?.convertedMatter) {
        return intake.convertedMatter;
      }

      if (intake) {
        // Check if an intake-phase matter already exists for this intakeNumber
        const intakeMatterNumber = `INTAKE-${intake.intakeNumber}`;
        const existingIntakeMatter = await prisma.matter.findFirst({
          where: { matterNumber: intakeMatterNumber },
          include: { client: true, responsibleAttorney: true },
        });
        if (existingIntakeMatter) return existingIntakeMatter;

        // Provision lightweight client & matter for pre-conversion intake drafts
        let client = intake.convertedClient;
        if (!client) {
          const clientNumber = `CLT-INT-${intake.intakeNumber}`;
          client = await prisma.client.findFirst({ where: { clientNumber } });
          if (!client) {
            client = await prisma.client.create({
              data: {
                clientNumber,
                name: intake.prospectiveClient || 'Prospective Client',
                email: intake.email || `${intake.intakeNumber.toLowerCase()}@intake.test`,
                phone: intake.phone || '(801) 555-0100',
                clientType: 'Individual',
                status: 'Active',
              },
            });
          }
        }

        const activeAttorney = await prisma.user.findFirst({
          where: { role: { in: ['attorney', 'super_admin'] }, status: 'Active' },
          orderBy: { createdAt: 'asc' },
        });

        let newMatter: any;
        try {
          newMatter = await prisma.matter.create({
            data: {
              matterNumber: intakeMatterNumber,
              title: `${intake.prospectiveClient} - Intake Inquiry`,
              clientId: client.id,
              practiceAreaId: intake.practiceAreaId || 'pa-civ',
              responsibleAttorneyId: activeAttorney?.id || user.id,
              billingType: 'Hourly',
              openDate: new Date(),
              status: 'Intake',
            },
            include: { client: true, responsibleAttorney: true },
          });
        } catch (mErr: any) {
          if (mErr.code === 'P2002') {
            newMatter = await prisma.matter.findFirst({
              where: { matterNumber: intakeMatterNumber },
              include: { client: true, responsibleAttorney: true },
            });
          } else {
            throw mErr;
          }
        }

        return newMatter;
      }
    }

    return null;
  }
}
