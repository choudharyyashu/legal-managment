/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Safe Document Regeneration & Change Propagation Service (Phase 6)
 * Reference: Utah Rules of Professional Conduct (Utah RPC 1.1, 1.3, 1.4, 1.10)
 */

import { prisma } from '../../../config/database.js';
import { AppError } from '../../../errors/AppError.js';
import { createAuditLog } from '../../../utils/auditLogger.js';
import { MatterService } from '../../matters/matter.service.js';
import { AuthenticatedUser } from '../../auth/auth.types.js';
import { DraftService } from '../drafts/draft.service.js';
import { DraftDataResolver } from '../drafts/draft.data-resolver.js';
import {
  DetectChangesInput,
  DocumentDiffComparison,
  FieldDiffItem,
  CandidateGenerationResult,
} from './regeneration.types.js';

export class RegenerationService {
  /**
   * Identifies all active document drafts affected when source data changes.
   * Unrelated field changes do not mark documents stale.
   */
  static async detectSourceChanges(
    input: DetectChangesInput,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<{ affectedDraftsCount: number; affectedDrafts: any[] }> {
    // 1. Authorize matter access (Ethical Wall enforcement)
    const matter = await MatterService.getMatterByIdOrNumber(input.matterId, currentUser);

    const fullMatter = await prisma.matter.findFirst({
      where: { OR: [{ id: input.matterId }, { matterNumber: input.matterId }] },
    });

    if (!fullMatter) {
      throw AppError.notFound(`Matter '${input.matterId}' not found.`, 'MATTER_NOT_FOUND');
    }

    // 2. Find active drafts for this matter
    const activeDrafts = await prisma.documentDraft.findMany({
      where: {
        matterId: fullMatter.id,
        status: { in: ['Draft', 'Under Review', 'Approved'] },
      },
      include: {
        template: {
          include: {
            versions: {
              where: { isCurrent: true },
              include: { fieldMappings: true },
            },
          },
        },
      },
    });

    const affectedDrafts: any[] = [];
    const changedFieldKeys = Object.keys(input.changedFields).map((k) => k.toLowerCase());

    for (const draft of activeDrafts) {
      const activeVersion = draft.template?.versions?.[0];
      const mappings = activeVersion?.fieldMappings || [];

      // Check if any mapping depends on the changed entity or fields
      const isAffected = mappings.some((m) => {
        const matchesEntity = m.sourceEntity.toLowerCase() === input.changedEntity.toLowerCase();
        const matchesField = changedFieldKeys.some(
          (k) => k === m.sourceField.toLowerCase() || m.placeholderTag.toLowerCase().includes(k)
        );
        return matchesEntity || matchesField;
      });

      if (isAffected) {
        const updated = await prisma.documentDraft.update({
          where: { id: draft.id },
          data: { isStale: true },
        });

        affectedDrafts.push({
          id: updated.id,
          draftCode: updated.draftCode,
          title: updated.title,
          hasManualEdits: updated.hasManualEdits,
          templateCode: draft.template.templateCode,
          changedEntity: input.changedEntity,
        });

        await createAuditLog({
          userId: currentUser.id,
          action: 'FLAG_OUTDATED',
          resourceType: 'document_drafts',
          resourceId: draft.id,
          details: {
            reason: 'SOURCE_DATA_CHANGED',
            changedEntity: input.changedEntity,
            changeSummary: input.changeSummary || `Source entity '${input.changedEntity}' was updated.`,
          },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        });
      }
    }

    return {
      affectedDraftsCount: affectedDrafts.length,
      affectedDrafts,
    };
  }

  /**
   * Retrieves all documents flagged as outdated / stale for review.
   */
  static async getOutdatedDrafts(
    matterId?: string,
    currentUser?: AuthenticatedUser
  ): Promise<any[]> {
    if (matterId && currentUser) {
      await MatterService.getMatterByIdOrNumber(matterId, currentUser);
    }

    const where: any = { isStale: true };
    if (matterId) where.matterId = matterId;

    const drafts = await prisma.documentDraft.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        matter: { select: { id: true, matterNumber: true, title: true } },
        client: { select: { id: true, clientNumber: true, name: true } },
        template: { select: { id: true, templateCode: true, templateName: true } },
      },
    });

    return drafts.map((d) => ({
      id: d.id,
      draftCode: d.draftCode,
      matterId: d.matterId,
      matterNumber: d.matter?.matterNumber || null,
      matterTitle: d.matter?.title || null,
      clientName: d.client?.name || null,
      templateCode: d.template?.templateCode || null,
      templateName: d.template?.templateName || null,
      title: d.title,
      status: d.status,
      hasManualEdits: d.hasManualEdits,
      isStale: d.isStale,
      updatedAt: d.updatedAt.toISOString(),
    }));
  }

  /**
   * Generates a candidate draft version without overwriting the previous version.
   */
  static async generateCandidateVersion(
    previousDraftId: string,
    customOverrides: Record<string, any> = {},
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<CandidateGenerationResult> {
    const previousDraft = await prisma.documentDraft.findUnique({
      where: { id: previousDraftId },
      include: {
        matter: true,
        template: {
          include: {
            versions: {
              where: { isCurrent: true },
              include: { fieldMappings: true },
            },
          },
        },
      },
    });

    if (!previousDraft) {
      throw AppError.notFound(`Draft '${previousDraftId}' not found.`, 'DRAFT_NOT_FOUND');
    }

    await MatterService.getMatterByIdOrNumber(previousDraft.matterId, currentUser);

    // Generate candidate draft version
    const candidateResponse = await DraftService.generateDraft(
      {
        matterId: previousDraft.matterId,
        templateId: previousDraft.templateId,
        templateVersionId: previousDraft.templateVersionId,
        title: `[Candidate] ${previousDraft.title.replace(/^\[Candidate\]\s*/, '')}`,
        allowIncomplete: true,
        customOverrides,
      },
      currentUser,
      context
    );

    // Mark candidate draft with status 'Candidate'
    await prisma.documentDraft.update({
      where: { id: candidateResponse.id },
      data: { status: 'Candidate' },
    });

    // Run version comparison
    const comparison = await this.compareVersions(previousDraft.id, candidateResponse.id, currentUser);

    await createAuditLog({
      userId: currentUser.id,
      action: 'GENERATE_CANDIDATE',
      resourceType: 'document_drafts',
      resourceId: candidateResponse.id,
      details: {
        previousDraftId: previousDraft.id,
        previousDraftCode: previousDraft.draftCode,
        hasManualEdits: previousDraft.hasManualEdits,
        changedFieldsCount: comparison.changedFieldsCount,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      previousDraftId: previousDraft.id,
      previousDraftCode: previousDraft.draftCode,
      candidateDraftId: candidateResponse.id,
      candidateDraftCode: candidateResponse.draftCode,
      comparison,
    };
  }

  /**
   * Compares the field data between the previous draft and the newly generated candidate version.
   */
  static async compareVersions(
    previousDraftId: string,
    candidateDraftId: string,
    currentUser: AuthenticatedUser
  ): Promise<DocumentDiffComparison> {
    const [previousDraft, candidateDraft] = await Promise.all([
      prisma.documentDraft.findUnique({
        where: { id: previousDraftId },
        include: {
          matter: { include: { client: true, responsibleAttorney: true, practiceArea: true } },
          template: {
            include: {
              versions: {
                where: { isCurrent: true },
                include: { fieldMappings: true },
              },
            },
          },
        },
      }),
      prisma.documentDraft.findUnique({
        where: { id: candidateDraftId },
        include: {
          matter: { include: { client: true, responsibleAttorney: true, practiceArea: true } },
          template: {
            include: {
              versions: {
                where: { isCurrent: true },
                include: { fieldMappings: true },
              },
            },
          },
        },
      }),
    ]);

    if (!previousDraft) throw AppError.notFound(`Previous draft '${previousDraftId}' not found.`);
    if (!candidateDraft) throw AppError.notFound(`Candidate draft '${candidateDraftId}' not found.`);

    await MatterService.getMatterByIdOrNumber(previousDraft.matterId, currentUser);

    const version = candidateDraft.template?.versions?.[0] || previousDraft.template?.versions?.[0];
    const mappings = version?.fieldMappings || [];

    const prevResolved = DraftDataResolver.resolve(previousDraft.matter, version);
    const candResolved = DraftDataResolver.resolve(candidateDraft.matter, version);

    const diffItems: FieldDiffItem[] = [];

    for (const m of mappings) {
      const tag = m.placeholderTag.replace(/^\{\{|\}\}$/g, '');
      const prevVal = prevResolved.resolvedData[tag] ?? null;
      const candVal = candResolved.resolvedData[tag] ?? null;

      let changeType: FieldDiffItem['changeType'] = 'UNCHANGED';
      if (prevVal === null && candVal !== null) {
        changeType = 'ADDED';
      } else if (prevVal !== null && candVal === null) {
        changeType = 'REMOVED';
      } else if (String(prevVal) !== String(candVal)) {
        changeType = 'MODIFIED';
      }

      if (changeType !== 'UNCHANGED') {
        diffItems.push({
          field: m.placeholderTag,
          sourceEntity: m.sourceEntity,
          previousValue: prevVal,
          currentValue: candVal,
          changeType,
        });
      }
    }

    let recommendation: DocumentDiffComparison['recommendation'] = 'SAFE_TO_ACCEPT';
    let manualEditsWarning: string | undefined;

    if (previousDraft.hasManualEdits) {
      recommendation = 'REVIEW_MANUAL_EDITS';
      manualEditsWarning =
        'ATTENTION: This document contains lawyer-authored manual edits. Accepting the candidate version will supersede previous text. Please review differences carefully before accepting.';
    } else if (diffItems.length === 0) {
      recommendation = 'NO_CHANGES_DETECTED';
    }

    return {
      previousDraftId: previousDraft.id,
      previousDraftCode: previousDraft.draftCode,
      candidateDraftId: candidateDraft.id,
      candidateDraftCode: candidateDraft.draftCode,
      matterId: previousDraft.matterId,
      matterNumber: previousDraft.matter?.matterNumber || '',
      templateCode: previousDraft.template.templateCode,
      hasManualEdits: previousDraft.hasManualEdits,
      manualEditsWarning,
      sourceChangesDetected: diffItems.length > 0,
      changedFieldsCount: diffItems.length,
      changedFields: diffItems,
      recommendation,
    };
  }

  /**
   * Accepts candidate version: marks previous draft as 'Superseded' and candidate as 'Draft'.
   * Never overwrites or deletes previous file binaries.
   */
  static async acceptCandidateVersion(
    previousDraftId: string,
    candidateDraftId: string,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<any> {
    const previous = await prisma.documentDraft.findUnique({ where: { id: previousDraftId } });
    const candidate = await prisma.documentDraft.findUnique({ where: { id: candidateDraftId } });

    if (!previous || !candidate) {
      throw AppError.notFound('Previous or candidate draft record not found.');
    }

    await MatterService.getMatterByIdOrNumber(previous.matterId, currentUser);

    // 1. Mark previous draft as Superseded
    const updatedPrevious = await prisma.documentDraft.update({
      where: { id: previous.id },
      data: {
        status: 'Superseded',
        isStale: false,
      },
    });

    // 2. Mark candidate draft as active Draft
    const cleanTitle = candidate.title.replace(/^\[Candidate\]\s*/, '');
    const updatedCandidate = await prisma.documentDraft.update({
      where: { id: candidate.id },
      data: {
        status: 'Draft',
        title: cleanTitle,
        isStale: false,
      },
    });

    // 3. Immutable audit log
    await createAuditLog({
      userId: currentUser.id,
      action: 'REGENERATE_ACCEPTED',
      resourceType: 'document_drafts',
      resourceId: candidate.id,
      details: {
        supersededDraftId: previous.id,
        supersededDraftCode: previous.draftCode,
        acceptedDraftId: candidate.id,
        acceptedDraftCode: candidate.draftCode,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      success: true,
      supersededDraft: updatedPrevious,
      acceptedDraft: updatedCandidate,
    };
  }

  /**
   * Rejects candidate version: marks candidate as 'Rejected' and clears isStale on previous draft.
   */
  static async rejectCandidateVersion(
    previousDraftId: string,
    candidateDraftId: string,
    rejectionReason: string,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<any> {
    const previous = await prisma.documentDraft.findUnique({ where: { id: previousDraftId } });
    const candidate = await prisma.documentDraft.findUnique({ where: { id: candidateDraftId } });

    if (!previous || !candidate) {
      throw AppError.notFound('Previous or candidate draft record not found.');
    }

    await MatterService.getMatterByIdOrNumber(previous.matterId, currentUser);

    // 1. Mark candidate as Rejected
    const updatedCandidate = await prisma.documentDraft.update({
      where: { id: candidate.id },
      data: { status: 'Rejected' },
    });

    // 2. Clear isStale on previous draft (retaining lawyer's preferred version)
    const updatedPrevious = await prisma.documentDraft.update({
      where: { id: previous.id },
      data: { isStale: false },
    });

    // 3. Immutable audit log
    await createAuditLog({
      userId: currentUser.id,
      action: 'REGENERATE_REJECTED',
      resourceType: 'document_drafts',
      resourceId: candidate.id,
      details: {
        previousDraftId: previous.id,
        previousDraftCode: previous.draftCode,
        rejectedDraftId: candidate.id,
        rejectedDraftCode: candidate.draftCode,
        rejectionReason: rejectionReason || 'User retained previous version with manual edits.',
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      success: true,
      retainedDraft: updatedPrevious,
      rejectedDraft: updatedCandidate,
    };
  }

  /**
   * Sets or updates manual edit flag on a draft.
   */
  static async markManualEdits(
    draftId: string,
    hasManualEdits: boolean,
    currentUser: AuthenticatedUser,
    context: { ipAddress?: string; userAgent?: string }
  ): Promise<any> {
    const draft = await prisma.documentDraft.findUnique({ where: { id: draftId } });
    if (!draft) throw AppError.notFound(`Draft '${draftId}' not found.`);

    await MatterService.getMatterByIdOrNumber(draft.matterId, currentUser);

    const updated = await prisma.documentDraft.update({
      where: { id: draft.id },
      data: { hasManualEdits },
    });

    await createAuditLog({
      userId: currentUser.id,
      action: 'UPDATE_MANUAL_EDITS_FLAG',
      resourceType: 'document_drafts',
      resourceId: draft.id,
      details: { hasManualEdits },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return updated;
  }
}

