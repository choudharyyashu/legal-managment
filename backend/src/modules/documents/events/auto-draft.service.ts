/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Auto Draft Trigger Service (Phase 4)
 * Orchestrates event-driven legal document generation across Personal Injury workflows.
 */

import { prisma } from '../../../config/database.js';
import { createAuditLog } from '../../../utils/auditLogger.js';
import { MatterService } from '../../matters/matter.service.js';
import { AuthenticatedUser } from '../../auth/auth.types.js';
import { DraftService } from '../drafts/draft.service.js';
import {
  DOCUMENT_EVENT,
  DocumentEventType,
  AccidentSavedPayload,
  ProviderAddedPayload,
  MissingRecordsPayload,
  AutoDraftTriggerResult,
} from './event.types.js';
import { DocumentEventBus, DomainEventContext } from './event-bus.js';

export class AutoDraftService {
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
        include: { practiceArea: true, client: true },
      });

      return fullMatter;
    } catch {
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
      const existingDraft = await prisma.documentDraft.findFirst({
        where: {
          matterId: matter.id,
          templateId: template.id,
        },
      });

      if (existingDraft) {
        result.skipped.push({
          templateCode: template.templateCode,
          reason: `Draft '${existingDraft.draftCode}' already exists for this matter (Idempotent trigger).`,
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
          title: `Representation Letter - ${payload.insuranceCompany || 'Adverse Insurer'}`,
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
   * EVENT 3: Missing Medical Records Flagged / Overdue
   * Target Document: 115 ("Records deficiency follow-up letter")
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

      // Find template for Document 115
      const template115 = await this.findTemplate(
        ['UT-PI-DEF-115', 'TPL-PI-115', 'UT-PI-115', '115'],
        'Deficiency'
      );

      if (!template115) {
        result.skipped.push({
          templateCode: '115',
          reason: 'Template for Records Deficiency Follow-up Letter (115) is unavailable or has no active version.',
        });
        return result;
      }

      // Idempotency check: Don't create duplicate deficiency letter on same day for provider
      const today = new Date().toISOString().split('T')[0];
      const existingDraft115 = await prisma.documentDraft.findFirst({
        where: {
          matterId: matter.id,
          templateId: template115.id,
          title: { contains: payload.providerName },
          createdAt: { gte: new Date(`${today}T00:00:00.000Z`) },
        },
      });

      if (existingDraft115) {
        result.skipped.push({
          templateCode: template115.templateCode,
          reason: `Deficiency follow-up draft '${existingDraft115.draftCode}' was already generated today for '${payload.providerName}'.`,
        });
        return result;
      }

      const draft115 = await DraftService.generateDraft(
        {
          matterId: matter.id,
          templateId: template115.id,
          title: `Records Deficiency Follow-up - ${payload.providerName}`,
          allowIncomplete: true,
          customOverrides: {
            provider_name: payload.providerName,
            initial_request_date: payload.requestDate,
            days_overdue: payload.daysOverdue || 30,
            missing_records_summary: (payload.outstandingRecords || []).join(', ') || 'All outstanding medical & billing records',
            ...payload.customOverrides,
          },
        },
        user,
        context
      );

      result.draftsCreated.push({
        id: draft115.id,
        draftCode: draft115.draftCode,
        templateCode: template115.templateCode,
        templateName: template115.templateName,
        title: draft115.title,
        missingFieldsCount: draft115.missingFieldsFlags.length,
        filePath: draft115.docxStorageKey || '',
      });
    } catch (err: any) {
      result.success = false;
      result.errors.push(err.message || String(err));
    }

    return result;
  }
}
