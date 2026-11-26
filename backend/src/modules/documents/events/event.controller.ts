/**
 * HEUGLY & BLUDWORTH Legal Practice Management SaaS
 * Event-Driven Auto Draft Controller (Phase 4)
 */

import { Request, Response, NextFunction } from 'express';
import { DOCUMENT_EVENT, DocumentEventType } from './event.types.js';
import { AutoDraftService } from './auto-draft.service.js';
import { AutomationCatalogService } from '../catalog/automation-catalog.service.js';
import { AppError } from '../../../errors/AppError.js';

export class DocumentEventController {
  /**
   * Returns supported domain events and their automatic document generation triggers
   * (4 core PI events + full 300-document automation catalog summary).
   */
  static getEventCatalog(req: Request, res: Response): void {
    const catalogSummary = AutomationCatalogService.getSummary();
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
        ],
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

        default: {
          // Check if event matches any of the 300-document catalog triggers or catalog IDs
          const catalog = AutomationCatalogService.loadCatalog();
          const evLower = String(event).toLowerCase().trim();
          const matchingItems = catalog.items.filter(
            (i) =>
              i.trigger.toLowerCase() === evLower ||
              i.catalogId.toLowerCase() === evLower ||
              i.templateCode.toLowerCase() === evLower
          );

          if (matchingItems.length === 0) {
            throw AppError.badRequest(`Unknown document trigger event: '${event}'`);
          }

          const draftsCreated: any[] = [];
          const skipped: any[] = [];
          const errors: string[] = [];

          for (const item of matchingItems.slice(0, 10)) {
            try {
              const triggered = await AutomationCatalogService.triggerAutomation(
                item.catalogId,
                matterId,
                user,
                payload?.customOverrides || payload || {},
                context
              );
              if (triggered.isDuplicate) {
                skipped.push({
                  templateCode: item.templateCode,
                  reason: `Draft '${triggered.draft.draftCode}' already exists for ${item.catalogId}.`,
                });
              } else {
                draftsCreated.push({
                  id: triggered.draft.id,
                  draftCode: triggered.draft.draftCode,
                  templateCode: item.templateCode,
                  templateName: item.title,
                  title: triggered.draft.title,
                  missingFieldsCount: triggered.draft.missingFieldsFlags?.length || 0,
                  filePath: triggered.draft.docxStorageKey || '',
                });
              }
            } catch (e: any) {
              errors.push(`${item.catalogId}: ${e?.message || 'Trigger failed'}`);
            }
          }

          result = {
            success: errors.length === 0,
            event: event as DocumentEventType,
            matterId,
            draftsCreated,
            skipped,
            errors,
          };
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

