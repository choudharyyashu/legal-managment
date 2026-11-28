/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Event-Driven Auto Draft Controller (Phase 4)
 */

import { Request, Response, NextFunction } from 'express';
import { DOCUMENT_EVENT } from './event.types.js';
import { AutoDraftService } from './auto-draft.service.js';
import { AutomationCatalogService } from '../catalog/automation-catalog.service.js';
import { CatalogEventRegistry } from './catalog-event-registry.js';
import { AppError } from '../../../errors/AppError.js';

export class DocumentEventController {
  /**
   * Returns supported domain events and their automatic document generation triggers
   * (specialized domain events + all 300 catalog automation event mappings).
   */
  static getEventCatalog(req: Request, res: Response): void {
    const catalogSummary = AutomationCatalogService.getSummary();
    const catalogDefinitions = CatalogEventRegistry.getAllCatalogEventDefinitions();

    res.json({
      success: true,
      data: {
        events: [
          {
            event: DOCUMENT_EVENT.PI_ACCIDENT_SAVED,
            description: 'Triggered when a Personal Injury accident and liability investigation is saved.',
            targetDocumentCode: '096',
            targetDocumentTitle: 'Liability Insurer Letter of Representation',
            idempotencyScope: 'One per PI matter',
          },
          {
            event: DOCUMENT_EVENT.PI_PROVIDER_ADDED,
            description: 'Triggered when a treating medical provider is linked to a Personal Injury case.',
            targetDocumentCode: '113 & 112',
            targetDocumentTitle: 'Medical Records Request Letter (113) & Medical Authorization Packet (112)',
            idempotencyScope: 'One per treating provider',
          },
          {
            event: DOCUMENT_EVENT.PI_MISSING_RECORDS,
            description: 'Triggered when received medical records packet is marked incomplete or deficient.',
            targetDocumentCode: '116',
            targetDocumentTitle: 'Incomplete Medical Records Follow-up',
            idempotencyScope: 'One per provider per calendar day',
          },
          {
            event: DOCUMENT_EVENT.PI_DEMAND_READY,
            description: 'Triggered when a settlement demand package is completed and ready for adverse carrier transmission.',
            targetDocumentCode: '140',
            targetDocumentTitle: 'Personal Injury Settlement Demand Letter',
            idempotencyScope: 'One per demand package',
          },
          ...catalogDefinitions.map((def) => ({
            event: def.eventKey,
            trigger: def.trigger,
            handlerType: def.isSpecializedHandler ? 'specialized' : 'catalog-dispatcher',
            targetDocumentCode: def.items.map((i) => i.catalogId).join(', '),
            targetDocumentTitle: def.items.map((i) => i.title).join(', '),
            practiceAreas: [...new Set(def.items.map((i) => i.practiceArea))],
            idempotencyScope: 'One active draft per matter + catalog item',
          })),
        ],
        totalRegisteredEvents: catalogDefinitions.length,
        catalogSummary,
      },
    });
  }

  /**
   * Dispatches a domain event and synchronously executes auto-draft evaluation.
   */
  static async triggerEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { event, matterId, payload } = req.body;

      if (!event || !matterId) {
        throw AppError.badRequest('Both "event" and "matterId" are required in the trigger payload.');
      }

      const user = (req as any).user;
      const context = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      let result;

      switch (event) {
        case DOCUMENT_EVENT.PI_ACCIDENT_SAVED:
          result = await AutoDraftService.handleAccidentSaved(
            { matterId, ...payload },
            user,
            context
          );
          break;

        case DOCUMENT_EVENT.PI_PROVIDER_ADDED:
          result = await AutoDraftService.handleProviderAdded(
            { matterId, ...payload },
            user,
            context
          );
          break;

        case DOCUMENT_EVENT.PI_MISSING_RECORDS:
          result = await AutoDraftService.handleMissingRecords(
            { matterId, ...payload },
            user,
            context
          );
          break;

        case DOCUMENT_EVENT.PI_DEMAND_READY:
          result = await AutoDraftService.handleDemandReady(
            { matterId, ...payload },
            user,
            context
          );
          break;

        case DOCUMENT_EVENT.PI_LIEN_PAYOFF_RECORDED:
          result = await AutoDraftService.handleLienPayoffRecorded(
            { matterId, ...payload },
            user,
            context
          );
          break;

        case DOCUMENT_EVENT.INTAKE_CONSULTATION_BOOKED:
          result = await AutoDraftService.handleConsultationBooked(
            { matterId, ...payload },
            user,
            context
          );
          break;

        case DOCUMENT_EVENT.INTAKE_CONSULTATION_RESCHEDULED:
          result = await AutoDraftService.handleConsultationRescheduled(
            { matterId, ...payload },
            user,
            context
          );
          break;

        case DOCUMENT_EVENT.INTAKE_PROSPECT_SAVED:
          result = await AutoDraftService.handleProspectSaved(
            { matterId, ...payload },
            user,
            context
          );
          break;

        case DOCUMENT_EVENT.INTAKE_CONFLICT_SEARCH_COMPLETED:
          result = await AutoDraftService.handleConflictSearchCompleted(
            { matterId, ...payload },
            user,
            context
          );
          break;

        case DOCUMENT_EVENT.MATTER_CREATED_FROM_INTAKE:
          result = await AutoDraftService.handleMatterCreatedFromIntake(
            { matterId, ...payload },
            user,
            context
          );
          break;

        case DOCUMENT_EVENT.EVICTION_CLOSURE_REVIEWED:
          result = await AutoDraftService.handleEvictionClosureReviewed(
            { matterId, ...payload },
            user,
            context
          );
          break;

        default: {
          result = await AutoDraftService.handleCatalogEvent(
            event,
            { matterId, ...(payload || {}) },
            user,
            context
          );
          if (!result.success && result.errors.some((e) => e.includes('No catalog automation matched'))) {
            throw AppError.badRequest(`Unknown document trigger event: '${event}'`);
          }
          break;
        }
      }

      res.status(200).json({
        success: result.success,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

